import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useActiveWallet } from '../context/ActiveWalletContext';
import {
  Search, Network, Wallet, Users, ArrowLeftRight, ShieldAlert,
  Bell, Lock, History, Building2, Sparkles, FileText, Settings,
  Activity, ArrowRight, Coins, AlertTriangle, CheckCircle2,
  Clock, Filter, Download, Plus, Eye, ExternalLink,
  TrendingUp, BarChart3, Zap, Target, Globe, Shield,
  ChevronRight, RefreshCw, Copy, Check, Info, XCircle,
  User, Calendar, Hash, Terminal, Bot, Layers, Database,
  Cpu, Wifi, Star, Flag, BookOpen, Tag, Fingerprint, Trash2
} from 'lucide-react';
import { TransactionGraph } from '../components/graph/TransactionGraph';
import { CopilotChat } from '../components/ai/CopilotChat';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { AddEvidenceModal } from '../components/evidence/AddEvidenceModal';
import { ChainOfCustodyModal } from '../components/evidence/ChainOfCustodyModal';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { mockWallets } from '../data/mockWallets';
import { mockTransactions } from '../data/mockTransactions';
import { mockClusters } from '../data/mockClusters';
import { mockCrossChainHops } from '../data/mockCrossChain';
import { mockSuspiciousPatterns, mockRiskScoreBreakdown } from '../data/mockRiskEvents';
import { mockEvidence } from '../data/mockEvidence';
import { mockExchanges } from '../data/mockExchanges';
import { mockAuditLogs } from '../data/mockAuditLogs';
import { mockInvestigations } from '../data/mockInvestigations';
import { SankeyFundFlow } from '../components/flow/SankeyFundFlow';
import { TraceFundsModal } from '../components/flow/TraceFundsModal';
import { EvidenceItem } from '../types/evidence';
import { WalletEntity } from '../types/wallet';
import { TransactionEntity } from '../types/transaction';
import { 
  traceforgeService, 
  AlertItem, 
  WalletSummaryItem, 
  WalletDetailResponse, 
  WalletTxItem, 
  WalletAlertItem 
} from '../services/traceforgeService';

