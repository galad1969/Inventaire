import React, { useState } from 'react';
import {
  BookOpen,
  Package,
  Layers,
  MapPin,
  Tag,
  ShieldCheck,
  Download,
  Upload,
  Moon,
  Smartphone,
  HardDrive,
  Search,
  Camera,
  Star,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import { useInventory } from '../context/InventoryContext';

export const UserGuidePage: React.FC = () => {
  const { seedDemoData, loading, stats } = useInventory();
  const [activeSection, setActiveSection] = useState<string>('intro');

  const sections = [
    { id: 'intro', title: 'Présentation & Philosophie', icon: BookOpen },
    { id: 'offline-pwa', title: 'Mode Hors-ligne & PWA', icon: Smartphone },
    { id: 'items', title: 'Gestion des Objets & Photos', icon: Package },
    { id: 'locations', title: 'Poupées Russes (Emplacements)', icon: MapPin },
    { id: 'sales', title: 'Ventes & Annonces 1-Clic', icon: Tag },
    { id: 'insurance', title: 'Rapport Assurance & Garanties', icon: ShieldCheck },
    { id: 'backup', title: 'Sauvegardes (JSON & CSV)', icon: Download },
    { id: 'shortcuts', title: 'Raccourcis & Astuces Pro', icon: Sparkles },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* En-tête avec Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0071e3] to-[#005bb5] text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guide officiel d'utilisation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Documentation & Manuel d'Utilisation
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
            Bienvenue dans votre gestionnaire d'inventaire privé et personnel. Conçu sur une architecture 
            <strong> 100% locale (Offline-First)</strong>, sécurisée, sans compte cloud obligatoire et respectant l'esthétique Apple Design.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <PWAInstallButton variant="hero" />
            {stats.totalItems === 0 && (
              <button
                type="button"
                onClick={() => seedDemoData()}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Charger le jeu d'essai démo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sommaire interactif à onglets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1c1c1e] text-[#555558] dark:text-[#a1a1a6] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu détaillé des sections */}
      <div className="space-y-6">

        {/* Section 1 : Intro */}
        {activeSection === 'intro' && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-[#0071e3] dark:text-[#0a84ff]" />
                <span>1. Philosophie et Confidentialité Totale</span>
              </h2>
              <p className="text-xs text-[#555558] dark:text-[#a1a1a6] leading-relaxed">
                Contrairement aux services en ligne conventionnels, <strong>Inventaire Privé</strong> fonctionne selon le modèle 
                <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]"> Local-First</span>. Vos données, factures sensibles, 
                photos haute résolution et prix d'achat sont stockés localement sur votre appareil dans une base de données 
                IndexedDB chiffrée par le navigateur.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <h3 className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">0% Télémétrie</h3>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mt-1">
                    Aucun pistage, aucune collecte de données personnelles ni serveur externe.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                  <h3 className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">100% Hors-ligne</h3>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mt-1">
                    Fonctionne même sans connexion Internet, en voyage ou dans un sous-sol.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
                  <h3 className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">Propriété Intégrale</h3>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mt-1">
                    Exportez et importez vos biens à tout moment en format JSON complet ou CSV Excel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2 : Mode Hors-Ligne & PWA */}
        {activeSection === 'offline-pwa' && (
          <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#0071e3] dark:text-[#0a84ff]" />
              <span>2. Installation PWA (Progressive Web App) et Mode Hors-ligne</span>
            </h2>
            <p className="text-xs text-[#555558] dark:text-[#a1a1a6] leading-relaxed">
              L'application intègre un <strong>Service Worker Workbox</strong> et un fichier <strong>manifest.json</strong> certifié PWA. 
              Vous pouvez l'installer directement sur votre écran d'accueil comme une application native pour iOS, macOS, Windows ou Android.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4.5 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-2">
                <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                  Sur iPhone & iPad (Safari) :
                </span>
                <ol className="text-xs text-[#86868b] dark:text-[#8e8e93] space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Ouvrez l'application dans le navigateur <strong>Safari</strong>.</li>
                  <li>Touchez l'icône de partage <strong>« Partager » (carré avec flèche vers le haut)</strong>.</li>
                  <li>Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.</li>
                  <li>L'application s'ouvrira en plein écran sans barre d'adresse.</li>
                </ol>
              </div>

              <div className="p-4.5 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-2">
                <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                  Sur Chrome, Mac, Windows & Android :
                </span>
                <ol className="text-xs text-[#86868b] dark:text-[#8e8e93] space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Cliquez sur le bouton <strong>« Installer l'application »</strong> présent dans la barre supérieure ou la barre latérale.</li>
                  <li>Ou cliquez sur l'icône d'installation dans la barre d'adresse de Google Chrome / Edge.</li>
                  <li>Confirmez l'installation : l'application est disponible dans vos programmes.</li>
                </ol>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <span>
                <strong>Indicateur Hors-ligne automatique :</strong> Lorsque votre appareil perd toute connexion Internet, 
                une pastille discrète vous confirme que l'application continue de fonctionner parfaitement en mode local.
              </span>
            </div>
          </div>
        )}

        {/* Section 3 : Objets & Photos */}
        {activeSection === 'items' && (
          <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#0071e3] dark:text-[#0a84ff]" />
              <span>3. Création d'Objet & Photo d'Illustration par Défaut</span>
            </h2>
            <p className="text-xs text-[#555558] dark:text-[#a1a1a6] leading-relaxed">
              Pour ajouter un bien, cliquez sur le bouton bleu <strong>« Nouvel objet »</strong> situé dans la barre de navigation. 
              Le formulaire se découpe en 6 onglets conçus pour une saisie rapide et exhaustive.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
                  <span>Définition de l'illustration par défaut (Photo principale)</span>
                </div>
                <p className="text-xs text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
                  Dans l'onglet <strong>« 4. Médias »</strong>, vous disposez d'un encadré dédié 
                  <strong>« Photo d'illustration principale »</strong>. 
                  Vous pouvez ajouter directement la photo de votre choix ou, si vous avez téléversé plusieurs photos, 
                  cliquer sur le bouton <strong>« Par défaut » (étoile dorée)</strong> sur la vignette désirée. 
                  Cette image sera systématiquement affichée dans la grille de l'inventaire, le mode compact et les fiches de vente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-black/[0.04] dark:border-white/[0.06] bg-[#fbfbfd] dark:bg-white/[0.02]">
                  <span className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Numéro de Série & Marque
                  </span>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                    Enregistrez le S/N précis pour vos démarches en cas de vol ou de SAV.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-black/[0.04] dark:border-white/[0.06] bg-[#fbfbfd] dark:bg-white/[0.02]">
                  <span className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Modes d'affichage
                  </span>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                    Basculez entre <strong>Grille Pro</strong>, <strong>Grille Compacte</strong> et <strong>Tableau détaillé</strong>.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-black/[0.04] dark:border-white/[0.06] bg-[#fbfbfd] dark:bg-white/[0.02]">
                  <span className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">
                    Tags transversaux
                  </span>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                    Attribuez des tags (#gaming, #nomade, #outillage) pour filtrer vos objets en un clic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 4 : Emplacements & Poupées russes */}
        {activeSection === 'locations' && (
          <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0071e3] dark:text-[#0a84ff]" />
              <span>4. Système d'Emplacements en « Poupées Russes »</span>
            </h2>
            <p className="text-xs text-[#555558] dark:text-[#a1a1a6] leading-relaxed">
              Pour retrouver n'importe quel objet en quelques secondes, Inventaire Privé structure les lieux sur 4 niveaux hiérarchiques précis :
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-[#0071e3]/[0.05] dark:bg-[#0071e3]/[0.1] border border-[#0071e3]/20 text-xs font-medium text-[#0071e3] dark:text-[#0a84ff]">
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c1c1e] shadow-xs">1. Résidence</span>
              <ChevronRight className="w-4 h-4 hidden sm:block opacity-60" />
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c1c1e] shadow-xs">2. Pièce</span>
              <ChevronRight className="w-4 h-4 hidden sm:block opacity-60" />
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c1c1e] shadow-xs">3. Meuble</span>
              <ChevronRight className="w-4 h-4 hidden sm:block opacity-60" />
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c1c1e] shadow-xs">4. Tiroir / Boîte</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-2">
              <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                Gestion des Boîtes d'origine & Accessoires déportés :
              </span>
              <p className="text-xs text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
                Vous gardez la boîte d'origine de votre MacBook au grenier alors que l'ordinateur est sur votre bureau ? 
                L'onglet <strong>« 5. Boîtes & Accessoires »</strong> vous permet de lier la boîte ou les chargeurs tout en lui spécifiant 
                un emplacement géographique distinct (ex: <em>Grenier → Étagère métallique → Carton #3</em>).
              </p>
            </div>
          </div>
        )}

        {/* Section 5 : Ventes & Annonces */}
        {activeSection === 'sales' && (
          <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              <span>5. Valorisation des Ventes & Générateur d'Annonces en 1 Clic</span>
            </h2>
            <p className="text-xs text-[#555558] dark:text-[#a1a1a6] leading-relaxed">
              Pour désencombrer votre logement et revendre vos objets sur les plateformes d'occasion :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-500/[0.06] dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-800/40 space-y-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                  1. Passage en statut « En vente »
                </span>
                <p className="text-xs text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
                  Dans la fiche de l'objet, sélectionnez le statut <strong>🏷️ En Vente</strong> et indiquez votre 
                  prix de vente espéré ainsi que d'éventuelles remarques.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-2">
                <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                  2. Générateur de texte (Le Bon Coin, Vinted, eBay)
                </span>
                <p className="text-xs text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
                  Dans la page <strong>« En vente »</strong>, cliquez sur <strong>« Générer l'annonce »</strong>. 
                  L'application rédige automatiquement un titre accrocheur, les spécifications techniques, l'état matériel 
                  et la présence de la facture. Cliquez sur <strong>« Copier »</strong> pour coller instantanément sur le site marchand.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 6 : Assurance & Garanties */}
        {activeSection === 'insurance' && (
          <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>6. Rapport Officiel pour Assurance Habitation & Suivi des Garanties</span>
            </h2>
            <p className="text-xs text-[#555558] dark:text-[#a1a1a6] leading-relaxed">
              En cas de cambriolage, dégât des eaux ou sinistre incendie, les compagnies d'assurance exigent 
              un état chiffré des biens ainsi que les numéros de série et factures d'achat.
            </p>

            <div className="p-4.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Rapport Assurance prêt à imprimer (PDF)</span>
              </div>
              <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                Cliquez sur le bouton <strong>« Rapport Assurance »</strong> dans la barre supérieure ou latérale. 
                Une attestation complète est générée, ventilée par résidence et par pièce avec sous-totaux, 
                valeur globale déclarée et encadré de signature certifié pour l'expert.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-2">
              <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                Suivi des alertes de garantie :
              </span>
              <p className="text-xs text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
                La page <strong>« Sous garantie »</strong> isole tous les objets couverts par une garantie constructeur 
                ou légale (2 ans par défaut) et vous prévient lorsque la fin de garantie approche (moins de 60 jours).
              </p>
            </div>
          </div>
        )}

        {/* Section 7 : Sauvegardes JSON & CSV */}
        {activeSection === 'backup' && (
          <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <Download className="w-5 h-5 text-[#0071e3] dark:text-[#0a84ff]" />
              <span>7. Sauvegardes, Export CSV Excel et Restauration</span>
            </h2>
            <p className="text-xs text-[#555558] dark:text-[#a1a1a6] leading-relaxed">
              Pour garantir que vous ne perdiez jamais votre inventaire en cas de changement d'ordinateur ou de suppression du cache :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4.5 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <Download className="w-4 h-4 text-[#0071e3]" />
                  <span>Sauvegarde Intégrale (.JSON)</span>
                </div>
                <p className="text-xs text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
                  Exporte dans un unique fichier toutes vos fiches, relations, factures et photos encodées. 
                  Vous pouvez restaurer cette sauvegarde sur n'importe quel autre appareil en 1 clic.
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export Tableau (.CSV)</span>
                </div>
                <p className="text-xs text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
                  Génère une feuille de calcul au format CSV avec encodage UTF-8 BOM (pour préserver les accents) 
                  et séparateur point-virgule <strong>(;)</strong> spécialement calibré pour <strong>Microsoft Excel</strong>, 
                  <strong>Google Sheets</strong> et <strong>Numbers</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 8 : Raccourcis & Astuces Pro */}
        {activeSection === 'shortcuts' && (
          <div className="rounded-3xl bg-white dark:bg-[#1c1c1e] p-6 sm:p-7 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0071e3] dark:text-[#0a84ff]" />
              <span>8. Raccourcis Clavier & Astuces Apple</span>
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Recherche omnibar instantanée</span>
                <kbd className="px-2 py-1 rounded bg-white dark:bg-[#2c2c2e] border border-black/[0.1] dark:border-white/[0.1] font-mono text-[11px] text-[#555558] dark:text-[#a1a1a6] shadow-2xs">
                  ⌘ Cmd + K / Ctrl + K
                </kbd>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Fermer une modale ou un panneau de filtre</span>
                <kbd className="px-2 py-1 rounded bg-white dark:bg-[#2c2c2e] border border-black/[0.1] dark:border-white/[0.1] font-mono text-[11px] text-[#555558] dark:text-[#a1a1a6] shadow-2xs">
                  Échap / Esc
                </kbd>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fbfbfd] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Basculer le thème Sombre / Clair</span>
                <span className="text-[#86868b] dark:text-[#8e8e93]">
                  Icône Lune/Soleil dans la barre supérieure ou dans Paramètres
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
