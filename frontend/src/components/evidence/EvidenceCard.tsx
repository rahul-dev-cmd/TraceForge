import React from 'react';
import { 
  Lock, 
  CheckCircle, 
  FileText, 
  Hash, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  User,
  Shield,
  Eye
} from 'lucide-react';
import { EvidenceItem } from '../../types/evidence';
import { Badge } from '../ui/Badge';

interface EvidenceCardProps {
  item: EvidenceItem;
  onViewCustody: (item: EvidenceItem) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ item, onViewCustody }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(item.hashOrReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (item.chainOfCustodyStatus) {
      case 'SEALED':
        return <span className="px-2 py-0.5 rounded-none bg-background text-terminal-primary border border-terminal-primary text-[10px] font-mono font-bold flex items-center gap-1 uppercase"><Lock className="w-2.5 h-2.5" /> [ SEALED & LOCKED ]</span>;
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded-none bg-background text-terminal-primary border border-terminal-primary text-[10px] font-mono font-bold flex items-center gap-1 uppercase"><CheckCircle className="w-2.5 h-2.5" /> [ VERIFIED ]</span>;
      case 'ACQUIRED':
        return <span className="px-2 py-0.5 rounded-none bg-background text-terminal-secondary border border-terminal-secondary text-[10px] font-mono font-bold flex items-center gap-1 uppercase"><Clock className="w-2.5 h-2.5" /> [ IN TRIAGE ]</span>;
      default:
        return <span className="px-2 py-0.5 rounded-none bg-background border border-terminal-muted text-terminal-muted text-[10px] font-mono font-bold uppercase">[ ARCHIVED ]</span>;
    }
  };

  return (
    <div className="p-4 rounded-none bg-background border border-terminal-muted hover:border-terminal-primary transition-none space-y-3 font-mono text-xs uppercase group">
      {/* Top row: Evidence ID, Type, Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-terminal-primary">{item.id}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-none bg-background border border-terminal-muted text-terminal-muted font-bold">
            {item.type}
          </span>
          {item.isSimulated && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-none bg-background text-terminal-secondary border border-terminal-secondary">
              [ SIMULATED TELEMETRY ]
            </span>
          )}
        </div>
        {getStatusBadge()}
      </div>

      {/* Title & Description */}
      <div>
        <div className="font-bold text-sm text-terminal-primary">{item.title}</div>
        <p className="text-terminal-muted text-xs mt-1 leading-relaxed">{item.description}</p>
      </div>

      {/* Cryptographic Hash or Reference */}
      <div className="p-2 rounded-none bg-background border border-terminal-muted group-hover:border-terminal-primary space-y-1 transition-none">
        <div className="text-[10px] text-terminal-muted font-bold flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3 text-terminal-primary" />
            CRYPTOGRAPHIC INTEGRITY PROOF / REF
          </span>
          <button
            onClick={handleCopyHash}
            className="hover:text-terminal-primary transition-colors"
            title="Copy Hash"
          >
            {copied ? <span className="text-terminal-primary">[ COPIED ]</span> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <div className="text-[11px] text-terminal-primary truncate font-mono select-all">
          {item.hashOrReference}
        </div>
      </div>

      {/* Metadata Attributes if available */}
      {item.metadata && (
        <div className="grid grid-cols-2 gap-1.5 p-2 rounded-none bg-background border border-terminal-muted text-[10px]">
          {Object.entries(item.metadata).map(([key, val]) => (
            <div key={key} className="truncate">
              <span className="text-terminal-muted font-bold">{key}: </span>
              <span className="text-terminal-primary font-bold">{String(val)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom row: Collector, Timestamp, Chain of Custody CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-terminal-muted text-[10px] text-terminal-muted">
        <div className="flex items-center gap-2 font-bold">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-terminal-primary" />
            {item.investigator}
          </span>
          <span>•</span>
          <span>{item.timestamp}</span>
        </div>

        <button
          onClick={() => onViewCustody(item)}
          className="flex items-center gap-1 text-terminal-primary hover:text-background hover:bg-terminal-primary px-2 py-1 font-bold transition-none"
        >
          <Shield className="w-3 h-3" />
          <span>[ CHAIN OF CUSTODY ]</span>
        </button>
      </div>
    </div>
  );
};
