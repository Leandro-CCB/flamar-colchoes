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

  const imgSizes = {
    sm: 'w-11 h-11',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-20 h-20'
  };

  const titleClasses = {
    sm: 'text-lg tracking-wider',
    md: 'text-xl sm:text-2xl tracking-widest',
    lg: 'text-2xl sm:text-3xl tracking-widest'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Logotipo Oficial Original Flamar Colchões (extraído do site oficial) */}
      <img
        src="/images/logo-flamar.webp"
        alt="Flamar Colchões Logo Oficial"
        className={`${imgSizes[size]} object-contain shrink-0 rounded-full transition-transform duration-300 hover:scale-105`}
        style={{
          filter: isLight
            ? 'drop-shadow(0 0 14px rgba(212, 175, 55, 0.45))'
            : 'drop-shadow(0 6px 14px rgba(130, 38, 14, 0.35))'
        }}
      />

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
            className={`font-sans font-extrabold uppercase tracking-[0.28em] text-[10px] mt-1 ${
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
