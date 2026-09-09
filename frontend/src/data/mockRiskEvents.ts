import { SuspiciousPattern, RiskScoreBreakdown, RiskWeightConfig } from '../types/risk';

export const defaultRiskWeightConfig: RiskWeightConfig = {
  mixerWeight: 30,
  sanctionsWeight: 25,
  rapidMovementWeight: 20,
  crossChainWeight: 15,
  structuringWeight: 15,
  suspiciousExchangeWeight: 20,
  fanInFanOutWeight: 10,
};

export const mockRiskScoreBreakdown: RiskScoreBreakdown = {
  overallScore: 98,
  overallLevel: 'CRITICAL',
  factors: [
    {
      id: 'rf-1',
      label: 'CoinJoin / Wasabi Privacy Pool Routing',
      scoreContribution: 28,
      category: 'Mixer',
      confidence: 98,
      explanation: '145.0 BTC extorted funds routed into Wasabi WabiSabi mixing coordinator to break deterministic address clustering.',
      supportingTransactions: [
        '3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
        '7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'
      ],
      timestamp: '2026-08-15 02:40 UTC'
    },
    {
      id: 'rf-2',
      label: 'High-Velocity Peeling Chain Execution',
      scoreContribution: 20,
      category: 'Velocity',
      confidence: 94,
      explanation: 'Suspect extortion wallet dispersed funds to multiple unhosted addresses in rapid 10-minute succession after receiving ransom.',
      supportingTransactions: [
        '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
        '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
      ],
      timestamp: '2026-08-14 11:05 UTC'
    },
    {
      id: 'rf-3',
      label: 'THORChain Cross-Chain Bridge Swap (BTC → ETH)',
      scoreContribution: 15,
      category: 'Cross-Chain',
      confidence: 96,
      explanation: 'Native cross-chain swap bypassing centralized KYC to convert Bitcoin into 5,820,000 ERC-20 USDT on Ethereum.',
      supportingTransactions: [
        'bb22cc33dd44ee55ff66aa77889900112233445566778899aabbccddeeff0011',
        '0xaa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff00'
      ],
      timestamp: '2026-08-15 18:15 UTC'
    },
    {
      id: 'rf-4',
      label: 'Smurfing & Structuring Partitioning',
      scoreContribution: 14,
      category: 'Structuring',
      confidence: 89,
      explanation: 'Fund division into chunks between 140 BTC and 180 BTC structured under conventional continuous monitoring limits.',
      supportingTransactions: [
        '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e'
      ],
      timestamp: '2026-08-14 11:15 UTC'
    },
    {
      id: 'rf-5',
      label: 'Offshore Exchange Ingress Deposit (ApexGlobal)',
      scoreContribution: 21,
      category: 'VASP',
      confidence: 99,
      explanation: 'Direct deposit into offshore VASP designated account #98412 followed by master hot wallet omnibus sweep.',
      supportingTransactions: [
        '0x8899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677'
      ],
      timestamp: '2026-08-16 08:30 UTC'
    }
  ],
  mixerExposureScore: 28,
  rapidMovementScore: 20,
  crossChainScore: 15,
  structuringScore: 14,
  exchangeInteractionScore: 21,
  disclaimer: 'Analytical Risk Score is computed from heuristic graph signals, public blockchain state, and behavioral telemetry. It is intended solely for forensic triage and does not constitute a legal determination of guilt without corroborating law-enforcement evidence.'
};

