export interface ReportSectionConfig {
  id: string;
  title: string;
  enabled: boolean;
  required?: boolean;
  description: string;
}

export interface ReportCustomization {
  caseId: string;
  reportTitle: string;
  classificationHeader: 'CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE' | 'RESTRICTED FORENSIC DOSSIER' | 'OFFICIAL COURT EXHIBIT' | 'INTERNAL FIU INTELLIGENCE';
  investigatorName: string;
  badgeNumber: string;
  unit: string;
  includeEvidenceHashes: boolean;
  includeSimulatedDisclaimer: boolean;
  sections: ReportSectionConfig[];
}
