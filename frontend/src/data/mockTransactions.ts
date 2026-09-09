import { TransactionEntity } from '../types/transaction';

export const mockTransactions: TransactionEntity[] = [
  // 1. Crime Scene -> Extortion Wallet (Ransom payment)
  {
    hash: '4a5e1e8ba6c92d3f4b5a7c8e9d0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    fromAddress: 'bc1qvictimhospital001a9b8c7d6e5f4g3h2j1k0l9m',
    toAddress: 'bc1q9x7y4z2w8u1v0k5a3b7c9d1e3f5g7h9j2k4l6m',
    fromLabel: 'Victim — Mumbai Healthcare Treasury',
    toLabel: 'Primary Ransomware Extortion Collector',
    fromClassification: 'Victim Wallet',
    toClassification: 'Suspect Wallet',
    amountCrypto: '320.50 BTC',
    amountFiatUsd: '$20,930,000',
    asset: 'BTC',
    timestamp: '2026-08-14 09:42 UTC',
    blockNumber: 857410,
    gasFeeCrypto: '0.00042 BTC',
    network: 'Bitcoin',
    status: 'CONFIRMED',
    riskScore: 98,
    riskLevel: 'CRITICAL',
    caseId: 'case-2026-0142',
    hopIndex: 1,
    detectionFlags: [
      {
        id: 'df-1',
        type: 'Sanctions exposure',
        description: 'Direct transaction into suspected BlackCat/ALPHV ransomware cluster extortion address.',
        severity: 'CRITICAL',
      },
      {
        id: 'df-2',
        type: 'Round-amount transfer',
        description: 'High-value singular ransom settlement corresponding to extortion demand notice.',
        severity: 'HIGH',
      }
    ]
  },

  // 2. Suspect Wallet -> Intermediate Mule Alpha (Layering Split 1)
  {
    hash: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
    fromAddress: 'bc1q9x7y4z2w8u1v0k5a3b7c9d1e3f5g7h9j2k4l6m',
    toAddress: 'bc1qinterm111mule9876543210abcdef9876543210',
    fromLabel: 'Primary Ransomware Extortion Collector',
    toLabel: 'Intermediate Peeling Node Alpha',
    fromClassification: 'Suspect Wallet',
    toClassification: 'Intermediate Wallet',
    amountCrypto: '180.00 BTC',
    amountFiatUsd: '$11,750,000',
    asset: 'BTC',
    timestamp: '2026-08-14 11:05 UTC',
    blockNumber: 857419,
    gasFeeCrypto: '0.00015 BTC',
    network: 'Bitcoin',
    status: 'CONFIRMED',
    riskScore: 94,
    riskLevel: 'CRITICAL',
    caseId: 'case-2026-0142',
    hopIndex: 2,
    detectionFlags: [
      {
        id: 'df-3',
        type: 'Rapid fund movement',
        description: 'Transferred 180 BTC within 83 minutes of ransom receipt (High-velocity peeling).',
        severity: 'HIGH',
      },
      {
        id: 'df-4',
        type: 'Structuring pattern',
        description: 'Fund division into multiple sub-addresses to prevent singular mempool tracking.',
        severity: 'HIGH',
      }
    ]
  },

  // 3. Suspect Wallet -> Intermediate Mule Beta (Layering Split 2)
  {
    hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    fromAddress: 'bc1q9x7y4z2w8u1v0k5a3b7c9d1e3f5g7h9j2k4l6m',
    toAddress: 'bc1qinterm222mule1234567890fedcba1234567890',
    fromLabel: 'Primary Ransomware Extortion Collector',
    toLabel: 'Intermediate Peeling Node Beta',
    fromClassification: 'Suspect Wallet',
    toClassification: 'Intermediate Wallet',
    amountCrypto: '140.46 BTC',
    amountFiatUsd: '$9,170,000',
    asset: 'BTC',
    timestamp: '2026-08-14 11:15 UTC',
    blockNumber: 857420,
    gasFeeCrypto: '0.00014 BTC',
    network: 'Bitcoin',
    status: 'CONFIRMED',
    riskScore: 89,
    riskLevel: 'HIGH',
    caseId: 'case-2026-0142',
    hopIndex: 2,
    detectionFlags: [
      {
        id: 'df-5',
        type: 'Multiple-hop transfer',
        description: 'Second branch of split transaction graph created in parallel sequence.',
        severity: 'MEDIUM',
      }
    ]
  },

  // 4. Intermediate Mule Alpha -> Wasabi / CoinJoin Mixer Pool
  {
    hash: '3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    fromAddress: 'bc1qinterm111mule9876543210abcdef9876543210',
    toAddress: 'bc1qmixerwasabipool9999988888777776666655555',
    fromLabel: 'Intermediate Peeling Node Alpha',
    toLabel: 'CoinJoin / Wasabi Privacy Mixing Pool',
    fromClassification: 'Intermediate Wallet',
    toClassification: 'Mixer',
    amountCrypto: '145.00 BTC',
    amountFiatUsd: '$9,470,000',
    asset: 'BTC',
    timestamp: '2026-08-15 02:40 UTC',
    blockNumber: 857508,
    gasFeeCrypto: '0.00065 BTC',
    network: 'Bitcoin',
    status: 'CONFIRMED',
    riskScore: 99,
    riskLevel: 'CRITICAL',
    caseId: 'case-2026-0142',
    hopIndex: 3,
    detectionFlags: [
      {
        id: 'df-6',
        type: 'Mixer interaction',
        description: 'Fund ingress into CoinJoin non-custodial UTXO privacy pool coordinator.',
        severity: 'CRITICAL',
      },
      {
        id: 'df-7',
        type: 'High-velocity peeling',
        description: 'Obfuscation technique designed to break deterministic graph clustering.',
        severity: 'HIGH',
      }
    ]
  },

  // 5. CoinJoin Mixer Output -> Post-Mixer Dispersal
  {
    hash: '7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    fromAddress: 'bc1qmixerwasabipool9999988888777776666655555',
    toAddress: 'bc1qpostmixerout4444433333222221111100000',
    fromLabel: 'CoinJoin / Wasabi Privacy Mixing Pool',
    toLabel: 'Post-Mixer Dispersal Address',
    fromClassification: 'Mixer',
    toClassification: 'Intermediate Wallet',
    amountCrypto: '144.80 BTC',
    amountFiatUsd: '$9,455,000',
    asset: 'BTC',
    timestamp: '2026-08-15 06:10 UTC',
    blockNumber: 857530,
    gasFeeCrypto: '0.00030 BTC',
    network: 'Bitcoin',
    status: 'CONFIRMED',
    riskScore: 92,
    riskLevel: 'CRITICAL',
    caseId: 'case-2026-0142',
    hopIndex: 4,
    detectionFlags: [
      {
        id: 'df-8',
        type: 'Mixer interaction',
        description: 'Re-aggregated output with 0.20 BTC coordinator fee deducted.',
        severity: 'HIGH',
      }
    ]
  },

  // 6. Post-Mixer Dispersal -> THORChain Vault Ingress (Bridge)
  {
    hash: 'bb22cc33dd44ee55ff66aa77889900112233445566778899aabbccddeeff0011',
    fromAddress: 'bc1qpostmixerout4444433333222221111100000',
    toAddress: 'bc1qthorchainvaultliquidity00000000000000000',
    fromLabel: 'Post-Mixer Dispersal Address',
    toLabel: 'THORChain Cross-Chain Asgard Vault (BTC)',
    fromClassification: 'Intermediate Wallet',
    toClassification: 'Cross-chain Bridge',
    amountCrypto: '90.00 BTC',
    amountFiatUsd: '$5,880,000',
    asset: 'BTC',
    timestamp: '2026-08-15 18:15 UTC',
    blockNumber: 857602,
    gasFeeCrypto: '0.00021 BTC',
    network: 'Bitcoin',
    status: 'CONFIRMED',
    riskScore: 95,
    riskLevel: 'CRITICAL',
    caseId: 'case-2026-0142',
    hopIndex: 5,
    detectionFlags: [
      {
        id: 'df-9',
        type: 'Cross-chain movement',
        description: 'Native cross-chain swap initiating Bitcoin UTXO to Ethereum ERC-20 USDT bridge transaction.',
        severity: 'CRITICAL',
      }
    ]
  },

  // 7. THORChain Protocol Ingress -> Bridged Suspect Ethereum Wallet
  {
    hash: '0xaa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff00',
    fromAddress: '0x3882BridgeRouterEthThorchainProtocol00001',
    toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    fromLabel: 'THORChain Ethereum Pool Ingress',
    toLabel: 'Bridged Suspect Ethereum Wallet',
    fromClassification: 'Cross-chain Bridge',
    toClassification: 'Suspect Wallet',
    amountCrypto: '5,820,000 USDT',
    amountFiatUsd: '$5,820,000',
    asset: 'USDT',
    timestamp: '2026-08-15 18:25 UTC',
    blockNumber: 20541982,
    gasFeeCrypto: '0.0035 ETH',
    network: 'Ethereum',
    status: 'CONFIRMED',
    riskScore: 93,
    riskLevel: 'CRITICAL',
    caseId: 'case-2026-0142',
    hopIndex: 6,
    detectionFlags: [
      {
        id: 'df-10',
        type: 'Cross-chain movement',
        description: 'Synthesized synthetic/wrapped asset release on Ethereum network.',
        severity: 'HIGH',
      },
      {
        id: 'df-11',
        type: 'Newly created wallet',
        description: 'Destination wallet had 0 prior transaction history before bridge receipt.',
        severity: 'MEDIUM',
      }
    ]
  },

  // 8. Bridged Suspect Ethereum Wallet -> Offshore Exchange Deposit Address
  {
    hash: '0x8899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677',
    fromAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    toAddress: '0x82A49e9841fE6C3886bC5A039439c2c62391991F',
    fromLabel: 'Bridged Suspect Ethereum Wallet',
    toLabel: 'Simulated Exchange Deposit Address (Acct #98412)',
    fromClassification: 'Suspect Wallet',
    toClassification: 'Exchange Deposit',
    amountCrypto: '5,800,000 USDT',
    amountFiatUsd: '$5,800,000',
    asset: 'USDT',
    timestamp: '2026-08-16 08:30 UTC',
    blockNumber: 20545910,
    gasFeeCrypto: '0.0028 ETH',
    network: 'Ethereum',
    status: 'CONFIRMED',
    riskScore: 96,
    riskLevel: 'CRITICAL',
    caseId: 'case-2026-0142',
    hopIndex: 7,
    detectionFlags: [
      {
        id: 'df-12',
        type: 'Exchange deposit',
        description: 'High-value deposit into VASP endpoint subject to KYC identification requirements.',
        severity: 'CRITICAL',
      },
      {
        id: 'df-13',
        type: 'Rapid fund movement',
        description: 'Transfer completed within 14 hours of cross-chain minting.',
        severity: 'HIGH',
      }
    ]
  },

  // 9. Exchange Deposit -> Exchange Consolidated Omnibus Hot Wallet
  {
    hash: '0x44556677889900112233445566778899aabbccddeeff00112233445566778899',
    fromAddress: '0x82A49e9841fE6C3886bC5A039439c2c62391991F',
    toAddress: '0x28C6c06298d514Db089934071355E5743bf21d60',
    fromLabel: 'Simulated Exchange Deposit Address (Acct #98412)',
    toLabel: 'Exchange Hot Wallet (ApexGlobal Consolidation)',
    fromClassification: 'Exchange Deposit',
    toClassification: 'Exchange Hot Wallet',
    amountCrypto: '5,800,000 USDT',
    amountFiatUsd: '$5,800,000',
    asset: 'USDT',
    timestamp: '2026-08-16 08:35 UTC',
    blockNumber: 20545915,
    gasFeeCrypto: '0.0019 ETH',
    network: 'Ethereum',
    status: 'CONFIRMED',
    riskScore: 60,
    riskLevel: 'MEDIUM',
    caseId: 'case-2026-0142',
    hopIndex: 8,
    detectionFlags: [
      {
        id: 'df-14',
        type: 'Exchange deposit',
        description: 'Internal exchange sweep from user deposit sub-address into master liquidity pool.',
        severity: 'INFO',
      }
    ]
  },

  // 10. Secondary Cashout Flow -> Suspected OTC Hawala Desk
  {
    hash: '0x77889900112233445566778899aabbccddeeff00112233445566778899aabbcc',
    fromAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    toAddress: '0x91F729ab83Cde4982390483a9123019842F90812',
    fromLabel: 'Bridged Suspect Ethereum Wallet',
    toLabel: 'Suspected OTC Cash-Out Broker',
    fromClassification: 'Suspect Wallet',
    toClassification: 'Cash-out Service',
    amountCrypto: '20,000 USDT',
    amountFiatUsd: '$20,000',
    asset: 'USDT',
    timestamp: '2026-08-16 14:20 UTC',
    blockNumber: 20547610,
    gasFeeCrypto: '0.0022 ETH',
    network: 'Ethereum',
    status: 'CONFIRMED',
    riskScore: 88,
    riskLevel: 'HIGH',
    caseId: 'case-2026-0142',
    detectionFlags: [
      {
        id: 'df-15',
        type: 'Structuring pattern',
        description: 'Small test transaction preceding P2P/OTC fiat settlement.',
        severity: 'HIGH',
      }
    ]
  }
];
