import React, { useState } from 'react';
import { X, Plus, FolderKanban, Shield } from 'lucide-react';
import { InvestigationCase } from '../../types/investigation';
import { Button } from '../ui/Button';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newCase: Partial<InvestigationCase>) => void;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<InvestigationCase['category']>('Ransomware');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('CRITICAL');
  const [primaryAsset, setPrimaryAsset] = useState('BTC');
  const [estimatedLossCrypto, setEstimatedLossCrypto] = useState('320.50 BTC');
  const [estimatedLossFiat, setEstimatedLossFiat] = useState('₹20.4 Cr');
  const [rootWalletAddress, setRootWalletAddress] = useState('');
  const [victimWalletAddress, setVictimWalletAddress] = useState('');
  const [summary, setSummary] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title,
      category,
      riskLevel: priority,
      primaryAsset,
      estimatedLossCrypto,
      estimatedLossFiat,
      rootWalletAddress: rootWalletAddress.trim(),
      victimWalletAddress: victimWalletAddress.trim() || undefined,
      summary,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150 uppercase">
      <div className="w-full max-w-2xl rounded-none bg-background border border-terminal-muted p-6 space-y-4 text-xs font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-terminal-primary" />
            <div>
              <span className="font-bold text-terminal-primary text-sm block">
                INITIATE NEW FORENSIC INVESTIGATION DOSSIER
              </span>
              <span className="text-[11px] text-terminal-muted">
                REGISTER CYBERCRIME INCIDENT, ASSIGN PRIORITY & CONFIGURE ROOT TARGET WALLETS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-none text-terminal-muted hover:text-terminal-primary border border-transparent hover:border-terminal-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] text-terminal-muted font-bold">
                CASE TITLE / INCIDENT IDENTIFIER
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.G. MUMBAI HEALTHCARE HOSPITAL RANSOMWARE ATTACK"
                className="w-full p-2.5 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-terminal-muted font-bold">
                CRIME CLASSIFICATION
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary uppercase"
              >
                <option value="Ransomware">RANSOMWARE EXTORTION</option>
                <option value="Pig Butchering">PIG BUTCHERING (CONFIDENCE SCAM)</option>
                <option value="Ponzi Scheme">DEFI / HIGH-YIELD PONZI SCHEME</option>
                <option value="Darknet Market">DARKNET NARCOTICS & WEAPONS</option>
                <option value="DeFi Exploit">SMART CONTRACT FLASH-LOAN EXPLOIT</option>
                <option value="Terrorist Financing">SANCTIONS / TERRORIST FINANCING</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-terminal-muted font-bold">
                INVESTIGATION PRIORITY
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2.5 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary uppercase"
              >
                <option value="CRITICAL">CRITICAL (ACTIVE EXTORTION / IMMINENT LOSS)</option>
                <option value="HIGH">HIGH (SUBSTANTIAL LOSS / ACTIVE MULES)</option>
                <option value="MEDIUM">MEDIUM (ROUTINE INTELLIGENCE)</option>
                <option value="LOW">LOW (TRIAGE / ARCHIVAL)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-terminal-muted font-bold">
                PRIMARY ASSET & CRYPTO LOSS
              </label>
              <input
                type="text"
                value={estimatedLossCrypto}
                onChange={(e) => setEstimatedLossCrypto(e.target.value)}
                placeholder="E.G. 320.50 BTC"
                className="w-full p-2.5 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-terminal-muted font-bold">
                ESTIMATED FIAT VALUE (INR / USD)
              </label>
              <input
                type="text"
                value={estimatedLossFiat}
                onChange={(e) => setEstimatedLossFiat(e.target.value)}
                placeholder="E.G. ₹20.4 CR ($24.5M)"
                className="w-full p-2.5 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 uppercase"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] text-terminal-muted font-bold">
                PRIMARY SUSPECT / EXTORTION WALLET ADDRESS
              </label>
              <input
                type="text"
                value={rootWalletAddress}
                onChange={(e) => setRootWalletAddress(e.target.value)}
                placeholder="E.G. BC1Q9X7Y4Z2W8U1V0K5A3B7C9D1E3F5G7H9J2K4L6M"
                className="w-full p-2.5 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 uppercase font-mono"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] text-terminal-muted font-bold">
                VICTIM TREASURY / PAYMENT INCEPTION ADDRESS (OPTIONAL)
              </label>
              <input
                type="text"
                value={victimWalletAddress}
                onChange={(e) => setVictimWalletAddress(e.target.value)}
                placeholder="E.G. BC1QVICTIMHOSPITAL..."
                className="w-full p-2.5 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 uppercase font-mono"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] text-terminal-muted font-bold">
                EXECUTIVE INCIDENT SUMMARY
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="BRIEF TECHNICAL SUMMARY OF INCIDENT VECTOR, ATTACK PAYLOAD, AND REPORTING PARTIES..."
                className="w-full p-2.5 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 uppercase font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-terminal-muted">
            <Button type="button" variant="outline" onClick={onClose}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary">
              [ OPEN CASE DOSSIER ]
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
