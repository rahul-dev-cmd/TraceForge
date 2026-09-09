import { BlockchainNetwork, EntityClassification } from './wallet';
import { RiskLevel } from './investigation';

export interface ExchangeRecord {
  id: string;
  name: string;
  jurisdiction: string;
  vaspType: 'Centralized VASP' | 'Decentralized Liquidity Pool' | 'OTC Desk' | 'P2P Network' | 'Privacy Mixer';
  complianceStatus: 'Cooperative' | 'Unregulated / High Risk' | 'Non-responsive' | 'Sanctioned';
  depositAddress: string;
  network: BlockchainNetwork;
  totalReceivedFiat: string;
  totalReceivedCrypto: string;
  associatedCaseId?: string;
  riskLevel: RiskLevel;
  simulatedKyc?: SimulatedKycRecord;
  simulatedIpLogs?: SimulatedIpRecord[];
  geoLocation?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    indicatorType: 'Exchange Headquarters' | 'Suspected Entity Location' | 'VPN Relay' | 'Cash-out Node';
  };
}

export interface SimulatedKycRecord {
  customerReference: string;
  registrationDate: string;
  verificationTier: 'Tier 1 (Basic)' | 'Tier 2 (Full Identity)' | 'Tier 3 (Institutional Enhanced)';
  declaredCountry: string;
  accountStatus: 'Active' | 'Under Investigation' | 'Temporarily Frozen Under MLAT' | 'Suspended';
  linkedDepositAddresses: string[];
  withdrawalAddresses: string[];
  lastLoginIp?: string;
  isSimulatedDemoData: boolean;
}

export interface SimulatedIpRecord {
  id: string;
  ipAddress: string;
  asn: string;
  isp: string;
  location: string;
  isVpnOrProxy: boolean;
  proxyService?: string;
  timestamp: string;
  associatedSession: string;
  isSimulatedDemoData: boolean;
}
