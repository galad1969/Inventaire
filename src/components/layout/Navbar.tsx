import React, { useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  Menu,
  X,
  HardDrive,
  Download,
  Settings,
  Sparkles,
  Command,
  Plus,
  Shield,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

interface NavbarProps {
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    stats,
    seedDemoData,
    loading,
    openCreateModal,
    openInsuranceModal,
  } = useInventory();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Raccourci clavier Cmd+K / Ctrl+K pour focaliser la recherche
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] transition-all print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Toggle + Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition"
            aria-label="Ouvrir le menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <NavLink
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#0071e3] to-[#005bb5] flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[15px] tracking-tight text-[#1d1d1f] leading-none">
                Inventaire Privé
              </span>
              <span className="text-[10px] text-[#86868b] mt-0.5 hidden sm:block">
                Gestion locale hors-ligne
              </span>
            </div>
          </NavLink>
        </div>

        {/* Center: Global Search Omnibar (Apple style) */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un objet, marque, pièce, meuble, mot-clé..."
              className="w-full pl-9 pr-14 py-2 text-xs bg-[#f5f5f7] hover:bg-[#ebebee] focus:bg-white text-[#1d1d1f] placeholder:text-[#86868b] rounded-full border border-black/[0.05] focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 focus:outline-none transition-all"
            />
            <div className="absolute right-3 flex items-center gap-0.5 text-[10px] font-mono text-[#86868b] bg-white px-1.5 py-0.5 rounded border border-black/[0.08] pointer-events-none shadow-2xs">
              <span className="text-[11px]">⌘</span>K
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nouvel objet</span>
          </button>

          {/* Rapport d'assurance prêt à imprimer */}
          <button
            onClick={openInsuranceModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 text-xs font-semibold transition cursor-pointer"
            title="Générer un état des biens certifié pour votre assurance habitation"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">Rapport Assurance</span>
          </button>

          {stats.totalItems === 0 && (
            <button
              onClick={() => seedDemoData()}
              disabled={loading}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0071e3]/10 hover:bg-[#0071e3]/15 text-[#0071e3] text-xs font-medium transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Charger démo</span>
            </button>
          )}

          <NavLink
            to="/backup"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                isActive
                  ? 'bg-[#0071e3] text-white shadow-sm'
                  : 'bg-black/[0.04] hover:bg-black/[0.07] text-[#1d1d1f]'
              }`
            }
            title="Sauvegarde et Exportation JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sauvegardes</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `p-2 rounded-full transition ${
                isActive
                  ? 'bg-black/[0.08] text-[#1d1d1f]'
                  : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
              }`
            }
            title="Paramètres"
          >
            <Settings className="w-4 h-4" />
          </NavLink>
        </div>

      </div>
    </header>
  );
};
