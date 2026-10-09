import React, { useEffect, useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  ShieldCheck,
  Tag,
  Layers,
  FileText,
  ExternalLink,
  ChevronRight,
  Download,
  Box,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Archive,
  Star,
  Check,
} from 'lucide-react';
import { InventoryItem, MediaItem } from '../../types/inventory';
import { getMediaById } from '../../services/db';
import { useInventory } from '../../context/InventoryContext';

interface ItemQuickViewModalProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export const ItemQuickViewModal: React.FC<ItemQuickViewModalProps> = ({
  item,
  onClose,
}) => {
  const { openEditModal, deleteItemById, archiveItemById, requestConfirmation, setSelectedTag, setPrimaryPhoto } = useInventory();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState<boolean>(true);
  const [currentPrimaryId, setCurrentPrimaryId] = useState<string | undefined>(item?.primaryPhotoId);
  const [successFeedback, setSuccessFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    async function loadItemMedia() {
      setLoadingMedia(true);
      const loaded: MediaItem[] = [];
      for (const mId of item!.mediaIds || []) {
        const m = await getMediaById(mId);
        if (m) loaded.push(m);
      }

      if (isMounted) {
        setMediaList(loaded);
        // Photo principale ou premier média photo
        const primary = loaded.find((m) => m.id === item!.primaryPhotoId) || loaded.find((m) => m.category === 'photo' || m.mimeType.startsWith('image/')) || loaded[0];
        if (primary) {
          setSelectedMedia(primary);
          if (primary.blob) {
            setSelectedPhotoUrl(URL.createObjectURL(primary.blob));
          } else {
            setSelectedPhotoUrl(null);
          }
        } else {
          setSelectedMedia(null);
          setSelectedPhotoUrl(null);
        }
        setCurrentPrimaryId(item!.primaryPhotoId);
        setLoadingMedia(false);
      }
    }

    loadItemMedia();

    return () => {
      isMounted = false;
    };
  }, [item]);

  if (!item) return null;

  const today = new Date().toISOString().slice(0, 10);
  const isWarrantyExpired = item.warrantyEndDate ? item.warrantyEndDate < today : null;

  const conditionLabels: Record<string, string> = {
    neuf: 'Neuf',
    tres_bon_etat: 'Très bon état',
    bon_etat: 'Bon état',
    satisfaisant: 'Satisfaisant',
    pour_pieces: 'Pour pièces',
  };

  const handleDownloadFile = (media: MediaItem) => {
    if (!media.blob) return;
    const url = URL.createObjectURL(media.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = media.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSetAsPrimary = async (mediaId: string) => {
    if (!item) return;
    await setPrimaryPhoto(item.id, mediaId);
    setCurrentPrimaryId(mediaId);
    setSuccessFeedback(true);
    setTimeout(() => setSuccessFeedback(false), 2200);
  };

  const handleDelete = () => {
    if (!item) return;
    requestConfirmation({
      title: 'Supprimer cet objet ?',
      message: `Êtes-vous certain de vouloir supprimer définitivement « ${item.name} » ? Cette action est irréversible et effacera également toutes ses photos et factures stockées.`,
      confirmLabel: 'Supprimer définitivement',
      cancelLabel: 'Annuler',
      isDestructive: true,
      icon: 'trash',
      onConfirm: async () => {
        await deleteItemById(item.id);
        onClose();
      },
    });
  };

  const handleArchive = () => {
    if (!item) return;
    requestConfirmation({
      title: 'Archiver cet objet ?',
      message: `Souhaitez-vous archiver « ${item.name} » ? Il sera masqué de l'inventaire actif et consultable dans la section « Objets archivés ».`,
      confirmLabel: 'Archiver',
      cancelLabel: 'Annuler',
      isDestructive: false,
      icon: 'archive',
      onConfirm: async () => {
        await archiveItemById(item.id);
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-3xl bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Top header */}
          <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-[#fbfbfd] dark:bg-[#18181a]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white dark:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-2xs">
                {item.category}
              </span>
              {item.status === 'en_vente' && (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                  En Vente ({item.salePrice} €)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  openEditModal(item);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#2c2c2e] hover:bg-[#f5f5f7] dark:hover:bg-[#353538] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-medium border border-black/[0.08] dark:border-white/[0.1] shadow-2xs transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
                <span>Modifier</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Gallery / Image Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-3">
                <div className="h-64 w-full rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/[0.05] dark:border-white/[0.06] overflow-hidden flex items-center justify-center relative">
                  {selectedPhotoUrl ? (
                    <>
                      <img
                        src={selectedPhotoUrl}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                      />

                      {/* Indicateur et sélecteur d'illustration par défaut */}
                      {selectedMedia && (selectedMedia.category === 'photo' || selectedMedia.mimeType.startsWith('image/')) && (
                        selectedMedia.id === currentPrimaryId ? (
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-semibold shadow-md">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>Illustration par défaut</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetAsPrimary(selectedMedia.id)}
                            className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#1c1c1e]/95 hover:bg-white dark:hover:bg-[#2c2c2e] text-[#0071e3] dark:text-[#0a84ff] text-xs font-semibold shadow-md border border-[#0071e3]/30 dark:border-[#0a84ff]/40 transition cursor-pointer active:scale-95 hover:shadow-lg"
                            title="Définir cette photo comme vignette par défaut de l'objet"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            <span>Définir comme illustration par défaut</span>
                          </button>
                        )
                      )}

                      {successFeedback && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-semibold shadow-md animate-in fade-in">
                          <Check className="w-3 h-3" />
                          <span>Illustration mise à jour !</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-[#86868b] dark:text-[#8e8e93]">
                      <ImageIcon className="w-8 h-8 opacity-30" />
                      <span className="text-xs">Aucune image principale</span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {mediaList.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {mediaList.map((m) => {
                      const url = m.blob ? URL.createObjectURL(m.blob) : null;
                      if (!url) return null;
                      const isThisPrimary = m.id === currentPrimaryId;
                      const isSelected = selectedMedia?.id === m.id;

                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedMedia(m);
                            setSelectedPhotoUrl(url);
                          }}
                          className={`w-14 h-14 rounded-xl border overflow-hidden shrink-0 transition cursor-pointer relative ${
                            isSelected ? 'ring-2 ring-[#0071e3] dark:ring-[#0a84ff] border-transparent' : 'border-black/[0.08] dark:border-white/[0.1]'
                          }`}
                          title={isThisPrimary ? `${m.name} (Illustration par défaut)` : m.name}
                        >
                          <img src={url} alt={m.name} className="w-full h-full object-cover" />
                          {isThisPrimary && (
                            <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Identity & Core Info */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">{item.name}</h2>
                  <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-0.5">
                    {item.brand ? <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">{item.brand}</strong> : ''}
                    {item.model ? ` • Modèle : ${item.model}` : ''}
                    {item.serialNumber ? ` • S/N : ${item.serialNumber}` : ''}
                  </p>
                </div>

                {/* Financial & Warranty Summary */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#252528] border border-black/[0.05] dark:border-white/[0.06] text-xs">
                  <div>
                    <span className="text-[#86868b] dark:text-[#8e8e93] block text-[11px]">Prix d'achat</span>
                    <span className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {item.purchasePrice ? `${item.purchasePrice.toLocaleString('fr-FR')} €` : 'N/C'}
                    </span>
                    <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93] block mt-0.5">
                      {item.purchaseDate ? `Le ${item.purchaseDate}` : 'Date non renseignée'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#86868b] dark:text-[#8e8e93] block text-[11px]">Garantie</span>
                    {item.warrantyEndDate ? (
                      <span
                        className={`font-semibold inline-flex items-center gap-1 text-[12px] mt-0.5 ${
                          isWarrantyExpired ? 'text-[#86868b] dark:text-[#8e8e93]' : 'text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isWarrantyExpired ? 'Expirée' : `Valable jusqu'au ${item.warrantyEndDate}`}</span>
                      </span>
                    ) : (
                      <span className="text-[#86868b] dark:text-[#8e8e93]">Non spécifiée</span>
                    )}
                    <span className="text-[10px] text-[#555558] dark:text-[#a1a1a6] block mt-1">
                      État : <strong>{conditionLabels[item.condition] || item.condition}</strong>
                    </span>
                  </div>
                </div>

                {/* Localisation en poupées russes */}
                <div className="p-4 rounded-2xl bg-[#f5f5f7]/80 dark:bg-[#252528] border border-black/[0.05] dark:border-white/[0.06] space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#0071e3] dark:text-[#0a84ff] font-semibold">
                    <MapPin className="w-4 h-4" />
                    <span>Emplacement (Poupées Russes)</span>
                  </div>
                  <div className="text-xs space-y-1 pl-5">
                    <div className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">🏠 {item.location.residence}</div>
                    <div className="text-[#555558] dark:text-[#a1a1a6]">↳ 🚪 Pièce : <strong>{item.location.room}</strong></div>
                    <div className="text-[#555558] dark:text-[#a1a1a6]">↳ 🗄️ Meuble : <strong>{item.location.furniture}</strong></div>
                    <div className="text-[#0071e3] dark:text-[#0a84ff] font-mono font-medium">↳ 📦 Emplacement précis : <strong>{item.location.subLocation}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Relations (Accessoires & Emballages) */}
            {item.relations && item.relations.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
                <h3 className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
                  <span>Accessoires & Emballages liés ({item.relations.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.relations.map((rel) => (
                    <div
                      key={rel.id}
                      className="p-3.5 rounded-xl bg-[#fbfbfd] dark:bg-[#252528] border border-black/[0.05] dark:border-white/[0.06] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {rel.type === 'packaging' ? '📦 Boîte / Emballage' : '🔌 Accessoire'}
                        </span>
                        <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08]">
                          {rel.type}
                        </span>
                      </div>
                      <p className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">{rel.label}</p>
                      
                      {rel.customLocation && (
                        <div className="pt-1 mt-1 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] text-[#0071e3] dark:text-[#0a84ff]">
                          📍 Stocké à : {rel.customLocation.room} → {rel.customLocation.furniture} ({rel.customLocation.subLocation})
                        </div>
                      )}

                      {rel.notes && (
                        <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] italic">{rel.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fichiers & Documents rattachés (Factures / Notices PDF) */}
            {mediaList.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
                <h3 className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
                  <span>Fichiers & Factures enregistrés ({mediaList.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mediaList.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-[#fbfbfd] dark:bg-[#252528] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block truncate">{m.name}</span>
                          <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93]">
                            {m.category === 'invoice' ? 'Facture' : m.category === 'photo' ? 'Photo' : 'Document'} • {(m.size / 1024).toFixed(0)} Ko
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadFile(m)}
                        className="p-1.5 rounded-lg text-[#0071e3] dark:text-[#0a84ff] hover:bg-[#0071e3]/10 dark:hover:bg-[#0071e3]/20 transition cursor-pointer shrink-0"
                        title="Télécharger le fichier"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes & Documentation externe */}
            {(item.notes || item.manualUrl || (item.tags && item.tags.length > 0)) && (
              <div className="space-y-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.06] text-xs">
                {item.notes && (
                  <div>
                    <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">Notes & Remarques :</span>
                    <p className="p-3 rounded-xl bg-[#fbfbfd] dark:bg-[#252528] border border-black/[0.04] dark:border-white/[0.06] text-[#555558] dark:text-[#a1a1a6] leading-relaxed whitespace-pre-line">
                      {item.notes}
                    </p>
                  </div>
                )}

                {item.manualUrl && (
                  <div>
                    <a
                      href={item.manualUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#0071e3] dark:text-[#0a84ff] font-medium hover:underline"
                    >
                      <span>Consulter la notice en ligne</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setSelectedTag(t.trim().toLowerCase());
                          onClose();
                        }}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#0071e3]/10 dark:hover:bg-[#0071e3]/20 hover:text-[#0071e3] dark:hover:text-[#0a84ff] text-[#555558] dark:text-[#a1a1a6] border border-black/[0.04] dark:border-white/[0.06] transition cursor-pointer flex items-center gap-0.5"
                        title={`Filtrer par l'étiquette #${t}`}
                      >
                        <span>#{t}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer actions */}
          <div className="px-6 py-3.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#fbfbfd] dark:bg-[#18181a] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  openEditModal(item);
                }}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#2c2c2e] hover:bg-[#f5f5f7] dark:hover:bg-[#353538] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-semibold border border-black/[0.08] dark:border-white/[0.1] shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
                <span>Modifier</span>
              </button>

              <button
                onClick={handleArchive}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#2c2c2e] hover:bg-[#f5f5f7] dark:hover:bg-[#353538] text-[#555558] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] text-xs font-medium border border-black/[0.08] dark:border-white/[0.1] shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                title="Déplacer vers les archives"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archiver</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200/60 dark:border-rose-800/50 transition flex items-center gap-1.5 cursor-pointer"
                title="Supprimer définitivement cet objet de la base de données"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
