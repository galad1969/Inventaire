import React, { useRef } from 'react';
import {
  X,
  Printer,
  Shield,
  FileCheck,
  Building,
  CheckCircle2,
  Calendar,
  Euro,
  Download,
} from 'lucide-react';
import { InventoryItem } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';

interface InsuranceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InsuranceReportModal: React.FC<InsuranceReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { items, stats, settings } = useInventory();
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const activeItems = items.filter((it) => it.status !== 'archive');

  // Regroupement par résidence puis par pièce
  const groupedByResidence: Record<string, Record<string, InventoryItem[]>> = {};
  activeItems.forEach((it) => {
    const res = it.location?.residence || 'Non classé';
    const room = it.location?.room || 'Pièce non spécifiée';
    if (!groupedByResidence[res]) groupedByResidence[res] = {};
    if (!groupedByResidence[res][room]) groupedByResidence[res][room] = [];
    groupedByResidence[res][room].push(it);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity print:hidden"
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 print:p-0">
        <div className="relative w-full max-w-4xl bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
          
          {/* Header (Masqué à l'impression standard) */}
          <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-[#fbfbfd] dark:bg-[#18181b] print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">Rapport d'Inventaire pour Assurance</h2>
                <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">Document officiel récapitulatif pour contrat d'assurance habitation</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer / Sauvegarder PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Report Content */}
          <div ref={reportRef} className="p-8 sm:p-10 overflow-y-auto space-y-8 print:p-0 print:overflow-visible">
            
            {/* Header du document imprimable */}
            <div className="border-b border-black/[0.1] dark:border-white/[0.1] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Shield className="w-4 h-4" />
                  <span>Attestation d'Inventaire Mobilier & Électronique</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  État Descriptif & Estimatif des Biens
                </h1>
                <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-1">
                  Établi le {today} via l'application Inventaire Privé (Offline-first)
                </p>
              </div>

              <div className="text-left sm:text-right bg-[#fbfbfd] dark:bg-white/[0.04] p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shrink-0">
                <div className="text-[11px] text-[#86868b] dark:text-[#8e8e93] uppercase tracking-wide">Valorisation globale déclarée</div>
                <div className="text-2xl font-extrabold text-[#0071e3] dark:text-[#0a84ff] mt-0.5">
                  {stats.totalValue.toLocaleString('fr-FR')} €
                </div>
                <div className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mt-0.5">
                  {stats.activeItems} biens inventoriés
                </div>
              </div>
            </div>

            {/* Note informative assurance */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.08] text-xs text-slate-700 dark:text-[#d1d1d6] leading-relaxed">
              <strong>Notice pour l'assureur / expert :</strong> Le présent état récapitule l'ensemble des biens mobiliers, appareils électroniques, outillages et objets de valeur déclarés par l'assuré. Les justificatifs d'achat, numéros de série constructeurs et photographies haute définition sont conservés et archivés sous forme numérique.
            </div>

            {/* Ventilation par Résidence et Pièce */}
            <div className="space-y-8">
              {Object.entries(groupedByResidence).map(([residence, rooms]) => {
                const totalInRes = Object.values(rooms)
                  .flat()
                  .reduce((acc, it) => acc + (it.purchasePrice || 0), 0);

                return (
                  <div key={residence} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-black/[0.08] dark:border-white/[0.1] pb-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
                        <h2 className="font-bold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">{residence}</h2>
                      </div>
                      <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        Sous-total : {totalInRes.toLocaleString('fr-FR')} €
                      </span>
                    </div>

                    <div className="space-y-5">
                      {Object.entries(rooms).map(([room, roomItems]) => {
                        const totalInRoom = roomItems.reduce((acc, it) => acc + (it.purchasePrice || 0), 0);

                        return (
                          <div key={room} className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden">
                            <div className="px-4 py-2 bg-[#fbfbfd] dark:bg-white/[0.04] border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold text-[#555558] dark:text-[#a1a1a6]">
                              <span>Pièce : {room} ({roomItems.length} objet{roomItems.length > 1 ? 's' : ''})</span>
                              <span>{totalInRoom.toLocaleString('fr-FR')} €</span>
                            </div>

                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-black/[0.04] dark:border-white/[0.06] text-[10px] text-[#86868b] dark:text-[#8e8e93] uppercase tracking-wider bg-white dark:bg-[#1c1c1e]">
                                  <th className="py-2.5 px-3">Désignation</th>
                                  <th className="py-2.5 px-3">Marque / Modèle</th>
                                  <th className="py-2.5 px-3">N° de Série</th>
                                  <th className="py-2.5 px-3">Date d'achat</th>
                                  <th className="py-2.5 px-3 text-right">Valeur d'achat</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                                {roomItems.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                                    <td className="py-2.5 px-3 font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                                      {item.name}
                                      {item.location?.furniture && (
                                        <div className="text-[10px] text-[#86868b] dark:text-[#8e8e93]">
                                          {item.location.furniture} • {item.location.subLocation}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-[#555558] dark:text-[#a1a1a6]">
                                      {item.brand || '—'} {item.model ? `(${item.model})` : ''}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#555558] dark:text-[#a1a1a6]">
                                      {item.serialNumber || 'N/C'}
                                    </td>
                                    <td className="py-2.5 px-3 text-[#86868b] dark:text-[#8e8e93]">
                                      {item.purchaseDate || 'N/C'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                                      {item.purchasePrice ? `${item.purchasePrice.toLocaleString('fr-FR')} €` : 'N/C'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pied de page du document d'assurance */}
            <div className="border-t border-black/[0.08] dark:border-white/[0.1] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#86868b] dark:text-[#8e8e93] gap-3">
              <div>
                Document généré pour valoir ce que de droit en cas de déclaration de sinistre (vol, dégât des eaux, incendie).
              </div>
              <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                Signature de l'assuré : _______________________
              </div>
            </div>

          </div>

          {/* Footer (Action buttons) */}
          <div className="px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#fbfbfd] dark:bg-[#18181b] flex items-center justify-between print:hidden">
            <span className="text-xs text-[#86868b] dark:text-[#8e8e93]">
              Astuce : Choisissez « Enregistrer au format PDF » dans la fenêtre d'impression de votre navigateur.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#f5f5f7] dark:bg-white/[0.08] hover:bg-[#ebebee] dark:hover:bg-white/[0.12] text-[#555558] dark:text-[#f5f5f7] transition cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer l'inventaire</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
