import { WalletCluster } from '../types/cluster';

export const mockClusters: WalletCluster[] = [
  {
    id: 'CLUSTER-CYBER-88',
    name: 'Syndicate-88 (Suspected Healthcare Ransomware Affiliate)',
    threatGroup: 'BlackCat / ALPHV Ransomware Affiliate Tier-1',
    riskScore: 96,
    riskLevel: 'CRITICAL',
    confidenceScore: 89,
    confidenceLevel: 'High',
    estimatedTotalValueCrypto: '540.80 BTC',
    estimatedTotalValueFiat: '$35,200,000',
    memberWallets: [
      'bc1q9x7y4z2w8u1v0k5a3b7c9d1e3f5g7h9j2k4l6m',
      'bc1qinterm111mule9876543210abcdef9876543210',
      'bc1qinterm222mule1234567890fedcba1234567890',
      'bc1qpostmixerout4444433333222221111100000',
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    ],
    commonPatterns: [
      'CoinJoin / Wasabi privacy pool utilization within 18 hours of extortion receipt',
      'THORChain cross-chain swapping into ERC-20 USDT',
      'Repeated peeling chain intervals with 0.04-0.12 BTC change retention',
      'Offshore VASP account deposit behavior in Asia-Pacific timezones'
    ],
    sharedCounterparties: [
      'Wasabi WabiSabi Coordinator v2',
      'THORChain Liquidity Asgard Pool',
      'ApexGlobal Exchange KYC Deposit Sub-accounts'
    ],
    firstSeen: '2025-11-04 14:20 UTC',
    lastActive: '2026-08-16 14:20 UTC',
    notes: 'Probable association based on behavioral similarity and timing correlations. Cluster confidence is high based on deterministic UTXO spend graphs.',
  },
  {
    id: 'CLUSTER-OTC-HAWALA',
    name: 'Offshore P2P / Hawala Cashout Network',
    threatGroup: 'Unlicensed VASP / Dark Settlement Broker',
    riskScore: 92,
    riskLevel: 'CRITICAL',
    confidenceScore: 84,
    confidenceLevel: 'High',
    estimatedTotalValueCrypto: '18,400,000 USDT',
    estimatedTotalValueFiat: '$18,400,000',
    memberWallets: [
      '0x91F729ab83Cde4982390483a9123019842F90812',
      '0x3d7b92f4c1e8a5a92d4b6c8e0f2a4c6e8d0b2a4c'
    ],
    commonPatterns: [
      'High-velocity aggregation of stablecoins from illicit feeds',
      'Rapid distribution into localized merchant cash points',
      'Off-book fiat bank transfers in offshore jurisdictions'
    ],
    sharedCounterparties: [
      'LocalBitcoins/P2P Counterparties',
      'Telegram OTC Escrow bots'
    ],
    firstSeen: '2025-04-12 09:00 UTC',
    lastActive: '2026-08-16 14:20 UTC',
    notes: 'Behavioral clustering indicates unlicensed liquidity provision for ransomware and pig-butchering proceeds.',
  },
  {
    id: 'CLUSTER-MULE-MATIC',
    name: 'Sub-cent Layering Syndicate (Polygon L2)',
    threatGroup: 'L2 Smurfing Network',
    riskScore: 78,
    riskLevel: 'HIGH',
    confidenceScore: 72,
    confidenceLevel: 'Medium',
    estimatedTotalValueCrypto: '1,200,000 POL',
    estimatedTotalValueFiat: '$480,000',
    memberWallets: [
      '0x1837482910481092830198230192830198230198'
    ],
    commonPatterns: [
      'Micro-structuring across 400+ automated transactions',
      'Gas optimization via low-fee L2 rollups'
    ],
    sharedCounterparties: [
      'QuickSwap DEX Liquidity Pools',
      'Hop Protocol Polygon Bridge'
    ],
    firstSeen: '2026-06-10 08:00 UTC',
    lastActive: '2026-08-20 19:15 UTC',
    notes: 'Automated script behavior distributing small amounts to defeat velocity alerts.',
  },
  {
    id: 'CLUSTER-PONZI-ETH',
    name: 'Smart Contract High-Yield Drainers',
    threatGroup: 'DeFi Rugpull Operators',
    riskScore: 86,
    riskLevel: 'HIGH',
    confidenceScore: 81,
    confidenceLevel: 'High',
    estimatedTotalValueCrypto: '1,450.00 ETH',
    estimatedTotalValueFiat: '$4,930,000',
    memberWallets: [
      '0x71c59b2a9e3d8f1c0b4a7d6e5c4b3a2f1e0d9c8b'
    ],
    commonPatterns: [
      'Admin privilege drain functions called without notice',
      'Immediate Uniswap v3 slippage dumps'
    ],
    sharedCounterparties: [
      'Uniswap v3 Router',
      'Tornado Cash 100 ETH Pool'
    ],
    firstSeen: '2026-08-02 11:20 UTC',
    lastActive: '2026-08-02 18:00 UTC',
    notes: 'Smart contract deployer key associated with previous fake yield farming schemes.',
  },
  {
    id: 'CLUSTER-LAZARUS-SANCTIONED',
    name: 'OFAC Sanctioned State-Sponsored Cyber Syndicate',
    threatGroup: 'Lazarus Group Sub-Cluster BlueNoroff',
    riskScore: 100,
    riskLevel: 'CRITICAL',
    confidenceScore: 98,
    confidenceLevel: 'High',
    estimatedTotalValueCrypto: '12,400.00 ETH',
    estimatedTotalValueFiat: '$42,160,000',
    memberWallets: [
      '0x5555SanctionedLazarusAffiliate000000000000'
    ],
    commonPatterns: [
      'Cross-chain hopping through 3+ distinct protocols',
      'Use of Sinbad and Tornado mixing relays',
      'Timelocked withdrawals aligned with East Asian timezones'
    ],
    sharedCounterparties: [
      'Tornado Cash Router',
      'Railgun Privacy Protocol'
    ],
    firstSeen: '2023-08-11 12:00 UTC',
    lastActive: '2026-08-12 10:00 UTC',
    notes: 'Officially sanctioned entity under OFAC Specially Designated Nationals (SDN) registry.',
  }
];