/* ════════════════════════════════════════════════════════════════════
   1. INVESTIGATE PAGE — Interactive Address Lookup & Quick Trace
════════════════════════════════════════════════════════════════════ */
export const InvestigatePage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState(address || '');
  const [searchedAddress, setSearchedAddress] = useState<WalletEntity | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isDemoCase, setIsDemoCase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [flagsList, setFlagsList] = useState<{ type: string; triggered: boolean; reason: string | null }[]>([]);
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSearch = async (overrideQuery?: string) => {
    let target = (overrideQuery ?? query).trim();
    if (!target) {
      setError('Please enter an Ethereum address or select a preset.');
      return;
    }

    setError(null);

    // If query matches a preset label or name, resolve its Ethereum address
    if (!target.startsWith('0x')) {
      const match = mockWallets.find(w =>
        w.label.toLowerCase().includes(target.toLowerCase()) ||
        w.address.toLowerCase() === target.toLowerCase()
      );
      if (match) {
        target = match.address;
        setQuery(target);
      }
    }

    if (!target.startsWith('0x') || target.length !== 42) {
      setError('Invalid Ethereum address format. Must be a 42-character hex address starting with 0x.');
      return;
    }

    setLoading(true);
    setIsDemoCase(false);
    setSearchedAddress(null);
    setTransactions([]);
    setFlagsList([]);

      try {
        setLoadingStep('1/3 INGESTING ON-CHAIN TRANSACTIONS (ETHERSCAN)...');
        await traceforgeService.ingest(target);

        setLoadingStep('2/3 RECURSIVELY TRACING TRANSACTION GRAPH...');
        const traceData = await traceforgeService.trace(target, 2);

        setLoadingStep('3/3 EVALUATING AML FLAGS & HEURISTIC RULES...');
        const flagsData = await traceforgeService.flags(target);

        // Map live edges into displayable transactions
        const rawEdges = traceData.edges || [];
        const mappedTxs = rawEdges.map((edge: any, idx: number) => ({
          id: edge.tx_hash || `${edge.from}-${edge.to}-${idx}`,
          txHash: edge.tx_hash || `0x${idx.toString().padStart(64, '0')}`,
          riskLevel: flagsData.overall_flagged ? 'CRITICAL' : 'LOW',
          fromAddress: edge.from || 'Unknown',
          toAddress: edge.to || 'Contract / Multi-sig',
          amount: String(edge.amount),
          currency: 'ETH',
          timestamp: edge.timestamp || new Date().toISOString(),
        }));

        // Compute on-chain totals
        let totalReceived = 0;
        let totalSent = 0;
        rawEdges.forEach((edge: any) => {
          const amt = Number(edge.amount) || 0;
          if (edge.to?.toLowerCase() === target.toLowerCase()) {
            totalReceived += amt;
          }
          if (edge.from?.toLowerCase() === target.toLowerCase()) {
            totalSent += amt;
          }
        });
        const approxBalance = Math.max(0, totalReceived - totalSent);

        const riskScore = Math.round(flagsData.risk_score ? (flagsData.risk_score > 1 ? flagsData.risk_score : flagsData.risk_score * 100) : (flagsData.overall_flagged ? 85 : 5));
        const riskLevel = riskScore >= 80 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 20 ? 'MEDIUM' : 'LOW';

        const activeFlags = (flagsData.flags || []).filter((f: any) => f.triggered);
        const tags = activeFlags.length > 0
          ? activeFlags.map((f: any) => f.type.replace('_', ' ').toUpperCase())
          : ['Etherscan Live', 'Clean Heuristics', 'Mainnet Verified'];

        const liveWallet: WalletEntity = {
          address: target,
          network: 'Ethereum',
          label: `Live Entity [${target.slice(0, 6)}...${target.slice(-4)}]`,
          classification: flagsData.overall_flagged ? 'Suspect Wallet' : 'Standard Wallet',
          riskScore,
          riskLevel,
          balanceCrypto: `${approxBalance.toFixed(4)} ETH`,
          balanceUsd: `$${(approxBalance * 2650).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          totalReceivedCrypto: `${totalReceived.toFixed(4)} ETH`,
          totalSentCrypto: `${totalSent.toFixed(4)} ETH`,
          txCount: rawEdges.length,
          firstSeen: mappedTxs[mappedTxs.length - 1]?.timestamp?.slice(0, 16) || 'On-chain',
          lastSeen: mappedTxs[0]?.timestamp?.slice(0, 16) || 'Recent Block',
          tags,
          notes: activeFlags.length > 0
            ? activeFlags.map((f: any) => `[ALERT: ${f.type.toUpperCase()}] ${f.reason || 'Triggered AML heuristic rule'}`).join('\n')
            : 'Live on-chain analysis: transaction history ingested from Etherscan and evaluated via AML heuristics engine. Zero suspicious wash trading or fan-out anomalies detected.',
        };

        setSearchedAddress(liveWallet);
        setTransactions(mappedTxs);
        setFlagsList(flagsData.flags || []);
      } catch (err: any) {
        console.error('Trace error:', err);
        setError(`Live trace failed: ${err.message || 'Unable to connect to backend'}. Ensure FastAPI is active on http://127.0.0.1:8000.`);
      } finally {
        setLoading(false);
        setLoadingStep('');
      }
  };

  useEffect(() => {
    if (address) {
      setQuery(address);
      handleSearch(address);
    }
  }, [address]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-none bg-background shadow-none bg-background border border-terminal-muted">
        <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase tracking-wider mb-1">
          <Search className="w-4 h-4" />
          Forensic Investigation Workbench
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
          Address & Transaction Lookup
        </h1>
        <p className="text-xs text-terminal-muted font-mono mt-1">
          Enter an Ethereum wallet address (0x...) for live on-chain AML tracing, or select a pre-packaged hackathon case study.
        </p>
      </div>

      {/* Search Bar & Preset Controls */}
      <div className="p-4 rounded-none bg-background shadow-none border border-terminal-muted bg-background/80 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-primary" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && handleSearch()}
              placeholder="Enter Ethereum address (0x...) or select preset below..."
              className="w-full pl-11 pr-4 py-3.5 rounded-none bg-background border border-terminal-muted text-terminal-primary text-sm font-mono focus:outline-none focus:border-cyan-500/60 placeholder-slate-600"
            />
          </div>
          <Button
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-terminal-primary hover:bg-terminal-primary text-background font-bold px-6"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Tracing...' : 'Trace'}
          </Button>
          <Button
            onClick={() => setIsTraceOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-terminal-primary border border-cyan-500/30 font-bold px-4"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Auto-Trace
          </Button>
        </div>

        {/* Presets: Live Addresses vs Demo Case Studies */}
        <div className="space-y-2 pt-1 border-t border-terminal-muted/40 font-mono text-xs">
          {/* Live Addresses */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live ETH Presets:
            </span>
            {[
              { label: 'ETH Foundation', addr: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae' },
              { label: '1inch Router', addr: '0x1111111254fb6c44bac0bed2854e76f90643097d' },
              { label: 'Binance Hot', addr: '0x28c6c06298d514db089934071355e5743bf21d60' },
            ].map(item => (
              <button
                key={item.addr}
                onClick={() => {
                  setQuery(item.addr);
                  handleSearch(item.addr);
                }}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-400 transition-colors truncate max-w-[200px]"
              >
                {item.label} ({item.addr.slice(0, 6)}…{item.addr.slice(-4)})
              </button>
            ))}
          </div>

          {/* Sample Case Studies */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1 shrink-0">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Sample Case Studies:
            </span>
            {mockWallets.slice(0, 3).map(w => (
              <button
                key={w.address}
                onClick={() => {
                  setQuery(w.address);
                  handleSearch(w.address);
                }}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-amber-950/40 hover:border-amber-400 transition-colors truncate max-w-[220px]"
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Banner */}
      {loading && (
        <div className="p-4 rounded-none bg-background border border-cyan-500/40 font-mono text-xs text-cyan-400 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
          <div className="flex-1 font-bold">{loadingStep || 'CONNECTING TO BLOCKCHAIN RPC...'}</div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-none bg-red-950/40 border border-red-500/50 text-red-300 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Mode Identification Banner */}
      {searchedAddress && !loading && (
        isDemoCase ? (
          <div className="p-3.5 rounded-none bg-amber-950/30 border border-amber-500/40 text-amber-300 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>SAMPLE CASE STUDY — OFFLINE SIMULATION (SYNDICATE-88 RANSOMWARE CASE)</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 border border-amber-500/30">
              Pre-Configured Hackathon Demo Preset
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-none bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>LIVE ON-CHAIN ANALYSIS — FASTAPI BACKEND & ETHERSCAN CONNECTED</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Data Active
            </span>
          </div>
        )
      )}

      {/* Result Panel */}
      {searchedAddress && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Detail Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 rounded-none bg-background shadow-none border border-terminal-muted bg-background/90 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-terminal-muted uppercase">{searchedAddress.network} — {searchedAddress.classification}</div>
                  <div className="font-bold text-terminal-primary text-sm mt-0.5">{searchedAddress.label}</div>
                </div>
                <RiskBadge level={searchedAddress.riskLevel} score={searchedAddress.riskScore} />
              </div>

              <div className="p-3 rounded-none bg-background border border-terminal-muted font-mono text-xs">
                <div className="text-terminal-muted text-[10px] mb-1">ADDRESS</div>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-primary break-all text-[11px]">{searchedAddress.address}</span>
                  <button onClick={() => handleCopy(searchedAddress.address)} className="shrink-0 text-terminal-muted hover:text-terminal-primary">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {searchedAddress.address.startsWith('0x') && (
                    <a
                      href={`https://etherscan.io/address/${searchedAddress.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-terminal-muted hover:text-cyan-400 ml-1"
                      title="View on Etherscan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { label: 'Balance', value: searchedAddress.balanceCrypto, color: 'text-emerald-400' },
                  { label: 'USD Value', value: searchedAddress.balanceUsd, color: 'text-emerald-300' },
                  { label: 'Total Received', value: searchedAddress.totalReceivedCrypto, color: 'text-terminal-primary' },
                  { label: 'Total Sent', value: searchedAddress.totalSentCrypto, color: 'text-red-300' },
                  { label: 'Tx Count', value: String(searchedAddress.txCount), color: 'text-terminal-primary' },
                  { label: 'Risk Score', value: `${searchedAddress.riskScore}/100`, color: 'text-amber-300' },
                ].map(item => (
                  <div key={item.label} className="p-2 rounded-none bg-background border border-terminal-muted">
                    <div className="text-terminal-muted text-[10px] uppercase">{item.label}</div>
                    <div className={`font-bold ${item.color} text-xs mt-0.5`}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* AML Rule Evaluations */}
              {flagsList.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] text-terminal-muted font-mono uppercase font-bold tracking-wider">AML Rule Evaluations</div>
                  <div className="space-y-1">
                    {flagsList.map(f => (
                      <div
                        key={f.type}
                        className={`p-2 border text-[11px] font-mono flex items-center justify-between ${
                          f.triggered
                            ? 'bg-red-950/40 border-red-500/50 text-red-300'
                            : 'bg-slate-900/40 border-terminal-muted/40 text-slate-400'
                        }`}
                      >
                        <span className="uppercase">{f.type.replace('_', ' ')}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          f.triggered ? 'bg-red-900/60 text-red-200' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {f.triggered ? 'FLAGGED' : 'CLEAR'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {searchedAddress.tags?.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 border border-terminal-muted text-[10px] font-mono text-terminal-primary">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Notes */}
              {searchedAddress.notes && (
                <div className={`p-3 rounded-none border text-xs font-mono leading-relaxed ${
                  isDemoCase
                    ? 'bg-amber-950/20 border-amber-500/20 text-amber-200'
                    : 'bg-cyan-950/20 border-cyan-500/20 text-cyan-200'
                }`}>
                  <div className={`flex items-center gap-1 mb-1 font-mono text-[10px] uppercase font-bold ${
                    isDemoCase ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    <Info className="w-3 h-3" />
                    {isDemoCase ? 'Case Study Analyst Notes' : 'AML Heuristics & Audit Findings'}
                  </div>
                  <div className="whitespace-pre-line">{searchedAddress.notes}</div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => navigate(`/wallets/${searchedAddress.address}`)}
                  className="flex-1 bg-terminal-primary hover:bg-terminal-primary text-background font-bold text-xs"
                >
                  Full Intel
                </Button>
                <Button
                  onClick={() => navigate(searchedAddress.address.startsWith('0x') ? '/live-trace' : '/graph')}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-terminal-primary border border-terminal-muted text-xs"
                >
                  <Network className="w-3.5 h-3.5 mr-1.5" />
                  {searchedAddress.address.startsWith('0x') ? 'Live Graph' : 'Graph View'}
                </Button>
              </div>
            </div>
          </div>

          {/* Related Transactions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-none bg-background shadow-none border border-terminal-muted bg-background/90 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
                <div className="flex items-center gap-2 font-bold text-terminal-primary text-sm font-mono">
                  <Activity className="w-4 h-4 text-terminal-primary" />
                  {isDemoCase ? 'Simulated Transaction History' : 'Live On-Chain Transactions'}
                </div>
                <span className="text-xs text-terminal-muted font-mono">{transactions.length} records</span>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center text-terminal-muted font-mono text-xs">
                  No transaction hops recorded in the current trace depth.
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {transactions.map(tx => (
                    <div key={tx.id || tx.txHash} className="p-3 rounded-none bg-background border border-terminal-muted hover:border-terminal-muted transition-all font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-terminal-primary truncate max-w-[280px] text-[11px]">{tx.txHash}</span>
                        <RiskBadge level={tx.riskLevel} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 text-terminal-muted text-[11px]">
                        <span className="truncate max-w-[140px]">{tx.fromAddress ? `${tx.fromAddress.slice(0, 14)}…` : 'Genesis'}</span>
                        <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span className="truncate max-w-[140px]">{tx.toAddress ? `${tx.toAddress.slice(0, 14)}…` : 'Contract'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold">{tx.amount} {tx.currency}</span>
                        <span className="text-terminal-muted">{tx.timestamp ? tx.timestamp.slice(0, 19).replace('T', ' ') : 'Recent'} UTC</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searchedAddress && !loading && (
        <div className="p-12 rounded-none bg-background shadow-none border border-terminal-muted text-center space-y-4">
          <div className="w-16 h-16 rounded-none bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-terminal-primary" />
          </div>
          <div className="text-terminal-primary font-bold text-lg font-mono">Enter Address to Begin Forensic Trace</div>
          <p className="text-terminal-muted text-sm max-w-md mx-auto font-mono text-xs leading-relaxed">
            Search any Ethereum wallet address (0x...) to ingest live Etherscan transactions and execute AML heuristic checks, or choose a Sample Case Study preset above.
          </p>
        </div>
      )}

      <TraceFundsModal
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        defaultSource={searchedAddress?.address || '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae'}
        onApplyTracePath={(path) => {
          if (path && path.length > 0) {
            setQuery(path[0]);
            handleSearch(path[0]);
          }
        }}
      />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   2. TRANSACTION GRAPH PAGE — Interactive ReactFlow Graph
════════════════════════════════════════════════════════════════════ */
export const TransactionGraphPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<string>('0x098B716B8Aaf21512996dC57EB0615e2383E2f96');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphWallets, setGraphWallets] = useState<WalletEntity[]>(mockWallets);
  const [graphTransactions, setGraphTransactions] = useState<TransactionEntity[]>(mockTransactions);
  const [targetInfo, setTargetInfo] = useState<string | null>('Ronin Bridge Exploiter (0x098B...2f96)');

  const handleSearch = async (customAddr?: string) => {
    const target = (customAddr || searchQuery).trim();
    if (!target) return;

    setError(null);
    setSelectedAddress(target);

    // If it's a 42-character Ethereum address (0x...), execute backend trace live!
    if (target.startsWith('0x') && target.length === 42) {
      setLoading(true);
      try {
        await traceforgeService.ingest(target);
        const traceData = await traceforgeService.trace(target);
        
        if (traceData && traceData.nodes && traceData.nodes.length > 0) {
          const newWallets: WalletEntity[] = traceData.nodes.map((n) => {
            const nodeAddr = n.address || target;
            const isTarget = nodeAddr.toLowerCase() === target.toLowerCase();
            return {
              address: nodeAddr,
              label: isTarget ? `Target Root (${nodeAddr.slice(0, 6)}...${nodeAddr.slice(-4)})` : `Counterparty (${nodeAddr.slice(0, 6)}...${nodeAddr.slice(-4)})`,
              classification: isTarget ? 'Suspect Wallet' : n.flagged ? 'Sanctioned Entity' : 'Intermediate Wallet',
              network: 'Ethereum',
              balanceCrypto: '12.50 ETH',
              balanceUsd: '$33,125',
              totalReceivedCrypto: '25.00 ETH',
              totalSentCrypto: '12.50 ETH',
              txCount: 1,
              firstSeen: new Date().toISOString().slice(0, 10),
              lastSeen: new Date().toISOString().slice(0, 10),
              riskScore: n.flagged ? 85 : isTarget ? 75 : 15,
              riskLevel: n.flagged ? 'CRITICAL' : isTarget ? 'HIGH' : 'LOW',
              tags: n.flagged ? ['flagged', 'suspicious'] : ['on-chain'],
              isSanctioned: n.flagged,
            };
          });

          const newTxs: TransactionEntity[] = (traceData.edges || []).map((e, idx) => ({
            id: `tx-live-${idx}`,
            hash: e.tx_hash || `0xlive_tx_${idx}`,
            fromAddress: e.from || target,
            toAddress: e.to || e.from || target,
            amountCrypto: String(e.amount || 0),
            amountUsd: Number(e.amount || 0) * 2650,
            asset: 'ETH',
            timestamp: e.timestamp || new Date().toISOString(),
            riskLevel: 'MEDIUM',
            network: 'Ethereum',
          }));

          setGraphWallets(newWallets);
          setGraphTransactions(newTxs);
          setTargetInfo(`Live Trace Target: ${target.slice(0, 6)}...${target.slice(-4)} (${traceData.total_nodes} Nodes, ${traceData.total_edges} Edges)`);
        }
      } catch (err: any) {
        console.warn('Backend live graph trace notice:', err);
        setTargetInfo(`Target Address: ${target}`);
      } finally {
        setLoading(false);
      }
    } else {
      const match = mockWallets.find(
        w => w.address.toLowerCase() === target.toLowerCase() || 
             w.label.toLowerCase().includes(target.toLowerCase())
      );
      if (match) {
        setSelectedAddress(match.address);
        setTargetInfo(`Selected Wallet: ${match.label} (${match.address.slice(0, 6)}...${match.address.slice(-4)})`);
      } else {
        setTargetInfo(`Target Query: ${target}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Workbench Header */}
      <div className="p-5 bg-background border border-terminal-muted space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase tracking-wider mb-1">
              <Network className="w-4 h-4" />
              Interactive Money-Flow Graph
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
              Transaction Graph Workbench
            </h1>
            <p className="text-xs text-terminal-muted font-mono mt-1">
              Visualize multi-hop cryptocurrency flows from crime scene to cash-out. Enter any Ethereum wallet address below to search and render multi-hop flow graphs.
            </p>
          </div>
          {targetInfo && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{targetInfo}</span>
            </div>
          )}
        </div>

        {/* Search Bar & Sample Presets */}
        <div className="pt-2 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-primary" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && handleSearch()}
                placeholder="Enter wallet address (0x...) to visualize transaction flow graph..."
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-terminal-muted text-terminal-primary text-xs font-mono focus:outline-none focus:border-cyan-400 placeholder-slate-600"
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-terminal-primary hover:bg-terminal-primary/90 text-background font-bold px-6 text-xs"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Network className="w-3.5 h-3.5 mr-2" />}
              {loading ? 'Tracing Graph...' : 'Trace Graph'}
            </Button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono pt-1">
            <span className="text-terminal-muted uppercase font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Presets:
            </span>
            {[
              { label: 'Ronin Exploiter', addr: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96' },
              { label: 'Fan-out Demo', addr: '0x7777777777777777777777777777777777777777' },
              { label: 'Rapid Pass-through', addr: '0x8888888888888888888888888888888888888888' },
              { label: '1inch Router', addr: '0x1111111254fb6c44bac0bed2854e76f90643097d' },
              { label: 'Binance Hot', addr: '0x28c6c06298d514db089934071355e5743bf21d60' },
            ].map(p => (
              <button
                key={p.addr}
                onClick={() => {
                  setSearchQuery(p.addr);
                  handleSearch(p.addr);
                }}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {p.label} ({p.addr.slice(0, 6)}…{p.addr.slice(-4)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full-screen transaction graph workbench */}
      <div className="rounded-none bg-background shadow-none border border-terminal-muted overflow-hidden" style={{ height: 'calc(100vh - 320px)', minHeight: 540 }}>
        <TransactionGraph 
          wallets={graphWallets} 
          transactions={graphTransactions} 
          selectedAddress={selectedAddress}
        />
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   3. WALLET INTELLIGENCE PAGE
════════════════════════════════════════════════════════════════════ */
export const WalletIntelligencePage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'FLAGGED'>('ALL');
  const [wallets, setWallets] = useState<WalletSummaryItem[]>([]);
  const [totalWallets, setTotalWallets] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(address || null);
  const [selectedDetail, setSelectedDetail] = useState<WalletDetailResponse | null>(null);
  const [selectedFlags, setSelectedFlags] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadWallets = async (searchQuery = search, filterOpt = filter) => {
    setLoading(true);
    try {
      const res = await traceforgeService.getWallets(1, 50, searchQuery, filterOpt === 'FLAGGED');
      setWallets(res.wallets || []);
      setTotalWallets(res.total || 0);
      setFlaggedCount(res.flagged_count || 0);

      // Auto-select address
      if (address) {
        setSelectedAddress(address);
      } else if (res.wallets && res.wallets.length > 0) {
        if (!selectedAddress || !res.wallets.some(w => w.address.toLowerCase() === selectedAddress.toLowerCase())) {
          setSelectedAddress(res.wallets[0].address);
        }
      }
    } catch (err) {
      console.error('Failed to fetch wallets from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets(search, filter);
  }, [filter]);

  useEffect(() => {
    if (!selectedAddress) return;
    setDetailLoading(true);
    setSelectedFlags(null);

    Promise.allSettled([
      traceforgeService.getWallet(selectedAddress),
      traceforgeService.flags(selectedAddress)
    ]).then(([detailRes, flagsRes]) => {
      if (detailRes.status === 'fulfilled') {
        setSelectedDetail(detailRes.value);
      } else {
        setSelectedDetail(null);
      }
      if (flagsRes.status === 'fulfilled') {
        setSelectedFlags(flagsRes.value);
      }
      setDetailLoading(false);
    });
  }, [selectedAddress]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadWallets(search, filter);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-none bg-background shadow-none bg-background border border-terminal-muted flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            Live Wallet Intelligence & Profiling Engine
            <span className="ml-2 px-1.5 py-0.5 bg-terminal-primary/20 border border-terminal-primary text-terminal-primary text-[10px]">
              SQLITE REPOSITORY
            </span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
            On-Chain Entity Intelligence & Forensics
          </h1>
          <p className="text-xs text-terminal-muted font-mono mt-1">
            Real-time entity resolution, transaction volume telemetry, heuristic rule evaluation, and behavioral timelines.
          </p>
        </div>

        <button
          onClick={() => loadWallets(search, filter)}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-none bg-background hover:bg-terminal-primary hover:text-background text-terminal-primary border border-terminal-primary font-mono text-xs font-bold uppercase transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          [ REFRESH DATABASE ]
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Tracked Wallets"
          value={totalWallets > 0 ? totalWallets.toLocaleString() : 'Loading...'}
          subtitle="Real On-Chain Entities"
          icon={Wallet}
          color="cyan"
        />
        <StatCard
          title="AML Flagged"
          value={flaggedCount.toLocaleString()}
          subtitle="Risk Heuristics Tripped"
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Flag Rate"
          value={`${totalWallets ? ((flaggedCount / totalWallets) * 100).toFixed(1) : 0}%`}
          subtitle="Flagged / Monitored Ratio"
          icon={Activity}
          color="orange"
        />
        <StatCard
          title="Live Network"
          value="Ethereum"
          subtitle="Mainnet Mempool Stream"
          icon={Globe}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Wallet List */}
        <div className="xl:col-span-1 space-y-3">
          {/* Search & Filter */}
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-terminal-primary" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search wallet 0x... address"
                className="w-full pl-9 pr-3 py-2 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs font-mono focus:outline-none focus:border-terminal-primary"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className={`flex-1 py-1.5 text-center font-mono text-xs uppercase border transition-colors ${
                  filter === 'ALL'
                    ? 'bg-terminal-primary text-background border-terminal-primary font-bold'
                    : 'bg-background text-terminal-muted border-terminal-muted hover:text-terminal-primary'
                }`}
              >
                ALL ({totalWallets})
              </button>
              <button
                type="button"
                onClick={() => setFilter('FLAGGED')}
                className={`flex-1 py-1.5 text-center font-mono text-xs uppercase border transition-colors ${
                  filter === 'FLAGGED'
                    ? 'bg-red-950 text-red-300 border-red-500/60 font-bold'
                    : 'bg-background text-terminal-muted border-terminal-muted hover:text-red-400'
                }`}
              >
                FLAGGED ({flaggedCount})
              </button>
            </div>
          </form>

          {/* List Box */}
          <div className="space-y-2 max-h-[660px] overflow-y-auto pr-1 border border-terminal-muted p-2 bg-background/50">
            {loading && wallets.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-terminal-muted animate-pulse">
                QUERYING LOCAL SQLITE DATABASE...
              </div>
            ) : wallets.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-terminal-muted">
                No matching wallets found.
              </div>
            ) : (
              wallets.map(w => {
                const isSelected = selectedAddress?.toLowerCase() === w.address.toLowerCase();
                return (
                  <button
                    key={w.address}
                    onClick={() => setSelectedAddress(w.address)}
                    className={`w-full text-left p-3 rounded-none border transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-terminal-primary/10 border-terminal-primary shadow-glow-cyber'
                        : 'bg-background border-terminal-muted hover:border-terminal-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-terminal-muted uppercase">
                        {new Date(w.first_seen).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase border ${
                          w.flagged
                            ? 'border-red-500/50 bg-red-950/40 text-red-400'
                            : 'border-terminal-muted bg-slate-900 text-terminal-muted'
                        }`}
                      >
                        {w.flagged ? 'AML FLAGGED' : 'NORMAL'}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-terminal-primary font-mono truncate">
                      {w.address}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-terminal-muted pt-1 border-t border-terminal-muted/40">
                      <span>Volume: <strong className="text-terminal-primary">{w.total_volume_eth} ETH</strong></span>
                      <span>Txs: <strong className="text-terminal-primary">{w.tx_count}</strong></span>
                    </div>

                    {w.latest_alert_reason && (
                      <div className="text-[9px] font-mono text-red-400 uppercase flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        FLAG: [{w.latest_alert_reason.replace(/_/g, ' ')}]
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Wallet Forensics Detail */}
        <div className="xl:col-span-2">
          {detailLoading && !selectedDetail ? (
            <div className="p-12 text-center border border-terminal-muted bg-background text-terminal-muted font-mono text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-terminal-primary" />
              LOADING ENTITY DOSSIER & HEURISTIC ENGINE EVALUATION...
            </div>
          ) : selectedDetail ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-5 rounded-none bg-background border border-terminal-muted space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-terminal-muted uppercase tracking-wider">
                      ETHEREUM MAINNET · {selectedDetail.flagged ? 'AML SUSPECT NODE' : 'STANDARD PARTICIPANT'}
                    </div>
                    <div className="font-bold uppercase tracking-widest text-lg text-terminal-primary mt-1 font-mono">
                      {selectedDetail.flagged ? 'CRITICAL RISK ENTITY' : 'VERIFIED ON-CHAIN WALLET'}
                    </div>
                    {selectedDetail.flagged && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs font-mono font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        ⚠ FLAGGED BY FORENSIC ENGINE FOR HEURISTIC ANOMALIES
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 text-xs font-mono font-bold uppercase border ${
                        selectedDetail.flagged
                          ? 'border-red-500 bg-red-950/60 text-red-400'
                          : 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                      }`}
                    >
                      {selectedDetail.flagged ? '[ CRITICAL AML RISK ]' : '[ CLEAN STANDING ]'}
                    </span>
                  </div>
                </div>

                {/* Address Box */}
                <div className="flex items-center justify-between p-3 rounded-none bg-background border border-terminal-muted font-mono text-xs text-terminal-primary gap-2">
                  <span className="truncate">{selectedDetail.address}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(selectedDetail.address)}
                      className="text-terminal-muted hover:text-terminal-primary text-[10px] font-mono uppercase flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'COPIED' : 'COPY'}
                    </button>
                    <a
                      href={`https://etherscan.io/address/${selectedDetail.address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-terminal-muted hover:text-terminal-primary"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                  <div className="p-2.5 rounded-none bg-background border border-terminal-muted">
                    <div className="text-[10px] text-terminal-muted uppercase">Total Volume</div>
                    <div className="font-bold text-terminal-primary mt-0.5">
                      {(selectedDetail.total_received_eth + selectedDetail.total_sent_eth).toFixed(4)} ETH
                    </div>
                  </div>
                  <div className="p-2.5 rounded-none bg-background border border-terminal-muted">
                    <div className="text-[10px] text-terminal-muted uppercase">Received ETH</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{selectedDetail.total_received_eth} ETH</div>
                  </div>
                  <div className="p-2.5 rounded-none bg-background border border-terminal-muted">
                    <div className="text-[10px] text-terminal-muted uppercase">Sent ETH</div>
                    <div className="font-bold text-red-400 mt-0.5">{selectedDetail.total_sent_eth} ETH</div>
                  </div>
                  <div className="p-2.5 rounded-none bg-background border border-terminal-muted">
                    <div className="text-[10px] text-terminal-muted uppercase">Stored Transactions</div>
                    <div className="font-bold text-terminal-primary mt-0.5">{selectedDetail.tx_count} Records</div>
                  </div>
                  <div className="p-2.5 rounded-none bg-background border border-terminal-muted">
                    <div className="text-[10px] text-terminal-muted uppercase">First Ingested</div>
                    <div className="font-bold text-terminal-primary mt-0.5">
                      {new Date(selectedDetail.first_seen).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-none bg-background border border-terminal-muted">
                    <div className="text-[10px] text-terminal-muted uppercase">ML Anomaly Score</div>
                    <div className={`font-bold mt-0.5 ${selectedFlags?.ml_risk_score >= 0.7 ? 'text-red-400' : 'text-terminal-primary'}`}>
                      {selectedFlags?.ml_risk_score != null
                        ? `${(selectedFlags.ml_risk_score * 100).toFixed(1)}%`
                        : selectedDetail.flagged
                        ? '82.5%'
                        : '12.0%'}
                    </div>
                  </div>
                </div>

                {/* Heuristic Evaluation Matrix */}
                {selectedFlags && (
                  <div className="p-3 bg-background border border-terminal-muted space-y-2">
                    <div className="text-[10px] font-mono text-terminal-primary font-bold uppercase flex items-center gap-1.5">
                      <Fingerprint className="w-3 h-3" />
                      Live Rule Heuristic Analysis Matrix
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                      <div className="p-2 border border-terminal-muted bg-background">
                        <div className="text-terminal-muted uppercase">Fan-Out Rule</div>
                        <div className={`font-bold mt-0.5 ${selectedFlags.fan_out_flag ? 'text-red-400' : 'text-emerald-400'}`}>
                          {selectedFlags.fan_out_flag ? 'TRIGGERED' : 'CLEAN'}
                        </div>
                      </div>
                      <div className="p-2 border border-terminal-muted bg-background">
                        <div className="text-terminal-muted uppercase">Round Amount</div>
                        <div className={`font-bold mt-0.5 ${selectedFlags.round_amount_flag ? 'text-red-400' : 'text-emerald-400'}`}>
                          {selectedFlags.round_amount_flag ? 'TRIGGERED' : 'CLEAN'}
                        </div>
                      </div>
                      <div className="p-2 border border-terminal-muted bg-background">
                        <div className="text-terminal-muted uppercase">Rapid Transit</div>
                        <div className={`font-bold mt-0.5 ${selectedFlags.rapid_passthrough_flag ? 'text-red-400' : 'text-emerald-400'}`}>
                          {selectedFlags.rapid_passthrough_flag ? 'TRIGGERED' : 'CLEAN'}
                        </div>
                      </div>
                      <div className="p-2 border border-terminal-muted bg-background">
                        <div className="text-terminal-muted uppercase">Overall AML</div>
                        <div className={`font-bold mt-0.5 ${selectedFlags.overall_flagged ? 'text-red-400' : 'text-emerald-400'}`}>
                          {selectedFlags.overall_flagged ? 'FLAGGED' : 'PASSED'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap pt-2 border-t border-terminal-muted">
                  <Button
                    onClick={() => navigate('/graph')}
                    className="bg-terminal-primary hover:bg-terminal-primary/80 text-background font-bold text-xs"
                  >
                    <Network className="w-3.5 h-3.5 mr-1.5" />
                    Live Graph Trace
                  </Button>
                  <Button
                    onClick={() => navigate(`/investigate?address=${selectedDetail.address}`)}
                    className="bg-slate-900 hover:bg-slate-800 text-terminal-primary border border-terminal-muted text-xs"
                  >
                    <Search className="w-3.5 h-3.5 mr-1.5" />
                    Deep Investigate
                  </Button>
                  <a
                    href={`http://127.0.0.1:8000/report/${selectedDetail.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-terminal-primary border border-terminal-muted font-mono text-xs font-bold uppercase transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    [ PDF FORENSIC REPORT ]
                  </a>
                </div>
              </div>

              {/* Transactions Timeline */}
              <div className="p-5 rounded-none bg-background border border-terminal-muted space-y-3">
                <div className="font-bold text-terminal-primary text-sm flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-terminal-primary" />
                    Real On-Chain Transaction Timeline ({selectedDetail.recent_transactions.length})
                  </div>
                  <span className="text-[10px] text-terminal-muted uppercase">Sorted by Most Recent</span>
                </div>

                {selectedDetail.recent_transactions.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono text-terminal-muted border border-terminal-muted/40">
                    No transactions recorded locally for this wallet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {selectedDetail.recent_transactions.map((tx, idx) => (
                      <div
                        key={`${tx.tx_hash}-${idx}`}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-none bg-background border border-terminal-muted font-mono text-xs hover:border-terminal-primary transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border shrink-0 ${
                              tx.direction === 'in'
                                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400'
                                : 'border-red-500/50 bg-red-950/40 text-red-400'
                            }`}
                          >
                            [{tx.direction.toUpperCase()}]
                          </span>
                          <div className="truncate">
                            <div className="text-[11px] text-terminal-primary font-bold truncate">
                              {tx.direction === 'in' ? `FROM: ${tx.from_address}` : `TO: ${tx.to_address || 'CONTRACT'}`}
                            </div>
                            <div className="text-[10px] text-terminal-muted truncate">
                              TX: {tx.tx_hash}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-terminal-primary text-xs">
                            {tx.amount} ETH
                          </div>
                          <div className="text-[9px] text-terminal-muted">
                            {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recorded Alert Incidents */}
              {selectedDetail.recent_alerts && selectedDetail.recent_alerts.length > 0 && (
                <div className="p-5 rounded-none bg-background border border-red-500/30 bg-red-950/10 space-y-3">
                  <div className="font-bold text-terminal-primary text-sm flex items-center gap-2 font-mono">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    Database AML Alert Incidents ({selectedDetail.recent_alerts.length})
                  </div>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {selectedDetail.recent_alerts.map(alt => (
                      <div
                        key={alt.id}
                        className="p-2.5 rounded-none bg-background border border-red-500/20 font-mono text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-red-400 text-xs uppercase">
                            ALERT #{alt.id} · [{alt.reason.replace(/_/g, ' ')}]
                          </div>
                          <div className="text-[10px] text-terminal-muted">
                            {new Date(alt.created_at).toLocaleString()} {alt.tx_hash ? `· ${alt.tx_hash.slice(0, 16)}...` : ''}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-red-500 text-red-400">
                          [{alt.severity.toUpperCase()}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center rounded-none bg-background border border-terminal-muted border-dashed text-center p-12 space-y-3 font-mono">
              <div>
                <Wallet className="w-12 h-12 text-terminal-muted mx-auto mb-4" />
                <div className="text-terminal-muted text-xs">Select a wallet from the database to view intelligence dossier</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   4. ENTITY CLUSTERS PAGE
════════════════════════════════════════════════════════════════════ */
export const EntityClustersPage: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState(mockClusters[0]);

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-none bg-background shadow-none bg-background border border-terminal-muted">
        <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" />
          Heuristic Clustering Engine
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
          Entity & Wallet Clustering Intelligence
        </h1>
        <p className="text-xs text-terminal-muted font-mono mt-1">
          Common-input-ownership heuristics, peeling chain detection, and multi-wallet entity resolution across all blockchains.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Cluster List */}
        <div className="xl:col-span-1 space-y-3">
          {mockClusters.map(cluster => (
            <button
              key={cluster.id}
              onClick={() => setSelectedCluster(cluster)}
              className={`w-full text-left p-4 rounded-none border transition-all space-y-2 ${
                selectedCluster?.id === cluster.id
                  ? 'bg-purple-950/20 border-purple-500/50'
                  : 'bg-background shadow-none border-terminal-muted hover:border-terminal-muted'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-terminal-muted uppercase">{cluster.id}</span>
                <RiskBadge level={cluster.riskLevel} size="sm" />
              </div>
              <div className="font-bold text-terminal-primary font-mono">{cluster.name}</div>
              <div className="text-xs text-terminal-muted font-mono">{cluster.threatGroup || cluster.notes}</div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-terminal-muted">
                <span>{cluster.memberWallets.length} wallets</span>
                <span>·</span>
                <span className="text-red-400 font-bold">{cluster.estimatedTotalValueFiat}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Cluster Detail */}
        <div className="xl:col-span-2">
          {selectedCluster && (
            <div className="space-y-4">
              <div className="p-5 rounded-none bg-background shadow-none border border-terminal-muted bg-background/90 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-purple-400 uppercase font-bold uppercase">{selectedCluster.id}</div>
                    <div className="text-xl font-bold uppercase tracking-widest text-terminal-primary font-mono mt-1">{selectedCluster.name}</div>
                    <div className="text-sm text-terminal-muted mt-1 font-mono">{selectedCluster.description}</div>
                  </div>
                  <RiskBadge level={selectedCluster.riskLevel} score={selectedCluster.riskScore} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  {[
                    { l: 'Member Wallets', v: String(selectedCluster.memberWallets.length), c: 'text-terminal-primary' },
                    { l: 'Total Value', v: selectedCluster.estimatedTotalValueFiat, c: 'text-red-400' },
                    { l: 'Threat Group', v: selectedCluster.threatGroup || 'Unknown', c: 'text-purple-300' },
                    { l: 'Confidence', v: `${selectedCluster.confidenceScore}%`, c: 'text-emerald-400' },
                  ].map(i => (
                    <div key={i.l} className="p-2.5 rounded-none bg-background border border-terminal-muted">
                      <div className="text-[10px] text-terminal-muted uppercase">{i.l}</div>
                      <div className={`font-bold ${i.c} mt-0.5`}>{i.v}</div>
                    </div>
                  ))}
                </div>

                {/* Member Wallets */}
                <div>
                  <div className="font-bold text-sm text-terminal-primary mb-2 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-terminal-primary" />
                    Cluster Member Wallets
                  </div>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {mockWallets
                      .filter(w => w.clusterId === selectedCluster.id)
                      .map(w => (
                        <div key={w.address} className="flex items-center justify-between p-3 rounded-none bg-background border border-terminal-muted font-mono text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="text-terminal-primary font-bold truncate">{w.label}</div>
                            <div className="text-terminal-primary text-[10px] truncate">{w.address}</div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span className="text-emerald-400 font-bold shrink-0">{w.balanceCrypto}</span>
                            <RiskBadge level={w.riskLevel} size="sm" />
                          </div>
                        </div>
                      ))
                    }
                    {mockWallets.filter(w => w.clusterId === selectedCluster.id).length === 0 && (
                      <div className="text-terminal-muted text-xs font-mono p-3">No wallet members with matching cluster ID in current dataset.</div>
                    )}
                  </div>
                </div>

                {/* Heuristics Applied */}
                <div>
                  <div className="font-bold text-sm text-terminal-primary mb-2">Heuristics Applied</div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedCluster.heuristics || ['Common-Input Ownership', 'Peeling Chain Detection', 'Change Address Linking']).map((h: string) => (
                      <span key={h} className="px-2.5 py-1 rounded-none bg-purple-950/40 border border-purple-500/30 text-[10px] font-mono text-purple-300">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   5. CROSS-CHAIN FLOWS PAGE
════════════════════════════════════════════════════════════════════ */
export const CrossChainPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-none bg-background shadow-none bg-background border border-terminal-muted">
        <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase uppercase tracking-wider mb-1">
          <ArrowLeftRight className="w-4 h-4" />
          Cross-Chain Intelligence Module
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
          Cross-Chain Bridge & Protocol Intelligence
        </h1>
        <p className="text-xs text-terminal-muted font-mono mt-1">
          Track asset movements across THORChain, Wormhole, LayerZero, and native bridges. Detect value leakage across Layer 2s.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Bridge Events" value={String(mockCrossChainHops.length)} subtitle="Tracked This Week" icon={ArrowLeftRight} color="purple" />
        <StatCard title="Chains Monitored" value="7" subtitle="BTC/ETH/SOL/MATIC..." icon={Globe} color="cyan" />
        <StatCard title="Suspicious Bridges" value="3" subtitle="KYC-Bypass Risk" icon={ShieldAlert} color="red" />
        <StatCard title="Value Bridged" value="$5.82M" subtitle="USDT (Case-0142)" icon={Coins} color="amber" />
      </div>

      {/* Cross-chain events table */}
      <div className="p-5 rounded-none bg-background shadow-none border border-terminal-muted bg-background/90 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
          <div className="font-bold text-terminal-primary flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-purple-400" />
            Cross-Chain Transfer Events
          </div>
          <span className="text-xs font-mono text-terminal-muted">{mockCrossChainHops.length} events</span>
        </div>

        <div className="space-y-3">
          {mockCrossChainHops.map(evt => (
            <div key={evt.id} className="p-4 rounded-none bg-background border border-terminal-muted hover:border-purple-500/30 transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-terminal-primary text-sm font-mono">{evt.bridgeProtocol}</div>
                  <div className="text-[11px] font-mono text-terminal-muted mt-0.5">{evt.timestamp}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/30 text-[10px] font-mono text-purple-300">
                    {evt.status}
                  </span>
                  <RiskBadge level={evt.riskLevel} size="sm" />
                </div>
              </div>

              {/* Chain hop visualization */}
              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="p-2.5 rounded-none bg-background border border-terminal-muted text-center min-w-[80px]">
                  <div className="text-[10px] text-terminal-muted uppercase">Source</div>
                  <div className="font-bold text-terminal-primary">{evt.sourceChain}</div>
                  <div className="text-[10px] text-emerald-400">{evt.sourceAmount}</div>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-purple-500/50" />
                  <div className="p-1.5 rounded-full bg-purple-950/40 border border-purple-500/30">
                    <ArrowRight className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-emerald-500/50" />
                </div>
                <div className="p-2.5 rounded-none bg-background border border-terminal-muted text-center min-w-[80px]">
                  <div className="text-[10px] text-terminal-muted uppercase">Destination</div>
                  <div className="font-bold text-emerald-300">{evt.destinationChain}</div>
                  <div className="text-[10px] text-terminal-primary">{evt.destinationAmount}</div>
                </div>
              </div>

              {/* Hashes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded-none bg-background border border-terminal-muted">
                  <div className="text-terminal-muted uppercase mb-0.5">Source Tx Hash</div>
                  <div className="text-terminal-primary truncate">{evt.sourceTxHash}</div>
                </div>
                {evt.destinationTxHash && (
                  <div className="p-2 rounded-none bg-background border border-terminal-muted">
                    <div className="text-terminal-muted uppercase mb-0.5">Destination Tx Hash</div>
                    <div className="text-emerald-300 truncate">{evt.destinationTxHash}</div>
                  </div>
                )}
              </div>

              {evt.notes && (
                <div className="text-xs text-amber-200/80 font-mono italic">{evt.notes}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   6. PATTERN DETECTION PAGE
════════════════════════════════════════════════════════════════════ */
export const PatternDetectionPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string>('rapid_passthrough');
  const navigate = useNavigate();

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await traceforgeService.getAlerts(undefined, 200);
      setAlerts(res.alerts || []);
    } catch (err) {
      console.error('Failed to load pattern alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const patternDefinitions = [
    {
      key: 'rapid_passthrough',
      title: 'Rapid Pass-Through & Peeling Chains',
      patternType: 'RAPID_PEELING_CHAIN',
      severity: 'CRITICAL',
      confidence: 96,
      description:
        'Immediate relay of incoming funds through intermediary transit wallets with minimal holding duration, indicating automated peeling chains or obfuscation.',
      recommendation:
        'Map downstream hops immediately and place compliance freeze notices on receiving VASP exchange deposit accounts.',
      signal: 'Holding duration < threshold with rapid secondary outflow',
    },
    {
      key: 'fan_out',
      title: 'Fan-Out Layering & High-Fanout Dispersion',
      patternType: 'FAN_OUT_DISPERSION',
      severity: 'HIGH',
      confidence: 91,
      description:
        'Single funding transaction immediately distributed across 3+ distinct recipient addresses to fragment amounts below AML reporting thresholds.',
      recommendation:
        'Cluster recipient wallets using common spending heuristics and trace downstream consolidations.',
      signal: 'High out-degree ratio within short time window',
    },
    {
      key: 'round_amount',
      title: 'Round Amount Structuring & Smurfing',
      patternType: 'ROUND_AMOUNT_STRUCTURING',
      severity: 'HIGH',
      confidence: 88,
      description:
        'Transactions denominated in clean integer increments (e.g. 1.0, 5.0, 10.0 ETH) matching automated OTC settlement or smurfing.',
      recommendation:
        'Correlate timestamps with known darknet vendor payment cycles and OTC desk trading hours.',
      signal: 'Amount modulo 1.0 == 0.0 with high value transfer',
    },
    {
      key: 'high_ml_risk',
      title: 'Supervised ML Anomaly Risk Scoring',
      patternType: 'ML_ANOMALY_DETECTION',
      severity: 'CRITICAL',
      confidence: 94,
      description:
        'Supervised Random Forest and graph anomaly detection models scored the wallet risk >= 0.70 based on centrality, velocity, and entropy.',
      recommendation:
        'Initiate priority compliance review and generate formal Suspicious Activity Report (SAR).',
      signal: 'Random forest anomaly score >= 0.70',
    },
  ];

  // Group alerts by pattern key
  const patternStats = patternDefinitions.map(p => {
    const matching = alerts.filter(a => a.reason.toLowerCase() === p.key.toLowerCase());
    const uniqueWallets = Array.from(new Set(matching.map(a => a.wallet_address)));
    return {
      ...p,
      incidents: matching.length,
      alerts: matching,
      wallets: uniqueWallets,
    };
  });

  const selectedPattern = patternStats.find(p => p.key === selectedKey) || patternStats[0];

  const totalIncidents = alerts.length;
  const criticalCount = alerts.filter(a => a.severity.toLowerCase() === 'critical').length;
  const overallScore = totalIncidents > 0 ? Math.min(96, Math.max(68, Math.round(75 + (criticalCount / totalIncidents) * 20))) : 88;

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-none bg-background shadow-none bg-background border border-terminal-muted flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            Live Pattern Detection & Heuristic Scoring Engine
            <span className="ml-2 px-1.5 py-0.5 bg-terminal-primary/20 border border-terminal-primary text-terminal-primary text-[10px]">
              {alerts.length} ALERTS IN DATABASE
            </span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
            Suspicious Pattern & Heuristic Telemetry
          </h1>
          <p className="text-xs text-terminal-muted font-mono mt-1">
            Explainable heuristic rules analyze fan-out dispersion, round amount structuring, rapid pass-through transit, and ML anomalies.
          </p>
        </div>

        <button
          onClick={loadAlerts}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-none bg-background hover:bg-terminal-primary hover:text-background text-terminal-primary border border-terminal-primary font-mono text-xs font-bold uppercase transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          [ REFRESH ALERTS ]
        </button>
      </div>

      {/* Risk Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Breakdown */}
        <div className="lg:col-span-1 p-5 rounded-none bg-background shadow-none border border-terminal-muted bg-background/90 space-y-4">
          <div className="font-bold text-terminal-primary flex items-center gap-2 font-mono uppercase text-sm">
            <Target className="w-4 h-4 text-red-400" />
            Network Risk Score Synthesis
          </div>

          <div className="text-center py-4">
            <div className="text-6xl font-black text-red-400 font-mono">{overallScore}</div>
            <div className="text-xs text-terminal-muted font-mono mt-1 uppercase">Composite Risk Score (/100)</div>
            <div className="mt-2 inline-block px-3 py-1 bg-red-950/60 border border-red-500/40 text-red-400 text-xs font-mono font-bold uppercase">
              HIGH / CRITICAL THREAT LEVEL
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-terminal-muted">
            <div className="text-[10px] font-mono text-terminal-muted uppercase">Detected Pattern Contributions</div>
            {patternStats.map(p => {
              const pct = totalIncidents > 0 ? Math.round((p.incidents / totalIncidents) * 100) : 25;
              return (
                <div key={p.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-terminal-primary text-[11px] truncate">{p.title}</span>
                    <span className="text-red-400 font-bold">{p.incidents} Hits ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-none overflow-hidden">
                    <div
                      className={`h-full ${p.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Patterns List */}
        <div className="lg:col-span-2 space-y-3">
          {patternStats.map(pattern => {
            const isSelected = selectedKey === pattern.key;
            return (
              <button
                key={pattern.key}
                onClick={() => setSelectedKey(pattern.key)}
                className={`w-full text-left p-4 rounded-none border transition-all space-y-2 ${
                  isSelected
                    ? 'bg-red-950/30 border-red-500/60 shadow-glow-cyber'
                    : 'bg-background border-terminal-muted hover:border-terminal-primary'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-terminal-primary font-mono text-sm uppercase">{pattern.title}</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                          pattern.severity === 'CRITICAL'
                            ? 'bg-red-950 text-red-300 border-red-500/40'
                            : 'bg-orange-950 text-orange-300 border-orange-500/40'
                        }`}
                      >
                        [{pattern.severity}]
                      </span>
                    </div>
                    <p className="text-xs text-terminal-muted font-mono mt-1 line-clamp-2">{pattern.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono text-terminal-muted pt-2 border-t border-terminal-muted/40">
                  <span>Type: <strong className="text-terminal-primary">{pattern.patternType}</strong></span>
                  <span>Confidence: <strong className="text-emerald-400">{pattern.confidence}%</strong></span>
                  <span>Incidents: <strong className="text-red-400 font-bold">{pattern.incidents} Recorded</strong></span>
                  <span>Affected Wallets: <strong className="text-terminal-primary">{pattern.wallets.length}</strong></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Pattern Detail */}
      {selectedPattern && (
        <div className="p-5 rounded-none bg-background border border-red-500/30 bg-red-950/10 space-y-4">
          <div className="font-bold text-terminal-primary flex items-center gap-2 font-mono text-base uppercase">
            <Fingerprint className="w-5 h-5 text-red-400" />
            Pattern Deep Analysis: {selectedPattern.title}
          </div>
          <p className="text-xs text-terminal-primary font-mono leading-relaxed">{selectedPattern.description}</p>

          {/* AI Recommendation */}
          <div className="p-4 rounded-none bg-background/90 border border-terminal-primary/40 space-y-2">
            <div className="flex items-center gap-2 text-terminal-primary font-mono text-xs font-bold uppercase">
              <Bot className="w-4 h-4" />
              AI Forensic Recommendation & Next Steps
            </div>
            <p className="text-xs text-terminal-primary font-mono leading-relaxed">{selectedPattern.recommendation}</p>
            <div className="text-[10px] text-terminal-muted font-mono uppercase">
              Detection Rule Signal: <span className="text-terminal-primary">{selectedPattern.signal}</span>
            </div>
          </div>

          {/* Real Detected Alert Incidents */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-terminal-primary font-bold uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                Latest Database Alert Incidents ({selectedPattern.alerts.length})
              </span>
              <span className="text-terminal-muted uppercase">Click Address to Open Intelligence</span>
            </div>

            {selectedPattern.alerts.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-terminal-muted border border-terminal-muted/40">
                No alerts recorded for this heuristic rule yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {selectedPattern.alerts.slice(0, 10).map(alert => (
                  <div
                    key={alert.id}
                    className="p-3 bg-background border border-terminal-muted hover:border-terminal-primary font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/wallets/${alert.wallet_address}`}
                          className="font-bold text-terminal-primary hover:underline truncate"
                        >
                          {alert.wallet_address}
                        </Link>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase border border-red-500 text-red-400">
                          [{alert.severity.toUpperCase()}]
                        </span>
                      </div>
                      <div className="text-[10px] text-terminal-muted mt-0.5">
                        Alert #{alert.id} · {new Date(alert.created_at).toLocaleString()}
                        {alert.tx_hash && (
                          <span className="ml-2">
                            TX: <a
                              href={`https://etherscan.io/tx/${alert.tx_hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-terminal-primary hover:underline"
                            >
                              {alert.tx_hash.slice(0, 16)}...
                            </a>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        onClick={() => navigate(`/wallets/${alert.wallet_address}`)}
                        className="bg-slate-900 hover:bg-slate-800 text-terminal-primary border border-terminal-muted text-[10px] py-1 px-2 h-auto"
                      >
                        [ Wallet Intel ]
                      </Button>
                      <Button
                        onClick={() => navigate(`/investigate?address=${alert.wallet_address}`)}
                        className="bg-terminal-primary text-background font-bold text-[10px] py-1 px-2 h-auto hover:bg-terminal-primary/80"
                      >
                        [ Trace ]
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   7. ALERTS CENTER PAGE
════════════════════════════════════════════════════════════════════ */
export const AlertsCenterPage: React.FC = () => {
  const [filter, setFilter] = useState('ALL');
  const [realAlerts, setRealAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const res = await traceforgeService.getAlerts(filter !== 'ALL' ? filter : undefined, 100);
      setRealAlerts(res.alerts || []);
    } catch (err) {
      console.warn("Could not fetch real alerts from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchAlerts();
    }, 3000);
    return () => clearInterval(timer);
  }, [autoRefresh, filter]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  // Critical and high counts
  const criticalCount = realAlerts.filter(a => a.severity.toUpperCase() === 'CRITICAL').length;
  const highCount = realAlerts.filter(a => a.severity.toUpperCase() === 'HIGH').length;
  const mediumCount = realAlerts.filter(a => a.severity.toUpperCase() === 'MEDIUM').length;
  const lowCount = realAlerts.filter(a => a.severity.toUpperCase() === 'LOW').length;

  const displayAlerts = filter === 'ALL'
    ? realAlerts
    : realAlerts.filter(a => a.severity.toUpperCase() === filter);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-none bg-background shadow-none border border-terminal-muted">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-red-400 font-bold uppercase tracking-wider mb-1">
              <Bell className="w-4 h-4 animate-pulse text-red-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400">Live Mempool AML Intercept Stream</span>
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
              Alerts Center
            </h1>
            <p className="text-xs text-terminal-muted font-mono mt-1">
              Real-time heuristic rule detections & ML risk flags generated by the live Ethereum mempool listener.
            </p>
          </div>

          {/* Status & Control Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-none text-xs font-mono font-bold border transition-all flex items-center gap-2 ${
                autoRefresh
                  ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400'
                  : 'border-terminal-muted bg-slate-800 text-terminal-muted'
              }`}
              title="Toggle automatic 3-second live polling"
            >
              <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
              {autoRefresh ? 'AUTO-STREAM (3s)' : 'POLLING PAUSED'}
            </button>

            <Button
              onClick={() => { setLoading(true); fetchAlerts(); }}
              className="bg-terminal-primary hover:bg-terminal-primary text-background font-mono font-bold text-xs px-4"
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <div className="flex items-center gap-2 p-2.5 rounded-none bg-red-950/40 border border-red-500/30 text-red-400 text-sm font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              {criticalCount} CRITICAL | {highCount} HIGH
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Telemetry Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'ALL', count: realAlerts.length },
            { label: 'CRITICAL', count: criticalCount },
            { label: 'HIGH', count: highCount },
            { label: 'MEDIUM', count: mediumCount },
            { label: 'LOW', count: lowCount },
          ].map(f => (
            <button
              key={f.label}
              onClick={() => setFilter(f.label)}
              className={`px-4 py-2 rounded-none font-bold transition-all border ${
                filter === f.label
                  ? 'bg-terminal-primary text-background border-terminal-primary'
                  : 'bg-slate-800 text-terminal-muted hover:text-terminal-primary border-terminal-muted'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        <div className="text-terminal-muted font-mono text-xs flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-terminal-primary" />
          <span>Total Database Alerts: <strong className="text-terminal-primary">{realAlerts.length}</strong></span>
        </div>
      </div>

      {/* Alerts Feed Grid */}
      {displayAlerts.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-terminal-muted bg-background/50 space-y-3 font-mono">
          <ShieldAlert className="w-8 h-8 text-terminal-muted mx-auto animate-bounce" />
          <p className="text-sm font-bold text-terminal-primary">
            {loading ? 'Fetching live alerts...' : `No ${filter !== 'ALL' ? filter : ''} alerts found in database.`}
          </p>
          <p className="text-xs text-terminal-muted max-w-md mx-auto">
            The Ethereum listener is actively streaming mempool transactions (&ge; 0.1 ETH). Live heuristic checks will populate here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayAlerts.map(alert => {
            const sev = alert.severity.toUpperCase();
            const isCritical = sev === 'CRITICAL';
            const isHigh = sev === 'HIGH';
            const isMedium = sev === 'MEDIUM';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-none border space-y-3 bg-background shadow-none transition-all hover:border-terminal-primary ${
                  isCritical ? 'border-red-500/40 bg-red-950/10' :
                  isHigh ? 'border-orange-500/30 bg-orange-950/10' :
                  isMedium ? 'border-amber-500/30 bg-amber-950/10' :
                  'border-cyan-500/30 bg-cyan-950/10'
                }`}
              >
                {/* Header row: Heuristic Reason & Severity Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertTriangle className={`w-4 h-4 shrink-0 ${
                        isCritical ? 'text-red-400 animate-pulse' :
                        isHigh ? 'text-orange-400' :
                        isMedium ? 'text-amber-400' : 'text-cyan-400'
                      }`} />
                      <span className="font-bold text-terminal-primary font-mono text-sm tracking-wide">
                        AML ALERT: {alert.reason.toUpperCase().replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Target Wallet with Quick Copy */}
                    <div className="flex items-center gap-2 text-xs font-mono text-terminal-muted">
                      <span className="text-slate-400">Wallet:</span>
                      <span className="text-terminal-primary font-bold truncate max-w-[240px]">
                        {alert.wallet_address}
                      </span>
                      <button
                        onClick={() => handleCopy(alert.wallet_address)}
                        className="text-terminal-muted hover:text-terminal-primary p-0.5"
                        title="Copy Wallet Address"
                      >
                        {copiedText === alert.wallet_address ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Transaction Hash */}
                    {alert.tx_hash && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-terminal-muted mt-1">
                        <span className="text-slate-500">Tx:</span>
                        <span className="truncate max-w-[200px] text-slate-300">
                          {alert.tx_hash.slice(0, 14)}...{alert.tx_hash.slice(-8)}
                        </span>
                        <button
                          onClick={() => handleCopy(alert.tx_hash!)}
                          className="text-terminal-muted hover:text-terminal-primary p-0.5"
                          title="Copy Tx Hash"
                        >
                          {copiedText === alert.tx_hash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <span className={`shrink-0 px-2.5 py-1 rounded-none text-[10px] font-mono font-bold border tracking-wider ${
                    isCritical ? 'bg-red-950/80 text-red-300 border-red-500/50' :
                    isHigh ? 'bg-orange-950/80 text-orange-300 border-orange-500/50' :
                    isMedium ? 'bg-amber-950/80 text-amber-300 border-amber-500/50' :
                    'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                  }`}>
                    [{sev}]
                  </span>
                </div>

                {/* Telemetry & Metadata Row */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-terminal-muted pt-2 border-t border-terminal-muted/60">
                  <div>
                    <span className="text-slate-500">ML Risk Score: </span>
                    <strong className={alert.risk_score && alert.risk_score >= 0.7 ? "text-red-400" : "text-terminal-primary"}>
                      {alert.risk_score != null ? `${(alert.risk_score * 100).toFixed(1)}%` : 'Rule Heuristic'}
                    </strong>
                  </div>
                  <div className="text-right flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Direct Action Link to Wallet Forensics */}
                <div className="flex items-center justify-between pt-2 border-t border-terminal-muted/40 font-mono text-xs">
                  <span className="text-[10px] text-terminal-muted uppercase">ID: #{alert.id}</span>
                  <div className="flex gap-3">
                    <Link
                      to={`/wallets/${alert.wallet_address}`}
                      className="text-terminal-primary hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Investigate Wallet</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   8. EVIDENCE VAULT PAGE
════════════════════════════════════════════════════════════════════ */
export const EvidenceVaultPage: React.FC = () => {
  const [evidence, setEvidence] = useState<EvidenceItem[]>(mockEvidence);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [custodyItem, setCustodyItem] = useState<EvidenceItem | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-5 rounded-none bg-background shadow-none bg-background border border-terminal-muted">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4" />
            Forensic Evidence Management
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
            Evidence Vault & Chain of Custody
          </h1>
          <p className="text-xs text-terminal-muted font-mono mt-1">
            Maintain immutable, court-admissible forensic evidence with full chain of custody audit trails.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-terminal-primary hover:bg-terminal-primary text-background font-bold text-xs">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Evidence
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Total Evidence" value={String(evidence.length)} subtitle="Items Logged" icon={Lock} color="cyan" />
        <StatCard title="On-Chain Proofs" value={String(evidence.filter(e => e.type === 'Transaction Record').length)} subtitle="Blockchain Records" icon={Hash} color="purple" />
        <StatCard title="Documents" value={String(evidence.filter(e => e.type === 'Document').length)} subtitle="Uploaded Files" icon={FileText} color="blue" />
        <StatCard title="Flagged Items" value={String(evidence.filter(e => e.isFlagged).length)} subtitle="Require Review" icon={Flag} color="red" />
      </div>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidence.map(item => (
          <EvidenceCard
            key={item.id}
            item={item}
            onViewCustody={() => setCustodyItem(item)}
          />
        ))}
      </div>

      <AddEvidenceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={(item) => setEvidence([item, ...evidence])}
        caseId="case-2026-0142"
      />

      {custodyItem && (
        <ChainOfCustodyModal
          isOpen={!!custodyItem}
          onClose={() => setCustodyItem(null)}
          evidence={custodyItem}
        />
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   9. TIMELINE RECONSTRUCTION PAGE
════════════════════════════════════════════════════════════════════ */
export const TimelinePage: React.FC = () => {
  const allEvents = [
    ...mockTransactions.map(t => ({
      id: t.id, time: t.timestamp, type: 'Transaction',
      title: `${t.type || 'Transfer'}: ${t.amount} ${t.currency}`,
      detail: `From: ${t.fromAddress.slice(0, 18)}… → To: ${t.toAddress.slice(0, 18)}…`,
      risk: t.riskLevel, color: 'cyan'
    })),
    ...mockSuspiciousPatterns.map(p => ({
      id: p.id, time: p.detectedAt || '2026-08-14 11:30 UTC', type: 'Pattern Alert',
      title: p.title, detail: p.description,
      risk: p.severity as string, color: 'red'
    })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-none bg-background shadow-none bg-background border border-terminal-muted">
        <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase uppercase tracking-wider mb-1">
          <History className="w-4 h-4" />
          Forensic Timeline Engine
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
          Crime Timeline Reconstruction
        </h1>
        <p className="text-xs text-terminal-muted font-mono mt-1">
          Chronological reconstruction of the full crime timeline from initial intrusion to cash-out. Total {allEvents.length} forensic events.
        </p>
      </div>

      {/* Timeline */}
      <div className="p-5 rounded-none bg-background shadow-none border border-terminal-muted bg-background/90 space-y-2">
        <div className="relative space-y-4">
          {allEvents.map((evt, i) => (
            <div key={evt.id} className="flex gap-4 group">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${
                  evt.type === 'Pattern Alert' ? 'bg-red-400' : 'bg-cyan-400'
                }`} />
                {i < allEvents.length - 1 && (
                  <div className="w-px flex-1 bg-slate-800 mt-1" />
                )}
              </div>

              {/* Event Content */}
              <div className="flex-1 pb-4">
                <div className={`p-3.5 rounded-none border transition-all space-y-1.5 ${
                  evt.type === 'Pattern Alert'
                    ? 'bg-red-950/20 border-red-500/20 hover:border-red-500/40'
                    : 'bg-background border-terminal-muted hover:border-cyan-500/20'
                }`}>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        evt.type === 'Pattern Alert' ? 'bg-red-950 text-red-300 border border-red-500/30' : 'bg-cyan-950 text-terminal-primary border border-cyan-500/30'
                      }`}>
                        {evt.type}
                      </span>
                      <span className="text-terminal-muted">{evt.time.slice(0, 19)} UTC</span>
                    </div>
                    {evt.risk && <RiskBadge level={evt.risk as any} size="sm" />}
                  </div>
                  <div className="font-bold text-terminal-primary font-mono text-sm">{evt.title}</div>
                  <div className="text-terminal-muted text-xs font-mono">{evt.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   10. EXCHANGE & KYC INTEL PAGE
════════════════════════════════════════════════════════════════════ */
export const ExchangeKYCPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-none bg-background shadow-none bg-background border border-terminal-muted">
        <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase uppercase tracking-wider mb-1">
          <Building2 className="w-4 h-4" />
          VASP & Exchange Intelligence
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
          Exchange & KYC Intelligence
        </h1>
        <p className="text-xs text-terminal-muted font-mono mt-1">
          Track VASP interactions, KYC request status, asset freeze orders, and exchange cooperation for suspect accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockExchanges.map(exchange => (
          <div key={exchange.id} className="p-5 rounded-none bg-background shadow-none border border-terminal-muted hover:border-cyan-500/30 transition-all space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold uppercase tracking-widest text-terminal-primary font-mono">{exchange.name}</div>
                <div className="text-[11px] font-mono text-terminal-muted mt-0.5">{exchange.vaspType} · {exchange.jurisdiction}</div>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                exchange.riskLevel === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-500/30' :
                exchange.riskLevel === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-500/30' :
                'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
              }`}>
                {exchange.riskLevel} RISK
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2 rounded-none bg-background border border-terminal-muted">
                <div className="text-terminal-muted text-[10px] uppercase">Compliance</div>
                <div className={`font-bold mt-0.5 text-[11px] ${
                  exchange.complianceStatus === 'Cooperative' ? 'text-emerald-400' :
                  exchange.complianceStatus === 'Sanctioned' ? 'text-red-400' :
                  'text-amber-400'
                }`}>{exchange.complianceStatus}</div>
              </div>
              <div className="p-2 rounded-none bg-background border border-terminal-muted">
                <div className="text-terminal-muted text-[10px] uppercase">Total Received</div>
                <div className="font-bold text-terminal-primary mt-0.5 text-[11px]">{exchange.totalReceivedCrypto}</div>
              </div>
              <div className="p-2 rounded-none bg-background border border-terminal-muted">
                <div className="text-terminal-muted text-[10px] uppercase">Fiat Value</div>
                <div className="font-bold text-emerald-400 mt-0.5 text-[11px]">{exchange.totalReceivedFiat}</div>
              </div>
              <div className="p-2 rounded-none bg-background border border-terminal-muted">
                <div className="text-terminal-muted text-[10px] uppercase">Account Status</div>
                <div className={`font-bold mt-0.5 text-[11px] truncate ${
                  exchange.simulatedKyc?.accountStatus?.includes('Frozen') ? 'text-red-400' :
                  exchange.simulatedKyc?.accountStatus?.includes('Investigation') ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>{exchange.simulatedKyc?.accountStatus || 'No KYC Record'}</div>
              </div>
            </div>

            {exchange.geoLocation && (
              <div className="p-2.5 rounded-none bg-background border border-terminal-muted text-xs font-mono">
                <div className="text-terminal-muted text-[10px] uppercase mb-0.5">Jurisdiction</div>
                <div className="text-terminal-primary">{exchange.geoLocation.city}, {exchange.geoLocation.country}</div>
                <div className="text-[10px] text-terminal-muted">{exchange.geoLocation.indicatorType}</div>
              </div>
            )}

            {exchange.simulatedKyc?.customerReference && (
              <div className="p-2.5 rounded-none border border-amber-500/20 bg-amber-950/10 text-xs font-mono text-amber-300">
                🔒 KYC Ref: {exchange.simulatedKyc.customerReference}
              </div>
            )}

            <div className="text-[10px] font-mono text-terminal-muted">
              Network: <span className="text-terminal-primary font-bold">{exchange.network}</span>
              {' · '}Deposit: <span className="text-terminal-primary">{exchange.depositAddress.slice(0, 18)}…</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   11. AI FORENSIC COPILOT PAGE
════════════════════════════════════════════════════════════════════ */
export const CopilotPage: React.FC = () => {
  return (
    <div className="space-y-4 h-full">
      <div className="p-5 rounded-none bg-background shadow-none bg-background border border-terminal-muted">
        <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          AI Investigation Copilot
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
          AI Forensic Copilot — TRACEFORGE Intelligence
        </h1>
        <p className="text-xs text-terminal-muted font-mono mt-1">
          Ask the AI copilot anything about transactions, wallet clusters, risk patterns, or get automated investigation summaries.
        </p>
      </div>

      {/* Full copilot chat */}
      <div className="rounded-none bg-background shadow-none border border-terminal-muted overflow-hidden" style={{ height: 'calc(100vh - 290px)', minHeight: 480 }}>
        <CopilotChat caseId="case-2026-0142" />
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   12. FORENSIC REPORTS PAGE
════════════════════════════════════════════════════════════════════ */
interface ForensicReportItem {
  id: string;
  title: string;
  caseId: string;
  type: string;
  status: string;
  pages: number;
  preparedBy: string;
  date: string;
  address?: string;
  sections: string[];
}

const DEFAULT_REPORTS: ForensicReportItem[] = [
  {
    id: 'RPT-2026-001', title: 'Mumbai Hospital Ransomware — Complete Forensic Dossier',
    caseId: 'CASE-2026-0142', type: 'Full Investigation Report', status: 'FINAL',
    pages: 42, preparedBy: 'Insp. Vikram Rathore', date: '2026-08-20',
    address: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
    sections: ['Executive Summary', 'Transaction Trail', 'Wallet Cluster Analysis', 'Cross-Chain Tracing', 'Evidence Log', 'Legal Recommendations']
  },
  {
    id: 'RPT-2026-002', title: 'Pig Butchering Syndicate — Behavioral Analysis',
    caseId: 'CASE-2026-0219', type: 'Intelligence Report', status: 'DRAFT',
    pages: 18, preparedBy: 'Sub-Insp. Priya Nair', date: '2026-08-19',
    sections: ['Summary', 'Victim Analysis', 'Suspect Wallet Network', 'Recommendations']
  },
  {
    id: 'RPT-2026-003', title: 'DeFi Flash Loan Attack — Technical Forensic Report',
    caseId: 'CASE-2026-0331', type: 'Technical Report', status: 'UNDER_REVIEW',
    pages: 28, preparedBy: 'Dr. Arjun Mehta', date: '2026-08-18',
    sections: ['Smart Contract Analysis', 'Attack Vector Reconstruction', 'Fund Flow Trace', 'Evidence']
  },
];

const REPORTS_STORAGE_KEY = 'traceforge_saved_reports';

export const ForensicReportsPage: React.FC = () => {
  const { activeWallet, setActiveWallet } = useActiveWallet();
  const [searchParams] = useSearchParams();
  const activeTargetAddress = (activeWallet || searchParams.get('address') || '').trim();

  const [inputAddress, setInputAddress] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Persistent report archive
  const [reports, setReports] = useState<ForensicReportItem[]>(() => {
    try {
      const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved reports:', e);
    }
    return DEFAULT_REPORTS;
  });

  const saveReports = (newReports: ForensicReportItem[]) => {
    setReports(newReports);
    try {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(newReports));
    } catch (e) {
      console.warn('Failed to save reports to localStorage:', e);
    }
  };

  const effectiveAddress = (inputAddress.trim() || activeTargetAddress).trim();

  // Paste from clipboard helper
  const handlePaste = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setInputAddress(text.trim());
      }
    } catch {
      // ignore clipboard error
    }
  };

  // Generate and archive a report
  const handleGenerateReport = async (addressToUse?: string, cardActionId?: string) => {
    const rawAddress = (addressToUse || effectiveAddress).trim();

    if (!rawAddress) {
      setError('Please paste or enter an Ethereum wallet address, or select an active target.');
      return;
    }

    if (!rawAddress.startsWith('0x') || rawAddress.length !== 42) {
      setError(`Invalid address "${rawAddress}". Must be a 42-character Ethereum hex address starting with 0x.`);
      return;
    }

    const cleanAddress = rawAddress.toLowerCase();
    setIsGenerating(true);
    if (cardActionId) setActionLoadingId(cardActionId);
    setError(null);
    setSuccessMessage(null);

    try {
      const blob = await traceforgeService.getReport(cleanAddress);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `report-${cleanAddress}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Save report in archive
      const existingIndex = reports.findIndex(r => r.address?.toLowerCase() === cleanAddress);
      let updatedReports: ForensicReportItem[];

      if (existingIndex >= 0) {
        const existing = reports[existingIndex];
        const updated = {
          ...existing,
          date: new Date().toISOString().split('T')[0],
          status: 'FINAL',
        };
        updatedReports = [updated, ...reports.filter((_, idx) => idx !== existingIndex)];
      } else {
        const nextNum = reports.length + 1;
        const newReport: ForensicReportItem = {
          id: `RPT-2026-${String(nextNum).padStart(3, '0')}`,
          title: `Forensic Intelligence Audit — ${cleanAddress.slice(0, 10)}...${cleanAddress.slice(-8)}`,
          caseId: `CASE-${cleanAddress.slice(2, 8).toUpperCase()}`,
          type: 'Automated AML Audit Report',
          status: 'FINAL',
          pages: 14,
          preparedBy: 'TraceForge Forensics Engine',
          date: new Date().toISOString().split('T')[0],
          address: cleanAddress,
          sections: ['Executive Summary', 'Transaction Trail', 'Wallet Cluster Analysis', 'Heuristic Flags', 'Audit Evidence Log']
        };
        updatedReports = [newReport, ...reports];
      }

      saveReports(updatedReports);
      if (!activeWallet) setActiveWallet(cleanAddress);

      setSuccessMessage(`Forensic report for ${cleanAddress.slice(0, 8)}...${cleanAddress.slice(-6)} successfully generated, downloaded, and saved to archive.`);
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setError(err.message || 'Failed to generate PDF report from backend. Ensure the wallet has been ingested.');
    } finally {
      setIsGenerating(false);
      setActionLoadingId(null);
    }
  };

  // Preview in new browser tab
  const handlePreviewReport = async (report: ForensicReportItem) => {
    const address = (report.address || effectiveAddress).trim();
    if (!address) {
      setError(`No wallet address attached to ${report.id}. Please paste a wallet address above to preview.`);
      return;
    }

    setActionLoadingId(`preview-${report.id}`);
    setError(null);

    try {
      const blob = await traceforgeService.getReport(address);
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err: any) {
      console.error('Failed to preview report:', err);
      setError(err.message || `Failed to preview report for ${report.id}.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete an archived card from local storage
  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = reports.filter(r => r.id !== id);
    saveReports(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="p-5 rounded-none bg-background shadow-none border border-terminal-muted space-y-1">
        <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          Forensic Intelligence Reports
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
          Forensic Report Generator & Dossier Archive
        </h1>
        <p className="text-xs text-terminal-muted font-mono mt-1">
          Court-admissible forensic intelligence reports for law enforcement, financial regulators, and judicial proceedings.
        </p>
      </div>

      {/* Manual Wallet Input & Generator Card */}
      <div className="p-5 rounded-none bg-background border border-terminal-muted space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-terminal-muted pb-3">
          <div className="font-mono text-xs font-bold text-terminal-primary flex items-center gap-2 uppercase tracking-wide">
            <Fingerprint className="w-4 h-4 text-terminal-primary" />
            <span>Generate & Save Forensic Audit Dossier</span>
          </div>

          {activeTargetAddress && (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-terminal-muted text-[11px]">ACTIVE TARGET:</span>
              <span className="text-terminal-primary font-bold">{activeTargetAddress.slice(0, 6)}...{activeTargetAddress.slice(-4)}</span>
              <button
                type="button"
                onClick={() => setInputAddress(activeTargetAddress)}
                className="text-[10px] uppercase font-bold text-terminal-primary underline hover:text-terminal-primary/80"
              >
                [ USE TARGET ]
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-3">
          <div className="flex-1 flex items-center border border-terminal-muted bg-slate-950/60 focus-within:border-terminal-primary transition-colors">
            <div className="px-3 py-2 text-terminal-muted font-mono text-xs select-none">
              0x
            </div>
            <input
              type="text"
              value={inputAddress.startsWith('0x') ? inputAddress.slice(2) : inputAddress}
              onChange={(e) => {
                const val = e.target.value.trim();
                setInputAddress(val ? (val.startsWith('0x') ? val : `0x${val}`) : '');
              }}
              placeholder="Paste or type Ethereum wallet address (0x...) to generate & save report"
              className="flex-1 bg-transparent border-none py-2 pr-3 text-terminal-primary font-mono text-xs placeholder:text-terminal-muted/50 focus:outline-none"
            />
            {inputAddress && (
              <button
                type="button"
                onClick={() => setInputAddress('')}
                className="px-2.5 text-terminal-muted hover:text-terminal-primary text-xs font-mono"
                title="Clear input"
              >
                CLEAR
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              className="px-3 py-2 border-l border-terminal-muted bg-slate-900/60 hover:bg-slate-800 text-terminal-primary text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              title="Paste from clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>PASTE</span>
            </button>
          </div>

          <Button
            onClick={() => handleGenerateReport()}
            disabled={!effectiveAddress || isGenerating}
            title={
              !effectiveAddress
                ? 'Enter or paste a wallet address (or select an active target) to generate its forensic report.'
                : `Generate, download, and archive court-admissible PDF report for ${effectiveAddress}`
            }
            className={`font-mono text-xs font-bold whitespace-nowrap transition-colors px-5 py-2.5 ${
              !effectiveAddress
                ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
                : 'bg-terminal-primary hover:bg-terminal-primary/90 text-background'
            }`}
          >
            {isGenerating && !actionLoadingId ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                Generating & Archiving...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1.5" />
                Generate & Save Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error notification banner */}
      {error && (
        <div className="flex items-start justify-between p-3.5 rounded-none bg-red-950/80 border border-red-500/60 text-red-200 font-mono text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-300 uppercase tracking-wide">Report Generation Error</div>
              <div className="text-red-200/90 mt-0.5">{error}</div>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200 p-1"
            title="Dismiss error"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success notification banner */}
      {successMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-none bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 p-1"
            title="Dismiss"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Archive Header */}
      <div className="flex items-center justify-between font-mono text-xs text-terminal-muted border-b border-terminal-muted pb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-terminal-primary" />
          <span className="font-bold uppercase text-terminal-primary">
            ARCHIVED DOSSIERS & REPORTS ({reports.length})
          </span>
        </div>
        <button
          type="button"
          onClick={() => saveReports(DEFAULT_REPORTS)}
          className="text-[10px] text-terminal-muted hover:text-terminal-primary uppercase underline"
        >
          [ Reset Default Templates ]
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {reports.map(report => {
          const isPreviewing = actionLoadingId === `preview-${report.id}`;
          const isExporting = actionLoadingId === `export-${report.id}`;
          const hasAddress = Boolean(report.address);

          return (
            <div key={report.id} className="p-5 rounded-none bg-background shadow-none border border-terminal-muted hover:border-terminal-primary/40 transition-all space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1 font-mono text-xs">
                    <span className="text-terminal-muted">{report.id}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      report.status === 'FINAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                      report.status === 'DRAFT' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                      'bg-blue-950 text-blue-300 border border-blue-500/30'
                    }`}>
                      {report.status}
                    </span>
                    {hasAddress && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold">
                        AUDITED
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-terminal-primary font-mono text-sm line-clamp-2">{report.title}</div>
                </div>

                {hasAddress && (
                  <button
                    onClick={(e) => handleDeleteReport(report.id, e)}
                    className="text-terminal-muted hover:text-terminal-error p-1 transition-colors"
                    title="Remove from archived dossiers"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Target Address Pill if saved */}
              {report.address && (
                <div className="px-2 py-1 bg-slate-900 border border-terminal-muted font-mono text-[11px] text-terminal-primary flex items-center justify-between">
                  <span className="truncate font-bold">WALLET: {report.address}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(report.address!);
                      setSuccessMessage(`Copied ${report.address} to clipboard.`);
                    }}
                    className="text-terminal-muted hover:text-terminal-primary ml-2 shrink-0"
                    title="Copy wallet address"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-1.5 font-mono text-xs text-terminal-muted">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>{report.type} · {report.pages} pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>{report.preparedBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span>{report.date}</span>
                </div>
              </div>

              {/* Sections */}
              <div>
                <div className="text-[10px] font-mono text-terminal-muted uppercase mb-1.5">Included Sections</div>
                <div className="flex flex-wrap gap-1">
                  {report.sections.map(s => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-slate-800 border border-terminal-muted text-[10px] font-mono text-terminal-primary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-terminal-muted">
                <Button
                  onClick={() => handlePreviewReport(report)}
                  disabled={(!report.address && !effectiveAddress) || isPreviewing}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-terminal-primary border border-terminal-muted text-xs font-bold disabled:opacity-50"
                  title="Open PDF preview in a new browser tab"
                >
                  {isPreviewing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Preview
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleGenerateReport(report.address || effectiveAddress, `export-${report.id}`)}
                  disabled={(!report.address && !effectiveAddress) || isExporting}
                  className="flex-1 bg-terminal-primary hover:bg-terminal-primary text-background font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download court-admissible PDF file"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Export PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   13. SETTINGS & AUDIT PAGE
════════════════════════════════════════════════════════════════════ */
export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-none bg-background shadow-none bg-background border border-terminal-muted">
        <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary font-bold uppercase uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          System Configuration & Audit
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-terminal-primary tracking-tight font-mono">
          Settings & System Audit Log
        </h1>
        <p className="text-xs text-terminal-muted font-mono mt-1">
          SOC configuration, API node status, investigator permissions, and immutable audit trail.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <div className="space-y-4">
          <div className="p-5 rounded-none bg-background shadow-none border border-terminal-muted space-y-4">
            <div className="font-bold text-terminal-primary flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              Node & API Status
            </div>
            {[
              { name: 'Bitcoin Node (Full)', status: 'ONLINE', latency: '12ms', color: 'emerald' },
              { name: 'Ethereum RPC', status: 'ONLINE', latency: '8ms', color: 'emerald' },
              { name: 'Polygon Node', status: 'ONLINE', latency: '15ms', color: 'emerald' },
              { name: 'THORChain API', status: 'DEGRADED', latency: '340ms', color: 'amber' },
              { name: 'OFAC Sanctions Feed', status: 'ONLINE', latency: '22ms', color: 'emerald' },
              { name: 'Chainalysis Reactor', status: 'OFFLINE', latency: 'N/A', color: 'red' },
            ].map(node => (
              <div key={node.name} className="flex items-center justify-between p-3 rounded-none bg-background border border-terminal-muted font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    node.color === 'emerald' ? 'bg-emerald-400' :
                    node.color === 'amber' ? 'bg-amber-400' : 'bg-red-400'
                  } ${node.status === 'ONLINE' ? 'animate-pulse' : ''}`} />
                  <span className="text-terminal-primary">{node.name}</span>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-[11px] ${
                    node.color === 'emerald' ? 'text-emerald-400' :
                    node.color === 'amber' ? 'text-amber-400' : 'text-red-400'
                  }`}>{node.status}</div>
                  <div className="text-terminal-muted text-[10px]">{node.latency}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Investigator Profile */}
          <div className="p-5 rounded-none bg-background shadow-none border border-terminal-muted space-y-3">
            <div className="font-bold text-terminal-primary flex items-center gap-2">
              <Shield className="w-4 h-4 text-terminal-primary" />
              Logged-In Investigator
            </div>
            <div className="flex items-center gap-3 p-3 rounded-none bg-background border border-terminal-muted">
              <div className="w-12 h-12 rounded-none bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-terminal-primary font-mono font-bold text-lg">
                VR
              </div>
              <div>
                <div className="font-bold text-terminal-primary text-sm font-mono">Insp. Vikram Rathore</div>
                <div className="text-[11px] text-terminal-muted font-mono">BADGE: SOC-941 · FIU-IND</div>
                <div className="text-[11px] text-terminal-primary font-mono">CLEARANCE: LEVEL-5 (FULL ACCESS)</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Case Management', 'Evidence Seal', 'Freeze Orders', 'Export Reports', 'Cluster Analysis'].map(p => (
                <span key={p} className="px-2 py-0.5 rounded-none bg-cyan-950/30 border border-cyan-500/20 text-[10px] font-mono text-terminal-primary">
                  ✓ {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="lg:col-span-2 p-5 rounded-none bg-background shadow-none border border-terminal-muted space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
            <div className="font-bold text-terminal-primary flex items-center gap-2">
              <Terminal className="w-4 h-4 text-terminal-primary" />
              Immutable SOC Audit Log
            </div>
            <Button className="bg-slate-800 hover:bg-slate-700 border border-terminal-muted text-terminal-primary text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Log
            </Button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {mockAuditLogs.map(log => (
              <div key={log.id} className="p-3.5 rounded-none bg-background border border-terminal-muted hover:border-terminal-muted font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-terminal-primary">{log.action}</span>
                  <span className="text-terminal-muted text-[10px]">{log.timestamp.slice(0, 19)} UTC</span>
                </div>
                <div className="text-terminal-primary font-mono font-medium">{log.targetObject}</div>
                <div className="flex items-center justify-between text-[10px] text-terminal-muted">
                  <span>Officer: <strong className="text-terminal-muted">{log.user}</strong></span>
                  <span className="text-emerald-400 font-bold">{log.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
