import { CrossChainBridgeHop } from '../types/crosschain';

export const mockCrossChainHops: CrossChainBridgeHop[] = [
  {
    id: 'HOP-001',
    sourceChain: 'Bitcoin',
    sourceTxHash: 'bb22cc33dd44ee55ff66aa77889900112233445566778899aabbccddeeff0011',
    sourceAddress: 'bc1qpostmixerout4444433333222221111100000',
    sourceAmount: '90.00 BTC',
    sourceAsset: 'BTC',
    
    bridgeProtocol: 'THORChain',
    bridgeContractAddress: 'bc1qthorchainvaultliquidity00000000000000000',
    
    destinationChain: 'Ethereum',
    destinationTxHash: '0xaa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff00',
    destinationAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    destinationAmount: '5,820,000 USDT',
    destinationAsset: 'USDT',
    
    timestamp: '2026-08-15 18:15 UTC',
    executionDuration: '9m 42s',
    riskLevel: 'CRITICAL',
    riskScore: 95,
    caseId: 'case-2026-0142',
    status: 'FLAGGED',
  },
  {
    id: 'HOP-002',
    sourceChain: 'Ethereum',
    sourceTxHash: '0x33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122',
    sourceAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    sourceAmount: '45,000 USDT',
    sourceAsset: 'USDT',
    
    bridgeProtocol: 'Portal Bridge',
    bridgeContractAddress: '0x98f3c9e6E3fAce36bA8Cfe864147776d6970740D',
    
    destinationChain: 'Polygon',
    destinationTxHash: '0x556677889900112233445566778899aabbccddeeff00112233445566778899aa',
    destinationAddress: '0x1837482910481092830198230192830198230198',
    destinationAmount: '44,980 USDT',
    destinationAsset: 'USDT',
    
    timestamp: '2026-08-16 11:30 UTC',
    executionDuration: '3m 15s',
    riskLevel: 'HIGH',
    riskScore: 82,
    caseId: 'case-2026-0142',
    status: 'COMPLETED',
  },
  {
    id: 'HOP-003',
    sourceChain: 'Ethereum',
    sourceTxHash: '0x99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa',
    sourceAddress: '0x71c59b2a9e3d8f1c0b4a7d6e5c4b3a2f1e0d9c8b',
    sourceAmount: '250.00 ETH',
    sourceAsset: 'ETH',
    
    bridgeProtocol: 'Wormhole',
    bridgeContractAddress: '0x3ee18B2214AFF97000D974cf647E7C347E8fa585',
    
    destinationChain: 'Arbitrum',
    destinationTxHash: '0x112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
    destinationAddress: '0x6644229900112233445566778899aabbccddeeff',
    destinationAmount: '249.85 WETH',
    destinationAsset: 'WETH',
    
    timestamp: '2026-08-02 14:10 UTC',
    executionDuration: '14m 02s',
    riskLevel: 'HIGH',
    riskScore: 84,
    caseId: 'case-2026-0129',
    status: 'CONFIRMED',
  }
];
