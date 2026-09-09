import { SuspiciousPattern, RiskScoreBreakdown } from '../types/risk';
import { mockRiskScoreBreakdown, mockSuspiciousPatterns } from '../data/mockRiskEvents';

export const riskService = {
  async getRiskScoreBreakdown(): Promise<RiskScoreBreakdown> {
    await delay(80);
    return { ...mockRiskScoreBreakdown };
  },

  async getSuspiciousPatterns(filterSeverity?: string): Promise<SuspiciousPattern[]> {
    await delay(100);
    if (!filterSeverity || filterSeverity === 'ALL') {
      return [...mockSuspiciousPatterns];
    }
    return mockSuspiciousPatterns.filter(p => p.severity === filterSeverity);
  },

  async getPatternById(id: string): Promise<SuspiciousPattern | undefined> {
    await delay(60);
    return mockSuspiciousPatterns.find(p => p.id === id);
  }
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
