export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type CaseStatus = 'NEW' | 'ACTIVE' | 'UNDER_REVIEW' | 'ESCALATED' | 'CLOSED';

export interface CaseTimelineItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  stage: 'REPORT' | 'IDENTIFICATION' | 'TRACING' | 'CLUSTER' | 'MIXER' | 'CROSS_CHAIN' | 'EXCHANGE' | 'RECOVERY';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  highlight?: boolean;
}

export interface InvestigationCase {
  id: string;
  caseNumber: string; // e.g. "CASE-2026-0142"
  title: string;
  category: 'Ransomware' | 'Pig Butchering' | 'Ponzi Scheme' | 'Darknet Market' | 'DeFi Exploit' | 'Terrorist Financing';
  primaryAsset: string; // BTC, USDT, ETH, etc.
  estimatedLossCrypto: string; // "320.5 BTC"
  estimatedLossFiat: string; // "₹20.4 Cr" ($24.5M)
  riskLevel: RiskLevel;
  status: CaseStatus;
  leadInvestigator: {
    name: string;
    badge: string;
    unit: string;
  };
  createdAt: string;
  lastActive: string;
  summary: string;
  rootWalletAddress: string;
  victimWalletAddress?: string;
  timeline: CaseTimelineItem[];
  walletCount: number;
  transactionCount: number;
  evidenceCount: number;
  recoveredAmountFiat?: string;
}
