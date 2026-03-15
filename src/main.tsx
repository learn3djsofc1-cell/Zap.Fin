import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import DashboardLayout from './dashboard/DashboardLayout.tsx';
import OverviewPage from './dashboard/OverviewPage.tsx';
import CardsPage from './dashboard/CardsPage.tsx';
import TopupsPage from './dashboard/TopupsPage.tsx';
import ControlsPage from './dashboard/ControlsPage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="cards" element={<CardsPage />} />
          <Route path="topups" element={<TopupsPage />} />
          <Route path="controls" element={<ControlsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
