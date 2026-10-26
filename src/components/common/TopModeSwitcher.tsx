import React from 'react';
import { useFlamar } from '../../context/FlamarContext';
import { ShoppingBag, LayoutDashboard, Calculator, Wallet, Package, FileSpreadsheet, Phone } from 'lucide-react';
import { ErpSection } from '../../types/database';

export const TopModeSwitcher: React.FC = () => {
  const { environment, setEnvironment, erpSection, setErpSection } = useFlamar();

  const quickErpJump = (sec: ErpSection) => {
    setEnvironment('erp');
    setErpSection(sec);
  };

  return (
    <div className="bg-[#1C110E] text-white text-xs px-3 sm:px-6 py-2 border-b border-[#82260E]/50 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Identificação Corporativa */}
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="font-bold tracking-wider text-[#FBF1D6]">FLAMAR COLCHÕES</span>
          <span className="hidden md:inline text-white/40">•</span>
          <span className="hidden md:inline text-white/80">
            CNPJ 66.641.952/0001-00 • Rua Jotacá, 378 - Vila Picinin, SP
          </span>
        </div>

        {/* Régua de Alternância Viva (Todas as abas sempre visíveis em estilo régua com forte destaque na ativa) */}
        <div className="flex items-center gap-1.5 bg-[#2B1813] p-1 rounded-xl border border-white/15 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setEnvironment('storefront')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              environment === 'storefront'
                ? 'bg-[#B83918] text-white shadow-sm ring-1 ring-[#D4AF37]'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Loja Virtual (Cliente)</span>
          </button>

          <button
            onClick={() => quickErpJump('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              environment === 'erp' && erpSection === 'dashboard'
                ? 'bg-[#B83918] text-white shadow-sm ring-1 ring-[#D4AF37]'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>ERP Administrativo</span>
          </button>

          <button
            onClick={() => quickErpJump('pdv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              environment === 'erp' && erpSection === 'pdv'
                ? 'bg-[#B83918] text-white shadow-sm ring-1 ring-[#D4AF37]'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <Calculator size={14} />
            <span>PDV Balcão</span>
          </button>

          <button
            onClick={() => quickErpJump('cashflow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              environment === 'erp' && erpSection === 'cashflow'
                ? 'bg-[#B83918] text-white shadow-sm ring-1 ring-[#D4AF37]'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <Wallet size={14} />
            <span>Fluxo de Caixa</span>
          </button>

          <button
            onClick={() => quickErpJump('payables')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              environment === 'erp' && erpSection === 'payables'
                ? 'bg-[#B83918] text-white shadow-sm ring-1 ring-[#D4AF37]'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Contas a Pagar</span>
          </button>

          <button
            onClick={() => quickErpJump('inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              environment === 'erp' && erpSection === 'inventory'
                ? 'bg-[#B83918] text-white shadow-sm ring-1 ring-[#D4AF37]'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <Package size={14} />
            <span>Estoque</span>
          </button>
        </div>

        {/* Telefone Oficial */}
        <a
          href="tel:1139754947"
          className="hidden xl:flex items-center gap-1.5 text-[#FBF1D6] font-semibold hover:underline"
        >
          <Phone size={13} className="text-[#D4AF37]" />
          <span>(11) 3975-4947</span>
        </a>
      </div>
    </div>
  );
};
