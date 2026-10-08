import { FullBackupExport } from '../types/inventory';
import {
  base64ToBlob,
  blobToBase64,
  clearEntireDatabase,
  getAllItems,
  getAllMedia,
  getMediaById,
  getSettings,
  itemsStore,
  mediaStore,
  saveSettings,
} from './db';

export interface ImportResult {
  success: boolean;
  itemsCount: number;
  mediaCount: number;
  error?: string;
  timestamp?: string;
}

/**
 * Exporte l'intégralité de la base IndexedDB sous forme d'un objet JSON
 * avec conversion intégrale de TOUS les fichiers/photos/factures/notices binaires en Base64.
 */
export async function generateBackupData(onProgress?: (percent: number, stepText: string) => void): Promise<FullBackupExport> {
  onProgress?.(10, 'Lecture des objets de l\'inventaire...');
  const items = await getAllItems();

  onProgress?.(25, 'Lecture de l\'ensemble des médias et documents...');
  const mediaList: FullBackupExport['media'] = [];

  // Récupérer l'intégralité des médias présents dans le magasin IndexedDB
  const allStoredMedia = await getAllMedia();
  const totalMediaToProcess = allStoredMedia.length;

  let processed = 0;
  for (const media of allStoredMedia) {
    if (media && media.blob) {
      try {
        const base64Data = await blobToBase64(media.blob);
        mediaList.push({
          id: media.id,
          itemId: media.itemId,
          name: media.name,
          size: media.size,
          mimeType: media.mimeType,
          category: media.category,
          base64Data,
          createdAt: media.createdAt,
        });
      } catch (e) {
        console.warn(`Impossible de convertir le média ${media.id} (${media.name}) en Base64:`, e);
      }
    }
    processed++;
    if (totalMediaToProcess > 0) {
      const progressPercent = Math.min(85, Math.round(25 + (processed / totalMediaToProcess) * 60));
      onProgress?.(progressPercent, `Conversion média ${processed}/${totalMediaToProcess} : ${media.name}...`);
    }
  }

  onProgress?.(90, 'Lecture des paramètres et résidences...');
  const settings = await getSettings();

  const totalValue = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);

  const backup: FullBackupExport = {
    app: 'InventairePrive',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    stats: {
      totalItems: items.length,
      totalMedia: mediaList.length,
      totalPurchaseValue: totalValue,
    },
    items,
    media: mediaList,
    settings,
  };

  onProgress?.(100, 'Exportation terminée.');
  return backup;
}

/**
 * Déclenche le téléchargement du fichier JSON de sauvegarde sur la machine de l'utilisateur.
 */
export async function downloadBackupFile(onProgress?: (percent: number, stepText: string) => void): Promise<void> {
  const data = await generateBackupData(onProgress);
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `inventaire-prive-sauvegarde-${dateStr}_${timeStr}.json`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Importe un fichier ou texte JSON de sauvegarde dans IndexedDB.
 * Convertit tous les Base64 en Blobs natifs stockés dans localforage.
 */
export async function importBackupData(
  jsonSource: string | File,
  mode: 'replace' | 'merge' = 'replace',
  onProgress?: (percent: number, stepText: string) => void
): Promise<ImportResult> {
  try {
    let rawText = '';
    if (typeof jsonSource === 'string') {
      rawText = jsonSource;
    } else {
      onProgress?.(10, 'Lecture du fichier...');
      rawText = await jsonSource.text();
    }

    onProgress?.(25, 'Vérification du format de sauvegarde...');
    const parsedData = JSON.parse(rawText) as FullBackupExport;

    // Validation minimale
    if (!parsedData || !Array.isArray(parsedData.items)) {
      throw new Error('Fichier invalide : structure d\'inventaire introuvable.');
    }

    if (parsedData.app !== 'InventairePrive' && !parsedData.version) {
      throw new Error('Fichier de sauvegarde non reconnu (signature d\'application absente).');
    }

    // Réinitialisation si mode "replace"
    if (mode === 'replace') {
      onProgress?.(35, 'Nettoyage des données existantes...');
      await clearEntireDatabase();
    }

    // Restauration des paramètres
    if (parsedData.settings) {
      onProgress?.(45, 'Restauration des paramètres...');
      await saveSettings(parsedData.settings);
    }

    // Restauration des médias binaires
    const mediaToRestore = parsedData.media || [];
    let mediaSuccessCount = 0;

    for (let i = 0; i < mediaToRestore.length; i++) {
      const m = mediaToRestore[i];
      if (m.base64Data) {
        const blob = base64ToBlob(m.base64Data, m.mimeType);
        await mediaStore.setItem(m.id, {
          id: m.id,
          itemId: m.itemId,
          name: m.name,
          size: m.size || blob.size,
          mimeType: m.mimeType || blob.type,
          category: m.category,
          blob,
          createdAt: m.createdAt || new Date().toISOString(),
        });
        mediaSuccessCount++;
      }
      if (mediaToRestore.length > 0) {
        const progress = Math.min(85, Math.round(50 + (i / mediaToRestore.length) * 35));
        onProgress?.(progress, `Restauration média ${i + 1}/${mediaToRestore.length}...`);
      }
    }

    // Restauration des objets
    onProgress?.(90, 'Restauration des fiches d\'inventaire...');
    let itemsSuccessCount = 0;
    for (const item of parsedData.items) {
      await itemsStore.setItem(item.id, item);
      itemsSuccessCount++;
    }

    onProgress?.(100, 'Importation terminée avec succès.');

    return {
      success: true,
      itemsCount: itemsSuccessCount,
      mediaCount: mediaSuccessCount,
      timestamp: parsedData.exportedAt,
    };
  } catch (error: any) {
    console.error('Erreur importBackupData:', error);
    return {
      success: false,
      itemsCount: 0,
      mediaCount: 0,
      error: error?.message || 'Erreur inconnue lors de l\'import.',
    };
  }
}
