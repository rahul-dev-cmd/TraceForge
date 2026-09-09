import { BlockchainNetwork } from './wallet';
import { RiskLevel } from './investigation';

export interface CrossChainBridgeHop {
  id: string;
  sourceChain: BlockchainNetwork;
  sourceTxHash: string;
  sourceAddress: string;
  sourceAmount: string;
  sourceAsset: string;
  
  bridgeProtocol: 'THORChain' | 'Portal Bridge' | 'Wormhole' | 'Chainflip' | 'Stargate' | 'Symbiosis';
  bridgeContractAddress: string;
  
  destinationChain: BlockchainNetwork;
  destinationTxHash: string;
  destinationAddress: string;
  destinationAmount: string;
  destinationAsset: string;
  
  timestamp: string;
  executionDuration: string;
  riskLevel: RiskLevel;
  riskScore: number;
  caseId?: string;
  status: 'COMPLETED' | 'CONFIRMED' | 'FLAGGED';
}
