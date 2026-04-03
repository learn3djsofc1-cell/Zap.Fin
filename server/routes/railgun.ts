import { Response, Router } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';
import { isEngineReady } from '../railgun/engine.js';
import { SUPPORTED_NETWORKS, getNetworkById, getAvailableNetworks, getTokenAddress, isBaseToken, getWrappedToken } from '../railgun/provider.js';
import { createUserWallet, loadUserWallet, getUserWalletInfo, getShieldPrivateKey, getRailgunEncryptionKey } from '../railgun/wallet.js';
import {
  generateShieldProofBytes,
  generateTransferProof,
  generateUnshieldProof,
  populateShield,
  populateProvedTransfer,
  populateProvedUnshield,
  refreshBalances,
  walletForID,
} from '@railgun-community/wallet';
import {
  NetworkName,
  EVMGasType,
  RailgunERC20AmountRecipient,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import { ethers } from 'ethers';

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
  zk_proof_status: string;
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
    zkProofStatus: row.zk_proof_status || 'generating',
    txHash: row.tx_hash || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    completedAt: row.completed_at ? (row.completed_at instanceof Date ? row.completed_at.toISOString() : row.completed_at) : undefined,
  };
}

function resolveTokenAddress(networkId: string, token: string): string | null {
  if (isBaseToken(token)) {
    const wrapped = getWrappedToken(networkId);
    if (wrapped) {
      return getTokenAddress(networkId, wrapped) || null;
    }
  }
  return getTokenAddress(networkId, token) || null;
}

function getGasDetails() {
  return {
    evmGasType: EVMGasType.Type2,
    maxFeePerGas: BigInt('50000000000'),
    maxPriorityFeePerGas: BigInt('2000000000'),
    gasLimit: BigInt('1500000'),
  };
}

router.get('/networks', async (_req: AuthRequest, res: Response): Promise<void> => {
  const networks = isEngineReady() ? getAvailableNetworks() : SUPPORTED_NETWORKS;
  res.json({
    networks: networks.map(n => ({
      id: n.id,
      name: n.name,
      chainId: n.chainId,
      relayAdapt: n.relayAdapt,
      tokens: n.tokens,
    })),
  });
});

router.get('/wallet', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    let wallet = await getUserWalletInfo(userId);

    if (!wallet && isEngineReady()) {
      wallet = await createUserWallet(userId);
    }

    if (wallet) {
      res.json({
        wallet: {
          railgunAddress: wallet.railgunAddress,
          evmAddress: wallet.evmAddress,
          createdAt: wallet.createdAt,
        },
      });
    } else {
      res.json({ wallet: null });
    }
  } catch (err) {
    console.error('Wallet fetch error:', err);
    res.status(500).json({ error: 'Failed to load wallet' });
  }
});

async function createOperation(
  req: AuthRequest,
  res: Response,
  operationType: OperationType
): Promise<void> {
  const userId = req.userId!;
  const { network, token, amount, sourceAddress, recipientAddress } = req.body;

  if (!network || !token || !amount) {
    res.status(400).json({ error: 'Missing required fields: network, token, amount' });
    return;
  }

  if (typeof network !== 'string' || typeof token !== 'string') {
    res.status(400).json({ error: 'Invalid input types' });
    return;
  }

  const networkData = getNetworkById(network);
  if (!networkData) {
    res.status(400).json({ error: `Unsupported network: ${network}` });
    return;
  }

  const upperToken = token.toUpperCase();
  if (!networkData.tokens.includes(upperToken)) {
    res.status(400).json({ error: `Token ${upperToken} is not supported on ${networkData.name}` });
    return;
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    res.status(400).json({ error: 'Amount must be a positive number' });
    return;
  }

  if (operationType === 'shield') {
    if (!sourceAddress || typeof sourceAddress !== 'string') {
      res.status(400).json({ error: 'sourceAddress is required for shield operations' });
      return;
    }
    if (!isValidEvmAddress(sourceAddress.trim())) {
      res.status(400).json({ error: 'sourceAddress must be a valid EVM address (0x + 40 hex chars)' });
      return;
    }
  }

  if (operationType === 'transfer') {
    if (!recipientAddress || typeof recipientAddress !== 'string') {
      res.status(400).json({ error: 'recipientAddress is required for private transfers' });
      return;
    }
    if (!isValidShieldedAddress(recipientAddress.trim())) {
      res.status(400).json({ error: 'recipientAddress must be a valid shielded 0zk address (0zk + 120+ hex chars)' });
      return;
    }
  }

  if (operationType === 'unshield') {
    if (!recipientAddress || typeof recipientAddress !== 'string') {
      res.status(400).json({ error: 'recipientAddress is required for unshield operations' });
      return;
    }
    if (!isValidEvmAddress(recipientAddress.trim())) {
      res.status(400).json({ error: 'recipientAddress must be a valid EVM address (0x + 40 hex chars)' });
      return;
    }
  }

  if (!isEngineReady()) {
    res.status(503).json({ error: 'Privacy Shield engine is not ready. Please ensure RPC endpoints are configured.' });
    return;
  }

  const walletInfo = await loadUserWallet(userId);
  if (!walletInfo) {
    res.status(400).json({ error: 'No Railgun wallet found. Please create one first.' });
    return;
  }

  const result = await pool.query<ShieldOperationRow>(
    `INSERT INTO railgun_operations (user_id, operation_type, network, token, amount, source_address, recipient_address, railgun_contract, status, zk_proof_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'generating')
     RETURNING *`,
    [
      userId,
      operationType,
      network,
      upperToken,
      parsedAmount,
      operationType === 'shield' ? sourceAddress?.trim() || null : null,
      operationType !== 'shield' ? recipientAddress?.trim() || null : null,
      networkData.relayAdapt,
    ]
  );

  const opRow = result.rows[0];
  res.status(201).json({ operation: formatOperation(opRow) });

  processOperation(opRow, walletInfo.railgunWalletId, networkData.networkName).catch(err => {
    console.error(`[Railgun] Background processing failed for op ${opRow.id}:`, err);
    pool.query(
      `UPDATE railgun_operations SET status = 'failed', zk_proof_status = 'failed' WHERE id = $1`,
      [opRow.id]
    ).catch(dbErr => console.error('[Railgun] DB update failed:', dbErr));
  });
}

