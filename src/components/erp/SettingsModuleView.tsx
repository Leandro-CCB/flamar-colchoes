import React, { useState } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import {
  Settings,
  Phone,
  MessageSquare,
  CheckCircle2,
  Building,
  ShieldCheck,
  Save,
  Info,
  ExternalLink,
  Users,
  ChevronRight
} from 'lucide-react';

export const SettingsModuleView: React.FC = () => {
  const { whatsappNumber, whatsappDisplay, setWhatsappNumber, setErpSection, users } = useFlamar();

  const [inputNumber, setInputNumber] = useState(whatsappNumber);
  const [salvoSucesso, setSalvoSucesso] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setWhatsappNumber(inputNumber);
    setSalvoSucesso(true);
    setTimeout(() => setSalvoSucesso(false), 3500);
  }

  // Preview de URL para conferência
  const cleanNum = inputNumber.replace(/\D/g, '');
  const previewWaUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent('Teste de direcionamento WhatsApp Flamar')}`;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Configurações do Sistema & Loja
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os canais de contato, canais de atendimento e direcionamento do WhatsApp.
          </p>
        </div>
      </div>

      {/* Card Acesso Rápido a Usuários */}
      <div className="bg-gradient-to-r from-[#1C110E] to-[#2B1813] rounded-2xl p-6 text-white border border-[#D4AF37]/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#D4AF37]/20 text-[#D4AF37] rounded-xl shrink-0">
            <Users className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Cadastro de Usuários & Níveis de Acesso
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#D4AF37] text-[#1C110E] font-black">
                {users.length} Cadastrado(s)
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Defina quem pode acessar cada aba do ERP (Níveis Master e Administrador com login e senha).
            </p>
          </div>
        </div>

        <button
          onClick={() => setErpSection('users')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#82260E] to-[#B83918] hover:from-[#9B2E11] hover:to-[#DF6442] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-[#D4AF37]/50 shadow transition-all cursor-pointer shrink-0"
        >
          <span>Gerenciar Usuários</span>
          <ChevronRight size={15} className="text-[#D4AF37]" />
        </button>
      </div>

      {/* Card Configuração WhatsApp */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900">
              Direcionamento do WhatsApp Comercial
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Este é o número que recebe todos os leads do Chatbot Consultor, solicitações de compra da loja online e orçamentos do Blog do Sono.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Número do WhatsApp (com DDI e DDD)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputNumber}
                  onChange={(e) => setInputNumber(e.target.value)}
                  placeholder="5511942239108"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Exemplo: <strong>5511942239108</strong> (padrão Brasil: 55 + DDD + 9 dígitos)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Exibição Atual Formatada
              </label>
              <div className="py-2.5 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-800">
                {whatsappDisplay}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Formato visual apresentado nas páginas públicas
              </p>
            </div>
          </div>

          {/* Teste do Link */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-800">
              <Info className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                Link de teste gerado: <strong className="font-mono">{cleanNum}</strong>
              </span>
            </div>
            <a
              href={previewWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0"
            >
              Testar conversa no WhatsApp
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              Salvar Configuração
            </button>

            {salvoSucesso && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Configuração gravada no Supabase com sucesso!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Informações da Empresa & Infraestrutura */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Building className="w-5 h-5 text-gray-600" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Dados Institucionais Registrados
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">Razão / Marca</span>
            <div className="text-sm font-bold text-gray-800 mt-0.5">Flamar Colchões</div>
            <div className="text-xs text-gray-500">Tradição desde 1987 (37 anos)</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">Loja Física Matriz</span>
            <div className="text-sm font-bold text-gray-800 mt-0.5">Pirituba - SP</div>
            <div className="text-xs text-gray-500">Rua Jotacá, 378 • CEP 02930-050</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">Sincronização Cloud</span>
            <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Supabase Integrado
            </div>
            <div className="text-xs text-gray-500">Tabela flamar_configuracoes</div>
          </div>
        </div>
      </div>
    </div>
  );
};