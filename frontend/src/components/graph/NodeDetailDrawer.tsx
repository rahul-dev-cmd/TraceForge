import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck,
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  Layers, 
  Building2, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Tag,
  AlertTriangle,
  History,
  Lock,
  Globe,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { WalletEntity } from '../../types/wallet';
import { RiskBadge } from '../ui/RiskBadge';
import { traceforgeService, WalletAttributionResponse } from '../../services/traceforgeService';

interface NodeDetailDrawerProps {
  wallet: WalletEntity | null;
  onClose: () => void;
  onTraceForward?: (address: string) => void;
  onTraceBackward?: (address: string) => void;
  onAddEvidence?: (wallet: WalletEntity) => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  wallet,
  onClose,
  onTraceForward,
  onTraceBackward,
  onAddEvidence,
}) => {
  if (!wallet) return null;

  const [copied, setCopied] = useState(false);
  const [attribution, setAttribution] = useState<WalletAttributionResponse | null>(null);
  const [loadingAttr, setLoadingAttr] = useState(false);
  const [attrError, setAttrError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet || !wallet.address) return;
    if (wallet.address.startsWith('0x')) {
      fetchOSINTIntel(wallet.address);
    } else {
      setAttribution(null);
      setAttrError(null);
    }
  }, [wallet?.address]);

  const fetchOSINTIntel = async (addr: string) => {
    setLoadingAttr(true);
    setAttrError(null);
    try {
      const data = await traceforgeService.attribute(addr);
      setAttribution(data);
    } catch (err: any) {
      console.warn('OSINT lookup notice:', err);
      setAttrError(err?.message || 'Online OSINT search unavailable');
    } finally {
      setLoadingAttr(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-96 border-l border-terminal-muted flex flex-col h-full bg-background shadow-2xl z-20 text-xs overflow-y-auto animate-in slide-in-from-right duration-200 uppercase font-mono">
      {/* Header */}
      <div className="p-4 border-b border-terminal-muted flex items-center justify-between sticky top-0 bg-background z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-none bg-terminal-primary animate-pulse" />
          <span className="font-bold text-terminal-primary tracking-wider">
            ENTITY INTELLIGENCE
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-none text-terminal-muted hover:text-terminal-primary border border-transparent hover:border-terminal-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Classification & Risk Card */}
        <div className="p-3 rounded-none bg-background border border-terminal-muted space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-terminal-muted">
              {wallet.classification}
            </span>
            <RiskBadge level={wallet.riskLevel} score={wallet.riskScore} size="md" />
          </div>
          <div className="font-bold text-sm text-terminal-primary">
            {wallet.label || 'UNHOSTED FORENSIC NODE'}
          </div>
          {wallet.clusterName && (
            <div className="flex items-center gap-1 text-[11px] text-terminal-secondary bg-background border border-terminal-secondary px-2 py-1 rounded-none">
              <Layers className="w-3.5 h-3.5" />
              <span>CLUSTER: {wallet.clusterName}</span>
            </div>
          )}
        </div>

        {/* Address with Quick Copy & Link */}
        <div className="space-y-1">
          <label className="text-[10px] text-terminal-muted font-bold tracking-wider">
            TARGET ADDRESS ({wallet.network})
          </label>
          <div className="flex items-center gap-1.5 p-2 rounded-none bg-background border border-terminal-muted text-[11px] text-terminal-primary">
            <span className="truncate">{wallet.address}</span>
            <button
              onClick={handleCopy}
              className="p-1 rounded-none border border-transparent hover:border-terminal-primary text-terminal-muted hover:text-terminal-primary transition-colors shrink-0"
              title="COPY ADDRESS"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          {copied && <span className="text-[10px] text-terminal-primary font-bold">ADDRESS COPIED TO CLIPBOARD!</span>}
        </div>

        {/* Financial Dossier */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-none bg-background border border-terminal-muted">
            <div className="text-[10px] text-terminal-muted font-bold">CURRENT BALANCE</div>
            <div className="font-bold text-terminal-primary mt-0.5">{wallet.balanceCrypto || '0.00 ETH'}</div>
            <div className="text-[10px] text-terminal-muted">{wallet.balanceUsd || '$0'}</div>
          </div>
          <div className="p-2.5 rounded-none bg-background border border-terminal-muted">
            <div className="text-[10px] text-terminal-muted font-bold">ACTIVITY COUNT</div>
            <div className="font-bold text-terminal-primary mt-0.5">{wallet.txCount ?? 0} TXS</div>
            <div className="text-[10px] text-terminal-muted">FIRST: {wallet.firstSeen ? wallet.firstSeen.slice(0, 10) : 'N/A'}</div>
          </div>
          <div className="p-2.5 rounded-none bg-background border border-terminal-muted">
            <div className="text-[10px] text-terminal-muted font-bold">TOTAL INFLOW</div>
            <div className="font-bold text-terminal-secondary mt-0.5">{wallet.totalReceivedCrypto || '0.00 ETH'}</div>
          </div>
          <div className="p-2.5 rounded-none bg-background border border-terminal-muted">
            <div className="text-[10px] text-terminal-muted font-bold">TOTAL OUTFLOW</div>
            <div className="font-bold text-terminal-error mt-0.5">{wallet.totalSentCrypto || '0.00 ETH'}</div>
          </div>
        </div>

        {/* ONLINE OSINT & CRIMINAL RECORD INTEL CARD */}
        <div className="p-3.5 rounded-none bg-background border border-terminal-muted space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-terminal-muted">
            <div className="flex items-center gap-1.5 font-bold text-terminal-primary text-[11px]">
              <Globe className="w-3.5 h-3.5 text-terminal-secondary" />
              <span>OWNER & CRIMINAL RECORD INTEL</span>
            </div>
            <button
              onClick={() => fetchOSINTIntel(wallet.address)}
              disabled={loadingAttr || !wallet.address.startsWith('0x')}
              className="px-2 py-0.5 border border-terminal-muted hover:border-terminal-primary text-terminal-muted hover:text-terminal-primary text-[9px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loadingAttr ? 'animate-spin' : ''}`} />
              <span>{loadingAttr ? 'SEARCHING...' : 'RE-SCAN OSINT'}</span>
            </button>
          </div>

          {loadingAttr && (
            <div className="p-3 border border-terminal-secondary/40 text-terminal-secondary text-[10px] flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>QUERYING ONLINE OSINT & CRIMINAL RECORDS...</span>
            </div>
          )}

          {attrError && !loadingAttr && (
            <div className="p-2.5 border border-terminal-secondary/40 text-terminal-secondary text-[10px] space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3 h-3" />
                <span>OSINT Lookup Notice</span>
              </div>
              <p className="normal-case text-[10px] text-terminal-muted">{attrError}</p>
            </div>
          )}

          {attribution && !loadingAttr && (
            <div className="space-y-3">
              {/* Owner Identity */}
              <div className="p-2.5 bg-background border border-terminal-muted space-y-1">
                <div className="text-[9px] text-terminal-muted font-bold uppercase">OWNER / ENTITY NAME</div>
                <div className="font-bold text-terminal-primary text-xs flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-terminal-primary shrink-0" />
                  <span>{attribution.owner_info?.owner_name || wallet.label || 'Unidentified Address'}</span>
                </div>
                <div className="text-[10px] text-terminal-secondary font-mono">
                  TYPE: {attribution.owner_info?.entity_type || wallet.classification}
                </div>
              </div>

              {/* Criminal Record Status Banner */}
              <div
                className={`p-3 border ${
                  attribution.owner_info?.has_criminal_record
                    ? 'border-terminal-error bg-terminal-error/10 text-terminal-error'
                    : 'border-terminal-primary bg-terminal-primary/10 text-terminal-primary'
                } space-y-1.5`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  {attribution.owner_info?.has_criminal_record ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-terminal-error shrink-0 animate-pulse" />
                      <span>CRIMINAL RECORD / SANCTIONS DETECTED</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-terminal-primary shrink-0" />
                      <span>CLEAN RECORD — NO CRIMINAL FLAGS</span>
                    </>
                  )}
                </div>

                <p className="text-[10px] leading-relaxed normal-case font-mono font-bold opacity-90">
                  {attribution.owner_info?.criminal_record_summary || 'No public criminal record found.'}
                </p>
              </div>

              {/* Matching Search Results / Sources */}
              {attribution.sources && attribution.sources.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[9px] font-bold text-terminal-muted uppercase">ONLINE SEARCH MENTIONS:</div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {attribution.sources.map((src, idx) => (
                      <div key={idx} className="p-2 border border-terminal-muted bg-background space-y-1 text-[10px]">
                        <div className="flex items-center justify-between gap-1">
                          <a
                            href={src.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-terminal-primary hover:underline truncate flex items-center gap-1"
                          >
                            <span className="truncate">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-terminal-muted shrink-0" />
                          </a>
                          <span className="text-[8px] px-1 py-0.5 border border-terminal-muted text-terminal-secondary shrink-0 font-mono">
                            {src.domain}
                          </span>
                        </div>
                        <p className="text-[9px] text-terminal-muted normal-case line-clamp-2 leading-tight font-mono">
                          {src.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tactical Actions */}
        <div className="space-y-1.5 pt-2">
          <Link
            to={`/wallets/${wallet.address}`}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-none bg-terminal-primary hover:bg-background text-background hover:text-terminal-primary border border-transparent hover:border-terminal-primary font-bold text-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>[ OPEN COMPLETE WALLET DOSSIER ]</span>
          </Link>

          <div className="grid grid-cols-2 gap-1.5">
            {onTraceBackward && (
              <button
                onClick={() => onTraceBackward(wallet.address)}
                className="flex items-center justify-center gap-1 py-1.5 rounded-none bg-background hover:bg-terminal-primary border border-terminal-muted hover:border-terminal-primary text-terminal-muted hover:text-background text-xs transition-colors font-bold"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>[ TRACE BACK ]</span>
              </button>
            )}
            {onTraceForward && (
              <button
                onClick={() => onTraceForward(wallet.address)}
                className="flex items-center justify-center gap-1 py-1.5 rounded-none bg-background hover:bg-terminal-primary border border-terminal-muted hover:border-terminal-primary text-terminal-muted hover:text-background text-xs transition-colors font-bold"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>[ TRACE FORWARD ]</span>
              </button>
            )}
          </div>
        </div>

        {/* Forensic Behavioral Tags */}
        {wallet.tags && wallet.tags.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] text-terminal-muted font-bold tracking-wider">
              BEHAVIORAL FINGERPRINTS
            </label>
            <div className="flex flex-wrap gap-1">
              {wallet.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-none bg-background border border-terminal-muted text-[10px] text-terminal-primary flex items-center gap-1 font-bold"
                >
                  <Tag className="w-2.5 h-2.5 text-terminal-primary" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes & Investigative Context */}
        {wallet.notes && (
          <div className="p-3 rounded-none bg-background border border-terminal-muted text-[11px] text-terminal-primary space-y-1">
            <div className="text-[10px] text-terminal-muted font-bold">
              INVESTIGATOR FIELD NOTES
            </div>
            <p className="leading-relaxed font-bold">{wallet.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
