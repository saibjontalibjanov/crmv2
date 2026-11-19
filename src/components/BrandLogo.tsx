import React from 'react';
import type { AirlineCode, CountryCode } from '../types/crm';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Official Staraviatravel wordmark preserving the classic serif STARAVIA
 * and emerald-green ★ TRAVEL ★ sub-mark seen across approved mockups.
 */
export const StaraviaLogo: React.FC<BrandLogoProps> = ({ size = 'md', className = '' }) => {
  const titleClasses =
    size === 'sm'
      ? 'text-[16px] tracking-[0.12em]'
      : size === 'lg'
        ? 'text-[26px] tracking-[0.14em]'
        : 'text-[20px] tracking-[0.13em]';

  const subClasses =
    size === 'sm'
      ? 'text-[9px] tracking-[0.26em] gap-1'
      : size === 'lg'
        ? 'text-[13px] tracking-[0.30em] gap-2'
        : 'text-[10.5px] tracking-[0.28em] gap-1.5';

  const starSize = size === 'sm' ? 8 : size === 'lg' ? 12 : 9.5;

  return (
    <span className={`inline-flex flex-col items-center leading-none select-none ${className}`}>
      <span className={`font-brand-serif font-bold text-[#14261C] ${titleClasses}`}>
        STARAVIA
      </span>
      <span className={`mt-0.5 inline-flex items-center font-brand-serif font-semibold text-[#23804E] ${subClasses}`}>
        <svg width={starSize} height={starSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l2.9 6.6L22 9.4l-5.3 4.6 1.6 6.9L12 17.3 5.7 20.9l1.6-6.9L2 9.4l7.1-.8L12 2z" />
        </svg>
        <span>TRAVEL</span>
        <svg width={starSize} height={starSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l2.9 6.6L22 9.4l-5.3 4.6 1.6 6.9L12 17.3 5.7 20.9l1.6-6.9L2 9.4l7.1-.8L12 2z" />
        </svg>
      </span>
    </span>
  );
};

interface AirlineBadgeProps {
  code: AirlineCode;
  size?: 'sm' | 'md';
}

export const AirlineBadge: React.FC<AirlineBadgeProps> = ({ code, size = 'md' }) => {
  const boxClass = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';

  switch (code) {
    case 'EK':
      return (
        <div
          className={`${boxClass} rounded-full bg-[#D71921] text-white flex flex-col items-center justify-center shrink-0 shadow-xs`}
          aria-hidden="true"
        >
          <span className="text-[8.5px] font-bold tracking-tight leading-none">Emirates</span>
        </div>
      );
    case 'TK':
      return (
        <div
          className={`${boxClass} rounded-full bg-[#C8102E] text-white flex items-center justify-center shrink-0 shadow-xs`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6 fill-current">
            <path d="M16 5C10.5 5 6 9.5 6 15c0 4.6 3.1 8.5 7.4 9.6-1.9-1.9-2.8-4.7-2.2-7.6.8-3.8 4.2-6.5 8.1-6.5 1.9 0 3.7.7 5.1 1.8C23.1 8.1 19.9 5 16 5z" />
            <path d="M13 18.5c2.2-1.8 5.2-2.6 8.8-2.1-3.1 1.3-5.2 3.2-6.4 6.2-.9-1.2-1.7-2.6-2.4-4.1z" />
          </svg>
        </div>
      );
    case 'QR':
      return (
        <div
          className={`${boxClass} rounded-full bg-[#F5EDF2] border border-[#DFC7D4] text-[#5C0632] flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6 fill-current">
            <path d="M7 22c3-5 7-9 13-11-1 3-1 5 2 6-4 1-6 3-7 6H7zm13-13c1.8-2.4 3.8-4 5.5-4.5-1.2 2.2-2.3 4.1-3.1 5.8-.9-.6-1.6-1-2.4-1.3z" />
          </svg>
        </div>
      );
    case 'HY':
      return (
        <div
          className={`${boxClass} rounded-full bg-[#0068A5] text-white flex items-center justify-center shrink-0 font-bold text-xs tracking-wide`}
          aria-hidden="true"
        >
          HY
        </div>
      );
    case 'LH':
      return (
        <div
          className={`${boxClass} rounded-full bg-[#05164D] text-[#FFAD00] flex items-center justify-center shrink-0 font-bold text-xs tracking-wide`}
          aria-hidden="true"
        >
          LH
        </div>
      );
    case 'KC':
      return (
        <div
          className={`${boxClass} rounded-full bg-[#1C2A48] text-[#D8B467] flex items-center justify-center shrink-0 font-bold text-xs`}
          aria-hidden="true"
        >
          KC
        </div>
      );
    case 'EY':
      return (
        <div
          className={`${boxClass} rounded-full bg-[#2B2523] text-[#D6B06C] flex items-center justify-center shrink-0 font-bold text-xs`}
          aria-hidden="true"
        >
          EY
        </div>
      );
    case 'CX':
      return (
        <div
          className={`${boxClass} rounded-full bg-[#006564] text-white flex items-center justify-center shrink-0 font-bold text-xs`}
          aria-hidden="true"
        >
          CX
        </div>
      );
    case 'NH':
      return (
        <div
          className={`${boxClass} rounded-full bg-[#113788] text-white flex items-center justify-center shrink-0 font-bold text-xs`}
          aria-hidden="true"
        >
          ANA
        </div>
      );
  }
};

export const CountryFlag: React.FC<{ code: CountryCode }> = ({ code }) => {
  const base = 'w-5 h-3.5 rounded-[3px] overflow-hidden shrink-0 border border-black/10 inline-block';

  switch (code) {
    case 'UZ':
      return (
        <svg viewBox="0 0 24 16" className={base} aria-label="Uzbekistan">
          <rect width="24" height="5.2" fill="#0099B5" />
          <rect y="5.2" width="24" height="0.7" fill="#CE1126" />
          <rect y="5.9" width="24" height="4.2" fill="#FFFFFF" />
          <rect y="10.1" width="24" height="0.7" fill="#CE1126" />
          <rect y="10.8" width="24" height="5.2" fill="#1EB53A" />
        </svg>
      );
    case 'RU':
      return (
        <svg viewBox="0 0 24 16" className={base} aria-label="Russia">
          <rect width="24" height="5.33" fill="#FFFFFF" />
          <rect y="5.33" width="24" height="5.33" fill="#0039A6" />
          <rect y="10.66" width="24" height="5.34" fill="#D52B1E" />
        </svg>
      );
    case 'AT':
      return (
        <svg viewBox="0 0 24 16" className={base} aria-label="Austria">
          <rect width="24" height="5.33" fill="#ED2939" />
          <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          <rect y="10.66" width="24" height="5.34" fill="#ED2939" />
        </svg>
      );
    case 'SG':
      return (
        <svg viewBox="0 0 24 16" className={base} aria-label="Singapore">
          <rect width="24" height="8" fill="#EF3340" />
          <rect y="8" width="24" height="8" fill="#FFFFFF" />
          <circle cx="6.5" cy="4" r="2.2" fill="#FFFFFF" />
          <circle cx="7.4" cy="4" r="1.8" fill="#EF3340" />
        </svg>
      );
    case 'KZ':
      return (
        <svg viewBox="0 0 24 16" className={base} aria-label="Kazakhstan">
          <rect width="24" height="16" fill="#00AFCA" />
          <circle cx="12" cy="8" r="2.8" fill="#FEC50C" />
        </svg>
      );
    case 'AE':
      return (
        <svg viewBox="0 0 24 16" className={base} aria-label="UAE">
          <rect x="6" width="18" height="5.33" fill="#00732F" />
          <rect x="6" y="5.33" width="18" height="5.33" fill="#FFFFFF" />
          <rect x="6" y="10.66" width="18" height="5.34" fill="#000000" />
          <rect width="6" height="16" fill="#FF0000" />
        </svg>
      );
    case 'TR':
      return (
        <svg viewBox="0 0 24 16" className={base} aria-label="Turkey">
          <rect width="24" height="16" fill="#E30A17" />
          <circle cx="10" cy="8" r="3.4" fill="#FFFFFF" />
          <circle cx="11.2" cy="8" r="2.7" fill="#E30A17" />
        </svg>
      );
    case 'GB':
      return (
        <svg viewBox="0 0 24 16" className={base} aria-label="United Kingdom">
          <rect width="24" height="16" fill="#012169" />
          <path d="M0 0L24 16M24 0L0 16" stroke="#FFFFFF" strokeWidth="2.6" />
          <path d="M12 0V16M0 8H24" stroke="#FFFFFF" strokeWidth="4" />
          <path d="M12 0V16M0 8H24" stroke="#C8102E" strokeWidth="2.2" />
        </svg>
      );
  }
};
