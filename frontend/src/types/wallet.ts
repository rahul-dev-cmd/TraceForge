import { RiskLevel } from './investigation';

export type BlockchainNetwork = 'Bitcoin' | 'Ethereum' | 'Monero' | 'Polygon' | 'BNB Chain' | 'Arbitrum' | 'Solana';

export type EntityClassification = 
  | 'Victim Wallet'
  | 'Suspect Wallet'
  | 'Intermediate Wallet'
  | 'Mixer'
  | 'Cross-chain Bridge'
  | 'Exchange Deposit'
  | 'Exchange Hot Wallet'
  | 'Cash-out Service'
  | 'Sanctioned Entity'
  | 'Unknown Wallet';

export interface WalletEntity {
  address: string;
  network: BlockchainNetwork;
  label?: string;
  classification: EntityClassification;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  balanceCrypto: string;
  balanceUsd: string;
  totalReceivedCrypto: string;
  totalSentCrypto: string;
  txCount: number;
  firstSeen: string;
  lastSeen: string;
  clusterId?: string;
  clusterName?: string;
  knownServices?: string[];
  exchangeName?: string;
  tags: string[];
  isSanctioned?: boolean;
  notes?: string;
}
