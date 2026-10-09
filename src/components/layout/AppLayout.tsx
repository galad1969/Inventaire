import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ItemFormModal } from '../inventory/ItemFormModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { InsuranceReportModal } from '../inventory/InsuranceReportModal';
import { OfflineIndicator } from '../common/OfflineIndicator';
import { useInventory } from '../../context/InventoryContext';

export const AppLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const {
    isFormModalOpen,
    itemToEdit,
    closeFormModal,
    confirmOptions,
    closeConfirmation,
    isInsuranceModalOpen,
    closeInsuranceModal,
  } = useInventory();

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col font-sans selection:bg-[#0071e3] selection:text-white transition-colors duration-150">
      {/* Barre de navigation supérieure (Navbar) */}
      <Navbar
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      {/* Conteneur principal avec Sidebar latérale et zone de contenu */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex min-w-0">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Zone de contenu principale (dynamique via les routes de HashRouter) */}
        <main className="flex-1 min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Modal globale d'ajout et d'édition d'objets */}
      <ItemFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        itemToEdit={itemToEdit}
      />

      {/* Modal globale de confirmation sécurisée (100% fiable sans iframe window.confirm) */}
      <ConfirmModal
        isOpen={Boolean(confirmOptions)}
        options={confirmOptions}
        onClose={closeConfirmation}
      />

      {/* Modal globale de rapport d'assurance prêt à imprimer */}
      <InsuranceReportModal
        isOpen={isInsuranceModalOpen}
        onClose={closeInsuranceModal}
      />

      {/* Indicateur de statut hors-ligne PWA */}
      <OfflineIndicator />

      {/* Pied de page discret style Apple */}
      <footer className="border-t border-black/[0.05] dark:border-white/[0.08] bg-white/70 dark:bg-[#121214]/70 py-4 text-center text-xs text-[#86868b] dark:text-[#8e8e93] print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Inventaire Privé • 100% Hors-ligne avec IndexedDB</span>
          <span className="text-[11px] text-[#a1a1a6] dark:text-[#636366]">
            Hébergement statique GitHub Pages (HashRouter)
          </span>
        </div>
      </footer>
    </div>
  );
};
