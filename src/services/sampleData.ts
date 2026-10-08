import { InventoryItem } from '../types/inventory';
import { saveItem, saveMediaFile } from './db';

// Création d'une image SVG placeholder encodée pour tests de blobs réels
function createSampleSvgBlob(title: string, color: string): Blob {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="${color}"/>
    <circle cx="300" cy="180" r="70" fill="white" opacity="0.2"/>
    <text x="300" y="190" font-family="sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">${title}</text>
    <text x="300" y="240" font-family="sans-serif" font-size="16" fill="white" opacity="0.8" text-anchor="middle">Photo démo Inventaire Privé</text>
  </svg>`;
  return new Blob([svg], { type: 'image/svg+xml' });
}

function createSamplePdfBlob(title: string): Blob {
  // Simule un document texte brut sous type PDF
  const text = `%PDF-1.4\n%Facture démo pour ${title}\nMontant certifié avec TVA et garantie légale.\n%%EOF`;
  return new Blob([text], { type: 'application/pdf' });
}

export async function seedSampleData(): Promise<{ itemsCount: number; mediaCount: number }> {
  // 1. Sony Alpha 7 IV
  const sonyPhotoBlob = createSampleSvgBlob('Sony Alpha 7 IV', '#1e293b');
  const sonyInvoiceBlob = createSamplePdfBlob('Sony Alpha 7 IV');

  const sonyPhotoMeta = await saveMediaFile(
    {
      id: 'media-sony-photo-1',
      itemId: 'item-sony-a7iv',
      name: 'sony-a7iv-face.svg',
      size: sonyPhotoBlob.size,
      mimeType: 'image/svg+xml',
      category: 'photo',
      createdAt: '2025-01-15T10:00:00.000Z',
    },
    sonyPhotoBlob
  );

  const sonyInvoiceMeta = await saveMediaFile(
    {
      id: 'media-sony-facture-1',
      itemId: 'item-sony-a7iv',
      name: 'facture-sony-fnac.pdf',
      size: sonyInvoiceBlob.size,
      mimeType: 'application/pdf',
      category: 'invoice',
      createdAt: '2025-01-15T10:05:00.000Z',
    },
    sonyInvoiceBlob
  );

  const sonyItem: InventoryItem = {
    id: 'item-sony-a7iv',
    name: 'Boîtier Sony Alpha 7 IV + Objectif 28-70mm',
    category: 'Audio, Vidéo & Photo',
    brand: 'Sony',
    model: 'ILCE-7M4K',
    serialNumber: 'SN-482910492',
    location: {
      residence: 'Résidence Principale',
      room: 'Bureau',
      furniture: 'Armoire vitrée',
      subLocation: 'Étagère haute (boîte anti-humidité)',
    },
    purchaseDate: '2024-03-20',
    purchasePrice: 2799,
    currency: 'EUR',
    warrantyEndDate: '2026-03-20',
    condition: 'tres_bon_etat',
    status: 'actif',
    notes: 'Acheté à la Fnac. Capteur nettoyé en décembre. Shutter count < 8000 déclenchements.',
    manualUrl: 'https://helpguide.sony.net/ilc/2110/v1/fr/index.html',
    tags: ['photo', 'plein format', '4k', 'sony'],
    relations: [
      {
        id: 'rel-sony-1',
        type: 'packaging',
        label: 'Boîte d\'origine complète (avec cales et livrets)',
        customLocation: {
          residence: 'Résidence Principale',
          room: 'Grenier',
          furniture: 'Étagère métallique Nord',
          subLocation: 'Carton #4 "Emballages Hi-Tech"',
        },
        notes: 'Contient également la bandoulière d\'origine non déballée.',
      },
      {
        id: 'rel-sony-2',
        type: 'accessory',
        label: 'Batterie supplémentaire Sony NP-FZ100',
        customLocation: {
          residence: 'Résidence Principale',
          room: 'Bureau',
          furniture: 'Bureau d\'angle',
          subLocation: 'Tiroir du milieu',
        },
      },
    ],
    mediaIds: [sonyPhotoMeta.id, sonyInvoiceMeta.id],
    primaryPhotoId: sonyPhotoMeta.id,
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-02-10T14:30:00.000Z',
  };

  // 2. MacBook Pro M3 Pro
  const macPhotoBlob = createSampleSvgBlob('MacBook Pro 16" M3 Pro', '#0f172a');
  const macPhotoMeta = await saveMediaFile(
    {
      id: 'media-mac-photo-1',
      itemId: 'item-macbook-pro',
      name: 'macbook-pro-16.svg',
      size: macPhotoBlob.size,
      mimeType: 'image/svg+xml',
      category: 'photo',
      createdAt: '2024-11-20T12:00:00.000Z',
    },
    macPhotoBlob
  );

  const macItem: InventoryItem = {
    id: 'item-macbook-pro',
    name: 'MacBook Pro 16" Apple Silicon M3 Pro (36 Go / 512 Go)',
    category: 'Informatique & Périphériques',
    brand: 'Apple',
    model: 'A2992 Space Black',
    serialNumber: 'C02G9012MD6T',
    location: {
      residence: 'Résidence Principale',
      room: 'Bureau',
      furniture: 'Bureau d\'angle',
      subLocation: 'Sur le dock Thunderbolt',
    },
    purchaseDate: '2023-11-15',
    purchasePrice: 3299,
    currency: 'EUR',
    warrantyEndDate: '2025-11-15',
    condition: 'neuf',
    status: 'actif',
    notes: 'Protection d\'écran posée dès l\'ouverture. Cycle batterie: 42 cycles.',
    tags: ['informatique', 'apple', 'm3', 'laptop'],
    relations: [
      {
        id: 'rel-mac-1',
        type: 'packaging',
        label: 'Carton d\'emballage Apple original',
        customLocation: {
          residence: 'Résidence Principale',
          room: 'Grenier',
          furniture: 'Étagère métallique Nord',
          subLocation: 'Carton #4 "Emballages Hi-Tech"',
        },
      },
      {
        id: 'rel-mac-2',
        type: 'accessory',
        label: 'Chargeur 140W USB-C MagSafe 3',
        customLocation: {
          residence: 'Résidence Principale',
          room: 'Bureau',
          furniture: 'Bureau d\'angle',
          subLocation: 'Chemin de câbles sous le bureau',
        },
      },
    ],
    mediaIds: [macPhotoMeta.id],
    primaryPhotoId: macPhotoMeta.id,
    createdAt: '2024-11-20T12:00:00.000Z',
    updatedAt: '2025-01-05T09:12:00.000Z',
  };

  // 3. Nintendo Switch OLED (En Vente)
  const switchPhotoBlob = createSampleSvgBlob('Nintendo Switch OLED', '#dc2626');
  const switchPhotoMeta = await saveMediaFile(
    {
      id: 'media-switch-photo-1',
      itemId: 'item-switch-oled',
      name: 'switch-oled-box.svg',
      size: switchPhotoBlob.size,
      mimeType: 'image/svg+xml',
      category: 'photo',
      createdAt: '2024-10-01T08:00:00.000Z',
    },
    switchPhotoBlob
  );

  const switchItem: InventoryItem = {
    id: 'item-switch-oled',
    name: 'Console Nintendo Switch Modèle OLED - Blanc',
    category: 'Gaming & Consoles',
    brand: 'Nintendo',
    model: 'HEG-001',
    serialNumber: 'XTW10048194',
    location: {
      residence: 'Résidence Principale',
      room: 'Salon',
      furniture: 'Meuble TV',
      subLocation: 'Niche gauche',
    },
    purchaseDate: '2022-12-05',
    purchasePrice: 319,
    currency: 'EUR',
    warrantyEndDate: '2024-12-05',
    condition: 'tres_bon_etat',
    status: 'en_vente',
    salePrice: 220,
    saleNotes: 'Annonce rédigée pour Leboncoin / Vinted. Complète avec dock et câbles.',
    notes: 'Verre trempé posé sur l\'écran dès le premier jour.',
    tags: ['jeux-video', 'nintendo', 'oled', 'portable'],
    relations: [
      {
        id: 'rel-switch-1',
        type: 'packaging',
        label: 'Boîte d\'origine avec tous les inserts',
        customLocation: {
          residence: 'Résidence Principale',
          room: 'Salon',
          furniture: 'Buffet bas',
          subLocation: 'Porte droite',
        },
      },
    ],
    mediaIds: [switchPhotoMeta.id],
    primaryPhotoId: switchPhotoMeta.id,
    createdAt: '2024-10-01T08:00:00.000Z',
    updatedAt: '2025-02-18T16:45:00.000Z',
  };

  await saveItem(sonyItem);
  await saveItem(macItem);
  await saveItem(switchItem);

  return {
    itemsCount: 3,
    mediaCount: 4,
  };
}
