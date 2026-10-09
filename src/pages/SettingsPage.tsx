import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Plus, X, Check, Globe, Smartphone, Sun, Moon, Monitor, BookOpen } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { PWAInstallButton } from '../components/common/PWAInstallButton';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, openInsuranceModal } = useInventory();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [newResidence, setNewResidence] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [currency, setCurrency] = useState(settings?.currency || 'EUR');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddResidence = async () => {
    if (!newResidence.trim() || !settings) return;
    if (settings.residences.includes(newResidence.trim())) return;

    await updateSettings({
      residences: [...settings.residences, newResidence.trim()],
    });
    setNewResidence('');
    triggerSuccess();
  };

  const handleRemoveResidence = async (res: string) => {
    if (!settings) return;
    await updateSettings({
      residences: settings.residences.filter((r) => r !== res),
    });
    triggerSuccess();
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !settings) return;
    if (settings.categories.includes(newCategory.trim())) return;

    await updateSettings({
      categories: [...settings.categories, newCategory.trim()],
    });
    setNewCategory('');
    triggerSuccess();
  };

  const handleRemoveCategory = async (cat: string) => {
    if (!settings) return;
    await updateSettings({
      categories: settings.categories.filter((c) => c !== cat),
    });
    triggerSuccess();
  };

  const handleSaveCurrency = async (curr: string) => {
    setCurrency(curr);
    await updateSettings({ currency: curr });
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#86868b] dark:text-[#a1a1a6]" />
            <span>Paramètres de l'application</span>
          </h1>
          <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-0.5">
            Personnalisez l'apparence, vos résidences, vos catégories et votre devise
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Enregistré</span>
          </span>
        )}
      </div>

      {/* Apparence & Thème d'affichage (Apple Design) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Apparence & Thème</h2>
          <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-0.5">
            Choisissez l'esthétique d'affichage de l'inventaire selon vos préférences visuelles
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 max-w-md">
          {/* Option Système */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
              theme === 'system'
                ? 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20 border-[#0071e3] text-[#0071e3] dark:text-[#0a84ff] font-semibold shadow-xs'
                : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] border-black/[0.04] dark:border-white/[0.06] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#ebebee] dark:hover:bg-[#353538]'
            }`}
          >
            <Monitor className="w-5 h-5" />
            <div className="text-xs">
              <span className="block font-medium">Système</span>
              <span className="text-[10px] opacity-75 mt-0.5 block">Automatique</span>
            </div>
          </button>

          {/* Option Mode Clair */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
              theme === 'light'
                ? 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20 border-[#0071e3] text-[#0071e3] dark:text-[#0a84ff] font-semibold shadow-xs'
                : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] border-black/[0.04] dark:border-white/[0.06] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#ebebee] dark:hover:bg-[#353538]'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <div className="text-xs">
              <span className="block font-medium">Clair</span>
              <span className="text-[10px] opacity-75 mt-0.5 block">Apple Light</span>
            </div>
          </button>

          {/* Option Mode Sombre */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
              theme === 'dark'
                ? 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20 border-[#0071e3] text-[#0071e3] dark:text-[#0a84ff] font-semibold shadow-xs'
                : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] border-black/[0.04] dark:border-white/[0.06] text-[#555558] dark:text-[#a1a1a6] hover:bg-[#ebebee] dark:hover:bg-[#353538]'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <div className="text-xs">
              <span className="block font-medium">Sombre</span>
              <span className="text-[10px] opacity-75 mt-0.5 block">Apple Dark</span>
            </div>
          </button>
        </div>
      </div>

      {/* Devise */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Devise d'affichage</h2>
        <div className="flex gap-2">
          {['EUR', 'USD', 'CHF', 'GBP', 'CAD'].map((c) => (
            <button
              key={c}
              onClick={() => handleSaveCurrency(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                currency === c
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#ebebee] dark:hover:bg-[#353538]'
              }`}
            >
              {c} {c === 'EUR' ? '€' : c === 'USD' ? '$' : c === 'CHF' ? 'CHF' : '£'}
            </button>
          ))}
        </div>
      </div>

      {/* Résidences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Résidences de stockage</h2>
        <p className="text-xs text-[#86868b] dark:text-[#8e8e93]">
          Racines de vos poupées russes de stockage (maison, appartement, bureau, chalet...)
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={newResidence}
            onChange={(e) => setNewResidence(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddResidence()}
            placeholder="Ex : Appartement Paris, Maison de campagne..."
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08] focus:bg-white dark:focus:bg-[#252528] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
          />
          <button
            onClick={handleAddResidence}
            className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-medium hover:bg-[#0077ed] transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {settings?.residences.map((res) => (
            <span
              key={res}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08]"
            >
              <span>📍 {res}</span>
              <button
                onClick={() => handleRemoveResidence(res)}
                className="text-[#86868b] dark:text-[#a1a1a6] hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Catégories */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Catégories d'objets</h2>
        <p className="text-xs text-[#86868b] dark:text-[#8e8e93]">
          Liste des catégories utilisées pour classifier les objets
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            placeholder="Nouvelle catégorie..."
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08] focus:bg-white dark:focus:bg-[#252528] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-medium hover:bg-[#0077ed] transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {settings?.categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08]"
            >
              <span>{cat}</span>
              <button
                onClick={() => handleRemoveCategory(cat)}
                className="text-[#86868b] dark:text-[#a1a1a6] hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Rapport d'assurance */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Assurance & Attestation de Valeur</h2>
        <p className="text-xs text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
          Générez un état descriptif complet et chiffré de vos biens mobiliers classés par pièce et résidence, prêt pour l'impression ou l'exportation en PDF à destination de votre assureur.
        </p>
        <button
          onClick={openInsuranceModal}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-2"
        >
          <span>Ouvrir l'état pour assurance</span>
        </button>
      </div>

      {/* Documentation et Guide d'utilisation */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0071e3] dark:text-[#0a84ff]" />
            <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Manuel & Guide d'Utilisation</h2>
          </div>
          <NavLink
            to="/guide"
            className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-xs transition"
          >
            Consulter le guide
          </NavLink>
        </div>
        <p className="text-xs text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
          Retrouvez les explications complètes sur la localisation en poupées russes, l'assignation de la photo d'illustration par défaut, la génération d'annonces de vente, les rapports d'assurance et la gestion hors-ligne.
        </p>
      </div>

      {/* Application Progressive Web App (PWA) & Mode Hors-ligne */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#0071e3] dark:text-[#0a84ff]" />
          <div>
            <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Application PWA & Hors-Ligne</h2>
            <p className="text-xs text-[#86868b] dark:text-[#8e8e93]">
              Gestion de l'installation et fonctionnement autonome hors-ligne
            </p>
          </div>
        </div>

        <PWAInstallButton variant="settings" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/[0.04] dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">Mise en cache Service Worker</span>
            <span className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mt-0.5 block">
              Actif (Precache automatique des scripts, styles et polices Google Fonts).
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/[0.04] dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">Stockage des données</span>
            <span className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mt-0.5 block">
              IndexedDB local sécurisé (localforage), zéro dépendance à un serveur cloud.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
