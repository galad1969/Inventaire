import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Boxes,
  Tag,
  MapPin,
  ShieldCheck,
  Archive,
  Database,
  Settings,
  FolderOpen,
  Sparkles,
  ChevronRight,
  HardDrive,
  Hash,
  BookOpen,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    stats,
    settings,
    selectedCategory,
    setSelectedCategory,
    selectedResidence,
    setSelectedResidence,
    selectedTag,
    setSelectedTag,
    allTags,
    items,
    openInsuranceModal,
  } = useInventory();

  // Liste unique des résidences trouvées dans les objets ou paramètres
  const residences = React.useMemo(() => {
    const set = new Set<string>(settings?.residences || []);
    items.forEach((it) => {
      if (it.location?.residence) set.add(it.location.residence);
    });
    return Array.from(set);
  }, [settings, items]);

  // Liste des catégories avec comptage
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((it) => {
      if (it.category) {
        counts[it.category] = (counts[it.category] || 0) + 1;
      }
    });
    return counts;
  }, [items]);

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'bg-[#0071e3] text-white shadow-xs'
        : 'text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
    }`;

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-15 z-40 md:z-20 h-[calc(100vh-3.75rem)] w-68 shrink-0 bg-[#fbfbfd] dark:bg-[#121214] border-r border-black/[0.06] dark:border-white/[0.08] flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          
          {/* Main Views Navigation */}
          <div>
            <div className="text-[11px] font-semibold text-[#86868b] dark:text-[#8e8e93] uppercase tracking-wider px-3 mb-2">
              Inventaire
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/"
                end
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedResidence(null);
                  onClose();
                }}
                className={navItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <Boxes className="w-4 h-4 opacity-80" />
                  <span>Tous les objets</span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-current">
                  {stats.activeItems}
                </span>
              </NavLink>

              <NavLink
                to="/for-sale"
                onClick={onClose}
                className={navItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 opacity-80" />
                  <span>En vente</span>
                </div>
                {stats.forSaleItems > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    {stats.forSaleItems}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/locations"
                onClick={onClose}
                className={navItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 opacity-80" />
                  <span>Emplacements</span>
                </div>
                <span className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">{residences.length}</span>
              </NavLink>

              <NavLink
                to="/warranties"
                onClick={onClose}
                className={navItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 opacity-80" />
                  <span>Sous garantie</span>
                </div>
                {stats.warrantyActiveCount > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    {stats.warrantyActiveCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/archived"
                onClick={onClose}
                className={navItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 opacity-80" />
                  <span>Objets archivés</span>
                </div>
                {stats.archivedItems > 0 && (
                  <span className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                    {stats.archivedItems}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/guide"
                onClick={onClose}
                className={navItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 opacity-80" />
                  <span>Guide d'utilisation</span>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#0a84ff]">
                  Aide
                </span>
              </NavLink>

              <button
                onClick={() => {
                  onClose();
                  openInsuranceModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Rapport Assurance</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                  PDF / Print
                </span>
              </button>
            </nav>
          </div>

          {/* Filtres par Résidence */}
          {residences.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-[#86868b] dark:text-[#8e8e93] uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
                <span>Résidences</span>
                {selectedResidence && (
                  <button
                    onClick={() => setSelectedResidence(null)}
                    className="text-[10px] text-[#0071e3] dark:text-[#0a84ff] hover:underline normal-case cursor-pointer"
                  >
                    Effacer
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {residences.map((res) => {
                  const isSelected = selectedResidence === res;
                  return (
                    <button
                      key={res}
                      onClick={() => {
                        setSelectedResidence(isSelected ? null : res);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#0a84ff] font-semibold'
                          : 'text-[#555558] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] dark:bg-[#0a84ff] shrink-0" />
                        <span className="truncate">{res}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtres par Catégories */}
          <div>
            <div className="text-[11px] font-semibold text-[#86868b] dark:text-[#8e8e93] uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>Catégories</span>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-[10px] text-[#0071e3] dark:text-[#0a84ff] hover:underline normal-case cursor-pointer"
                >
                  Toutes
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {(settings?.categories || Object.keys(categoryCounts)).map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(isSelected ? null : cat);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#0a84ff] font-semibold'
                        : 'text-[#555558] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    {count > 0 && (
                      <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93] shrink-0 font-medium">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtres par Étiquettes / Tags transversaux */}
          {allTags.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-[#86868b] dark:text-[#8e8e93] uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#0071e3] dark:text-[#0a84ff]" />
                  <span>Étiquettes</span>
                </span>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-[10px] text-[#0071e3] dark:text-[#0a84ff] hover:underline normal-case cursor-pointer"
                  >
                    Effacer
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1 px-2 max-h-44 overflow-y-auto">
                {allTags.map(({ name, count }) => {
                  const isSelected = selectedTag === name;
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedTag(isSelected ? null : name);
                        onClose();
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#0071e3] text-white font-semibold shadow-2xs'
                          : 'bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-[#1d1d1f] dark:text-[#f5f5f7]'
                      }`}
                    >
                      <span>#{name}</span>
                      <span
                        className={`text-[9px] px-1 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-black/[0.05] dark:bg-white/[0.1] text-[#86868b] dark:text-[#8e8e93]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Section: Offline Status & Settings */}
        <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-[#121214]/80 space-y-2">
          <PWAInstallButton variant="sidebar" />

          <div className="px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] text-[11px] text-[#86868b] dark:text-[#8e8e93] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>IndexedDB Hors-ligne</span>
            </div>
            <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {stats.totalValue > 0 ? `${stats.totalValue.toLocaleString('fr-FR')} €` : '0 €'}
            </span>
          </div>

          <div className="flex items-center gap-1 pt-1">
            <NavLink
              to="/backup"
              onClick={onClose}
              className={({ isActive }) =>
                `flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition ${
                  isActive
                    ? 'bg-[#0071e3] text-white'
                    : 'text-[#555558] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`
              }
            >
              <Database className="w-3.5 h-3.5" />
              <span>Sauvegardes</span>
            </NavLink>
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `p-1.5 text-xs rounded-lg transition ${
                  isActive
                    ? 'bg-black/[0.08] dark:bg-white/[0.14] text-[#1d1d1f] dark:text-[#f5f5f7]'
                    : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`
              }
              title="Paramètres"
            >
              <Settings className="w-4 h-4" />
            </NavLink>
          </div>
        </div>

      </aside>
    </>
  );
};
