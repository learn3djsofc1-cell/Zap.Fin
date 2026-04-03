import * as fs from 'fs';
import * as path from 'path';

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  XMR: 'monero',
  LTC: 'litecoin',
  DASH: 'dash',
  ZEC: 'zcash',
  BCH: 'bitcoin-cash',
  DOGE: 'dogecoin',
};

const CHAIN_COINGECKO_IDS: Record<string, string> = {
  ethereum: 'ethereum',
  bitcoin: 'bitcoin',
  polygon: 'matic-network',
  avalanche: 'avalanche-2',
  bsc: 'binancecoin',
  arbitrum: 'arbitrum',
  optimism: 'optimism',
  base: 'ethereum',
  monero: 'monero',
  litecoin: 'litecoin',
  zcash: 'zcash',
  dash: 'dash',
  dogecoin: 'dogecoin',
  fantom: 'fantom',
  solana: 'solana',
};

const TOKEN_COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDC: 'usd-coin',
  USDT: 'tether',
  XMR: 'monero',
  LTC: 'litecoin',
  DASH: 'dash',
  ZEC: 'zcash',
  BCH: 'bitcoin-cash',
  DOGE: 'dogecoin',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  BNB: 'binancecoin',
  FTM: 'fantom',
  ARB: 'arbitrum',
  OP: 'optimism',
  SOL: 'solana',
};

const LOGO_CACHE_DIR = path.join(process.cwd(), 'public');
const logoMemoryCache: Record<string, string> = {};

function getLogoFilename(geckoId: string): string {
  return `crypto-${geckoId}.png`;
}

function getLocalLogoPath(geckoId: string): string {
  return path.join(LOGO_CACHE_DIR, getLogoFilename(geckoId));
}

function isLogoCached(geckoId: string): boolean {
  if (logoMemoryCache[geckoId]) return true;
  const filePath = getLocalLogoPath(geckoId);
  if (fs.existsSync(filePath)) {
    logoMemoryCache[geckoId] = `/${getLogoFilename(geckoId)}`;
    return true;
  }
  return false;
}

async function fetchAndCacheLogo(geckoId: string): Promise<string | null> {
  if (isLogoCached(geckoId)) {
    return logoMemoryCache[geckoId];
  }

  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) return null;

  try {
    const infoUrl = `https://api.coingecko.com/api/v3/coins/${geckoId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false&x_cg_demo_api_key=${apiKey}`;
    const resp = await fetch(infoUrl, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) return null;

    const data = await resp.json();
    const imageUrl = data?.image?.small || data?.image?.thumb;
    if (!imageUrl) return null;

    const imgResp = await fetch(imageUrl);
    if (!imgResp.ok) return null;

    const buffer = Buffer.from(await imgResp.arrayBuffer());
    const filePath = getLocalLogoPath(geckoId);
    fs.writeFileSync(filePath, buffer);

    const publicPath = `/${getLogoFilename(geckoId)}`;
    logoMemoryCache[geckoId] = publicPath;
    console.log(`Cached logo for ${geckoId} at ${filePath}`);
    return publicPath;
  } catch (err) {
    console.error(`Failed to fetch logo for ${geckoId}:`, err);
    return null;
  }
}

export async function getChainLogoUrl(chainId: string): Promise<string | null> {
  const geckoId = CHAIN_COINGECKO_IDS[chainId];
  if (!geckoId) return null;

  if (isLogoCached(geckoId)) {
    return logoMemoryCache[geckoId];
  }

  return fetchAndCacheLogo(geckoId);
}

export async function getTokenLogoUrl(token: string): Promise<string | null> {
  const geckoId = TOKEN_COINGECKO_IDS[token.toUpperCase()];
  if (!geckoId) return null;

  if (isLogoCached(geckoId)) {
    return logoMemoryCache[geckoId];
  }

  return fetchAndCacheLogo(geckoId);
}

