import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Check,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Layers,
  Box,
  Package,
  Hash,
  Camera,
} from 'lucide-react';
import {
  InventoryItem,
  ItemCondition,
  ItemStatus,
  MediaCategory,
  MediaItem,
  StorageLocation,
  ItemRelation,
} from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { saveItem, saveMediaFile, getMediaById, deleteMedia } from '../../services/db';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: InventoryItem | null;
  onSaved?: (item: InventoryItem) => void;
}

interface UploadedMediaDraft {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  category: MediaCategory;
  file?: File;
  blob?: Blob;
  previewUrl?: string;
  isExisting?: boolean;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSaved,
}) => {
  const { items, settings, allTags, refreshInventory, deleteItemById, requestConfirmation } = useInventory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const primaryFileInputRef = useRef<HTMLInputElement>(null);

  // Onglet actif du formulaire
  const [activeTab, setActiveTab] = useState<'general' | 'location' | 'financial' | 'media' | 'relations' | 'notes'>('general');

  // Champs du formulaire
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('tres_bon_etat');
  const [status, setStatus] = useState<ItemStatus>('actif');
  const [salePrice, setSalePrice] = useState<string>('');
  const [saleNotes, setSaleNotes] = useState<string>('');

  // Emplacement Poupées Russes
  const [residence, setResidence] = useState('');
  const [room, setRoom] = useState('');
  const [furniture, setFurniture] = useState('');
  const [subLocation, setSubLocation] = useState('');

  // Financier & Garantie
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [warrantyEndDate, setWarrantyEndDate] = useState('');

  // Liaisons (Accessoires & Boîtes/Emballages)
  const [relations, setRelations] = useState<ItemRelation[]>([]);
  const [newRelType, setNewRelType] = useState<'packaging' | 'accessory' | 'part'>('packaging');
  const [newRelLabel, setNewRelLabel] = useState('');
  const [newRelIsCustomLocation, setNewRelIsCustomLocation] = useState(false);
  const [newRelResidence, setNewRelResidence] = useState('');
  const [newRelRoom, setNewRelRoom] = useState('');
  const [newRelFurniture, setNewRelFurniture] = useState('');
  const [newRelSubLocation, setNewRelSubLocation] = useState('');
  const [newRelNotes, setNewRelNotes] = useState('');

  // Documentation
  const [manualUrl, setManualUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Médias
  const [mediaDrafts, setMediaDrafts] = useState<UploadedMediaDraft[]>([]);
  const [primaryPhotoId, setPrimaryPhotoId] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  // États de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Suggestions automatiques issues des objets existants
  const existingSuggestions = React.useMemo(() => {
    const residences = new Set<string>(settings?.residences || ['Résidence Principale']);
    const rooms = new Set<string>();
    const furnitures = new Set<string>();
    const subLocations = new Set<string>();

    items.forEach((it) => {
      if (it.location?.residence) residences.add(it.location.residence);
      if (it.location?.room) rooms.add(it.location.room);
      if (it.location?.furniture) furnitures.add(it.location.furniture);
      if (it.location?.subLocation) subLocations.add(it.location.subLocation);
    });

    return {
      residences: Array.from(residences),
      rooms: Array.from(rooms),
      furnitures: Array.from(furnitures),
      subLocations: Array.from(subLocations),
    };
  }, [items, settings]);

  // Initialisation à l'ouverture (Ajout vs Édition)
  useEffect(() => {
    if (!isOpen) return;

    if (itemToEdit) {
      // Mode Édition
      setName(itemToEdit.name || '');
      setCategory(itemToEdit.category || (settings?.categories[0] || 'Informatique & Périphériques'));
      setBrand(itemToEdit.brand || '');
      setModel(itemToEdit.model || '');
      setSerialNumber(itemToEdit.serialNumber || '');
      setCondition(itemToEdit.condition || 'tres_bon_etat');
      setStatus(itemToEdit.status || 'actif');
      setSalePrice(itemToEdit.salePrice ? String(itemToEdit.salePrice) : '');
      setSaleNotes(itemToEdit.saleNotes || '');

      setResidence(itemToEdit.location?.residence || existingSuggestions.residences[0] || 'Résidence Principale');
      setRoom(itemToEdit.location?.room || '');
      setFurniture(itemToEdit.location?.furniture || '');
      setSubLocation(itemToEdit.location?.subLocation || '');

      setPurchaseDate(itemToEdit.purchaseDate || '');
      setPurchasePrice(itemToEdit.purchasePrice ? String(itemToEdit.purchasePrice) : '');
      setCurrency(itemToEdit.currency || 'EUR');
      setWarrantyEndDate(itemToEdit.warrantyEndDate || '');

      setManualUrl(itemToEdit.manualUrl || '');
      setNotes(itemToEdit.notes || '');
      setTags(itemToEdit.tags || []);
      setRelations(itemToEdit.relations || []);
      setPrimaryPhotoId(itemToEdit.primaryPhotoId);

      // Charger les médias existants
      loadExistingMedia(itemToEdit.mediaIds || []);
    } else {
      // Mode Création (Valeurs par défaut)
      setName('');
      setCategory(settings?.categories[0] || 'Informatique & Périphériques');
      setBrand('');
      setModel('');
      setSerialNumber('');
      setCondition('tres_bon_etat');
      setStatus('actif');
      setSalePrice('');
      setSaleNotes('');

      setResidence(existingSuggestions.residences[0] || 'Résidence Principale');
      setRoom('');
      setFurniture('');
      setSubLocation('');

      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setPurchasePrice('');
      setCurrency(settings?.currency || 'EUR');
      setWarrantyEndDate('');

      setManualUrl('');
      setNotes('');
      setTags([]);
      setRelations([]);
      setMediaDrafts([]);
      setPrimaryPhotoId(undefined);
    }

    setActiveTab('general');
    setErrorMsg(null);
  }, [isOpen, itemToEdit, settings]);

  const loadExistingMedia = async (ids: string[]) => {
    const drafts: UploadedMediaDraft[] = [];
    for (const mId of ids) {
      const media = await getMediaById(mId);
      if (media && media.blob) {
        drafts.push({
          id: media.id,
          name: media.name,
          size: media.size,
          mimeType: media.mimeType,
          category: media.category,
          blob: media.blob,
          previewUrl: URL.createObjectURL(media.blob),
          isExisting: true,
        });
      }
    }
    setMediaDrafts(drafts);
  };

  if (!isOpen) return null;

  // Gestion des fichiers téléversés
  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newDrafts: UploadedMediaDraft[] = [];
    Array.from(files).forEach((file) => {
      const id = 'media-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
      const isPdf = file.type === 'application/pdf';
      const category: MediaCategory = isPdf ? 'invoice' : 'photo';

      newDrafts.push({
        id,
        name: file.name,
        size: file.size,
        mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
        category,
        file,
        blob: file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        isExisting: false,
      });
    });

    setMediaDrafts((prev) => {
      const updated = [...prev, ...newDrafts];
      // Si aucune photo principale n'est définie et qu'une image est ajoutée, la définir par défaut
      if (!primaryPhotoId) {
        const firstPhoto = updated.find((m) => m.category === 'photo' || m.mimeType.startsWith('image/'));
        if (firstPhoto) setPrimaryPhotoId(firstPhoto.id);
      }
      return updated;
    });
  };

  // Ajout direct et spécifique d'une photo définie d'emblée comme illustration par défaut
  const handlePrimaryPhotoAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (JPEG, PNG, WebP) pour l\'illustration.');
      return;
    }

    const id = 'media-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
    const newDraft: UploadedMediaDraft = {
      id,
      name: file.name,
      size: file.size,
      mimeType: file.type || 'image/jpeg',
      category: 'photo',
      file,
      blob: file,
      previewUrl: URL.createObjectURL(file),
      isExisting: false,
    };

    setMediaDrafts((prev) => [newDraft, ...prev]);
    setPrimaryPhotoId(id);
    setErrorMsg(null);
  };

  const handleRemoveMedia = (draftId: string) => {
    setMediaDrafts((prev) => prev.filter((m) => m.id !== draftId));
    if (primaryPhotoId === draftId) {
      const nextPhoto = mediaDrafts.find((m) => m.id !== draftId && (m.category === 'photo' || m.mimeType.startsWith('image/')));
      setPrimaryPhotoId(nextPhoto?.id);
    }
  };

  const handleAddTag = (tagToAdd?: string) => {
    const raw = typeof tagToAdd === 'string' ? tagToAdd : tagInput;
    if (!raw.trim()) return;
    const clean = raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    if (typeof tagToAdd !== 'string') {
      setTagInput('');
    }
  };

  const handleRemoveTag = (tToRemove: string) => {
    setTags(tags.filter((t) => t !== tToRemove));
  };

  const handleAddWarrantyYears = (years: number) => {
    const baseDate = purchaseDate ? new Date(purchaseDate) : new Date();
    baseDate.setFullYear(baseDate.getFullYear() + years);
    setWarrantyEndDate(baseDate.toISOString().slice(0, 10));
  };

  // Enregistrement final
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Veuillez indiquer au minimum un nom pour l\'objet.');
      setActiveTab('general');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const itemId = itemToEdit?.id || 'item-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();

      // 1. Sauvegarder les nouveaux médias dans IndexedDB (localforage)
      const finalMediaIds: string[] = [];

      for (const draft of mediaDrafts) {
        finalMediaIds.push(draft.id);
        if (!draft.isExisting && (draft.file || draft.blob)) {
          const blobToSave = draft.file || draft.blob!;
          await saveMediaFile(
            {
              id: draft.id,
              itemId,
              name: draft.name,
              size: draft.size,
              mimeType: draft.mimeType,
              category: draft.category,
              createdAt: new Date().toISOString(),
            },
            blobToSave
          );
        }
      }

      // Si l'objet existait déjà, supprimer les médias qui ont été retirés du brouillon
      if (itemToEdit && itemToEdit.mediaIds) {
        const removedMediaIds = itemToEdit.mediaIds.filter((id) => !finalMediaIds.includes(id));
        for (const rId of removedMediaIds) {
          await deleteMedia(rId);
        }
      }

      // 2. Construire l'objet InventoryItem
      const resolvedCategory = category === '__custom__' ? (customCategory.trim() || 'Autres') : category;

      const finalItem: InventoryItem = {
        id: itemId,
        name: name.trim(),
        category: resolvedCategory,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        location: {
          residence: residence.trim() || 'Résidence Principale',
          room: room.trim() || 'Non spécifiée',
          furniture: furniture.trim() || 'Emplacement libre',
          subLocation: subLocation.trim() || 'Standard',
        },
        purchaseDate: purchaseDate || undefined,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        currency: currency || 'EUR',
        warrantyEndDate: warrantyEndDate || undefined,
        condition,
        status,
        salePrice: status === 'en_vente' && salePrice ? Number(salePrice) : undefined,
        saleNotes: status === 'en_vente' ? saleNotes.trim() : undefined,
        manualUrl: manualUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        tags,
        relations: relations,
        mediaIds: finalMediaIds,
        primaryPhotoId: (() => {
          if (primaryPhotoId && finalMediaIds.includes(primaryPhotoId)) {
            return primaryPhotoId;
          }
          const firstPhoto = mediaDrafts.find(
            (m) => finalMediaIds.includes(m.id) && (m.category === 'photo' || m.mimeType.startsWith('image/'))
          );
          return firstPhoto?.id;
        })(),
        createdAt: itemToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: status === 'archive' ? (itemToEdit?.archivedAt || new Date().toISOString()) : undefined,
      };

      // 3. Sauvegarder dans IndexedDB
      await saveItem(finalItem);
      await refreshInventory();

      onSaved?.(finalItem);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erreur lors de la sauvegarde : ' + (err?.message || 'Erreur inconnue'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-3xl bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-[#fbfbfd] dark:bg-[#18181b]">
            <div>
              <h2 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {itemToEdit ? `Modifier « ${itemToEdit.name} »` : 'Ajouter un objet à l\'inventaire'}
              </h2>
              <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-0.5">
                Renseignez les détails, l'arborescence de stockage et téléversez vos photos/factures
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Onglets style Apple Sheet */}
          <div className="flex border-b border-black/[0.06] dark:border-white/[0.08] bg-[#f5f5f7] dark:bg-[#141416] px-4 overflow-x-auto scrollbar-none">
            {[
              { id: 'general', label: '1. Informations', icon: Tag },
              { id: 'location', label: '2. Emplacement', icon: MapPin },
              { id: 'financial', label: '3. Prix & Garantie', icon: DollarSign },
              { id: 'media', label: `4. Médias (${mediaDrafts.length})`, icon: ImageIcon },
              { id: 'relations', label: `5. Boîtes & Accessoires (${relations.length})`, icon: Layers },
              { id: 'notes', label: '6. Documentation', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'border-[#0071e3] text-[#0071e3] dark:text-[#0a84ff] bg-white dark:bg-[#1c1c1e]'
                      : 'border-transparent text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ONGLET 1 : INFORMATIONS GÉNÉRALES */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Nom de l'objet <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: MacBook Pro 16 M3, Boîtier Sony Alpha 7 IV, Perceuse sans fil..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#121214] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                      Catégorie
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#121214] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer"
                    >
                      {settings?.categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__">+ Ajouter une catégorie personnalisée</option>
                    </select>

                    {category === '__custom__' && (
                      <input
                        type="text"
                        placeholder="Nom de la nouvelle catégorie..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="mt-2 w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#121214] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#0071e3]/40 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                      État matériel
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as ItemCondition)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#121214] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer"
                    >
                      <option value="neuf">Neuf (jamais utilisé / sous blister)</option>
                      <option value="tres_bon_etat">Très bon état (impeccable)</option>
                      <option value="bon_etat">Bon état (traces minimes d'usure)</option>
                      <option value="satisfaisant">Satisfaisant (fonctionnel avec rayures)</option>
                      <option value="pour_pieces">Pour pièces / Hors d'usage</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                      Marque
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Ex: Apple, Sony, Dyson..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#121214] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                      Modèle
                    </label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Ex: A2992, ILCE-7M4..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#121214] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                      Numéro de série (S/N)
                    </label>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="Ex: C02G9012MD6T..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#121214] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 font-mono"
                    />
                  </div>
                </div>

                {/* Statut & Vente */}
                <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.06] space-y-3">
                  <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                    Statut de l'objet
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'actif', label: 'Inventaire Actif' },
                      { id: 'en_vente', label: '🏷️ En Vente' },
                      { id: 'vendu', label: 'Vendu' },
                    ].map((st) => (
                      <button
                        type="button"
                        key={st.id}
                        onClick={() => setStatus(st.id as ItemStatus)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          status === st.id
                            ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                            : 'bg-[#f5f5f7] dark:bg-white/[0.06] text-[#1d1d1f] dark:text-[#f5f5f7] border-black/[0.06] dark:border-white/[0.08] hover:bg-[#ebebee] dark:hover:bg-white/[0.1]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {status === 'en_vente' && (
                    <div className="p-4 rounded-2xl bg-amber-500/[0.08] dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-800/40 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-amber-900 dark:text-amber-300 block mb-1">
                            Prix de vente souhaité (€)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            placeholder="Ex: 250"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-amber-500/30 dark:border-amber-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-amber-900 dark:text-amber-300 block mb-1">
                            Notes d'annonce (Leboncoin, Vinted...)
                          </label>
                          <input
                            type="text"
                            value={saleNotes}
                            onChange={(e) => setSaleNotes(e.target.value)}
                            placeholder="Ex: En boîte d'origine, remise en main propre..."
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-amber-500/30 dark:border-amber-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Étiquettes & Mots-clés transversaux */}
                <div className="pt-3 border-t border-black/[0.05] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-[#0071e3]" />
                      <span>Étiquettes transversales (Tags)</span>
                    </label>
                    <span className="text-[10px] text-[#86868b]">
                      Améliore la recherche et la catégorisation croisée
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Ajouter une étiquette (ex: gaming, nomade, photo)..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#636366] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag()}
                      className="px-3.5 py-2 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] hover:bg-[#ebebee] dark:hover:bg-[#2c2c30] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-medium border border-black/[0.08] dark:border-white/[0.1] cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>

                  {/* Tags attachés à l'objet */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-[#0071e3]/10 text-[#0071e3] font-medium border border-[#0071e3]/20"
                        >
                          <span>#{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="text-[#0071e3]/70 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggestions en un clic issues des autres objets */}
                  {allTags.length > 0 && (
                    <div className="pt-1.5">
                      <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1">
                        Étiquettes existantes (cliquer pour ajouter) :
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {allTags
                          .filter((t) => !tags.includes(t.name))
                          .slice(0, 16)
                          .map(({ name, count }) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => handleAddTag(name)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] bg-black/[0.04] hover:bg-[#0071e3]/10 hover:text-[#0071e3] text-[#555558] transition cursor-pointer"
                            >
                              <span>+{name}</span>
                              <span className="text-[9px] text-[#86868b]">({count})</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ONGLET 2 : EMPLACEMENT DE STOCKAGE (POUPÉES RUSSES) */}
            {activeTab === 'location' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#0071e3]/[0.06] border border-[#0071e3]/15 text-xs text-[#0071e3] flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>
                    Système de localisation en poupées russes : <strong>Résidence → Pièce → Meuble → Sous-emplacement / Tiroir</strong>
                  </span>
                </div>

                {/* Niveau 1 : Résidence */}
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Niveau 1 : Résidence / Bâtiment <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={residence}
                      onChange={(e) => setResidence(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer"
                    >
                      {existingSuggestions.residences.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Ou nouvelle résidence..."
                      value={residence}
                      onChange={(e) => setResidence(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#636366] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                    />
                  </div>
                </div>

                {/* Niveau 2 : Pièce */}
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Niveau 2 : Pièce
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Ex: Bureau, Salon, Chambre parents, Garage, Grenier..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#636366] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                  />
                  {existingSuggestions.rooms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93] mr-1">Suggestions :</span>
                      {existingSuggestions.rooms.slice(0, 6).map((rm) => (
                        <button
                          type="button"
                          key={rm}
                          onClick={() => setRoom(rm)}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#0071e3]/10 hover:text-[#0071e3] transition cursor-pointer"
                        >
                          {rm}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Niveau 3 : Meuble */}
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Niveau 3 : Meuble / Support
                  </label>
                  <input
                    type="text"
                    value={furniture}
                    onChange={(e) => setFurniture(e.target.value)}
                    placeholder="Ex: Armoire vitrée, Bureau d'angle, Étagère métallique Nord..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#636366] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                  />
                  {existingSuggestions.furnitures.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93] mr-1">Suggestions :</span>
                      {existingSuggestions.furnitures.slice(0, 6).map((fn) => (
                        <button
                          type="button"
                          key={fn}
                          onClick={() => setFurniture(fn)}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#0071e3]/10 hover:text-[#0071e3] transition cursor-pointer"
                        >
                          {fn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Niveau 4 : Sous-emplacement / Tiroir */}
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Niveau 4 : Sous-emplacement précis (Tiroir, Boîte, Étagère)
                  </label>
                  <input
                    type="text"
                    value={subLocation}
                    onChange={(e) => setSubLocation(e.target.value)}
                    placeholder="Ex: Tiroir du haut, Carton #4, Boîte anti-humidité, Casier 2..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 font-mono text-[#0071e3] dark:text-[#0a84ff]"
                  />
                </div>
              </div>
            )}

            {/* ONGLET 3 : PRIX & GARANTIE */}
            {activeTab === 'financial' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                      Prix d'achat TTC
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-3.5 pr-14 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#636366] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 font-semibold"
                      />
                      <span className="absolute right-3.5 text-xs font-semibold text-[#86868b] dark:text-[#8e8e93]">
                        {currency}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                      Devise
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="CHF">CHF (CHF)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Date d'acquisition / d'achat
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Date de fin de garantie</span>
                    </label>

                    {/* Boutons rapides pour la garantie */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93]">Ajouter :</span>
                      <button
                        type="button"
                        onClick={() => handleAddWarrantyYears(1)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.08] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#0071e3]/10 hover:text-[#0071e3] transition cursor-pointer"
                      >
                        +1 an
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddWarrantyYears(2)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.08] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#0071e3]/10 hover:text-[#0071e3] transition cursor-pointer font-medium"
                      >
                        +2 ans (légal)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddWarrantyYears(5)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.08] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#0071e3]/10 hover:text-[#0071e3] transition cursor-pointer"
                      >
                        +5 ans
                      </button>
                    </div>
                  </div>

                  <input
                    type="date"
                    value={warrantyEndDate}
                    onChange={(e) => setWarrantyEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:bg-white dark:focus:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* ONGLET 4 : MÉDIAS, PHOTOS & FACTURES PDF */}
            {activeTab === 'media' && (
              <div className="space-y-5">
                {/* 1. SECTION SPÉCIFIQUE : PHOTO D'ILLUSTRATION PAR DÉFAUT */}
                {(() => {
                  const primaryPhotoDraft = mediaDrafts.find(
                    (m) => m.id === primaryPhotoId && (m.category === 'photo' || m.mimeType.startsWith('image/'))
                  );

                  return (
                    <div className="p-4 rounded-3xl bg-gradient-to-b from-[#fbfbfd] to-[#f5f5f7] border border-black/[0.08] shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center shrink-0">
                            <Camera className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                              <span>Photo d'illustration principale</span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800">
                                Vignette par défaut
                              </span>
                            </h4>
                            <p className="text-[11px] text-[#86868b]">
                              Image de référence affichée sur la fiche et dans toutes les listes de l'inventaire.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => primaryFileInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{primaryPhotoDraft ? 'Remplacer illustration' : 'Ajouter photo par défaut'}</span>
                        </button>
                        <input
                          ref={primaryFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePrimaryPhotoAdded(e.target.files)}
                          className="hidden"
                        />
                      </div>

                      {/* Aperçu de la photo d'illustration active */}
                      {primaryPhotoDraft ? (
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-[#0071e3]/30 dark:border-[#0a84ff]/40 shadow-2xs flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-16 h-16 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center relative">
                              {primaryPhotoDraft.previewUrl ? (
                                <img
                                  src={primaryPhotoDraft.previewUrl}
                                  alt={primaryPhotoDraft.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-[#86868b]" />
                              )}
                              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                                <Star className="w-2.5 h-2.5 fill-current" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-600 dark:text-amber-400" />
                                Illustration par défaut active
                              </span>
                              <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block truncate mt-1">
                                {primaryPhotoDraft.name}
                              </span>
                              <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93]">
                                {(primaryPhotoDraft.size / 1024).toFixed(0)} Ko • Image
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => primaryFileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#ebebee] dark:hover:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-medium transition cursor-pointer"
                            >
                              Changer
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrimaryPhotoId(undefined)}
                              className="p-1.5 rounded-xl text-[#86868b] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                              title="Désélectionner comme illustration"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => primaryFileInputRef.current?.click()}
                          className="p-4 rounded-2xl border border-dashed border-black/[0.12] dark:border-white/[0.15] hover:border-[#0071e3]/50 dark:hover:border-[#0a84ff]/50 bg-white/70 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 group"
                        >
                          <Camera className="w-6 h-6 text-[#86868b] group-hover:text-[#0071e3] dark:group-hover:text-[#0a84ff] transition-colors" />
                          <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                            Aucune photo d'illustration définie
                          </span>
                          <span className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                            Cliquez ici pour sélectionner une photo dédiée qui servira d'illustration par défaut
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 2. SECTION PHOTOS SECONDAIRES & FACTURES */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1d1d1f] block">
                      Toutes les photos & documents ({mediaDrafts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-[#0071e3] hover:underline font-medium cursor-pointer"
                    >
                      + Ajouter des fichiers
                    </button>
                  </div>

                  {/* Zone de Drag and Drop générale */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFilesAdded(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#0071e3] bg-[#0071e3]/[0.05]'
                        : 'border-black/[0.1] dark:border-white/[0.12] hover:border-[#0071e3]/50 bg-[#fbfbfd] dark:bg-white/[0.02]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFilesAdded(e.target.files)}
                      className="hidden"
                    />
                    <div className="w-9 h-9 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center mx-auto mb-1.5">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      Glissez d'autres photos ou factures PDF ici
                    </p>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mt-0.5">
                      ou <span className="text-[#0071e3] dark:text-[#0a84ff] font-medium underline">parcourez vos fichiers</span> (JPEG, PNG, WebP, PDF)
                    </p>
                  </div>

                  {/* Liste des médias ajoutés avec bouton "Définir par défaut" */}
                  {mediaDrafts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {mediaDrafts.map((draft) => {
                        const isPrimary = primaryPhotoId === draft.id;
                        const isPdf = draft.mimeType === 'application/pdf';

                        return (
                          <div
                            key={draft.id}
                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              isPrimary
                                ? 'bg-[#0071e3]/[0.05] dark:bg-[#0a84ff]/10 border-[#0071e3]/40 dark:border-[#0a84ff]/40 ring-1 ring-[#0071e3]/20 shadow-2xs'
                                : 'bg-[#fbfbfd] dark:bg-[#202023] border-black/[0.06] dark:border-white/[0.08] hover:bg-white dark:hover:bg-[#26262a]'
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              {/* Miniature ou icône PDF */}
                              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0 relative">
                                {draft.previewUrl ? (
                                  <img
                                    src={draft.previewUrl}
                                    alt={draft.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : isPdf ? (
                                  <FileText className="w-6 h-6 text-rose-500" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-[#86868b] dark:text-[#8e8e93]" />
                                )}
                                {isPrimary && (
                                  <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                                    <Star className="w-2 h-2 fill-current" />
                                  </div>
                                )}
                              </div>

                              <div className="truncate">
                                <span className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] block truncate">
                                  {draft.name}
                                </span>
                                <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93]">
                                  {(draft.size / 1024).toFixed(0)} Ko •{' '}
                                  {draft.category === 'invoice' ? 'Facture' : 'Photo'}
                                </span>
                              </div>
                            </div>

                            {/* Actions sur le média */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {!isPdf && (
                                isPrimary ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#0071e3] text-white text-[11px] font-semibold shadow-xs">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>Par défaut</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setPrimaryPhotoId(draft.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#0071e3]/10 dark:hover:bg-[#0a84ff]/20 text-[#555558] dark:text-[#a1a1a6] hover:text-[#0071e3] dark:hover:text-[#0a84ff] text-[11px] font-medium transition cursor-pointer"
                                    title="Définir comme illustration par défaut de cet objet"
                                  >
                                    <Star className="w-3 h-3 text-amber-500" />
                                    <span>Par défaut</span>
                                  </button>
                                )
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveMedia(draft.id)}
                                className="p-1.5 rounded-lg text-[#86868b] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Supprimer ce fichier"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ONGLET 5 : LIAISONS (ACCESSOIRES & EMBALLAGES) */}
            {activeTab === 'relations' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-[#0071e3]/[0.06] border border-[#0071e3]/15 text-xs text-[#0071e3] flex items-center gap-2.5">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>
                    Associez les <strong>accessoires</strong> (câbles, batteries) ou la <strong>boîte d'origine</strong> à cet objet. 
                    Vous pouvez indiquer un emplacement différent pour l'emballage (ex: carton stocké au grenier ou à la cave).
                  </span>
                </div>

                {/* Liste des liaisons enregistrées */}
                {relations.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold text-[#1d1d1f] block">
                      Liaisons rattachées ({relations.length}) :
                    </span>

                    <div className="space-y-2">
                      {relations.map((rel) => (
                        <div
                          key={rel.id}
                          className="p-3.5 rounded-2xl bg-[#fbfbfd] border border-black/[0.06] flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  rel.type === 'packaging'
                                    ? 'bg-amber-500/10 text-amber-700'
                                    : rel.type === 'accessory'
                                    ? 'bg-blue-500/10 text-blue-700'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {rel.type === 'packaging' ? '📦 Boîte / Emballage' : rel.type === 'accessory' ? '🔌 Accessoire' : '⚙️ Pièce'}
                              </span>
                              <span className="font-bold text-[#1d1d1f] text-xs">{rel.label}</span>
                            </div>

                            <div className="text-[11px] text-[#555558] pl-1">
                              {rel.customLocation ? (
                                <span className="text-[#0071e3] font-medium">
                                  📍 Emplacement dédié : {rel.customLocation.residence} → {rel.customLocation.room} → {rel.customLocation.furniture} ({rel.customLocation.subLocation})
                                </span>
                              ) : (
                                <span className="text-[#86868b]">
                                  📍 Même emplacement que l'objet principal
                                </span>
                              )}
                            </div>

                            {rel.notes && (
                              <p className="text-[10px] text-[#86868b] italic pl-1">« {rel.notes} »</p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setRelations(relations.filter((r) => r.id !== rel.id))}
                            className="p-1.5 rounded-lg text-[#86868b] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Supprimer cette liaison"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formulaire d'ajout d'une nouvelle liaison */}
                <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] space-y-3.5">
                  <span className="text-xs font-semibold text-[#1d1d1f] block">
                    Ajouter une liaison (accessoire ou emballage)
                  </span>

                  {/* Type de liaison */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'packaging', label: '📦 Boîte / Emballage' },
                      { type: 'accessory', label: '🔌 Accessoire' },
                      { type: 'part', label: '⚙️ Pièce' },
                    ].map((t) => (
                      <button
                        type="button"
                        key={t.type}
                        onClick={() => {
                          setNewRelType(t.type as any);
                          // Pour les emballages, cocher par défaut l'emplacement dédié
                          if (t.type === 'packaging') {
                            setNewRelIsCustomLocation(true);
                            if (!newRelRoom) setNewRelRoom('Grenier');
                            if (!newRelFurniture) setNewRelFurniture('Étagère emballages');
                            if (!newRelSubLocation) setNewRelSubLocation('Carton #1');
                          }
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition cursor-pointer text-center ${
                          newRelType === t.type
                            ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                            : 'bg-white dark:bg-[#252528] text-[#1d1d1f] dark:text-[#f5f5f7] border-black/[0.06] dark:border-white/[0.08] hover:bg-[#ebebee] dark:hover:bg-[#2c2c2e]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Nom / Libellé */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                      Nom de la liaison / description
                    </label>
                    <input
                      type="text"
                      value={newRelLabel}
                      onChange={(e) => setNewRelLabel(e.target.value)}
                      placeholder={
                        newRelType === 'packaging'
                          ? 'Ex: Boîte d\'origine complète avec cales et livrets...'
                          : 'Ex: Câble USB-C MagSafe, Télécommande, Batterie supplémentaire...'
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#252528] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                    />
                  </div>

                  {/* Option Emplacement personnalisé vs même endroit */}
                  <div className="space-y-2 pt-1 border-t border-black/[0.05] dark:border-white/[0.08]">
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="relLocationChoice"
                          checked={!newRelIsCustomLocation}
                          onChange={() => setNewRelIsCustomLocation(false)}
                          className="text-[#0071e3] focus:ring-[#0071e3]"
                        />
                        <span className="text-[#1d1d1f] dark:text-[#f5f5f7]">Au même endroit que l'objet principal</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="relLocationChoice"
                          checked={newRelIsCustomLocation}
                          onChange={() => setNewRelIsCustomLocation(true)}
                          className="text-[#0071e3] focus:ring-[#0071e3]"
                        />
                        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Localisé ailleurs (Grenier, Cave...)</span>
                      </label>
                    </div>

                    {/* Champs d'emplacement dédié */}
                    {newRelIsCustomLocation && (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#252528] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                        <span className="text-[11px] font-semibold text-[#0071e3] dark:text-[#0a84ff] block">
                          📍 Emplacement dédié de cet emballage / accessoire :
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93] block mb-0.5">Pièce / Espace</span>
                            <input
                              type="text"
                              value={newRelRoom}
                              onChange={(e) => setNewRelRoom(e.target.value)}
                              placeholder="Ex: Grenier, Cave, Garage, Dressing..."
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#f5f5f7] dark:bg-[#1e1e20] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08] focus:bg-white dark:focus:bg-[#252528] focus:outline-none"
                            />
                          </div>

                          <div>
                            <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93] block mb-0.5">Meuble / Rayonnage</span>
                            <input
                              type="text"
                              value={newRelFurniture}
                              onChange={(e) => setNewRelFurniture(e.target.value)}
                              placeholder="Ex: Étagère métallique Nord, Rayonnage A..."
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#f5f5f7] dark:bg-[#1e1e20] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08] focus:bg-white dark:focus:bg-[#252528] focus:outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93] block mb-0.5">Sous-emplacement / Carton / Tiroir</span>
                            <input
                              type="text"
                              value={newRelSubLocation}
                              onChange={(e) => setNewRelSubLocation(e.target.value)}
                              placeholder="Ex: Carton #4 'Emballages Hi-Tech', Boîte plastique #2..."
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#f5f5f7] dark:bg-[#1e1e20] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08] focus:bg-white dark:focus:bg-[#252528] focus:outline-none font-mono text-[#0071e3] dark:text-[#0a84ff]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bouton d'ajout */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!newRelLabel.trim()}
                      onClick={() => {
                        const newRel: ItemRelation = {
                          id: 'rel-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
                          type: newRelType,
                          label: newRelLabel.trim(),
                          customLocation: newRelIsCustomLocation
                            ? {
                                residence: newRelResidence.trim() || residence || 'Résidence Principale',
                                room: newRelRoom.trim() || 'Grenier',
                                furniture: newRelFurniture.trim() || 'Étagère',
                                subLocation: newRelSubLocation.trim() || 'Carton #1',
                              }
                            : undefined,
                          notes: newRelNotes.trim() || undefined,
                        };
                        setRelations([...relations, newRel]);
                        setNewRelLabel('');
                        setNewRelNotes('');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter cette liaison</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 6 : DOCUMENTATION, NOTICE & NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Lien externe vers la notice constructeur (URL)
                  </label>
                  <div className="relative flex items-center">
                    <ExternalLink className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93] absolute left-3.5 pointer-events-none" />
                    <input
                      type="url"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder="https://support.apple.com/... ou https://notice.fr/..."
                      className="w-full pl-9.5 pr-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] focus:bg-white dark:focus:bg-[#2c2c2e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Mots-clés / Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Ajouter un tag (ex: photo, pro, voyage)..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] focus:bg-white dark:focus:bg-[#2c2c2e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag()}
                      className="px-3.5 py-2 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] hover:bg-[#ebebee] dark:hover:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-medium border border-black/[0.08] dark:border-white/[0.1] cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-[#f5f5f7] dark:bg-[#252528] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08]"
                        >
                          <span>#{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="text-[#86868b] dark:text-[#8e8e93] hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Notes libres, historique d'entretien & remarques
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Remarques particulières, état de la batterie, date de révision, historique..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#252528] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] focus:bg-white dark:focus:bg-[#2c2c2e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 leading-relaxed"
                  />
                </div>
              </div>
            )}

          </form>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#fbfbfd] dark:bg-[#18181b] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition cursor-pointer"
              >
                Annuler
              </button>

              {itemToEdit && (
                <button
                  type="button"
                  onClick={() => {
                    requestConfirmation({
                      title: 'Supprimer cet objet ?',
                      message: `Êtes-vous certain de vouloir supprimer définitivement « ${itemToEdit.name} » ? Cette action est irréversible et effacera toutes ses photos et factures stockées.`,
                      confirmLabel: 'Supprimer définitivement',
                      cancelLabel: 'Annuler',
                      isDestructive: true,
                      icon: 'trash',
                      onConfirm: async () => {
                        await deleteItemById(itemToEdit.id);
                        onClose();
                      },
                    });
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-900/40 transition flex items-center gap-1 cursor-pointer"
                  title="Supprimer définitivement cet objet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeTab !== 'general' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: ('general' | 'location' | 'financial' | 'media' | 'relations' | 'notes')[] = [
                      'general',
                      'location',
                      'financial',
                      'media',
                      'relations',
                      'notes',
                    ];
                    const idx = tabs.indexOf(activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1]);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-[#f5f5f7] dark:bg-white/[0.08] text-[#555558] dark:text-[#f5f5f7] hover:bg-[#ebebee] dark:hover:bg-white/[0.12] transition cursor-pointer"
                >
                  Précédent
                </button>
              )}

              {activeTab !== 'notes' ? (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: ('general' | 'location' | 'financial' | 'media' | 'relations' | 'notes')[] = [
                      'general',
                      'location',
                      'financial',
                      'media',
                      'relations',
                      'notes',
                    ];
                    const idx = tabs.indexOf(activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.09] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-[#f5f5f7] transition cursor-pointer flex items-center gap-1"
                >
                  <span>Suivant</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !name.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{itemToEdit ? 'Enregistrer les modifications' : 'Créer la fiche objet'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
