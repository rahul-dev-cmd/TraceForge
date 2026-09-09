import { RiskLevel } from './investigation';

export interface WalletCluster {
  id: string; // e.g. "CLUSTER-CYBER-88"
  name: string; // e.g. "Suspected Healthcare Ransomware Syndicate (BlackCat Affiliate)"
  threatGroup?: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidenceScore: number; // e.g. 89% ("Cluster confidence")
  confidenceLevel: 'High' | 'Medium' | 'Probable';
  estimatedTotalValueCrypto: string; // "540.8 BTC"
  estimatedTotalValueFiat: string; // "$35,200,000"
  memberWallets: string[]; // wallet addresses
  commonPatterns: string[];
  sharedCounterparties: string[];
  firstSeen: string;
  lastActive: string;
  notes: string;
}
