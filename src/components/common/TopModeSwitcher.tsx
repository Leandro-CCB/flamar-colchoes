import React from 'react';
import { useFlamar } from '../../context/FlamarContext';
import {
  ShoppingBag,
  Package,
  Users,
  Eye,
  BookOpen,
  Settings,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { ErpSection } from '../../types/database';

export const TopModeSwitcher: React.FC = () => {
  const { environment, setEnvironment, erpSection, setErpSection, visits, currentUser, logoutUser, users } = useFlamar();

  // Na visão do cliente (Loja Virtual), NÃO exibe nenhuma barra de abas do ERP
  if (environment !== 'erp') return null;

  const isMaster = currentUser?.role === 'master';
  const allowedSections = isMaster
    ? ['inventory', 'leads', 'customers', 'analytics', 'blog', 'settings', 'users']
    : (currentUser?.allowed_sections || ['inventory']);

  const allErpTabs: { id: ErpSection; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'inventory', label: 'Estoque & Preços', icon: <Package size={14} /> },
    { id: 'leads', label: 'Leads (Chat)', icon: <Users size={14} /> },
    { id: 'customers', label: 'Clientes & Compras', icon: <Users size={14} /> },
    {
      id: 'analytics',
      label: 'Visitas & Métricas',
      icon: <Eye size={14} />,
      badge: visits.length > 0 ? `${visits.length}` : undefined
    },
    { id: 'blog', label: 'Blog', icon: <BookOpen size={14} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings size={14} /> },
    { id: 'users', label: 'Usuários', icon: <ShieldCheck size={14} />, badge: String(users.length) }
  ];

  const erpTabs = allErpTabs.filter((t) => allowedSections.includes(t.id));

  return (
    <div className="bg-[#1C110E] text-white text-xs px-3 sm:px-6 py-2.5 border-b border-[#82260E]/60 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Régua de Abas do ERP (Abas Dinâmicas por Usuário) */}
        <div className="flex items-center gap-1.5 bg-[#2B1813] p-1 rounded-xl border border-white/15 overflow-x-auto no-scrollbar">
          {erpTabs.map((t) => {
            const active = erpSection === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setErpSection(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#B83918] text-white shadow-sm ring-1 ring-[#D4AF37]'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#D4AF37] text-[#1C110E] font-black">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Informações do Usuário e Botão de Voltar */}
        <div className="flex items-center gap-2">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px]">
              <span className="text-amber-400 font-black">
                {currentUser.role === 'master' ? '👑' : '👤'}
              </span>
              <span className="font-bold text-gray-200">{currentUser.name}</span>
              <button
                onClick={logoutUser}
                title="Desconectar da Área do Administrador"
                className="text-gray-400 hover:text-red-400 ml-1 cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>
          )}

          {/* Botão para Voltar à Loja do Cliente */}
          <button
            onClick={() => setEnvironment('storefront')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#c59f2d] text-[#1C110E] font-extrabold text-xs uppercase tracking-wider shadow shrink-0 cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>Voltar para a Loja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
