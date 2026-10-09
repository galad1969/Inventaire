import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  X,
  Sparkles,
  ArrowUpDown,
  Tag,
  ShieldCheck,
  RotateCcw,
  Plus,
  Hash,
  FileSpreadsheet,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { getMediaById } from '../services/db';
import { downloadInventoryCsv } from '../services/csvExport';
import {
  InventoryItem,
  ViewMode,
  SortOption,
  FilterState,
} from '../types/inventory';
import { ViewModeSelector } from '../components/inventory/ViewModeSelector';
import { FilterDrawer } from '../components/inventory/FilterDrawer';
import { ItemQuickViewModal } from '../components/inventory/ItemQuickViewModal';
import { LargeGridView } from '../components/inventory/LargeGridView';
import { CompactGridView } from '../components/inventory/CompactGridView';
import { ListView } from '../components/inventory/ListView';

export const InventoryPage: React.FC = () => {
  const {
    items,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedResidence,
    setSelectedResidence,
    selectedTag,
    setSelectedTag,
    allTags,
    settings,
    seedDemoData,
    openCreateModal,
  } = useInventory();

  // Mode d'affichage (stocké dans le localStorage si présent)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem('inventaire_view_mode') as ViewMode) || 'large-grid';
    } catch {
      return 'large-grid';
    }
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('inventaire_view_mode', mode);
    } catch {
      // Ignore les erreurs de quota ou de politique de sécurité
    }
  };

  // Tri sélectionné
  const [sortOption, setSortOption] = useState<SortOption>('updated-desc');

  // Filtres avancés
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: null,
    residence: null,
    condition: 'all',
    status: 'all',
    warranty: 'all',
    minPrice: undefined,
    maxPrice: undefined,
    hasPackaging: false,
    hasAccessories: false,
    hasInvoice: false,
  });

  // Modal de consultation détaillée de l'objet
  const [inspectedItem, setInspectedItem] = useState<InventoryItem | null>(null);

  // Cache d'URLs pour les vignettes
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadThumbnails() {
      const urls: Record<string, string> = {};
      for (const it of items) {
        const targetPhotoId = it.primaryPhotoId || (it.mediaIds && it.mediaIds[0]);
        if (targetPhotoId && !urls[targetPhotoId]) {
          const media = await getMediaById(targetPhotoId);
          if (media && media.blob && isMounted) {
            urls[targetPhotoId] = URL.createObjectURL(media.blob);
          }
        }
      }
      if (isMounted) setMediaUrls(urls);
    }
    loadThumbnails();
    return () => {
      isMounted = false;
    };
  }, [items]);

  // Synchronisation avec les filtres rapides de la Sidebar / Navbar
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: selectedCategory,
      residence: selectedResidence,
    }));
  }, [selectedCategory, selectedResidence]);

  // Nombre de filtres actifs pour le badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.condition !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.warranty !== 'all') count++;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.hasPackaging) count++;
    if (filters.hasAccessories) count++;
    if (filters.hasInvoice) count++;
    if (filters.category) count++;
    if (filters.residence) count++;
    return count;
  }, [filters]);

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedResidence(null);
    setSelectedTag(null);
    setFilters({
      search: '',
      category: null,
      residence: null,
      condition: 'all',
      status: 'all',
      warranty: 'all',
      minPrice: undefined,
      maxPrice: undefined,
      hasPackaging: false,
      hasAccessories: false,
      hasInvoice: false,
      tag: null,
    });
  };

  // Filtrage et Tri combinés
  const processedItems = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    // 1. Filtrage
    const filtered = items.filter((item) => {
      // Exclure les archivés de l'inventaire principal
      if (item.status === 'archive') return false;

      // Filtre catégorie
      if (filters.category && item.category !== filters.category) return false;

      // Filtre résidence
      if (filters.residence && item.location?.residence !== filters.residence) return false;

      // Filtre statut
      if (filters.status !== 'all' && item.status !== filters.status) return false;

      // Filtre état
      if (filters.condition !== 'all' && item.condition !== filters.condition) return false;

      // Filtre garantie
      if (filters.warranty === 'active') {
        if (!item.warrantyEndDate || item.warrantyEndDate < today) return false;
      } else if (filters.warranty === 'expired') {
        if (!item.warrantyEndDate || item.warrantyEndDate >= today) return false;
      }

      // Filtre fourchette de prix
      if (filters.minPrice !== undefined && (item.purchasePrice || 0) < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && (item.purchasePrice || 0) > filters.maxPrice) return false;

      // Filtre emballage
      if (filters.hasPackaging) {
        const hasBox = item.relations?.some((r) => r.type === 'packaging');
        if (!hasBox) return false;
      }

      // Filtre accessoires
      if (filters.hasAccessories) {
        const hasAcc = item.relations?.some((r) => r.type === 'accessory');
        if (!hasAcc) return false;
      }

      // Filtre facture
      if (filters.hasInvoice) {
        if (!item.mediaIds || item.mediaIds.length === 0) return false;
      }

      // Filtre transversal par Étiquette / Tag
      if (selectedTag) {
        const hasTag = item.tags?.some(
          (t) => t.trim().toLowerCase() === selectedTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // Recherche globale (Omnibar)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q) || false;
        const matchModel = item.model?.toLowerCase().includes(q) || false;
        const matchSerial = item.serialNumber?.toLowerCase().includes(q) || false;
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchResidence = item.location?.residence.toLowerCase().includes(q) || false;
        const matchRoom = item.location?.room.toLowerCase().includes(q) || false;
        const matchFurniture = item.location?.furniture.toLowerCase().includes(q) || false;
        const matchSubLocation = item.location?.subLocation.toLowerCase().includes(q) || false;
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        const matchNotes = item.notes?.toLowerCase().includes(q) || false;

        if (
          !matchName &&
          !matchBrand &&
          !matchModel &&
          !matchSerial &&
          !matchCategory &&
          !matchResidence &&
          !matchRoom &&
          !matchFurniture &&
          !matchSubLocation &&
          !matchTags &&
          !matchNotes
        ) {
          return false;
        }
      }

      return true;
    });

    // 2. Tri
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-desc':
          return (b.purchasePrice || 0) - (a.purchasePrice || 0);
        case 'price-asc':
          return (a.purchasePrice || 0) - (b.purchasePrice || 0);
        case 'date-desc':
          return (b.purchaseDate || '').localeCompare(a.purchaseDate || '');
        case 'date-asc':
          return (a.purchaseDate || '').localeCompare(b.purchaseDate || '');
        case 'updated-desc':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [items, filters, searchQuery, sortOption]);

  const totalFilteredValue = useMemo(() => {
    return processedItems.reduce((acc, it) => acc + (it.purchasePrice || 0), 0);
  }, [processedItems]);

  const handleQuickExportCsv = () => {
    downloadInventoryCsv(processedItems, {
      delimiter: ';',
      includeArchived: false,
      filename: `inventaire-${new Date().toISOString().slice(0, 10)}.csv`,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header: Title, Controls, and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Tous les objets
            </h1>
            <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-0.5">
              {processedItems.length} objet{processedItems.length > 1 ? 's' : ''} affiché{processedItems.length > 1 ? 's' : ''}
              {totalFilteredValue > 0 && ` • Valeur totale : ${totalFilteredValue.toLocaleString('fr-FR')} €`}
            </p>
          </div>

          <button
            onClick={() => openCreateModal()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] cursor-pointer ml-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>

        {/* Toolbar: Sort dropdown + Filter button + View Mode Segmented Control */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Tri sélecteur style Apple */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none pl-8 pr-8 py-2 text-xs font-medium rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-[#252528] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 shadow-2xs transition cursor-pointer"
            >
              <option value="updated-desc">Récemment modifiés</option>
              <option value="name-asc">Nom (A → Z)</option>
              <option value="name-desc">Nom (Z → A)</option>
              <option value="price-desc">Prix (Décroissant)</option>
              <option value="price-asc">Prix (Croissant)</option>
              <option value="date-desc">Date d'achat (Récents)</option>
              <option value="date-asc">Date d'achat (Anciens)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Bouton Filtres avec badge interactif */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer shadow-2xs ${
              activeFiltersCount > 0
                ? 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#0a84ff] border-[#0071e3]/30 dark:border-[#0071e3]/40'
                : 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] border-black/[0.08] dark:border-white/[0.1] hover:bg-[#f5f5f7] dark:hover:bg-[#252528]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#0071e3] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Bouton Export CSV (Excel & Google Sheets) */}
          <button
            onClick={handleQuickExportCsv}
            disabled={processedItems.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 shadow-2xs transition cursor-pointer disabled:opacity-40"
            title={`Exporter ces ${processedItems.length} objet(s) au format CSV pour Excel ou Google Sheets`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Sélecteur de mode de vue (Grande Grille / Petite Grille / Liste) */}
          <ViewModeSelector
            viewMode={viewMode}
            onChange={handleViewModeChange}
          />
        </div>
      </div>

      {/* Barre de filtres rapides en un clic */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
        <button
          onClick={() => {
            setSelectedTag(null);
            setFilters({
              ...filters,
              status: 'all',
              warranty: 'all',
              hasPackaging: false,
              hasAccessories: false,
            });
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition cursor-pointer ${
            filters.status === 'all' &&
            filters.warranty === 'all' &&
            !filters.hasPackaging &&
            !filters.hasAccessories &&
            !selectedTag
              ? 'bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-[#1d1d1f]'
              : 'bg-white dark:bg-[#1c1c1e] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#252528] dark:hover:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08]'
          }`}
        >
          Tous les objets
        </button>

        <button
          onClick={() => {
            setFilters({
              ...filters,
              status: filters.status === 'en_vente' ? 'all' : 'en_vente',
            });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition cursor-pointer ${
            filters.status === 'en_vente'
              ? 'bg-amber-500 text-white font-semibold shadow-xs'
              : 'bg-white dark:bg-[#1c1c1e] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#252528] dark:hover:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08]'
          }`}
        >
          <span>🏷️ En vente</span>
        </button>

        <button
          onClick={() => {
            setFilters({
              ...filters,
              warranty: filters.warranty === 'active' ? 'all' : 'active',
            });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition cursor-pointer ${
            filters.warranty === 'active'
              ? 'bg-emerald-600 text-white font-semibold shadow-xs'
              : 'bg-white dark:bg-[#1c1c1e] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#252528] dark:hover:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08]'
          }`}
        >
          <span>🛡️ Sous garantie</span>
        </button>

        <button
          onClick={() => {
            setFilters({
              ...filters,
              hasPackaging: !filters.hasPackaging,
            });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition cursor-pointer ${
            filters.hasPackaging
              ? 'bg-indigo-600 text-white font-semibold shadow-xs'
              : 'bg-white dark:bg-[#1c1c1e] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#252528] dark:hover:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08]'
          }`}
        >
          <span>📦 Avec emballages</span>
        </button>

        <button
          onClick={() => {
            setFilters({
              ...filters,
              hasAccessories: !filters.hasAccessories,
            });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition cursor-pointer ${
            filters.hasAccessories
              ? 'bg-[#0071e3] text-white font-semibold shadow-xs'
              : 'bg-white dark:bg-[#1c1c1e] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#252528] dark:hover:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08]'
          }`}
        >
          <span>🔌 Avec accessoires</span>
        </button>
      </div>

      {/* Ruban d'étiquettes transversales (Tags) */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-[#86868b] dark:text-[#8e8e93] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Hash className="w-3 h-3 text-[#0071e3] dark:text-[#0a84ff]" />
            <span>Étiquettes :</span>
          </span>

          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition cursor-pointer ${
              !selectedTag
                ? 'bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-[#1d1d1f] shadow-2xs'
                : 'bg-white dark:bg-[#1c1c1e] hover:bg-[#f5f5f7] dark:hover:bg-[#252528] text-[#555558] dark:text-[#a1a1a6] border border-black/[0.06] dark:border-white/[0.08]'
            }`}
          >
            Toutes
          </button>

          {allTags.map(({ name, count }) => {
            const isSelected = selectedTag === name;
            return (
              <button
                key={name}
                onClick={() => setSelectedTag(isSelected ? null : name)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shrink-0 transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#0071e3] text-white shadow-xs font-semibold'
                    : 'bg-white dark:bg-[#1c1c1e] hover:bg-[#f5f5f7] dark:hover:bg-[#252528] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08]'
                }`}
              >
                <span>#{name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-black/[0.05] dark:bg-white/[0.1] text-[#86868b] dark:text-[#8e8e93]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Barre de pilules des filtres actifs */}
      {(searchQuery || activeFiltersCount > 0 || selectedTag) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {selectedTag && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[#0071e3] text-white shadow-2xs font-semibold">
              <Hash className="w-3 h-3" />
              <span>Étiquette : #{selectedTag}</span>
              <button
                onClick={() => setSelectedTag(null)}
                className="hover:opacity-75 cursor-pointer ml-0.5"
                title="Supprimer le filtre d'étiquette"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-2xs">
              <span>Recherche : « {searchQuery} »</span>
              <button
                onClick={() => setSearchQuery('')}
                className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.category && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#0a84ff] border border-[#0071e3]/20 dark:border-[#0071e3]/30">
              <span>Catégorie : {filters.category}</span>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setFilters({ ...filters, category: null });
                }}
                className="hover:opacity-70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.residence && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.1]">
              <span>📍 {filters.residence}</span>
              <button
                onClick={() => {
                  setSelectedResidence(null);
                  setFilters({ ...filters, residence: null });
                }}
                className="hover:opacity-70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
              <span>Statut : {filters.status === 'en_vente' ? 'En vente' : filters.status}</span>
              <button
                onClick={() => setFilters({ ...filters, status: 'all' })}
                className="hover:opacity-70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.condition !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.1]">
              <span>État : {filters.condition.replace(/_/g, ' ')}</span>
              <button
                onClick={() => setFilters({ ...filters, condition: 'all' })}
                className="hover:opacity-70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.warranty !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              <span>Garantie : {filters.warranty === 'active' ? 'Active' : 'Expirée'}</span>
              <button
                onClick={() => setFilters({ ...filters, warranty: 'all' })}
                className="hover:opacity-70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.1]">
              <span>
                Prix : {filters.minPrice ?? 0} € - {filters.maxPrice ?? '∞'} €
              </span>
              <button
                onClick={() => setFilters({ ...filters, minPrice: undefined, maxPrice: undefined })}
                className="hover:opacity-70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.hasPackaging && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
              <span>📦 Emballage inclus</span>
              <button
                onClick={() => setFilters({ ...filters, hasPackaging: false })}
                className="hover:opacity-70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.hasAccessories && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
              <span>🔌 Accessoires inclus</span>
              <button
                onClick={() => setFilters({ ...filters, hasAccessories: false })}
                className="hover:opacity-70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.hasInvoice && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
              <span>📄 Facture rattachée</span>
              <button
                onClick={() => setFilters({ ...filters, hasInvoice: false })}
                className="hover:opacity-70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleResetAllFilters}
            className="text-xs text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] px-2 py-1 rounded hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Tout effacer</span>
          </button>
        </div>
      )}

      {/* Rendu des Vues : Grande Grille / Petite Grille / Liste */}
      {processedItems.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
          <Package className="w-10 h-10 text-[#86868b] dark:text-[#8e8e93] mx-auto mb-3 opacity-40" />
          <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {items.length === 0 ? 'Aucun objet dans votre inventaire' : 'Aucun objet ne correspond à vos filtres'}
          </h2>
          <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-1 max-w-sm mx-auto leading-relaxed">
            {items.length === 0
              ? 'Commencez par charger le jeu de données d\'exemple pour explorer votre inventaire personnel.'
              : 'Modifiez votre recherche ou réinitialisez les filtres pour afficher l\'ensemble des objets.'}
          </p>

          {items.length === 0 ? (
            <button
              onClick={() => seedDemoData()}
              disabled={loading}
              className="mt-5 px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium shadow-sm transition active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Charger les exemples de démo</span>
            </button>
          ) : (
            <button
              onClick={handleResetAllFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#ebebee] dark:hover:bg-[#353538] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-medium border border-black/[0.06] dark:border-white/[0.08] transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser les filtres</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'large-grid' && (
            <LargeGridView
              items={processedItems}
              mediaUrls={mediaUrls}
              onItemClick={(item) => setInspectedItem(item)}
            />
          )}

          {viewMode === 'compact-grid' && (
            <CompactGridView
              items={processedItems}
              mediaUrls={mediaUrls}
              onItemClick={(item) => setInspectedItem(item)}
            />
          )}

          {viewMode === 'list' && (
            <ListView
              items={processedItems}
              mediaUrls={mediaUrls}
              onItemClick={(item) => setInspectedItem(item)}
              sortOption={sortOption}
              onSortChange={setSortOption}
            />
          )}
        </>
      )}

      {/* Modal / Tiroir des filtres avancés */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={handleResetAllFilters}
        categories={settings?.categories || []}
        residences={settings?.residences || []}
        totalMatches={processedItems.length}
      />

      {/* Modal d'inspection détaillée de la fiche objet */}
      <ItemQuickViewModal
        item={inspectedItem}
        onClose={() => setInspectedItem(null)}
      />

    </div>
  );
};
