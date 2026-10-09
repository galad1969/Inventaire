import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'sidebar' | 'settings' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running in standalone PWA window, hide in header/sidebar, or show badge in settings
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/50">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Application installée en mode autonome (PWA active)</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'sidebar') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-[#0071e3]/10 hover:bg-[#0071e3]/15 text-[#0071e3] transition cursor-pointer ${className}`}
          title="Installer l'application sur votre appareil"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Installer l'application</span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#0071e3] text-white">
            PWA
          </span>
        </button>
      );
    }

    if (variant === 'settings') {
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0071e3]/5 border border-[#0071e3]/20">
          <div>
            <div className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#0071e3]" />
              <span>Installation sur votre appareil</span>
            </div>
            <p className="text-[11px] text-[#86868b] mt-0.5">
              Utilisez Inventaire Privé comme une vraie application de bureau ou mobile, 100% hors-ligne.
            </p>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installer maintenant</span>
          </button>
        </div>
      );
    }

    // Default: navbar style
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0071e3]/10 hover:bg-[#0071e3]/15 text-[#0071e3] text-xs font-medium transition cursor-pointer ${className}`}
        title="Installer l'application sur votre appareil pour un accès direct hors-ligne"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installer</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit uses manual Share -> Add to Home Screen)
  if (isIOS) {
    return (
      <>
        {variant === 'sidebar' ? (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-[#0071e3]/10 hover:bg-[#0071e3]/15 text-[#0071e3] transition cursor-pointer ${className}`}
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>Installer sur iPhone / iPad</span>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#0071e3] text-white">
              iOS
            </span>
          </button>
        ) : variant === 'settings' ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/[0.03] border border-black/[0.06]">
            <div>
              <div className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#0071e3]" />
                <span>Installer sur iOS (Safari)</span>
              </div>
              <p className="text-[11px] text-[#86868b] mt-0.5">
                Ajoutez l'application à votre écran d'accueil iPhone ou iPad via le menu Partager.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSGuide(true)}
              className="px-4 py-2 rounded-xl bg-black/[0.06] hover:bg-black/[0.1] text-[#1d1d1f] text-xs font-medium transition cursor-pointer shrink-0"
            >
              Voir instructions
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] text-xs font-medium transition cursor-pointer ${className}`}
            title="Installer sur iPhone ou iPad"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>Installer</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-black/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#1d1d1f] flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#0071e3]" />
                  <span>Installer sur iOS</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.05] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#555558] leading-relaxed">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#f5f5f7]">
                  <Share className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#1d1d1f]">1. Appuyez sur Partager :</span>
                    <p className="text-[11px] text-[#86868b] mt-0.5">
                      Touchez le bouton de partage dans la barre d'outils de Safari en bas de l'écran.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#f5f5f7]">
                  <PlusSquare className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#1d1d1f]">2. Sur l'écran d'accueil :</span>
                    <p className="text-[11px] text-[#86868b] mt-0.5">
                      Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-[#86868b] italic">
                  L'icône apparaîtra sur votre écran d'accueil et fonctionnera complètement hors-ligne sans connexion réseau.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] transition cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // If in settings, show informational block
  if (variant === 'settings') {
    return (
      <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] flex items-center justify-between text-xs text-[#86868b]">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#0071e3]" />
          <span>Application PWA installable sur Chrome, Edge, Safari iOS et Android.</span>
        </div>
      </div>
    );
  }

  return null;
};
