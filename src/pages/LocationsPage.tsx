import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ChevronRight,
  ChevronDown,
  Box,
  Home,
  Folder,
  Search,
  Plus,
  Package,
  Layers,
  Euro,
  Edit3,
  Trash2,
  Eye,
  ArrowRightLeft,
  X,
  Check,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem, StorageLocation } from '../types/inventory';
import { saveItem, getMediaById } from '../services/db';
import { ItemQuickViewModal } from '../components/inventory/ItemQuickViewModal';

export const LocationsPage: React.FC = () => {
  const {
    items,
    refreshInventory,
    openCreateModal,
    openEditModal,
    deleteItemById,
    requestConfirmation,
  } = useInventory();

  // Recherche dans les emplacements
  const [searchLocation, setSearchLocation] = useState('');
  
  // Onglet : Arborescence générale ou Emballages/Accessoires déportés
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'separated_packaging'>('hierarchy');

  // Gestion des accordéons dépliés (Set de clés)
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  // Objet sélectionné pour consultation rapide
  const [inspectedItem, setInspectedItem] = useState<InventoryItem | null>(null);

  // Modal de déplacement rapide
  const [itemToMove, setItemToMove] = useState<InventoryItem | null>(null);
  const [targetResidence, setTargetResidence] = useState('');
  const [targetRoom, setTargetRoom] = useState('');
  const [targetFurniture, setTargetFurniture] = useState('');
  const [targetSubLocation, setTargetSubLocation] = useState('');

  // Cache des vignettes
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  React.useEffect(() => {
    let isMounted = true;
    async function loadThumbs() {
      const urls: Record<string, string> = {};
      for (const it of items) {
        const targetPhotoId = it.primaryPhotoId || (it.mediaIds && it.mediaIds[0]);
        if (targetPhotoId && !urls[targetPhotoId]) {
          const m = await getMediaById(targetPhotoId);
          if (m && m.blob && isMounted) {
            urls[targetPhotoId] = URL.createObjectURL(m.blob);
          }
        }
      }
      if (isMounted) setThumbnails(urls);
    }
    loadThumbs();
    return () => {
      isMounted = false;
    };
  }, [items]);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filtrage des objets selon la recherche
  const filteredItems = useMemo(() => {
    if (!searchLocation.trim()) return items;
    const q = searchLocation.toLowerCase().trim();
    return items.filter((it) => {
      const loc = it.location;
      return (
        it.name.toLowerCase().includes(q) ||
        (it.brand && it.brand.toLowerCase().includes(q)) ||
        (loc?.residence && loc.residence.toLowerCase().includes(q)) ||
        (loc?.room && loc.room.toLowerCase().includes(q)) ||
        (loc?.furniture && loc.furniture.toLowerCase().includes(q)) ||
        (loc?.subLocation && loc.subLocation.toLowerCase().includes(q))
      );
    });
  }, [items, searchLocation]);

  // Construction de l'arbre hiérarchique : Résidence -> Pièce -> Meuble -> SubLocation -> Objets
  const hierarchyTree = useMemo(() => {
    const root: Record<
      string,
      Record<string, Record<string, Record<string, InventoryItem[]>>>
    > = {};

    filteredItems.forEach((item) => {
      if (item.status === 'archive') return;
      const res = item.location?.residence?.trim() || 'Résidence Principale';
      const room = item.location?.room?.trim() || 'Pièce non spécifiée';
      const furniture = item.location?.furniture?.trim() || 'Emplacement libre';
      const sub = item.location?.subLocation?.trim() || 'Standard';

      if (!root[res]) root[res] = {};
      if (!root[res][room]) root[res][room] = {};
      if (!root[res][room][furniture]) root[res][room][furniture] = {};
      if (!root[res][room][furniture][sub]) root[res][room][furniture][sub] = [];

      root[res][room][furniture][sub].push(item);
    });

    return root;
  }, [filteredItems]);

  // Liste des relations d'emballages / accessoires stockés à un endroit spécifique
  const separatedPackagings = useMemo(() => {
    const list: Array<{
      parentItem: InventoryItem;
      relationLabel: string;
      relationType: string;
      customLocation: StorageLocation;
    }> = [];

    items.forEach((it) => {
      if (it.relations && it.relations.length > 0) {
        it.relations.forEach((rel) => {
          if (rel.customLocation && rel.customLocation.residence) {
            list.push({
              parentItem: it,
              relationLabel: rel.label,
              relationType: rel.type,
              customLocation: rel.customLocation,
            });
          }
        });
      }
    });

    return list;
  }, [items]);

  const residences = Object.keys(hierarchyTree);

  // Par défaut, déplier la première résidence au chargement si rien n'est sélectionné
  React.useEffect(() => {
    if (residences.length > 0 && Object.keys(expandedKeys).length === 0) {
      setExpandedKeys({ [residences[0]]: true });
    }
  }, [residences]);

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    residences.forEach((res) => {
      next[res] = true;
      Object.keys(hierarchyTree[res] || {}).forEach((room) => {
        next[`${res}-${room}`] = true;
        Object.keys(hierarchyTree[res][room] || {}).forEach((furn) => {
          next[`${res}-${room}-${furn}`] = true;
        });
      });
    });
    setExpandedKeys(next);
  };

  const handleCollapseAll = () => {
    setExpandedKeys({});
  };

  const startMoveItem = (item: InventoryItem) => {
    setItemToMove(item);
    setTargetResidence(item.location.residence || '');
    setTargetRoom(item.location.room || '');
    setTargetFurniture(item.location.furniture || '');
    setTargetSubLocation(item.location.subLocation || '');
  };

  const handleConfirmMove = async () => {
    if (!itemToMove) return;
    const updated: InventoryItem = {
      ...itemToMove,
      location: {
        residence: targetResidence.trim() || 'Résidence Principale',
        room: targetRoom.trim() || 'Pièce',
        furniture: targetFurniture.trim() || 'Meuble',
        subLocation: targetSubLocation.trim() || 'Tiroir / Étagère',
      },
    };
    await saveItem(updated);
    await refreshInventory();
    setItemToMove(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#0071e3]" />
            <span>Explorateur des Lieux & Poupées Russes</span>
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Organisation hiérarchique à 4 niveaux : Résidence → Pièce → Meuble → Tiroir / Boîte
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvel objet</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1c1c1e] p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xs">
        <div className="flex items-center gap-1 bg-[#f5f5f7] dark:bg-[#252528] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hierarchy'
                ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-2xs font-semibold'
                : 'text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Arborescence Lieux</span>
          </button>

          <button
            onClick={() => setActiveTab('separated_packaging')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'separated_packaging'
                ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-2xs font-semibold'
                : 'text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Emballages & Boîtes Déportés</span>
            {separatedPackagings.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#0a84ff]">
                {separatedPackagings.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'hierarchy' && (
            <>
              <button
                onClick={handleExpandAll}
                className="px-2.5 py-1 text-[11px] font-medium text-[#555558] dark:text-[#a1a1a6] hover:text-[#0071e3] dark:hover:text-[#0a84ff] transition cursor-pointer"
              >
                Tout déplier
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-2.5 py-1 text-[11px] font-medium text-[#555558] dark:text-[#a1a1a6] hover:text-[#0071e3] dark:hover:text-[#0a84ff] transition cursor-pointer"
              >
                Tout replier
              </button>
            </>
          )}

          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Filtrer un lieu ou meuble..."
              className="pl-8 pr-3 py-1.5 text-xs bg-[#f5f5f7] dark:bg-[#252528] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#636366] rounded-xl border border-black/[0.05] dark:border-white/[0.1] focus:outline-none focus:border-[#0071e3]/40 w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Vue Onglet 1 : Arborescence Poupées Russes */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
          {residences.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
              <Home className="w-10 h-10 text-[#86868b] dark:text-[#8e8e93] mx-auto mb-3 opacity-40" />
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Aucun lieu enregistré</h2>
              <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-1 max-w-sm mx-auto">
                Ajoutez des objets en renseignant leur résidence, pièce et meuble pour explorer l'arborescence.
              </p>
            </div>
          ) : (
            residences.map((res) => {
              const rooms = Object.keys(hierarchyTree[res]);
              const isResOpen = expandedKeys[res] ?? true;

              // Calcul total objets et valeur dans la résidence
              let totalItemsInRes = 0;
              let totalValueInRes = 0;
              rooms.forEach((r) => {
                Object.values(hierarchyTree[res][r]).forEach((subs) => {
                  Object.values(subs).forEach((itemList) => {
                    totalItemsInRes += itemList.length;
                    itemList.forEach((it) => {
                      if (it.purchasePrice) totalValueInRes += it.purchasePrice;
                    });
                  });
                });
              });

              return (
                <div
                  key={res}
                  className="rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden transition-all"
                >
                  {/* Niveau 1 : Résidence */}
                  <div
                    onClick={() => toggleExpand(res)}
                    className="p-4 sm:p-5 bg-[#fbfbfd] dark:bg-[#18181a] hover:bg-[#f5f5f7]/60 dark:hover:bg-[#202024] border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between cursor-pointer transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center font-bold shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-[#f5f5f7]">{res}</h2>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#555558] dark:text-[#a1a1a6]">
                            Niveau 1
                          </span>
                        </div>
                        <span className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-0.5 block">
                          {rooms.length} pièce{rooms.length > 1 ? 's' : ''} • {totalItemsInRes} objet{totalItemsInRes > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hidden sm:block">
                        Valeur estimée : {totalValueInRes.toLocaleString('fr-FR')} €
                      </span>
                      <div className="w-7 h-7 rounded-full bg-black/[0.03] dark:bg-white/[0.06] flex items-center justify-center text-[#86868b] dark:text-[#8e8e93]">
                        {isResOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Niveau 2 : Pièces */}
                  {isResOpen && (
                    <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-[#1c1c1e]">
                      {rooms.map((room) => {
                        const furnitures = Object.keys(hierarchyTree[res][room]);
                        const roomKey = `${res}-${room}`;
                        const isRoomOpen = expandedKeys[roomKey] ?? true;

                        let roomItemCount = 0;
                        let roomValue = 0;
                        furnitures.forEach((f) => {
                          Object.values(hierarchyTree[res][room][f]).forEach((itemList) => {
                            roomItemCount += itemList.length;
                            itemList.forEach((it) => {
                              if (it.purchasePrice) roomValue += it.purchasePrice;
                            });
                          });
                        });

                        return (
                          <div
                            key={room}
                            className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden bg-[#fbfbfd] dark:bg-[#18181a]"
                          >
                            {/* Entête Pièce */}
                            <div
                              onClick={() => toggleExpand(roomKey)}
                              className="p-3.5 sm:p-4 bg-[#f8f8fa] dark:bg-[#202024] hover:bg-[#f1f1f4] dark:hover:bg-[#28282c] flex items-center justify-between cursor-pointer transition select-none border-b border-black/[0.04] dark:border-white/[0.06]"
                            >
                              <div className="flex items-center gap-2.5">
                                <Folder className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
                                <span className="font-semibold text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                                  Pièce : {room}
                                </span>
                                <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93]">
                                  ({furnitures.length} meuble{furnitures.length > 1 ? 's' : ''} • {roomItemCount} objet{roomItemCount > 1 ? 's' : ''})
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-[#86868b] dark:text-[#8e8e93]">
                                  {roomValue.toLocaleString('fr-FR')} €
                                </span>
                                {isRoomOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />}
                              </div>
                            </div>

                            {/* Niveau 3 : Meubles */}
                            {isRoomOpen && (
                              <div className="p-3.5 sm:p-4 space-y-3.5 bg-white dark:bg-[#1c1c1e]">
                                {furnitures.map((furniture) => {
                                  const subLocations = Object.keys(hierarchyTree[res][room][furniture]);
                                  const furnKey = `${res}-${room}-${furniture}`;
                                  const isFurnOpen = expandedKeys[furnKey] ?? true;

                                  let furnItemCount = 0;
                                  subLocations.forEach((s) => {
                                    furnItemCount += hierarchyTree[res][room][furniture][s].length;
                                  });

                                  return (
                                    <div
                                      key={furniture}
                                      className="rounded-xl border border-black/[0.05] dark:border-white/[0.06] overflow-hidden bg-white dark:bg-[#18181a]"
                                    >
                                      {/* Entête Meuble */}
                                      <div
                                        onClick={() => toggleExpand(furnKey)}
                                        className="px-3.5 py-2.5 bg-slate-50/70 dark:bg-[#202024] hover:bg-slate-100/70 dark:hover:bg-[#28282c] flex items-center justify-between cursor-pointer transition select-none border-b border-black/[0.04] dark:border-white/[0.06]"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Box className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                          <span className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                                            Meuble : {furniture}
                                          </span>
                                          <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93]">
                                            ({subLocations.length} sous-emplacement{subLocations.length > 1 ? 's' : ''} • {furnItemCount} objet{furnItemCount > 1 ? 's' : ''})
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                          {isFurnOpen ? <ChevronDown className="w-3 h-3 text-[#86868b] dark:text-[#8e8e93]" /> : <ChevronRight className="w-3 h-3 text-[#86868b] dark:text-[#8e8e93]" />}
                                        </div>
                                      </div>

                                      {/* Niveau 4 : Sous-emplacements & Liste d'objets */}
                                      {isFurnOpen && (
                                        <div className="p-3 space-y-3 divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                                          {subLocations.map((sub) => {
                                            const subItems = hierarchyTree[res][room][furniture][sub];

                                            return (
                                              <div key={sub} className="pt-2.5 first:pt-0">
                                                <div className="flex items-center justify-between mb-2">
                                                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#0071e3] dark:text-[#0a84ff]">
                                                    <span className="text-[#86868b] dark:text-[#8e8e93]">↳</span>
                                                    <span>{sub}</span>
                                                    <span className="text-[10px] font-sans text-[#86868b] dark:text-[#8e8e93]">
                                                      ({subItems.length} objet{subItems.length > 1 ? 's' : ''})
                                                    </span>
                                                  </div>
                                                </div>

                                                {/* Mini grille des objets stockés dans ce sous-emplacement */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                  {subItems.map((item) => {
                                                    const photoId = item.primaryPhotoId || (item.mediaIds && item.mediaIds[0]);
                                                    const photoUrl = photoId ? thumbnails[photoId] : null;

                                                    return (
                                                      <div
                                                        key={item.id}
                                                        onClick={() => setInspectedItem(item)}
                                                        className="group p-2.5 rounded-xl bg-[#fbfbfd] dark:bg-[#252528] hover:bg-white dark:hover:bg-[#2c2c30] border border-black/[0.04] dark:border-white/[0.06] hover:border-[#0071e3]/30 dark:hover:border-[#0a84ff]/40 shadow-2xs transition flex items-center justify-between gap-2.5 cursor-pointer"
                                                      >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                          <div className="w-9 h-9 rounded-lg bg-[#f5f5f7] dark:bg-[#18181a] border border-black/[0.04] dark:border-white/[0.06] overflow-hidden shrink-0 flex items-center justify-center">
                                                            {photoUrl ? (
                                                              <img
                                                                src={photoUrl}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                              />
                                                            ) : (
                                                              <Package className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93] opacity-40" />
                                                            )}
                                                          </div>
                                                          <div className="min-w-0">
                                                            <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate group-hover:text-[#0071e3] dark:group-hover:text-[#0a84ff] transition">
                                                              {item.name}
                                                            </div>
                                                            <div className="text-[10px] text-[#86868b] dark:text-[#8e8e93] truncate">
                                                              {item.brand || item.category} • {item.purchasePrice ? `${item.purchasePrice} €` : 'N/C'}
                                                            </div>
                                                          </div>
                                                        </div>

                                                        {/* Actions rapides */}
                                                        <div
                                                          className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100"
                                                          onClick={(e) => e.stopPropagation()}
                                                        >
                                                          <button
                                                            onClick={() => startMoveItem(item)}
                                                            className="p-1 rounded text-[#86868b] dark:text-[#8e8e93] hover:text-[#0071e3] dark:hover:text-[#0a84ff] hover:bg-[#0071e3]/10 dark:hover:bg-[#0071e3]/20 transition cursor-pointer"
                                                            title="Déplacer vers un autre meuble/pièce"
                                                          >
                                                            <ArrowRightLeft className="w-3.5 h-3.5" />
                                                          </button>
                                                          <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-1 rounded text-[#86868b] dark:text-[#8e8e93] hover:text-[#0071e3] dark:hover:text-[#0a84ff] hover:bg-[#0071e3]/10 dark:hover:bg-[#0071e3]/20 transition cursor-pointer"
                                                            title="Modifier"
                                                          >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                          </button>
                                                          <button
                                                            onClick={() => {
                                                              requestConfirmation({
                                                                title: 'Supprimer cet objet ?',
                                                                message: `Êtes-vous certain de vouloir supprimer définitivement « ${item.name} » ?`,
                                                                confirmLabel: 'Supprimer',
                                                                cancelLabel: 'Annuler',
                                                                isDestructive: true,
                                                                icon: 'trash',
                                                                onConfirm: async () => {
                                                                  await deleteItemById(item.id);
                                                                },
                                                              });
                                                            }}
                                                            className="p-1 rounded text-[#86868b] dark:text-[#8e8e93] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                            title="Supprimer définitivement"
                                                          >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                          </button>
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Vue Onglet 2 : Emballages & Boîtes Déportés */}
      {activeTab === 'separated_packaging' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong>Système exclusif « Emballages Déportés » :</strong> Vous conservez les cartons d'origine au grenier ou au garage pour la revente, mais l'appareil est dans votre salon ? Cette vue recense toutes les boîtes, cales et accessoires rangés dans un lieu distinct de leur objet principal.
          </div>

          {separatedPackagings.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
              <Layers className="w-10 h-10 text-amber-500/40 dark:text-amber-400/40 mx-auto mb-3" />
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Aucun emballage ou accessoire déporté</h2>
              <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-1 max-w-sm mx-auto">
                Lors de la saisie d'un objet (onglet « Liaisons »), cochez « Localiser cet élément ailleurs » pour mémoriser l'endroit où dort son carton d'origine.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {separatedPackagings.map((pkg, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 capitalize">
                        {pkg.relationType === 'packaging' ? 'Emballage / Boîte' : 'Accessoire'}
                      </span>
                      <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mt-1">{pkg.relationLabel}</h3>
                      <p className="text-xs text-[#86868b] dark:text-[#8e8e93]">
                        Lié à : <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">{pkg.parentItem.name}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#fbfbfd] dark:bg-[#252528] border border-black/[0.04] dark:border-white/[0.06] text-xs space-y-1">
                    <div className="text-[10px] uppercase font-semibold text-[#86868b] dark:text-[#8e8e93] tracking-wider">
                      Où trouver cette boîte / pièce :
                    </div>
                    <div className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
                      <span>{pkg.customLocation.residence}</span>
                    </div>
                    <div className="text-[#555558] dark:text-[#a1a1a6] pl-4 text-[11px]">
                      {pkg.customLocation.room} ➔ {pkg.customLocation.furniture} ➔ {pkg.customLocation.subLocation}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setInspectedItem(pkg.parentItem)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#0071e3] dark:text-[#0a84ff] hover:bg-[#0071e3]/10 dark:hover:bg-[#0071e3]/20 transition cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Voir la fiche de l'objet</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Déplacement Rapide */}
      {itemToMove && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setItemToMove(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <ArrowRightLeft className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
                  <span>Déplacer « {itemToMove.name} »</span>
                </div>
                <button
                  onClick={() => setItemToMove(null)}
                  className="p-1 rounded-full text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Résidence</label>
                  <input
                    type="text"
                    value={targetResidence}
                    onChange={(e) => setTargetResidence(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.06] dark:border-white/[0.1] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Pièce</label>
                  <input
                    type="text"
                    value={targetRoom}
                    onChange={(e) => setTargetRoom(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.06] dark:border-white/[0.1] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Meuble</label>
                  <input
                    type="text"
                    value={targetFurniture}
                    onChange={(e) => setTargetFurniture(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.06] dark:border-white/[0.1] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Tiroir / Casier</label>
                  <input
                    type="text"
                    value={targetSubLocation}
                    onChange={(e) => setTargetSubLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.06] dark:border-white/[0.1] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-end gap-2">
                <button
                  onClick={() => setItemToMove(null)}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-[#f5f5f7] dark:bg-[#252528] hover:bg-[#ebebee] dark:hover:bg-[#2c2c30] text-[#555558] dark:text-[#a1a1a6] cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmMove}
                  className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Enregistrer le déplacement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Consultation Rapide */}
      {inspectedItem && (
        <ItemQuickViewModal
          item={inspectedItem}
          onClose={() => setInspectedItem(null)}
        />
      )}
    </div>
  );
};
