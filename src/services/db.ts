import localforage from 'localforage';
import { AppSettings, InventoryItem, MediaCategory, MediaItem } from '../types/inventory';

// Configuration des instances localforage pour IndexedDB
export const itemsStore = localforage.createInstance({
  name: 'InventairePriveDB',
  storeName: 'items',
  description: 'Stockage des métadonnées des objets',
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
});

export const mediaStore = localforage.createInstance({
  name: 'InventairePriveDB',
  storeName: 'media',
  description: 'Stockage binaire des photos, factures et notices',
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
});

export const settingsStore = localforage.createInstance({
  name: 'InventairePriveDB',
  storeName: 'settings',
  description: 'Préférences et paramètres globaux',
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
});

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'EUR',
  residences: ['Résidence Principale', 'Maison de Campagne'],
  categories: [
    'Informatique & Périphériques',
    'Audio, Vidéo & Photo',
    'Téléphonie & Tablettes',
    'Gaming & Consoles',
    'Bricolage & Outillage',
    'Électroménager',
    'Mobilier & Décoration',
    'Mode & Accessoires',
    'Livres & Médias',
    'Sports & Loisirs',
    'Véhicules & Mobilité',
    'Autres'
  ],
  version: '1.0.0',
};

// ==========================================
// UTILITAIRES CONVERSION BLOB <-> BASE64
// ==========================================

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Erreur lors de la conversion du Blob en Base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(base64Data: string, fallbackMimeType = 'application/octet-stream'): Blob {
  try {
    let mimeType = fallbackMimeType;
    let byteCharacters = '';

    if (base64Data.startsWith('data:')) {
      const parts = base64Data.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) {
        mimeType = match[1];
      }
      byteCharacters = atob(parts[1]);
    } else {
      byteCharacters = atob(base64Data);
    }

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (err) {
    console.error('Erreur conversion Base64 vers Blob:', err);
    return new Blob([], { type: fallbackMimeType });
  }
}

// ==========================================
// GESTION DES OBJETS (ITEMS)
// ==========================================

export async function getAllItems(): Promise<InventoryItem[]> {
  try {
    const items: InventoryItem[] = [];
    await itemsStore.iterate<InventoryItem, void>((value) => {
      if (value && value.id) {
        items.push(value);
      }
    });
    // Tri par date de modification ou création décroissante
    return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error('Erreur getAllItems:', error);
    return [];
  }
}

export async function getItemById(id: string): Promise<InventoryItem | null> {
  try {
    const item = await itemsStore.getItem<InventoryItem>(id);
    return item || null;
  } catch (error) {
    console.error(`Erreur getItemById(${id}):`, error);
    return null;
  }
}

export async function saveItem(item: InventoryItem): Promise<InventoryItem> {
  const now = new Date().toISOString();
  const updatedItem: InventoryItem = {
    ...item,
    updatedAt: now,
    createdAt: item.createdAt || now,
  };
  await itemsStore.setItem(updatedItem.id, updatedItem);
  return updatedItem;
}

export async function bulkSaveItems(items: InventoryItem[]): Promise<void> {
  for (const item of items) {
    await itemsStore.setItem(item.id, item);
  }
}

export async function deleteItem(id: string): Promise<void> {
  try {
    // 1. Récupérer l'objet pour trouver ses médias associés
    const item = await getItemById(id);
    if (item && item.mediaIds && Array.isArray(item.mediaIds)) {
      for (const mediaId of item.mediaIds) {
        try {
          await mediaStore.removeItem(mediaId);
        } catch (e) {
          console.warn(`Erreur suppression media ${mediaId}:`, e);
        }
      }
    }

    // 2. Supprimer aussi d'éventuels médias associés orphelins liés à cet ID d'objet
    try {
      await mediaStore.iterate<StoredMediaPayload, void>((value, key) => {
        if (value && value.itemId === id) {
          mediaStore.removeItem(key).catch(() => {});
        }
      });
    } catch (e) {
      console.warn('Erreur nettoyage médias orphelins:', e);
    }

    // 3. Supprimer définitivement l'objet du store
    await itemsStore.removeItem(id);
  } catch (err) {
    console.error(`Erreur deleteItem(${id}):`, err);
    // Tenter de supprimer la clé d'objet quoi qu'il arrive
    try {
      await itemsStore.removeItem(id);
    } catch {}
    throw err;
  }
}

