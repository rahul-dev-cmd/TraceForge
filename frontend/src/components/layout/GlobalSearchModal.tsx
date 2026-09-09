import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wallet, ArrowRightLeft, ShieldAlert, Users, FileText, X, ArrowRight } from 'lucide-react';
import { blockchainService } from '../../services/blockchainService';
import { investigationService } from '../../services/investigationService';
import { WalletEntity } from '../../types/wallet';
import { TransactionEntity } from '../../types/transaction';
import { WalletCluster } from '../../types/cluster';
import { InvestigationCase } from '../../types/investigation';
import { truncateAddress, truncateHash } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    wallets: WalletEntity[];
    transactions: TransactionEntity[];
    clusters: WalletCluster[];
    cases: InvestigationCase[];
  }>({ wallets: [], transactions: [], clusters: [], cases: [] });
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled externally or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ wallets: [], transactions: [], clusters: [], cases: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { wallets, transactions, clusters } = await blockchainService.searchGlobal(query);
        const allCases = await investigationService.getCases();
        const q = query.toLowerCase();
        const cases = allCases.filter(c => 
          c.caseNumber.toLowerCase().includes(q) || 
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q)
        );

        setResults({ wallets, transactions, clusters, cases });
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  const totalResults = 
    results.wallets.length + 
    results.transactions.length + 
    results.clusters.length + 
    results.cases.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in" 
      />

      {/* Search Palette */}
      <div className="relative w-full max-w-2xl glass-panel bg-background-surface border border-border-bright rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3.5 border-b border-border/80 bg-background-subtle/70">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search wallet (0x...), tx hash, case ID (CASE-2026-0142), cluster..."
            className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-slate-500 font-mono"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded border border-border ml-2 shrink-0">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {isSearching && (
            <div className="py-8 text-center text-xs font-mono text-cyan-400/80 animate-pulse">
              Scanning forensic index...
            </div>
          )}

          {!isSearching && query && totalResults === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              No blockchain entities, transactions, or cases matching &ldquo;{query}&rdquo;.
            </div>
          )}

          {/* Quick Suggestions when empty */}
          {!query && (
            <div className="py-4 space-y-3 text-xs">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold px-2">
                Suggested Forensic Queries
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelect('/investigations/case-2026-0142')}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-background-subtle/50 hover:bg-cyan-500/10 border border-border hover:border-cyan-500/40 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-300">
                        CASE-2026-0142
                      </div>
                      <div className="text-[10px] text-slate-400">Mumbai Healthcare Ransomware</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                </button>

                <button
                  onClick={() => handleSelect('/wallets/bc1q9x7y4z2w8u1v0k5a3b7c9d1e3f5g7h9j2k4l6m')}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-background-subtle/50 hover:bg-cyan-500/10 border border-border hover:border-cyan-500/40 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-semibold font-mono text-slate-200 group-hover:text-cyan-300">
                        bc1q9x7...4l6m
                      </div>
                      <div className="text-[10px] text-slate-400">Ransomware Extortion Collector</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                </button>
              </div>
            </div>
          )}

          {/* Cases */}
          {results.cases.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                Investigations ({results.cases.length})
              </div>
              <div className="space-y-1">
                {results.cases.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(`/investigations/${c.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-white group-hover:text-cyan-300">
                        {c.caseNumber} — {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {c.category} • Loss: {c.estimatedLossFiat} ({c.estimatedLossCrypto})
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30">
                      {c.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallets */}
          {results.wallets.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                Wallets & Entities ({results.wallets.length})
              </div>
              <div className="space-y-1">
                {results.wallets.map(w => (
                  <button
                    key={w.address}
                    onClick={() => handleSelect(`/wallets/${w.address}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div>
                      <div className="font-mono text-xs text-slate-200 group-hover:text-cyan-300">
                        {truncateAddress(w.address, 10, 6)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {w.label || w.classification} • {w.network} • Balance: {w.balanceCrypto}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-border">
                      Risk {w.riskScore}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          {results.transactions.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                Transactions ({results.transactions.length})
              </div>
              <div className="space-y-1">
                {results.transactions.map(t => (
                  <button
                    key={t.hash}
                    onClick={() => handleSelect(`/transactions/${t.hash}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div>
                      <div className="font-mono text-xs text-slate-200 group-hover:text-cyan-300">
                        {truncateHash(t.hash, 10)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.amountCrypto} {t.asset} ({t.amountFiatUsd}) • {t.network}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30">
                      {t.riskLevel}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clusters */}
          {results.clusters.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Wallet Clusters ({results.clusters.length})
              </div>
              <div className="space-y-1">
                {results.clusters.map(cl => (
                  <button
                    key={cl.id}
                    onClick={() => handleSelect(`/clusters`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-white group-hover:text-cyan-300">
                        {cl.id} — {cl.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cl.memberWallets.length} Associated Wallets • Value: {cl.estimatedTotalValueCrypto}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                      {cl.confidenceScore}% Conf.
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/80 bg-background-subtle/50 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Navigate using search or direct entity shortcuts</span>
          <span>Simulation Environment</span>
        </div>
      </div>
    </div>
  );
};
