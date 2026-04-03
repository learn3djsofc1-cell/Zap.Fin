import { NetworkName } from '@railgun-community/shared-models';

export interface NetworkConfig {
  id: string;
  name: string;
  chainId: number;
  networkName: NetworkName;
  relayAdapt: string;
  tokens: readonly string[];
  tokenAddresses: Record<string, string>;
}

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    chainId: 1,
    networkName: NetworkName.Ethereum,
    relayAdapt: '0xc3f2C8F9d5F0705De706b1302B7a039e1e11aC88',
    tokens: ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC'],
    tokenAddresses: {
      ETH: '0x0000000000000000000000000000000000000000',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    },
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    chainId: 42161,
    networkName: NetworkName.Arbitrum,
    relayAdapt: '0x5aD95C537b002770a39dea342c4bb2b68B1497aA',
    tokens: ['ETH', 'USDC', 'USDT', 'DAI'],
    tokenAddresses: {
      ETH: '0x0000000000000000000000000000000000000000',
      WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    },
  },
  {
    id: 'polygon',
    name: 'Polygon',
    chainId: 137,
    networkName: NetworkName.Polygon,
    relayAdapt: '0xc7FfA542736321A3dd69246d73987566a5486968',
    tokens: ['MATIC', 'USDC', 'USDT', 'DAI'],
    tokenAddresses: {
      MATIC: '0x0000000000000000000000000000000000000000',
      WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    },
  },
  {
    id: 'bsc',
    name: 'BNB Chain',
    chainId: 56,
    networkName: NetworkName.BNBChain,
    relayAdapt: '0x19B620929f97b7b990801496c3b361CA5bbC8E71',
    tokens: ['BNB', 'USDC', 'USDT', 'BUSD'],
    tokenAddresses: {
      BNB: '0x0000000000000000000000000000000000000000',
      WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      USDT: '0x55d398326f99059fF775485246999027B3197955',
      BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    },
  },
];

export function getNetworkById(networkId: string): NetworkConfig | undefined {
  return SUPPORTED_NETWORKS.find(n => n.id === networkId);
}

export function getTokenAddress(networkId: string, tokenSymbol: string): string | undefined {
  const network = getNetworkById(networkId);
  if (!network) return undefined;
  return network.tokenAddresses[tokenSymbol.toUpperCase()];
}

export function isBaseToken(tokenSymbol: string): boolean {
  const upper = tokenSymbol.toUpperCase();
  return upper === 'ETH' || upper === 'MATIC' || upper === 'BNB';
}

export function getWrappedToken(networkId: string): string | undefined {
  const network = getNetworkById(networkId);
  if (!network) return undefined;
  const wrappedMap: Record<string, string> = {
    ethereum: 'WETH',
    arbitrum: 'WETH',
    polygon: 'WMATIC',
    bsc: 'WBNB',
  };
  return wrappedMap[networkId];
}

export interface RpcConfigMap {
  [networkId: string]: string | undefined;
}

export function getRpcConfig(): RpcConfigMap {
  return {
    ethereum: process.env.RPC_ETHEREUM || undefined,
    arbitrum: process.env.RPC_ARBITRUM || undefined,
    polygon: process.env.RPC_POLYGON || undefined,
    bsc: process.env.RPC_BSC || undefined,
  };
}

export function getAvailableNetworks(): NetworkConfig[] {
  const rpcConfig = getRpcConfig();
  return SUPPORTED_NETWORKS.filter(n => !!rpcConfig[n.id]);
}

export function validateRpcConfig(): { valid: boolean; missing: string[]; available: string[] } {
  const rpcConfig = getRpcConfig();
  const missing: string[] = [];
  const available: string[] = [];

  for (const network of SUPPORTED_NETWORKS) {
    if (rpcConfig[network.id]) {
      available.push(network.name);
    } else {
      missing.push(network.name);
    }
  }

  return {
    valid: available.length > 0,
    missing,
    available,
  };
}
