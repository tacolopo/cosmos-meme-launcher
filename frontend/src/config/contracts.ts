// Contract configuration for Cosmos Hub
export const CONTRACTS = {
  // Deployed contract addresses
  MEME_FACTORY: 'cosmos1dm97n7hnztp73ctekf0a8qfnaqlggpz3mvn5c9kjhjfqzu8tl3uq3d2yd6',
  
  // Code IDs for instantiation
  MEME_TOKEN_CODE_ID: 293,
  MEME_FACTORY_CODE_ID: 294,
  
  // Network configuration
  CHAIN_ID: 'cosmoshub-4',
  RPC_ENDPOINT: 'https://cosmos-rpc.publicnode.com:443',
  DENOM: 'uatom',
  
  // Contract checksums (for verification)
  CHECKSUMS: {
    MEME_TOKEN: '82d93ba9c6cbee2c889613b60acb5223927088d422c0815a19186e0092117f1b',
    MEME_FACTORY: '196e8bfe9178c3716e0bd50f0dfc632217f81e5b8c0772d57051480a41211614',
  },
  
  // Transaction hashes (for reference)
  DEPLOY_TXS: {
    MEME_TOKEN_UPLOAD: '79CD837CC184B4DF94404C204D64BAB7599A33D41B81459AE82EC3D1E98FA238',
    MEME_FACTORY_UPLOAD: 'A1E09A7ABA431900F9E9F7E64BCFD45C531805BD7BFF4E577205186DA968F754',
    MEME_FACTORY_INSTANTIATE: '27E72F7303BADBC63BE91439C37F87B0D38B01C7DA4B55F36C3941839E46CCA2',
  },
  
  // Contract parameters
  FACTORY_CONFIG: {
    creation_fee: '100000', // 0.1 ATOM
    platform_fee_bps: 200, // 2%
    min_target_raise: '100000000', // 100 ATOM
    max_target_raise: '10000000000', // 10,000 ATOM
  },
} as const;

// Helper function to format ATOM amounts
export const formatAtom = (amount: string | number): string => {
  const atomAmount = typeof amount === 'string' ? parseInt(amount) : amount;
  return (atomAmount / 1_000_000).toFixed(6);
};

// Helper function to parse ATOM amounts to microatoms
export const parseAtom = (amount: string | number): string => {
  const atomAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.floor(atomAmount * 1_000_000).toString();
};
