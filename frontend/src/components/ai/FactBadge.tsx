import React from 'react';
import { ShieldCheck, Brain, HelpCircle, Info } from 'lucide-react';
import { GroundingLevel } from '../../types/copilot';

export const FactBadge: React.FC<{ level: GroundingLevel; explanation?: string }> = ({ level, explanation }) => {
  const getBadgeConfig = () => {
    switch (level) {
      case 'FACT':
        return {
          bg: 'bg-background border-terminal-primary text-terminal-primary',
          icon: <ShieldCheck className="w-3 h-3 text-terminal-primary" />,
          label: 'GROUNDED FACT',
          tooltip: 'DIRECT ON-CHAIN CRYPTOGRAPHIC OBSERVATION. VERIFIABLE THROUGH BLOCK PROOFS.'
        };
      case 'INFERENCE':
        return {
          bg: 'bg-background border-terminal-secondary text-terminal-secondary',
          icon: <Brain className="w-3 h-3 text-terminal-secondary" />,
          label: 'ANALYTICAL INFERENCE',
          tooltip: 'CALCULATED ALGORITHMIC CLUSTERING, TIMING CORRELATION, OR PATTERN HEURISTIC.'
        };
      case 'HYPOTHESIS':
        return {
          bg: 'bg-background border-terminal-muted text-terminal-muted',
          icon: <HelpCircle className="w-3 h-3 text-terminal-muted" />,
          label: 'INVESTIGATIVE HYPOTHESIS',
          tooltip: 'POTENTIAL EXPLANATION OR LEAD REQUIRING CORROBORATING LAW-ENFORCEMENT EVIDENCE.'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none border text-[10px] font-mono font-bold uppercase tracking-wider group relative cursor-help select-none ${config.bg}`}>
      {config.icon}
      <span>{config.label}</span>
      
      {explanation && (
        <span className="hidden group-hover:block absolute bottom-full left-0 mb-1 z-30 w-64 p-2 rounded-none bg-background border border-current text-[10px] text-current font-mono shadow-none uppercase">
          {explanation}
        </span>
      )}
    </div>
  );
};
