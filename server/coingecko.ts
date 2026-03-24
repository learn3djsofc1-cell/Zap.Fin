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
  if (!apiKey) {
    throw new Error('COINGECKO_API_KEY is not configured');
  }

  const ids = Object.values(COINGECKO_IDS).join(',');
  const isProKey = apiKey.startsWith('CG-') && apiKey.length > 20;
  const baseUrl = isProKey ? 'https://pro-api.coingecko.com' : 'https://api.coingecko.com';
  const keyParam = isProKey ? 'x_cg_pro_api_key' : 'x_cg_demo_api_key';
  const url = `${baseUrl}/api/v3/simple/price?ids=${ids}&vs_currencies=usd&${keyParam}=${apiKey}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

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
