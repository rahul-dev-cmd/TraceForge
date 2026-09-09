import { BlockchainNetwork, EntityClassification } from './wallet';
import { RiskLevel } from './investigation';

export type DetectionFlagType = 
  | 'Rapid fund movement'
  | 'Multiple-hop transfer'
  | 'Structuring pattern'
  | 'Mixer interaction'
  | 'Cross-chain movement'
  | 'Exchange deposit'
  | 'Newly created wallet'
  | 'Round-amount transfer'
  | 'High-velocity peeling'
  | 'Sanctions exposure';

export interface DetectionFlag {
  id: string;
  type: DetectionFlagType;
  description: string;
  severity: RiskLevel;
}

export interface TransactionEntity {
  hash: string;
  fromAddress: string;
  toAddress: string;
  fromLabel?: string;
  toLabel?: string;
  fromClassification: EntityClassification;
  toClassification: EntityClassification;
  amountCrypto: string;
  amountFiatUsd: string;
  asset: string; // BTC, ETH, USDT, XMR, MATIC
  timestamp: string;
  blockNumber: number;
  gasFeeCrypto?: string;
  network: BlockchainNetwork;
  status: 'CONFIRMED' | 'UNCONFIRMED' | 'DROPPED';
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  detectionFlags: DetectionFlag[];
  caseId?: string;
  hopIndex?: number;
}