export async function archiveItem(id: string): Promise<InventoryItem | null> {
  const item = await getItemById(id);
  if (!item) return null;
  const archived: InventoryItem = {
    ...item,
    status: 'archive',
    archivedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await itemsStore.setItem(id, archived);
  return archived;
}

// ==========================================
// GESTION DES MÉDIAS (PHOTOS / FACTURES / PDF)
// ==========================================

interface StoredMediaPayload {
  id: string;
  itemId: string;
  name: string;
  size: number;
  mimeType: string;
  category: MediaCategory;
  blob: Blob;
  createdAt: string;
}

export async function saveMediaFile(
  mediaMeta: Omit<MediaItem, 'blob' | 'base64Data'>,
  fileOrBlob: Blob
): Promise<MediaItem> {
  const payload: StoredMediaPayload = {
    id: mediaMeta.id,
    itemId: mediaMeta.itemId,
    name: mediaMeta.name,
    size: fileOrBlob.size,
    mimeType: fileOrBlob.type || mediaMeta.mimeType,
    category: mediaMeta.category,
    blob: fileOrBlob,
    createdAt: mediaMeta.createdAt || new Date().toISOString(),
  };

  await mediaStore.setItem(mediaMeta.id, payload);

  return {
    ...mediaMeta,
    size: payload.size,
    mimeType: payload.mimeType,
    blob: fileOrBlob,
    createdAt: payload.createdAt,
  };
}

export async function getMediaById(id: string): Promise<MediaItem | null> {
  try {
    const raw = await mediaStore.getItem<StoredMediaPayload>(id);
    if (!raw) return null;
    return {
      id: raw.id,
      itemId: raw.itemId,
      name: raw.name,
      size: raw.size,
      mimeType: raw.mimeType,
      category: raw.category,
      blob: raw.blob,
      createdAt: raw.createdAt,
    };
  } catch (error) {
    console.error(`Erreur getMediaById(${id}):`, error);
    return null;
  }
}

export async function getMediaUrl(id: string): Promise<string | null> {
  const media = await getMediaById(id);
  if (!media || !media.blob) return null;
  return URL.createObjectURL(media.blob);
}

export async function deleteMedia(id: string): Promise<void> {
  await mediaStore.removeItem(id);
}

export async function getAllMedia(): Promise<MediaItem[]> {
  const list: MediaItem[] = [];
  await mediaStore.iterate<StoredMediaPayload, void>((value) => {
    if (value && value.id) {
      list.push({
        id: value.id,
        itemId: value.itemId,
        name: value.name,
        size: value.size,
        mimeType: value.mimeType,
        category: value.category,
        blob: value.blob,
        createdAt: value.createdAt,
      });
    }
  });
  return list;
}

// ==========================================
// GESTION DES PARAMÈTRES
// ==========================================

export async function getSettings(): Promise<AppSettings> {
  try {
    const saved = await settingsStore.getItem<AppSettings>('app_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await settingsStore.setItem('app_settings', updated);
  return updated;
}

// ==========================================
// DIAGNOSTIC ET NETTOYAGE
// ==========================================

export async function getDatabaseStats(): Promise<{
  itemsCount: number;
  mediaCount: number;
  totalSizeApproxBytes: number;
  totalValue: number;
}> {
  const items = await getAllItems();
  const media = await getAllMedia();

  let mediaBytes = 0;
  for (const m of media) {
    mediaBytes += m.size || 0;
  }

  const totalValue = items.reduce((acc, curr) => acc + (curr.purchasePrice || 0), 0);

  return {
    itemsCount: items.length,
    mediaCount: media.length,
    totalSizeApproxBytes: mediaBytes,
    totalValue,
  };
}

export async function clearEntireDatabase(): Promise<void> {
  try {
    // 1. Vider les instances localforage
    await Promise.allSettled([
      itemsStore.clear(),
      mediaStore.clear(),
      settingsStore.clear(),
    ]);

    // 2. Nettoyage de sécurité résiduel clé par clé pour items
    try {
      const itemKeys = await itemsStore.keys();
      for (const k of itemKeys) {
        await itemsStore.removeItem(k).catch(() => {});
      }
    } catch (e) {
      console.warn('Erreur purge itemKeys:', e);
    }

    // 3. Nettoyage de sécurité résiduel clé par clé pour media
    try {
      const mediaKeys = await mediaStore.keys();
      for (const k of mediaKeys) {
        await mediaStore.removeItem(k).catch(() => {});
      }
    } catch (e) {
      console.warn('Erreur purge mediaKeys:', e);
    }

    // 4. Nettoyage de sécurité résiduel clé par clé pour settings
    try {
      const settingsKeys = await settingsStore.keys();
      for (const k of settingsKeys) {
        await settingsStore.removeItem(k).catch(() => {});
      }
    } catch (e) {
      console.warn('Erreur purge settingsKeys:', e);
    }
  } catch (err) {
    console.error('Erreur lors du vidage complet de la base:', err);
    throw err;
  }
}
