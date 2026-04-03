import {
  createRailgunWallet,
  loadWalletByID,
  getWalletMnemonic,
  getRailgunWalletAddressData,
  mnemonicTo0xPKey,
  walletForID,
} from '@railgun-community/wallet';
import { NetworkName } from '@railgun-community/shared-models';
import { ethers } from 'ethers';
import crypto from 'crypto';
import pool from '../db.js';

function getEncryptionKeyString(): string {
  const key = process.env.DEPOSIT_KEY_SECRET;
  if (!key && process.env.NODE_ENV === 'production') {
    throw new Error('DEPOSIT_KEY_SECRET must be set in production');
  }
  return key || 'noctra-dev-encryption-key-32bytes';
}

function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(getEncryptionKeyString()).digest();
}

export function getRailgunEncryptionKey(): string {
  return crypto.createHash('sha256').update(getEncryptionKeyString() + ':railgun').digest('hex');
}

function encryptMnemonic(mnemonic: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(mnemonic, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptMnemonic(encryptedMnemonic: string): string {
  const key = getEncryptionKey();
  const [ivHex, encrypted] = encryptedMnemonic.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export interface UserWalletInfo {
  id: number;
  userId: number;
  railgunWalletId: string;
  railgunAddress: string;
  evmAddress: string;
  createdAt: string;
}

export async function createUserWallet(userId: number): Promise<UserWalletInfo> {
  const existing = await pool.query(
    'SELECT * FROM user_wallets WHERE user_id = $1',
    [userId]
  );
  if (existing.rows.length > 0) {
    return formatWalletRow(existing.rows[0]);
  }

  const wallet = ethers.Wallet.createRandom();
  const mnemonic = wallet.mnemonic!.phrase;
  const encryptedMnemonic = encryptMnemonic(mnemonic);
  const evmAddress = wallet.address;

  const encryptionKey = getRailgunEncryptionKey();

  const creationBlockNumbers: Record<string, number> = {
    [NetworkName.Ethereum]: 0,
    [NetworkName.Arbitrum]: 0,
    [NetworkName.Polygon]: 0,
    [NetworkName.BNBChain]: 0,
  };

  const railgunWallet = await createRailgunWallet(
    encryptionKey,
    mnemonic,
    creationBlockNumbers,
    undefined,
  );

  const railgunWalletId = railgunWallet.id;
  const addressData = getRailgunWalletAddressData(railgunWalletId);
  const railgunAddress = addressData.railgunAddress;

  const result = await pool.query(
    `INSERT INTO user_wallets (user_id, railgun_wallet_id, railgun_address, evm_address, encrypted_mnemonic)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, railgunWalletId, railgunAddress, evmAddress, encryptedMnemonic]
  );

  console.log(`[Railgun] Created wallet for user ${userId}: ${railgunAddress.substring(0, 20)}...`);
  return formatWalletRow(result.rows[0]);
}

export async function loadUserWallet(userId: number): Promise<UserWalletInfo | null> {
  const result = await pool.query(
    'SELECT * FROM user_wallets WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const encryptionKey = getRailgunEncryptionKey();

  try {
    walletForID(row.railgun_wallet_id);
  } catch {
    const mnemonic = decryptMnemonic(row.encrypted_mnemonic);

    const creationBlockNumbers: Record<string, number> = {
      [NetworkName.Ethereum]: 0,
      [NetworkName.Arbitrum]: 0,
      [NetworkName.Polygon]: 0,
      [NetworkName.BNBChain]: 0,
    };

    try {
      await loadWalletByID(encryptionKey, row.railgun_wallet_id, false);
    } catch {
      await createRailgunWallet(encryptionKey, mnemonic, creationBlockNumbers, undefined);
    }
  }

  return formatWalletRow(row);
}

export async function getUserWalletInfo(userId: number): Promise<UserWalletInfo | null> {
  const result = await pool.query(
    'SELECT * FROM user_wallets WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) return null;
  return formatWalletRow(result.rows[0]);
}

export async function getUserSigningWallet(userId: number): Promise<ethers.Wallet | null> {
  const result = await pool.query(
    'SELECT encrypted_mnemonic FROM user_wallets WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) return null;

  const mnemonic = decryptMnemonic(result.rows[0].encrypted_mnemonic);
  return ethers.Wallet.fromPhrase(mnemonic);
}

export async function getShieldPrivateKey(userId: number): Promise<string | null> {
  const result = await pool.query(
    'SELECT encrypted_mnemonic FROM user_wallets WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) return null;

  const mnemonic = decryptMnemonic(result.rows[0].encrypted_mnemonic);
  const pkey = mnemonicTo0xPKey(mnemonic);
  return pkey;
}

function formatWalletRow(row: any): UserWalletInfo {
  return {
    id: row.id,
    userId: row.user_id,
    railgunWalletId: row.railgun_wallet_id,
    railgunAddress: row.railgun_address,
    evmAddress: row.evm_address,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}
