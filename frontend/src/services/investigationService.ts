import { InvestigationCase, CaseStatus, CaseTimelineItem } from '../types/investigation';
import { EvidenceItem } from '../types/evidence';
import { mockInvestigations } from '../data/mockInvestigations';
import { mockEvidence } from '../data/mockEvidence';

let currentInvestigations = [...mockInvestigations];
let currentEvidence = [...mockEvidence];

export const investigationService = {
  async getCases(): Promise<InvestigationCase[]> {
    await delay(100);
    return [...currentInvestigations];
  },

  async getCaseById(id: string): Promise<InvestigationCase | undefined> {
    await delay(80);
    return currentInvestigations.find(c => c.id === id || c.caseNumber.toLowerCase() === id.toLowerCase());
  },

  async updateCaseStatus(id: string, status: CaseStatus): Promise<InvestigationCase | undefined> {
    await delay(100);
    const index = currentInvestigations.findIndex(c => c.id === id);
    if (index !== -1) {
      currentInvestigations[index] = {
        ...currentInvestigations[index],
        status,
        lastActive: 'Just now',
      };
      return currentInvestigations[index];
    }
    return undefined;
  },

  async addTimelineItem(caseId: string, item: Omit<CaseTimelineItem, 'id'>): Promise<CaseTimelineItem | undefined> {
    await delay(100);
    const targetCase = currentInvestigations.find(c => c.id === caseId);
    if (targetCase) {
      const newItem: CaseTimelineItem = {
        id: `tl-${Date.now()}`,
        ...item,
      };
      targetCase.timeline = [newItem, ...targetCase.timeline];
      targetCase.lastActive = 'Just now';
      return newItem;
    }
    return undefined;
  },

  async getEvidenceByCase(caseId: string): Promise<EvidenceItem[]> {
    await delay(80);
    return currentEvidence.filter(e => e.caseId === caseId);
  },

  async getAllEvidence(): Promise<EvidenceItem[]> {
    await delay(100);
    return [...currentEvidence];
  },

  async addEvidence(item: Omit<EvidenceItem, 'id' | 'timestamp'>): Promise<EvidenceItem> {
    await delay(120);
    const newEvidence: EvidenceItem = {
      id: `EVID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      ...item,
    };
    currentEvidence = [newEvidence, ...currentEvidence];
    return newEvidence;
  },

  async createCase(newCase: Partial<InvestigationCase>): Promise<InvestigationCase> {
    await delay(150);
    const created: InvestigationCase = {
      id: `case-${Date.now()}`,
      caseNumber: `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newCase.title || 'Untitled Case',
      category: newCase.category || 'Ransomware',
      primaryAsset: newCase.primaryAsset || 'BTC',
      estimatedLossCrypto: newCase.estimatedLossCrypto || '0.00 BTC',
      estimatedLossFiat: newCase.estimatedLossFiat || '₹0',
      riskLevel: newCase.riskLevel || 'MEDIUM',
      status: 'NEW',
      leadInvestigator: newCase.leadInvestigator || {
        name: 'Insp. Vikram Rathore',
        badge: 'CYBER-SOC-941',
        unit: 'Financial Cybercrime Unit',
      },
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      lastActive: 'Just now',
      summary: newCase.summary || 'New investigation initiated.',
      rootWalletAddress: newCase.rootWalletAddress || '',
      victimWalletAddress: newCase.victimWalletAddress,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          title: 'Investigation Initiated',
          description: 'Case created in ChainTrace forensic platform.',
          stage: 'REPORT',
          status: 'COMPLETED',
          highlight: true,
        }
      ],
      walletCount: 1,
      transactionCount: 0,
      evidenceCount: 0,
    };

    currentInvestigations = [created, ...currentInvestigations];
    return created;
  }
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
