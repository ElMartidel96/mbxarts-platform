/**
 * @mbxarts/config - Shared configuration for MBXarts Platform
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { ChainConfig, SUPPORTED_CHAINS } from '@mbxarts/types';

// =============================================================================
// SERVICE URLS
// =============================================================================

export const SERVICES = {
  DAO: {
    name: 'CryptoGift DAO',
    url: process.env.NEXT_PUBLIC_DAO_API_URL || 'https://mbxarts.com',
    internalUrl: process.env.DAO_INTERNAL_URL || 'https://mbxarts.com',
  },
  WALLETS: {
    name: 'CryptoGift Wallets',
    url: process.env.NEXT_PUBLIC_WALLETS_API_URL || 'https://gifts.mbxarts.com',
    internalUrl: process.env.WALLETS_INTERNAL_URL || 'https://gifts.mbxarts.com',
  },
  PATRIA: {
    name: 'Proyecto Patria',
    url: process.env.NEXT_PUBLIC_PATRIA_API_URL || 'https://www.proyectopatria.org',
    internalUrl: process.env.PATRIA_INTERNAL_URL || 'https://www.proyectopatria.org',
  },
} as const;

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;

export const API_CONFIG = {
  dao: {
    baseUrl: SERVICES.DAO.url,
    version: API_VERSION,
  },
  wallets: {
    baseUrl: SERVICES.WALLETS.url,
    version: API_VERSION,
  },
} as const;

// =============================================================================
// CHAIN CONFIGURATION
// =============================================================================

export const CHAINS: Record<number, ChainConfig> = {
  [SUPPORTED_CHAINS.BASE_MAINNET]: {
    id: SUPPORTED_CHAINS.BASE_MAINNET,
    name: 'Base',
    network: 'base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [SUPPORTED_CHAINS.BASE_SEPOLIA]: {
    id: SUPPORTED_CHAINS.BASE_SEPOLIA,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

export const DEFAULT_CHAIN_ID = SUPPORTED_CHAINS.BASE_MAINNET;

// =============================================================================
// CONTRACT ADDRESSES
// =============================================================================

export const CONTRACTS = {
  // DAO Contracts (Base Mainnet)
  dao: {
    cgcToken: '0x5e3a61b550328f3D8C44f60b3e10a49D3d806175',
    daoAddress: '0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31',
    minterGateway: '0xdd10540847a4495e21f01230a0d39C7c6785598F',
    timelockController: '0x9753d772C632e2d117b81d96939B878D74fB5166',
    safeOwner: '0x11323672b5f9bB899Fa332D5d464CC4e66637b42',
    safeGuardian: '0xe9411DD1f2AF42186b2bCE828B6e7d0dd0D7a6bc',
  },
  // Wallets Contracts (Base Sepolia - for testing)
  wallets: {
    nftContract: '0xeFCba1D72B8f053d93BA44b7b15a1BeED515C89b',
    escrowContract: '0x46175CfC233500DA803841DEef7f2816e7A129E0',
    simpleApprovalGate: '0x99cCBE808cf4c01382779755DEf1562905ceb0d2',
    erc6551Registry: '0x000000006551c19487814612e58FE06813775758',
    erc6551Implementation: '0x2d25602551487c3f3354dd80d76d54383a243358',
  },
} as const;

// =============================================================================
// NAVIGATION LINKS
// =============================================================================

export const PLATFORM_LINKS = {
  dao: {
    home: 'https://mbxarts.com',
    profile: 'https://mbxarts.com/profile',
    tasks: 'https://mbxarts.com/tasks',
    governance: 'https://mbxarts.com/governance',
    referrals: 'https://mbxarts.com/referrals',
    funding: 'https://mbxarts.com/funding',
  },
  wallets: {
    home: 'https://gifts.mbxarts.com',
    create: 'https://gifts.mbxarts.com/create',
    gallery: 'https://gifts.mbxarts.com/gallery',
    nexus: 'https://gifts.mbxarts.com/nexuswallet',
    knowledge: 'https://gifts.mbxarts.com/knowledge',
  },
  patria: {
    home: 'https://www.proyectopatria.org',
    about: 'https://www.proyectopatria.org/about',
    blog: 'https://www.proyectopatria.org/blog',
    contact: 'https://www.proyectopatria.org/contacto',
    collaborate: 'https://www.proyectopatria.org/colaboradores',
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getServiceUrl(service: keyof typeof SERVICES, internal = false): string {
  const config = SERVICES[service];
  return internal ? config.internalUrl : config.url;
}

export function buildApiUrl(
  service: keyof typeof SERVICES,
  path: string,
  internal = false
): string {
  const baseUrl = getServiceUrl(service, internal);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${API_BASE_PATH}${cleanPath}`;
}

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return CHAINS[chainId];
}

export function getBlockExplorerUrl(chainId: number, hash: string, type: 'tx' | 'address' = 'tx'): string {
  const chain = CHAINS[chainId];
  if (!chain) return '';
  return `${chain.blockExplorer}/${type}/${hash}`;
}
