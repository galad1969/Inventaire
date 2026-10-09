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
  FileSpreadsheet,
  Table,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import {
  downloadBackupFile,
  generateBackupData,
  importBackupData,
  ImportResult,
} from '../services/backup';
import { clearEntireDatabase, getAllItems } from '../services/db';
import { FullBackupExport } from '../types/inventory';
import { downloadInventoryCsv, generateInventoryCsv } from '../services/csvExport';

export const BackupPage: React.FC = () => {
  const { refreshInventory, stats, clearDatabase, requestConfirmation } = useInventory();

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ percent: number; text: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [jsonPreview, setJsonPreview] = useState<string | null>(null);

  // Options pour l'export CSV Excel / Sheets
  const [csvDelimiter, setCsvDelimiter] = useState<';' | ','>(';');
  const [includeArchivedInCsv, setIncludeArchivedInCsv] = useState<boolean>(true);
  const [csvPreview, setCsvPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCsv = async () => {
    setIsExporting(true);
    setProgress({ percent: 30, text: 'Génération du tableau CSV...' });
    try {
      const allItems = await getAllItems();
      const filename = downloadInventoryCsv(allItems, {
        delimiter: csvDelimiter,
        includeArchived: includeArchivedInCsv,
      });
      setMessage({
        type: 'success',
        text: `Fichier CSV exporté et téléchargé (${filename}) ! Ouvrable directement dans Excel et Google Sheets.`,
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'export CSV : ' + (err?.message || 'Erreur inconnue') });
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(null), 1200);
    }
  };

  const handlePreviewCsv = async () => {
    setIsExporting(true);
    setProgress({ percent: 30, text: 'Génération de l\'aperçu CSV...' });
    try {
      const allItems = await getAllItems();
      const rawCsv = generateInventoryCsv(allItems, {
        delimiter: csvDelimiter,
        includeArchived: includeArchivedInCsv,
      });
      const lines = rawCsv.replace(/^\uFEFF/, '').split('\r\n');
      const sample = lines.slice(0, 35).join('\n') + (lines.length > 35 ? `\n... [et ${lines.length - 35} lignes supplémentaires dans le fichier]` : '');
      setCsvPreview(sample);
      setJsonPreview(null);
      setMessage({ type: 'success', text: 'Aperçu du tableau CSV généré avec succès.' });
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la génération de l\'aperçu CSV.' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(null), 1000);
    }
  };

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
        <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
          <Database className="w-6 h-6 text-[#0071e3] dark:text-[#0a84ff]" />
          <span>Sauvegarde & Restauration Intégrale</span>
        </h1>
        <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-0.5">
          Exportez et importez l'intégralité de vos objets, photos et factures en un seul fichier JSON universel
        </p>
      </div>

      {progress && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
          <div className="flex justify-between text-xs text-[#86868b] dark:text-[#8e8e93] font-medium">
            <span>{progress.text}</span>
            <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{progress.percent}%</span>
          </div>
          <div className="w-full bg-[#f5f5f7] dark:bg-[#252528] rounded-full h-1.5 overflow-hidden">
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
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50'
              : message.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50'
          }`}
        >
          {message.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
          {message.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
          {message.type === 'info' && <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Export CSV Card (Excel & Google Sheets) */}
        <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] border border-emerald-500/20 dark:border-emerald-500/30 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Exporter au format CSV</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Excel & Sheets
              </span>
            </div>
            <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-2 leading-relaxed">
              Exporte tous vos objets dans une feuille de calcul avec encodage UTF-8 (BOM pour les accents) et séparateur adapté à Microsoft Excel, LibreOffice et Google Sheets.
            </p>

            {/* Options CSV */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#fbfbfd] dark:bg-[#252528] border border-black/[0.05] dark:border-white/[0.06] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Séparateur :</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCsvDelimiter(';')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      csvDelimiter === ';'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.1] text-[#555558] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    Point-virgule « ; » (Excel FR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCsvDelimiter(',')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      csvDelimiter === ','
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.1] text-[#555558] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    Virgule « , » (Sheets / US)
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#555558] dark:text-[#a1a1a6] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeArchivedInCsv}
                  onChange={(e) => setIncludeArchivedInCsv(e.target.checked)}
                  className="rounded border-black/[0.2] dark:border-white/[0.2] text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Inclure les objets archivés dans l'export</span>
              </label>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={handleExportCsv}
              disabled={isExporting || stats.totalItems === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le fichier CSV (.csv)</span>
            </button>
            <button
              onClick={handlePreviewCsv}
              disabled={isExporting || stats.totalItems === 0}
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#252528] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c30] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-medium border border-black/[0.08] dark:border-white/[0.1] transition active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Aperçu du tableau CSV</span>
            </button>
          </div>
        </div>

        {/* 2. Export JSON Card */}
        <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center mb-4 shadow-2xs">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Sauvegarde intégrale (JSON)</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                Avec photos
              </span>
            </div>
            <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-2 leading-relaxed">
              Exporte tous les objets ainsi que toutes les photos et factures (converties automatiquement en Base64). 
              Le fichier est 100% autonome et permet une restauration complète.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={handleExport}
              disabled={isExporting || stats.totalItems === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le JSON (.json)</span>
            </button>
            <button
              onClick={handlePreview}
              disabled={isExporting || stats.totalItems === 0}
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#252528] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c30] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-medium border border-black/[0.08] dark:border-white/[0.1] transition active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Eye className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
              <span>Inspecter le JSON</span>
            </button>
          </div>
        </div>

        {/* 3. Import Card */}
        <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Restaurer une sauvegarde</h2>
            <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-2 leading-relaxed">
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
              className={`w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#252528] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c30] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-medium border border-black/[0.1] dark:border-white/[0.1] shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                isImporting ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Sélectionner le fichier JSON</span>
            </label>
          </div>
        </div>

        {/* 4. Maintenance Card */}
        <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-2xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Réinitialisation locale</h2>
            <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-2 leading-relaxed">
              Efface définitivement le contenu des bases IndexedDB du navigateur pour repartir d'un inventaire vierge.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleReset}
              disabled={stats.totalItems === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-medium border border-rose-200/50 dark:border-rose-800/40 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vider la base locale</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aperçu du tableau CSV */}
      {csvPreview && (
        <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] border border-emerald-500/30 dark:border-emerald-500/40 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Aperçu des premières lignes du fichier CSV (Séparateur : « {csvDelimiter} »)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger</span>
              </button>
              <button
                onClick={() => setCsvPreview(null)}
                className="text-xs text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] px-2.5 py-1 rounded-lg bg-[#f5f5f7] dark:bg-[#252528] transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#121214] border border-black/[0.05] dark:border-white/[0.06] overflow-x-auto max-h-96">
            <pre className="text-[11px] font-mono text-slate-800 dark:text-slate-200 whitespace-pre leading-relaxed">
              {csvPreview}
            </pre>
          </div>
        </div>
      )}

      {jsonPreview && (
        <div className="rounded-3xl bg-[#1d1d1f] text-slate-100 p-6 shadow-xl border border-black/10 dark:border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Code2 className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
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
