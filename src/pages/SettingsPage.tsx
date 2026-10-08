import React, { useState } from 'react';
import { Settings, Plus, X, Check, Globe } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, openInsuranceModal } = useInventory();
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
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#86868b]" />
            <span>Paramètres de l'application</span>
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Personnalisez vos résidences par défaut, vos catégories et votre devise
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Enregistré</span>
          </span>
        )}
      </div>

      {/* Devise */}
      <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <h2 className="text-sm font-semibold text-[#1d1d1f]">Devise d'affichage</h2>
        <div className="flex gap-2">
          {['EUR', 'USD', 'CHF', 'GBP', 'CAD'].map((c) => (
            <button
              key={c}
              onClick={() => handleSaveCurrency(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                currency === c
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ebebee]'
              }`}
            >
              {c} {c === 'EUR' ? '€' : c === 'USD' ? '$' : c === 'CHF' ? 'CHF' : '£'}
            </button>
          ))}
        </div>
      </div>

      {/* Résidences */}
      <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <h2 className="text-sm font-semibold text-[#1d1d1f]">Résidences de stockage</h2>
        <p className="text-xs text-[#86868b]">
          Racines de vos poupées russes de stockage (maison, appartement, bureau, chalet...)
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={newResidence}
            onChange={(e) => setNewResidence(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddResidence()}
            placeholder="Ex : Appartement Paris, Maison de campagne..."
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-[#f5f5f7] text-[#1d1d1f] border border-black/[0.06]"
            >
              <span>📍 {res}</span>
              <button
                onClick={() => handleRemoveResidence(res)}
                className="text-[#86868b] hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Catégories */}
      <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <h2 className="text-sm font-semibold text-[#1d1d1f]">Catégories d'objets</h2>
        <p className="text-xs text-[#86868b]">
          Liste des catégories utilisées pour classifier les objets
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            placeholder="Nouvelle catégorie..."
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-[#f5f5f7] text-[#1d1d1f] border border-black/[0.06]"
            >
              <span>{cat}</span>
              <button
                onClick={() => handleRemoveCategory(cat)}
                className="text-[#86868b] hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Rapport d'assurance */}
      <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <h2 className="text-sm font-semibold text-[#1d1d1f]">Assurance & Attestation de Valeur</h2>
        <p className="text-xs text-[#86868b] leading-relaxed">
          Générez un état descriptif complet et chiffré de vos biens mobiliers classés par pièce et résidence, prêt pour l'impression ou l'exportation en PDF à destination de votre assureur.
        </p>
        <button
          onClick={openInsuranceModal}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-2"
        >
          <span>Ouvrir l'état pour assurance</span>
        </button>
      </div>
    </div>
  );
};
