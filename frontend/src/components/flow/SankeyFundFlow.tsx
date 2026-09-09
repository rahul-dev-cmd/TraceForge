import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Shuffle, 
  ArrowLeftRight, 
  Building2, 
  ArrowRight,
  TrendingDown,
  Layers,
  Coins
} from 'lucide-react';

interface SankeyStage {
  stage: string;
  category: string;
  amount: string;
  fiatValue: string;
  percentage: number;
  color: string;
  items: {
    name: string;
    address: string;
    amount: string;
    risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}

export const SankeyFundFlow: React.FC<{ onSelectAddress?: (addr: string) => void }> = ({ onSelectAddress }) => {
  const stages: SankeyStage[] = [
    {
      stage: '1. INCIDENT SOURCE',
      category: 'VICTIM EXTORTION',
      amount: '320.50 BTC',
      fiatValue: '₹20.4 CR',
      percentage: 100,
      color: 'border-terminal-primary text-terminal-primary',
      items: [
        { name: 'MUMBAI HOSPITAL TREASURY', address: 'bc1qvictimhospital001a9b8c7d6e5f4g3h2j1k0l9m', amount: '320.50 BTC', risk: 'LOW' }
      ]
    },
    {
      stage: '2. PRIMARY COLLECTOR',
      category: 'SUSPECT EXTORTION',
      amount: '320.46 BTC',
      fiatValue: '₹20.4 CR',
      percentage: 99.9,
      color: 'border-terminal-error text-terminal-error',
      items: [
        { name: 'PRIMARY RANSOM COLLECTOR', address: 'bc1q9x7y4z2w8u1v0k5a3b7c9d1e3f5g7h9j2k4l6m', amount: '320.46 BTC', risk: 'CRITICAL' }
      ]
    },
    {
      stage: '3. LAYERING & PEELING',
      category: 'INTERMEDIATE MULES',
      amount: '320.46 BTC',
      fiatValue: '₹20.4 CR',
      percentage: 99.8,
      color: 'border-terminal-secondary text-terminal-secondary',
      items: [
        { name: 'PEELING NODE ALPHA (180 BTC)', address: 'bc1qinterm111mule9876543210abcdef9876543210', amount: '180.00 BTC', risk: 'CRITICAL' },
        { name: 'PEELING NODE BETA (140.46 BTC)', address: 'bc1qinterm222mule1234567890fedcba1234567890', amount: '140.46 BTC', risk: 'HIGH' }
      ]
    },
    {
      stage: '4. PRIVACY MIXER',
      category: 'COINJOIN / WASABI',
      amount: '144.80 BTC',
      fiatValue: '₹9.45 CR',
      percentage: 45.2,
      color: 'border-terminal-primary text-terminal-primary',
      items: [
        { name: 'WASABI PRIVACY POOL COORDINATOR', address: 'bc1qmixerwasabipool9999988888777776666655555', amount: '145.00 BTC IN', risk: 'CRITICAL' },
        { name: 'POST-MIXER DISPERSAL ADDRESS', address: 'bc1qpostmixerout4444433333222221111100000', amount: '144.80 BTC OUT', risk: 'CRITICAL' }
      ]
    },
    {
      stage: '5. CROSS-CHAIN BRIDGE',
      category: 'THORCHAIN (BTC → ETH)',
      amount: '5,820,000 USDT',
      fiatValue: '₹48.4 CR EQ.',
      percentage: 28.1,
      color: 'border-terminal-secondary text-terminal-secondary',
      items: [
        { name: 'THORCHAIN ASGARD VAULT', address: 'bc1qthorchainvaultliquidity00000000000000000', amount: '90.00 BTC SWAP', risk: 'MEDIUM' },
        { name: 'BRIDGED SUSPECT ETHEREUM WALLET', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', amount: '5.82M USDT MINTED', risk: 'CRITICAL' }
      ]
    },
    {
      stage: '6. EXCHANGE INGRESS & CASHOUT',
      category: 'OFFSHORE VASP FREEZE',
      amount: '5,800,000 USDT',
      fiatValue: '₹4.8 CR FROZEN',
      percentage: 28.0,
      color: 'border-terminal-primary text-terminal-primary',
      items: [
        { name: 'APEXGLOBAL DEPOSIT ACCT #98412', address: '0x82A49e9841fE6C3886bC5A039439c2c62391991F', amount: '5.80M USDT (FROZEN)', risk: 'CRITICAL' },
        { name: 'P2P HAWALA OTC CASHOUT DESK', address: '0x91F729ab83Cde4982390483a9123019842F90812', amount: '20,000 USDT TEST', risk: 'HIGH' }
      ]
    }
  ];

  return (
    <div className="space-y-6 uppercase">
      {/* Header Summary Banner */}
      <div className="p-4 rounded-none bg-background border border-terminal-muted flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="text-xs text-terminal-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-4 h-4" />
            MONEY FLOW VOLUME & VELOCITY ANALYSIS
          </div>
          <div className="text-sm font-bold text-terminal-primary mt-0.5">
            ₹20.4 CR (320.50 BTC) TRACED FROM HOSPITAL INCIDENT SCENE TO OFFSHORE VASP FREEZE
          </div>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 text-xs shrink-0 mt-3 md:mt-0">
          <div className="px-3 py-1.5 rounded-none bg-background border border-terminal-primary text-terminal-primary whitespace-nowrap">
            <span className="text-[10px] block font-bold text-terminal-muted">FUNDS FROZEN</span>
            <span className="font-bold">₹4.8 CR ($5.8M USDT)</span>
          </div>
          <div className="px-3 py-1.5 rounded-none bg-background border border-terminal-error text-terminal-error whitespace-nowrap">
            <span className="text-[10px] block font-bold text-terminal-muted">TOTAL HOPS</span>
            <span className="font-bold">8 SEQUENTIAL NODES</span>
          </div>
        </div>
      </div>

      {/* Sankey Flow Columns */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-6 gap-4 min-w-[1000px]">
        {stages.map((stage, idx) => (
          <div 
            key={stage.stage}
            className="flex flex-col rounded-none bg-background border border-terminal-muted p-3 space-y-3 relative group hover:border-terminal-primary transition-colors"
          >
            {/* Step indicator */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-terminal-primary truncate pr-2">{stage.stage}</span>
              {idx < stages.length - 1 && (
                <ArrowRight className="w-4 h-4 text-terminal-primary absolute -right-4 top-6 z-10 bg-background rounded-none border border-terminal-muted p-0.5" />
              )}
            </div>

            {/* Volume Card */}
            <div className={`p-2.5 rounded-none border ${stage.color} bg-background font-mono flex flex-col justify-between h-[100px] shrink-0`}>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 line-clamp-2">
                {stage.category}
              </div>
              <div>
                <div className="font-bold text-sm">{stage.amount}</div>
                <div className="text-[10px] opacity-90">{stage.fiatValue}</div>
              </div>
            </div>

            {/* Sub-items / Wallets */}
            <div className="space-y-2 flex-1">
              {stage.items.map((item) => (
                <div
                  key={item.address}
                  onClick={() => onSelectAddress && onSelectAddress(item.address)}
                  className="p-2 rounded-none bg-background border border-terminal-muted hover:border-terminal-primary cursor-pointer transition-none text-xs font-mono group/item"
                >
                  <div className="font-bold text-terminal-primary truncate group-hover/item:text-background group-hover/item:bg-terminal-primary">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-terminal-muted truncate mt-0.5">
                    {item.address.slice(0, 8)}...{item.address.slice(-6)}
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-[10px] mt-1 pt-1 border-t border-terminal-muted gap-1">
                    <span className="text-terminal-muted truncate min-w-0 flex-1">{item.amount}</span>
                    <span className={`px-1.5 py-0.5 shrink-0 rounded-none font-bold border ${
                      item.risk === 'CRITICAL' ? 'text-terminal-error border-terminal-error' :
                      item.risk === 'HIGH' ? 'text-terminal-secondary border-terminal-secondary' :
                      item.risk === 'MEDIUM' ? 'text-terminal-secondary border-terminal-secondary' :
                      'text-terminal-primary border-terminal-primary'
                    }`}>
                      [{item.risk}]
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};
