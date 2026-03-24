const CURRENCY_LOGOS: Record<string, string> = {
  SOL: '/sol-logo.png',
  USDC: '/usdc-logo.png',
  USDT: '/usdt-logo.png',
  BTC: '/crypto-btc.png',
  ETH: '/crypto-eth.png',
  XMR: '/crypto-xmr.png',
  LTC: '/crypto-ltc.png',
  DASH: '/crypto-dash.png',
  ZEC: '/crypto-zec.png',
  BCH: '/crypto-bch.png',
  DOGE: '/crypto-doge.png',
  MATIC: '/crypto-matic.png',
  AVAX: '/crypto-avax.png',
  BNB: '/crypto-bnb.png',
  FTM: '/crypto-ftm.png',
  ARB: '/crypto-arb.png',
  OP: '/crypto-op.png',
};

export const CHAIN_LOGOS: Record<string, string> = {
  ethereum: '/crypto-eth.png',
  bitcoin: '/crypto-btc.png',
  solana: '/sol-logo.png',
  polygon: '/crypto-matic.png',
  avalanche: '/crypto-avax.png',
  bsc: '/crypto-bnb.png',
  arbitrum: '/crypto-arb.png',
  optimism: '/crypto-op.png',
  base: '/crypto-eth.png',
  monero: '/crypto-xmr.png',
  litecoin: '/crypto-ltc.png',
  zcash: '/crypto-zec.png',
  dash: '/crypto-dash.png',
  dogecoin: '/crypto-doge.png',
  fantom: '/crypto-ftm.png',
};

export function getTokenLogo(token: string): string | undefined {
  return CURRENCY_LOGOS[token];
}

export function getChainLogo(chainId: string): string | undefined {
  return CHAIN_LOGOS[chainId];
}

interface CurrencyBadgeProps {
  currency: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export default function CurrencyBadge({ currency, size = 'sm', showLabel = true, className = '' }: CurrencyBadgeProps) {
  const logo = CURRENCY_LOGOS[currency];
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {logo ? (
        <img src={logo} alt={currency} className={`${iconSize} object-contain`} />
      ) : (
        <span className={`${iconSize} rounded-full bg-[#0AF5D6]/10 flex items-center justify-center`}>
          <span className="text-[#0AF5D6] text-[7px] font-bold">{currency.slice(0, 1)}</span>
        </span>
      )}
      {showLabel && (
        <span className={`${textSize} font-bold text-[#0AF5D6]`}>{currency}</span>
      )}
    </span>
  );
}

interface CurrencySelectProps {
  value: string;
  onChange: (val: string) => void;
  currencies?: string[];
  className?: string;
}

export function CurrencySelect({ value, onChange, currencies = ['USDC', 'SOL', 'ETH', 'USDT'], className = '' }: CurrencySelectProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {currencies.map((c) => {
        const logo = CURRENCY_LOGOS[c];
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              value === c
                ? 'bg-[#0AF5D6]/15 text-[#0AF5D6] border border-[#0AF5D6]/30'
                : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            {logo && <img src={logo} alt={c} className="w-4 h-4 object-contain" />}
            {c}
          </button>
        );
      })}
    </div>
  );
}

interface CurrencyToggleProps {
  selected: string[];
  onChange: (currencies: string[]) => void;
  currencies?: string[];
}

export function CurrencyToggle({ selected, onChange, currencies = ['USDC', 'SOL', 'ETH', 'USDT'] }: CurrencyToggleProps) {
  const toggle = (c: string) => {
    if (selected.includes(c)) {
      if (selected.length > 1) onChange(selected.filter(x => x !== c));
    } else {
      onChange([...selected, c]);
    }
  };

  return (
    <div className="flex gap-2">
      {currencies.map((c) => {
        const logo = CURRENCY_LOGOS[c];
        return (
          <button
            key={c}
            type="button"
            onClick={() => toggle(c)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              selected.includes(c)
                ? 'bg-[#0AF5D6]/15 text-[#0AF5D6] border border-[#0AF5D6]/30'
                : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            {logo && <img src={logo} alt={c} className="w-4 h-4 object-contain" />}
            {c}
          </button>
        );
      })}
    </div>
  );
}
