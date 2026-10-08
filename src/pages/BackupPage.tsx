import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Database,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Code2,
  HardDrive,
  FileCheck,
  Package,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import {
  downloadBackupFile,
  generateBackupData,
  importBackupData,
  ImportResult,
} from '../services/backup';
import { clearEntireDatabase } from '../services/db';
import { FullBackupExport } from '../types/inventory';

export const BackupPage: React.FC = () => {
  const { refreshInventory, stats, clearDatabase, requestConfirmation } = useInventory();

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ percent: number; text: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [jsonPreview, setJsonPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress({ percent: 10, text: 'Initialisation de l\'export...' });
    try {
      await downloadBackupFile((percent, text) => {
        setProgress({ percent, text });
      });
      setMessage({
        type: 'success',
        text: 'Sauvegarde complète exportée et téléchargée avec succès (.json).',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'export : ' + (err?.message || 'Erreur inconnue') });
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(null), 1200);
    }
  };

  const handlePreview = async () => {
    setIsExporting(true);
    setProgress({ percent: 20, text: 'Génération du dump...' });
    try {
      const data: FullBackupExport = await generateBackupData((percent, text) => {
        setProgress({ percent, text });
      });
      const truncated = JSON.stringify(
        {
          ...data,
          media: data.media.map((m) => ({
            ...m,
            base64Data: m.base64Data.slice(0, 70) + '... [BASE64 TRONQUÉ, LONGUEUR: ' + m.base64Data.length + ' CARACTÈRES]',
          })),
        },
        null,
        2
      );
      setJsonPreview(truncated);
      setMessage({ type: 'success', text: 'Structure JSON prête pour inspection.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erreur lors de la génération de l\'aperçu.' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(null), 1200);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setProgress({ percent: 10, text: 'Lecture du fichier JSON...' });
    try {
      const res: ImportResult = await importBackupData(file, 'replace', (percent, text) => {
        setProgress({ percent, text });
      });

      if (res.success) {
        await refreshInventory();
        setMessage({
          type: 'success',
          text: `Restauration réussie : ${res.itemsCount} objets et ${res.mediaCount} médias restaurés dans IndexedDB !`,
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Échec de l\'import : ' + (res.error || 'Format non reconnu'),
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erreur critique : ' + (err?.message || 'Fichier invalide') });
    } finally {
      setIsImporting(false);
      setTimeout(() => setProgress(null), 1200);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    requestConfirmation({
      title: 'Réinitialiser complètement la base de données ?',
      message: 'Êtes-vous certain de vouloir vider l\'intégralité d\'IndexedDB ? Tous les objets, photos, factures et paramètres seront définitivement effacés.',
      confirmLabel: 'Oui, tout supprimer',
      cancelLabel: 'Annuler',
      isDestructive: true,
      icon: 'trash',
      onConfirm: async () => {
        await clearDatabase();
        setJsonPreview(null);
        setMessage({
          type: 'info',
          text: 'Base de données IndexedDB vidée avec succès. L\'inventaire est désormais vierge.',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2">
          <Database className="w-6 h-6 text-[#0071e3]" />
          <span>Sauvegarde & Restauration Intégrale</span>
        </h1>
        <p className="text-xs text-[#86868b] mt-0.5">
          Exportez et importez l'intégralité de vos objets, photos et factures en un seul fichier JSON universel
        </p>
      </div>

      {progress && (
        <div className="p-4 rounded-2xl bg-white border border-black/[0.06] space-y-2">
          <div className="flex justify-between text-xs text-[#86868b] font-medium">
            <span>{progress.text}</span>
            <span className="font-semibold text-[#1d1d1f]">{progress.percent}%</span>
          </div>
          <div className="w-full bg-[#f5f5f7] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#0071e3] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
              : message.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200/60'
              : 'bg-blue-50 text-blue-800 border border-blue-200/60'
          }`}
        >
          {message.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {message.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          {message.type === 'info' && <HardDrive className="w-4 h-4 text-blue-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Export Card */}
        <div className="rounded-3xl bg-white border border-black/[0.06] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-[#1d1d1f]">Exporter la base (JSON)</h2>
            <p className="text-xs text-[#86868b] mt-2 leading-relaxed">
              Exporte tous les objets ainsi que toutes les photos et factures (converties automatiquement en Base64). 
              Le fichier est 100% autonome et téléchargeable.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={handleExport}
              disabled={isExporting || stats.totalItems === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le JSON</span>
            </button>
            <button
              onClick={handlePreview}
              disabled={isExporting || stats.totalItems === 0}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] text-xs font-medium border border-black/[0.08] transition active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Eye className="w-3.5 h-3.5 text-[#86868b]" />
              <span>Inspecter le JSON</span>
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="rounded-3xl bg-white border border-black/[0.06] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-[#1d1d1f]">Restaurer une sauvegarde</h2>
            <p className="text-xs text-[#86868b] mt-2 leading-relaxed">
              Chargez un fichier JSON précédemment exporté pour réinjecter vos données et recréer les Blobs natifs dans IndexedDB.
            </p>
          </div>

          <div className="mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
              id="page-backup-input"
            />
            <label
              htmlFor="page-backup-input"
              className={`w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] text-xs font-medium border border-black/[0.1] shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                isImporting ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Sélectionner le fichier JSON</span>
            </label>
          </div>
        </div>

        {/* Maintenance Card */}
        <div className="rounded-3xl bg-white border border-black/[0.06] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-[#1d1d1f]">Réinitialisation locale</h2>
            <p className="text-xs text-[#86868b] mt-2 leading-relaxed">
              Efface définitivement le contenu des bases IndexedDB du navigateur pour repartir d'un inventaire vierge.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleReset}
              disabled={stats.totalItems === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium border border-rose-200/50 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vider la base locale</span>
            </button>
          </div>
        </div>
      </div>

      {jsonPreview && (
        <div className="rounded-3xl bg-[#1d1d1f] text-slate-100 p-6 shadow-xl border border-black/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Code2 className="w-4 h-4 text-[#0071e3]" />
              <span>Aperçu de la sauvegarde JSON</span>
            </div>
            <button
              onClick={() => setJsonPreview(null)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-md bg-white/10 transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto max-h-96 text-emerald-400">
            {jsonPreview}
          </pre>
        </div>
      )}
    </div>
  );
};
