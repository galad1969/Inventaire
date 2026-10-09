import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Archive } from 'lucide-react';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  icon?: 'trash' | 'archive' | 'warning';
  onConfirm: () => void | Promise<void>;
}

interface ConfirmModalProps {
  isOpen: boolean;
  options: ConfirmDialogOptions | null;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  options,
  onClose,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen || !options) return null;

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await options.onConfirm();
      onClose();
    } catch (err) {
      console.error('Erreur lors de la confirmation:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const isDestructive = options.isDestructive !== false;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!isProcessing) onClose();
        }}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden p-6 space-y-4">
          
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40'
              }`}
            >
              {options.icon === 'archive' ? (
                <Archive className="w-5 h-5" />
              ) : isDestructive ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                {options.title}
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#8e8e93] mt-1.5 leading-relaxed">
                {options.message}
              </p>
            </div>

            <button
              disabled={isProcessing}
              onClick={onClose}
              className="p-1 rounded-full text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#86868b] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition cursor-pointer disabled:opacity-50"
            >
              {options.cancelLabel || 'Annuler'}
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirm}
              className={`px-4.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50 ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
              }`}
            >
              {isProcessing
                ? 'En cours...'
                : options.confirmLabel || (isDestructive ? 'Supprimer' : 'Confirmer')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
