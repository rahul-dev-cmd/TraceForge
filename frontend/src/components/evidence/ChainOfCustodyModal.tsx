import React from 'react';
import { 
  X, 
  Lock, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  FileCheck, 
  ShieldCheck, 
  Hash,
  Download
} from 'lucide-react';
import { EvidenceItem } from '../../types/evidence';
import { Button } from '../ui/Button';

interface ChainOfCustodyModalProps {
  item: EvidenceItem | null;
  onClose: () => void;
}

export const ChainOfCustodyModal: React.FC<ChainOfCustodyModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const custodySteps = [
    {
      action: 'COLLECTED & ACQUIRED',
      officer: item.investigator,
      badge: 'CYBER-SOC-941',
      unit: 'First Response Digital Forensics',
      timestamp: item.timestamp,
      location: 'Primary Forensic Workstation / Node #4',
      status: 'VERIFIED',
      note: `Original source telemetry retrieved from: ${item.source}`,
    },
    {
      action: 'CRYPTOGRAPHIC HASH GENERATED',
      officer: 'System Integrity Daemon',
      badge: 'SHA-256 ENGINE',
      unit: 'Tamper-Proof Ledger Daemon',
      timestamp: item.timestamp,
      location: 'Forensic Vault Sandbox',
      status: 'VERIFIED',
      note: `Generated immutable digest: ${item.hashOrReference}`,
    },
    {
      action: 'PEER FORENSIC REVIEW',
      officer: 'Senior Analyst Maya Sen',
      badge: 'CYBER-FIU-412',
      unit: 'AML Task Force Intelligence',
      timestamp: '2026-08-16 14:00 UTC',
      location: 'FIU Terminal #2',
      status: 'VERIFIED',
      note: 'Cryptographic block proofs and address signatures cross-checked against case dossier.',
    },
    {
      action: 'SEALED FOR JUDICIAL PROCEEDING',
      officer: 'Lead Investigator Insp. Vikram Rathore',
      badge: 'CYBER-SOC-941',
      unit: 'Digital Evidence Locker Registry',
      timestamp: '2026-08-16 16:30 UTC',
      location: 'High-Security Forensic Vault',
      status: 'SEALED',
      note: 'Evidence item sealed under judicial evidentiary preservation protocol. Hash locked.',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm animate-in fade-in duration-150 uppercase">
      <div className="w-full max-w-2xl rounded-none bg-background border border-terminal-muted p-6 space-y-5 text-xs font-mono">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-terminal-primary" />
            <div>
              <div className="font-bold text-terminal-primary text-sm">
                FORENSIC CHAIN OF CUSTODY & AUDIT TRAIL
              </div>
              <div className="text-[11px] text-terminal-muted">
                TAMPER-EVIDENT EVIDENTIARY VERIFICATION FOR <span className="text-terminal-primary font-bold">{item.id}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-none text-terminal-muted hover:text-terminal-primary border border-transparent hover:border-terminal-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Evidence Digest Banner */}
        <div className="p-3 rounded-none bg-background border border-terminal-primary space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-terminal-primary truncate">{item.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-none bg-background text-terminal-primary border border-terminal-primary font-bold">
              [ STATUS: {item.chainOfCustodyStatus} ]
            </span>
          </div>
          <div className="text-[11px] text-terminal-muted truncate">
            <span className="font-bold">HASH: </span>
            <span className="text-terminal-primary select-all">{item.hashOrReference}</span>
          </div>
        </div>

        {/* Step-by-step Custody Timeline */}
        <div className="space-y-3 relative pl-4 border-l-2 border-terminal-muted">
          {custodySteps.map((step, idx) => (
            <div key={idx} className="relative space-y-1">
              <span className="absolute -left-[22px] top-1 w-3 h-3 rounded-none bg-terminal-primary border-2 border-background" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-terminal-primary text-xs">{step.action}</span>
                <span className="text-[10px] text-terminal-muted">{step.timestamp}</span>
              </div>
              <div className="text-[11px] text-terminal-muted font-bold">
                OFFICER: <span className="text-terminal-primary">{step.officer}</span> ({step.badge}) — {step.unit}
              </div>
              <p className="text-[10px] text-terminal-primary bg-background p-2 rounded-none border border-terminal-muted">
                &gt; {step.note}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-terminal-muted">
          <span className="text-[10px] text-terminal-muted font-bold">
            [ IMMUTABLE CRYPTOGRAPHIC LEDGER SEAL VERIFIED ]
          </span>
          <Button onClick={onClose} variant="secondary" className="text-xs">
            [ CLOSE AUDIT TRAIL ]
          </Button>
        </div>
      </div>
    </div>
  );
};
