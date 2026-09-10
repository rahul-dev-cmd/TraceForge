export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface AttributionSource {
  title: string;
  snippet: string;
  link: string;
  domain: string;
}

export interface AttributionClassification {
  tags: string[];
  result_count: number;
}

export interface OwnerInfo {
  owner_name: string;
  entity_type: string;
  has_criminal_record: boolean;
  criminal_record_summary: string;
}

export interface WalletAttributionResponse {
  address: string;
  owner_info?: OwnerInfo;
  classification: AttributionClassification;
  sources: AttributionSource[];
}

export interface AlertItem {
  id: number;
  wallet_address: string;
  tx_hash?: string | null;
  reason: string;
  severity: string;
  risk_score?: number | null;
  created_at: string;
}

export interface AlertListResponse {
  total: number;
  alerts: AlertItem[];
}

export interface WalletSummaryItem {
  address: string;
  first_seen: string;
  flagged: boolean;
  tx_count: number;
  total_volume_eth: number;
  latest_alert_reason?: string | null;
  latest_alert_severity?: string | null;
}

export interface WalletListResponse {
  total: number;
  flagged_count: number;
  page: number;
  limit: number;
  wallets: WalletSummaryItem[];
}

export interface WalletTxItem {
  tx_hash: string;
  from_address: string;
  to_address?: string | null;
  amount: number;
  timestamp: string;
  direction: 'in' | 'out';
}

export interface WalletAlertItem {
  id: number;
  reason: string;
  severity: string;
  risk_score?: number | null;
  created_at: string;
  tx_hash?: string | null;
}

export interface WalletDetailResponse {
  address: string;
  first_seen: string;
  flagged: boolean;
  tx_count: number;
  total_received_eth: number;
  total_sent_eth: number;
  recent_transactions: WalletTxItem[];
  recent_alerts: WalletAlertItem[];
}

export const traceforgeService = {
  async ingest(address: string) {
    const res = await fetch(`${API_BASE}/ingest/${address}`);
    if (!res.ok) throw new Error("Ingest failed");
    return res.json();
  },
  async trace(address: string, depth = 2) {
    const res = await fetch(`${API_BASE}/trace/${address}?depth=${depth}`);
    if (!res.ok) throw new Error("Trace failed");
    return res.json();
  },
  async flags(address: string) {
    const res = await fetch(`${API_BASE}/flags/${address}`);
    if (!res.ok) throw new Error("Flags failed");
    return res.json();
  },
  async attribute(address: string): Promise<WalletAttributionResponse> {
    const res = await fetch(`${API_BASE}/attribute/${address}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Attribution lookup unavailable");
    }
    return res.json();
  },
  async getAlerts(severity?: string, limit = 50): Promise<AlertListResponse> {
    const params = new URLSearchParams();
    if (severity && severity !== 'ALL') {
      params.append('severity', severity.toLowerCase());
    }
    params.append('limit', String(limit));
    const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch alerts");
    return res.json();
  },
  async getWallets(page = 1, limit = 50, search?: string, flaggedOnly = false): Promise<WalletListResponse> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (flaggedOnly) {
      params.append('flagged_only', 'true');
    }
    const res = await fetch(`${API_BASE}/wallets?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch wallets");
    return res.json();
  },
  async getWallet(address: string): Promise<WalletDetailResponse> {
    const res = await fetch(`${API_BASE}/wallets/${address}`);
    if (!res.ok) throw new Error("Failed to fetch wallet details");
    return res.json();
  },
  async getReport(address: string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/report/${address}`);
    if (!res.ok) {
      let message = `Failed to generate report (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson.detail) message = errJson.detail;
      } catch {
        // response may not be JSON
      }
      throw new Error(message);
    }
    return res.blob();
  },
};