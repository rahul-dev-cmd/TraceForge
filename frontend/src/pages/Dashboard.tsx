import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  TrendingUp, 
  ArrowRight, 
  Search, 
  Coins, 
  Layers, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  Activity,
  Workflow,
  Globe,
  Wallet,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { SankeyFundFlow } from '../components/flow/SankeyFundFlow';
import { TraceFundsModal } from '../components/flow/TraceFundsModal';
import { traceforgeService, AlertItem, WalletSummaryItem } from '../services/traceforgeService';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [realAlerts, setRealAlerts] = useState<AlertItem[]>([]);
  const [flaggedWallets, setFlaggedWallets] = useState<WalletSummaryItem[]>([]);
  const [totalWallets, setTotalWallets] = useState(0);
  const [totalFlagged, setTotalFlagged] = useState(0);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [walletRes, alertsRes] = await Promise.allSettled([
        traceforgeService.getWallets(1, 6, undefined, true),
        traceforgeService.getAlerts(undefined, 8)
      ]);
      if (walletRes.status === 'fulfilled') {
        setFlaggedWallets(walletRes.value.wallets || []);
        setTotalWallets(walletRes.value.total || 0);
        setTotalFlagged(walletRes.value.flagged_count || 0);
      }
      if (alertsRes.status === 'fulfilled') {
        setRealAlerts(alertsRes.value.alerts || []);
        setTotalAlerts(alertsRes.value.total || 0);
      }
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 uppercase font-mono">
      {/* Top Banner / Triage Title Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-none bg-background border border-terminal-muted">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-terminal-primary font-bold tracking-wider">
            <Activity className="w-4 h-4 animate-blink" />
            CYBER FORENSICS COMMAND CENTER · LIVE TELEMETRY
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-terminal-primary tracking-tight">
            BLOCKCHAIN AML THREAT INTELLIGENCE & MONEY TRAIL SOC
          </h1>
          <p className="text-[10px] sm:text-xs text-terminal-muted max-w-xl">
            REAL-TIME CRYPTOCURRENCY MEMPOOL TRACING, HEURISTIC PEELING DETECTION, RECURSIVE ON-CHAIN GRAPH ANALYTICS, AND AUTOMATED COMPLIANCE REPORTING.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setIsTraceModalOpen(true)}
            className="bg-terminal-primary hover:bg-background text-background hover:text-terminal-primary border border-terminal-primary font-bold text-xs rounded-none transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            [ AUTOMATED FUND TRACER ]
          </Button>
          <Link
            to="/investigate"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-none bg-background hover:bg-terminal-primary hover:text-background text-terminal-primary border border-terminal-primary text-xs font-bold transition-colors"
          >
            <Workflow className="w-4 h-4" />
            <span>[ OPEN GRAPH WORKBENCH ]</span>
          </Link>
          <button
            onClick={loadDashboardData}
            title="Refresh Live Data"
            className="p-2 border border-terminal-muted hover:border-terminal-primary text-terminal-primary"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 8 Real Forensic KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard
          title="Tracked Wallets"
          value={totalWallets > 0 ? totalWallets.toLocaleString() : '...'}
          subtitle="Mainnet Entities"
          icon={Wallet}
          color="cyan"
        />
        <StatCard
          title="AML Flagged"
          value={totalFlagged.toLocaleString()}
          subtitle="Risk Senders"
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Database Alerts"
          value={totalAlerts > 0 ? totalAlerts.toLocaleString() : '...'}
          subtitle="Tripped Heuristics"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Mempool Stream"
          value="STREAMING"
          subtitle="Live WebSocket"
          icon={Activity}
          color="emerald"
        />
        <StatCard
          title="Value Filter"
          value=">= 0.1 ETH"
          subtitle="Mempool Ingestion"
          icon={Coins}
          color="purple"
        />
        <StatCard
          title="Rule Engines"
          value="4 Rules"
          subtitle="Heuristics + ML"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="BFS Recursion"
          value="2 Hops"
          subtitle="Multi-Hop Tracing"
          icon={Workflow}
          color="cyan"
        />
        <StatCard
          title="Live Network"
          value="Ethereum"
          subtitle="Mainnet Chain"
          icon={Globe}
          color="purple"
        />
      </div>

      {/* Primary Visual Center: Money Flow Overview & Live Alerts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Multi-Hop Flow Visualization */}
        <div className="xl:col-span-2 space-y-4">
          <div className="p-5 rounded-none bg-background border border-terminal-muted space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-terminal-muted text-xs">
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 bg-terminal-primary animate-blink mt-1.5 shrink-0" />
                <span className="font-bold text-terminal-primary text-sm uppercase leading-tight">
                  LIVE TRANSACTION FLOW & RECURSIVE HEURISTIC PIPELINE
                </span>
              </div>
              <Link
                to="/graph"
                className="text-terminal-muted hover:text-terminal-primary flex items-center gap-1 font-bold text-xs"
              >
                <span>[ OPEN GRAPH TRACE ]</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Interactive Flow Diagram */}
            <SankeyFundFlow onSelectAddress={(addr) => navigate(`/wallets/${addr}`)} />
          </div>
        </div>

        {/* Right 1 Col: Live Threat Alert Triage Feed */}
        <div className="space-y-4">
          <div className="p-5 rounded-none bg-background border border-terminal-muted space-y-4 text-xs flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-terminal-error" />
                <span className="font-bold text-terminal-primary text-sm uppercase">
                  LIVE THREAT INTERCEPTS ({realAlerts.length})
                </span>
              </div>
              <Link
                to="/alerts"
                className="text-terminal-muted hover:text-terminal-primary font-bold flex items-center gap-1 text-[11px]"
              >
                <span>[ ALL ALERTS ]</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
              {realAlerts.length > 0 ? (
                realAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded-none bg-background border border-terminal-muted hover:border-terminal-primary transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-terminal-primary text-xs uppercase truncate">
                        ALERT #{alt.id} · [{alt.reason.replace(/_/g, ' ')}]
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-none font-bold text-[9px] border ${
                        alt.severity.toUpperCase() === 'CRITICAL' ? 'border-terminal-error text-terminal-error' :
                        alt.severity.toUpperCase() === 'HIGH' ? 'border-terminal-secondary text-terminal-secondary' :
                        'border-terminal-primary text-terminal-primary'
                      }`}>
                        [{alt.severity.toUpperCase()}]
                      </span>
                    </div>

                    <p className="text-terminal-muted text-[10px] leading-relaxed truncate font-mono">
                      WALLET: <strong className="text-terminal-primary">{alt.wallet_address}</strong>
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-terminal-muted/40 text-[10px] text-terminal-muted">
                      <span>{new Date(alt.created_at).toLocaleTimeString()} UTC</span>
                      <Link
                        to={`/wallets/${alt.wallet_address}`}
                        className="text-terminal-muted hover:text-terminal-primary font-bold flex items-center gap-1"
                      >
                        <span>[ INTEL ]</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-terminal-muted">
                  Awaiting live transaction listener alerts...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Real Database Flagged Entities & Recent Alert Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Flagged Entities Table (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-none bg-background border border-terminal-muted space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-terminal-error" />
              <span className="font-bold text-terminal-primary text-sm uppercase">
                DATABASE AML FLAGGED ENTITIES & SUSPECTS
              </span>
            </div>
            <Link
              to="/wallets"
              className="text-terminal-muted hover:text-terminal-primary flex items-center gap-1 text-[11px]"
            >
              <span>[ VIEW ALL {totalFlagged} FLAGGED WALLETS ]</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-terminal-muted text-terminal-muted uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-normal">WALLET ADDRESS</th>
                  <th className="py-2.5 px-3 font-normal">FIRST INGESTED</th>
                  <th className="py-2.5 px-3 font-normal">STORED VOLUME</th>
                  <th className="py-2.5 px-3 font-normal">TRIPPED HEURISTIC</th>
                  <th className="py-2.5 px-3 font-normal">RISK STATUS</th>
                  <th className="py-2.5 px-3 text-right font-normal">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-muted/50 font-mono text-xs">
                {flaggedWallets.length > 0 ? (
                  flaggedWallets.map((w) => (
                    <tr key={w.address} className="hover:bg-terminal-primary hover:text-background transition-colors group">
                      <td className="py-2.5 px-3 font-bold text-terminal-primary group-hover:text-background truncate max-w-[180px]">
                        {w.address}
                      </td>
                      <td className="py-2.5 px-3 text-terminal-muted group-hover:text-background/80">
                        {new Date(w.first_seen).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-terminal-primary group-hover:text-background font-bold">
                        {w.total_volume_eth} ETH
                      </td>
                      <td className="py-2.5 px-3 text-red-400 group-hover:text-background font-bold uppercase">
                        {w.latest_alert_reason ? `[${w.latest_alert_reason.replace(/_/g, ' ')}]` : '[AML FLAG]'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase border border-red-500 bg-red-950/40 text-red-400 group-hover:bg-background group-hover:text-terminal-error">
                          CRITICAL
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/wallets/${w.address}`}
                            className="text-[10px] font-bold text-terminal-muted hover:text-terminal-primary group-hover:text-background uppercase"
                          >
                            [ INTEL ]
                          </Link>
                          <Link
                            to={`/investigate?address=${w.address}`}
                            className="text-[10px] font-bold text-terminal-primary group-hover:text-background uppercase"
                          >
                            [ TRACE ]
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-terminal-muted">
                      No flagged wallets in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Alert Stream (1 col) */}
        <div className="p-5 rounded-none bg-background border border-terminal-muted space-y-4 text-xs flex flex-col min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-terminal-primary" />
              <span className="font-bold text-terminal-primary text-sm uppercase">
                REAL-TIME TELEMETRY LOG
              </span>
            </div>
            <Link
              to="/alerts"
              className="text-terminal-muted hover:text-terminal-primary text-[11px] shrink-0 ml-2"
            >
              [ ALERTS CENTER ]
            </Link>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
            {realAlerts.slice(0, 6).map((alt) => (
              <div
                key={alt.id}
                className="p-2.5 rounded-none bg-background border border-terminal-muted space-y-1 overflow-hidden"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-terminal-primary uppercase truncate pr-2">
                    FLAG: {alt.reason.replace(/_/g, ' ')}
                  </span>
                  <span className="text-terminal-muted shrink-0">
                    {new Date(alt.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-terminal-muted text-[10px] truncate font-mono">
                  {alt.wallet_address}
                </div>
                <div className="flex items-center justify-between text-[10px] text-terminal-muted pt-1 border-t border-terminal-muted/40">
                  <span>ID: #{alt.id}</span>
                  <span className="text-red-400 font-bold uppercase">[{alt.severity}]</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automated Trace Engine Modal */}
      <TraceFundsModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        onApplyTracePath={(path) => navigate('/investigate')}
      />
    </div>
  );
};
