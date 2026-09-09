import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Layers, 
  Network, 
  Wallet, 
  Activity, 
  Users, 
  Bell, 
  Lock, 
  History, 
  FileText, 
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Plus,
  Coins,
  Sparkles
} from 'lucide-react';
import { CaseHeader } from '../components/case/CaseHeader';
import { CaseNotesTab } from '../components/case/CaseNotesTab';
import { TransactionGraph } from '../components/graph/TransactionGraph';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { ChainOfCustodyModal } from '../components/evidence/ChainOfCustodyModal';
import { AddEvidenceModal } from '../components/evidence/AddEvidenceModal';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Button } from '../components/ui/Button';
import { mockInvestigations } from '../data/mockInvestigations';
import { mockWallets } from '../data/mockWallets';
import { mockTransactions } from '../data/mockTransactions';
import { mockEvidence } from '../data/mockEvidence';
import { mockClusters } from '../data/mockClusters';
import { mockSuspiciousPatterns } from '../data/mockRiskEvents';
import { InvestigationCase, CaseStatus } from '../types/investigation';
import { EvidenceItem } from '../types/evidence';
import { investigationService } from '../services/investigationService';

export const CaseWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const caseId = id || 'case-2026-0142';
  const [caseData, setCaseData] = useState<InvestigationCase | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'transactions' | 'wallets' | 'graph' | 'clusters' | 'alerts' | 'evidence' | 'timeline' | 'reports' | 'notes'
  >('overview');

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedCustodyItem, setSelectedCustodyItem] = useState<EvidenceItem | null>(null);
  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const c = await investigationService.getCaseById(caseId);
      if (c) {
        setCaseData(c);
      } else {
        setCaseData(mockInvestigations[0]);
      }
      const ev = await investigationService.getEvidenceByCase(caseId);
      setEvidenceList(ev.length > 0 ? ev : mockEvidence);
    }
    load();
  }, [caseId]);

  if (!caseData) return null;

  const caseWallets = mockWallets.filter(w => 
    w.address === caseData.rootWalletAddress || 
    w.address === caseData.victimWalletAddress ||
    w.clusterId === 'CLUSTER-CYBER-88' ||
    w.tags.some(t => t.includes('Ransomware') || t.includes('Layering') || t.includes('Mixer') || t.includes('Bridge'))
  );

  const caseTransactions = mockTransactions.filter(t => t.caseId === caseData.id || t.caseId === 'case-2026-0142');

  const handleStatusChange = async (status: CaseStatus) => {
    const updated = await investigationService.updateCaseStatus(caseData.id, status);
    if (updated) setCaseData(updated);
  };

  const handleAddEvidence = async (newEvidence: Omit<EvidenceItem, 'id' | 'timestamp'>) => {
    const added = await investigationService.addEvidence(newEvidence);
    setEvidenceList([added, ...evidenceList]);
  };

  const tabs = [
    { id: 'overview', label: 'Case Overview', icon: FolderKanban },
    { id: 'transactions', label: `Transactions (${caseTransactions.length})`, icon: Activity },
    { id: 'wallets', label: `Wallets (${caseWallets.length})`, icon: Wallet },
    { id: 'graph', label: 'Transaction Graph', icon: Network },
    { id: 'clusters', label: 'Entity Clusters (1)', icon: Users },
    { id: 'alerts', label: 'Threat Alerts (5)', icon: Bell },
    { id: 'evidence', label: `Evidence Vault (${evidenceList.length})`, icon: Lock },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'reports', label: 'Forensic Reports', icon: FileText },
    { id: 'notes', label: 'Investigator Notes', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Case Header */}
      <CaseHeader
        caseData={caseData}
        onStatusChange={handleStatusChange}
        onGenerateReport={() => navigate('/reports')}
      />

      {/* 10-Tab Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-terminal-muted overflow-x-auto pb-1 font-mono text-xs scrollbar-thin uppercase">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-none font-bold transition-none whitespace-nowrap ${
                isActive
                  ? 'bg-terminal-primary text-background border-none'
                  : 'text-terminal-muted bg-background hover:text-terminal-primary hover:bg-background border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-background' : 'text-terminal-muted'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 uppercase">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Laundering Pipeline Overview */}
            <div className="lg:col-span-2 p-5 rounded-none bg-background border border-terminal-muted space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
                <span className="font-bold text-terminal-primary text-sm">
                  LAUNDERING PIPELINE PROGRESSION (8 HOPS)
                </span>
                <span className="text-terminal-primary font-bold">₹4.8 CR FROZEN (APEXGLOBAL)</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-none bg-background border border-terminal-muted space-y-2 hover:border-terminal-primary transition-colors">
                  <div className="flex items-center justify-between font-bold text-terminal-primary">
                    <span>1. INCEPTION & VICTIM PAYMENT</span>
                    <span className="text-terminal-error">320.50 BTC ($20.9M)</span>
                  </div>
                  <p className="text-terminal-muted text-xs">
                    VICTIM HOSPITAL TREASURY TRANSFERRED 320.50 BTC TO SUSPECT EXTORTION ADDRESS <code className="text-terminal-primary font-bold">bc1q9x7y...</code> FOLLOWING RANSOMWARE LOCKDOWN.
                  </p>
                </div>

                <div className="p-3 rounded-none bg-background border border-terminal-muted space-y-2 hover:border-terminal-primary transition-colors">
                  <div className="flex items-center justify-between font-bold text-terminal-primary">
                    <span>2. LAYERING & WASABI COINJOIN MIXER</span>
                    <span className="text-terminal-primary">145.00 BTC OBFUSCATED</span>
                  </div>
                  <p className="text-terminal-muted text-xs">
                    FUNDS SPLIT THROUGH PEELING MULES INTO WASABI WABISABI PRIVACY POOL COORDINATOR TO DEFEAT DETERMINISTIC UTXO CLUSTERING.
                  </p>
                </div>

                <div className="p-3 rounded-none bg-background border border-terminal-muted space-y-2 hover:border-terminal-primary transition-colors">
                  <div className="flex items-center justify-between font-bold text-terminal-primary">
                    <span>3. THORCHAIN CROSS-CHAIN BRIDGE</span>
                    <span className="text-terminal-secondary">90 BTC → 5,820,000 USDT</span>
                  </div>
                  <p className="text-terminal-muted text-xs">
                    CROSS-CHAIN LIQUIDITY SWAP BRIDGED BITCOIN INTO ERC-20 STABLECOINS RELEASED TO SUSPECT ETHEREUM WALLET <code className="text-terminal-primary font-bold">0x742d...44e</code>.
                  </p>
                </div>

                <div className="p-3 rounded-none bg-background border border-terminal-muted space-y-2 hover:border-terminal-primary transition-colors">
                  <div className="flex items-center justify-between font-bold text-terminal-primary">
                    <span>4. OFFSHORE EXCHANGE DEPOSIT & MUTUAL FREEZE</span>
                    <span className="text-terminal-primary">5,800,000 USDT FROZEN</span>
                  </div>
                  <p className="text-terminal-muted text-xs">
                    PROCEEDS DEPOSITED INTO APEXGLOBAL EXCHANGE SUB-ACCOUNT #98412. IMMEDIATE JUDICIAL FREEZE REQUEST SERVED; $2.4M USDT CONFIRMED LOCKED.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Quick Case Intelligence Summary */}
            <div className="p-5 rounded-none bg-background border border-terminal-muted space-y-4 font-mono text-xs">
              <div className="font-bold text-terminal-primary text-sm pb-3 border-b border-terminal-muted">
                THREAT DOSSIER SUMMARY
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-none bg-background border border-terminal-muted">
                  <span className="text-[10px] text-terminal-muted font-bold block">ASSOCIATED SYNDICATE</span>
                  <Link to="/clusters" className="font-bold text-terminal-primary text-sm hover:underline">
                    SYNDICATE-88 (BLACKCAT AFFILIATE)
                  </Link>
                  <span className="text-[10px] text-terminal-primary block mt-0.5">89% ASSOCIATION CONFIDENCE</span>
                </div>

                <div className="p-3 rounded-none bg-background border border-terminal-muted">
                  <span className="text-[10px] text-terminal-muted font-bold block">VASP DESTINATION</span>
                  <div className="font-bold text-terminal-primary text-sm">APEXGLOBAL EXCHANGE (OFFSHORE)</div>
                  <span className="text-[10px] text-terminal-secondary block mt-0.5">DEPOSIT ACCT #APX-98412-SG</span>
                </div>

                <div className="p-3 rounded-none bg-background border border-terminal-muted">
                  <span className="text-[10px] text-terminal-muted font-bold block">JUDICIAL CUSTODY STATUS</span>
                  <div className="font-bold text-terminal-primary text-sm">MLAT FREEZE ACTIVE</div>
                  <span className="text-[10px] text-terminal-muted block mt-0.5">6 SEALED EVIDENTIARY ARTIFACTS</span>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setActiveTab('graph')}
                    variant="primary"
                    className="w-full"
                  >
                    [ OPEN CASE TRANSACTION GRAPH ]
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Transactions */}
      {activeTab === 'transactions' && (
        <div className="p-5 rounded-none bg-background border border-terminal-muted space-y-4 font-mono text-xs uppercase">
          <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
            <span className="font-bold text-terminal-primary text-sm">
              CASE TRANSACTION LEDGER ({caseTransactions.length} SEQUENTIAL HOPS)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-terminal-muted text-terminal-muted text-[10px]">
                  <th className="py-2.5 px-3 font-normal">HOP</th>
                  <th className="py-2.5 px-3 font-normal">TX HASH</th>
                  <th className="py-2.5 px-3 font-normal">FROM</th>
                  <th className="py-2.5 px-3 font-normal">TO</th>
                  <th className="py-2.5 px-3 font-normal">AMOUNT</th>
                  <th className="py-2.5 px-3 font-normal">CHAIN</th>
                  <th className="py-2.5 px-3 font-normal">RISK</th>
                  <th className="py-2.5 px-3 font-normal">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-muted/50">
                {caseTransactions.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-terminal-primary hover:text-background transition-colors group">
                    <td className="py-3 px-3 font-bold text-terminal-primary group-hover:text-background">#{tx.hopIndex || 1}</td>
                    <td className="py-3 px-3 font-bold text-terminal-primary group-hover:text-background">
                      <Link to={`/transactions`} className="hover:underline">
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-terminal-primary group-hover:text-background truncate max-w-[150px]">{tx.fromLabel}</div>
                      <div className="text-[10px] text-terminal-muted group-hover:text-background/80">{tx.fromAddress.slice(0, 8)}...</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-terminal-primary group-hover:text-background truncate max-w-[150px]">{tx.toLabel}</div>
                      <div className="text-[10px] text-terminal-muted group-hover:text-background/80">{tx.toAddress.slice(0, 8)}...</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-terminal-primary group-hover:text-background">
                      {tx.amountCrypto} <span className="text-[10px] font-normal">({tx.amountFiatUsd})</span>
                    </td>
                    <td className="py-3 px-3 text-terminal-primary group-hover:text-background">{tx.network}</td>
                    <td className="py-3 px-3">
                      <RiskBadge level={tx.riskLevel} score={tx.riskScore} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-terminal-muted group-hover:text-background/80">{tx.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Wallets */}
      {activeTab === 'wallets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 uppercase">
          {caseWallets.map((w) => (
            <div
              key={w.address}
              className="p-4 rounded-none bg-background border border-terminal-muted space-y-3 font-mono text-xs hover:border-terminal-primary transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-terminal-muted text-[11px]">{w.classification}</span>
                <RiskBadge level={w.riskLevel} score={w.riskScore} size="sm" />
              </div>
              <div className="font-bold text-sm text-terminal-primary truncate">{w.label}</div>
              <div className="p-2 rounded-none bg-background border border-terminal-muted text-terminal-primary truncate text-[11px]">
                {w.address}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-terminal-muted">
                <div>
                  <span className="text-terminal-muted block font-bold">BALANCE</span>
                  <span className="font-bold text-terminal-primary">{w.balanceCrypto}</span>
                </div>
                <div>
                  <span className="text-terminal-muted block font-bold">NETWORK</span>
                  <span className="font-bold text-terminal-primary">{w.network}</span>
                </div>
              </div>
              <Link
                to={`/wallets/${w.address}`}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-none bg-background border border-terminal-primary text-terminal-primary hover:bg-terminal-primary hover:text-background text-xs font-bold transition-colors"
              >
                <span>[ EXAMINE WALLET DOSSIER ]</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Graph */}
      {activeTab === 'graph' && (
        <div className="h-[650px]">
          <TransactionGraph
            wallets={caseWallets}
            transactions={caseTransactions}
            selectedAddress={caseData.rootWalletAddress}
          />
        </div>
      )}

      {/* Tab 5: Clusters */}
      {activeTab === 'clusters' && (
        <div className="p-5 rounded-none bg-background border border-terminal-muted space-y-4 font-mono text-xs uppercase">
          <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
            <span className="font-bold text-terminal-primary text-sm">
              ASSOCIATED THREAT ENTITY: SYNDICATE-88
            </span>
            <span className="text-terminal-primary bg-background px-2 py-0.5 rounded-none border border-terminal-primary font-bold text-[10px]">
              [ CONFIDENCE: 89% (HIGH) ]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-none bg-background border border-terminal-muted space-y-2">
              <span className="text-terminal-primary font-bold text-[11px]">CLUSTERING HEURISTICS</span>
              <ul className="space-y-1.5 text-terminal-muted list-none text-xs">
                <li>&gt; CONSISTENT 10-MINUTE BLOCK INTERVAL FUND DISPERSAL PATTERNS.</li>
                <li>&gt; IDENTICAL PEELING CHANGE RETENTION (0.04 - 0.12 BTC).</li>
                <li>&gt; COORDINATED ROUTING INTO WASABI WABISABI COORDINATOR POOLS.</li>
                <li>&gt; COMMON DOWNSTREAM CONVERSION INTO ERC-20 USDT VIA THORCHAIN.</li>
              </ul>
            </div>

            <div className="p-4 rounded-none bg-background border border-terminal-muted space-y-2">
              <span className="text-terminal-primary font-bold text-[11px]">CONTROLLED WALLETS (5 MAPPED)</span>
              <div className="space-y-1">
                {mockClusters[0].memberWallets.map((addr) => (
                  <div key={addr} className="p-1.5 rounded-none bg-background border border-terminal-muted text-terminal-primary truncate text-[11px]">
                    {addr}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-3 font-mono text-xs uppercase">
          {mockSuspiciousPatterns.map((pat) => (
            <div
              key={pat.id}
              className="p-4 rounded-none bg-background border border-terminal-muted space-y-2 hover:border-terminal-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-terminal-primary text-sm">{pat.title}</span>
                <span className={`px-2 py-0.5 rounded-none font-bold text-[10px] border ${
                  pat.severity === 'CRITICAL' ? 'border-terminal-error text-terminal-error' :
                  'border-terminal-secondary text-terminal-secondary'
                }`}>
                  [{pat.severity}]
                </span>
              </div>
              <p className="text-terminal-muted text-xs">{pat.description}</p>
              <div className="text-[11px] text-terminal-primary bg-background border border-terminal-muted p-2 rounded-none">
                RECOMMENDATION: {pat.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 7: Evidence Vault */}
      {activeTab === 'evidence' && (
        <div className="space-y-4 uppercase">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-terminal-primary text-sm">
              DIGITAL EVIDENCE LOCKER & CHAIN OF CUSTODY
            </span>
            <Button
              onClick={() => setIsAddEvidenceOpen(true)}
              variant="primary"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              [ REGISTER NEW ARTIFACT ]
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidenceList.map((item) => (
              <EvidenceCard
                key={item.id}
                item={item}
                onViewCustody={(ev) => setSelectedCustodyItem(ev)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Timeline */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-none bg-background border border-terminal-muted space-y-6 font-mono text-xs uppercase">
          <div className="font-bold text-terminal-primary text-sm pb-3 border-b border-terminal-muted">
            CHRONOLOGICAL INCIDENT TIMELINE (CASE-2026-0142)
          </div>

          <div className="space-y-6 relative pl-6 border-l-2 border-terminal-muted">
            {caseData.timeline.map((event) => (
              <div key={event.id} className="relative space-y-1.5 group">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-none bg-terminal-primary border-4 border-background group-hover:scale-125 transition-transform" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-terminal-primary text-sm group-hover:animate-blink">{event.title}</span>
                  <span className="text-terminal-muted">{event.timestamp}</span>
                </div>
                <p className="text-terminal-muted text-xs leading-relaxed max-w-3xl">
                  {event.description}
                </p>
                <div className="inline-block px-2 py-0.5 rounded-none bg-background text-terminal-primary border border-terminal-muted text-[10px]">
                  STAGE: {event.stage}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 9: Reports */}
      {activeTab === 'reports' && (
        <div className="p-6 rounded-none bg-background border border-terminal-muted text-center space-y-4 font-mono text-xs uppercase">
          <FileText className="w-10 h-10 text-terminal-primary mx-auto" />
          <div>
            <h3 className="font-bold text-base text-terminal-primary">
              OFFICIAL FORENSIC INTELLIGENCE DOSSIER
            </h3>
            <p className="text-terminal-muted text-xs max-w-md mx-auto mt-1">
              GENERATE A COURT-READY 18-SECTION TECHNICAL REPORT WITH CRYPTOGRAPHIC TRANSACTION PROOFS, CHAIN-OF-CUSTODY SEALS, AND EXPORT TO PDF/JSON.
            </p>
          </div>
          <Button
            onClick={() => navigate('/reports')}
            variant="primary"
          >
            [ LAUNCH FORENSIC REPORT GENERATOR ]
          </Button>
        </div>
      )}

      {/* Tab 10: Notes */}
      {activeTab === 'notes' && <CaseNotesTab caseId={caseData.id} />}

      {/* Chain of Custody Audit Modal */}
      <ChainOfCustodyModal
        item={selectedCustodyItem}
        onClose={() => setSelectedCustodyItem(null)}
      />

      {/* Add Evidence Modal */}
      <AddEvidenceModal
        isOpen={isAddEvidenceOpen}
        onClose={() => setIsAddEvidenceOpen(false)}
        caseId={caseData.id}
        onAdd={handleAddEvidence}
      />
    </div>
  );
};
