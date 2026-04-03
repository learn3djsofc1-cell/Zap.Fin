import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';
import { ethers } from 'ethers';
import crypto from 'crypto';
import {
  populateShield,
  populateShieldBaseToken,
  generateTransferProof,
  generateUnshieldProof,
  populateProvedTransfer,
  populateProvedUnshield,
  gasEstimateForShield,
  gasEstimateForShieldBaseToken,
  gasEstimateForUnprovenTransfer,
  gasEstimateForUnprovenUnshield,
  getRailgunWalletAddressData,
  getShieldPrivateKeySignatureMessage,
  getFallbackProviderForNetwork,
  refreshBalances,
  walletForID,
} from '@railgun-community/wallet';
import {
  NetworkName,
  NETWORK_CONFIG,
  TXIDVersion,
  EVMGasType,
} from '@railgun-community/shared-models';
import {
  SUPPORTED_NETWORKS,
  getNetworkById,
  getTokenAddress,
  isBaseToken,
  getWrappedToken,
  getAvailableNetworks,
  type NetworkConfig,
} from '../railgun/provider.js';
import {
  loadUserWallet,
  getUserWalletInfo,
  getUserSigningWallet,
  getShieldPrivateKey,
  createUserWallet,
  getRailgunEncryptionKey,
} from '../railgun/wallet.js';
import { isEngineReady } from '../railgun/engine.js';

const router = Router();
router.use(authMiddleware);

type OperationType = 'shield' | 'transfer' | 'unshield';
const VALID_OPERATION_TYPES: OperationType[] = ['shield', 'transfer', 'unshield'];
const VALID_STATUSES = ['pending', 'proving', 'confirmed', 'complete', 'failed'];

function isValidEvmAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

function isValidShieldedAddress(address: string): boolean {
  return /^0zk[0-9a-fA-F]{120,}$/.test(address);
}

function formatNum(val: string | number): string {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '0';
  if (n % 1 === 0) return n.toFixed(0);
  return n.toString().replace(/\.?0+$/, '');
}

interface ShieldOperationRow {
  id: string;
  user_id: number;
  operation_type: string;
  network: string;
  token: string;
  amount: string | number;
  source_address: string | null;
  recipient_address: string | null;
  railgun_contract: string;
  status: string;
  zk_proof_hash: string | null;
  tx_hash: string | null;
  created_at: Date | string;
  completed_at: Date | string | null;
}

function formatOperation(row: ShieldOperationRow) {
  return {
    id: row.id,
    operationType: row.operation_type,
    network: row.network,
    token: row.token,
    amount: formatNum(row.amount),
    sourceAddress: row.source_address || undefined,
    recipientAddress: row.recipient_address || undefined,
    shieldContract: row.railgun_contract,
    status: row.status,
    zkProofHash: row.zk_proof_hash || undefined,
    txHash: row.tx_hash || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    completedAt: row.completed_at ? (row.completed_at instanceof Date ? row.completed_at.toISOString() : row.completed_at) : undefined,
  };
}

router.get('/networks', async (_req: AuthRequest, res: Response): Promise<void> => {
  const available = getAvailableNetworks();
  const networks = available.map(n => ({
    id: n.id,
    name: n.name,
    chainId: n.chainId,
    relayAdapt: n.relayAdapt,
    tokens: n.tokens,
  }));
  res.json({ networks });
});

router.get('/wallet', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    let walletInfo = await getUserWalletInfo(userId);

    if (!walletInfo && isEngineReady()) {
      walletInfo = await createUserWallet(userId);
    }

    if (!walletInfo) {
      res.json({ wallet: null, engineReady: isEngineReady() });
      return;
    }

    res.json({
      wallet: {
        railgunAddress: walletInfo.railgunAddress,
        evmAddress: walletInfo.evmAddress,
        createdAt: walletInfo.createdAt,
      },
      engineReady: isEngineReady(),
    });
  } catch (err) {
    console.error('Get wallet error:', err);
    res.status(500).json({ error: 'Failed to get wallet info' });
  }
});

