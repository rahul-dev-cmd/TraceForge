import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  ShieldAlert, 
  ArrowRight, 
  Coins, 
  Calendar, 
  User, 
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { mockInvestigations } from '../data/mockInvestigations';
import { InvestigationCase, CaseStatus } from '../types/investigation';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Button } from '../components/ui/Button';
import { CreateCaseModal } from '../components/case/CreateCaseModal';
import { investigationService } from '../services/investigationService';

export const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<InvestigationCase[]>(mockInvestigations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredCases = cases.filter((c) => {
    const matchesSearch = 
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rootWalletAddress.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateCase = async (newCaseData: Partial<InvestigationCase>) => {
    const created = await investigationService.createCase(newCaseData);
    setCases([created, ...cases]);
  };

  return (
    <div className="space-y-6 uppercase">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-none bg-background border border-terminal-muted">
        <div>
          <div className="flex items-center gap-2 text-xs text-terminal-primary font-bold tracking-wider">
            <FolderKanban className="w-4 h-4" />
            CASE MANAGEMENT & DOSSIER INDEX
          </div>
          <h1 className="text-2xl font-bold text-terminal-primary tracking-tight mt-0.5">
            ACTIVE CYBERCRIME INVESTIGATIONS
          </h1>
          <p className="text-xs text-terminal-muted mt-1">
            MAINTAIN JUDICIAL EVIDENTIARY DOSSIERS, ASSIGN PRIORITY TRIAGE, AND COORDINATE MULTI-CHAIN FUND RECOVERY.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          variant="primary"
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          [ INITIATE NEW CASE ]
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-background border border-terminal-muted rounded-none text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-terminal-primary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY CASE NUMBER, INCIDENT NAME, WALLET ADDRESS, OR CATEGORY..."
            className="w-full pl-9 pr-3 py-2 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 uppercase"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-background text-terminal-primary text-xs px-3 py-2 rounded-none border border-terminal-muted focus:outline-none focus:border-terminal-primary uppercase"
          >
            <option value="ALL">ALL CRIME CATEGORIES</option>
            <option value="Ransomware">RANSOMWARE</option>
            <option value="Pig Butchering">PIG BUTCHERING</option>
            <option value="Ponzi Scheme">PONZI SCHEME</option>
            <option value="Darknet Market">DARKNET MARKET</option>
            <option value="DeFi Exploit">DEFI EXPLOIT</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-background text-terminal-primary text-xs px-3 py-2 rounded-none border border-terminal-muted focus:outline-none focus:border-terminal-primary uppercase"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      {/* Cases Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-none bg-background border border-terminal-muted hover:border-terminal-primary transition-colors flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Header: Case #, Status, Risk */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-terminal-primary">{c.caseNumber}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase border ${
                    c.status === 'ACTIVE' ? 'border-terminal-primary text-terminal-primary' :
                    c.status === 'ESCALATED' ? 'border-terminal-error text-terminal-error' :
                    c.status === 'UNDER_REVIEW' ? 'border-terminal-secondary text-terminal-secondary' :
                    'border-terminal-primary text-terminal-primary'
                  }`}>
                    [{c.status}]
                  </span>
                  <RiskBadge level={c.riskLevel} score={c.riskLevel === 'CRITICAL' ? 98 : 75} size="sm" />
                </div>
              </div>

              {/* Title & Category */}
              <div>
                <div className="text-[11px] text-terminal-muted uppercase font-bold">
                  {c.category}
                </div>
                <h3 className="font-bold text-base text-terminal-primary mt-0.5 group-hover:animate-blink line-clamp-2">
                  {c.title}
                </h3>
              </div>

              {/* Summary */}
              <p className="text-terminal-muted text-[11px] line-clamp-2 leading-relaxed">
                {c.summary}
              </p>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-none bg-background border border-terminal-muted text-xs">
                <div>
                  <span className="text-[10px] text-terminal-muted block font-bold">SUSPECTED LOSS</span>
                  <span className="font-bold text-terminal-error">{c.estimatedLossCrypto}</span>
                  <span className="text-[10px] text-terminal-muted block">{c.estimatedLossFiat}</span>
                </div>
                <div>
                  <span className="text-[10px] text-terminal-muted block font-bold">RECOVERY STATUS</span>
                  <span className="font-bold text-terminal-primary">{c.recoveredAmountFiat || 'TRACING IN PROGRESS'}</span>
                </div>
              </div>
            </div>

            {/* Footer row: Investigator & CTA */}
            <div className="pt-3 border-t border-terminal-muted flex items-center justify-between text-xs text-terminal-muted">
              <div className="flex items-center gap-1.5 text-[11px] truncate">
                <User className="w-3.5 h-3.5 text-terminal-muted" />
                <span className="truncate">{c.leadInvestigator.name}</span>
              </div>

              <Link
                to={`/cases/${c.id}`}
                className="flex items-center gap-1 text-terminal-muted hover:text-terminal-primary font-bold text-xs transition-colors"
              >
                <span>[ ENTER WORKSPACE ]</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Case Modal */}
      <CreateCaseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateCase}
      />
    </div>
  );
};
