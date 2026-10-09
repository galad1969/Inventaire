import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Tag,
  Share2,
  FileText,
  DollarSign,
  Package,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { InventoryItem } from '../../types/inventory';

interface ListingGeneratorModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

type PlatformType = 'leboncoin' | 'vinted' | 'ebay' | 'marketplace';

export const ListingGeneratorModal: React.FC<ListingGeneratorModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [platform, setPlatform] = useState<PlatformType>('leboncoin');
  const [copied, setCopied] = useState(false);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeWarranty, setIncludeWarranty] = useState(true);

  if (!isOpen || !item) return null;

  const conditionLabels: Record<string, string> = {
    neuf: 'Neuf sous blister / Jamais servi',
    tres_bon_etat: 'Très bon état (proche du neuf)',
    bon_etat: 'Bon état général (traces mineures d\'usage)',
    satisfaisant: 'État satisfaisant (parfait état de marche)',
    pour_pieces: 'Pour pièces ou réparation',
  };

  const generateTitle = (): string => {
    const brand = item.brand ? `${item.brand} ` : '';
    const model = item.model ? ` ${item.model}` : '';
    const state = item.condition === 'neuf' ? ' - Neuf' : item.condition === 'tres_bon_etat' ? ' - Très bon état' : '';
    return `${brand}${item.name}${model}${state}`.trim();
  };

  const generateDescription = (): string => {
    const lines: string[] = [];

    // Accroche
    lines.push(`Bonjour,`);
    lines.push(``);
    lines.push(`Je vends un(e) ${item.name} (${item.brand || ''} ${item.model || ''}).`);
    lines.push(``);

    // État
    lines.push(`📌 État : ${conditionLabels[item.condition] || item.condition}`);
    
    // Description libre / notes de vente
    if (item.saleNotes) {
      lines.push(``);
      lines.push(`📝 Description & Détails :`);
      lines.push(`${item.saleNotes}`);
    } else if (item.notes) {
      lines.push(``);
      lines.push(`📝 Informations :`);
      lines.push(`${item.notes}`);
    }

    // Accessoires & Boîtes
    if (item.relations && item.relations.length > 0) {
      lines.push(``);
      lines.push(`📦 Inclus dans la vente :`);
      item.relations.forEach((rel) => {
        lines.push(`  • ${rel.label} (${rel.type === 'packaging' ? 'Emballage d\'origine' : 'Accessoire'})`);
      });
    }

    // Facture & Garantie
    if (includeWarranty) {
      if (item.warrantyEndDate && new Date(item.warrantyEndDate) > new Date()) {
        lines.push(``);
        lines.push(`🛡️ Facture & Garantie :`);
        lines.push(`  • Facture d'achat disponible sur demande`);
        lines.push(`  • Sous garantie constructeur jusqu'au ${item.warrantyEndDate}`);
      } else if (item.purchaseDate) {
        lines.push(``);
        lines.push(`🧾 Facture d'achat d'origine disponible.`);
      }
    }

    // Prix & Modalités
    lines.push(``);
    lines.push(`💶 Prix demandé : ${item.salePrice ? `${item.salePrice} €` : 'À débattre'}`);

    if (includeLocation) {
      lines.push(``);
      lines.push(`📍 Remise en main propre possible sur le secteur de ${item.location.residence} ou expédition soignée possible.`);
    }

    lines.push(``);
    lines.push(`N'hésitez pas à me contacter par message pour toute question ou photo complémentaire.`);

    return lines.join('\n');
  };

  const title = generateTitle();
  const description = generateDescription();

  const handleCopy = async () => {
    try {
      const fullText = `TITRE :\n${title}\n\nPRIX : ${item.salePrice || 0} €\n\nDESCRIPTION :\n${description}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-2xl bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-[#fbfbfd] dark:bg-[#18181b]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">Générateur d'Annonce de Vente</h2>
                <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">Prêt à copier pour Le Bon Coin, Vinted, eBay ou Facebook</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-5">
            
            {/* Choix de la plateforme */}
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                Plateforme cible
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'leboncoin', label: 'Le Bon Coin' },
                    { id: 'vinted', label: 'Vinted' },
                    { id: 'ebay', label: 'eBay' },
                    { id: 'marketplace', label: 'Marketplace' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer text-center ${
                      platform === p.id
                        ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                        : 'bg-[#f5f5f7] dark:bg-white/[0.06] hover:bg-[#ebebee] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] border-black/[0.05] dark:border-white/[0.06]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options d'inclusion */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#555558] dark:text-[#a1a1a6] bg-[#fbfbfd] dark:bg-white/[0.04] p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLocation}
                  onChange={(e) => setIncludeLocation(e.target.checked)}
                  className="rounded text-[#0071e3] focus:ring-0"
                />
                <span>Mentionner le lieu de retrait ({item.location.residence})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWarranty}
                  onChange={(e) => setIncludeWarranty(e.target.checked)}
                  className="rounded text-[#0071e3] focus:ring-0"
                />
                <span>Mentionner facture et garantie</span>
              </label>
            </div>

            {/* Titre généré */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Titre optimisé de l'annonce
                </label>
                <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93] font-mono">{title.length} caractères</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] font-medium text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                {title}
              </div>
            </div>

            {/* Descriptif généré */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Texte descriptif rédigé
                </label>
                <span className="text-[10px] text-[#86868b] dark:text-[#8e8e93]">Formaté avec émojis et puces</span>
              </div>
              <textarea
                readOnly
                rows={9}
                value={description}
                className="w-full p-3.5 rounded-xl bg-[#f5f5f7] dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none resize-none leading-relaxed"
              />
            </div>

          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#fbfbfd] dark:bg-[#18181b] flex items-center justify-between">
            <div className="text-xs text-[#86868b] dark:text-[#8e8e93]">
              Prix de vente conseillé : <strong className="text-amber-600 dark:text-amber-400 font-semibold">{item.salePrice || 0} €</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#f5f5f7] dark:bg-white/[0.08] hover:bg-[#ebebee] dark:hover:bg-white/[0.12] text-[#555558] dark:text-[#f5f5f7] transition cursor-pointer"
              >
                Fermer
              </button>

              <button
                onClick={handleCopy}
                className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-[0.98]'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié dans le presse-papier !' : 'Copier l\'annonce complète'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
