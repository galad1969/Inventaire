import React from 'react';
import { X, Filter, RotateCcw, Check, Tag, ShieldCheck, Box, FileText, Hash } from 'lucide-react';
import { FilterState, ItemCondition, ItemStatus } from '../../types/inventory';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  categories: string[];
  residences: string[];
  tags?: Array<{ name: string; count: number }>;
  totalMatches: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  categories,
  residences,
  tags = [],
  totalMatches,
}) => {
  if (!isOpen) return null;

  const conditions: { value: ItemCondition | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous les états' },
    { value: 'neuf', label: 'Neuf' },
    { value: 'tres_bon_etat', label: 'Très bon état' },
    { value: 'bon_etat', label: 'Bon état' },
    { value: 'satisfaisant', label: 'Satisfaisant' },
    { value: 'pour_pieces', label: 'Pour pièces' },
  ];

  const statuses: { value: ItemStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'actif', label: 'Actif en inventaire' },
    { value: 'en_vente', label: '🏷️ En vente uniquement' },
    { value: 'vendu', label: 'Vendu' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/25 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#1c1c1e] shadow-2xl flex flex-col justify-between border-l border-black/[0.08] dark:border-white/[0.08]">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">Filtres avancés</h2>
                <span className="text-xs text-[#86868b] dark:text-[#8e8e93]">
                  {totalMatches} objet{totalMatches > 1 ? 's' : ''} correspondant{totalMatches > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Controls Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            
            {/* Statut (En vente, Actif...) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider block">
                Statut de l'objet
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statuses.map((st) => (
                  <button
                    key={st.value}
                    onClick={() => onChange({ ...filters, status: st.value })}
                    className={`px-3 py-2 text-xs rounded-xl font-medium text-left transition border cursor-pointer ${
                      filters.status === st.value
                        ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                        : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border-transparent hover:bg-[#ebebee] dark:hover:bg-[#353538]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* État matériel */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider block">
                État matériel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {conditions.map((cond) => (
                  <button
                    key={cond.value}
                    onClick={() => onChange({ ...filters, condition: cond.value })}
                    className={`px-3 py-2 text-xs rounded-xl font-medium text-left transition border cursor-pointer ${
                      filters.condition === cond.value
                        ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                        : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border-transparent hover:bg-[#ebebee] dark:hover:bg-[#353538]'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Garantie */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider block">
                Garantie constructeur
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all', label: 'Toutes' },
                  { value: 'active', label: 'Active' },
                  { value: 'expired', label: 'Expirée' },
                ].map((w) => (
                  <button
                    key={w.value}
                    onClick={() => onChange({ ...filters, warranty: w.value as any })}
                    className={`px-3 py-2 text-xs rounded-xl font-medium text-center transition border cursor-pointer ${
                      filters.warranty === w.value
                        ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                        : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border-transparent hover:bg-[#ebebee] dark:hover:bg-[#353538]'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre par Étiquettes / Tags */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
                    <span>Étiquettes (Tags)</span>
                  </label>
                  {filters.tag && (
                    <button
                      onClick={() => onChange({ ...filters, tag: null })}
                      className="text-[11px] text-[#0071e3] dark:text-[#0a84ff] hover:underline cursor-pointer"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#fbfbfd] dark:bg-[#252528] rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
                  {tags.map((t) => {
                    const isSelected = filters.tag === t.name;
                    return (
                      <button
                        key={t.name}
                        onClick={() =>
                          onChange({
                            ...filters,
                            tag: isSelected ? null : t.name,
                          })
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#0071e3] text-white shadow-2xs'
                            : 'bg-white dark:bg-[#2c2c2e] hover:bg-[#f5f5f7] dark:hover:bg-[#353538] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08]'
                        }`}
                      >
                        <span>#{t.name}</span>
                        <span
                          className={`text-[9px] px-1 rounded-full ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-black/[0.05] dark:bg-white/[0.1] text-[#86868b] dark:text-[#8e8e93]'
                          }`}
                        >
                          {t.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fourchette de Prix d'Achat */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider block">
                Prix d'achat (€)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min €"
                  value={filters.minPrice ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      minPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08] focus:bg-white dark:focus:bg-[#252528] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                />
                <span className="text-[#86868b] dark:text-[#8e8e93] text-xs">à</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max €"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      maxPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08] focus:bg-white dark:focus:bg-[#252528] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                />
              </div>
            </div>

            {/* Options et Liaisons spécifiques */}
            <div className="space-y-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
              <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider block">
                Contenu & Pièces jointes
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#ebebee] dark:hover:bg-[#353538] transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(filters.hasPackaging)}
                  onChange={(e) => onChange({ ...filters, hasPackaging: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0071e3] focus:ring-[#0071e3]"
                />
                <div className="text-xs">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">Avec emballage d'origine</span>
                  <span className="text-[#86868b] dark:text-[#8e8e93] text-[11px]">
                    Objets possédant leur boîte ou carton répertorié
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#ebebee] dark:hover:bg-[#353538] transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(filters.hasAccessories)}
                  onChange={(e) => onChange({ ...filters, hasAccessories: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0071e3] focus:ring-[#0071e3]"
                />
                <div className="text-xs">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">Avec accessoires</span>
                  <span className="text-[#86868b] dark:text-[#8e8e93] text-[11px]">
                    Objets avec câbles, adaptateurs, batteries ou accessoires liés
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#ebebee] dark:hover:bg-[#353538] transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(filters.hasInvoice)}
                  onChange={(e) => onChange({ ...filters, hasInvoice: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0071e3] focus:ring-[#0071e3]"
                />
                <div className="text-xs">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">Avec facture d'achat / PDF</span>
                  <span className="text-[#86868b] dark:text-[#8e8e93] text-[11px]">
                    Objets disposant d'une facture rattachée dans IndexedDB
                  </span>
                </div>
              </label>
            </div>

          </div>

          {/* Footer actions */}
          <div className="p-4 px-6 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#fbfbfd] dark:bg-[#18181a] flex items-center justify-between gap-3">
            <button
              onClick={onReset}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              Afficher ({totalMatches})
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
