import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Search, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Building2, 
  Shuffle, 
  ArrowLeftRight,
  TrendingDown,
  Coins
} from 'lucide-react';
import { Button } from '../ui/Button';

interface TraceFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSource?: string;
  onApplyTracePath?: (path: string[]) => void;
}

export const TraceFundsModal: React.FC<TraceFundsModalProps> = ({
  isOpen,
  onClose,
  defaultSource = 'bc1qvictimhospital001a9b8c7d6e5f4g3h2j1k0l9m',
  onApplyTracePath,
}) => {
  const [sourceAddress, setSourceAddress] = useState(defaultSource);
  const [targetDestination, setTargetDestination] = useState('ALL_EXITS');
  const [asset, setAsset] = useState('BTC');
  const [maxHops, setMaxHops] = useState(8);
  const [traceStrategy, setTraceStrategy] = useState<'highest-value' | 'highest-risk' | 'shortest-path' | 'bidirectional'>('highest-value');
  const [isRunning, setIsRunning] = useState(false);
  const [traceComplete, setTraceComplete] = useState(false);

  if (!isOpen) return null;

  const handleRunTrace = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTraceComplete(true);
      if (onApplyTracePath) {
        onApplyTracePath([
          'bc1qvictimhospital001a9b8c7d6e5f4g3h2j1k0l9m',
          'bc1q9x7y4z2w8u1v0k5a3b7c9d1e3f5g7h9j2k4l6m',
          'bc1qinterm111mule9876543210abcdef9876543210',
          'bc1qmixerwasabipool9999988888777776666655555',
          'bc1qpostmixerout4444433333222221111100000',
          'bc1qthorchainvaultliquidity00000000000000000',
          '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          '0x82A49e9841fE6C3886bC5A039439c2c62391991F'
        ]);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150 uppercase">
      <div className="w-full max-w-2xl rounded-none bg-background border border-terminal-muted p-6 space-y-5 text-xs font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-terminal-primary" />
            <div>
              <div className="font-bold text-terminal-primary text-sm">
                AUTOMATED FUND TRACING ENGINE
              </div>
              <div className="text-[11px] text-terminal-muted">
                EXECUTE ALGORITHMIC MULTI-HOP TRAIL RECONSTRUCTION & ENTITY DISCOVERY
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-none text-terminal-muted hover:text-terminal-primary border border-transparent hover:border-terminal-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] text-terminal-muted font-bold">
              SOURCE WALLET / INCEPTION POINT
            </label>
            <input
              type="text"
              value={sourceAddress}
              onChange={(e) => setSourceAddress(e.target.value)}
              className="w-full p-2 rounded-none bg-background border border-terminal-muted text-terminal-primary text-[11px] focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 uppercase font-mono"
              placeholder="E.G. BC1QVICTIM..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-terminal-muted font-bold">
              TARGET DESTINATION ENDPOINT
            </label>
            <select
              value={targetDestination}
              onChange={(e) => setTargetDestination(e.target.value)}
              className="w-full p-2 rounded-none bg-background border border-terminal-muted text-terminal-primary text-[11px] focus:outline-none focus:border-terminal-primary uppercase font-mono"
            >
              <option value="ALL_EXITS">ALL CUSTODIAL EXCHANGES & OTC DESKS</option>
              <option value="EXCHANGE_ONLY">CENTRALIZED VASPS ONLY (APEXGLOBAL/BINANCE)</option>
              <option value="MIXER_ONLY">PRIVACY POOLS ONLY (WASABI/TORNADO)</option>
              <option value="CROSS_CHAIN_ONLY">CROSS-CHAIN BRIDGES (THORCHAIN/WORMHOLE)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-terminal-muted font-bold">
              TRACING STRATEGY
            </label>
            <select
              value={traceStrategy}
              onChange={(e) => setTraceStrategy(e.target.value as any)}
              className="w-full p-2 rounded-none bg-background border border-terminal-muted text-terminal-primary text-[11px] focus:outline-none focus:border-terminal-primary uppercase font-mono"
            >
              <option value="highest-value">HIGHEST-VALUE PATH (FOLLOW THE VOLUME)</option>
              <option value="highest-risk">HIGHEST-RISK PATH (MAXIMIZE AML SCORE)</option>
              <option value="shortest-path">SHORTEST PATH TO LIQUIDATION</option>
              <option value="bidirectional">BIDIRECTIONAL GRAPH EXPANSION</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-terminal-muted font-bold">
              MAXIMUM SEARCH DEPTH
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={2}
                max={15}
                value={maxHops}
                onChange={(e) => setMaxHops(Number(e.target.value))}
                className="flex-1 accent-terminal-primary cursor-pointer"
              />
              <span className="font-bold text-terminal-primary w-12 text-right">{maxHops} HOPS</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={handleRunTrace}
            isLoading={isRunning}
            variant="primary"
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? '[ CALCULATING ON-CHAIN GRAPH TRAVERSAL... ]' : '[ EXECUTE ALGORITHMIC MONEY TRACE ]'}
          </Button>
        </div>

        {/* Trace Results Summary Card */}
        {traceComplete && (
          <div className="p-4 rounded-none bg-background border border-terminal-primary space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-terminal-primary">
              <span className="font-bold text-terminal-primary flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-terminal-primary" />
                DETERMINISTIC TRAIL RECONSTRUCTED
              </span>
              <span className="text-terminal-primary font-bold bg-background px-2 py-0.5 rounded-none border border-terminal-primary">
                [ 100% VOLUME ACCOUNTED FOR ]
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 rounded-none bg-background border border-terminal-muted">
                <span className="text-[10px] text-terminal-muted font-bold block">TRACED VOLUME</span>
                <span className="font-bold text-terminal-primary">₹20.4 CR (320.5 BTC)</span>
              </div>
              <div className="p-2 rounded-none bg-background border border-terminal-muted">
                <span className="text-[10px] text-terminal-muted font-bold block">TOTAL HOPS</span>
                <span className="font-bold text-terminal-primary">8 SEQUENTIAL HOPS</span>
              </div>
              <div className="p-2 rounded-none bg-background border border-terminal-muted">
                <span className="text-[10px] text-terminal-muted font-bold block">BRIDGES & MIXERS</span>
                <span className="font-bold text-terminal-secondary">1 MIXER / 1 BRIDGE</span>
              </div>
              <div className="p-2 rounded-none bg-background border border-terminal-muted">
                <span className="text-[10px] text-terminal-muted font-bold block">FROZEN AT VASP</span>
                <span className="font-bold text-terminal-primary">$5.8M USDT (74%)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-none bg-background text-[11px] text-terminal-primary border border-terminal-muted">
              <span className="font-bold">FUND FLOW SUMMARY: </span>
              "₹20.4 CR TRACED ACROSS 14 WALLETS, 2 BLOCKCHAINS, 1 WASABI COINJOIN MIXER, 1 THORCHAIN CROSS-CHAIN BRIDGE, AND 1 OFFSHORE EXCHANGE ENDPOINT."
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button onClick={onClose} variant="primary" className="text-xs">
                [ HIGHLIGHT PATH IN INVESTIGATION GRAPH ]
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
