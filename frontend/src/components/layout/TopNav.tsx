import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  ChevronRight, 
  Activity, 
  Layers, 
  ShieldCheck, 
  SlidersHorizontal,
  FolderOpen,
  Sparkles
} from 'lucide-react';

interface TopNavProps {
  onOpenSearch: () => void;
  selectedNetwork: string;
  onSelectNetwork: (network: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenSearch,
  selectedNetwork,
  onSelectNetwork,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const networks = [
    'All Blockchains',
    'Bitcoin',
    'Ethereum',
    'Polygon',
    'Monero',
    'BNB Chain',
    'Arbitrum',
    'Solana'
  ];

  // Dynamic breadcrumbs generator
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getBreadcrumbTitle = (segment: string) => {
    switch (segment) {
      case 'dashboard': return 'Command Center';
      case 'live-trace': return 'Live Forensic Trace';
      case 'cases': return 'Cases & Dossiers';
      case 'investigate': return 'Investigation Workspace';
      case 'graph': return 'Transaction Graph';
      case 'wallets': return 'Wallet Intelligence';
      case 'clusters': return 'Entity Clusters';
      case 'cross-chain': return 'Cross-Chain Flows';
      case 'patterns': return 'Pattern Detection';
      case 'alerts': return 'Alerts Center';
      case 'evidence': return 'Evidence Vault';
      case 'timeline': return 'Timeline Reconstruction';
      case 'exchanges': return 'Exchange & KYC Intel';
      case 'copilot': return 'AI Forensic Copilot';
      case 'reports': return 'Forensic Reports';
      case 'settings': return 'Settings & Audit';
      default:
        if (segment.startsWith('case-') || segment.startsWith('CASE-')) {
          return 'CASE-2026-0142 (Mumbai Healthcare)';
        }
        if (segment.length > 20) {
          return `${segment.slice(0, 8)}...${segment.slice(-6)}`;
        }
        return segment;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-background border-b border-terminal-muted px-4 sm:px-6 flex items-center justify-between gap-4 uppercase">
      {/* Left: Breadcrumbs & Active Case Indicator */}
      <div className="flex items-center gap-2 overflow-hidden text-xs">
        <Link 
          to="/dashboard" 
          className="text-terminal-muted hover:text-terminal-primary font-bold flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="tracking-tight text-terminal-primary">TRACE[FORGE]</span>
        </Link>

        {pathSegments.length > 0 && (
          <>
            <span className="text-terminal-muted shrink-0">/</span>
            {pathSegments.map((segment, index) => {
              const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
              const isLast = index === pathSegments.length - 1;
              const title = getBreadcrumbTitle(segment);

              return (
                <React.Fragment key={segment}>
                  {index > 0 && <span className="text-terminal-muted shrink-0">/</span>}
                  {isLast ? (
                    <span className="font-bold text-terminal-primary truncate max-w-[240px]">
                      {title}
                    </span>
                  ) : (
                    <Link
                      to={url}
                      className="text-terminal-muted hover:text-terminal-primary truncate transition-colors"
                    >
                      {title}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}

        {/* Highlighted active target case pill */}
        <div className="hidden xl:flex items-center gap-1.5 ml-4 pl-4 border-l border-terminal-muted py-0.5 whitespace-nowrap">
          <span className="w-2 h-2 bg-terminal-error animate-blink shrink-0" />
          <span className="text-[11px] text-terminal-muted">ACTIVE TARGET:</span>
          <Link
            to="/cases/case-2026-0142"
            className="text-[10px] font-bold text-terminal-error hover:bg-terminal-error hover:text-background border border-terminal-error px-2 py-0.5 rounded-none transition-none flex items-center gap-1"
          >
            <span>[ CASE-2026-0142 (â‚¹20.4 CR) ]</span>
          </Link>
        </div>

        {/* Simulated Demo Data Pill */}
        <div className="hidden 2xl:flex items-center gap-1 ml-2 px-2 py-0.5 rounded-none border border-terminal-secondary text-[10px] text-terminal-secondary">
          <span>[ SIMULATED / DEMO DATA ]</span>
        </div>
      </div>

      {/* Right Controls: Search Trigger, Network Selector, Notifications */}
      <div className="flex items-center gap-3 shrink-0 h-full py-3">
        {/* Global Search Bar trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 h-full rounded-none bg-background hover:bg-terminal-primary border border-terminal-muted hover:border-terminal-primary text-terminal-muted hover:text-background text-xs transition-none group"
        >
          <Search className="w-3.5 h-3.5 group-hover:text-background" />
          <span className="hidden sm:inline">SEARCH WALLET, TX, CASE...</span>
          <kbd className="hidden sm:inline text-[10px] bg-background group-hover:bg-background text-terminal-muted group-hover:text-terminal-primary px-1.5 py-0.5 rounded-none border border-terminal-muted">
            CTRL+K
          </kbd>
        </button>

        {/* Network Selector */}
        <div className="relative h-full flex items-center">
          <select
            value={selectedNetwork}
            onChange={(e) => onSelectNetwork(e.target.value)}
            className="h-full bg-background text-terminal-primary text-xs px-3 py-1.5 rounded-none border border-terminal-muted focus:outline-none focus:border-terminal-primary appearance-none pr-8 cursor-pointer hover:border-terminal-primary transition-none uppercase"
          >
            {networks.map((net) => (
              <option key={net} value={net} className="bg-background text-terminal-primary uppercase">
                {net}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-terminal-primary">
            <Layers className="w-3 h-3" />
          </div>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 h-full rounded-none bg-background hover:bg-terminal-primary border border-terminal-muted text-terminal-primary hover:text-background transition-none flex items-center justify-center"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terminal-error animate-blink" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-background border border-terminal-primary p-4 z-50">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-terminal-muted">
                <span className="text-xs font-bold text-terminal-primary tracking-wider">
                  FORENSIC THREAT STREAM (3)
                </span>
                <span className="text-[10px] text-background bg-terminal-primary px-1.5 py-0.5 font-bold">
                  LIVE INTERCEPT
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2 border border-terminal-error text-terminal-error">
                  <div className="font-bold">[ APEXGLOBAL ACCOUNT FREEZE ]</div>
                  <div className="text-[11px] mt-0.5">
                    VASP COMPLIANCE ACKNOWLEDGED MLAT EMERGENCY FREEZE ON 5.8M USDT FOR CASE-2026-0142.
                  </div>
                  <div className="text-[10px] mt-1">2 MINS AGO</div>
                </div>

                <div className="p-2 border border-terminal-secondary text-terminal-secondary">
                  <div className="font-bold">[ THORCHAIN BRIDGE INGRESS ]</div>
                  <div className="text-[11px] mt-0.5">
                    90 BTC SWAPPED INTO SYNTHETIC ERC-20 USDT ON ETHEREUM.
                  </div>
                  <div className="text-[10px] mt-1">18 MINS AGO</div>
                </div>

                <div className="p-2 border border-terminal-primary text-terminal-primary">
                  <div className="font-bold">[ WASABI COINJOIN DETECTION ]</div>
                  <div className="text-[11px] mt-0.5">
                    145 BTC ROUTED THROUGH NON-CUSTODIAL PRIVACY POOL.
                  </div>
                  <div className="text-[10px] mt-1">42 MINS AGO</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
