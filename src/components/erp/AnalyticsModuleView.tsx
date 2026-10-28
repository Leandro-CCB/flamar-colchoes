import React, { useState, useMemo } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import {
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  Flame,
  Globe,
  Smartphone,
  Compass,
  ArrowUpRight,
  Filter,
  BarChart3,
  CalendarDays,
  Sparkles,
  RotateCcw
} from 'lucide-react';

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MESES_NOME = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const AnalyticsModuleView: React.FC = () => {
  const { visits, recordVisit } = useFlamar();

  const [periodoFiltro, setPeriodoFiltro] = useState<'30dias' | 'ano' | 'tudo'>('30dias');
  const [mesSelecionado, setMesSelecionado] = useState<string>('todos');

  // Meses únicos disponíveis nas visitas
  const mesesDisponiveis = useMemo(() => {
    const setM = new Set<string>();
    visits.forEach((v) => {
      if (v.month) setM.add(v.month);
    });
    return Array.from(setM).sort().reverse();
  }, [visits]);

  // Visitas filtradas por mês caso selecionado
  const visitasFiltradas = useMemo(() => {
    if (mesSelecionado === 'todos') return visits;
    return visits.filter((v) => v.month === mesSelecionado);
  }, [visits, mesSelecionado]);

  // 1. Total Geral de Visitas
  const totalVisitas = visits.length;
  const totalVisitasFiltradas = visitasFiltradas.length;

  // 2. Visitas por Dia do Mês (Gráfico dos dias)
  const visitasPorDia = useMemo(() => {
    const mapa: Record<string, number> = {};
    visitasFiltradas.forEach((v) => {
      mapa[v.date] = (mapa[v.date] || 0) + 1;
    });

    const chaves = Object.keys(mapa).sort();
    return chaves.map((dia) => ({
      data: dia,
      diaFormatado: dia.slice(5), // MM-DD
      total: mapa[dia]
    }));
  }, [visitasFiltradas]);

  const maxDiaVisitas = useMemo(() => {
    return Math.max(...visitasPorDia.map((d) => d.total), 1);
  }, [visitasPorDia]);

  // 3. Visitas por Mês do Ano (Gráfico dos meses)
  const visitasPorMes = useMemo(() => {
    const mapa: Record<string, number> = {};
    visits.forEach((v) => {
      const m = v.month || v.date.slice(0, 7);
      mapa[m] = (mapa[m] || 0) + 1;
    });

    const chaves = Object.keys(mapa).sort();
    return chaves.map((mes) => {
      const [ano, num] = mes.split('-');
      const nomeMes = MESES_NOME[parseInt(num, 10) - 1] || mes;
      return {
        mesChave: mes,
        label: `${nomeMes.slice(0, 3)}/${ano.slice(2)}`,
        nomeCompleto: `${nomeMes} de ${ano}`,
        total: mapa[mes]
      };
    });
  }, [visits]);

  const maxMesVisitas = useMemo(() => {
    return Math.max(...visitasPorMes.map((m) => m.total), 1);
  }, [visitasPorMes]);

  // 4. Cartão: Dia Mais Acessado
  const diaMaisAcessado = useMemo(() => {
    const mapa: Record<string, number> = {};
    visits.forEach((v) => {
      mapa[v.date] = (mapa[v.date] || 0) + 1;
    });

    let topDia = '';
    let topQtd = 0;
    Object.entries(mapa).forEach(([dia, qtd]) => {
      if (qtd > topQtd) {
        topQtd = qtd;
        topDia = dia;
      }
    });

    if (!topDia) return { data: '—', total: 0, diaSemana: 'Sem dados' };

    const [ano, mes, dia] = topDia.split('-').map(Number);
    const dt = new Date(ano, mes - 1, dia);
    const diaSemana = DIAS_SEMANA[dt.getDay()] || '';

    return {
      data: `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`,
      total: topQtd,
      diaSemana
    };
  }, [visits]);

  // 5. Cartão: Horário com Mais Visitas
  const horarioMaisAcessado = useMemo(() => {
    const mapaHoras: Record<number, number> = {};
    for (let i = 0; i < 24; i++) mapaHoras[i] = 0;

    visits.forEach((v) => {
      const h = typeof v.hour === 'number' ? v.hour : new Date(v.timestamp).getHours();
      mapaHoras[h] = (mapaHoras[h] || 0) + 1;
    });

    let topHora = 0;
    let topQtd = 0;
    Object.entries(mapaHoras).forEach(([h, qtd]) => {
      if (qtd > topQtd) {
        topQtd = qtd;
        topHora = Number(h);
      }
    });

    return {
      horaFormatada: `${String(topHora).padStart(2, '0')}:00 às ${String(topHora + 1).padStart(2, '0')}:00`,
      total: topQtd,
      mapaHoras
    };
  }, [visits]);

  // 6. Dia da Semana com Mais Movimento
  const diaSemanaMaisAcessado = useMemo(() => {
    const contagem = [0, 0, 0, 0, 0, 0, 0];
    visits.forEach((v) => {
      const d = typeof v.dayOfWeek === 'number' ? v.dayOfWeek : new Date(v.timestamp).getDay();
      contagem[d] = (contagem[d] || 0) + 1;
    });

    let topIdx = 0;
    let topQtd = 0;
    contagem.forEach((qtd, idx) => {
      if (qtd > topQtd) {
        topQtd = qtd;
        topIdx = idx;
      }
    });

    return {
      nome: DIAS_SEMANA[topIdx],
      total: topQtd
    };
  }, [visits]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Banner Superior ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1C110E] via-[#2E1610] to-[#82260E] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#D4AF37]/30">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
            <Eye size={14} /> MÉTRICAS & AUDIÊNCIA DIGITAL • FLAMAR COLCHÕES
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black mt-1">
            Contador de Visitas & Painel Analítico
          </h1>
          <p className="text-xs text-gray-300 mt-1.5 max-w-2xl leading-relaxed">
            Monitore o tráfego em tempo real: volume total de acessos, gráficos detalhados por dias do mês e meses do ano, pico de visitas e faixa de horário de maior audiência.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            <option value="todos" className="bg-[#1C110E] text-white">Todos os Meses</option>
            {mesesDisponiveis.map((m) => (
              <option key={m} value={m} className="bg-[#1C110E] text-white">
                Mês: {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 4 Cartões Analíticos Principais ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Acessos */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
            <span>Total de Visitas</span>
            <Eye size={18} className="text-[#82260E]" />
          </div>
          <div className="text-3xl font-black text-gray-900 mt-2">
            {totalVisitas.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-600" />
            <span>{totalVisitasFiltradas} no filtro ativo</span>
          </p>
        </div>

        {/* Dia Mais Acessado */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
            <span>Dia Mais Acessado</span>
            <Calendar size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {diaMaisAcessado.data}
          </div>
          <p className="text-[11px] text-emerald-800 font-semibold mt-1">
            {diaMaisAcessado.diaSemana} ({diaMaisAcessado.total} acessos)
          </p>
        </div>

        {/* Horário de Maior Visita */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
            <span>Horário Mais Movimentado</span>
            <Clock size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">
            {horarioMaisAcessado.horaFormatada}
          </div>
          <p className="text-[11px] text-blue-800 font-semibold mt-1">
            Pico registrado de {horarioMaisAcessado.total} visitas
          </p>
        </div>

        {/* Dia da Semana Mais Forte */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
            <span>Dia da Semana Top</span>
            <Flame size={18} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            {diaSemanaMaisAcessado.nome}
          </div>
          <p className="text-[11px] text-amber-800 font-semibold mt-1">
            {diaSemanaMaisAcessado.total} acessos acumulados
          </p>
        </div>
      </div>

      {/* ── Gráficos em Linha / Barra (CSS Nativo Moderno) ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico 1: Acessos por Dia do Mês */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-200 shadow-soft space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div>
              <h3 className="text-base font-serif font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 size={17} className="text-[#82260E]" />
                Visitas por Dia do Mês
              </h3>
              <p className="text-xs text-gray-500">
                Distribuição diária de audiência e fluxo no catálogo online.
              </p>
            </div>
            <span className="text-xs font-bold text-[#82260E] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {visitasPorDia.length} dias registrados
            </span>
          </div>

          {visitasPorDia.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center text-xs text-gray-400">
              <Eye size={36} className="text-gray-300 mb-2" />
              <p>Nenhuma visita computada ainda para este período.</p>
            </div>
          ) : (
            <div className="pt-4">
              <div className="h-56 flex items-end gap-2 overflow-x-auto pb-4 no-scrollbar">
                {visitasPorDia.map((d) => {
                  const percent = Math.max(Math.round((d.total / maxDiaVisitas) * 100), 8);
                  return (
                    <div
                      key={d.data}
                      className="flex-1 min-w-[28px] max-w-[48px] flex flex-col items-center gap-1.5 group h-full justify-end"
                    >
                      <span className="text-[10px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {d.total}
                      </span>
                      <div
                        style={{ height: `${percent}%` }}
                        className="w-full bg-gradient-to-t from-[#82260E] to-[#B83918] group-hover:from-[#B83918] group-hover:to-[#D4AF37] rounded-t-lg transition-all shadow-sm"
                        title={`${d.data}: ${d.total} visita(s)`}
                      />
                      <span className="text-[10px] text-gray-500 font-mono rotate-45 sm:rotate-0 mt-1 whitespace-nowrap">
                        {d.diaFormatado}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Gráfico 2: Acessos por Mês do Ano */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-soft space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-base font-serif font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays size={17} className="text-[#82260E]" />
              Meses do Ano
            </h3>
            <p className="text-xs text-gray-500">Evolução do tráfego mês a mês.</p>
          </div>

          {visitasPorMes.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center text-xs text-gray-400">
              <Calendar size={36} className="text-gray-300 mb-2" />
              <p>Sem dados de meses.</p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {visitasPorMes.map((m) => {
                const percent = Math.max(Math.round((m.total / maxMesVisitas) * 100), 5);
                return (
                  <div key={m.mesChave} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>{m.nomeCompleto}</span>
                      <span className="font-mono text-[#82260E] font-black">{m.total} visitas</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-[#82260E] to-[#D4AF37] rounded-full transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Distribuição por Horário (00:00 às 23:00) ───────────── */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-base font-serif font-bold text-gray-900 flex items-center gap-2">
              <Clock size={17} className="text-blue-700" />
              Mapa de Calor por Horário do Dia (24 Horas)
            </h3>
            <p className="text-xs text-gray-500">
              Identifique os momentos do dia em que os clientes mais navegam no catálogo.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            24h Ativo
          </span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-1.5 pt-2">
          {Array.from({ length: 24 }).map((_, h) => {
            const qtd = horarioMaisAcessado.mapaHoras[h] || 0;
            const topQtd = horarioMaisAcessado.total || 1;
            const intensity = qtd === 0 ? 'bg-gray-100 text-gray-400' : qtd >= topQtd * 0.7 ? 'bg-[#82260E] text-white font-extrabold shadow' : qtd >= topQtd * 0.3 ? 'bg-[#B83918] text-white font-bold' : 'bg-amber-100 text-amber-900 font-semibold';

            return (
              <div
                key={h}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${intensity}`}
                title={`Faixa ${h}:00 - ${h + 1}:00: ${qtd} visita(s)`}
              >
                <span className="text-[10px] block opacity-80">{String(h).padStart(2, '0')}h</span>
                <span className="text-xs mt-0.5">{qtd}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
