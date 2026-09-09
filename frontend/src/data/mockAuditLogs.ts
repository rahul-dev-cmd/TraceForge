import { AuditLogEntry } from '../types/audit';

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'AUD-9401',
    timestamp: '2026-08-22 06:12:45 UTC',
    user: 'Insp. Vikram Rathore',
    badge: 'CYBER-SOC-941',
    action: 'CASE_UPDATED',
    targetObject: 'CASE-2026-0142 (Mumbai Healthcare)',
    caseId: 'case-2026-0142',
    ipAddress: '10.240.12.91 (SOC Workstation #4)',
    result: 'SUCCESS',
    details: 'Updated case recovery status: Added Mutual Legal Assistance Treaty freeze confirmation on 5.8M USDT at ApexGlobal exchange.'
  },
  {
    id: 'AUD-9402',
    timestamp: '2026-08-22 05:40:12 UTC',
    user: 'Senior Analyst Maya Sen',
    badge: 'CYBER-FIU-412',
    action: 'EVIDENCE_SEALED',
    targetObject: 'EVID-2026-0091 (Ransom Transaction Proof)',
    caseId: 'case-2026-0142',
    ipAddress: '10.240.12.104 (FIU Terminal #2)',
    result: 'SUCCESS',
    details: 'Cryptographic SHA-256 integrity seal verified and locked into tamper-evident chain of custody ledger.'
  },
  {
    id: 'AUD-9403',
    timestamp: '2026-08-22 04:15:30 UTC',
    user: 'Insp. Vikram Rathore',
    badge: 'CYBER-SOC-941',
    action: 'WALLET_INVESTIGATED',
    targetObject: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    caseId: 'case-2026-0142',
    ipAddress: '10.240.12.91 (SOC Workstation #4)',
    result: 'SUCCESS',
    details: 'Automated reverse hop tracer executed from ETH recipient node to THORChain bridge contract.'
  },
  {
    id: 'AUD-9404',
    timestamp: '2026-08-21 22:50:00 UTC',
    user: 'Agent R. Deshmukh',
    badge: 'CYBER-INV-118',
    action: 'REPORT_GENERATED',
    targetObject: 'REP-2026-0142-FINANCIAL-DOSSIER',
    caseId: 'case-2026-0142',
    ipAddress: '10.240.14.22 (Investigative Lab)',
    result: 'SUCCESS',
    details: 'Exported official 18-section forensic report to Court-Ready Exhibit PDF format.'
  },
  {
    id: 'AUD-9405',
    timestamp: '2026-08-21 19:10:15 UTC',
    user: 'Administrator Admin-Root',
    badge: 'SOC-SYS-001',
    action: 'RISK_CONFIG_MODIFIED',
    targetObject: 'Risk Scoring Engine v2.4',
    ipAddress: '10.240.1.1 (Admin Console)',
    result: 'SUCCESS',
    details: 'Adjusted heuristic weights: Mixer exposure factor set to +28%, Cross-chain bridging set to +15%.'
  },
  {
    id: 'AUD-9406',
    timestamp: '2026-08-21 14:02:11 UTC',
    user: 'Senior Analyst Maya Sen',
    badge: 'CYBER-FIU-412',
    action: 'ALERT_TRIAGED',
    targetObject: 'ALERT-THORCHAIN-INGRESS-01',
    caseId: 'case-2026-0142',
    ipAddress: '10.240.12.104 (FIU Terminal #2)',
    result: 'SUCCESS',
    details: 'Escalated alert status from NEW to CONFIRMED CRITICAL; associated with Syndicate-88 cluster.'
  },
  {
    id: 'AUD-9407',
    timestamp: '2026-08-21 08:30:00 UTC',
    user: 'Insp. Vikram Rathore',
    badge: 'CYBER-SOC-941',
    action: 'LOGIN',
    targetObject: 'TRACEFORGE Workstation Auth',
    ipAddress: '10.240.12.91 (SOC Workstation #4)',
    result: 'SUCCESS',
    details: 'Investigator authenticated via Hardware Security Key (FIDO2) + SOC Credential Token.'
  }
];
