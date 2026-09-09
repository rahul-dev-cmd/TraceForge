import React, { useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Search, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  Terminal, 
  Info,
  Globe,
  ExternalLink,
  Tag
} from 'lucide-react';
import { traceforgeService, WalletAttributionResponse } from '../services/traceforgeService';
import { useActiveWallet } from '../context/ActiveWalletContext';
import { nodeTypes } from '../components/graph/CustomNodes';

interface TraceNode {
  address: string;
  flagged: boolean;
}

interface TraceEdge {
  from: string;
  to: string | null;
  amount: number;
  tx_hash: string;
  timestamp: string;
}

interface TraceGraphResponse {
  root_address: string;
  depth: number;
  total_nodes: number;
  total_edges: number;
  nodes: TraceNode[];
  edges: TraceEdge[];
}

interface FlagDetail {
  type: string;
  triggered: boolean;
  reason: string | null;
}

interface WalletFlagsResponse {
  address: string;
  flags: FlagDetail[];
  risk_score?: number | null;
  overall_flagged: boolean;
}

const SAMPLE_ADDRESSES = [
  '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
  '0x1111111254fb6c44bac0bed2854e76f90643097d',
  '0x28c6c06298d514db089934071355e5743bf21d60',
];

export const LiveTracePage: React.FC = () => {
  const { activeWallet, setActiveWallet } = useActiveWallet();
  const [addressInput, setAddressInput] = useState(activeWallet || '');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [traceResult, setTraceResult] = useState<TraceGraphResponse | null>(null);
  const [flagsResult, setFlagsResult] = useState<WalletFlagsResponse | null>(null);
  const [attributionResult, setAttributionResult] = useState<WalletAttributionResponse | null>(null);
  const [attributionError, setAttributionError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (activeWallet && !addressInput) {
      setAddressInput(activeWallet);
    }
  }, [activeWallet]);

  const formatShortAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleTrace = async (e?: React.FormEvent, customAddress?: string) => {
    if (e) e.preventDefault();
    const targetAddress = (customAddress || addressInput).trim();

    if (!targetAddress) {
      setError('Please provide an Ethereum wallet address.');
      return;
    }

    if (!targetAddress.startsWith('0x') || targetAddress.length !== 42) {
      setError('Invalid address format. Address must be a 42-character hex string starting with 0x.');
      return;
    }

    setError(null);
    setAttributionError(null);
    setLoading(true);
    setTraceResult(null);
    setFlagsResult(null);
    setAttributionResult(null);
    setNodes([]);
    setEdges([]);
    setActiveWallet(targetAddress);

    try {
      // 1. Ingest
      setActiveStep('1/4 INGESTING ON-CHAIN TRANSACTIONS (ETHERSCAN)...');
      await traceforgeService.ingest(targetAddress);

      // 2. Trace
      setActiveStep('2/4 RECURSIVELY TRACING TRANSACTION GRAPH...');
      const traceData: TraceGraphResponse = await traceforgeService.trace(targetAddress);
      setTraceResult(traceData);

      // 3. Flags
      setActiveStep('3/4 EVALUATING AML FLAGS & HEURISTIC RULES...');
      const flagsData: WalletFlagsResponse = await traceforgeService.flags(targetAddress);
      setFlagsResult(flagsData);

      // 4. Attribution
      setActiveStep('4/4 QUERYING OSINT & WEB ATTRIBUTION SOURCES...');
      try {
        const attrData = await traceforgeService.attribute(targetAddress);
        setAttributionResult(attrData);
      } catch (attrErr: any) {
        console.warn('Attribution lookup notice:', attrErr);
        setAttributionError(attrErr?.message || 'Attribution lookup unavailable');
      }

      // Layout and map nodes & edges for ReactFlow matching Shader Node Editor Reference Design
      const categoriesList = ['GEOMETRY', 'NOISE DATA', 'SPHERE GENERATOR', 'LABEL', 'LANDSCAPE'];
      
      const mappedNodes: Node[] = (traceData.nodes || []).map((node, index, arr) => {
        const isRoot = node.address.toLowerCase() === targetAddress.toLowerCase();
        const isFlagged = node.flagged;
        
        let posX = 60;
        let posY = 200;

        if (arr.length === 1) {
          posX = 320;
          posY = 200;
        } else if (isRoot) {
          posX = 60;
          posY = Math.max(140, ((arr.length - 1) * 110) / 2);
        } else {
          const nonRootIndex = arr
            .filter((n) => n.address.toLowerCase() !== targetAddress.toLowerCase())
            .findIndex((n) => n.address.toLowerCase() === node.address.toLowerCase());
          
          const idx = nonRootIndex >= 0 ? nonRootIndex : index;
          const col = (idx % 3) + 1;
          const row = Math.floor(idx / 3);
          posX = col * 290 + 40;
          posY = row * 165 + 60;
        }

        const category = isRoot
          ? 'TARGET ROOT'
          : isFlagged
          ? 'SANCTIONED NODE'
          : categoriesList[index % categoriesList.length];

        return {
          id: node.address,
          type: 'shaderNode',
          position: { x: posX, y: posY },
          data: {
            address: node.address,
            label: formatShortAddress(node.address),
            category: category,
            isRoot: isRoot,
            isFlagged: isFlagged,
            balanceCrypto: '12.5000 ETH',
          },
        };
      });

      const mappedEdges: Edge[] = (traceData.edges || []).map((edge, index) => ({
        id: `e-${edge.from}-${edge.to || 'contract'}-${index}`,
        source: edge.from,
        target: edge.to || edge.from,
        type: 'default',
        label: `${Number(edge.amount).toFixed(4)} ETH`,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#33ff00',
          width: 14,
          height: 14,
        },
        style: {
          stroke: '#33ff00',
          strokeWidth: 1.5,
        },
        labelStyle: {
          fill: '#33ff00',
          fontWeight: 700,
          fontSize: 9,
          fontFamily: 'monospace',
        },
        labelBgStyle: {
          fill: '#0a0a0a',
          fillOpacity: 0.95,
          stroke: '#1f521f',
          strokeWidth: 1,
          rx: 2,
          ry: 2,
        },
      }));

      setNodes(mappedNodes);
      setEdges(mappedEdges);
    } catch (err: any) {
      console.error('TraceForge live pipeline error:', err);
      const msg =
        err?.message ||
        'Failed to execute trace pipeline. Please verify the backend service is running on http://127.0.0.1:8000.';
      setError(
        msg.includes('Failed to fetch')
          ? 'Backend connection refused. Please ensure the TraceForge FastAPI backend is running on http://127.0.0.1:8000.'
          : msg
      );
    } finally {
      setLoading(false);
      setActiveStep('');
    }
  };

  const handleSampleClick = (sample: string) => {
    setAddressInput(sample);
    handleTrace(undefined, sample);
  };

  // Compute the list of detection triggers (flaggedBy)
  const getFlaggedByList = (flags: WalletFlagsResponse | null): string[] => {
    if (!flags) return [];
    const triggered: string[] = [];

    if (flags.flags && Array.isArray(flags.flags)) {
      flags.flags.forEach((f) => {
        if (f.triggered) {
          triggered.push(f.type);
        }
      });
    }

    if (flags.risk_score !== null && flags.risk_score !== undefined && flags.risk_score >= 0.5) {
      triggered.push('risk_score >= 0.5');
    }

    return triggered;
  };

  const flaggedBy = getFlaggedByList(flagsResult);
  const isFlagged = flaggedBy.length > 0;

  const isHighRiskTag = (tag: string) => {
    const t = tag.toLowerCase().replace(/_/g, ' ');
    return ['scam', 'phishing', 'hack', 'stolen', 'rug pull', 'ponzi', 'sanctioned', 'ofac', 'sdn list', 'lazarus'].some(k => t.includes(k));
  };

  return (
    <div className="space-y-6 uppercase font-mono">
      {/* Top Banner */}
      <div className="p-5 bg-background border border-terminal-muted flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-terminal-primary font-bold tracking-wider">
            <Activity className="w-4 h-4 animate-blink" />
            LIVE FORENSIC INVESTIGATION PIPELINE
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-terminal-primary tracking-tight">
            ETHEREUM TRANSACTION TRACER & AML FLAGGING
          </h1>
          <p className="text-[10px] sm:text-xs text-terminal-muted max-w-2xl">
            INGEST REAL TRANSACTIONS FROM ETHERSCAN, RECURSIVELY RECONSTRUCT MULTI-HOP ON-CHAIN TRANSFERS, AND EVALUATE SUSPICIOUS HEURISTIC PATTERNS IN REAL-TIME.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-terminal-secondary border border-terminal-secondary/40 px-3 py-1.5 self-start lg:self-center">
          <Terminal className="w-3.5 h-3.5" />
          <span>API ENDPOINT: http://127.0.0.1:8000</span>
        </div>
      </div>

      {/* Address Input Form */}
      <div className="p-5 bg-background border border-terminal-muted space-y-4">
        <div className="text-xs font-bold text-terminal-primary flex items-center gap-2">
          <Search className="w-4 h-4" />
          TARGET WALLET INPUT
        </div>

        <form onSubmit={handleTrace} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter Ethereum address (0x...)"
              disabled={loading}
              className="w-full bg-background text-terminal-primary text-xs sm:text-sm px-4 py-2.5 border border-terminal-muted focus:outline-none focus:border-terminal-primary placeholder-terminal-muted/60 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-terminal-primary text-background font-bold text-xs sm:text-sm hover:bg-terminal-primary/80 disabled:opacity-50 transition-none flex items-center justify-center gap-2 shrink-0 border border-terminal-primary"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>TRACING PIPELINE...</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>TRACE</span>
              </>
            )}
          </button>
        </form>

        {/* Sample Address Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
          <span className="text-terminal-muted">QUICK LOAD SAMPLES:</span>
          {SAMPLE_ADDRESSES.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => handleSampleClick(sample)}
              disabled={loading}
              className="px-2 py-0.5 border border-terminal-muted hover:border-terminal-secondary text-terminal-muted hover:text-terminal-secondary transition-none disabled:opacity-50"
            >
              {formatShortAddress(sample)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Progress State */}
      {loading && (
        <div className="p-4 bg-background border border-terminal-secondary text-terminal-secondary space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>PIPELINE RUNNING: {activeStep}</span>
          </div>
          <div className="w-full bg-background border border-terminal-muted h-1.5 overflow-hidden">
            <div className="bg-terminal-secondary h-full w-2/3 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-background border border-terminal-error text-terminal-error space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>ERROR OCCURRED DURING TRACE PIPELINE</span>
          </div>
          <div className="text-[11px] text-terminal-error/90 break-words normal-case">
            {error}
          </div>
          <div className="text-[10px] text-terminal-muted uppercase">
            Tip: Ensure the FastAPI backend server is active (`uvicorn app.main:app --reload`) and the wallet address has valid on-chain records.
          </div>
        </div>
      )}
      <div className="bg-background border border-terminal-muted overflow-hidden relative shadow-2xl">
        {/* Main Full-Width Node Graph Canvas — Pure Graph & Nodes */}
        <div className="h-[580px] w-full bg-[#0a0a0a] relative">
          {nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              className="bg-[#0a0a0a] w-full h-full"
            >
              <Background color="#1f521f" gap={28} size={1} variant={BackgroundVariant.Dots} />
              <Controls className="!bg-[#0a0a0a] !border-terminal-muted !text-terminal-primary !rounded-none" />
            </ReactFlow>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-terminal-muted space-y-3 p-6 text-center">
              <Activity className="w-10 h-10 stroke-[1.5] text-terminal-primary animate-pulse" />
              <div className="text-xs font-bold text-terminal-primary">NO ACTIVE NODE GRAPH LOADED</div>
              <p className="text-[11px] max-w-md text-terminal-muted">
                ENTER AN ETHEREUM ADDRESS ABOVE AND CLICK [TRACE] TO GENERATE INTERACTIVE TRANSACTION GRAPH NODES.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Flags & Heuristics Response Card */}
      {flagsResult && (
        <div className="p-5 bg-background border border-terminal-muted space-y-4">
          <div className="flex flex-col gap-3 pb-3 border-b border-terminal-muted">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-terminal-primary flex items-center gap-2">
                  {isFlagged ? (
                    <ShieldAlert className="w-4 h-4 text-terminal-error" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-terminal-primary" />
                  )}
                  AML HEURISTIC FLAGS & RISK ASSESSMENT
                </div>
                <div className="text-[10px] text-terminal-muted">
                  EVALUATED FOR: <span className="text-terminal-primary font-bold">{flagsResult.address}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {flagsResult.risk_score !== null && flagsResult.risk_score !== undefined && (
                  <div className="px-2.5 py-1 border border-terminal-secondary text-terminal-secondary text-[11px] font-bold">
                    RISK SCORE: {Number(flagsResult.risk_score).toFixed(4)} / 1.00
                  </div>
                )}
                <div
                  className={`px-2.5 py-1 text-[11px] font-bold border ${
                    isFlagged
                      ? 'border-terminal-error text-terminal-error bg-terminal-error/10'
                      : 'border-terminal-primary text-terminal-primary bg-terminal-primary/10'
                  }`}
                >
                  {isFlagged ? `FLAGGED — ${flaggedBy.join(', ')}` : 'CLEAN'}
                </div>
              </div>
            </div>

            {/* Explanatory caption for ML Risk Score */}
            {flagsResult.risk_score !== null && flagsResult.risk_score !== undefined && (
              <div className="text-[10px] text-terminal-muted/80 normal-case leading-relaxed flex items-start gap-1.5 pt-1 border-t border-terminal-muted/30">
                <Info className="w-3.5 h-3.5 text-terminal-secondary shrink-0 mt-0.5" />
                <span>
                  ML score reflects structuring/smurfing likelihood specifically — a low score alongside triggered rules means other suspicious patterns were caught by rule-based heuristics.
                </span>
              </div>
            )}
          </div>

          {/* List of Flags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {flagsResult.flags && flagsResult.flags.length > 0 ? (
              flagsResult.flags.map((flag, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 border ${
                    flag.triggered
                      ? 'border-terminal-error bg-terminal-error/5'
                      : 'border-terminal-muted bg-background'
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-terminal-primary truncate">
                      {flag.type.replace(/_/g, ' ')}
                    </span>
                    {flag.triggered ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-terminal-error text-background shrink-0">
                        TRIGGERED
                      </span>
                    ) : (
                      <span className="text-[9px] text-terminal-muted border border-terminal-muted px-1.5 py-0.5 shrink-0">
                        CLEAN
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-terminal-muted normal-case leading-relaxed">
                    {flag.triggered
                      ? flag.reason || 'Heuristic violation triggered.'
                      : 'No suspicious activity matching this rule.'}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-xs text-terminal-muted py-2">
                No individual rule evaluations returned.
              </div>
            )}
          </div>
        </div>
      )}

      {/* OSINT & Wallet Attribution Card */}
      {(attributionResult || attributionError) && (
        <div className="p-5 bg-background border border-terminal-muted space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-terminal-muted">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-terminal-primary flex items-center gap-2">
                <Globe className="w-4 h-4 text-terminal-secondary" />
                OSINT & PUBLIC WALLET ATTRIBUTION
              </div>
              <div className="text-[10px] text-terminal-muted">
                SCOPED INTELLIGENCE & FORENSIC SIGNALS
              </div>
            </div>

            {attributionResult && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-terminal-muted">
                  SOURCES FOUND: <strong className="text-terminal-primary">{attributionResult.classification.result_count}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Quota / Error Warning Banner */}
          {attributionError && (
            <div className="p-3.5 border border-terminal-secondary/60 bg-terminal-secondary/5 text-terminal-secondary text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Attribution lookup unavailable</span>
              </div>
              <p className="text-[11px] text-terminal-muted normal-case leading-relaxed font-mono">
                {attributionError}
              </p>
            </div>
          )}

          {attributionResult && (
            <>
              {/* Classification Badges */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-terminal-muted flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-terminal-secondary" />
                  CLASSIFICATION TAGS:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {attributionResult.classification.tags && attributionResult.classification.tags.length > 0 ? (
                    attributionResult.classification.tags.map((tag, idx) => {
                      const isRisk = isHighRiskTag(tag);
                      return (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wide ${
                            isRisk
                              ? 'border-terminal-error text-terminal-error bg-terminal-error/10'
                              : 'border-terminal-muted text-terminal-primary/90 bg-terminal-muted/15'
                          }`}
                        >
                          #{tag.replace(/_/g, ' ')}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-terminal-muted/80">
                      NO RISK TAGS DETECTED
                    </span>
                  )}
                </div>
              </div>

              {/* Monitored Sources Listing */}
              <div className="space-y-3 pt-2">
                <div className="text-[10px] font-bold text-terminal-muted">
                  PUBLIC SOURCES & MENTIONS:
                </div>
                {attributionResult.sources && attributionResult.sources.length > 0 ? (
                  <div className="space-y-2.5">
                    {attributionResult.sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 border border-terminal-muted bg-background hover:border-terminal-primary/60 transition-none space-y-1.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <a
                            href={src.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-terminal-primary hover:underline flex items-center gap-1.5 group"
                          >
                            <span className="truncate">{src.title || 'Untitled Source'}</span>
                            <ExternalLink className="w-3 h-3 text-terminal-muted group-hover:text-terminal-primary shrink-0" />
                          </a>
                          <span className="text-[9px] px-1.5 py-0.5 border border-terminal-muted text-terminal-secondary font-mono self-start sm:self-auto shrink-0">
                            {src.domain}
                          </span>
                        </div>

                        <p className="text-[11px] text-terminal-muted normal-case leading-relaxed font-mono">
                          {src.snippet}
                        </p>

                        <a
                          href={src.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-terminal-muted/60 hover:text-terminal-primary truncate block font-mono lowercase"
                        >
                          {src.link}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-terminal-muted/60 text-center text-xs text-terminal-muted">
                    No public attribution data found in monitored sources
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveTracePage;
