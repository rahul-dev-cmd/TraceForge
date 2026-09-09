import { WalletEntity, BlockchainNetwork } from '../types/wallet';
import { TransactionEntity } from '../types/transaction';
import { WalletCluster } from '../types/cluster';
import { CrossChainBridgeHop } from '../types/crosschain';
import { mockWallets } from '../data/mockWallets';
import { mockTransactions } from '../data/mockTransactions';
import { mockClusters } from '../data/mockClusters';
import { mockCrossChainHops } from '../data/mockCrossChain';

/**
 * Blockchain & Graph Data Abstraction Layer
 * Provides modular access that can be connected to real on-chain indexers later
 */
export const blockchainService = {
  async getWallets(network?: BlockchainNetwork): Promise<WalletEntity[]> {
    await delay(120);
    if (!network || network === ('All Networks' as unknown as BlockchainNetwork)) {
      return [...mockWallets];
    }
    return mockWallets.filter(w => w.network.toLowerCase() === network.toLowerCase());
  },

  async getWalletByAddress(address: string): Promise<WalletEntity | undefined> {
    await delay(80);
    const clean = address.trim().toLowerCase();
    return mockWallets.find(w => w.address.toLowerCase() === clean);
  },

  async getTransactions(params?: { 
    network?: string; 
    caseId?: string;
    riskLevel?: string;
    address?: string;
  }): Promise<TransactionEntity[]> {
    await delay(120);
    let txs = [...mockTransactions];

    if (params?.caseId) {
      txs = txs.filter(t => t.caseId === params.caseId);
    }
    if (params?.network && params.network !== 'All Networks') {
      txs = txs.filter(t => t.network.toLowerCase() === params.network!.toLowerCase());
    }
    if (params?.riskLevel && params.riskLevel !== 'ALL') {
      txs = txs.filter(t => t.riskLevel === params.riskLevel);
    }
    if (params?.address) {
      const clean = params.address.toLowerCase();
      txs = txs.filter(t => t.fromAddress.toLowerCase() === clean || t.toAddress.toLowerCase() === clean);
    }

    return txs;
  },

  async getTransactionByHash(hash: string): Promise<TransactionEntity | undefined> {
    await delay(80);
    const clean = hash.trim().toLowerCase();
    return mockTransactions.find(t => t.hash.toLowerCase() === clean);
  },

  async getAllClusters(): Promise<WalletCluster[]> {
    await delay(100);
    return [...mockClusters];
  },

  async getClusterById(clusterId: string): Promise<WalletCluster | undefined> {
    await delay(80);
    return mockClusters.find(c => c.id === clusterId);
  },

  async getCrossChainFlows(caseId?: string): Promise<CrossChainBridgeHop[]> {
    await delay(100);
    if (caseId) {
      return mockCrossChainHops.filter(h => h.caseId === caseId);
    }
    return [...mockCrossChainHops];
  },

  async searchGlobal(query: string) {
    await delay(150);
    const q = query.trim().toLowerCase();
    if (!q) return { wallets: [], transactions: [], clusters: [], cases: [] };

    const wallets = mockWallets.filter(w => 
      w.address.toLowerCase().includes(q) || 
      (w.label && w.label.toLowerCase().includes(q)) ||
      w.tags.some(t => t.toLowerCase().includes(q))
    );

    const transactions = mockTransactions.filter(t => 
      t.hash.toLowerCase().includes(q) ||
      (t.fromLabel && t.fromLabel.toLowerCase().includes(q)) ||
      (t.toLabel && t.toLabel.toLowerCase().includes(q))
    );

    const clusters = mockClusters.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.threatGroup && c.threatGroup.toLowerCase().includes(q))
    );

    return { wallets, transactions, clusters };
  }
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
