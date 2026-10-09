import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { InventoryProvider } from './context/InventoryContext';
import { AppLayout } from './components/layout/AppLayout';
import { InventoryPage } from './pages/InventoryPage';
import { ForSalePage } from './pages/ForSalePage';
import { LocationsPage } from './pages/LocationsPage';
import { WarrantiesPage } from './pages/WarrantiesPage';
import { ArchivedPage } from './pages/ArchivedPage';
import { BackupPage } from './pages/BackupPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <InventoryProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<InventoryPage />} />
              <Route path="for-sale" element={<ForSalePage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="warranties" element={<WarrantiesPage />} />
              <Route path="archived" element={<ArchivedPage />} />
              <Route path="backup" element={<BackupPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </InventoryProvider>
    </ThemeProvider>
  );
}
