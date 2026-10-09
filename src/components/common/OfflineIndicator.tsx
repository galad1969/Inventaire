import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Statut de connexion"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-[#1d1d1f]/90 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-white shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Mode Hors-ligne — Base locale IndexedDB active</span>
    </aside>
  );
};
