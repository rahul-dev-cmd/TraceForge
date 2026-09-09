export type EvidenceType = 
  | 'Transaction'
  | 'Wallet'
  | 'Screenshot'
  | 'Document'
  | 'Exchange Record'
  | 'IP Record'
  | 'Investigator Note';

export type ChainOfCustodyStatus = 'VERIFIED' | 'ACQUIRED' | 'SEALED' | 'ARCHIVED';

export interface EvidenceItem {
  id: string; // e.g. "EVID-2026-0091"
  caseId: string;
  type: EvidenceType;
  title: string;
  description: string;
  source: string; // e.g. "On-chain Mempool Node", "Simulated Exchange API", "Victim Incident Response Team"
  timestamp: string;
  hashOrReference: string;
  investigator: string;
  chainOfCustodyStatus: ChainOfCustodyStatus;
  tags: string[];
  isSimulated?: boolean;
  metadata?: Record<string, string | number | boolean>;
}
