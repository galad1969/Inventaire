import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { InventoryItem, AppSettings, ItemStatus } from '../types/inventory';
import {
  getAllItems,
  getSettings,
  saveSettings as saveSettingsToDb,
  getDatabaseStats,
  deleteItem,
  archiveItem,
  clearEntireDatabase,
} from '../services/db';
import { seedSampleData } from '../services/sampleData';
import { ConfirmDialogOptions } from '../components/common/ConfirmModal';

// Fonctions d'accès sécurisé à localStorage (évite les plantages en iframe ou navigation privée stricte)
function safeGetStorage(key: string): string | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore les erreurs de quota ou de permission en iframe sécurisée
  }
}

function safeRemoveStorage(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {}
}

interface InventoryContextType {
  items: InventoryItem[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedResidence: string | null;
  setSelectedResidence: (residence: string | null) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  allTags: Array<{ name: string; count: number }>;
  selectedStatus: ItemStatus | 'all';
  setSelectedStatus: (status: ItemStatus | 'all') => void;
  settings: AppSettings | null;
  refreshInventory: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  stats: {
    totalItems: number;
    activeItems: number;
    forSaleItems: number;
    archivedItems: number;
    totalValue: number;
    forSaleValue: number;
    warrantyActiveCount: number;
  };
  seedDemoData: () => Promise<void>;
  clearDatabase: () => Promise<void>;
  
  // Modal de création / édition
  isFormModalOpen: boolean;
  itemToEdit: InventoryItem | null;
  openCreateModal: () => void;
  openEditModal: (item: InventoryItem) => void;
  closeFormModal: () => void;
  deleteItemById: (id: string) => Promise<void>;
  archiveItemById: (id: string) => Promise<void>;

  // Modal de confirmation sécurisée (évite window.confirm bloqué en iframe)
  confirmOptions: ConfirmDialogOptions | null;
  requestConfirmation: (options: ConfirmDialogOptions) => void;
  closeConfirmation: () => void;

  // Modal de rapport officiel d'assurance habitation
  isInsuranceModalOpen: boolean;
  openInsuranceModal: () => void;
  closeInsuranceModal: () => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Navigation & Search filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedResidence, setSelectedResidence] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | 'all'>('all');

  // Modal de formulaire Ajout/Édition
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

  // Modal de confirmation
  const [confirmOptions, setConfirmOptions] = useState<ConfirmDialogOptions | null>(null);

  // Modal de rapport d'assurance
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState<boolean>(false);

  const openInsuranceModal = () => setIsInsuranceModalOpen(true);
  const closeInsuranceModal = () => setIsInsuranceModalOpen(false);

  const requestConfirmation = (options: ConfirmDialogOptions) => {
    setConfirmOptions(options);
  };

  const closeConfirmation = () => {
    setConfirmOptions(null);
  };

  const openCreateModal = () => {
    setItemToEdit(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setItemToEdit(item);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setItemToEdit(null);
  };

  // Liste globale dédoublée de tous les tags existants avec leur fréquence
  const allTags = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of items) {
      if (item.status === 'archive') continue;
      if (item.tags && Array.isArray(item.tags)) {
        for (const t of item.tags) {
          const clean = t.trim().toLowerCase();
          if (clean) {
            map[clean] = (map[clean] || 0) + 1;
          }
        }
      }
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [items]);

  const refreshInventory = async () => {
    try {
      setLoading(true);
      let [fetchedItems, fetchedSettings] = await Promise.all([
        getAllItems(),
        getSettings(),
      ]);

      // Uniquement au tout premier chargement vierge initial de l'application (jamais si la base a été vidée)
      const hasVisited = safeGetStorage('inventaire_app_visited');
      const isExplicitlyCleared = safeGetStorage('inventaire_db_cleared') === 'true';
      if (!hasVisited && !isExplicitlyCleared && fetchedItems.length === 0) {
        safeSetStorage('inventaire_app_visited', 'true');
        await seedSampleData();
        fetchedItems = await getAllItems();
      }

      setItems(fetchedItems);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearDatabase = async () => {
    try {
      // Marquer explicitement que la base a été vidée pour empêcher tout auto-seeding
      safeSetStorage('inventaire_app_visited', 'true');
      safeSetStorage('inventaire_db_cleared', 'true');
      
      // Réinitialisation immédiate du state React
      setItems([]);
      setSelectedCategory(null);
      setSelectedResidence(null);
      setSelectedTag(null);
      setSearchQuery('');

      await clearEntireDatabase();
      const freshSettings = await getSettings();
      setSettings(freshSettings);
    } catch (err) {
      console.error('Erreur lors de la réinitialisation de la base:', err);
      throw err;
    } finally {
      setItems([]);
    }
  };

  const deleteItemById = async (id: string) => {
    try {
      // Suppression optimiste instantanée dans l'interface
      setItems((prev) => prev.filter((item) => item.id !== id));
      await deleteItem(id);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'objet:', err);
    } finally {
      // Re-synchronisation finale avec IndexedDB
      await refreshInventory();
    }
  };

  const archiveItemById = async (id: string) => {
    await archiveItem(id);
    await refreshInventory();
  };

  useEffect(() => {
    refreshInventory();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = await saveSettingsToDb(newSettings);
    setSettings(updated);
  };

  const seedDemoData = async () => {
    safeRemoveStorage('inventaire_db_cleared');
    safeSetStorage('inventaire_app_visited', 'true');
    await seedSampleData();
    await refreshInventory();
  };

  // Calcul dynamique des statistiques globales
  const stats = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    
    let activeItems = 0;
    let forSaleItems = 0;
    let archivedItems = 0;
    let totalValue = 0;
    let forSaleValue = 0;
    let warrantyActiveCount = 0;

    for (const item of items) {
      if (item.status === 'archive') {
        archivedItems++;
      } else {
        activeItems++;
        if (item.purchasePrice) {
          totalValue += item.purchasePrice;
        }
      }

      if (item.status === 'en_vente') {
        forSaleItems++;
        if (item.salePrice) {
          forSaleValue += item.salePrice;
        }
      }

      if (item.warrantyEndDate && item.warrantyEndDate >= now) {
        warrantyActiveCount++;
      }
    }

    return {
      totalItems: items.length,
      activeItems,
      forSaleItems,
      archivedItems,
      totalValue,
      forSaleValue,
      warrantyActiveCount,
    };
  }, [items]);

  return (
    <InventoryContext.Provider
      value={{
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
        selectedStatus,
        setSelectedStatus,
        settings,
        refreshInventory,
        updateSettings,
        stats,
        seedDemoData,
        clearDatabase,
        isFormModalOpen,
        itemToEdit,
        openCreateModal,
        openEditModal,
        closeFormModal,
        deleteItemById,
        archiveItemById,
        confirmOptions,
        requestConfirmation,
        closeConfirmation,
        isInsuranceModalOpen,
        openInsuranceModal,
        closeInsuranceModal,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export function useInventory(): InventoryContextType {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory doit être utilisé à l\'intérieur d\'un InventoryProvider');
  }
  return context;
}
