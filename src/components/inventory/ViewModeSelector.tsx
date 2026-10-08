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
    <div className="inline-flex items-center p-1 rounded-xl bg-black/[0.04] border border-black/[0.05]">
      <button
        onClick={() => onChange('large-grid')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
          viewMode === 'large-grid'
            ? 'bg-white text-[#1d1d1f] shadow-xs'
            : 'text-[#86868b] hover:text-[#1d1d1f]'
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
            ? 'bg-white text-[#1d1d1f] shadow-xs'
            : 'text-[#86868b] hover:text-[#1d1d1f]'
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
            ? 'bg-white text-[#1d1d1f] shadow-xs'
            : 'text-[#86868b] hover:text-[#1d1d1f]'
        }`}
        title="Affichage liste"
      >
        <List className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Liste</span>
      </button>
    </div>
  );
};
