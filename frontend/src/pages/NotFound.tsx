import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, FolderKanban } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 uppercase font-mono font-bold">
      <div className="bg-background max-w-lg w-full p-10 rounded-none border border-terminal-error text-center shadow-none">
        <div className="w-16 h-16 rounded-none bg-background border border-terminal-error flex items-center justify-center text-terminal-error mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="text-xs text-terminal-error tracking-widest mb-2">
          HTTP 404 — ROUTE UNRECOGNIZED
        </div>

        <h2 className="text-2xl text-terminal-error mb-3">
          INVESTIGATION ENDPOINT NOT FOUND.
        </h2>

        <p className="text-sm text-terminal-muted mb-8 leading-relaxed">
          THE REQUESTED CRYPTOGRAPHIC LEDGER ADDRESS, TRANSACTION HASH, OR FORENSIC CASE RECORD DOES NOT EXIST IN THE ACTIVE INDEXING REGISTRY.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate('/dashboard')}
          >
            RETURN TO DASHBOARD
          </Button>

          <Button
            variant="secondary"
            icon={FolderKanban}
            onClick={() => navigate('/investigations')}
          >
            VIEW INVESTIGATIONS
          </Button>
        </div>
      </div>
    </div>
  );
};
