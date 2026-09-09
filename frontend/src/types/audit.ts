export type UserRole = 'Investigator' | 'Senior Investigator' | 'Administrator' | 'Analyst';

export interface UserProfile {
  id: string;
  name: string;
  badge: string;
  unit: string;
  role: UserRole;
  email: string;
  avatarInitials: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  badge: string;
  action: 'LOGIN' | 'CASE_CREATED' | 'CASE_UPDATED' | 'WALLET_INVESTIGATED' | 'EVIDENCE_UPLOADED' | 'EVIDENCE_SEALED' | 'REPORT_GENERATED' | 'ALERT_TRIAGED' | 'RISK_CONFIG_MODIFIED' | 'EXPORT_EXECUTED';
  targetObject: string;
  caseId?: string;
  ipAddress: string;
  result: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}
