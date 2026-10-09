import React, { useState, useEffect } from 'react';
import {
  Tag,
  Package,
  DollarSign,
  ExternalLink,
  Share2,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Edit3,
  Eye,
  TrendingUp,
  Percent,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem } from '../types/inventory';
import { saveItem, getMediaById } from '../services/db';
import { ListingGeneratorModal } from '../components/inventory/ListingGeneratorModal';
import { ItemQuickViewModal } from '../components/inventory/ItemQuickViewModal';

export const ForSalePage: React.FC = () => {
  const {
    items,
    refreshInventory,
    openEditModal,
    openCreateModal,
    deleteItemById,
    requestConfirmation,
  } = useInventory();

  // Filtrage : Actuellement en vente ou Déjà vendus
  const [activeTab, setActiveTab] = useState<'for_sale' | 'sold'>('for_sale');

  // Objet sélectionné pour le générateur d'annonces
  const [listingItem, setListingItem] = useState<InventoryItem | null>(null);

  // Objet sélectionné pour consultation rapide
  const [inspectedItem, setInspectedItem] = useState<InventoryItem | null>(null);

  // Vignettes
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
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

  const forSaleItems = items.filter((it) => it.status === 'en_vente');
  const soldItems = items.filter((it) => it.status === 'vendu');

  const currentList = activeTab === 'for_sale' ? forSaleItems : soldItems;

  // Calculs financiers
  const totalSaleExpected = forSaleItems.reduce((acc, it) => acc + (it.salePrice || 0), 0);
  const totalOriginalCost = forSaleItems.reduce((acc, it) => acc + (it.purchasePrice || 0), 0);
  const totalRealizedSold = soldItems.reduce((acc, it) => acc + (it.salePrice || it.purchasePrice || 0), 0);

  // Marquer comme vendu avec confirmation
  const handleMarkAsSold = (item: InventoryItem) => {
    requestConfirmation({
      title: 'Marquer cet objet comme vendu ?',
      message: `Félicitations pour la vente de « ${item.name} » ! Souhaitez-vous transférer cet objet dans l'historique des ventes ?`,
      confirmLabel: 'Confirmer la vente',
      cancelLabel: 'Annuler',
      isDestructive: false,
      icon: 'archive',
      onConfirm: async () => {
        await saveItem({
          ...item,
          status: 'vendu',
        });
        await refreshInventory();
      },
    });
  };

  // Remettre en vente un objet vendu
  const handleRelist = async (item: InventoryItem) => {
    await saveItem({
      ...item,
      status: 'en_vente',
    });
    await refreshInventory();
  };

  // Retirer de la vente et repasser en actif
  const handleRemoveFromSale = (item: InventoryItem) => {
    requestConfirmation({
      title: 'Retirer cet objet de la vente ?',
      message: `« ${item.name} » sera réintégré à votre inventaire actif sans être proposé à la vente.`,
      confirmLabel: 'Retirer de la vente',
      cancelLabel: 'Annuler',
      isDestructive: false,
      onConfirm: async () => {
        await saveItem({
          ...item,
          status: 'actif',
        });
        await refreshInventory();
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" />
            <span>Gestion des Ventes & Annonces</span>
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Valorisation des biens à céder et générateur instantané d'annonces (Le Bon Coin, Vinted, eBay)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Mettre un objet en vente</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-amber-500/20 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              En vente actuellement
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f] mt-2">
            {forSaleItems.length} <span className="text-sm font-normal text-[#86868b]">objet{forSaleItems.length > 1 ? 's' : ''}</span>
          </div>
          <div className="text-xs text-amber-600 font-semibold mt-1">
            Revenu espéré : {totalSaleExpected.toLocaleString('fr-FR')} €
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-black/[0.06] p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              Investissement initial
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#0071e3] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f] mt-2">
            {totalOriginalCost.toLocaleString('fr-FR')} €
          </div>
          <div className="text-xs text-[#86868b] mt-1">
            Prix d'achat cumulé des biens en vente
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-emerald-500/20 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              Ventes Réalisées
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f] mt-2">
            {soldItems.length} <span className="text-sm font-normal text-[#86868b]">vendu{soldItems.length > 1 ? 's' : ''}</span>
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            Volume encaissé : {totalRealizedSold.toLocaleString('fr-FR')} €
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('for_sale')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'for_sale'
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-[#555558] hover:bg-black/[0.04]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>En vente ({forSaleItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sold')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sold'
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-[#555558] hover:bg-black/[0.04]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Historique des ventes ({soldItems.length})</span>
          </button>
        </div>
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
          <Tag className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-60" />
          <h2 className="text-base font-semibold text-[#1d1d1f]">
            {activeTab === 'for_sale' ? 'Aucun objet actuellement en vente' : 'Aucun objet marqué comme vendu'}
          </h2>
          <p className="text-xs text-[#86868b] mt-1 max-w-sm mx-auto">
            {activeTab === 'for_sale'
              ? 'Passez le statut d\'un objet à « En vente » dans sa fiche pour fixer son prix et générer son annonce automatique.'
              : 'Lorsque vous concluez une vente, marquez l\'objet comme vendu pour archiver l\'historique.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentList.map((item) => {
            const photoId = item.primaryPhotoId || (item.mediaIds && item.mediaIds[0]);
            const photoUrl = photoId ? thumbnails[photoId] : null;

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white border border-black/[0.06] hover:border-amber-500/30 p-5 shadow-2xs hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    {/* Miniature */}
                    <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] overflow-hidden shrink-0 flex items-center justify-center relative">
                      {photoUrl ? (
                        <img src={photoUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-[#86868b] opacity-35" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700">
                          {item.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] text-[#555558] capitalize">
                          {item.condition.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[#1d1d1f] mt-1 truncate">{item.name}</h3>
                      <p className="text-xs text-[#86868b] truncate">
                        {item.brand ? `${item.brand} ` : ''}
                        {item.model ? `• ${item.model}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Prix & Valorisation */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-[#fbfbfd] border border-black/[0.04] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#86868b] block">Prix demandé</span>
                      <span className="text-base font-extrabold text-amber-600">
                        {item.salePrice ? `${item.salePrice.toLocaleString('fr-FR')} €` : 'N/C'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#86868b] block">Acheté</span>
                      <span className="text-xs font-semibold text-[#86868b] line-through">
                        {item.purchasePrice ? `${item.purchasePrice.toLocaleString('fr-FR')} €` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Notes de vente */}
                  {item.saleNotes && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-black/[0.03] text-[11px] text-[#555558] italic line-clamp-2">
                      « {item.saleNotes} »
                    </div>
                  )}

                  {/* Emplacement de stockage */}
                  <div className="mt-2 text-[10px] text-[#86868b] flex items-center justify-between">
                    <span>📍 {item.location.residence} ({item.location.room})</span>
                    {item.relations && item.relations.length > 0 && (
                      <span className="text-[#0071e3] font-medium">
                        {item.relations.length} boîte/accessoire inclus
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Pro */}
                <div className="pt-3 border-t border-black/[0.05] space-y-2">
                  {/* Bouton Générateur d'Annonce en 1 clic */}
                  {item.status === 'en_vente' && (
                    <button
                      onClick={() => setListingItem(item)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-2xs transition active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Générer l'annonce (Le Bon Coin / Vinted)</span>
                    </button>
                  )}

                  <div className="flex items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setInspectedItem(item)}
                        className="p-1.5 rounded-lg text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/10 transition cursor-pointer"
                        title="Consulter"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/10 transition cursor-pointer"
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          requestConfirmation({
                            title: 'Supprimer définitivement cet objet ?',
                            message: `Êtes-vous certain de vouloir supprimer définitivement « ${item.name} » ? Cette action est irréversible.`,
                            confirmLabel: 'Supprimer',
                            cancelLabel: 'Annuler',
                            isDestructive: true,
                            icon: 'trash',
                            onConfirm: async () => {
                              await deleteItemById(item.id);
                            },
                          });
                        }}
                        className="p-1.5 rounded-lg text-[#86868b] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.status === 'en_vente' ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRemoveFromSale(item)}
                          className="px-2.5 py-1 text-[11px] rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition cursor-pointer"
                          title="Remettre en inventaire normal"
                        >
                          Retirer
                        </button>
                        <button
                          onClick={() => handleMarkAsSold(item)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 transition cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Vendu</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRelist(item)}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#f5f5f7] hover:bg-[#ebebee] text-[#1d1d1f] transition cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3 text-[#0071e3]" />
                        <span>Remettre en vente</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal Générateur d'Annonce */}
      {listingItem && (
        <ListingGeneratorModal
          item={listingItem}
          isOpen={Boolean(listingItem)}
          onClose={() => setListingItem(null)}
        />
      )}

      {/* Modal Fiche Objet */}
      {inspectedItem && (
        <ItemQuickViewModal
          item={inspectedItem}
          onClose={() => setInspectedItem(null)}
        />
      )}
    </div>
  );
};
