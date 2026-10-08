import React from 'react';
import { MapPin, ChevronRight, Layers, Image as ImageIcon, Eye, Edit3, Trash2 } from 'lucide-react';
import { InventoryItem } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';

interface LargeGridViewProps {
  items: InventoryItem[];
  mediaUrls: Record<string, string>;
  onItemClick: (item: InventoryItem) => void;
}

export const LargeGridView: React.FC<LargeGridViewProps> = ({
  items,
  mediaUrls,
  onItemClick,
}) => {
  const { openEditModal, deleteItemById, requestConfirmation, setSelectedTag } = useInventory();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item) => {
        const photoUrl = item.primaryPhotoId ? mediaUrls[item.primaryPhotoId] : null;

        return (
          <div
            key={item.id}
            onClick={() => onItemClick(item)}
            className="group rounded-2xl bg-white border border-black/[0.06] hover:border-[#0071e3]/40 transition-all duration-200 p-4 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] cursor-pointer"
          >
            <div>
              {/* Photo Container */}
              <div className="h-44 w-full rounded-xl bg-[#f5f5f7] border border-black/[0.04] overflow-hidden relative flex items-center justify-center mb-3.5">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-[#86868b]">
                    <ImageIcon className="w-6 h-6 opacity-40" />
                    <span className="text-[11px]">Sans image</span>
                  </div>
                )}

                {/* Top Category Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[#1d1d1f] shadow-xs border border-black/[0.04]">
                    {item.category}
                  </span>
                </div>

                {/* Status Badge */}
                {item.status === 'en_vente' && (
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                      En Vente ({item.salePrice} €)
                    </span>
                  </div>
                )}

                {/* Quick inspect overlay button */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-full bg-white/95 text-xs font-semibold text-[#1d1d1f] shadow-sm flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>Ouvrir la fiche</span>
                  </span>
                </div>
              </div>

              {/* Title & Brand */}
              <h3 className="font-semibold text-sm text-[#1d1d1f] line-clamp-1 group-hover:text-[#0071e3] transition-colors">
                {item.name}
              </h3>
              <p className="text-xs text-[#86868b] mt-0.5">
                {item.brand ? `${item.brand} ` : ''}
                {item.model ? `• ${item.model}` : ''}
              </p>

              {/* Russian Doll Location */}
              <div className="mt-3.5 p-2.5 rounded-xl bg-[#fbfbfd] border border-black/[0.04] text-[11px]">
                <div className="flex items-center gap-1 text-[#0071e3] font-medium mb-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.location.residence}</span>
                </div>
                <div className="text-[#86868b] text-[11px] space-y-0.5">
                  <div className="flex items-center gap-1 text-[#555558] truncate">
                    <ChevronRight className="w-2.5 h-2.5 opacity-50 shrink-0" />
                    <span>{item.location.room}</span>
                    <ChevronRight className="w-2.5 h-2.5 opacity-50 shrink-0" />
                    <span>{item.location.furniture}</span>
                  </div>
                  <div className="text-[#0071e3] font-medium pl-3 truncate">
                    ↳ {item.location.subLocation}
                  </div>
                </div>
              </div>

              {/* Liaisons */}
              {item.relations && item.relations.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#86868b]">
                  <Layers className="w-3 h-3 text-[#0071e3]" />
                  <span>
                    {item.relations.length} liaison{item.relations.length > 1 ? 's' : ''} (accessoire / boîte)
                  </span>
                </div>
              )}

              {/* Étiquettes / Tags transversaux */}
              {item.tags && item.tags.length > 0 && (
                <div
                  className="mt-2.5 flex flex-wrap gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTag(t.trim().toLowerCase())}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-black/[0.04] hover:bg-[#0071e3]/10 hover:text-[#0071e3] text-[#555558] transition cursor-pointer"
                      title={`Filtrer par #${t}`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-3 mt-3 border-t border-black/[0.04] flex items-center justify-between text-[11px]">
              <div>
                <div className="font-semibold text-[#1d1d1f]">
                  {item.purchasePrice ? `${item.purchasePrice.toLocaleString('fr-FR')} €` : 'Prix N/C'}
                </div>
                <div className="text-[10px] text-[#86868b] capitalize">
                  {item.condition.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/10 transition cursor-pointer"
                  title="Modifier cet objet"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    requestConfirmation({
                      title: 'Supprimer cet objet ?',
                      message: `Êtes-vous certain de vouloir supprimer définitivement « ${item.name} » ? Cette action est irréversible et effacera toutes ses photos et factures stockées.`,
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
                  title="Supprimer définitivement cet objet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};
