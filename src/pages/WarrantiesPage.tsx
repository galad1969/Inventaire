import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  Plus,
  Package,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem, MediaItem } from '../types/inventory';
import { getMediaById } from '../services/db';
import { ItemQuickViewModal } from '../components/inventory/ItemQuickViewModal';

export const WarrantiesPage: React.FC = () => {
  const {
    items,
    openEditModal,
    openCreateModal,
    deleteItemById,
    requestConfirmation,
  } = useInventory();

  // Filtre d'onglet
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'active' | 'expired'>('all');

  // Cache des factures (MediaItems de catégorie 'invoice')
  const [invoicesByItemId, setInvoicesByItemId] = useState<Record<string, MediaItem[]>>({});

  // Objet sélectionné pour inspection rapide
  const [inspectedItem, setInspectedItem] = useState<InventoryItem | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const today = new Date();

  // Filtrer les objets possédant une date de fin de garantie
  const warrantyItems = items.filter(
    (it) => it.warrantyEndDate && it.status !== 'archive'
  );

  // Chargement des factures attachées aux objets
  useEffect(() => {
    let isMounted = true;
    async function loadInvoices() {
      const map: Record<string, MediaItem[]> = {};
      for (const it of warrantyItems) {
        if (it.mediaIds && it.mediaIds.length > 0) {
          const invs: MediaItem[] = [];
          for (const mId of it.mediaIds) {
            const m = await getMediaById(mId);
            if (m && m.category === 'invoice') {
              invs.push(m);
            }
          }
          if (invs.length > 0) map[it.id] = invs;
        }
      }
      if (isMounted) setInvoicesByItemId(map);
    }
    loadInvoices();
    return () => {
      isMounted = false;
    };
  }, [warrantyItems]);

  // Calcul du statut de chaque garantie
  const categorizedItems = warrantyItems.map((item) => {
    const end = new Date(item.warrantyEndDate!);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = diffDays < 0;
    const isUrgent = !isExpired && diffDays <= 60; // Expire dans moins de 60 jours

    return {
      item,
      diffDays,
      isExpired,
      isUrgent,
      isActive: !isExpired,
    };
  });

  // Filtrage selon l'onglet actif
  const displayedItems = categorizedItems.filter((entry) => {
    if (filterType === 'urgent') return entry.isUrgent;
    if (filterType === 'active') return entry.isActive;
    if (filterType === 'expired') return entry.isExpired;
    return true;
  });

  // Calculs statistiques
  const totalActive = categorizedItems.filter((e) => e.isActive).length;
  const totalUrgent = categorizedItems.filter((e) => e.isUrgent).length;
  const totalExpired = categorizedItems.filter((e) => e.isExpired).length;
  const totalCoveredValue = categorizedItems
    .filter((e) => e.isActive)
    .reduce((acc, e) => acc + (e.item.purchasePrice || 0), 0);

  const handleDownloadInvoice = (inv: MediaItem) => {
    if (!inv.blob) return;
    const url = URL.createObjectURL(inv.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = inv.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Suivi des Garanties & Factures</span>
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Surveillez les fins de garanties légales constructeurs et téléchargez immédiatement vos factures d'achat
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter un objet avec garantie</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] border border-emerald-500/20 dark:border-emerald-500/30 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#86868b] dark:text-[#8e8e93] text-[11px] font-semibold uppercase">
            <span>Garanties Actives</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-2">{totalActive}</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
            Biens protégés
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] border border-amber-500/20 dark:border-amber-500/30 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#86868b] dark:text-[#8e8e93] text-[11px] font-semibold uppercase">
            <span>Alertes Urgentes</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{totalUrgent}</div>
          <div className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">
            Expire sous 60 jours
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#86868b] dark:text-[#8e8e93] text-[11px] font-semibold uppercase">
            <span>Garanties Expirées</span>
            <div className="w-7 h-7 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b] dark:text-[#8e8e93] flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-2">{totalExpired}</div>
          <div className="text-xs text-[#86868b] dark:text-[#8e8e93] font-medium mt-0.5">
            Hors période légale
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#86868b] dark:text-[#8e8e93] text-[11px] font-semibold uppercase">
            <span>Valeur Couverte</span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center font-bold">
              €
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0071e3] dark:text-[#0a84ff] mt-2">
            {totalCoveredValue.toLocaleString('fr-FR')} €
          </div>
          <div className="text-xs text-[#86868b] dark:text-[#8e8e93] font-medium mt-0.5">
            Montant d'achat garanti
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-[#1c1c1e] p-1.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xs self-start flex-wrap">
        {(
          [
            { id: 'all', label: `Toutes (${warrantyItems.length})` },
            { id: 'urgent', label: `Urgentes (< 60 jours) (${totalUrgent})` },
            { id: 'active', label: `Actives (${totalActive})` },
            { id: 'expired', label: `Expirées (${totalExpired})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === tab.id
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-[#555558] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {displayedItems.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
          <ShieldCheck className="w-10 h-10 text-emerald-600/40 dark:text-emerald-400/40 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Aucun objet dans cette sélection</h2>
          <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-1 max-w-sm mx-auto">
            Renseignez la date d'achat et la date de fin de garantie dans la fiche d'un objet pour suivre ses alertes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedItems.map(({ item, diffDays, isExpired, isUrgent }) => {
            const invoices = invoicesByItemId[item.id] || [];

            return (
              <div
                key={item.id}
                className={`rounded-3xl bg-white dark:bg-[#1c1c1e] border p-5 shadow-2xs transition-all flex flex-col justify-between space-y-4 ${
                  isUrgent
                    ? 'border-amber-500/40 dark:border-amber-500/50 shadow-[0_4px_20px_rgba(245,158,11,0.08)]'
                    : isExpired
                    ? 'border-black/[0.06] dark:border-white/[0.08] opacity-90'
                    : 'border-emerald-500/30 dark:border-emerald-500/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#555558] dark:text-[#a1a1a6]">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mt-1.5 line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-[#86868b] dark:text-[#8e8e93]">
                        {item.brand ? `${item.brand} ` : ''}
                        {item.model ? `• ${item.model}` : ''}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="text-right">
                      {isExpired ? (
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-[#86868b] dark:text-[#8e8e93]">
                          Expirée
                        </span>
                      ) : isUrgent ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs animate-pulse">
                          ⚠️ Expire dans {diffDays} j !
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                          Active ({diffDays} j)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dates Details Card */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-[#fbfbfd] dark:bg-[#252528] border border-black/[0.04] dark:border-white/[0.06] text-xs space-y-1.5">
                    <div className="flex justify-between text-[#86868b] dark:text-[#8e8e93]">
                      <span>Date d'achat :</span>
                      <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">{item.purchaseDate || 'N/C'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#86868b] dark:text-[#8e8e93]">Fin de garantie :</span>
                      <span
                        className={`font-semibold ${
                          isUrgent ? 'text-amber-600 dark:text-amber-400' : isExpired ? 'text-[#86868b] dark:text-[#8e8e93]' : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {item.warrantyEndDate}
                      </span>
                    </div>

                    {item.purchasePrice && (
                      <div className="flex justify-between text-[#86868b] dark:text-[#8e8e93] pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                        <span>Montant facture :</span>
                        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">{item.purchasePrice} €</span>
                      </div>
                    )}
                  </div>

                  {/* Numéro de série constructeur */}
                  {item.serialNumber && (
                    <div className="mt-2 text-[11px] text-[#86868b] dark:text-[#8e8e93] flex justify-between px-1">
                      <span>N° Série :</span>
                      <span className="font-mono text-[#1d1d1f] dark:text-[#f5f5f7]">{item.serialNumber}</span>
                    </div>
                  )}

                  {/* Justificatifs / Factures stockées en IndexedDB */}
                  <div className="mt-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <div className="text-[10px] uppercase font-semibold text-[#86868b] dark:text-[#8e8e93] tracking-wider mb-1.5">
                      Factures d'achat stockées ({invoices.length})
                    </div>
                    {invoices.length > 0 ? (
                      <div className="space-y-1">
                        {invoices.map((inv) => (
                          <div
                            key={inv.id}
                            className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="font-medium text-emerald-950 dark:text-emerald-200 truncate text-[11px]">{inv.name}</span>
                            </div>
                            <button
                              onClick={() => handleDownloadInvoice(inv)}
                              className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold transition shrink-0 flex items-center gap-1 cursor-pointer"
                              title="Télécharger la facture originale"
                            >
                              <Download className="w-3 h-3" />
                              <span>Télécharger</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#86868b] dark:text-[#8e8e93] italic">
                        Aucun fichier facture joint (ajoutez-le dans la fiche objet)
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setInspectedItem(item)}
                      className="p-1.5 rounded-lg text-[#86868b] dark:text-[#8e8e93] hover:text-[#0071e3] dark:hover:text-[#0a84ff] hover:bg-[#0071e3]/10 dark:hover:bg-[#0071e3]/20 transition cursor-pointer"
                      title="Consulter"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-[#86868b] dark:text-[#8e8e93] hover:text-[#0071e3] dark:hover:text-[#0a84ff] hover:bg-[#0071e3]/10 dark:hover:bg-[#0071e3]/20 transition cursor-pointer"
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
                      className="p-1.5 rounded-lg text-[#86868b] dark:text-[#8e8e93] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.manualUrl && (
                    <a
                      href={item.manualUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#0071e3] dark:text-[#0a84ff] hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Notice en ligne</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

              </div>
            );
          })}
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
