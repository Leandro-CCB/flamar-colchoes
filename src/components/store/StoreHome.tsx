import React, { useState, useEffect } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import { FLAMAR_COMPANY_INFO } from '../../lib/flamarCatalog';
import { Product, ProductCategory } from '../../types/database';
import {
  ShieldCheck, Truck, CreditCard, Award, MessageCircle,
  Phone, MapPin, CheckCircle2, Eye, ShoppingCart, Sparkles,
  ChevronRight, Layers, Ruler, Weight, Building2, Clock
} from 'lucide-react';

interface StoreHomeProps {
  activeSection: 'catalogo' | 'sobre' | 'localizacao';
  setActiveSection: (s: 'catalogo' | 'sobre' | 'localizacao') => void;
}

export const StoreHome: React.FC<StoreHomeProps> = ({
  activeSection,
  setActiveSection
}) => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSelectedProductModal,
    addToCart,
    setIsCartDrawerOpen
  } = useFlamar();

  const [heroIndex, setHeroIndex] = useState(0);

  const heroSlides = [
    {
      badge: '37 ANOS DE TRADIÇÃO EM SÃO PAULO',
      title: 'O Descanso Ortopédico que sua Família Merece.',
      subtitle: 'Colchões de Molas Ensacadas, Espumas Certificadas D33 e Camas Box Baú Blindadas das marcas Luckspuma, Castor e FA Maringá.',
      highlight: '10x Sem Juros ou 5% de Desconto à Vista',
      ctaCategory: 'colchoes' as ProductCategory,
      ctaLabel: 'VER LINHA DE COLCHÕES',
      featuredProd: products[1] || products[0]
    },
    {
      badge: 'ESPECIALISTA EM BOX BAÚ BLINDADO',
      title: 'Ganhe Espaço no Quarto com Estrutura Blindada.',
      subtitle: 'Camas Box Baú Solteiro, Casal e Queen com 43cm de altura, pistões a gás amortecidos e 7 pés de madeira de reflorestamento.',
      highlight: 'Pronta Entrega na Grande São Paulo',
      ctaCategory: 'box_bau' as ProductCategory,
      ctaLabel: 'EXPLORAR CAMAS BOX BAÚ',
      featuredProd: products[6] || products[0]
    },
    {
      badge: 'LINHA PREMIUM CASTOR & LUCKSPUMA',
      title: 'Tecnologia Pocket Gel & Sistema Polyframe.',
      subtitle: 'Conforto térmico superior, bloqueio de transferência de movimentos e acabamento Double Face de alta durabilidade.',
      highlight: 'Homologação Inmetro, INER e Pró-Espuma',
      ctaCategory: 'luckspuma' as ProductCategory,
      ctaLabel: 'CONHECER MARCAS OFICIAIS',
      featuredProd: products[10] || products[0]
    }
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'todos' ||
      p.category === selectedCategory ||
      p.tags.includes(selectedCategory);

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.density_or_spring.toLowerCase().includes(q) ||
      p.dimensions.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  const handleBuyNow = (p: Product) => {
    addToCart(p, 1);
    setIsCartDrawerOpen(true);
  };

  if (activeSection === 'sobre') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <div className="bg-white rounded-3xl border border-brand-100 shadow-soft overflow-hidden">
          <div className="bg-gradient-to-r from-[#521709] via-[#82260E] to-[#9B2E11] text-white p-8 sm:p-12">
            <span className="inline-block bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#FBF1D6] text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              DESDE 1989 • VILA PICININ / PIRITUBA - SP
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black">
              A História da Flamar Colchões: 37 Anos de Compromisso com o Sono
            </h1>
            <p className="text-sm sm:text-base text-[#FCD5C8] mt-2 max-w-3xl">
              CNPJ: {FLAMAR_COMPANY_INFO.cnpj} • Referência de tradição, ética e qualidade certificada em São Paulo.
            </p>
          </div>

          <div className="p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
              {FLAMAR_COMPANY_INFO.history_paragraphs.map((par, i) => (
                <p key={i}>{par}</p>
              ))}

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#FFF7F4] border border-[#FCD5C8]">
                  <span className="text-2xl font-serif font-black text-[#82260E]">37 Anos</span>
                  <p className="text-xs text-gray-600 mt-1">De tradição ininterrupta no mercado de colchões em SP</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FFF7F4] border border-[#FCD5C8]">
                  <span className="text-2xl font-serif font-black text-[#82260E]">100%</span>
                  <p className="text-xs text-gray-600 mt-1">Produtos homologados pelo Inmetro, INER e Pró-Espuma</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FFF7F4] border border-[#FCD5C8]">
                  <span className="text-2xl font-serif font-black text-[#82260E]">10x s/ Juros</span>
                  <p className="text-xs text-gray-600 mt-1">Ou 5% de desconto imediato para pagamento à vista</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FAF7F4] rounded-2xl p-6 border border-gray-200 flex flex-col justify-between space-y-5">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-3">
                  Ficha Institucional Oficial
                </h3>
                <ul className="space-y-3 text-xs text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <Building2 size={16} className="text-[#82260E] shrink-0 mt-0.5" />
                    <span><strong>Razão / Fantasia:</strong> {FLAMAR_COMPANY_INFO.name} (CNPJ {FLAMAR_COMPANY_INFO.cnpj})</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#82260E] shrink-0 mt-0.5" />
                    <span><strong>Endereço:</strong> {FLAMAR_COMPANY_INFO.address_street}, {FLAMAR_COMPANY_INFO.neighborhood} — {FLAMAR_COMPANY_INFO.city}/{FLAMAR_COMPANY_INFO.state} — CEP {FLAMAR_COMPANY_INFO.cep}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Phone size={16} className="text-[#82260E] shrink-0 mt-0.5" />
                    <span><strong>Telefone Fixo & WhatsApp:</strong> {FLAMAR_COMPANY_INFO.phone_landline}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Clock size={16} className="text-[#82260E] shrink-0 mt-0.5" />
                    <span><strong>Horário:</strong> {FLAMAR_COMPANY_INFO.opening_hours}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setActiveSection('catalogo')}
                className="w-full py-3 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Voltar para o Catálogo de Produtos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'localizacao') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <div className="bg-white rounded-3xl border border-brand-100 shadow-soft p-8 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#82260E]">
                VISITE NOSSO SHOWROOM FÍSICO EM SÃO PAULO
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
                Rua Jotacá, 378 — Vila Picinin (Pirituba), São Paulo - SP
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                CEP: 02930-050 • Fone: (11) 3975-4947 • E-mail: {FLAMAR_COMPANY_INFO.email}
              </p>
            </div>
            <a
              href={`https://wa.me/${FLAMAR_COMPANY_INFO.whatsapp_e164}?text=${encodeURIComponent('Olá Flamar Colchões! Gostaria de informações sobre produtos e entrega.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shrink-0"
            >
              <MessageCircle size={17} />
              <span>ATENDIMENTO VIA WHATSAPP</span>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="space-y-4 text-xs sm:text-sm text-gray-700">
              <div className="p-5 rounded-2xl bg-[#FAF7F4] border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-[#82260E]" />
                  <span>Endereço Completo</span>
                </h3>
                <p>Rua Jotacá, 378 — Vila Picinin</p>
                <p>São Paulo - SP • CEP 02930-050</p>
                <p className="text-xs text-gray-500 mt-2">
                  Fácil acesso pela Av. Raimundo Pereira de Magalhães e Região de Pirituba / Freguesia do Ó.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF7F4] border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Truck size={16} className="text-[#82260E]" />
                  <span>Retirada no Balcão ou Entrega Expressa</span>
                </h3>
                <p>
                  Trabalhamos com estoque próprio para pronta entrega ou retirada imediata em nossa loja física.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-200 min-h-[340px] bg-gray-100">
              <iframe
                title="Mapa Flamar Colchões Rua Jotacá 378"
                src="https://www.google.com/maps?q=Rua+Jotaca,+378,+Vila+Picinin,+Sao+Paulo,+SP,+02930-050&output=embed"
                className="w-full h-full min-h-[340px] border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSlide = heroSlides[heroIndex];

  return (
    <div className="pb-16">
      {/* ── HERO BANNER EDITORIAL (ESTILO LMA COSMÉTICOS ADAPTADO PARA FLAMAR) ── */}
      {selectedCategory === 'todos' && !searchQuery && (
        <section className="bg-gradient-to-br from-[#2E0C04] via-[#681E0B] to-[#9B2E11] text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Coluna de Texto */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#FBF1D6] text-xs font-extrabold uppercase tracking-widest">
                  <Sparkles size={13} className="text-[#D4AF37]" />
                  <span>{currentSlide.badge}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black leading-tight text-white">
                  {currentSlide.title}
                </h1>

                <p className="text-sm sm:text-base text-[#FCD5C8] max-w-2xl leading-relaxed">
                  {currentSlide.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setSelectedCategory(currentSlide.ctaCategory)}
                    className="px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#c59f2d] text-[#1C110E] font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                  >
                    <span>{currentSlide.ctaLabel}</span>
                    <ChevronRight size={16} />
                  </button>

                  <a
                    href={`https://wa.me/${FLAMAR_COMPANY_INFO.whatsapp_e164}?text=${encodeURIComponent('Olá Flamar Colchões! Quero ajuda de um especialista para escolher meu colchão/cama box.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                  >
                    <MessageCircle size={16} className="text-emerald-400" />
                    <span>Falar com Especialista: (11) 3975-4947</span>
                  </a>
                </div>

                {/* Indicadores dos Slides */}
                <div className="flex items-center gap-2 pt-3">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        heroIndex === idx ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-white/30'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Card do Produto em Destaque no Hero */}
              {currentSlide.featuredProd && (
                <div className="lg:col-span-5">
                  <div className="bg-white text-gray-900 rounded-3xl p-5 shadow-2xl border-2 border-[#D4AF37]/40">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FEECE6] text-[#82260E]">
                        DESTAQUE OFICIAL • {currentSlide.featuredProd.brand}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        -5% À Vista
                      </span>
                    </div>

                    <div className="relative h-52 sm:h-60 bg-[#FAF7F4] rounded-2xl overflow-hidden flex items-center justify-center mb-4">
                      <img
                        src={currentSlide.featuredProd.image_url}
                        alt={currentSlide.featuredProd.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1">
                      {currentSlide.featuredProd.name}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {currentSlide.featuredProd.density_or_spring} • Medida: {currentSlide.featuredProd.dimensions}
                    </p>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] text-gray-400 line-through block">
                          De R$ {currentSlide.featuredProd.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xl font-extrabold text-[#82260E]">
                          R$ {currentSlide.featuredProd.cash_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          <small className="text-[11px] font-semibold text-gray-600 ml-1">à vista</small>
                        </span>
                        <span className="block text-[11px] text-gray-600">
                          ou 10x de R$ {(currentSlide.featuredProd.price / 10).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros
                        </span>
                      </div>

                      <button
                        onClick={() => handleBuyNow(currentSlide.featuredProd)}
                        className="px-4 py-2.5 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold text-xs uppercase tracking-wider shrink-0 shadow"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── ATALHOS VISUAIS DE LINHAS E MEDIDAS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'colchoes' as ProductCategory, title: 'Colchões', sub: 'Molas & Espuma D33', count: '6 modelos' },
            { id: 'box_bau' as ProductCategory, title: 'Box Baú Blindado', sub: 'Pistão a Gás 43cm', count: 'Solteiro / Casal / Queen' },
            { id: 'cama_box' as ProductCategory, title: 'Bases Cama Box', sub: 'Madeira Reflorestada', count: 'Suede & Liderflex' },
            { id: 'luckspuma' as ProductCategory, title: 'Luckspuma', sub: 'Roma & Dream 34cm', count: 'Molas Ensacadas' },
            { id: 'fa_maringa' as ProductCategory, title: 'FA Maringá & Ícaro', sub: 'Maxx Firme & D33', count: 'Selo INER / Pró-Espuma' },
            { id: 'castor' as ProductCategory, title: 'Castor Premium', sub: 'Pocket Gel 36cm', count: 'Double Face' },
          ].map((card) => {
            const active = selectedCategory === card.id;
            return (
              <button
                key={card.id}
                onClick={() => setSelectedCategory(card.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  active
                    ? 'bg-[#82260E] text-white border-[#82260E] shadow-md'
                    : 'bg-white text-gray-900 border-gray-200 hover:border-[#82260E]'
                }`}
              >
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${active ? 'text-[#FBF1D6]' : 'text-[#82260E]'}`}>
                  {card.count}
                </span>
                <span className="font-serif font-bold text-sm block mt-0.5">{card.title}</span>
                <span className={`text-[11px] block mt-0.5 ${active ? 'text-white/80' : 'text-gray-500'}`}>
                  {card.sub}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── CATÁLOGO DE PRODUTOS REAIS FLAMAR COLCHÕES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#82260E]">
              CATÁLOGO OFICIAL FLAMAR COLCHÕES • PRONTA ENTREGA
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-0.5">
              {selectedCategory === 'todos' ? 'Todos os Colchões & Camas Box' : `Filtro Ativo: ${selectedCategory.toUpperCase()}`}
              <span className="text-sm font-sans font-semibold text-gray-500 ml-2">
                ({filteredProducts.length} {filteredProducts.length === 1 ? 'item encontrado' : 'itens encontrados'})
              </span>
            </h2>
          </div>

          {selectedCategory !== 'todos' && (
            <button
              onClick={() => setSelectedCategory('todos')}
              className="text-xs font-bold text-[#82260E] hover:underline"
            >
              Limpar Filtro (Ver Todos os {products.length} Produtos)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl border border-gray-200/90 hover:border-[#82260E] shadow-soft hover:shadow-premium transition-all flex flex-col overflow-hidden group"
            >
              {/* Imagem Real do Produto */}
              <div
                onClick={() => setSelectedProductModal(product)}
                className="relative h-56 bg-[#FAF7F4] overflow-hidden cursor-pointer flex items-center justify-center p-3"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#82260E] text-white shadow">
                    {product.brand}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-gray-800 border border-gray-200">
                    {product.size_label}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow">
                    -5% À VISTA
                  </span>
                </div>
              </div>

              {/* Corpo do Card */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                    <span>SKU: {product.sku}</span>
                    <span className={product.stock_qty > 0 ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                      {product.stock_qty > 0 ? `Estoque: ${product.stock_qty} un.` : 'Sob Encomenda'}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedProductModal(product)}
                    className="font-bold text-gray-900 text-base leading-snug hover:text-[#82260E] cursor-pointer line-clamp-2"
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
                    {product.short_description}
                  </p>

                  {/* Especificações Rápidas */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1 text-[11px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Ruler size={13} className="text-[#82260E] shrink-0" />
                      <span>Medida: <strong>{product.dimensions}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers size={13} className="text-[#82260E] shrink-0" />
                      <span className="truncate">{product.density_or_spring}</span>
                    </div>
                  </div>
                </div>

                {/* Preço & Ações */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {product.on_consultation ? (
                    <div className="mb-3">
                      <span className="text-xs font-bold uppercase text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                        Linha Sob Consulta / Tabela Referência
                      </span>
                      <div className="text-lg font-extrabold text-[#82260E] mt-1">
                        R$ {product.cash_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <span className="text-xs font-normal text-gray-500 ml-1">à vista</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-400 line-through">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">Economize R$ {(product.price - product.cash_price).toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="text-xl font-black text-[#82260E]">
                        R$ {product.cash_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <span className="text-xs font-semibold text-gray-600 ml-1">no PIX / à vista</span>
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        ou <strong>10x de R$ {(product.price / 10).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> sem juros
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setSelectedProductModal(product)}
                      className="col-span-1 py-2.5 rounded-xl border border-gray-200 hover:border-[#82260E] text-gray-700 hover:text-[#82260E] flex items-center justify-center transition-colors"
                      title="Ver Fotos e Ficha Técnica"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="col-span-3 py-2.5 px-3 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <ShoppingCart size={15} />
                      <span>Comprar Agora</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
