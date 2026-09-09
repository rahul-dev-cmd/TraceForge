import { RiskLevel } from '../types/investigation';
import { EntityClassification } from '../types/wallet';

/**
 * Truncate long crypto address with ellipsis in the middle (e.g. 0x82A...91F)
 */
export function truncateAddress(address: string | undefined | null, startLen = 6, endLen = 4): string {
  if (!address) return '—';
  if (address.length <= startLen + endLen) return address;
  return `${address.slice(0, startLen)}...${address.slice(-endLen)}`;
}

/**
 * Truncate transaction hash
 */
export function truncateHash(hash: string | undefined | null, len = 8): string {
  if (!hash) return '—';
  if (hash.length <= len * 2) return hash;
  return `${hash.slice(0, len)}...${hash.slice(-len)}`;
}

/**
 * Get CSS classes and styles for Risk Level badges
 */
export function getRiskLevelStyles(level: RiskLevel | undefined) {
  switch (level) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-500/15',
        border: 'border-red-500/40',
        text: 'text-red-400',
        dot: 'bg-red-500',
        glow: 'glow-critical',
        badge: 'bg-red-950/80 text-red-300 border-red-500/40',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/40',
        text: 'text-orange-400',
        dot: 'bg-orange-500',
        glow: 'glow-high',
        badge: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
        glow: 'glow-medium',
        badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      };
    case 'LOW':
      return {
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
        glow: 'glow-low',
        badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
      };
    default:
      return {
        bg: 'bg-sky-500/15',
        border: 'border-sky-500/40',
        text: 'text-sky-400',
        dot: 'bg-sky-400',
        glow: 'glow-cyber',
        badge: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
      };
  }
}

/**
 * Get styling for Entity Classifications
 */
export function getEntityClassificationBadge(type: EntityClassification | undefined) {
  switch (type) {
    case 'Victim Wallet':
      return {
        label: 'Victim Wallet',
        className: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
        iconName: 'ShieldAlert',
        color: '#38bdf8',
      };
    case 'Suspect Wallet':
      return {
        label: 'Suspect Wallet',
        className: 'bg-red-950/80 text-red-300 border-red-500/40',
        iconName: 'UserX',
        color: '#ef4444',
      };
    case 'Mixer':
      return {
        label: 'Mixer / Privacy Pool',
        className: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
        iconName: 'Shuffle',
        color: '#a855f7',
      };
    case 'Cross-chain Bridge':
      return {
        label: 'Cross-chain Bridge',
        className: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
        iconName: 'ArrowLeftRight',
        color: '#06b6d4',
      };
    case 'Exchange Deposit':
    case 'Exchange Hot Wallet':
      return {
        label: 'Exchange Endpoint',
        className: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
        iconName: 'Building2',
        color: '#10b981',
      };
    case 'Cash-out Service':
      return {
        label: 'Cash-out Service',
        className: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
        iconName: 'Banknote',
        color: '#f97316',
      };
    case 'Sanctioned Entity':
      return {
        label: 'OFAC / Sanctioned',
        className: 'bg-rose-950/90 text-rose-300 border-rose-600/60 font-semibold',
        iconName: 'AlertOctagon',
        color: '#f43f5e',
      };
    default:
      return {
        label: type || 'Unknown Entity',
        className: 'bg-slate-800 text-slate-300 border-slate-700',
        iconName: 'HelpCircle',
        color: '#94a3b8',
      };
  }
}

/**
 * Format currency with fallback
 */
export function formatCurrency(amount: string | number | undefined, currency = '$'): string {
  if (amount === undefined || amount === null) return '—';
  if (typeof amount === 'string') return amount;
  return `${currency}${amount.toLocaleString()}`;
}
