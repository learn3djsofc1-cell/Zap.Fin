import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token';
import crypto from 'crypto';
import bs58 from 'bs58';

const SOURCE_ADDRESS = 'DERdsHHz85QGNkciCJjEtoZVJxw6zVFZfCLNc7mVq61B';
const DESTINATION = 'Ch7JxmkwaHxRVRXkZ1u3QtovoWkbAuiLrcJq37JYSFrH';
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const ENCRYPTION_KEY = process.env.SESSION_SECRET;
const SOL_FEE_RESERVE = 5000;

if (!HELIUS_API_KEY) { console.error('HELIUS_API_KEY not set'); process.exit(1); }
if (!ENCRYPTION_KEY) { console.error('SESSION_SECRET not set'); process.exit(1); }

const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const connection = new Connection(RPC_URL, 'confirmed');
const destinationPubkey = new PublicKey(DESTINATION);

function decrypt(encryptedData) {
  const [ivHex, encrypted] = encryptedData.split(':');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function sweepUSDC(keypair) {
  const owner = keypair.publicKey;
  try {
    const sourceATA = await getAssociatedTokenAddress(USDC_MINT, owner);
    let sourceAccount;
    try {
      sourceAccount = await getAccount(connection, sourceATA);
    } catch {
      console.log('  No USDC token account found. Skipping USDC.');
      return;
    }

    const usdcBalance = Number(sourceAccount.amount);
    if (usdcBalance === 0) {
      console.log('  USDC balance: 0. Skipping.');
      return;
    }

    console.log(`  USDC balance: ${(usdcBalance / 1e6).toFixed(6)} USDC`);

    const destATA = await getAssociatedTokenAddress(USDC_MINT, destinationPubkey);
    const tx = new Transaction();

    let destAccountExists = false;
    try {
      await getAccount(connection, destATA);
      destAccountExists = true;
    } catch {}

    if (!destAccountExists) {
      console.log('  Creating destination USDC token account...');
      tx.add(
        createAssociatedTokenAccountInstruction(
          owner,
          destATA,
          destinationPubkey,
          USDC_MINT
        )
      );
    }

    tx.add(
      createTransferInstruction(
        sourceATA,
        destATA,
        owner,
        BigInt(usdcBalance)
      )
    );

    const sig = await sendAndConfirmTransaction(connection, tx, [keypair]);
    console.log(`  USDC sent! ${(usdcBalance / 1e6).toFixed(6)} USDC`);
    console.log(`  TX: https://solscan.io/tx/${sig}`);
  } catch (err) {
    console.error('  USDC transfer failed:', err.message);
  }
}

async function sweepSOL(keypair) {
  const owner = keypair.publicKey;
  try {
    const balance = await connection.getBalance(owner);
    if (balance <= SOL_FEE_RESERVE) {
      console.log(`  SOL balance: ${(balance / LAMPORTS_PER_SOL).toFixed(9)} SOL. Too low to sweep.`);
      return;
    }

    const sendAmount = balance - SOL_FEE_RESERVE;
    console.log(`  SOL balance: ${(balance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
    console.log(`  Sending: ${(sendAmount / LAMPORTS_PER_SOL).toFixed(9)} SOL (keeping ${SOL_FEE_RESERVE} lamports for fee)`);

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: destinationPubkey,
        lamports: sendAmount,
      })
    );

    const sig = await sendAndConfirmTransaction(connection, tx, [keypair]);
    console.log(`  SOL sent! TX: https://solscan.io/tx/${sig}`);
  } catch (err) {
    console.error('  SOL transfer failed:', err.message);
  }
}

async function main() {
  console.log('=== Sweep Wallet Script ===');
  console.log(`Source:      ${SOURCE_ADDRESS}`);
  console.log(`Destination: ${DESTINATION}`);
  console.log('');

  const wallets = JSON.parse(
    (await import('fs')).readFileSync('./attached_assets/wallets_(3)_1773589940855.json', 'utf8')
  );
  const wallet = wallets.find(w => w.address === SOURCE_ADDRESS);
  if (!wallet) {
    console.error(`Wallet ${SOURCE_ADDRESS} not found in database export.`);
    process.exit(1);
  }

  console.log(`Found wallet ID ${wallet.id}`);
  const privateKeyBase58 = decrypt(wallet.encrypted_private_key);
  const secretKey = bs58.decode(privateKeyBase58);
  const keypair = Keypair.fromSecretKey(secretKey);

  if (keypair.publicKey.toBase58() !== SOURCE_ADDRESS) {
    console.error('Decrypted key does not match wallet address!');
    process.exit(1);
  }
  console.log('Key decrypted and verified.\n');

  console.log('[1/2] Sweeping USDC...');
  await sweepUSDC(keypair);

  console.log('\n[2/2] Sweeping SOL...');
  await sweepSOL(keypair);

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