export const mockSuspiciousPatterns: SuspiciousPattern[] = [
  {
    id: 'PAT-001',
    patternType: 'Mixer Interaction',
    title: 'CoinJoin / Wasabi Privacy Pool Routing',
    description: '145.0 BTC extorted from Mumbai Healthcare entered a CoinJoin mixing pool, designed to break deterministic graph clustering between sender and recipient addresses.',
    severity: 'CRITICAL',
    confidenceScore: 98,
    evidenceSummary: 'Direct UTXO transaction into Wasabi WabiSabi coordinator pool with 100+ equal denomination output addresses.',
    relatedTransactions: [
      '3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
      '7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'
    ],
    relatedWallets: [
      'bc1qinterm111mule9876543210abcdef9876543210',
      'bc1qmixerwasabipool9999988888777776666655555',
      'bc1qpostmixerout4444433333222221111100000'
    ],
    timestamp: '2026-08-15 02:40 UTC',
    behaviorSignal: 'Anonymization layer deployed after ransom receipt',
    recommendation: 'Correlate timing analysis and amount parity between mixer input and post-mixer output pools.',
  },
  {
    id: 'PAT-002',
    patternType: 'Cross-chain Hopping',
    title: 'THORChain Cross-Chain Bridge Swap (BTC → ETH USDT)',
    description: 'Illicit proceeds hopped across blockchain protocols from Bitcoin UTXO network to Ethereum ERC-20 stablecoins, bypassing centralized VASP KYC verification.',
    severity: 'CRITICAL',
    confidenceScore: 94,
    evidenceSummary: '90.0 BTC sent to THORChain Asgard Vault, triggering 5,820,000 USDT synthesis and release to Ethereum wallet 0x742d...44e within 10 minutes.',
    relatedTransactions: [
      'bb22cc33dd44ee55ff66aa77889900112233445566778899aabbccddeeff0011',
      '0xaa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff00'
    ],
    relatedWallets: [
      'bc1qpostmixerout4444433333222221111100000',
      'bc1qthorchainvaultliquidity00000000000000000',
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    ],
    timestamp: '2026-08-15 18:15 UTC',
    behaviorSignal: 'Interoperability bridge exploited for forensic trail obfuscation',
    recommendation: 'Track Ethereum recipient address for downstream exchange deposit endpoints.',
  },
  {
    id: 'PAT-003',
    patternType: 'Peel Chain',
    title: 'Automated Peel Chain with Residual Change Retention',
    description: 'Suspect extortion wallet executed classical peeling chain transferring substantial sums forward while leaving micro-change amounts (0.04-0.12 BTC) behind.',
    severity: 'HIGH',
    confidenceScore: 93,
    evidenceSummary: 'Sequential block spending retaining consistent change outputs characteristic of automated laundering scripts.',
    relatedTransactions: [
      '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
      '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
    ],
    relatedWallets: [
      'bc1q9x7y4z2w8u1v0k5a3b7c9d1e3f5g7h9j2k4l6m',
      'bc1qinterm111mule9876543210abcdef9876543210',
      'bc1qinterm222mule1234567890fedcba1234567890'
    ],
    timestamp: '2026-08-14 11:05 UTC',
    behaviorSignal: 'Deterministic peel chain signature',
    recommendation: 'Apply co-spending clustering heuristics on peeling change outputs to expand suspect wallet cluster.',
  },
  {
    id: 'PAT-004',
    patternType: 'Rapid Movement',
    title: 'High-Velocity Fund Movement Post-Exploit',
    description: '320.50 BTC moved through 3 distinct intermediate unhosted wallets within 83 minutes of initial extortion receipt.',
    severity: 'HIGH',
    confidenceScore: 91,
    evidenceSummary: 'Consecutive block confirmations without customary resting period.',
    relatedTransactions: [
      '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e'
    ],
    relatedWallets: [
      'bc1q9x7y4z2w8u1v0k5a3b7c9d1e3f5g7h9j2k4l6m',
      'bc1qinterm111mule9876543210abcdef9876543210'
    ],
    timestamp: '2026-08-14 11:05 UTC',
    behaviorSignal: 'Panic dispersal / scripted rapid exfiltration',
    recommendation: 'Identify candidate receiving pools ahead of mempool confirmation.',
  },
  {
    id: 'PAT-005',
    patternType: 'Structuring',
    title: 'Threshold Avoidance Structuring & Smurfing',
    description: 'Ransom payment partitioned into quantities under typical reporting and transaction monitoring thresholds prior to secondary distribution.',
    severity: 'HIGH',
    confidenceScore: 86,
    evidenceSummary: 'Multiple transfers structured between 140 BTC and 180 BTC rather than single lump sum.',
    relatedTransactions: [
      '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e'
    ],
    relatedWallets: [
      'bc1qinterm111mule9876543210abcdef9876543210',
      'bc1qinterm222mule1234567890fedcba1234567890'
    ],
    timestamp: '2026-08-14 11:15 UTC',
    behaviorSignal: 'Smurfing behavior across unhosted intermediary nodes',
    recommendation: 'Monitor related destination clusters for aggregation signatures.',
  },
  {
    id: 'PAT-006',
    patternType: 'Exchange Cash-out',
    title: 'Offshore Exchange Ingress Deposit (5.8M USDT)',
    description: '5,800,000 USDT bridged from ransomware BTC proceeds deposited into offshore centralized exchange account (Deposit tag #98412).',
    severity: 'CRITICAL',
    confidenceScore: 99,
    evidenceSummary: 'Direct transfer to known ApexGlobal omnibus deposit sub-address; subsequent internal consolidation detected.',
    relatedTransactions: [
      '0x8899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677',
      '0x44556677889900112233445566778899aabbccddeeff00112233445566778899'
    ],
    relatedWallets: [
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      '0x82A49e9841fE6C3886bC5A039439c2c62391991F',
      '0x28C6c06298d514Db089934071355E5743bf21d60'
    ],
    timestamp: '2026-08-16 08:30 UTC',
    behaviorSignal: 'Cashout liquidation attempt at custodial VASP',
    recommendation: 'Transmit urgent preservation notice and mutual legal assistance request (MLAT) to exchange compliance officer.',
  },
  {
    id: 'PAT-007',
    patternType: 'Fan-in',
    title: 'Multi-Victim Consolidation Fan-In (Pig-Butchering)',
    description: 'Aggregation of funds from 4 distinct high-net-worth victim wallets into single mule collection node 0x3d7b...',
    severity: 'HIGH',
    confidenceScore: 92,
    evidenceSummary: 'Converging inbound transactions within 24-hour window.',
    relatedTransactions: [],
    relatedWallets: [
      '0x3d7b92f4c1e8a5a92d4b6c8e0f2a4c6e8d0b2a4c',
      '0x999victimindore0192837465abcedf10293847'
    ],
    timestamp: '2026-08-11 09:00 UTC',
    behaviorSignal: 'Fan-in collector aggregation',
    recommendation: 'Freeze outgoing counterparty addresses prior to OTC disbursement.',
  },
  {
    id: 'PAT-008',
    patternType: 'Dormant Wallet Activation',
    title: 'Sudden Activation of 3-Year Dormant Cold Address',
    description: 'Address with 0 transaction activity since 2023 suddenly received and forwarded 482 ETH.',
    severity: 'MEDIUM',
    confidenceScore: 84,
    evidenceSummary: 'Time elapsed between prior activity and current transaction exceeds 1,000 days.',
    relatedTransactions: [],
    relatedWallets: [
      '0x5555SanctionedLazarusAffiliate000000000000'
    ],
    timestamp: '2026-08-12 10:00 UTC',
    behaviorSignal: 'Dormant address reactivation',
    recommendation: 'Cross-reference historical co-signers and initial funding txs.',
  },
  {
    id: 'PAT-009',
    patternType: 'Fan-out',
    title: 'Dispersal Fan-Out to Sub-Cent Layering Network',
    description: 'One intermediate node distributing tokens across 420 micro-accounts on Polygon L2.',
    severity: 'MEDIUM',
    confidenceScore: 78,
    evidenceSummary: 'Automated script dispatching identical gas-optimized transactions.',
    relatedTransactions: [],
    relatedWallets: [
      '0x1837482910481092830198230192830198230198'
    ],
    timestamp: '2026-08-20 19:15 UTC',
    behaviorSignal: 'Fan-out smurfing across L2 rollup',
    recommendation: 'Monitor bridge exit gateways back to L1 settlement.',
  }
];
