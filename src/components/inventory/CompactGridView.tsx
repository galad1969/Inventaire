import React from 'react';
import { Image as ImageIcon, MapPin, Edit3, Trash2 } from 'lucide-react';
import { InventoryItem } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';

interface CompactGridViewProps {
  items: InventoryItem[];
  mediaUrls: Record<string, string>;
  onItemClick: (item: InventoryItem) => void;
}

export const CompactGridView: React.FC<CompactGridViewProps> = ({
  items,
  mediaUrls,
  onItemClick,
}) => {
  const { openEditModal, deleteItemById, requestConfirmation, setSelectedTag } = useInventory();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
      {items.map((item) => {
        const photoId = item.primaryPhotoId || (item.mediaIds && item.mediaIds[0]);
        const photoUrl = photoId ? mediaUrls[photoId] : null;

        return (
          <div
            key={item.id}
            onClick={() => onItemClick(item)}
            className="group rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] hover:border-[#0071e3]/40 dark:hover:border-[#0a84ff]/50 p-2.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-200 cursor-pointer relative"
          >
            <div>
              {/* Square photo */}
              <div className="aspect-square w-full rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/[0.04] dark:border-white/[0.06] overflow-hidden relative flex items-center justify-center mb-2">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-[#86868b] dark:text-[#8e8e93] opacity-35" />
                )}

                {item.status === 'en_vente' && (
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                    Vente
                  </span>
                )}

                {/* Quick overlay actions on hover */}
                <div
                  className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-[#2c2c2e]/90 backdrop-blur-xs p-1 rounded-lg border border-black/[0.05] dark:border-white/[0.1] shadow-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1 rounded text-[#86868b] dark:text-[#8e8e93] hover:text-[#0071e3] dark:hover:text-[#0a84ff] hover:bg-[#0071e3]/10 dark:hover:bg-[#0071e3]/20 transition"
                    title="Modifier"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      requestConfirmation({
                        title: 'Supprimer cet objet ?',
                        message: `Êtes-vous certain de vouloir supprimer définitivement « ${item.name} » ? Cette action est irréversible et effacera toutes ses photos et factures.`,
                        confirmLabel: 'Supprimer',
                        cancelLabel: 'Annuler',
                        isDestructive: true,
                        icon: 'trash',
                        onConfirm: async () => {
                          await deleteItemById(item.id);
                        },
                      });
                    }}
                    className="p-1 rounded text-[#86868b] dark:text-[#8e8e93] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title & Brand */}
              <h4 className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] line-clamp-1 group-hover:text-[#0071e3] dark:group-hover:text-[#0a84ff] transition-colors">
                {item.name}
              </h4>
              <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] truncate mt-0.5">
                {item.brand || item.category}
              </p>

              {/* Location pill */}
              <div className="mt-2 flex items-center gap-1 text-[10px] text-[#86868b] dark:text-[#8e8e93] truncate">
                <MapPin className="w-2.5 h-2.5 shrink-0 text-[#0071e3] dark:text-[#0a84ff]" />
                <span className="truncate">{item.location.room} • {item.location.subLocation}</span>
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div
                  className="mt-1 flex items-center gap-1 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.tags.slice(0, 2).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTag(t.trim().toLowerCase())}
                      className="text-[9px] px-1 py-0.2 rounded bg-black/[0.04] dark:bg-white/[0.08] hover:bg-[#0071e3]/10 dark:hover:bg-[#0071e3]/20 hover:text-[#0071e3] dark:hover:text-[#0a84ff] text-[#555558] dark:text-[#a1a1a6] truncate transition cursor-pointer"
                      title={`Filtrer par #${t}`}
                    >
                      #{t}
                    </button>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-[9px] text-[#86868b] dark:text-[#8e8e93]">+{item.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>

            {/* Price & Condition */}
            <div className="pt-2 mt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {item.purchasePrice ? `${item.purchasePrice} €` : 'N/C'}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] text-[#555558] dark:text-[#a1a1a6] capitalize">
                {item.condition === 'tres_bon_etat' ? 'Très bon' : item.condition.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