router.post('/wallet/create', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isEngineReady()) {
      res.status(503).json({ error: 'Railgun engine not ready. Check RPC configuration.' });
      return;
    }

    const userId = req.userId!;
    const walletInfo = await createUserWallet(userId);

    res.status(201).json({
      wallet: {
        railgunAddress: walletInfo.railgunAddress,
        evmAddress: walletInfo.evmAddress,
        createdAt: walletInfo.createdAt,
      },
    });
  } catch (err) {
    console.error('Create wallet error:', err);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

router.post('/shield', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isEngineReady()) {
      res.status(503).json({ error: 'Railgun engine not ready' });
      return;
    }

    const userId = req.userId!;
    const { network, token, amount, sourceAddress } = req.body;

    if (!network || !token || !amount) {
      res.status(400).json({ error: 'Missing required fields: network, token, amount' });
      return;
    }

    const networkConfig = getNetworkById(network);
    if (!networkConfig) {
      res.status(400).json({ error: `Unsupported network: ${network}` });
      return;
    }

    const upperToken = token.toUpperCase();
    if (!networkConfig.tokens.includes(upperToken)) {
      res.status(400).json({ error: `Token ${upperToken} is not supported on ${networkConfig.name}` });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    if (sourceAddress && !isValidEvmAddress(sourceAddress.trim())) {
      res.status(400).json({ error: 'sourceAddress must be a valid EVM address' });
      return;
    }

    const walletInfo = await loadUserWallet(userId);
    if (!walletInfo) {
      res.status(400).json({ error: 'No wallet found. Create a wallet first.' });
      return;
    }

    const signingWallet = await getUserSigningWallet(userId);
    if (!signingWallet) {
      res.status(500).json({ error: 'Failed to load signing wallet' });
      return;
    }

    const fromAddress = sourceAddress?.trim() || walletInfo.evmAddress;
    const txidVersion = TXIDVersion.V2_PoseidonMerkle;
    const amountWei = ethers.parseUnits(amount.toString(), getTokenDecimals(upperToken));

    const opResult = await pool.query(
      `INSERT INTO railgun_operations (user_id, operation_type, network, token, amount, source_address, railgun_contract, status, zk_proof_hash)
       VALUES ($1, 'shield', $2, $3, $4, $5, $6, 'pending', NULL)
       RETURNING *`,
      [userId, network, upperToken, parsedAmount, fromAddress, networkConfig.relayAdapt]
    );
    const operationId = opResult.rows[0].id;

    processShieldAsync(
      operationId,
      userId,
      networkConfig,
      upperToken,
      amountWei,
      fromAddress,
      walletInfo.railgunAddress,
      signingWallet,
      txidVersion,
    ).catch(err => console.error(`[Railgun] Async shield failed for op ${operationId}:`, err));

    res.status(201).json({ operation: formatOperation(opResult.rows[0]) });
  } catch (err) {
    console.error('Shield operation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function processShieldAsync(
  operationId: string,
  userId: number,
  networkConfig: NetworkConfig,
  token: string,
  amountWei: bigint,
  fromAddress: string,
  railgunAddress: string,
  signingWallet: ethers.Wallet,
  txidVersion: TXIDVersion,
): Promise<void> {
  try {
    await pool.query(
      `UPDATE railgun_operations SET status = 'proving' WHERE id = $1`,
      [operationId]
    );

    const shieldPrivateKey = await getShieldPrivateKey(userId);
    if (!shieldPrivateKey) throw new Error('Failed to get shield private key');

    const provider = getFallbackProviderForNetwork(networkConfig.networkName);
    if (!provider) throw new Error(`No provider for ${networkConfig.name}`);

    const connectedWallet = signingWallet.connect(provider);

    let transaction: ethers.TransactionRequest;

    if (isBaseToken(token)) {
      const wrappedTokenSymbol = getWrappedToken(networkConfig.id);
      if (!wrappedTokenSymbol) throw new Error('No wrapped token for base token');
      const wrappedAddress = getTokenAddress(networkConfig.id, wrappedTokenSymbol);
      if (!wrappedAddress) throw new Error('No wrapped token address');

      const wrappedAmount = {
        tokenAddress: wrappedAddress.toLowerCase(),
        amount: amountWei,
      };

      const shieldResult = await populateShieldBaseToken(
        txidVersion,
        networkConfig.networkName,
        railgunAddress,
        shieldPrivateKey,
        wrappedAmount,
        {
          evmGasType: EVMGasType.Type2,
          maxFeePerGas: ethers.parseUnits('50', 'gwei'),
          maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
        },
      );
      transaction = shieldResult.transaction;
    } else {
      const tokenAddress = getTokenAddress(networkConfig.id, token);
      if (!tokenAddress) throw new Error(`Token address not found for ${token}`);

      const erc20AmountRecipients = [{
        tokenAddress: tokenAddress.toLowerCase(),
        amount: amountWei,
        recipientAddress: railgunAddress,
      }];

      const shieldResult = await populateShield(
        txidVersion,
        networkConfig.networkName,
        shieldPrivateKey,
        erc20AmountRecipients,
        [],
        {
          evmGasType: EVMGasType.Type2,
          maxFeePerGas: ethers.parseUnits('50', 'gwei'),
          maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
        },
      );
      transaction = shieldResult.transaction;
    }

    const proofHash = crypto.createHash('sha256')
      .update(typeof transaction.data === 'string' ? transaction.data : `${operationId}:proved`)
      .digest('hex');

    const txResponse = await connectedWallet.sendTransaction(transaction);
    const txHash = txResponse.hash;

    await pool.query(
      `UPDATE railgun_operations SET status = 'confirmed', tx_hash = $2, zk_proof_hash = $3 WHERE id = $1`,
      [operationId, txHash, proofHash]
    );

    const receipt = await txResponse.wait();

    if (receipt && receipt.status === 1) {
      await pool.query(
        `UPDATE railgun_operations SET status = 'complete', completed_at = NOW() WHERE id = $1`,
        [operationId]
      );
      console.log(`[Railgun] Shield operation ${operationId} completed: ${txHash}`);
    } else {
      await pool.query(
        `UPDATE railgun_operations SET status = 'failed' WHERE id = $1`,
        [operationId]
      );
      console.error(`[Railgun] Shield operation ${operationId} failed on-chain`);
    }
  } catch (err) {
    console.error(`[Railgun] Shield processing error for ${operationId}:`, err);
    await pool.query(
      `UPDATE railgun_operations SET status = 'failed' WHERE id = $1`,
      [operationId]
    ).catch(() => {});
  }
}

router.post('/transfer', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isEngineReady()) {
      res.status(503).json({ error: 'Railgun engine not ready' });
      return;
    }

    const userId = req.userId!;
    const { network, token, amount, recipientAddress } = req.body;

    if (!network || !token || !amount) {
      res.status(400).json({ error: 'Missing required fields: network, token, amount' });
      return;
    }

    if (!recipientAddress || typeof recipientAddress !== 'string') {
      res.status(400).json({ error: 'recipientAddress is required for private transfers' });
      return;
    }

    if (!isValidShieldedAddress(recipientAddress.trim())) {
      res.status(400).json({ error: 'recipientAddress must be a valid shielded 0zk address' });
      return;
    }

    const networkConfig = getNetworkById(network);
    if (!networkConfig) {
      res.status(400).json({ error: `Unsupported network: ${network}` });
      return;
    }

    const upperToken = token.toUpperCase();
    if (!networkConfig.tokens.includes(upperToken)) {
      res.status(400).json({ error: `Token ${upperToken} is not supported on ${networkConfig.name}` });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    const walletInfo = await loadUserWallet(userId);
    if (!walletInfo) {
      res.status(400).json({ error: 'No wallet found. Create a wallet first.' });
      return;
    }

    const signingWallet = await getUserSigningWallet(userId);
    if (!signingWallet) {
      res.status(500).json({ error: 'Failed to load signing wallet' });
      return;
    }

    const txidVersion = TXIDVersion.V2_PoseidonMerkle;
    const amountWei = ethers.parseUnits(amount.toString(), getTokenDecimals(upperToken));

    const opResult = await pool.query(
      `INSERT INTO railgun_operations (user_id, operation_type, network, token, amount, recipient_address, railgun_contract, status, zk_proof_hash)
       VALUES ($1, 'transfer', $2, $3, $4, $5, $6, 'pending', NULL)
       RETURNING *`,
      [userId, network, upperToken, parsedAmount, recipientAddress.trim(), networkConfig.relayAdapt]
    );
    const operationId = opResult.rows[0].id;

    processTransferAsync(
      operationId,
      userId,
      walletInfo.railgunWalletId,
      networkConfig,
      upperToken,
      amountWei,
      recipientAddress.trim(),
      signingWallet,
      txidVersion,
    ).catch(err => console.error(`[Railgun] Async transfer failed for op ${operationId}:`, err));

    res.status(201).json({ operation: formatOperation(opResult.rows[0]) });
  } catch (err) {
    console.error('Transfer operation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function processTransferAsync(
  operationId: string,
  userId: number,
  railgunWalletId: string,
  networkConfig: NetworkConfig,
  token: string,
  amountWei: bigint,
  recipientAddress: string,
  signingWallet: ethers.Wallet,
  txidVersion: TXIDVersion,
): Promise<void> {
  try {
    await pool.query(
      `UPDATE railgun_operations SET status = 'proving' WHERE id = $1`,
      [operationId]
    );

    const encKey = getRailgunEncryptionKey();

    const tokenAddress = getTokenAddress(networkConfig.id, token);
    if (!tokenAddress) throw new Error(`Token address not found for ${token}`);

    const effectiveTokenAddress = isBaseToken(token)
      ? getTokenAddress(networkConfig.id, getWrappedToken(networkConfig.id)!)!
      : tokenAddress;

    const erc20AmountRecipients = [{
      tokenAddress: effectiveTokenAddress.toLowerCase(),
      amount: amountWei,
      recipientAddress: recipientAddress,
    }];

    await generateTransferProof(
      txidVersion,
      networkConfig.networkName,
      railgunWalletId,
      encKey,
      false,
      undefined,
      erc20AmountRecipients,
      [],
      undefined,
      true,
      BigInt(0),
      (progress: number) => {
        console.log(`[Railgun] Transfer proof progress for ${operationId}: ${Math.round(progress * 100)}%`);
      },
    );

    const provider = getFallbackProviderForNetwork(networkConfig.networkName);
    if (!provider) throw new Error(`No provider for ${networkConfig.name}`);

    const connectedWallet = signingWallet.connect(provider);

    const { transaction } = await populateProvedTransfer(
      txidVersion,
      networkConfig.networkName,
      railgunWalletId,
      false,
      undefined,
      erc20AmountRecipients,
      [],
      undefined,
      true,
      BigInt(0),
      {
        evmGasType: EVMGasType.Type2,
        maxFeePerGas: ethers.parseUnits('50', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
      },
    );

    const proofHash = crypto.createHash('sha256')
      .update(typeof transaction.data === 'string' ? transaction.data : `${operationId}:proved`)
      .digest('hex');

    const txResponse = await connectedWallet.sendTransaction(transaction);
    const txHash = txResponse.hash;

    await pool.query(
      `UPDATE railgun_operations SET status = 'confirmed', tx_hash = $2, zk_proof_hash = $3 WHERE id = $1`,
      [operationId, txHash, proofHash]
    );

    const receipt = await txResponse.wait();

    if (receipt && receipt.status === 1) {
      await pool.query(
        `UPDATE railgun_operations SET status = 'complete', completed_at = NOW() WHERE id = $1`,
        [operationId]
      );
      console.log(`[Railgun] Transfer operation ${operationId} completed: ${txHash}`);
    } else {
      await pool.query(
        `UPDATE railgun_operations SET status = 'failed' WHERE id = $1`,
        [operationId]
      );
    }
  } catch (err) {
    console.error(`[Railgun] Transfer processing error for ${operationId}:`, err);
    await pool.query(
      `UPDATE railgun_operations SET status = 'failed' WHERE id = $1`,
      [operationId]
    ).catch(() => {});
  }
}

router.post('/unshield', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isEngineReady()) {
      res.status(503).json({ error: 'Railgun engine not ready' });
      return;
    }

    const userId = req.userId!;
    const { network, token, amount, recipientAddress } = req.body;

    if (!network || !token || !amount) {
      res.status(400).json({ error: 'Missing required fields: network, token, amount' });
      return;
    }

    if (!recipientAddress || typeof recipientAddress !== 'string') {
      res.status(400).json({ error: 'recipientAddress is required for unshield operations' });
      return;
    }

    if (!isValidEvmAddress(recipientAddress.trim())) {
      res.status(400).json({ error: 'recipientAddress must be a valid EVM address' });
      return;
    }

    const networkConfig = getNetworkById(network);
    if (!networkConfig) {
      res.status(400).json({ error: `Unsupported network: ${network}` });
      return;
    }

    const upperToken = token.toUpperCase();
    if (!networkConfig.tokens.includes(upperToken)) {
      res.status(400).json({ error: `Token ${upperToken} is not supported on ${networkConfig.name}` });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    const walletInfo = await loadUserWallet(userId);
    if (!walletInfo) {
      res.status(400).json({ error: 'No wallet found. Create a wallet first.' });
      return;
    }

    const signingWallet = await getUserSigningWallet(userId);
    if (!signingWallet) {
      res.status(500).json({ error: 'Failed to load signing wallet' });
      return;
    }

    const txidVersion = TXIDVersion.V2_PoseidonMerkle;
    const amountWei = ethers.parseUnits(amount.toString(), getTokenDecimals(upperToken));

    const opResult = await pool.query(
      `INSERT INTO railgun_operations (user_id, operation_type, network, token, amount, recipient_address, railgun_contract, status, zk_proof_hash)
       VALUES ($1, 'unshield', $2, $3, $4, $5, $6, 'pending', NULL)
       RETURNING *`,
      [userId, network, upperToken, parsedAmount, recipientAddress.trim(), networkConfig.relayAdapt]
    );
    const operationId = opResult.rows[0].id;

    processUnshieldAsync(
      operationId,
      userId,
      walletInfo.railgunWalletId,
      networkConfig,
      upperToken,
      amountWei,
      recipientAddress.trim(),
      signingWallet,
      txidVersion,
    ).catch(err => console.error(`[Railgun] Async unshield failed for op ${operationId}:`, err));

    res.status(201).json({ operation: formatOperation(opResult.rows[0]) });
  } catch (err) {
    console.error('Unshield operation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function processUnshieldAsync(
  operationId: string,
  userId: number,
  railgunWalletId: string,
  networkConfig: NetworkConfig,
  token: string,
  amountWei: bigint,
  recipientAddress: string,
  signingWallet: ethers.Wallet,
  txidVersion: TXIDVersion,
): Promise<void> {
  try {
    await pool.query(
      `UPDATE railgun_operations SET status = 'proving' WHERE id = $1`,
      [operationId]
    );

    const encKey = getRailgunEncryptionKey();

    const tokenAddress = getTokenAddress(networkConfig.id, token);
    if (!tokenAddress) throw new Error(`Token address not found for ${token}`);

    const effectiveTokenAddress = isBaseToken(token)
      ? getTokenAddress(networkConfig.id, getWrappedToken(networkConfig.id)!)!
      : tokenAddress;

    const erc20AmountRecipients = [{
      tokenAddress: effectiveTokenAddress.toLowerCase(),
      amount: amountWei,
      recipientAddress: recipientAddress,
    }];

    await generateUnshieldProof(
      txidVersion,
      networkConfig.networkName,
      railgunWalletId,
      encKey,
      erc20AmountRecipients,
      [],
      undefined,
      true,
      BigInt(0),
      (progress: number) => {
        console.log(`[Railgun] Unshield proof progress for ${operationId}: ${Math.round(progress * 100)}%`);
      },
    );

    const provider = getFallbackProviderForNetwork(networkConfig.networkName);
    if (!provider) throw new Error(`No provider for ${networkConfig.name}`);

    const connectedWallet = signingWallet.connect(provider);

    const { transaction } = await populateProvedUnshield(
      txidVersion,
      networkConfig.networkName,
      railgunWalletId,
      erc20AmountRecipients,
      [],
      undefined,
      true,
      BigInt(0),
      {
        evmGasType: EVMGasType.Type2,
        maxFeePerGas: ethers.parseUnits('50', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
      },
    );

    const proofHash = crypto.createHash('sha256')
      .update(typeof transaction.data === 'string' ? transaction.data : `${operationId}:proved`)
      .digest('hex');

    const txResponse = await connectedWallet.sendTransaction(transaction);
    const txHash = txResponse.hash;

    await pool.query(
      `UPDATE railgun_operations SET status = 'confirmed', tx_hash = $2, zk_proof_hash = $3 WHERE id = $1`,
      [operationId, txHash, proofHash]
    );

    const receipt = await txResponse.wait();

    if (receipt && receipt.status === 1) {
      await pool.query(
        `UPDATE railgun_operations SET status = 'complete', completed_at = NOW() WHERE id = $1`,
        [operationId]
      );
      console.log(`[Railgun] Unshield operation ${operationId} completed: ${txHash}`);
    } else {
      await pool.query(
        `UPDATE railgun_operations SET status = 'failed' WHERE id = $1`,
        [operationId]
      );
    }
  } catch (err) {
    console.error(`[Railgun] Unshield processing error for ${operationId}:`, err);
    await pool.query(
      `UPDATE railgun_operations SET status = 'failed' WHERE id = $1`,
      [operationId]
    ).catch(() => {});
  }
}

function getTokenDecimals(token: string): number {
  const decimalsMap: Record<string, number> = {
    ETH: 18, WETH: 18,
    MATIC: 18, WMATIC: 18,
    BNB: 18, WBNB: 18,
    USDC: 6,
    USDT: 6,
    DAI: 18,
    WBTC: 8,
    BUSD: 18,
  };
  return decimalsMap[token.toUpperCase()] || 18;
}

function resolveTokenSymbol(networkId: string, tokenHash: string): string {
  const networkConfig = getNetworkById(networkId);
  if (!networkConfig) return 'UNKNOWN';

  for (const tokenSymbol of networkConfig.tokens) {
    const addr = getTokenAddress(networkId, tokenSymbol);
    if (addr && addr.toLowerCase() === tokenHash.toLowerCase()) {
      return tokenSymbol;
    }
  }
  return tokenHash.substring(0, 8);
}

router.get('/operations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const opType = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    let query = 'SELECT * FROM railgun_operations WHERE user_id = $1';
    const params: (string | number)[] = [userId!];
    let paramIndex = 2;

    if (opType && VALID_OPERATION_TYPES.includes(opType as OperationType)) {
      query += ` AND operation_type = $${paramIndex}`;
      params.push(opType);
      paramIndex++;
    }

    if (status && VALID_STATUSES.includes(status)) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');

    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, paramIndex - 1)),
    ]);

    res.json({
      operations: result.rows.map(formatOperation),
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    console.error('Shield operations list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/balances', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const walletInfo = await getUserWalletInfo(userId);

    if (walletInfo && isEngineReady()) {
      try {
        const wallet = walletForID(walletInfo.railgunWalletId);
        const availableNetworks = getAvailableNetworks();
        const sdkBalances: Array<{ network: string; token: string; shieldedBalance: string }> = [];

        for (const net of availableNetworks) {
          const chain = NETWORK_CONFIG[net.networkName]?.chain;
          if (!chain) continue;

          try {
            await refreshBalances(chain, [walletInfo.railgunWalletId]);

            for (const tokenSymbol of net.tokens) {
              const tokenAddr = getTokenAddress(net.id, tokenSymbol);
              if (!tokenAddr) continue;

              const balance = await wallet.getBalanceERC20(
                TXIDVersion.V2_PoseidonMerkle,
                chain,
                tokenAddr.toLowerCase(),
                [],
              );

              if (balance && balance > 0n) {
                const decimals = getTokenDecimals(tokenSymbol);
                sdkBalances.push({
                  network: net.id,
                  token: tokenSymbol,
                  shieldedBalance: formatNum(ethers.formatUnits(balance.toString(), decimals)),
                });
              }
            }
          } catch {
            // Network scan failed, will fall through to DB balances for this network
          }
        }

        if (sdkBalances.length > 0) {
          res.json({ balances: sdkBalances });
          return;
        }
      } catch {
        // SDK balance retrieval failed, fall through to DB
      }
    }

    const result = await pool.query(
      `SELECT network, token,
        COALESCE(SUM(CASE WHEN operation_type = 'shield' AND status IN ('confirmed', 'complete') THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN operation_type = 'unshield' AND status IN ('confirmed', 'complete') THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN operation_type = 'transfer' AND status IN ('confirmed', 'complete') THEN amount ELSE 0 END), 0)
        AS shielded_balance
      FROM railgun_operations
      WHERE user_id = $1
      GROUP BY network, token
      HAVING
        COALESCE(SUM(CASE WHEN operation_type = 'shield' AND status IN ('confirmed', 'complete') THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN operation_type = 'unshield' AND status IN ('confirmed', 'complete') THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN operation_type = 'transfer' AND status IN ('confirmed', 'complete') THEN amount ELSE 0 END), 0) > 0`,
      [userId]
    );

    const balances = result.rows.map(row => ({
      network: row.network,
      token: row.token,
      shieldedBalance: formatNum(row.shielded_balance),
    }));

    res.json({ balances });
  } catch (err) {
    console.error('Shield balances error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status IN ('confirmed', 'complete')) AS total_operations,
        COUNT(*) FILTER (WHERE operation_type = 'shield' AND status IN ('confirmed', 'complete')) AS total_shielded,
        COUNT(*) FILTER (WHERE operation_type = 'transfer' AND status IN ('confirmed', 'complete')) AS total_private_transfers,
        COUNT(*) FILTER (WHERE operation_type = 'unshield' AND status IN ('confirmed', 'complete')) AS total_unshielded,
        COALESCE(SUM(CASE WHEN operation_type = 'shield' AND status IN ('confirmed', 'complete') THEN amount ELSE 0 END), 0) AS total_shielded_volume,
        COUNT(DISTINCT network) FILTER (WHERE status IN ('confirmed', 'complete')) AS networks_used
      FROM railgun_operations
      WHERE user_id = $1`,
      [userId]
    );

    const row = result.rows[0];
    const totalOps = parseInt(row.total_operations) || 0;
    const shielded = parseInt(row.total_shielded) || 0;
    const transfers = parseInt(row.total_private_transfers) || 0;
    const privacyScore = Math.min(100, Math.round(
      (shielded * 15) + (transfers * 25) + (totalOps * 5)
    ));

    res.json({
      stats: {
        totalOperations: totalOps,
        totalShielded: shielded,
        totalPrivateTransfers: transfers,
        totalUnshielded: parseInt(row.total_unshielded) || 0,
        totalShieldedVolume: formatNum(row.total_shielded_volume),
        networksUsed: parseInt(row.networks_used) || 0,
        privacyScore,
      },
    });
  } catch (err) {
    console.error('Shield stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const shieldRouter = router;
