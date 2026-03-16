import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import DocsPage from './docs/DocsPage.tsx';
import DashboardLayout from './dashboard/DashboardLayout.tsx';
import OverviewPage from './dashboard/OverviewPage.tsx';
import AgentsPage from './dashboard/AgentsPage.tsx';
import TransactionsPage from './dashboard/TransactionsPage.tsx';
import PoliciesPage from './dashboard/PoliciesPage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="policies" element={<PoliciesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
