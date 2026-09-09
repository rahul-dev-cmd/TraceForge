import { InvestigationCase } from '../types/investigation';
import { WalletEntity } from '../types/wallet';
import { TransactionEntity } from '../types/transaction';
import { SuspiciousPattern, RiskScoreBreakdown } from '../types/risk';
import { EvidenceItem } from '../types/evidence';
import { investigationService } from './investigationService';
import { blockchainService } from './blockchainService';
import { riskService } from './riskService';

export interface ForensicReportPayload {
  reportId: string;
  generatedAt: string;
  caseData: InvestigationCase;
  wallets: WalletEntity[];
  transactions: TransactionEntity[];
  riskBreakdown: RiskScoreBreakdown;
  patterns: SuspiciousPattern[];
  evidence: EvidenceItem[];
  conclusions: string[];
  disclaimer: string;
}

export const reportService = {
  async generateForensicReport(caseId: string): Promise<ForensicReportPayload | null> {
    const caseData = await investigationService.getCaseById(caseId);
    if (!caseData) return null;

    const [wallets, transactions, riskBreakdown, patterns, evidence] = await Promise.all([
      blockchainService.getWallets(),
      blockchainService.getTransactions({ caseId }),
      riskService.getRiskScoreBreakdown(),
      riskService.getSuspiciousPatterns(),
      investigationService.getEvidenceByCase(caseId),
    ]);

    return {
      reportId: `CT-REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      caseData,
      wallets: wallets.slice(0, 8),
      transactions,
      riskBreakdown,
      patterns,
      evidence,
      conclusions: [
        'Deterministic on-chain forensics trace initial extortion proceeds through CoinJoin privacy pools into THORChain decentralized liquidity router.',
        'Downstream transfer into offshore centralized exchange account designated by deposit sub-address 0x82A4...91F confirmed.',
        'Urgent mutual legal assistance (MLAT) request recommended to freeze $2.4M USDT remaining within offshore custodian control.',
        'All findings substantiated by cryptographic transaction hashes and verifiable blockchain state proofs.'
      ],
      disclaimer: 'This technical report compiles empirical on-chain heuristics and investigative artifacts. Analytical risk scores represent algorithmic anomaly indicators and do not constitute a legal determination of guilt without corroborating law-enforcement evidence.'
    };
  }
};
