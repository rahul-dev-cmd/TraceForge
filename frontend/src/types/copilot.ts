export type GroundingLevel = 'FACT' | 'INFERENCE' | 'HYPOTHESIS';

export interface CopilotSourceReference {
  type: 'TRANSACTION' | 'WALLET' | 'CLUSTER' | 'EVIDENCE' | 'TIMELINE' | 'EXCHANGE';
  id: string;
  label: string;
  linkUrl: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  text: string;
  groundingLevel?: GroundingLevel;
  groundingExplanation?: string;
  supportingReferences?: CopilotSourceReference[];
  suggestedFollowUps?: string[];
  isThinking?: boolean;
}

export interface CopilotQueryPayload {
  address: string;
  question: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface CopilotQueryResponse {
  text: string;
  grounded_on: {
    address: string;
    transaction_count?: number;
    flags_evaluated?: number;
    triggered_flags?: string[];
    ml_risk_score?: number | null;
    overall_flagged?: boolean;
    trace_nodes?: number;
    trace_edges?: number;
    attribution_tags?: string[];
    sources_count?: number;
    status?: string;
    error?: string;
    [key: string]: any;
  };
}