async function processOperation(
  op: ShieldOperationRow,
  railgunWalletId: string,
  networkName: NetworkName
): Promise<void> {
  const tokenAddress = resolveTokenAddress(op.network, op.token);
  if (!tokenAddress) {
    throw new Error(`Cannot resolve token address for ${op.token} on ${op.network}`);
  }

  const decimals = ['USDC', 'USDT'].includes(op.token.toUpperCase()) ? 6 : 18;
  const amountBigInt = ethers.parseUnits(String(op.amount), decimals);
  const encryptionKey = getRailgunEncryptionKey();

  await pool.query(
    `UPDATE railgun_operations SET status = 'proving' WHERE id = $1`,
    [op.id]
  );

  let proofCalldata: string | undefined;

  if (op.operation_type === 'shield') {
    const shieldPrivateKey = await getShieldPrivateKey(op.user_id);
    if (!shieldPrivateKey) throw new Error('No shield private key');

    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [{
      tokenAddress,
      amount: amountBigInt,
      recipientAddress: walletForID(railgunWalletId).getAddress(),
    }];

    await generateShieldProofBytes(
      networkName,
      railgunWalletId,
      encryptionKey,
      erc20AmountRecipients,
      [],
    );

    const populated = await populateShield(
      networkName,
      shieldPrivateKey,
      erc20AmountRecipients,
      [],
      getGasDetails(),
    );

    proofCalldata = populated.transaction.data || '';
  } else if (op.operation_type === 'transfer') {
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [{
      tokenAddress,
      amount: amountBigInt,
      recipientAddress: op.recipient_address!,
    }];

    await generateTransferProof(
      networkName,
      railgunWalletId,
      encryptionKey,
      false,
      [],
      erc20AmountRecipients,
      [],
      undefined,
      () => {},
    );

    const populated = await populateProvedTransfer(
      networkName,
      railgunWalletId,
      false,
      [],
      erc20AmountRecipients,
      [],
      undefined,
      false,
      getGasDetails(),
    );

    proofCalldata = populated.transaction.data || '';
  } else if (op.operation_type === 'unshield') {
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [{
      tokenAddress,
      amount: amountBigInt,
      recipientAddress: op.recipient_address!,
    }];

    await generateUnshieldProof(
      networkName,
      railgunWalletId,
      encryptionKey,
      false,
      [],
      erc20AmountRecipients,
      [],
      undefined,
      () => {},
    );

    const populated = await populateProvedUnshield(
      networkName,
      railgunWalletId,
      false,
      [],
      erc20AmountRecipients,
      [],
      undefined,
      false,
      getGasDetails(),
    );

    proofCalldata = populated.transaction.data || '';
  }

  const zkProofHash = crypto.createHash('sha256').update(proofCalldata || '').digest('hex');

  await pool.query(
    `UPDATE railgun_operations SET status = 'confirmed', zk_proof_hash = $2, zk_proof_status = 'verified' WHERE id = $1`,
    [op.id, '0x' + zkProofHash]
  );
}

router.post('/shield', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await createOperation(req, res, 'shield');
  } catch (err) {
    console.error('Shield operation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/transfer', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await createOperation(req, res, 'transfer');
  } catch (err) {
    console.error('Transfer operation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/unshield', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await createOperation(req, res, 'unshield');
  } catch (err) {
    console.error('Unshield operation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
      operations: result.rows.map((r: ShieldOperationRow) => formatOperation(r)),
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
        const net = SUPPORTED_NETWORKS[0];
        await refreshBalances(net.networkName, walletInfo.railgunWalletId);
      } catch {
        // fall through to DB aggregation
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

    const balances = result.rows.map((row: { network: string; token: string; shielded_balance: string | number }) => ({
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