export function initLogoCache(): void {
  if (!fs.existsSync(LOGO_CACHE_DIR)) {
    fs.mkdirSync(LOGO_CACHE_DIR, { recursive: true });
  }

  const allGeckoIds = new Set([
    ...Object.values(CHAIN_COINGECKO_IDS),
    ...Object.values(TOKEN_COINGECKO_IDS),
  ]);

  for (const geckoId of allGeckoIds) {
    isLogoCached(geckoId);
  }

  const uncachedIds = [...allGeckoIds].filter(id => !logoMemoryCache[id]);
  if (uncachedIds.length > 0) {
    console.log(`Logo cache: ${allGeckoIds.size - uncachedIds.length} cached, ${uncachedIds.length} missing — will fetch on demand`);
    (async () => {
      for (const geckoId of uncachedIds) {
        await fetchAndCacheLogo(geckoId);
        await new Promise(r => setTimeout(r, 1500));
      }
    })().catch(err => console.error('Background logo fetch error:', err));
  } else {
    console.log(`Logo cache: all ${allGeckoIds.size} logos cached locally`);
  }
}

export { CHAIN_COINGECKO_IDS, TOKEN_COINGECKO_IDS };

const SUPPORTED_SYMBOLS = Object.keys(COINGECKO_IDS);

interface PriceCache {
  prices: Record<string, number>;
  fetchedAt: number;
}

let priceCache: PriceCache | null = null;
const CACHE_TTL_MS = 60_000;

const MIXER_FEE_PERCENT = 1.5;

async function fetchPricesFromApi(): Promise<Record<string, number>> {
  const apiKey = process.env.COINGECKO_API_KEY;
  const ids = Object.values(COINGECKO_IDS).join(',');
  const url = apiKey
    ? `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`
    : `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

  let response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok && apiKey) {
    const fallbackUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
    console.warn(`CoinGecko keyed request failed (${response.status}), retrying without key...`);
    response = await fetch(fallbackUrl, {
      headers: { 'Accept': 'application/json' },
    });
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CoinGecko API error ${response.status}: ${text}`);
  }

  const data = await response.json();

  const prices: Record<string, number> = {};
  for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
    const entry = data[geckoId];
    if (entry && typeof entry.usd === 'number') {
      prices[symbol] = entry.usd;
    }
  }

  return prices;
}

export async function getPrices(): Promise<Record<string, number>> {
  const now = Date.now();
  if (priceCache && (now - priceCache.fetchedAt) < CACHE_TTL_MS) {
    return priceCache.prices;
  }

  try {
    const prices = await fetchPricesFromApi();
    priceCache = { prices, fetchedAt: now };
    return prices;
  } catch (err) {
    console.error('CoinGecko fetch error:', err);
    if (priceCache) {
      return priceCache.prices;
    }
    throw err;
  }
}

export function convertAmount(
  sendAmount: number,
  sendPriceUsd: number,
  receivePriceUsd: number,
  feePercent: number = MIXER_FEE_PERCENT,
): { receiveAmount: number; exchangeRate: number; feePercent: number } {
  if (receivePriceUsd <= 0) throw new Error('Invalid receive price');
  const exchangeRate = sendPriceUsd / receivePriceUsd;
  const grossReceive = sendAmount * exchangeRate;
  const receiveAmount = grossReceive * (1 - feePercent / 100);
  return {
    receiveAmount: parseFloat(receiveAmount.toPrecision(8)),
    exchangeRate: parseFloat(exchangeRate.toPrecision(10)),
    feePercent,
  };
}

export async function getConversion(
  sendCoin: string,
  receiveCoin: string,
  sendAmount: number,
): Promise<{ receiveAmount: number; exchangeRate: number; feePercent: number; prices: Record<string, number> }> {
  const prices = await getPrices();
  const sendPrice = prices[sendCoin.toUpperCase()];
  const receivePrice = prices[receiveCoin.toUpperCase()];

  if (!sendPrice || !receivePrice) {
    throw new Error(`Price not available for ${!sendPrice ? sendCoin : receiveCoin}`);
  }

  const conversion = convertAmount(sendAmount, sendPrice, receivePrice);
  return { ...conversion, prices };
}

export { SUPPORTED_SYMBOLS, MIXER_FEE_PERCENT };
