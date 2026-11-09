import React, { useState, useEffect, useRef } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import { Product, LeadRecord, LeadMessage } from '../../types/database';
import { FLAMAR_COMPANY_INFO } from '../../lib/flamarCatalog';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  FileText,
  Truck,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  Clock,
  ArrowRight,
  Calculator
} from 'lucide-react';

type StepType =
  | 'welcome'
  | 'ask_biotype'
  | 'ask_pain'
  | 'recommendation'
  | 'ask_product_choice'
  | 'ask_cep_address'
  | 'ask_name'
  | 'ask_phone'
  | 'ask_payment_method'
  | 'proposal_summary'
  | 'done';

export const LeadsterChatWidget: React.FC = () => {
  const { products, addOrUpdateLead, recordProductClick, whatsappNumber } = useFlamar();

  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
  const [showProactiveBadge, setShowProactiveBadge] = useState(true);

  // Estado do lead atual em atendimento
  const [currentLeadId, setCurrentLeadId] = useState<string>(() => `lead_${Date.now()}`);
  const [messages, setMessages] = useState<LeadMessage[]>([
    {
      sender: 'bot',
      text: 'Olá! Sou o **Especialista em Sono da Flamar Colchões** 👋\n\nPosso te ajudar a escolher a densidade ou modelo de mola ideal para o seu peso e postura, e calcular seu **orçamento com desconto de fábrica** em 1 minuto!',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState<StepType>('welcome');
  const [isTyping, setIsTyping] = useState(false);

  // Dados coletados para o orçamento e cadastro
  const [weight, setWeight] = useState<string>('');
  const [backPain, setBackPain] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('Padrão');
  const [bairro, setBairro] = useState<string>('');
  const [cidade, setCidade] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentPreference, setPaymentPreference] = useState<string>('pix');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Proatividade tipo Leadster: chama a atenção após 4 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasOpenedBefore) {
        setShowProactiveBadge(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [hasOpenedBefore]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasOpenedBefore(true);
    setShowProactiveBadge(false);
  };

  const addBotMessage = (text: string, delay = 600) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const newMsg: LeadMessage = {
        sender: 'bot',
        text,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMsg]);
    }, delay);
  };

  const addUserMessage = (text: string) => {
    const newMsg: LeadMessage = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  };

  // Salva ou atualiza o lead no CRM em cada etapa
  const syncLeadState = (overrides?: Partial<LeadRecord>) => {
    const currentProd = overrides?.product_id
      ? products.find(p => p.id === overrides.product_id)
      : selectedProduct;

    const unitPrice = currentProd ? currentProd.cash_price : 0;
    const qty = 1;
    const shipping = 0; // Entrega grátis na Grande SP e região
    const total = unitPrice * qty + shipping;

    const leadData: LeadRecord = {
      id: currentLeadId,
      created_at: new Date().toISOString(),
      name: overrides?.name !== undefined ? overrides.name : customerName,
      phone: overrides?.phone !== undefined ? overrides.phone : customerPhone,
      cep: overrides?.cep !== undefined ? overrides.cep : '',
      address: overrides?.address !== undefined ? overrides.address : address,
      neighborhood: overrides?.neighborhood !== undefined ? overrides.neighborhood : bairro,
      city: overrides?.city !== undefined ? overrides.city : (cidade || 'São Paulo'),
      status: overrides?.status || 'novo',
      product_id: currentProd?.id,
      product_name: currentProd?.name,
      sku: currentProd?.sku,
      size_label: selectedSize,
      dimensions: currentProd?.dimensions,
      quantity: qty,
      unit_price: unitPrice,
      cash_price: currentProd?.cash_price || 0,
      discount: 0,
      shipping_fee: shipping,
      total_amount: total,
      payment_method_preference: overrides?.payment_method_preference || paymentPreference,
      biotype_weight: overrides?.biotype_weight !== undefined ? overrides.biotype_weight : weight,
      biotype_height: 'Padrão',
      sleeping_position: 'Misto',
      back_pain: overrides?.back_pain !== undefined ? overrides.back_pain : backPain,
      chat_history: messages,
      ...overrides
    };

    addOrUpdateLead(leadData);
  };

  // Opções interativas
  const handleStartConsultancy = () => {
    addUserMessage('Quero descobrir meu colchão ideal e fazer um orçamento');
    setStep('ask_biotype');
    addBotMessage(
      'Excelente decisão! Para a saúde da sua coluna, a densidade correta é fundamental.\n\nQual é a faixa de peso da pessoa mais pesada que vai dormir no colchão?',
      500
    );
  };

  const handleSelectWeight = (w: string) => {
    setWeight(w);
    addUserMessage(`Peso aproximado: ${w}`);
    syncLeadState({ biotype_weight: w });
    setStep('ask_pain');
    addBotMessage(
      'Perfeito! Você ou seu parceiro sentem dores na coluna, lombar ou dormem com sensação de cansaço ao acordar?',
      500
    );
  };

  const handleSelectPain = (pain: string) => {
    setBackPain(pain);
    addUserMessage(pain);
    syncLeadState({ back_pain: pain });
    setStep('recommendation');

    // Recomendação técnica especialista baseada no catálogo da Flamar
    let recomendacao = '';
    let prodSugerido: Product | undefined;

    if (weight.includes('110kg') || weight.includes('150kg')) {
      prodSugerido = products.find(p => p.sku === 'FLM-D45-CS') || products[0];
      recomendacao = `🔎 **Diagnóstico Ortopédico:** Para sustentação segura e alinhamento da coluna até ${weight}, indicamos o modelo **${prodSugerido?.name || 'Colchão D45 Ortopédico'}**.\nEle possui certificação INMETRO de densidade real, evitando afundamentos e prevenindo dores lombares.`;
    } else {
      prodSugerido = products.find(p => p.sku === 'FLM-MOL-QN' || p.sku === 'FLM-MOL-CS') || products[0];
      recomendacao = `🔎 **Diagnóstico Ortopédico:** Para o seu perfil, a tecnologia de **Molas Ensacadas Individualmente (Pocket)** é perfeita!\nEla absorve os movimentos de forma independente (quando um se mexe, o outro não sente) com camada de conforto anatômica.`;
    }

    if (prodSugerido) {
      setSelectedProduct(prodSugerido);
      recordProductClick(prodSugerido, 'view_details');
    }

    addBotMessage(recomendacao, 700);
    setTimeout(() => {
      addBotMessage(
        `Gostaria de simular o **orçamento fechado** deste modelo ou prefere escolher outra medida/produto do nosso catálogo?`,
        900
      );
      setStep('ask_product_choice');
    }, 800);
  };

  const handleChooseProduct = (prod: Product) => {
    setSelectedProduct(prod);
    recordProductClick(prod, 'view_details');
    addUserMessage(`Escolhi: ${prod.name} (R$ ${prod.cash_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
    syncLeadState({ product_id: prod.id, status: 'orcamento_gerado' });
    setStep('ask_cep_address');
    addBotMessage(
      `Excelente escolha! O **${prod.name}** tem 3 anos de garantia e entrega rápida da fábrica.\n\nPara calcularmos o frete e a rota de entrega, em qual **Bairro e Cidade** você mora? *(a rua e número podemos confirmar depois!)*`,
      600
    );
  };

  const handleSendAddress = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const txt = inputText.trim();
    
    // Anota exatamente o que o cliente digitou (Bairro, Cidade e/ou Rua se ele já colocou)
    setAddress(txt);
    
    // Tenta extrair bairro/cidade se tiver formato "Bairro, Cidade" ou similar
    const partes = txt.split(/[-–,/]/).map(s => s.trim()).filter(Boolean);
    if (partes.length >= 2) {
      setBairro(partes[0]);
      setCidade(partes[1]);
    } else {
      setBairro(txt);
      setCidade('Grande SP');
    }

    addUserMessage(txt);
    setInputText('');
    syncLeadState({
      address: txt,
      neighborhood: partes.length >= 2 ? partes[0] : txt,
      city: partes.length >= 2 ? partes[1] : 'Grande SP'
    });

    setStep('ask_name');
    addBotMessage(
      'Anotado! Temos rota de entrega frequente nessa região com frota própria.\n\nComo posso te chamar? Qual é o seu **Nome Completo**?',
      500
    );
  };

  const handleSendName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const name = inputText.trim();
    setCustomerName(name);
    addUserMessage(name);
    setInputText('');
    syncLeadState({ name });

    setStep('ask_phone');
    addBotMessage(
      `Prazer, ${name}! Para enviarmos o espelho da cotação com a tabela de desconto e reservarmos o colchão no estoque da fábrica, qual é o seu **WhatsApp com DDD**?`,
      500
    );
  };

  const handleSendPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const phone = inputText.trim();
    setCustomerPhone(phone);
    addUserMessage(phone);
    setInputText('');
    syncLeadState({ phone });

    setStep('ask_payment_method');
    addBotMessage(
      'Qual forma de pagamento você prefere para aplicarmos a melhor condição?\n• **PIX à vista** (Desconto especial imediato)\n• **Cartão de Crédito** (Parcelado em até 10x ou 12x)\n• **Faturamento na Entrega**',
      500
    );
  };

  const handleSelectPayment = (payment: string) => {
    setPaymentPreference(payment);
    addUserMessage(payment);
    setStep('proposal_summary');

    const prod = selectedProduct || products[0];
    const cashPrice = prod.cash_price;
    const parcelado = (cashPrice * 1.08) / 10;

    syncLeadState({
      payment_method_preference: payment,
      status: 'orcamento_gerado'
    });

    const resumo = `🎉 **ORÇAMENTO FLAMAR GERADO COM SUCESSO!**\n\n` +
      `👤 **Cliente:** ${customerName}\n` +
      `📱 **WhatsApp:** ${customerPhone}\n` +
      `📍 **Entrega:** ${address} (Frete Grátis)\n` +
      `🛏️ **Item:** ${prod.name} (${prod.dimensions})\n` +
      `💰 **Valor à Vista (PIX):** R$ ${cashPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `💳 **Cartão:** 10x de R$ ${parcelado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `🛡️ **Garantia:** 3 Anos direto de Fábrica Flamar\n\n` +
      `Nosso consultor humano já recebeu todos estes dados no sistema ERP para confirmar seu pedido e agendar o dia da entrega!`;

    addBotMessage(resumo, 700);

    setTimeout(() => {
      setStep('done');
      addBotMessage(
        'Deseja que eu te encaminhe diretamente para o WhatsApp do gerente comercial para confirmar a entrega agora mesmo?',
        900
      );
    }, 1200);
  };

  // Enviar texto livre do usuário
  const handleGenericSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (step === 'ask_cep_address') {
      handleSendAddress();
    } else if (step === 'ask_name') {
      handleSendName();
    } else if (step === 'ask_phone') {
      handleSendPhone();
    } else {
      const txt = inputText.trim();
      addUserMessage(txt);
      setInputText('');

      // Respostas inteligentes baseadas no catálogo
      const lower = txt.toLowerCase();
      if (lower.includes('garantia')) {
        addBotMessage('Nossos colchões possuem **3 anos de garantia de fábrica** com certificado oficial e espuma selada pelo INMETRO.');
      } else if (lower.includes('frete') || lower.includes('entrega')) {
        addBotMessage('Entregamos com **frota própria** em toda Grande SP, Caieiras, Franco da Rocha, Francisco Morato e região com frete grátis ou subsidiado!');
      } else if (lower.includes('preço') || lower.includes('quanto custa') || lower.includes('valor')) {
        addBotMessage('Trabalhamos com preço de fábrica! Nossos colchões de solteiro começam a partir de R$ 740,00 e casal a partir de R$ 1.150,00. Posso simular seu modelo agora mesmo!');
      } else {
        addBotMessage('Entendido! Já anotei essa observação no seu cadastro comercial para que nosso consultor confira antes de faturar.');
      }
    }
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Olá Flamar Colchões! Fiz uma consultoria no chat do site.\n\n` +
    `*Nome:* ${customerName || 'Cliente'}\n` +
    `*Produto:* ${selectedProduct?.name || 'Colchão'}\n` +
    `*Endereço:* ${address || 'A combinar'}\n` +
    `*Lead ID:* #${currentLeadId.slice(0, 8)}\n\n` +
    `Gostaria de confirmar meu orçamento e o prazo de entrega!`
  )}`;

  return (
    <>
      {/* ── BOTÃO FLUTUANTE ESTILO LEADSTER (CANTO INFERIOR DIREITO) ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
        {/* Balão Proativo de Chamada */}
        {!isOpen && showProactiveBadge && (
          <div
            onClick={handleOpen}
            className="cursor-pointer max-w-xs sm:max-w-sm bg-white p-4 rounded-2xl shadow-2xl border border-brand-200 animate-bounce duration-1000 flex items-start gap-3 transition-transform hover:scale-105"
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#82260E] to-[#A83214] text-white flex items-center justify-center font-bold text-sm shadow">
                FC
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>
            <div className="text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Consultor Flamar</span>
                <span className="text-[10px] text-emerald-600 font-extrabold uppercase">Online Agora</span>
              </div>
              <p className="text-xs text-gray-600 leading-snug">
                Dúvida na densidade do colchão? Faça uma consultoria rápida e ganhe seu <strong>Orçamento com Desconto</strong>!
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProactiveBadge(false);
              }}
              className="text-gray-400 hover:text-gray-600 text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Botão de Disparo do Chat */}
        <button
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              handleOpen();
            }
          }}
          className="relative group p-4 rounded-full bg-gradient-to-r from-[#82260E] to-[#A83214] text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center ring-4 ring-[#D4AF37]/30"
          aria-label="Abrir consultor de sono"
        >
          {isOpen ? (
            <X size={26} />
          ) : (
            <>
              <MessageSquare size={26} />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* ── JANELA DO CHAT (LEADSTER POPUP) ── */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in">
          {/* Header do Chat */}
          <div className="bg-gradient-to-r from-[#82260E] to-[#9E2E11] text-white p-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-serif font-black text-sm text-[#FFD700]">
                  FC
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#82260E]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm leading-tight flex items-center gap-1.5">
                  Consultor Flamar do Sono
                  <Sparkles size={13} className="text-[#FFD700]" />
                </h3>
                <p className="text-[11px] text-brand-100 flex items-center gap-1">
                  <Clock size={11} /> Responde em segundos • Orçamento Direto
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF7F4] text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-[#82260E] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-xs">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#82260E] text-white rounded-tr-xs'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-xs'
                  }`}
                >
                  {m.text}
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-brand-200' : 'text-gray-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Indicador de Digitação */}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-400 text-xs italic py-1">
                <span className="w-2 h-2 rounded-full bg-[#82260E] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#82260E] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#82260E] animate-bounce [animation-delay:0.4s]" />
                <span>Consultor formulando recomendação...</span>
              </div>
            )}

            {/* Opções Interativas baseadas no Passo Atual */}
            {step === 'welcome' && (
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleStartConsultancy}
                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#82260E] to-[#A83214] text-white font-bold text-xs flex items-center justify-center gap-2 shadow hover:opacity-95"
                >
                  <Sparkles size={14} className="text-[#FFD700]" /> Fazer Consultoria & Orçamento
                </button>
              </div>
            )}

            {step === 'ask_biotype' && (
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Selecione o peso suportado:</p>
                {['Até 70 kg', 'De 70 a 90 kg', 'De 90 a 110 kg (D33)', 'Acima de 110 kg a 150 kg (D45 Ortopédico)'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectWeight(opt)}
                    className="w-full text-left p-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#82260E] hover:bg-brand-50 text-gray-800 font-semibold transition-all flex items-center justify-between"
                  >
                    <span>{opt}</span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {step === 'ask_pain' && (
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Como acorda pela manhã?</p>
                {[
                  'Acordo bem, busco conforto macio/firme',
                  'Sinto dores nas costas / lombar com frequência',
                  'Colchão atual afundou ou esquenta demais'
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectPain(opt)}
                    className="w-full text-left p-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#82260E] hover:bg-brand-50 text-gray-800 font-semibold transition-all flex items-center justify-between"
                  >
                    <span>{opt}</span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {step === 'ask_product_choice' && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Colchões Recomendados do Catálogo:</p>
                {products.slice(0, 3).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleChooseProduct(prod)}
                    className="p-3 rounded-2xl bg-white border border-gray-200 hover:border-[#82260E] hover:shadow-md cursor-pointer transition-all flex items-center gap-3"
                  >
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{prod.name}</h4>
                      <p className="text-[10px] text-gray-500">{prod.dimensions} • {prod.category.toUpperCase()}</p>
                      <p className="text-xs font-black text-[#82260E] mt-0.5">
                        R$ {prod.cash_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} à vista
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-[#82260E] shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {step === 'ask_payment_method' && (
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Forma de Pagamento Desejada:</p>
                {[
                  { id: 'pix', label: 'PIX (com Desconto Máximo de Fábrica)' },
                  { id: 'cartao', label: 'Cartão de Crédito em até 10x sem juros' },
                  { id: 'entrega', label: 'Pagar no ato da Entrega na minha casa' }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => handleSelectPayment(pm.label)}
                    className="w-full text-left p-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#82260E] hover:bg-brand-50 text-gray-800 font-semibold transition-all flex items-center justify-between"
                  >
                    <span>{pm.label}</span>
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  </button>
                ))}
              </div>
            )}

            {step === 'done' && (
              <div className="space-y-2 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <PhoneCall size={15} /> Confirmar Orçamento no WhatsApp Agora
                </a>
                <p className="text-[10px] text-center text-gray-500">
                  Ou se preferir, nosso atendente entrará em contato pelo seu telefone cadastrado.
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Campo de Digitação do Usuário */}
          <form
            onSubmit={handleGenericSubmit}
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                step === 'ask_cep_address'
                  ? 'Digite seu Bairro e Cidade (ex: Lapa, SP)...'
                  : step === 'ask_name'
                  ? 'Digite seu Nome Completo...'
                  : step === 'ask_phone'
                  ? 'Digite seu WhatsApp (ex: 11 99999-9999)...'
                  : 'Digite sua mensagem ou dúvida...'
              }
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#82260E] focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-[#82260E] text-white hover:bg-[#9E2E11] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};