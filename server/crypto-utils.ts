import { ethers } from 'ethers';
import crypto from 'crypto';

const SUPPORTED_COINS = ['BTC', 'ETH', 'XMR', 'LTC', 'DASH', 'ZEC', 'BCH', 'DOGE'] as const;
type SupportedCoin = typeof SUPPORTED_COINS[number];

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function isBase58(str: string): boolean {
  for (const char of str) {
    if (!BASE58_ALPHABET.includes(char)) return false;
  }
  return true;
}

function isHex(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str);
}

const ADDRESS_VALIDATORS: Record<SupportedCoin, (address: string) => { valid: boolean; error?: string }> = {
  BTC: (address: string) => {
    if (address.startsWith('bc1')) {
      if (!/^bc1[a-z0-9]{25,90}$/.test(address)) {
        return { valid: false, error: 'Invalid Bech32 BTC address format' };
      }
      return { valid: true };
    }
    if (address.startsWith('1') || address.startsWith('3')) {
      if (address.length < 25 || address.length > 34) {
        return { valid: false, error: 'BTC address must be 25-34 characters' };
      }
      if (!isBase58(address)) {
        return { valid: false, error: 'Invalid Base58 characters in BTC address' };
      }
      return { valid: true };
    }
    return { valid: false, error: 'BTC address must start with 1, 3, or bc1' };
  },

  ETH: (address: string) => {
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return { valid: false, error: 'ETH address must be 0x followed by 40 hex characters' };
    }
    try {
      ethers.getAddress(address);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid ETH address checksum' };
    }
  },

  XMR: (address: string) => {
    if (address.startsWith('4') || address.startsWith('8')) {
      if (address.length === 95 || address.length === 106) {
        if (isBase58(address)) {
          return { valid: true };
        }
        return { valid: false, error: 'Invalid Base58 characters in XMR address' };
      }
      return { valid: false, error: 'XMR address must be 95 or 106 characters' };
    }
    return { valid: false, error: 'XMR address must start with 4 or 8' };
  },

  LTC: (address: string) => {
    if (address.startsWith('ltc1')) {
      if (!/^ltc1[a-z0-9]{25,90}$/.test(address)) {
        return { valid: false, error: 'Invalid Bech32 LTC address format' };
      }
      return { valid: true };
    }
    if (address.startsWith('L') || address.startsWith('M') || address.startsWith('3')) {
      if (address.length < 25 || address.length > 34) {
        return { valid: false, error: 'LTC address must be 25-34 characters' };
      }
      if (!isBase58(address)) {
        return { valid: false, error: 'Invalid Base58 characters in LTC address' };
      }
      return { valid: true };
    }
    return { valid: false, error: 'LTC address must start with L, M, 3, or ltc1' };
  },

  DASH: (address: string) => {
    if (address.startsWith('X') || address.startsWith('7')) {
      if (address.length < 25 || address.length > 34) {
        return { valid: false, error: 'DASH address must be 25-34 characters' };
      }
      if (!isBase58(address)) {
        return { valid: false, error: 'Invalid Base58 characters in DASH address' };
      }
      return { valid: true };
    }
    return { valid: false, error: 'DASH address must start with X or 7' };
  },

  ZEC: (address: string) => {
    if (address.startsWith('t1') || address.startsWith('t3')) {
      if (address.length < 25 || address.length > 36) {
        return { valid: false, error: 'ZEC transparent address must be 25-36 characters' };
      }
      if (!isBase58(address)) {
        return { valid: false, error: 'Invalid Base58 characters in ZEC address' };
      }
      return { valid: true };
    }
    if (address.startsWith('zs1')) {
      if (address.length >= 60 && address.length <= 90) {
        return { valid: true };
      }
      return { valid: false, error: 'Invalid ZEC Sapling address length' };
    }
    return { valid: false, error: 'ZEC address must start with t1, t3, or zs1' };
  },

  BCH: (address: string) => {
    if (address.startsWith('bitcoincash:') || address.startsWith('q') || address.startsWith('p')) {
      const stripped = address.startsWith('bitcoincash:') ? address.slice(12) : address;
      if (stripped.length >= 25 && stripped.length <= 55) {
        return { valid: true };
      }
      return { valid: false, error: 'Invalid BCH CashAddr length' };
    }
    if (address.startsWith('1') || address.startsWith('3')) {
      if (address.length < 25 || address.length > 34) {
        return { valid: false, error: 'BCH legacy address must be 25-34 characters' };
      }
      if (!isBase58(address)) {
        return { valid: false, error: 'Invalid Base58 characters in BCH address' };
      }
      return { valid: true };
    }
    return { valid: false, error: 'Invalid BCH address format' };
  },

  DOGE: (address: string) => {
    if (address.startsWith('D') || address.startsWith('A') || address.startsWith('9')) {
      if (address.length < 25 || address.length > 34) {
        return { valid: false, error: 'DOGE address must be 25-34 characters' };
      }
      if (!isBase58(address)) {
        return { valid: false, error: 'Invalid Base58 characters in DOGE address' };
      }
      return { valid: true };
    }
    return { valid: false, error: 'DOGE address must start with D, A, or 9' };
  },
};

