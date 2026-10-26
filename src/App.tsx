import React, { useState } from 'react';
import { FlamarProvider, useFlamar } from './context/FlamarContext';
import { TopModeSwitcher } from './components/common/TopModeSwitcher';
import { StoreHeader } from './components/store/StoreHeader';
import { StoreHome } from './components/store/StoreHome';
import {
  ProductDetailModal,
  CartCheckoutDrawer,
  StoreFooter
} from './components/store/StoreModalsAndFooter';
import { ErpLayout } from './components/erp/ErpLayout';

const MainApp: React.FC = () => {
  const { environment } = useFlamar();
  const [storeSection, setStoreSection] = useState<'catalogo' | 'sobre' | 'localizacao'>('catalogo');

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
