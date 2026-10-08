export type ItemCondition = 
  | 'neuf' 
  | 'tres_bon_etat' 
  | 'bon_etat' 
  | 'satisfaisant' 
  | 'pour_pieces';

export type ItemStatus = 
  | 'actif' 
  | 'en_vente' 
  | 'archive' 
  | 'vendu';

export type MediaCategory = 
  | 'photo' 
  | 'invoice' 
  | 'manual' 
  | 'other';

export interface StorageLocation {
  residence: string;       // Poupée russe niveau 1: ex. "Maison Principale", "Appartement Lyon"
  room: string;            // Poupée russe niveau 2: ex. "Bureau", "Salon", "Chambre", "Garage"
  furniture: string;       // Poupée russe niveau 3: ex. "Bureau d'angle", "Armoire IKEA", "Étagère A"
  subLocation: string;     // Poupée russe niveau 4: ex. "Tiroir du haut", "Boîte #3", "Casier 2"
}

export interface ItemRelation {
  id: string;
  type: 'accessory' | 'packaging' | 'part' | 'other';
  label: string; // Ex: "Boîte d'origine avec cales", "Câble USB-C d'origine"
  linkedItemId?: string; // ID d'un autre objet inventorié si applicable
  customLocation?: StorageLocation; // Permet de localiser l'emballage ou l'accessoire ailleurs !
  notes?: string;
}

export interface MediaItem {
  id: string;
  itemId: string;
  name: string;
  size: number;
  mimeType: string;
  category: MediaCategory;
  blob?: Blob;
  base64Data?: string; // Utilisé pour l'import / export et le fallback
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  location: StorageLocation;
  
  // Financier & Garantie
  purchaseDate?: string;      // YYYY-MM-DD
  purchasePrice?: number;     // Montant
  currency: string;           // 'EUR', 'USD', 'CHF', etc.
  warrantyEndDate?: string;   // YYYY-MM-DD
  
  // État & Statut
  condition: ItemCondition;
  status: ItemStatus;
  salePrice?: number;         // Si en vente ou vendu
  saleNotes?: string;
  
  // Documentation
  manualUrl?: string;         // Lien externe éventuel vers une notice
  notes?: string;             // Remarques, historique, etc.
  tags: string[];             // Mots-clés libres
  
  // Relations (Accessoires, Emballages)
  relations: ItemRelation[];
  
  // Médias attachés (références d'IDs)
  mediaIds: string[];
  primaryPhotoId?: string;    // Image mise en avant
  
  // Horodatage
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface AppSettings {
  currency: string;
  residences: string[];
  categories: string[];
  version: string;
}

export type ViewMode = 'large-grid' | 'compact-grid' | 'list';

export type SortOption = 
  | 'updated-desc'
  | 'name-asc'
  | 'name-desc'
  | 'price-desc'
  | 'price-asc'
  | 'date-desc'
  | 'date-asc';

export interface FilterState {
  search: string;
  category: string | null;
  residence: string | null;
  condition: ItemCondition | 'all';
  status: ItemStatus | 'all';
  warranty: 'all' | 'active' | 'expired';
  minPrice?: number;
  maxPrice?: number;
  hasPackaging?: boolean;
  hasAccessories?: boolean;
  hasInvoice?: boolean;
  tag?: string | null;
}

export interface FullBackupExport {
  app: 'InventairePrive';
  version: string;
  exportedAt: string;
  stats: {
    totalItems: number;
    totalMedia: number;
    totalPurchaseValue: number;
  };
  items: InventoryItem[];
  media: Array<{
    id: string;
    itemId: string;
    name: string;
    size: number;
    mimeType: string;
    category: MediaCategory;
    base64Data: string;
    createdAt: string;
  }>;
  settings: AppSettings;
}
