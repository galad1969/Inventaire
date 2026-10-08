import React from 'react';
import { Archive, RotateCcw, Trash2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { saveItem, deleteItem } from '../services/db';

export const ArchivedPage: React.FC = () => {
  const { items, refreshInventory, deleteItemById, requestConfirmation } = useInventory();

  const archivedItems = items.filter((it) => it.status === 'archive');

  const handleRestore = async (id: string) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    await saveItem({
      ...item,
      status: 'actif',
      archivedAt: undefined,
    });
    await refreshInventory();
  };

  const handlePermanentDelete = (item: (typeof archivedItems)[0]) => {
    requestConfirmation({
      title: 'Supprimer définitivement cet objet ?',
      message: `Êtes-vous certain de vouloir supprimer définitivement « ${item.name} » des archives ainsi que tous ses fichiers stockés ?`,
      confirmLabel: 'Supprimer définitivement',
      cancelLabel: 'Annuler',
      isDestructive: true,
      icon: 'trash',
      onConfirm: async () => {
        await deleteItemById(item.id);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2">
          <Archive className="w-6 h-6 text-[#86868b]" />
          <span>Objets Archivés</span>
        </h1>
        <p className="text-xs text-[#86868b] mt-0.5">
          Objets archivés avant suppression définitive ({archivedItems.length})
        </p>
      </div>

      {archivedItems.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6">
          <Archive className="w-10 h-10 text-[#86868b] mx-auto mb-3 opacity-40" />
          <h2 className="text-base font-semibold text-[#1d1d1f]">Aucun objet dans les archives</h2>
          <p className="text-xs text-[#86868b] mt-1 max-w-sm mx-auto">
            L'archivage permet de masquer un objet de l'inventaire actif tout en conservant ses données et factures.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {archivedItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white border border-black/[0.06] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4"
            >
              <div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.04] text-[#86868b]">
                  Archivé le {item.archivedAt ? new Date(item.archivedAt).toLocaleDateString('fr-FR') : 'Récemment'}
                </span>
                <h3 className="font-semibold text-sm text-[#1d1d1f] mt-1.5">{item.name}</h3>
                <p className="text-xs text-[#86868b]">
                  {item.brand ? `${item.brand} ` : ''}
                  {item.model ? `• ${item.model}` : ''}
                </p>
              </div>

              <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleRestore(item.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebee] text-[#1d1d1f] text-xs font-medium border border-black/[0.06] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#0071e3]" />
                  <span>Désarchiver</span>
                </button>

                <button
                  onClick={() => handlePermanentDelete(item)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium border border-rose-200/50 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
