import { InventoryItem, ItemCondition, ItemStatus } from '../types/inventory';

export interface CsvExportOptions {
  delimiter?: ';' | ',';
  filename?: string;
  includeArchived?: boolean;
}

const CONDITION_LABELS: Record<ItemCondition, string> = {
  neuf: 'Neuf',
  tres_bon_etat: 'Très bon état',
  bon_etat: 'Bon état',
  satisfaisant: 'Satisfaisant',
  pour_pieces: 'Pour pièces',
};

const STATUS_LABELS: Record<ItemStatus, string> = {
  actif: 'Actif',
  en_vente: 'En vente',
  archive: 'Archivé',
  vendu: 'Vendu',
};

/**
 * Échappe une valeur pour le format CSV standard (RFC 4180).
 * Entoure de guillemets doubles si la valeur contient le séparateur, des guillemets ou des retours à la ligne.
 */
function escapeCsvValue(val: unknown, delimiter: string): string {
  if (val === null || val === undefined) {
    return '';
  }
  let str = String(val).trim();
  // Remplacer les retours à la ligne internes par des espaces pour une lecture fluide dans Excel, ou conserver
  str = str.replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
  
  const needsQuotes = str.includes(delimiter) || str.includes('"') || str.includes('\n');
  if (needsQuotes) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Génère le contenu CSV brut d'une liste d'objets avec en-têtes en français,
 * optimisé pour Microsoft Excel (Windows/macOS) et Google Sheets.
 */
export function generateInventoryCsv(
  items: InventoryItem[],
  options: CsvExportOptions = {}
): string {
  const delimiter = options.delimiter || ';';
  const includeArchived = options.includeArchived ?? true;

  const targetItems = includeArchived
    ? items
    : items.filter((it) => it.status !== 'archive');

  // En-têtes complets des colonnes
  const headers = [
    'ID',
    'Nom de l\'objet',
    'Catégorie',
    'Marque',
    'Modèle',
    'Numéro de série',
    'Résidence',
    'Pièce',
    'Meuble / Rangement',
    'Sous-emplacement',
    'Emplacement complet',
    'Prix d\'achat',
    'Devise',
    'Date d\'achat',
    'Fin de garantie',
    'Garantie active ?',
    'État',
    'Statut',
    'Prix de vente',
    'Notes de vente',
    'Étiquettes (Tags)',
    'Nombre de fichiers joints',
    'Accessoires & Boîtes liés',
    'URL Notice / Manuel',
    'Notes & Remarques',
    'Date d\'ajout',
    'Dernière mise à jour',
  ];

  const today = new Date().toISOString().slice(0, 10);

  const rows = targetItems.map((item) => {
    // Calcul de l'état de garantie
    let warrantyStatus = 'Non spécifiée';
    if (item.warrantyEndDate) {
      warrantyStatus = item.warrantyEndDate >= today ? 'Oui (En cours)' : 'Non (Expirée)';
    }

    // Emplacement complet concaténé
    const locationParts = [
      item.location?.residence,
      item.location?.room,
      item.location?.furniture,
      item.location?.subLocation,
    ].filter(Boolean);
    const fullLocation = locationParts.join(' > ');

    // Résumé des accessoires / boîtes
    const relationsSummary = (item.relations || [])
      .map((r) => `${r.type === 'packaging' ? '[Boîte]' : r.type === 'accessory' ? '[Accessoire]' : '[Pièce]'} ${r.label}`)
      .join(' | ');

    // Étiquettes jointes
    const tagsString = (item.tags || []).join(', ');

    // Formatage des prix adapté aux tableurs
    const formattedPurchasePrice = item.purchasePrice !== undefined
      ? (delimiter === ';' ? String(item.purchasePrice).replace('.', ',') : String(item.purchasePrice))
      : '';

    const formattedSalePrice = item.salePrice !== undefined
      ? (delimiter === ';' ? String(item.salePrice).replace('.', ',') : String(item.salePrice))
      : '';

    const lineValues = [
      item.id,
      item.name || '',
      item.category || '',
      item.brand || '',
      item.model || '',
      item.serialNumber || '',
      item.location?.residence || '',
      item.location?.room || '',
      item.location?.furniture || '',
      item.location?.subLocation || '',
      fullLocation,
      formattedPurchasePrice,
      item.currency || 'EUR',
      item.purchaseDate || '',
      item.warrantyEndDate || '',
      warrantyStatus,
      CONDITION_LABELS[item.condition] || item.condition || '',
      STATUS_LABELS[item.status] || item.status || '',
      formattedSalePrice,
      item.saleNotes || '',
      tagsString,
      String((item.mediaIds || []).length),
      relationsSummary,
      item.manualUrl || '',
      item.notes || '',
      item.createdAt ? item.createdAt.slice(0, 10) : '',
      item.updatedAt ? item.updatedAt.slice(0, 10) : '',
    ];

    return lineValues.map((val) => escapeCsvValue(val, delimiter)).join(delimiter);
  });

  const headerLine = headers.map((h) => escapeCsvValue(h, delimiter)).join(delimiter);

  // Le BOM UTF-8 (\uFEFF) est indispensable pour qu'Excel ouvre automatiquement les caractères accentués en UTF-8
  return '\uFEFF' + [headerLine, ...rows].join('\r\n');
}

/**
 * Génère le fichier CSV et déclenche automatiquement son téléchargement dans le navigateur.
 */
export function downloadInventoryCsv(
  items: InventoryItem[],
  options: CsvExportOptions = {}
): string {
  const csvContent = generateInventoryCsv(items, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const defaultFilename = `inventaire-prive-${dateStr}.csv`;
  const filename = options.filename || defaultFilename;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}
