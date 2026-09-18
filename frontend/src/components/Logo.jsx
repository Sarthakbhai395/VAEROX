import React from 'react';

export const LogoEmblem = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF5D6" />
        <stop offset="35%" stopColor="#E8E0CC" />
        <stop offset="70%" stopColor="#C9A84C" />
        <stop offset="100%" stopColor="#8A6C1B" />
      </linearGradient>
      <linearGradient id="goldLightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C9A84C" />
        <stop offset="50%" stopColor="#FFF5D6" />
        <stop offset="100%" stopColor="#C9A84C" />
      </linearGradient>
    </defs>

    {/* Gold Circle Ring Background */}
    <circle cx="100" cy="100" r="92" stroke="url(#goldLightGrad)" strokeWidth="4" opacity="0.4" />

    {/* Outer Stylized Pyramid/A Frame */}
    <path
      d="M100 25 L160 150 L142 150 L100 58 L58 150 L40 150 Z"
      fill="url(#goldGrad)"
    />

    {/* Inner Intersecting V Chevron */}
    <path
      d="M100 132 L64 58 L78 58 L100 102 L122 58 L136 58 Z"
      fill="url(#goldGrad)"
    />

    {/* Intersecting Slash / X accents */}
    <path
      d="M132 70 L148 102 L116 168 L102 168 L128 114 Z"
      fill="url(#goldLightGrad)"
    />
    <path
      d="M68 70 L52 102 L84 168 L98 168 L72 114 Z"
      fill="url(#goldGrad)"
    />
  </svg>
);

export const LogoWordmarkSVG = ({ className = '', size = 'md' }) => {
  const svgHeights = {
    sm: 'h-4 sm:h-5',
    md: 'h-6 sm:h-7',
    lg: 'h-8 sm:h-9',
    xl: 'h-10 sm:h-12',
    hero: 'h-14 sm:h-16',
  };

  return (
    <svg
      viewBox="0 0 280 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${svgHeights[size] || 'h-7'} ${className}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="goldGradWordmark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFF5D6" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#9B782B" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="30"
        fontFamily="'Bodoni Moda', serif"
        fontSize="30"
        fontWeight="300"
        letterSpacing="0.38em"
        fill="url(#goldGradWordmark)"
        style={{ fontOpticalSizing: 'auto' }}
      >
        VAEROX
      </text>
    </svg>
  );
};

const Logo = ({ variant = 'full', size = 'md', layout = 'horizontal', className = '' }) => {
  // Size mappings
  const emblemSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    hero: 'w-28 h-28',
  };

  if (variant === 'icon') {
    return <LogoEmblem className={`${emblemSizes[size] || 'w-9 h-9'} ${className}`} />;
  }

  if (layout === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <LogoEmblem className={emblemSizes[size] || 'w-9 h-9'} />
        <div className="flex flex-col items-start leading-none">
          <LogoWordmarkSVG size={size} />
          <span className="text-[8px] md:text-[9px] font-light tracking-[0.35em] text-[#E8E0CC]/80 uppercase mt-0.5">
            Elevate Everyday
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center select-none text-center ${className}`}>
      {/* Gold Monogram Icon */}
      <LogoEmblem className={emblemSizes[size] || 'w-10 h-10'} />

      {/* Main Title Wordmark SVG */}
      <div className="mt-1.5 flex justify-center">
        <LogoWordmarkSVG size={size} />
      </div>

      {/* Subtitle */}
      <div className="flex items-center justify-center gap-2 w-full mt-1">
        <span className="h-[1px] w-5 bg-gradient-to-r from-transparent to-[#C9A84C]/60" />
        <span className="text-[9px] md:text-[10px] font-light tracking-[0.3em] text-[#E8E0CC] uppercase">
          AKARIOMART
        </span>
        <span className="h-[1px] w-5 bg-gradient-to-l from-transparent to-[#C9A84C]/60" />
      </div>

      {/* Tagline */}
      {variant === 'full' && (
        <div className="text-[8px] md:text-[9px] tracking-[0.4em] text-[#E8E0CC]/80 font-light uppercase mt-0.5">
          ELEVATE EVERYDAY
        </div>
      )}
    </div>
  );
};

export default Logo;
