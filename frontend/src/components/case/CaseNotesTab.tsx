import React, { useState } from 'react';
import { Plus, Tag, MessageSquare, Clock, User, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface NoteItem {
  id: string;
  author: string;
  badge: string;
  timestamp: string;
  tag: 'Important' | 'Follow-up' | 'Evidence' | 'Hypothesis' | 'Verified';
  content: string;
}

export const CaseNotesTab: React.FC<{ caseId: string }> = ({ caseId }) => {
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'n-1',
      author: 'Insp. Vikram Rathore',
      badge: 'CYBER-SOC-941',
      timestamp: '2026-08-16 16:45 UTC',
      tag: 'Verified',
      content: 'ApexGlobal compliance desk confirmed emergency freeze on deposit sub-account #98412. Holding balance of 5.80M USDT currently locked under mutual assistance notice.',
    },
    {
      id: 'n-2',
      author: 'Senior Analyst Maya Sen',
      badge: 'CYBER-FIU-412',
      timestamp: '2026-08-15 20:10 UTC',
      tag: 'Evidence',
      content: 'THORChain cross-chain swap correlation completed: 90 BTC sent to Asgard vault at 18:15 UTC generated exactly 5,820,000 USDT on Ethereum wallet 0x742d...44e at 18:25 UTC (10-minute block duration).',
    },
    {
      id: 'n-3',
      author: 'Agent R. Deshmukh',
      badge: 'CYBER-INV-118',
      timestamp: '2026-08-15 04:30 UTC',
      tag: 'Hypothesis',
      content: 'Syndicate-88 likely operating out of Eastern European timezones based on timestamp frequency analysis of Wasabi mixing coordinator sub-rounds.',
    }
  ]);

  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState<NoteItem['tag']>('Important');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newNote: NoteItem = {
      id: `n-${Date.now()}`,
      author: 'INSP. VIKRAM RATHORE',
      badge: 'CYBER-SOC-941',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      tag: newTag,
      content: newContent.trim().toUpperCase(),
    };

    setNotes([newNote, ...notes]);
    setNewContent('');
  };

  const getTagColor = (tag: NoteItem['tag']) => {
    switch (tag) {
      case 'Verified': return 'bg-background text-terminal-primary border-terminal-primary';
      case 'Evidence': return 'bg-background text-terminal-secondary border-terminal-secondary';
      case 'Important': return 'bg-background text-terminal-error border-terminal-error';
      case 'Follow-up': return 'bg-background text-terminal-secondary border-terminal-secondary';
      case 'Hypothesis': return 'bg-background text-terminal-muted border-terminal-muted';
    }
  };

  return (
    <div className="space-y-6 text-xs font-mono uppercase">
      {/* Add note box */}
      <form onSubmit={handleAddNote} className="p-4 rounded-none bg-background border border-terminal-muted space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-terminal-primary uppercase flex items-center gap-1.5 font-mono">
            <MessageSquare className="w-4 h-4 text-terminal-primary" />
            ADD COLLABORATIVE FIELD NOTE
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-terminal-muted uppercase font-bold">TAG:</span>
            <select
              value={newTag}
              onChange={(e) => setNewTag(e.target.value as any)}
              className="bg-background text-terminal-primary text-xs px-2.5 py-1 rounded-none border border-terminal-muted focus:outline-none focus:border-terminal-primary uppercase font-bold"
            >
              <option value="Important">IMPORTANT</option>
              <option value="Verified">VERIFIED</option>
              <option value="Evidence">EVIDENCE</option>
              <option value="Hypothesis">HYPOTHESIS</option>
              <option value="Follow-up">FOLLOW-UP</option>
            </select>
          </div>
        </div>

        <textarea
          rows={3}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="RECORD TACTICAL FINDINGS, COUNTERPARTY LEADS, OR INTERVIEW NOTES..."
          className="w-full p-3 rounded-none bg-background border border-terminal-muted text-terminal-primary text-xs font-mono focus:outline-none focus:border-terminal-primary placeholder:text-terminal-muted/50 uppercase"
        />

        <div className="flex justify-end">
          <Button type="submit" variant="primary" className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            [ APPEND TO CASE DOSSIER ]
          </Button>
        </div>
      </form>

      {/* Notes Stream */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-4 rounded-none bg-background border border-terminal-muted space-y-2 relative hover:border-terminal-primary transition-none group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-terminal-primary font-mono text-xs">{note.author.toUpperCase()}</span>
                <span className="text-terminal-muted font-bold">({note.badge})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-none border text-[10px] font-bold uppercase ${getTagColor(note.tag)}`}>
                  [{note.tag.toUpperCase()}]
                </span>
                <span className="text-[10px] text-terminal-muted">{note.timestamp}</span>
              </div>
            </div>
            <p className="text-terminal-primary font-mono text-xs leading-relaxed uppercase">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
