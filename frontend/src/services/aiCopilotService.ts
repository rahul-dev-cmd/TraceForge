import { 
  CopilotMessage, 
  GroundingLevel, 
  CopilotSourceReference,
  CopilotQueryPayload,
  CopilotQueryResponse 
} from '../types/copilot';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export interface CopilotQueryResult {
  text: string;
  groundingLevel: GroundingLevel;
  groundingExplanation: string;
  supportingReferences: CopilotSourceReference[];
  suggestedFollowUps: string[];
  grounded_on?: Record<string, any>;
}

export const aiCopilotService = {
  /**
   * Queries the real backend AI Forensic Copilot endpoint (POST /copilot/query).
   * Answers are strictly grounded in the currently investigated wallet's
   * verified transaction history, AML heuristic flags, and OSINT attribution.
   */
  async query(payload: CopilotQueryPayload): Promise<CopilotQueryResult> {
    const res = await fetch(`${API_BASE}/copilot/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Copilot request failed with status ${res.status}`);
    }

    const data: CopilotQueryResponse = await res.json();
    const grounded = data.grounded_on || {};

    const triggeredCount = grounded.triggered_flags?.length || 0;
    const tagCount = grounded.attribution_tags?.length || 0;
    const txCount = grounded.transaction_count ?? 0;
    const nodeCount = grounded.trace_nodes ?? 0;

    // Grounding level determination
    const groundingLevel: GroundingLevel = (triggeredCount > 0 || tagCount > 0 || txCount > 0)
      ? 'FACT'
      : 'INFERENCE';

    const shortAddr = grounded.address 
      ? `${grounded.address.slice(0, 6)}...${grounded.address.slice(-4)}`
      : 'TARGET';

    const groundingExplanation = grounded.address
      ? `Grounded in on-chain telemetry for ${shortAddr} (${txCount} txs, ${nodeCount} graph nodes, ${triggeredCount} AML flags, ${tagCount} OSINT tags).`
      : 'Grounded in verified forensic telemetry.';

    const supportingReferences: CopilotSourceReference[] = [];
    if (grounded.address) {
      supportingReferences.push({
        type: 'WALLET',
        id: grounded.address,
        label: `Target Wallet (${shortAddr})`,
        linkUrl: `/wallets/${grounded.address}`,
      });
    }

    const suggestedFollowUps = [
      'Why is this wallet flagged?',
      "Summarize this wallet's risk profile",
      'What counterparty connections exist in the trace graph?',
      'Explain the attribution tags for this address'
    ];

    return {
      text: data.text,
      groundingLevel,
      groundingExplanation,
      supportingReferences,
      suggestedFollowUps,
      grounded_on: grounded,
    };
  },

  /**
   * Backwards-compatible bridge method delegating to the real query() endpoint.
   */
  async askCopilot(queryText: string, addressOrCaseId?: string): Promise<CopilotQueryResult> {
    const targetAddress = (addressOrCaseId && addressOrCaseId.startsWith('0x'))
      ? addressOrCaseId
      : '0x098B716B8Aaf21512996dC57EB0615e2383E2f96';

    return this.query({
      address: targetAddress,
      question: queryText,
    });
  }
};
