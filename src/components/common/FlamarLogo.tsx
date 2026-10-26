import React from 'react';

interface FlamarLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const FlamarLogo: React.FC<FlamarLogoProps> = ({
  variant = 'dark',
  size = 'md',
  showTagline = true,
  className = ''
}) => {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 34,
    md: 44,
    lg: 54
  };

  const titleClasses = {
    sm: 'text-lg tracking-wider',
    md: 'text-2xl tracking-widest',
    lg: 'text-3xl tracking-widest'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblema Vivo Flamar (Chama de Conforto & Molas Douradas - Sem caixa branca colada) */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
          style={{
            filter: isLight
              ? 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.45))'
              : 'drop-shadow(0 4px 12px rgba(130, 38, 14, 0.35))'
          }}
        >
          <defs>
            <linearGradient id="flamarTerracotta" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DF6442" />
              <stop offset="50%" stopColor="#9B2E11" />
              <stop offset="100%" stopColor="#521709" />
            </linearGradient>
            <linearGradient id="flamarGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBF1D6" />
              <stop offset="45%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#9E7E1D" />
            </linearGradient>
          </defs>

          {/* Escudo Circular Vazado em Ouro */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#flamarGold)"
            strokeWidth="2"
            strokeDasharray="4 3"
            opacity="0.85"
          />

          {/* Base Curva Representando Colchão Pillow Top */}
          <path
            d="M18 66 C32 58, 68 58, 82 66 C85 71, 82 77, 74 79 C58 83, 42 83, 26 79 C18 77, 15 71, 18 66 Z"
            fill="url(#flamarTerracotta)"
          />
          <path
            d="M22 69 C38 63, 62 63, 78 69"
            stroke="url(#flamarGold)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Chama / Coroa de Conforto Superior */}
          <path
            d="M50 14 C57 26, 67 34, 65 47 C63 55, 56 59, 50 60 C44 59, 37 55, 35 47 C33 34, 43 26, 50 14 Z"
            fill="url(#flamarTerracotta)"
          />
          <path
            d="M50 26 C54 34, 58 40, 56 48 C55 53, 52 55, 50 56 C48 55, 45 53, 44 48 C42 40, 46 34, 50 26 Z"
            fill="url(#flamarGold)"
          />

          {/* Estrela de Tradição 37 Anos */}
          <circle cx="50" cy="45" r="3" fill="#FFF7F4" />
        </svg>
      </div>

      {/* Tipografia Oficial FLAMAR COLCHÕES */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-serif font-black leading-none ${titleClasses[size]} ${
              isLight ? 'text-white' : 'text-[#82260E]'
            }`}
          >
            FLAMAR
          </span>
          <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#9E7E1D] border border-[#D4AF37]/40">
            37 ANOS
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-sans font-extrabold uppercase tracking-[0.32em] text-[10px] mt-1 ${
              isLight ? 'text-[#FCD5C8]' : 'text-[#521709]'
            }`}
          >
            COLCHÕES & BOX
          </span>
        )}
      </div>
    </div>
  );
};
