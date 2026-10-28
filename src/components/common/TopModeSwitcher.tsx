import React from 'react';
import { useFlamar } from '../../context/FlamarContext';
import {
  ShoppingBag,
  LayoutDashboard,
  Calculator,
  Wallet,
  Package,
  FileSpreadsheet,
  DollarSign,
  Truck,
  Users,
  PieChart
} from 'lucide-react';
import { ErpSection } from '../../types/database';

export const TopModeSwitcher: React.FC = () => {
  const { environment, setEnvironment, erpSection, setErpSection } = useFlamar();

  // Na visão do cliente (Loja Virtual), NÃO exibe nenhuma barra de abas do ERP
  if (environment !== 'erp') return null;

  const erpTabs: { id: ErpSection; label: string; icon: React.ReactNode }[] = [
    { id: 'inventory', label: 'Estoque & Preços', icon: <Package size={14} /> },
  ];

  return (
    <div className="bg-[#1C110E] text-white text-xs px-3 sm:px-6 py-2.5 border-b border-[#82260E]/60 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Régua de Abas do ERP (Apenas Estoque) */}
        <div className="flex items-center gap-1.5 bg-[#2B1813] p-1 rounded-xl border border-white/15 overflow-x-auto no-scrollbar">
          {erpTabs.map((t) => {
            const active = erpSection === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setErpSection(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#B83918] text-white shadow-sm ring-1 ring-[#D4AF37]'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Botão para Voltar à Loja do Cliente */}
        <button
          onClick={() => setEnvironment('storefront')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#c59f2d] text-[#1C110E] font-extrabold text-xs uppercase tracking-wider shadow shrink-0"
        >
          <ShoppingBag size={14} />
          <span>Voltar para a Loja</span>
        </button>
      </div>
    </div>
  );
};
