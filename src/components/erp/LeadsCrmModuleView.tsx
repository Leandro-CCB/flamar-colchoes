import React, { useState } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import { LeadRecord, LeadStatus } from '../../types/database';
import { FLAMAR_COMPANY_INFO } from '../../lib/flamarCatalog';
import {
  Users,
  Search,
  Filter,
  PhoneCall,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  ShoppingCart,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  TrendingUp,
  MapPin,
  Calendar,
  MessageSquare
} from 'lucide-react';

export const LeadsCrmModuleView: React.FC = () => {
  const { leads, updateLeadStatus, deleteLead, convertLeadToOrder, orders } = useFlamar();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Filtros de leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      (l.product_name && l.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.address && l.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Métricas do Funil
  const totalLeads = leads.length;
  const orcamentosGerados = leads.filter(l => l.status === 'orcamento_gerado' || l.status === 'aguardando_confirmacao').length;
  const convertidos = leads.filter(l => l.status === 'convertido_venda').length;
  const taxaConversao = totalLeads > 0 ? ((convertidos / totalLeads) * 100).toFixed(1) : '0';
  const valorTotalOrcado = leads.reduce((acc, l) => acc + (l.total_amount || 0), 0);

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'novo':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700">Novo Lead</span>;
      case 'orcamento_gerado':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700">Orçamento Feito</span>;
      case 'aguardando_confirmacao':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700">Aguardando Confirmação</span>;
      case 'convertido_venda':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 flex items-center gap-1">✓ Convertido em Venda</span>;
      case 'perdido':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-700">Perdido / Sem Retorno</span>;
      default:
        return null;
    }
  };

  const handleOpenWhatsApp = (lead: LeadRecord) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const phoneWithDdd = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Olá ${lead.name}! Sou consultor da Flamar Colchões.\n\n` +
      `Recebi sua solicitação do colchão *${lead.product_name || 'Flamar'}* no valor de R$ ${(lead.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.\n\n` +
      `Gostaria de confirmar seus dados para agendarmos a entrega no endereço: *${lead.address || 'São Paulo'}*?`
    );
    window.open(`https://wa.me/${phoneWithDdd}?text=${msg}`, '_blank');
  };

  const handleConvertOrder = (lead: LeadRecord) => {
    if (lead.status === 'convertido_venda') {
      alert('Este lead já foi convertido em pedido de venda!');
      return;
    }
    const order = convertLeadToOrder(lead.id);
    if (order) {
      alert(`🎉 Pedido #${order.id} gerado com sucesso no ERP! Cliente cadastrado e venda registrada.`);
      if (selectedLead?.id === lead.id) {
        setSelectedLead({ ...lead, status: 'convertido_venda' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER DA ABA LEADS & COMERCIAL ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-[#82260E] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={14} /> CRM & Fluxo de Conversão Próprio
          </div>
          <h2 className="text-2xl font-serif font-black text-gray-900">
            Controle de Leads & Orçamentos (Chatbot Comercial)
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Todos os clientes atendidos pelo chat do site com produto de interesse, orçamento detalhado e dados cadastrais.
          </p>
        </div>
      </div>

      {/* ── CARDS DE MÉTRICAS DO FUNIL ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Leads</span>
            <Users size={18} className="text-[#82260E]" />
          </div>
          <div className="text-2xl font-black text-gray-900">{totalLeads}</div>
          <div className="text-[11px] text-gray-500 mt-1">Visitantes que iniciaram consultoria</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Orçamentos Gerados</span>
            <FileText size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{orcamentosGerados}</div>
          <div className="text-[11px] text-gray-500 mt-1">Com produto, endereço e valores</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Vendas Fechadas</span>
            <ShoppingCart size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{convertidos}</div>
          <div className="text-[11px] text-gray-500 mt-1">Taxa de conversão: <strong>{taxaConversao}%</strong></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Volume em Negociação</span>
            <DollarSign size={18} className="text-brand-600" />
          </div>
          <div className="text-xl font-black text-gray-900">
            R$ {valorTotalOrcado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Valor acumulado dos orçamentos</div>
        </div>
      </div>

      {/* ── BARRA DE PESQUISA E FILTROS ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-soft flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, WhatsApp, produto ou cidade..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#82260E] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'todos', label: 'Todos os Leads' },
            { id: 'orcamento_gerado', label: 'Orçamentos Feitos' },
            { id: 'aguardando_confirmacao', label: 'Aguardando Confirmação' },
            { id: 'convertido_venda', label: 'Convertidos (Venda)' },
            { id: 'perdido', label: 'Perdidos' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#82260E] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABELA DE TRÂMITES COMERCIAIS & LEADS ── */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#FAF7F4] border-b border-gray-200 text-gray-600 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Data / Hora</th>
                <th className="p-4">Cliente / Contato</th>
                <th className="p-4">Produto & Medida</th>
                <th className="p-4">Endereço de Entrega</th>
                <th className="p-4">Valor Orçado</th>
                <th className="p-4 text-center">Status Comercial</th>
                <th className="p-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Nenhum lead encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Data */}
                    <td className="p-4 whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-gray-400" />
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-[10px] text-gray-400 pl-4">
                        {new Date(lead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="p-4">
                      <div className="font-bold text-gray-900 text-sm">{lead.name || 'Cliente Sem Nome'}</div>
                      <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                        <PhoneCall size={12} className="text-emerald-600" />
                        {lead.phone || 'Sem telefone'}
                      </div>
                      {lead.biotype_weight && (
                        <div className="text-[10px] text-brand-700 mt-0.5 font-medium">
                          Perfil: {lead.biotype_weight}
                        </div>
                      )}
                    </td>

                    {/* Produto */}
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-gray-900 truncate">
                        {lead.product_name || 'Não selecionou'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {lead.dimensions || 'Medida padrão'} • Qtd: {lead.quantity || 1}
                      </div>
                    </td>

                    {/* Endereço */}
                    <td className="p-4 max-w-xs">
                      <div className="flex items-start gap-1 text-gray-700">
                        <MapPin size={13} className="text-[#82260E] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{lead.address || 'A combinar / Não informado'}</span>
                      </div>
                    </td>

                    {/* Valor */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-black text-gray-900 text-sm">
                        R$ {(lead.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold uppercase">
                        {lead.payment_method_preference || 'PIX'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>

                    {/* Ações */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botão Ver Histórico do Chat */}
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowHistoryModal(true);
                          }}
                          title="Ver histórico da conversa"
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                        >
                          <MessageSquare size={15} />
                        </button>

                        {/* Botão WhatsApp */}
                        <button
                          onClick={() => handleOpenWhatsApp(lead)}
                          title="Chamar no WhatsApp com orçamento pronto"
                          className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                        >
                          <PhoneCall size={15} />
                        </button>

                        {/* Botão Converter em Pedido ERP */}
                        {lead.status !== 'convertido_venda' ? (
                          <button
                            onClick={() => handleConvertOrder(lead)}
                            title="Apenas conferir e converter em Venda no ERP"
                            className="px-2.5 py-1.5 rounded-lg bg-[#82260E] hover:bg-[#9E2E11] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <CheckCircle size={13} />
                            <span>Confirmar Venda</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg">
                            Faturado ✓
                          </span>
                        )}

                        {/* Botão Excluir */}
                        <button
                          onClick={() => {
                            if (confirm(`Deseja remover o lead de ${lead.name}?`)) {
                              deleteLead(lead.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: HISTÓRICO COMPLETO DA CONVERSA DO CHATBOT COM O CLIENTE ── */}
      {showHistoryModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            {/* Header Modal */}
            <div className="p-5 bg-gradient-to-r from-[#82260E] to-[#9E2E11] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-black text-lg">
                  Auditoria de Atendimento • {selectedLead.name}
                </h3>
                <p className="text-xs text-brand-100 mt-0.5">
                  Telefone: {selectedLead.phone} • Produto: {selectedLead.product_name}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo do Modal (Histórico) */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-gray-50 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2">
                <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider text-brand-700">
                  Resumo do Orçamento Comercial
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Endereço / CEP</span>
                    <strong className="text-gray-800">{selectedLead.address || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Condição</span>
                    <strong className="text-emerald-700">{selectedLead.payment_method_preference || 'PIX'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Valor Total</span>
                    <strong className="text-gray-900 text-sm">
                      R$ {(selectedLead.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider pt-2">
                Transcrição Completa da Conversa com o Bot:
              </h4>

              <div className="space-y-3">
                {selectedLead.chat_history && selectedLead.chat_history.length > 0 ? (
                  selectedLead.chat_history.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line text-xs ${
                          msg.sender === 'user'
                            ? 'bg-[#82260E] text-white rounded-tr-xs'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                        <span className={`block text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-brand-200' : 'text-gray-400'}`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">Nenhuma mensagem registrada no log.</p>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
              >
                Fechar
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenWhatsApp(selectedLead)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <PhoneCall size={14} /> Chamar no WhatsApp
                </button>
                {selectedLead.status !== 'convertido_venda' && (
                  <button
                    onClick={() => {
                      handleConvertOrder(selectedLead);
                      setShowHistoryModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#82260E] hover:bg-[#9E2E11] text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <CheckCircle size={14} /> Confirmar & Gerar Venda
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};