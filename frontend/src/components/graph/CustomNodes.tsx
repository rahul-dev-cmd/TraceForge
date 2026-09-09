import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  ArrowLeftRight, 
  Building2, 
  Wallet, 
  Flame,
  Shuffle,
  Coins,
  Target,
  FileCode,
  RotateCw,
  Users,
  MoreVertical
} from 'lucide-react';
import { EntityClassification, BlockchainNetwork } from '../../types/wallet';
import { RiskLevel } from '../../types/investigation';
import { RiskBadge } from '../ui/RiskBadge';

export interface ForensicNodeData {
  address: string;
  label: string;
  classification: EntityClassification;
  network: BlockchainNetwork;
  balanceCrypto: string;
  balanceUsd: string;
  riskScore: number;
  riskLevel: RiskLevel;
  tags: string[];
  isHighlighted?: boolean;
  isTracePath?: boolean;
  hopIndex?: number;
  exchangeName?: string;
  onSelectNode?: (address: string) => void;
}

export const ForensicNodeComponent: React.FC<NodeProps<any>> = memo(({ data, selected }) => {
  const nodeData = data as ForensicNodeData;

  const getBorderAndBg = () => {
    if (nodeData.isTracePath) {
      return 'border-terminal-primary bg-[#0a0a0a] text-terminal-primary shadow-[0_0_15px_rgba(51,255,0,0.3)]';
    }

    switch (nodeData.classification) {
      case 'Victim Wallet':
        return 'border-terminal-primary bg-[#0a0a0a] text-terminal-primary shadow-[0_0_12px_rgba(51,255,0,0.2)]';
      case 'Suspect Wallet':
      case 'Sanctioned Entity':
      case 'Cash-out Service':
        return 'border-terminal-error bg-[#0a0a0a] text-terminal-error shadow-[0_0_16px_rgba(255,51,51,0.35)]';
      case 'Cross-chain Bridge':
      case 'Mixer':
        return 'border-terminal-secondary bg-[#0a0a0a] text-terminal-secondary shadow-[0_0_12px_rgba(255,176,0,0.2)]';
      default:
        return 'border-terminal-primary bg-[#0a0a0a] text-terminal-primary shadow-[0_0_12px_rgba(51,255,0,0.2)]';
    }
  };

  const getNodeIcon = () => {
    switch (nodeData.classification) {
      case 'Victim Wallet':
        return <ShieldCheck className="w-4 h-4 text-terminal-primary" />;
      case 'Suspect Wallet':
      case 'Sanctioned Entity':
        return <ShieldAlert className="w-4 h-4 text-terminal-error" />;
      case 'Cross-chain Bridge':
        return <ArrowLeftRight className="w-4 h-4 text-terminal-secondary" />;
      default:
        return <Wallet className="w-4 h-4 text-terminal-primary" />;
    }
  };

  const truncatedAddress = nodeData.address.length > 14 
    ? `${nodeData.address.slice(0, 7)}...${nodeData.address.slice(-6)}` 
    : nodeData.address;

  return (
    <div 
      className={`relative rounded-none border p-3 min-w-[240px] max-w-[280px] font-mono shadow-xl transition-all cursor-pointer ${getBorderAndBg()} ${
        selected ? 'ring-2 ring-terminal-primary ring-offset-2 ring-offset-background scale-105' : ''
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-2.5 !h-2.5 !rounded-none !bg-terminal-primary !border !border-background" 
      />

      {typeof nodeData.hopIndex === 'number' && (
        <div className="absolute -top-2.5 -left-2 bg-background border border-terminal-primary text-terminal-primary text-[9px] font-mono font-bold px-2 py-0.5 shadow-md">
          HOP #{nodeData.hopIndex}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className="p-1.5 bg-background border border-terminal-muted shrink-0">
            {getNodeIcon()}
          </div>
          <span className="text-[11px] font-mono font-bold truncate uppercase tracking-wider">
            {nodeData.classification}
          </span>
        </div>
        <RiskBadge level={nodeData.riskLevel} score={nodeData.riskScore} size="sm" />
      </div>

      <div className="font-bold text-xs truncate mb-1 text-terminal-primary" title={nodeData.label}>
        {nodeData.label}
      </div>

      <div className="flex items-center justify-between gap-1 text-[11px] font-mono bg-background border border-terminal-muted px-2 py-1 mb-2">
        <span className="truncate font-bold text-terminal-primary">{truncatedAddress}</span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-background text-terminal-secondary border border-terminal-secondary">{nodeData.network}</span>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-terminal-muted text-terminal-primary">
        <div>
          <span className="text-terminal-muted">BAL: </span>
          <span className="font-bold text-terminal-primary">{nodeData.balanceCrypto}</span>
        </div>
        <div className="font-bold text-terminal-primary">{nodeData.balanceUsd}</div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-2.5 !h-2.5 !rounded-none !bg-terminal-primary !border !border-background" 
      />
    </div>
  );
});
ForensicNodeComponent.displayName = 'ForensicNodeComponent';

/* ════════════════════════════════════════════════════════════════════
   PILL NODE COMPONENT — Terminal Design
════════════════════════════════════════════════════════════════════ */
export interface PillNodeData {
  address: string;
  label?: string;
  category?: string;
  classification?: string;
  isRoot?: boolean;
  isFlagged?: boolean;
  riskLevel?: string;
  riskScore?: number;
  balanceCrypto?: string;
  balanceUsd?: string;
  network?: string;
}

export const PillNodeComponent: React.FC<NodeProps<any>> = memo(({ data, selected }) => {
  const nodeData = data as PillNodeData;
  const isRoot = nodeData.isRoot;
  const isFlagged = nodeData.isFlagged;

  const category = nodeData.category || (
    isRoot ? 'Target Root' : 
    isFlagged ? 'Sanctioned' : 
    nodeData.classification || 'Contract'
  );

  const formatShort = (addr: string) => {
    if (!addr) return '';
    if (addr.length <= 14) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getTheme = () => {
    if (isFlagged || category === 'Sanctioned') {
      return {
        border: 'border-terminal-error',
        bg: 'bg-[#0a0a0a]',
        text: 'text-terminal-error',
        glow: 'shadow-[0_0_20px_rgba(255,51,51,0.35)]',
        badgeBg: 'bg-terminal-error/20 text-terminal-error border-terminal-error/40',
        iconBg: 'bg-terminal-error/10 text-terminal-error border-terminal-error/40',
        icon: <ShieldAlert className="w-4 h-4 text-terminal-error" />
      };
    }
    if (isRoot) {
      return {
        border: 'border-terminal-secondary',
        bg: 'bg-[#0a0a0a]',
        text: 'text-terminal-secondary',
        glow: 'shadow-[0_0_22px_rgba(255,176,0,0.35)]',
        badgeBg: 'bg-terminal-secondary/20 text-terminal-secondary border-terminal-secondary/40',
        iconBg: 'bg-terminal-secondary/10 text-terminal-secondary border-terminal-secondary/40',
        icon: <Target className="w-4 h-4 text-terminal-secondary" />
      };
    }
    return {
      border: 'border-terminal-primary',
      bg: 'bg-[#0a0a0a]',
      text: 'text-terminal-primary',
      glow: 'shadow-[0_0_15px_rgba(51,255,0,0.2)]',
      badgeBg: 'bg-terminal-primary/20 text-terminal-primary border-terminal-primary/40',
      iconBg: 'bg-terminal-primary/10 text-terminal-primary border-terminal-primary/40',
      icon: <FileCode className="w-4 h-4 text-terminal-primary" />
    };
  };

  const theme = getTheme();

  return (
    <div 
      className={`relative flex items-center justify-between gap-3 px-4 py-3 rounded-none border font-mono ${theme.border} ${theme.bg} ${theme.glow} ${
        selected ? 'ring-2 ring-terminal-primary ring-offset-2 ring-offset-background scale-105' : ''
      } min-w-[230px] max-w-[290px] shadow-2xl transition-all cursor-pointer`}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-2.5 !h-2.5 !rounded-none !bg-terminal-primary !border !border-background" 
      />
      
      {/* Left Icon Pill Badge */}
      <div className={`p-2.5 border shrink-0 ${theme.iconBg}`}>
        {theme.icon}
      </div>

      {/* Center Label & Address */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-terminal-muted flex items-center gap-1">
          {category}
        </div>
        <div className={`text-xs font-bold truncate ${theme.text}`} title={nodeData.label || nodeData.address}>
          {nodeData.label || formatShort(nodeData.address)}
        </div>
        {nodeData.balanceCrypto && (
          <div className="text-[10px] text-terminal-muted font-mono">
            {nodeData.balanceCrypto}
          </div>
        )}
      </div>

      {/* Right Menu & Status Badge */}
      <div className="flex flex-col items-end shrink-0 gap-1.5">
        <MoreVertical className="w-3.5 h-3.5 text-terminal-muted hover:text-terminal-primary transition-colors" />
        {isFlagged ? (
          <span className="text-[9px] font-bold px-2 py-0.5 bg-terminal-error text-background border border-terminal-error">
            [FLAGGED]
          </span>
        ) : isRoot ? (
          <span className="text-[9px] font-bold px-2 py-0.5 bg-terminal-secondary text-background border border-terminal-secondary">
            [TARGET ROOT]
          </span>
        ) : (
          <span className="text-[9px] font-bold px-2 py-0.5 bg-terminal-primary text-background border border-terminal-primary">
            [CLEAN]
          </span>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-2.5 !h-2.5 !rounded-none !bg-terminal-primary !border !border-background" 
      />
    </div>
  );
});
PillNodeComponent.displayName = 'PillNodeComponent';

/* ════════════════════════════════════════════════════════════════════
   SHADER BLUEPRINT NODE COMPONENT — Green Cyberpunk Terminal Style
════════════════════════════════════════════════════════════════════ */
export interface ShaderNodeData {
  address: string;
  label?: string;
  category?: string;
  classification?: string;
  isRoot?: boolean;
  isFlagged?: boolean;
  riskLevel?: string;
  riskScore?: number;
  balanceCrypto?: string;
  balanceUsd?: string;
  network?: string;
}

export const ShaderNodeComponent: React.FC<NodeProps<any>> = memo(({ data, selected }) => {
  const nodeData = data as ShaderNodeData;
  const isRoot = nodeData.isRoot;
  const isFlagged = nodeData.isFlagged;

  const category = nodeData.category || (
    isRoot ? 'TARGET ROOT' : 
    isFlagged ? 'SANCTIONED NODE' : 
    nodeData.classification ? nodeData.classification.toUpperCase() : 'NOISE DATA'
  );

  const formatShort = (addr: string) => {
    if (!addr) return '';
    if (addr.length <= 14) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getHeaderStyle = () => {
    if (isFlagged || category.includes('SANCTIONED') || category.includes('FLAGGED')) {
      return {
        bg: 'bg-terminal-error text-background font-black',
        accentBorder: 'border-terminal-error',
        glow: 'shadow-[0_0_20px_rgba(255,51,51,0.4)]',
        handleBg: '!bg-terminal-error',
      };
    }
    if (isRoot || category.includes('TARGET ROOT')) {
      return {
        bg: 'bg-terminal-secondary text-background font-black',
        accentBorder: 'border-terminal-secondary',
        glow: 'shadow-[0_0_20px_rgba(255,176,0,0.4)]',
        handleBg: '!bg-terminal-secondary',
      };
    }
    return {
      bg: 'bg-terminal-primary text-background font-black',
      accentBorder: 'border-terminal-primary',
      glow: 'shadow-[0_0_15px_rgba(51,255,0,0.25)]',
      handleBg: '!bg-terminal-primary',
    };
  };

  const headerTheme = getHeaderStyle();

  return (
    <div 
      className={`relative rounded-none border bg-[#0a0a0a] font-mono text-xs shadow-2xl transition-all cursor-pointer min-w-[210px] max-w-[260px] overflow-hidden ${headerTheme.accentBorder} ${headerTheme.glow} ${
        selected ? 'ring-2 ring-terminal-primary ring-offset-2 ring-offset-background scale-105' : ''
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className={`!w-2.5 !h-2.5 !rounded-none ${headerTheme.handleBg} !border !border-background !-left-1.5`} 
      />

      {/* Header Banner */}
      <div className={`px-3 py-1.5 flex items-center justify-between font-bold text-[11px] uppercase tracking-wider select-none ${headerTheme.bg}`}>
        <span className="truncate">{category}</span>
        <div className="flex items-center gap-1 opacity-80">
          <div className="w-1.5 h-1.5 bg-background animate-pulse" />
        </div>
      </div>

      {/* Node Body Content */}
      <div className="p-3 space-y-2 bg-[#0a0a0a] text-terminal-primary">
        <div className="font-bold text-xs text-terminal-primary truncate flex items-center justify-between">
          <span className="truncate">{nodeData.label || formatShort(nodeData.address)}</span>
          <span className="text-[9px] font-mono text-terminal-secondary bg-background px-1.5 py-0.5 border border-terminal-muted">
            {nodeData.network || 'ETH'}
          </span>
        </div>

        {/* Inputs & Ports */}
        <div className="space-y-1.5 pt-1 border-t border-terminal-muted text-[10px]">
          <div className="flex items-center justify-between text-terminal-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-terminal-primary" />
              ADDRESS
            </span>
            <span className="text-terminal-primary font-bold">{formatShort(nodeData.address)}</span>
          </div>

          {nodeData.balanceCrypto && (
            <div className="flex items-center justify-between text-terminal-muted">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-terminal-primary" />
                VAL/BAL
              </span>
              <span className="text-terminal-primary font-bold">{nodeData.balanceCrypto}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-terminal-muted">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 ${isFlagged ? 'bg-terminal-error' : isRoot ? 'bg-terminal-secondary' : 'bg-terminal-primary'}`} />
              STATUS
            </span>
            <span className={`font-bold ${isFlagged ? 'text-terminal-error' : isRoot ? 'text-terminal-secondary' : 'text-terminal-primary'}`}>
              {isFlagged ? 'FLAGGED' : isRoot ? 'ROOT' : 'CLEAN'}
            </span>
          </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className={`!w-2.5 !h-2.5 !rounded-none ${headerTheme.handleBg} !border !border-background !-right-1.5`} 
      />
    </div>
  );
});
ShaderNodeComponent.displayName = 'ShaderNodeComponent';

export const nodeTypes = {
  forensicNode: ForensicNodeComponent,
  pillNode: PillNodeComponent,
  shaderNode: ShaderNodeComponent,
};
