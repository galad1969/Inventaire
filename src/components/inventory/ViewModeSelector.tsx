import React from 'react';
import { LayoutGrid, Grid3X3, List } from 'lucide-react';
import { ViewMode } from '../../types/inventory';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  onChange,
}) => {
  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.05] dark:border-white/[0.08]">
      <button
        onClick={() => onChange('large-grid')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
          viewMode === 'large-grid'
            ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
            : 'text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
        }`}
        title="Grande grille"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Grande grille</span>
      </button>

      <button
        onClick={() => onChange('compact-grid')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
          viewMode === 'compact-grid'
            ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
            : 'text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
        }`}
        title="Petite grille"
      >
        <Grid3X3 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Petite grille</span>
      </button>

      <button
        onClick={() => onChange('list')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
          viewMode === 'list'
            ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
            : 'text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
        }`}
        title="Affichage liste"
      >
        <List className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Liste</span>
      </button>
    </div>
  );
};
