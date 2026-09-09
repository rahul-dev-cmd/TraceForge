import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { LiveTracePage } from './pages/LiveTracePage';
import {
  InvestigatePage,
  TransactionGraphPage,
  WalletIntelligencePage,
  PatternDetectionPage,
  AlertsCenterPage,
  CopilotPage,
  ForensicReportsPage,
} from './pages/PagesIndex';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Live Mempool Trace */}
        <Route path="live-trace" element={<LiveTracePage />} />

        {/* Live Alerts Center */}
        <Route path="alerts" element={<AlertsCenterPage />} />

        {/* Investigate Workbench */}
        <Route path="investigate" element={<InvestigatePage />} />
        <Route path="investigate/:address" element={<InvestigatePage />} />

        {/* Transaction Graph */}
        <Route path="graph" element={<TransactionGraphPage />} />

        {/* Wallet Intelligence */}
        <Route path="wallets" element={<WalletIntelligencePage />} />
        <Route path="wallets/:address" element={<WalletIntelligencePage />} />

        {/* Pattern Detection */}
        <Route path="patterns" element={<PatternDetectionPage />} />

        {/* AI Forensic Copilot */}
        <Route path="copilot" element={<CopilotPage />} />

        {/* Forensic Reports */}
        <Route path="reports" element={<ForensicReportsPage />} />

        {/* Redirects from removed mock routes */}
        <Route path="cases" element={<Navigate to="/dashboard" replace />} />
        <Route path="cases/:id" element={<Navigate to="/dashboard" replace />} />
        <Route path="clusters" element={<Navigate to="/wallets" replace />} />
        <Route path="cross-chain" element={<Navigate to="/graph" replace />} />
        <Route path="evidence" element={<Navigate to="/dashboard" replace />} />
        <Route path="timeline" element={<Navigate to="/wallets" replace />} />
        <Route path="exchanges" element={<Navigate to="/wallets" replace />} />
        <Route path="settings" element={<Navigate to="/dashboard" replace />} />
        <Route path="investigations" element={<Navigate to="/dashboard" replace />} />
        <Route path="investigations/:id" element={<Navigate to="/dashboard" replace />} />
        <Route path="transactions" element={<Navigate to="/graph" replace />} />
        <Route path="risk-analysis" element={<Navigate to="/patterns" replace />} />

        {/* 404 Route */}
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
