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
import LoginPage from './auth/LoginPage.tsx';
import SignupPage from './auth/SignupPage.tsx';
import { AuthProvider, ProtectedRoute } from './lib/AuthContext.tsx';
import { ToastProvider } from './lib/toast.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<ErrorBoundary><OverviewPage /></ErrorBoundary>} />
                <Route path="agents" element={<ErrorBoundary><AgentsPage /></ErrorBoundary>} />
                <Route path="transactions" element={<ErrorBoundary><TransactionsPage /></ErrorBoundary>} />
                <Route path="policies" element={<ErrorBoundary><PoliciesPage /></ErrorBoundary>} />
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
