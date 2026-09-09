import { RiskLevel } from './investigation';

export type PatternType = 
  | 'Layering'
  | 'Structuring'
  | 'Smurfing'
  | 'Peel Chain'
  | 'Rapid Movement'
  | 'Mixer Interaction'
  | 'Cross-chain Hopping'
  | 'Exchange Cash-out'
  | 'Dormant Wallet Activation'
  | 'Fan-in'
  | 'Fan-out';

export interface SuspiciousPattern {
  id: string;
  patternType: PatternType;
  title: string;
  description: string;
  severity: RiskLevel;
  confidenceScore: number; // 0 - 100%
  evidenceSummary: string;
  relatedTransactions: string[]; // tx hashes
  relatedWallets: string[]; // wallet addresses
  timestamp: string;
  behaviorSignal: string;
  recommendation: string;
}

export interface RiskFactorItem {
  id: string;
  label: string;
  scoreContribution: number; // e.g. +25
  category: 'Mixer' | 'Velocity' | 'Cross-Chain' | 'VASP' | 'Counterparty' | 'Structuring';
  confidence: number;
  explanation: string;
  supportingTransactions: string[];
  timestamp: string;
}

export interface RiskScoreBreakdown {
  overallScore: number; // 0 - 100
  overallLevel: RiskLevel;
  factors: RiskFactorItem[];
  mixerExposureScore: number; // e.g. 28
  rapidMovementScore: number; // e.g. 20
  crossChainScore: number; // e.g. 15
  structuringScore: number; // e.g. 14
  exchangeInteractionScore: number; // e.g. 10
  disclaimer: string;
}

export interface RiskWeightConfig {
  mixerWeight: number;
  sanctionsWeight: number;
  rapidMovementWeight: number;
  crossChainWeight: number;
  structuringWeight: number;
  suspiciousExchangeWeight: number;
  fanInFanOutWeight: number;
}
