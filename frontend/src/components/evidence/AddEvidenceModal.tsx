import React, { useState } from 'react';
import { X, Plus, Hash, Shield, FileText } from 'lucide-react';
import { EvidenceType, EvidenceItem } from '../../types/evidence';
import { Button } from '../ui/Button';

interface AddEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  onAdd: (evidence: Omit<EvidenceItem, 'id' | 'timestamp'>) => void;
}

export const AddEvidenceModal: React.FC<AddEvidenceModalProps> = ({
  isOpen,
  onClose,
  caseId,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EvidenceType>('Transaction');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [hashOrRef, setHashOrRef] = useState('');
  const [tags, setTags] = useState('ON-CHAIN, FORENSICS');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      caseId,
      type,
      title,
      description,
      source: source || 'INVESTIGATOR DIGITAL FORENSICS LAB',
      hashOrReference: hashOrRef || `SHA256:${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      investigator: 'INSP. VIKRAM RATHORE',
      chainOfCustodyStatus: 'ACQUIRED',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150 uppercase">
      <div className="w-full max-w-lg rounded-none bg-background border border-terminal-muted p-6 space-y-4 text-xs font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-terminal-muted">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-terminal-primary" />
            <span className="font-bold text-terminal-primary text-sm">
              REGISTER NEW FORENSIC EVIDENCE ARTIFACT
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-none text-terminal-muted hover:text-terminal-primary border border-transparent hover:border-terminal-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] text-terminal-muted font-bold">ARTIFACT TITLE</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 font-mono uppercase"
              placeholder="E.G. MEMORY DUMP EXTRACTION FROM COMPROMISED ENDPOINT"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-terminal-muted font-bold">EVIDENCE TYPE</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EvidenceType)}
                className="w-full p-2 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary font-mono uppercase"
              >
                <option value="Transaction">TRANSACTION</option>
                <option value="Wallet">WALLET ADDRESS</option>
                <option value="Screenshot">SCREENSHOT</option>
                <option value="Document">DOCUMENT</option>
                <option value="Exchange Record">EXCHANGE RECORD</option>
                <option value="IP Record">IP RECORD</option>
                <option value="Investigator Note">INVESTIGATOR NOTE</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-terminal-muted font-bold">SOURCE / ORIGIN</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-2 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 font-mono uppercase"
                placeholder="E.G. ON-CHAIN NODE / CERT-IN TRIAGE"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-terminal-muted font-bold">
              CRYPTOGRAPHIC HASH / TX / REFERENCE ID
            </label>
            <input
              type="text"
              value={hashOrRef}
              onChange={(e) => setHashOrRef(e.target.value)}
              className="w-full p-2 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs font-mono focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 uppercase"
              placeholder="SHA256: E3B0C44298FC1C149AFBF4C8996FB924..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-terminal-muted font-bold">FORENSIC SUMMARY & NOTES</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 font-mono uppercase"
              placeholder="DETAILED EXPLANATION OF EVIDENTIARY VALUE, COLLECTION METHOD, AND INITIAL FINDINGS..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-terminal-muted font-bold">TAGS (COMMA-SEPARATED)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-2 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs focus:outline-none focus:border-terminal-primary font-mono uppercase"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-terminal-muted">
            <Button type="button" variant="secondary" onClick={onClose}>
              [ CANCEL ]
            </Button>
            <Button type="submit" variant="primary">
              [ REGISTER & SEAL EVIDENCE ]
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
