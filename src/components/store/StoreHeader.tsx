import React, { useState } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import { FlamarLogo } from '../common/FlamarLogo';
import { ProductCategory } from '../../types/database';
import {
  Truck, ShieldCheck, CreditCard, PhoneCall, Search,
  ShoppingBag, MapPin, Menu, X, Award, LayoutDashboard
} from 'lucide-react';

interface StoreHeaderProps {
  activeSection: 'catalogo' | 'sobre' | 'localizacao';
  setActiveSection: (s: 'catalogo' | 'sobre' | 'localizacao') => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  activeSection,
  setActiveSection
}) => {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cart,
    setIsCartDrawerOpen,
    setEnvironment
  } = useFlamar();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.product.cash_price * item.quantity, 0);

  const navCategories: { id: ProductCategory; label: string }[] = [
    { id: 'todos', label: 'TODOS' },
    { id: 'casal', label: 'CASAL (138x188)' },
    { id: 'solteiro', label: 'SOLTEIRO (88x188)' },
  ];

  const handleSelectCat = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    setActiveSection('catalogo');
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-brand-100 sticky top-0 z-40">
      {/* 1. Barra de Diferenciais Flamar */}
      <div className="bg-[#82260E] text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#D4AF37] shrink-0" />
            <span><strong>37 Anos de Tradição:</strong> Loja física própria em Pirituba/SP</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <CreditCard size={16} className="text-[#D4AF37] shrink-0" />
            <span><strong>10x Sem Juros</strong> no cartão ou <strong>5% OFF à vista</strong></span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
            <span><strong>Selos Inmetro & Pró-Espuma:</strong> Marcas 100% originais</span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <Truck size={16} className="text-[#D4AF37] shrink-0" />
            <span><strong>Entrega Rápida SP:</strong> Frota própria na Grande São Paulo</span>
          </div>
        </div>
      </div>

      {/* 2. Cabeçalho Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-gray-800 lg:hidden rounded-lg hover:bg-gray-100"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo Flamar */}
          <div
            onClick={() => handleSelectCat('todos')}
            className="cursor-pointer shrink-0"
          >
            <FlamarLogo size="md" variant="dark" />
          </div>

          {/* Barra de Busca Central */}
          <div className="flex-1 max-w-xl hidden md:flex items-center">
            <div className="w-full flex items-center border-2 border-[#E8DDD8] focus-within:border-[#82260E] rounded-xl bg-[#FAF7F4] overflow-hidden h-11 transition-all">
              <div className="pl-3.5 pr-2 text-[#82260E]">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeSection !== 'catalogo') setActiveSection('catalogo');
                }}
                placeholder="Busque por Colchão D33, Molas Ensacadas, Box Baú, Castor, Luckspuma..."
                className="w-full py-2 bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-gray-400 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveSection('catalogo')}
                className="h-full px-5 bg-[#82260E] hover:bg-[#681E0B] text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Links Institucionais & Carrinho */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <button
              onClick={() => setActiveSection('sobre')}
              className={`hidden xl:flex flex-col text-left px-3 py-1.5 rounded-xl transition-colors ${
                activeSection === 'sobre'
                  ? 'bg-brand-50 text-[#82260E] font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs font-bold">Nossa História</span>
              <span className="text-[10px] text-gray-500">37 Anos de Tradição</span>
            </button>

            <button
              onClick={() => setActiveSection('localizacao')}
              className={`hidden xl:flex items-center gap-2 text-left px-3 py-1.5 rounded-xl transition-colors ${
                activeSection === 'localizacao'
                  ? 'bg-brand-50 text-[#82260E] font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPin size={18} className="text-[#82260E]" />
              <div className="leading-tight">
                <span className="text-xs font-bold block">Loja Física SP</span>
                <span className="text-[10px] text-gray-500">Rua Jotacá, 378</span>
              </div>
            </button>



            {/* Botão do Pedido / Carrinho */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#FFF7F4] hover:bg-[#FEECE6] border border-[#FCD5C8] transition-all"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#82260E] text-white flex items-center justify-center">
                  <ShoppingBag size={17} />
                </div>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#1C110E] font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[11px] font-semibold text-gray-600">Seu Pedido</span>
                <span className="text-xs font-extrabold text-[#82260E]">
                  R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Busca Mobile */}
        <div className="mt-3 md:hidden">
          <div className="flex items-center border border-gray-300 rounded-xl bg-[#FAF7F4] px-3 py-2">
            <Search size={16} className="text-[#82260E] mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar colchão, cama box, marca..."
              className="w-full bg-transparent text-xs text-gray-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Régua Horizontal de Categorias (Todas visíveis com destaque claro na aba ativa) */}
      <nav className="border-t border-gray-200 bg-[#FAF7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar">
          {navCategories.map((cat) => {
            const isActive = activeSection === 'catalogo' && selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCat(cat.id)}
                className={`px-3.5 py-2 rounded-lg text-[11.5px] font-extrabold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#82260E] text-white shadow-sm ring-2 ring-[#D4AF37]/60'
                    : 'bg-white text-gray-800 border border-gray-200/80 hover:border-[#82260E] hover:text-[#82260E]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 p-4 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            {navCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCat(cat.id)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-bold ${
                  selectedCategory === cat.id
                    ? 'bg-[#82260E] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveSection('sobre');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-lg bg-brand-50 text-[#82260E] text-xs font-bold"
            >
              Nossa Empresa (37 Anos)
            </button>
            <button
              onClick={() => {
                setActiveSection('localizacao');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-lg bg-brand-50 text-[#82260E] text-xs font-bold"
            >
              Endereço: Rua Jotacá, 378
            </button>

          </div>
        </div>
      )}
    </header>
  );
};
