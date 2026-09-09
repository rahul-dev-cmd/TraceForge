import React from 'react';
import { 
  GitFork, 
  RotateCcw, 
  SlidersHorizontal, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  Play, 
  Pause,
  Filter,
  Eye,
  EyeOff,
  Share2,
  Workflow
} from 'lucide-react';
import { Button } from '../ui/Button';

export type GraphLayoutType = 'hierarchical' | 'force' | 'circular' | 'timeline';

interface GraphControlsProps {
  layout: GraphLayoutType;
  onChangeLayout: (layout: GraphLayoutType) => void;
  onResetLayout: () => void;
  onTraceFunds: () => void;
  isTracing: boolean;
  selectedChain: string;
  onChangeChain: (chain: string) => void;
  minRiskFilter: string;
  onChangeMinRisk: (risk: string) => void;
  showMixers: boolean;
  onToggleMixers: () => void;
  showBridges: boolean;
  onToggleBridges: () => void;
  showExchanges: boolean;
  onToggleExchanges: () => void;
  onExport: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  layout,
  onChangeLayout,
  onResetLayout,
  onTraceFunds,
  isTracing,
  selectedChain,
  onChangeChain,
  minRiskFilter,
  onChangeMinRisk,
  showMixers,
  onToggleMixers,
  showBridges,
  onToggleBridges,
  showExchanges,
  onToggleExchanges,
  onExport,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-background border border-terminal-muted rounded-none shadow-none text-xs font-mono uppercase">
      {/* Left controls: Layout Switcher & Trace Funds */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-background p-1 rounded-none border border-terminal-muted">
          <button
            onClick={() => onChangeLayout('hierarchical')}
            className={`px-2.5 py-1 rounded-none text-xs transition-colors flex items-center gap-1.5 ${
              layout === 'hierarchical' 
                ? 'bg-terminal-primary text-background font-bold' 
                : 'text-terminal-muted hover:text-terminal-primary'
            }`}
            title="HIERARCHICAL TREE LAYOUT"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>FLOW TREE</span>
          </button>
          <button
            onClick={() => onChangeLayout('timeline')}
            className={`px-2.5 py-1 rounded-none text-xs transition-colors flex items-center gap-1.5 ${
              layout === 'timeline' 
                ? 'bg-terminal-primary text-background font-bold' 
                : 'text-terminal-muted hover:text-terminal-primary'
            }`}
            title="TIMELINE SEQUENCE LAYOUT"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>TIMELINE</span>
          </button>
          <button
            onClick={() => onChangeLayout('circular')}
            className={`px-2.5 py-1 rounded-none text-xs transition-colors flex items-center gap-1.5 ${
              layout === 'circular' 
                ? 'bg-terminal-primary text-background font-bold' 
                : 'text-terminal-muted hover:text-terminal-primary'
            }`}
            title="CLUSTER CIRCLE LAYOUT"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>RADIAL</span>
          </button>
        </div>

        {/* Trace Funds Action Button */}
        <button
          onClick={onTraceFunds}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-mono font-bold text-xs transition-all uppercase ${
            isTracing 
              ? 'bg-terminal-secondary text-background animate-pulse' 
              : 'bg-terminal-primary text-background hover:bg-background hover:text-terminal-primary border hover:border-terminal-primary'
          }`}
        >
          {isTracing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isTracing ? 'TRACING ACTIVE' : 'TRACE MONEY TRAIL'}</span>
        </button>
      </div>

      {/* Right controls: Filters & Visibility toggles */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Chain Filter */}
        <select
          value={selectedChain}
          onChange={(e) => onChangeChain(e.target.value)}
          className="bg-background text-terminal-primary text-[11px] px-2.5 py-1.5 rounded-none border border-terminal-muted focus:outline-none focus:border-terminal-primary uppercase font-bold"
        >
          <option value="ALL">ALL BLOCKCHAINS</option>
          <option value="Bitcoin">BITCOIN (BTC)</option>
          <option value="Ethereum">ETHEREUM (ETH)</option>
          <option value="Polygon">POLYGON (POL)</option>
        </select>

        {/* Risk Threshold */}
        <select
          value={minRiskFilter}
          onChange={(e) => onChangeMinRisk(e.target.value)}
          className="bg-background text-terminal-primary text-[11px] px-2.5 py-1.5 rounded-none border border-terminal-muted focus:outline-none focus:border-terminal-primary uppercase font-bold"
        >
          <option value="ALL">ALL RISK LEVELS</option>
          <option value="CRITICAL">CRITICAL ONLY (90+)</option>
          <option value="HIGH">HIGH & ABOVE (60+)</option>
          <option value="MEDIUM">MEDIUM & ABOVE (30+)</option>
        </select>

        {/* Visibility Toggles */}
        <div className="flex items-center gap-1 bg-background p-1 rounded-none border border-terminal-muted">
          <button
            onClick={onToggleMixers}
            className={`px-2 py-1 rounded-none text-[10px] uppercase font-bold transition-colors border ${
              showMixers ? 'bg-terminal-secondary text-background border-transparent' : 'bg-background text-terminal-muted border-terminal-muted hover:text-terminal-secondary hover:border-terminal-secondary'
            }`}
            title="TOGGLE PRIVACY MIXERS"
          >
            MIXERS
          </button>
          <button
            onClick={onToggleBridges}
            className={`px-2 py-1 rounded-none text-[10px] uppercase font-bold transition-colors border ${
              showBridges ? 'bg-terminal-secondary text-background border-transparent' : 'bg-background text-terminal-muted border-terminal-muted hover:text-terminal-secondary hover:border-terminal-secondary'
            }`}
            title="TOGGLE CROSS-CHAIN BRIDGES"
          >
            BRIDGES
          </button>
          <button
            onClick={onToggleExchanges}
            className={`px-2 py-1 rounded-none text-[10px] uppercase font-bold transition-colors border ${
              showExchanges ? 'bg-terminal-secondary text-background border-transparent' : 'bg-background text-terminal-muted border-terminal-muted hover:text-terminal-secondary hover:border-terminal-secondary'
            }`}
            title="TOGGLE CENTRALIZED EXCHANGES"
          >
            VASPS
          </button>
        </div>

        {/* Reset View & Export */}
        <button
          onClick={onResetLayout}
          className="p-1.5 rounded-none bg-background hover:bg-terminal-primary text-terminal-muted hover:text-background border border-terminal-muted transition-colors"
          title="RESET LAYOUT & FIT VIEW"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onExport}
          className="p-1.5 rounded-none bg-background hover:bg-terminal-primary text-terminal-muted hover:text-background border border-terminal-muted transition-colors"
          title="EXPORT GRAPH IMAGE/JSON"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
