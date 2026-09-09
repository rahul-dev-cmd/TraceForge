import React from 'react';
import { 
  FolderKanban, 
  ShieldAlert, 
  Calendar, 
  User, 
  Coins, 
  CheckCircle, 
  Clock, 
  Layers, 
  Lock, 
  ExternalLink,
  Tag,
  Share2
} from 'lucide-react';
import { InvestigationCase, CaseStatus } from '../../types/investigation';
import { RiskBadge } from '../ui/RiskBadge';
import { Badge } from '../ui/Badge';

interface CaseHeaderProps {
  caseData: InvestigationCase;
  onStatusChange?: (status: CaseStatus) => void;
  onGenerateReport?: () => void;
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({
  caseData,
  onStatusChange,
  onGenerateReport,
}) => {
  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-background text-terminal-primary border-terminal-primary';
      case 'UNDER_REVIEW': return 'bg-background text-terminal-secondary border-terminal-secondary';
      case 'ESCALATED': return 'bg-background text-terminal-error border-terminal-error';
      case 'CLOSED': return 'bg-background text-terminal-primary border-terminal-primary';
      default: return 'bg-background text-terminal-muted border-terminal-muted';
    }
  };

  return (
    <div className="p-6 rounded-none bg-background border border-terminal-muted space-y-4 uppercase">
      {/* Top row: Case Number, Status, Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-terminal-muted">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-none bg-background border border-terminal-error flex items-center justify-center text-terminal-error shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-terminal-primary tracking-wider">
                {caseData.caseNumber}
              </span>
              <span className="text-terminal-muted">•</span>
              <span className="text-terminal-muted uppercase font-bold">
                {caseData.category}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-terminal-primary font-mono tracking-tight mt-0.5">
              {caseData.title}
            </h1>
          </div>
        </div>

        {/* Status Dropdown & Action CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-background p-1.5 rounded-none border border-terminal-muted font-mono text-xs">
            <span className="text-[10px] text-terminal-muted pl-1 uppercase font-bold">STATUS:</span>
            <select
              value={caseData.status}
              onChange={(e) => onStatusChange && onStatusChange(e.target.value as CaseStatus)}
              className={`px-2.5 py-1 rounded-none border text-xs font-bold focus:outline-none cursor-pointer uppercase ${getStatusColor(caseData.status)}`}
            >
              <option value="NEW" className="bg-background text-terminal-muted">NEW</option>
              <option value="ACTIVE" className="bg-background text-terminal-primary">ACTIVE</option>
              <option value="UNDER_REVIEW" className="bg-background text-terminal-secondary">UNDER REVIEW</option>
              <option value="ESCALATED" className="bg-background text-terminal-error">ESCALATED</option>
              <option value="CLOSED" className="bg-background text-terminal-primary">CLOSED</option>
            </select>
          </div>

          <RiskBadge level={caseData.riskLevel} score={caseData.riskLevel === 'CRITICAL' ? 98 : 75} size="md" />
        </div>
      </div>

      {/* Financial & Scope Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="p-3 rounded-none bg-background border border-terminal-muted">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">ESTIMATED LOSS</div>
          <div className="font-bold text-terminal-error text-sm mt-0.5">{caseData.estimatedLossCrypto}</div>
          <div className="text-[10px] text-terminal-muted">{caseData.estimatedLossFiat}</div>
        </div>

        <div className="p-3 rounded-none bg-background border border-terminal-muted">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">RECOVERY STATUS</div>
          <div className="font-bold text-terminal-primary text-sm mt-0.5">
            {caseData.recoveredAmountFiat || '₹4.8 CR (FROZEN)'}
          </div>
          <div className="text-[10px] text-terminal-muted">MUTUAL LEGAL ASSISTANCE</div>
        </div>

        <div className="p-3 rounded-none bg-background border border-terminal-muted">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">WALLETS ANALYZED</div>
          <div className="font-bold text-terminal-primary text-sm mt-0.5">{caseData.walletCount} ADDRESSES</div>
          <div className="text-[10px] text-terminal-muted">2 BLOCKCHAINS</div>
        </div>

        <div className="p-3 rounded-none bg-background border border-terminal-muted">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">TRANSACTIONS</div>
          <div className="font-bold text-terminal-primary text-sm mt-0.5">{caseData.transactionCount} HOPS</div>
          <div className="text-[10px] text-terminal-muted">100% VOLUME TRACED</div>
        </div>

        <div className="p-3 rounded-none bg-background border border-terminal-muted">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">SEALED EVIDENCE</div>
          <div className="font-bold text-terminal-secondary text-sm mt-0.5">{caseData.evidenceCount} ARTIFACTS</div>
          <div className="text-[10px] text-terminal-muted">SHA-256 VERIFIED</div>
        </div>

        <div className="p-3 rounded-none bg-background border border-terminal-muted">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">LEAD INVESTIGATOR</div>
          <div className="font-bold text-terminal-primary text-xs mt-0.5 truncate">{caseData.leadInvestigator.name}</div>
          <div className="text-[10px] text-terminal-muted">{caseData.leadInvestigator.badge}</div>
        </div>
      </div>

      {/* Summary banner */}
      {caseData.summary && (
        <div className="p-3 rounded-none bg-background border border-terminal-muted text-xs font-mono text-terminal-primary leading-relaxed">
          <span className="font-mono text-terminal-primary font-bold mr-2 uppercase text-[11px]">&gt; EXECUTIVE BRIEF:</span>
          {caseData.summary}
        </div>
      )}
    </div>
  );
};
