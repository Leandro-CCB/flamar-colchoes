import React, { useEffect, useState } from 'react';
import { FlamarProvider, useFlamar } from './context/FlamarContext';
import { TopModeSwitcher } from './components/common/TopModeSwitcher';
import { StoreHeader } from './components/store/StoreHeader';
import { StoreHome } from './components/store/StoreHome';
import {
  ProductDetailModal,
  CartCheckoutDrawer,
  StoreFooter
} from './components/store/StoreModalsAndFooter';
import { LeadsterChatWidget } from './components/store/LeadsterChatWidget';
import { ErpLayout } from './components/erp/ErpLayout';
import { AdminLoginModal } from './components/common/AdminLoginModal';

const MainApp: React.FC = () => {
  const { environment, setEnvironment, currentUser, setErpSection } = useFlamar();
  const [storeSection, setStoreSection] = useState<'catalogo' | 'sobre' | 'localizacao' | 'blog'>('catalogo');
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    if (environment === 'erp' && !currentUser) {
      setEnvironment('storefront');
      setLoginModalOpen(true);
    }
  }, [environment, currentUser, setEnvironment]);

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    setErpSection('inventory');
    setEnvironment('erp');
  };

  const handleLoginClose = () => {
    setLoginModalOpen(false);
    setEnvironment('storefront');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F4] text-[#231B18] font-sans">
      {/* Barra Superior Multi-Ambiente (Loja Virtual <-> ERP Administrativo) */}
      <TopModeSwitcher />

      {environment === 'storefront' ? (
        <div className="flex-1 flex flex-col">
          <StoreHeader activeSection={storeSection} setActiveSection={setStoreSection} />
          <main className="flex-1">
            <StoreHome activeSection={storeSection} setActiveSection={setStoreSection} />
          </main>
          <StoreFooter />
        </div>
      ) : (
        <ErpLayout />
      )}

      {/* Modais Globais da Loja */}
      <ProductDetailModal />
      <CartCheckoutDrawer />

      {/* Consultor Virtual Proativo Leadster no Site */}
      {environment === 'storefront' && <LeadsterChatWidget />}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={handleLoginClose}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default function App() {
  return (
    <FlamarProvider>
      <MainApp />
    </FlamarProvider>
  );
}