export function validateAddress(coin: string, address: string): { valid: boolean; error?: string } {
  const upperCoin = coin.toUpperCase() as SupportedCoin;
  if (!SUPPORTED_COINS.includes(upperCoin)) {
    return { valid: false, error: `Unsupported coin: ${coin}` };
  }
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return { valid: false, error: 'Address is required' };
  }
  const trimmed = address.trim();
  if (trimmed.length > 256) {
    return { valid: false, error: 'Address is too long' };
  }
  return ADDRESS_VALIDATORS[upperCoin](trimmed);
}

export function isSupportedCoin(coin: string): boolean {
  return SUPPORTED_COINS.includes(coin.toUpperCase() as SupportedCoin);
}

function getEncryptionKeyString(): string {
  const key = process.env.DEPOSIT_KEY_SECRET;
  if (!key && process.env.NODE_ENV === 'production') {
    throw new Error('DEPOSIT_KEY_SECRET must be set in production');
  }
  return key || 'ghostlane-dev-encryption-key-32b';
}

function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(getEncryptionKeyString()).digest();
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export interface DepositAddressResult {
  address: string;
  encryptedPrivateKey: string;
}

function generateEthLikeAddress(): DepositAddressResult {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    encryptedPrivateKey: encrypt(wallet.privateKey),
  };
}

function base58Encode(buffer: Buffer): string {
  const digits = [0];
  for (const byte of buffer) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let result = '';
  for (const byte of buffer) {
    if (byte !== 0) break;
    result += '1';
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]];
  }
  return result;
}

function generateBase58Address(versionByte: number): DepositAddressResult {
  const privKey = crypto.randomBytes(32);
  const signingKey = new ethers.SigningKey('0x' + privKey.toString('hex'));
  const compressedPubKey = Buffer.from(signingKey.compressedPublicKey.slice(2), 'hex');

  const sha256Hash = crypto.createHash('sha256').update(compressedPubKey).digest();
  const ripemd = crypto.createHash('ripemd160').update(sha256Hash).digest();

  const versionedPayload = Buffer.concat([Buffer.from([versionByte]), ripemd]);
  const checksum = crypto.createHash('sha256').update(
    crypto.createHash('sha256').update(versionedPayload).digest()
  ).digest().subarray(0, 4);

  const addressBuffer = Buffer.concat([versionedPayload, checksum]);

  return {
    address: base58Encode(addressBuffer),
    encryptedPrivateKey: encrypt(privKey.toString('hex')),
  };
}

function generateXmrAddress(): DepositAddressResult {
  const spendKeyPair = crypto.generateKeyPairSync('ed25519');
  const viewKeyPair = crypto.generateKeyPairSync('ed25519');

  const spendPub = spendKeyPair.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32);
  const viewPub = viewKeyPair.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32);
  const spendPriv = spendKeyPair.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32);
  const viewPriv = viewKeyPair.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32);

  const networkByte = Buffer.from([0x12]);
  const payload = Buffer.concat([networkByte, spendPub, viewPub]);
  const checkHash = crypto.createHash('sha256').update(payload).digest().subarray(0, 4);
  const fullAddr = Buffer.concat([payload, checkHash]);
  const address = base58Encode(fullAddr);

  return {
    address,
    encryptedPrivateKey: encrypt(JSON.stringify({
      spendKey: spendPriv.toString('hex'),
      viewKey: viewPriv.toString('hex'),
    })),
  };
}

const COIN_ADDRESS_GENERATORS: Record<SupportedCoin, () => DepositAddressResult> = {
  BTC: () => generateBase58Address(0x00),
  ETH: () => generateEthLikeAddress(),
  XMR: () => generateXmrAddress(),
  LTC: () => generateBase58Address(0x30),
  DASH: () => generateBase58Address(0x4C),
  ZEC: () => generateBase58Address(0x1C),
  BCH: () => generateBase58Address(0x00),
  DOGE: () => generateBase58Address(0x1E),
};

export function generateDepositAddress(coin: string): DepositAddressResult {
  const upperCoin = coin.toUpperCase() as SupportedCoin;
  if (!SUPPORTED_COINS.includes(upperCoin)) {
    throw new Error(`Unsupported coin: ${coin}`);
  }
  return COIN_ADDRESS_GENERATORS[upperCoin]();
}

export { SUPPORTED_COINS };
