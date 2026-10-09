import React from 'react';
import {
  Image as ImageIcon,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Tag,
  ArrowUpDown,
  FileText,
  Edit3,
  Trash2,
} from 'lucide-react';
import { InventoryItem, SortOption } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';

interface ListViewProps {
  items: InventoryItem[];
  mediaUrls: Record<string, string>;
  onItemClick: (item: InventoryItem) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  items,
  mediaUrls,
  onItemClick,
  sortOption,
  onSortChange,
}) => {
  const { openEditModal, deleteItemById, requestConfirmation, setSelectedTag } = useInventory();
  const today = new Date().toISOString().slice(0, 10);

  const toggleSort = (field: 'name' | 'price' | 'date') => {
    if (field === 'name') {
      onSortChange(sortOption === 'name-asc' ? 'name-desc' : 'name-asc');
    } else if (field === 'price') {
      onSortChange(sortOption === 'price-desc' ? 'price-asc' : 'price-desc');
    } else if (field === 'date') {
      onSortChange(sortOption === 'date-desc' ? 'date-asc' : 'date-desc');
    }
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-black/[0.06] dark:border-white/[0.08] bg-[#fbfbfd] dark:bg-[#18181a] text-[#86868b] dark:text-[#8e8e93] text-[11px] font-semibold uppercase tracking-wider select-none">
              <th className="py-3 px-4 w-12 text-center">Visuel</th>
              <th
                onClick={() => toggleSort('name')}
                className="py-3 px-4 cursor-pointer hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Objet & Marque</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-3 px-4 hidden md:table-cell">Catégorie</th>
              <th className="py-3 px-4">Emplacement (Poupée Russe)</th>
              <th className="py-3 px-4 hidden sm:table-cell">État / Statut</th>
              <th className="py-3 px-4 hidden lg:table-cell">Garantie</th>
              <th
                onClick={() => toggleSort('price')}
                className="py-3 px-4 text-right cursor-pointer hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Prix</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-3 px-4 text-right w-20">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
            {items.map((item) => {
              const photoId = item.primaryPhotoId || (item.mediaIds && item.mediaIds[0]);
              const photoUrl = photoId ? mediaUrls[photoId] : null;
              const isWarrantyExpired = item.warrantyEndDate ? item.warrantyEndDate < today : null;

              return (
                <tr
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className="hover:bg-[#f5f5f7]/70 dark:hover:bg-[#252528]/80 transition-colors cursor-pointer group"
                >
                  {/* Miniature */}
                  <td className="py-2.5 px-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden mx-auto flex items-center justify-center relative">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93] opacity-35" />
                      )}
                    </div>
                  </td>

                  {/* Nom & Marque */}
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] dark:group-hover:text-[#0a84ff] transition-colors line-clamp-1">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-[#86868b] dark:text-[#8e8e93] flex items-center gap-1.5 flex-wrap">
                      <span>{item.brand || 'Sans marque'}</span>
                      {item.model && <span>• {item.model}</span>}
                      {item.relations && item.relations.length > 0 && (
                        <span className="text-[10px] text-[#0071e3] dark:text-[#0a84ff] font-medium">
                          ({item.relations.length} liaison{item.relations.length > 1 ? 's' : ''})
                        </span>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {item.tags.slice(0, 3).map((t) => (
                            <button
                              key={t}
                              onClick={() => setSelectedTag(t.trim().toLowerCase())}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-black/[0.04] dark:bg-white/[0.08] hover:bg-[#0071e3]/10 dark:hover:bg-[#0071e3]/20 hover:text-[#0071e3] dark:hover:text-[#0a84ff] text-[#555558] dark:text-[#a1a1a6] transition cursor-pointer"
                              title={`Filtrer par #${t}`}
                            >
                              #{t}
                            </button>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-[9px] text-[#86868b] dark:text-[#8e8e93]">+{item.tags.length - 3}</span>
                          )}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Catégorie */}
                  <td className="py-2.5 px-4 hidden md:table-cell text-[#555558] dark:text-[#a1a1a6]">
                    <span className="px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[10px] font-medium">
                      {item.category}
                    </span>
                  </td>

                  {/* Emplacement Poupées Russes */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1 text-[11px] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">
                      <MapPin className="w-3 h-3 text-[#0071e3] dark:text-[#0a84ff] shrink-0" />
                      <span>{item.location.residence}</span>
                    </div>
                    <div className="text-[10px] text-[#86868b] dark:text-[#8e8e93] flex items-center gap-1 pl-4 truncate">
                      <span>{item.location.room}</span>
                      <ChevronRight className="w-2.5 h-2.5 opacity-50 shrink-0" />
                      <span>{item.location.furniture}</span>
                      <ChevronRight className="w-2.5 h-2.5 opacity-50 shrink-0" />
                      <span className="text-[#0071e3] dark:text-[#0a84ff] font-mono">{item.location.subLocation}</span>
                    </div>
                  </td>

                  {/* État / Statut */}
                  <td className="py-2.5 px-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#555558] dark:text-[#a1a1a6] capitalize">
                        {item.condition === 'tres_bon_etat' ? 'Très bon' : item.condition.replace(/_/g, ' ')}
                      </span>
                      {item.status === 'en_vente' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                          Vente
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Garantie */}
                  <td className="py-2.5 px-4 hidden lg:table-cell text-[#86868b] dark:text-[#8e8e93] text-[11px]">
                    {item.warrantyEndDate ? (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          isWarrantyExpired
                            ? 'bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b] dark:text-[#8e8e93]'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{item.warrantyEndDate}</span>
                      </span>
                    ) : (
                      <span className="text-black/[0.2] dark:text-white/[0.2]">—</span>
                    )}
                  </td>

                  {/* Prix */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-xs">
                      {item.purchasePrice ? `${item.purchasePrice.toLocaleString('fr-FR')} €` : '—'}
                    </div>
                    {item.status === 'en_vente' && item.salePrice && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        Vente : {item.salePrice} €
                      </div>
                    )}
                  </td>

                  {/* Actions unitaire */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 rounded-lg text-[#86868b] dark:text-[#8e8e93] hover:text-[#0071e3] dark:hover:text-[#0a84ff] hover:bg-[#0071e3]/10 dark:hover:bg-[#0071e3]/20 transition cursor-pointer"
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
                        className="p-1 rounded-lg text-[#86868b] dark:text-[#8e8e93] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Supprimer définitivement cet objet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
