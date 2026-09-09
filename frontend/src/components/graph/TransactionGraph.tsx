import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './CustomNodes';
import { WalletEntity } from '../../types/wallet';
import { TransactionEntity } from '../../types/transaction';
import { GraphControls, GraphLayoutType } from './GraphControls';
import { NodeDetailDrawer } from './NodeDetailDrawer';

interface TransactionGraphProps {
  wallets: WalletEntity[];
  transactions: TransactionEntity[];
  selectedAddress?: string;
  onSelectAddress?: (address: string) => void;
  highlightedPath?: string[];
  initialLayout?: GraphLayoutType;
}

const EMPTY_ARRAY: string[] = [];

export const TransactionGraph: React.FC<TransactionGraphProps> = ({
  wallets,
  transactions,
  selectedAddress,
  onSelectAddress,
  highlightedPath = EMPTY_ARRAY,
  initialLayout = 'hierarchical',
}) => {
  const [layout, setLayout] = useState<GraphLayoutType>(initialLayout);
  const [isTracing, setIsTracing] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string>('ALL');
  const [minRiskFilter, setMinRiskFilter] = useState<string>('ALL');
  const [showMixers, setShowMixers] = useState(true);
  const [showBridges, setShowBridges] = useState(true);
  const [showExchanges, setShowExchanges] = useState(true);
  const [selectedWalletEntity, setSelectedWalletEntity] = useState<WalletEntity | null>(null);

  // Filter wallets based on visibility controls
  const filteredWallets = useMemo(() => {
    if (!Array.isArray(wallets)) return [];
    return wallets.filter((w) => {
      if (!w || !w.address) return false;
      const network = w.network || 'Ethereum';
      if (selectedChain !== 'ALL' && network.toLowerCase() !== selectedChain.toLowerCase()) {
        return false;
      }
      if (minRiskFilter === 'CRITICAL' && w.riskLevel !== 'CRITICAL') return false;
      if (minRiskFilter === 'HIGH' && !['CRITICAL', 'HIGH'].includes(w.riskLevel)) return false;
      if (minRiskFilter === 'MEDIUM' && !['CRITICAL', 'HIGH', 'MEDIUM'].includes(w.riskLevel)) return false;
      if (!showMixers && w.classification === 'Mixer') return false;
      if (!showBridges && w.classification === 'Cross-chain Bridge') return false;
      if (!showExchanges && ['Exchange Deposit', 'Exchange Hot Wallet'].includes(w.classification)) return false;
      return true;
    });
  }, [wallets, selectedChain, minRiskFilter, showMixers, showBridges, showExchanges]);

  // Compute node positions based on layout
  const initialNodes: Node[] = useMemo(() => {
    return filteredWallets.map((wallet, index) => {
      let x = 100;
      let y = 100;

      if (layout === 'hierarchical') {
        const classificationTier: Record<string, number> = {
          'Victim Wallet': 0,
          'Suspect Wallet': 1,
          'Intermediate Wallet': 2,
          'Mixer': 3,
          'Cross-chain Bridge': 4,
          'Exchange Deposit': 5,
          'Exchange Hot Wallet': 6,
          'Cash-out Service': 6,
          'Sanctioned Entity': 2,
          'Unknown Wallet': 3
        };

        const classification = wallet.classification || 'Intermediate Wallet';
        const tier = classificationTier[classification] ?? 2;
        x = tier * 320 + 80;
        
        const sameTierNodes = filteredWallets.filter(
          (w) => (classificationTier[w.classification || 'Intermediate Wallet'] ?? 2) === tier
        );
        const itemIndex = sameTierNodes.findIndex((w) => w.address === wallet.address);
        y = Math.max(0, itemIndex) * 190 + 100;
      } else if (layout === 'timeline') {
        x = index * 260 + 80;
        y = (index % 2 === 0 ? 120 : 320);
      } else if (layout === 'circular') {
        const angle = (index / Math.max(filteredWallets.length, 1)) * 2 * Math.PI;
        const radius = 380;
        x = 500 + radius * Math.cos(angle);
        y = 400 + radius * Math.sin(angle);
      } else {
        x = (index % 4) * 300 + 100;
        y = Math.floor(index / 4) * 220 + 100;
      }

      const isSelected = Boolean(selectedAddress && wallet.address && selectedAddress.toLowerCase() === wallet.address.toLowerCase());
      const isTrace = isTracing || (Array.isArray(highlightedPath) && highlightedPath.some(p => p && wallet.address && p.toLowerCase() === wallet.address.toLowerCase()));

      return {
        id: wallet.address,
        type: 'forensicNode',
        position: { x, y },
        selected: isSelected,
        data: {
          ...wallet,
          isTracePath: isTrace,
        }
      };
    });
  }, [filteredWallets, layout, selectedAddress, highlightedPath, isTracing]);

  // Compute edges from transactions
  const initialEdges: Edge[] = useMemo(() => {
    const visibleAddresses = new Set(filteredWallets.map((w) => w.address ? w.address.toLowerCase() : ''));

    return (transactions || [])
      .filter((tx) => 
        tx && tx.fromAddress && tx.toAddress &&
        visibleAddresses.has(tx.fromAddress.toLowerCase()) && 
        visibleAddresses.has(tx.toAddress.toLowerCase())
      )
      .map((tx, idx) => {
        const isTrace = isTracing || (
          Array.isArray(highlightedPath) &&
          highlightedPath.includes(tx.fromAddress) && 
          highlightedPath.includes(tx.toAddress)
        );

        return {
          id: `e-${tx.hash || idx}-${idx}`,
          source: tx.fromAddress,
          target: tx.toAddress,
          animated: isTrace || tx.riskLevel === 'CRITICAL',
          style: {
            stroke: isTrace 
              ? '#33ff00' 
              : tx.riskLevel === 'CRITICAL' 
                ? '#ff3333' 
                : tx.riskLevel === 'HIGH' 
                  ? '#ffb000' 
                  : '#33ff00',
            strokeWidth: isTrace ? 3 : 2,
          },
          label: `${tx.amountCrypto || '0'} (${tx.asset || 'ETH'})`,
          labelStyle: {
            fill: '#33ff00',
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 700,
          },
          labelBgStyle: {
            fill: '#0a0a0a',
            fillOpacity: 0.95,
            stroke: '#1f521f',
            strokeWidth: 1,
            rx: 0,
            ry: 0,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isTrace ? '#33ff00' : tx.riskLevel === 'CRITICAL' ? '#ff3333' : '#33ff00',
          }
        };
      });
  }, [transactions, filteredWallets, isTracing, highlightedPath]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when filters / initialNodes change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Set selected wallet if passed in props
  useEffect(() => {
    if (selectedAddress) {
      const match = wallets.find(w => w.address.toLowerCase() === selectedAddress.toLowerCase());
      if (match) {
        setSelectedWalletEntity(match);
      }
    }
  }, [selectedAddress, wallets]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const address = node.id;
      const match = wallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
      if (match) {
        setSelectedWalletEntity(match);
      }
      if (onSelectAddress) {
        onSelectAddress(address);
      }
    },
    [wallets, onSelectAddress]
  );

  const handleTraceFunds = () => {
    setIsTracing(!isTracing);
  };

  const handleResetLayout = () => {
    setLayout('hierarchical');
    setIsTracing(false);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ wallets: filteredWallets, transactions }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `traceforge_graph_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-background overflow-hidden rounded-none border border-terminal-muted uppercase font-mono">
      {/* Top Toolbar */}
      <div className="p-3 z-10">
        <GraphControls
          layout={layout}
          onChangeLayout={setLayout}
          onResetLayout={handleResetLayout}
          onTraceFunds={handleTraceFunds}
          isTracing={isTracing}
          selectedChain={selectedChain}
          onChangeChain={setSelectedChain}
          minRiskFilter={minRiskFilter}
          onChangeMinRisk={setMinRiskFilter}
          showMixers={showMixers}
          onToggleMixers={() => setShowMixers(!showMixers)}
          showBridges={showBridges}
          onToggleBridges={() => setShowBridges(!showBridges)}
          showExchanges={showExchanges}
          onToggleExchanges={() => setShowExchanges(!showExchanges)}
          onExport={handleExport}
        />
      </div>

      {/* Main Canvas & Drawer Container */}
      <div className="relative flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={2.5}
          className="bg-background"
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="#33ff00" 
          />
          <Controls className="!bg-background !border-terminal-muted !text-terminal-primary !rounded-none" />
          <MiniMap
            nodeColor={(n) => {
              const d = n.data as any;
              if (d?.classification === 'Victim Wallet') return '#33ff00';
              if (d?.classification === 'Suspect Wallet') return '#ff0000';
              if (d?.classification === 'Mixer') return '#9900ff';
              if (d?.classification === 'Cross-chain Bridge') return '#ff9900';
              if (d?.classification === 'Exchange Deposit') return '#00ccff';
              return '#444444';
            }}
            className="!bg-background !border !border-terminal-muted !rounded-none overflow-hidden"
            maskColor="rgba(0, 0, 0, 0.7)"
          />
        </ReactFlow>

        {/* Selected Node Inspector Drawer */}
        {selectedWalletEntity && (
          <div className="absolute right-0 top-0 bottom-0 z-20 border-l border-terminal-muted">
            <NodeDetailDrawer
              wallet={selectedWalletEntity}
              onClose={() => setSelectedWalletEntity(null)}
              onTraceForward={(addr) => {
                setIsTracing(true);
                if (onSelectAddress) onSelectAddress(addr);
              }}
              onTraceBackward={(addr) => {
                setIsTracing(true);
                if (onSelectAddress) onSelectAddress(addr);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
