import React, { useState } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import {
  CashTransaction,
  PayableAccount,
  ReceivableAccount,
  PaymentMethod
} from '../../types/database';
import {
  Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Trash2, CheckCircle2,
  Clock, AlertTriangle, FileSpreadsheet, TrendingUp, DollarSign, Filter
} from 'lucide-react';

// ── 1. FLUXO DE CAIXA DIÁRIO & CONCILIAÇÃO ────────────────────────────────
export const CashFlowView: React.FC = () => {
  const { cashTransactions, addCashTransaction, deleteCashTransaction } = useFlamar();

  const [typeFilter, setTypeFilter] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [accountFilter, setAccountFilter] = useState<string>('todas');
  const [showModal, setShowModal] = useState(false);

  // Novo lançamento
  const [txType, setTxType] = useState<'entrada' | 'saida'>('entrada');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txCategory, setTxCategory] = useState<CashTransaction['category']>('Venda Loja Física');
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txMethod, setTxMethod] = useState<PaymentMethod>('pix');
  const [txAccount, setTxAccount] = useState<CashTransaction['account']>('Caixa Loja (Rua Jotacá)');

  const filtered = cashTransactions.filter((t) => {
    const matchType = typeFilter === 'todos' || t.type === typeFilter;
    const matchAcc = accountFilter === 'todas' || t.account === accountFilter;
    return matchType && matchAcc;
  });

  const totalEntradas = filtered
    .filter((t) => t.type === 'entrada')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaidas = filtered
    .filter((t) => t.type === 'saida')
    .reduce((acc, t) => acc + t.amount, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(txAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0 || !txDescription.trim()) return;

    addCashTransaction({
      date: txDate,
      time: new Date().toTimeString().slice(0, 5),
      type: txType,
      category: txCategory,
      description: txDescription.trim(),
      amount: val,
      payment_method: txMethod,
      account: txAccount,
      operator: 'Admin Flamar'
    });

    setTxDescription('');
    setTxAmount('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-soft">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#82260E]">
            TESOURARIA & MOVIMENTAÇÃO DE CAIXA
          </span>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Fluxo de Caixa Diário • Flamar Colchões
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Controle em tempo real do Caixa Físico (Rua Jotacá, 378), Conta Corrente e PIX Digital.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          <span>Novo Lançamento no Caixa</span>
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-soft">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-extrabold uppercase">Total de Entradas</span>
            <ArrowUpCircle size={20} />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Vendas PDV, PIX e Recebimentos</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-soft">
          <div className="flex items-center justify-between text-red-700 mb-2">
            <span className="text-xs font-extrabold uppercase">Total de Saídas</span>
            <ArrowDownCircle size={20} />
          </div>
          <div className="text-2xl font-black text-red-700">
            R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Fornecedores, Fretes e Despesas Pagas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-soft">
          <div className="flex items-center justify-between text-[#82260E] mb-2">
            <span className="text-xs font-extrabold uppercase">Saldo Líquido em Caixa</span>
            <Wallet size={20} />
          </div>
          <div className={`text-2xl font-black ${saldoLiquido >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Disponibilidade consolidada do período</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2">
          {(['todos', 'entrada', 'saida'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase ${
                typeFilter === t
                  ? 'bg-[#82260E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t === 'todos' ? 'Todos' : t === 'entrada' ? 'Entradas (+)' : 'Saídas (-)'}
            </button>
          ))}
        </div>

        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white"
        >
          <option value="todas">Todas as Contas / Caixas</option>
          <option value="Caixa Loja (Rua Jotacá)">Caixa Loja (Rua Jotacá)</option>
          <option value="Conta Corrente Empresarial">Conta Corrente Empresarial</option>
          <option value="Asaas / PIX Digital">Asaas / PIX Digital</option>
        </select>
      </div>

      {/* Tabela ou Empty State */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-soft">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Wallet size={38} className="text-[#82260E] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-gray-900">
              Nenhuma movimentação registrada neste filtro
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              O Fluxo de Caixa está pronto para receber lançamentos reais (vendas pelo PDV Balcão, baixas de Contas a Pagar ou entradas avulsas).
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#82260E] text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Registrar Primeiro Lançamento no Caixa</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F4] border-b border-gray-200 text-gray-600 uppercase">
                  <th className="py-3.5 px-4 font-bold">Data / Hora</th>
                  <th className="py-3.5 px-4 font-bold">Tipo</th>
                  <th className="py-3.5 px-4 font-bold">Categoria</th>
                  <th className="py-3.5 px-4 font-bold">Descrição / Histórico</th>
                  <th className="py-3.5 px-4 font-bold">Conta / Forma</th>
                  <th className="py-3.5 px-4 font-bold text-right">Valor (R$)</th>
                  <th className="py-3.5 px-4 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-700">
                      {tx.date} <span className="text-gray-400">{tx.time}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          tx.type === 'entrada'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {tx.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{tx.category}</td>
                    <td className="py-3 px-4 text-gray-700">{tx.description}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <div>{tx.account}</div>
                      <span className="text-[10px] uppercase text-gray-400">{tx.payment_method}</span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-extrabold whitespace-nowrap ${
                        tx.type === 'entrada' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {tx.type === 'entrada' ? '+' : '-'} R${' '}
                      {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteCashTransaction(tx.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                        title="Excluir lançamento"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Novo Lançamento */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-gray-900">
              Novo Lançamento no Fluxo de Caixa
            </h3>
            <form onSubmit={handleAddTx} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('entrada');
                    setTxCategory('Venda Loja Física');
                  }}
                  className={`py-2.5 rounded-xl font-bold uppercase border ${
                    txType === 'entrada'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  Entrada (+)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('saida');
                    setTxCategory('Fornecedor de Colchões');
                  }}
                  className={`py-2.5 rounded-xl font-bold uppercase border ${
                    txType === 'saida'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  Saída (-)
                </button>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Categoria</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as CashTransaction['category'])}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="Venda Loja Física">Venda Loja Física</option>
                  <option value="Venda Catálogo Digital">Venda Catálogo Digital</option>
                  <option value="Recebimento Parcela">Recebimento Parcela</option>
                  <option value="Fornecedor de Colchões">Fornecedor de Colchões (Luckspuma/Castor/FA)</option>
                  <option value="Frete & Logística">Frete & Logística</option>
                  <option value="Aluguel & IPTU">Aluguel & IPTU (Rua Jotacá)</option>
                  <option value="Energia / Água / Internet">Energia / Água / Internet</option>
                  <option value="Folha & Comissões">Folha & Comissões</option>
                  <option value="Impostos / DAS">Impostos / DAS</option>
                  <option value="Outras Despesas">Outras Despesas</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Descrição detalhada *</label>
                <input
                  type="text"
                  required
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="Ex: Venda à vista Colchão Roma / Pagto Frete..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Data</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Conta / Caixa</label>
                  <select
                    value={txAccount}
                    onChange={(e) => setTxAccount(e.target.value as CashTransaction['account'])}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="Caixa Loja (Rua Jotacá)">Caixa Loja (Rua Jotacá)</option>
                    <option value="Conta Corrente Empresarial">Conta Corrente Empresarial</option>
                    <option value="Asaas / PIX Digital">Asaas / PIX Digital</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Meio de Pagto</label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito_10x">Cartão Crédito</option>
                    <option value="cartao_debito">Cartão Débito</option>
                    <option value="boleto_faturado">Boleto Faturado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#82260E] text-white font-bold"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 2. CONTAS A PAGAR (FORNECEDORES E DESPESAS OPERACIONAIS) ──────────────
export const PayablesView: React.FC = () => {
  const { payables, suppliers, addPayable, markPayableAsPaid, deletePayable } = useFlamar();
  const [showModal, setShowModal] = useState(false);
  const [supplierName, setSupplierName] = useState(suppliers[0]?.trade_name || 'Luckspuma Colchões');
  const [docNumber, setDocNumber] = useState('');
  const [category, setCategory] = useState<PayableAccount['category']>('Fornecedor de Colchões');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('boleto_faturado');

  const totalPending = payables
    .filter((b) => b.status !== 'pago')
    .reduce((acc, b) => acc + b.amount, 0);

  const totalPaid = payables
    .filter((b) => b.status === 'pago')
    .reduce((acc, b) => acc + b.amount, 0);

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0 || !description.trim()) return;

    addPayable({
      supplier_name: supplierName,
      document_number: docNumber.trim() || `NF-${Date.now().toString().slice(-4)}`,
      category,
      description: description.trim(),
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      amount: val,
      status: 'pendente',
      payment_method: paymentMethod
    });

    setDocNumber('');
    setDescription('');
    setAmount('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-soft">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#82260E]">
            OBRIGAÇÕES FINANCEIRAS & DUPLICATAS DE FÁBRICA
          </span>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Contas a Pagar • Fornecedores & Custos Fixos
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ao dar baixa em uma conta a pagar, a saída é lançada automaticamente no Fluxo de Caixa.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          <span>Cadastrar Conta a Pagar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-soft">
          <span className="text-xs font-extrabold uppercase text-amber-800 block">
            Total em Aberto / A Vencer
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-soft">
          <span className="text-xs font-extrabold uppercase text-emerald-800 block">
            Total Quitado / Baixado
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-soft">
        {payables.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileSpreadsheet size={38} className="text-[#82260E] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-gray-900">
              Nenhuma conta a pagar cadastrada
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Registre boletos de fábrica (Luckspuma, Castor, FA Maringá, Liderflex), aluguel ou despesas da loja para controlar vencimentos e baixar direto no caixa.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#82260E] text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Lançar Primeira Conta a Pagar</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F4] border-b border-gray-200 text-gray-600 uppercase">
                  <th className="py-3.5 px-4 font-bold">Vencimento</th>
                  <th className="py-3.5 px-4 font-bold">Doc / NF</th>
                  <th className="py-3.5 px-4 font-bold">Fornecedor / Favorecido</th>
                  <th className="py-3.5 px-4 font-bold">Categoria & Descrição</th>
                  <th className="py-3.5 px-4 font-bold text-right">Valor (R$)</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-center">Ação Financeira</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payables.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-800 whitespace-nowrap">
                      {bill.due_date}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{bill.document_number}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{bill.supplier_name}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#82260E] block">{bill.category}</span>
                      <span className="text-gray-600">{bill.description}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-gray-900 whitespace-nowrap">
                      R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          bill.status === 'pago'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {bill.status === 'pago' ? `Pago (${bill.paid_date})` : 'Pendente'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {bill.status !== 'pago' && (
                          <button
                            onClick={() => markPayableAsPaid(bill.id, 'Conta Corrente Empresarial')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1"
                          >
                            <CheckCircle2 size={13} />
                            <span>Dar Baixa (Pagar)</span>
                          </button>
                        )}
                        <button
                          onClick={() => deletePayable(bill.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-gray-900">
              Nova Conta a Pagar / Duplicata
            </h3>
            <form onSubmit={handleAddBill} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Fornecedor / Favorecido</label>
                <input
                  type="text"
                  required
                  list="flamar-suppliers"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
                <datalist id="flamar-suppliers">
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.trade_name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nº Documento / NF</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="Ex: NF-4582 / Bol 1/3"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PayableAccount['category'])}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="Fornecedor de Colchões">Fornecedor de Colchões</option>
                    <option value="Frete & Combustível">Frete & Combustível</option>
                    <option value="Aluguel & Encargos">Aluguel & Encargos</option>
                    <option value="Energia / Telecom">Energia / Telecom</option>
                    <option value="Folha & Comissões">Folha & Comissões</option>
                    <option value="Impostos & Tributos">Impostos & Tributos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Lote 5 Colchões Roma + 3 Box Baú Casal"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#82260E] text-white font-bold"
                >
                  Registrar Conta a Pagar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 3. CONTAS A RECEBER & CREDIÁRIO / CARTÃO ──────────────────────────────
export const ReceivablesView: React.FC = () => {
  const { receivables, markReceivableAsReceived, deleteReceivable } = useFlamar();

  const totalOpen = receivables
    .filter((r) => r.status !== 'recebido')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalReceived = receivables
    .filter((r) => r.status === 'recebido')
    .reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-soft">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#82260E]">
          RECEBÍVEIS DE VENDAS PARCELADAS
        </span>
        <h2 className="text-2xl font-serif font-bold text-gray-900">
          Contas a Receber • Parcelas 10x & Boletos
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Gerado automaticamente a partir das vendas parceladas no PDV ou Catálogo Digital.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-soft">
          <span className="text-xs font-extrabold uppercase text-blue-800 block">
            A Receber em Aberto
          </span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            R$ {totalOpen.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-soft">
          <span className="text-xs font-extrabold uppercase text-emerald-800 block">
            Total Recebido / Conciliado
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-soft">
        {receivables.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <DollarSign size={38} className="text-[#82260E] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-gray-900">
              Nenhuma parcela a receber em aberto
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Quando uma venda parcelada (até 10x sem juros) for emitida no PDV ou no site, as parcelas aparecerão automaticamente aqui para conciliação.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F4] border-b border-gray-200 text-gray-600 uppercase">
                  <th className="py-3.5 px-4 font-bold">Vencimento</th>
                  <th className="py-3.5 px-4 font-bold">Pedido</th>
                  <th className="py-3.5 px-4 font-bold">Cliente</th>
                  <th className="py-3.5 px-4 font-bold">Parcela</th>
                  <th className="py-3.5 px-4 font-bold text-right">Valor (R$)</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {receivables.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-800">{rec.due_date}</td>
                    <td className="py-3 px-4 font-semibold text-[#82260E]">{rec.order_id}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{rec.customer_name}</td>
                    <td className="py-3 px-4 text-gray-600">{rec.installment_label}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-gray-900">
                      R$ {rec.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          rec.status === 'recebido'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {rec.status === 'recebido' ? 'Recebido' : 'A Receber'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {rec.status !== 'recebido' && (
                          <button
                            onClick={() => markReceivableAsReceived(rec.id, 'Conta Corrente Empresarial')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                          >
                            Baixar no Caixa
                          </button>
                        )}
                        <button
                          onClick={() => deleteReceivable(rec.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── 4. DRE GERENCIAL (DEMONSTRATIVO DE RESULTADO DO EXERCÍCIO) ───────────
export const DreReportView: React.FC = () => {
  const { orders, payables, cashTransactions } = useFlamar();

  const receitaBrutaVendas = orders.reduce((acc, o) => acc + o.subtotal, 0);
  const descontosConcedidos = orders.reduce((acc, o) => acc + o.discount, 0);
  const receitaLiquida = receitaBrutaVendas - descontosConcedidos;

  const cmvMercadorias = orders.reduce(
    (acc, o) =>
      acc + o.items.reduce((s, item) => s + item.cost_price * item.quantity, 0),
    0
  );

  const lucroBruto = receitaLiquida - cmvMercadorias;

  const despesasOperacionais = cashTransactions
    .filter((t) => t.type === 'saida' && t.category !== 'Fornecedor de Colchões')
    .reduce((acc, t) => acc + t.amount, 0);

  const resultadoLiquido = lucroBruto - despesasOperacionais;
  const margemBrutaPct = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-soft">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#82260E]">
          CONTABILIDADE GERENCIAL • SEM ASSINATURAS FORMAIS
        </span>
        <h2 className="text-2xl font-serif font-bold text-gray-900">
          DRE Gerencial • Margem de Contribuição & Lucratividade
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Demonstrativo apurado automaticamente sobre os pedidos emitidos, custo de fábrica (CMV) e despesas operacionais.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-soft space-y-3 text-xs sm:text-sm">
        <div className="flex justify-between py-2.5 border-b border-gray-100 font-bold text-gray-900">
          <span>1. (+) RECEITA OPERACIONAL BRUTA DE VENDAS ({orders.length} pedidos)</span>
          <span>R$ {receitaBrutaVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-100 text-red-600 pl-4">
          <span>(-) Descontos Concedidos (5% à Vista PIX/Dinheiro)</span>
          <span>- R$ {descontosConcedidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between py-2.5 border-b border-gray-200 font-extrabold text-[#82260E] bg-[#FFF7F4] px-3 rounded-xl">
          <span>2. (=) RECEITA OPERACIONAL LÍQUIDA</span>
          <span>R$ {receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-100 text-red-700 pl-4">
          <span>3. (-) CMV — Custo das Mercadorias Vendidas (Tabela Fábrica)</span>
          <span>- R$ {cmvMercadorias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between py-2.5 border-b border-gray-200 font-extrabold text-emerald-800 bg-emerald-50/70 px-3 rounded-xl">
          <span>4. (=) LUCRO BRUTO COMERCIAL (Margem: {margemBrutaPct.toFixed(1)}%)</span>
          <span>R$ {lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-100 text-red-600 pl-4">
          <span>5. (-) Despesas Operacionais & Logísticas Baixadas no Caixa</span>
          <span>- R$ {despesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between py-4 px-4 rounded-2xl bg-[#1C110E] text-white font-black text-base">
          <span>6. (=) RESULTADO LÍQUIDO DO EXERCÍCIO (EBITDA)</span>
          <span className="text-[#D4AF37]">
            R$ {resultadoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};
