import React from 'react';
import { Link } from 'react-router-dom';

// Import logos — place petease-logo.png and pvo-logo.png in frontend/data/
// If files aren't present yet, falls back to text
let pvoLogo, peteaseLogo;
try { pvoLogo = new URL('../data/pvo-logo.png', import.meta.url).href; } catch { pvoLogo = null; }
try { peteaseLogo = new URL('../data/petease-logo.png', import.meta.url).href; } catch { peteaseLogo = null; }

/**
 * Co-branding lockup: [PVO Logo] | [PetEase Logo]
 * variant: 'user' | 'vet' | 'admin'
 * - user/landing: equal weight
 * - vet/admin: PVO is dominant, PetEase is a small watermark
 */
export default function CoBrandLockup({ variant = 'user', linkTo = '/' }) {
  const isDominant = variant === 'vet' || variant === 'admin';

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* PVO Logo */}
      <a
        href="https://www.facebook.com/PVO.LDS"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center shrink-0"
        title="Provincial Veterinary Office – Lanao del Sur"
      >
        {pvoLogo ? (
          <img
            src={pvoLogo}
            alt="PVO Lanao del Sur"
            style={{ height: isDominant ? '40px' : '36px', width: 'auto', objectFit: 'contain' }}
          />
        ) : (
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'hsl(140,100%,7%)' }}>PVO</span>
        )}
      </a>

      {/* Divider */}
      <div className="w-px h-7 bg-current opacity-20" style={{ backgroundColor: 'hsl(140,100%,7%)' }} />

      {/* PetEase Logo */}
      <Link to={linkTo} className="flex items-center gap-1.5 shrink-0">
        {peteaseLogo ? (
          <img
            src={peteaseLogo}
            alt="PetEase"
            style={{ height: isDominant ? '28px' : '36px', width: 'auto', objectFit: 'contain', opacity: isDominant ? 0.7 : 1 }}
          />
        ) : (
          <span
            className={`font-black tracking-tight ${isDominant ? 'text-base opacity-70' : 'text-xl'}`}
            style={{ color: 'hsl(140,100%,7%)' }}
          >
            🐾 PetEase
          </span>
        )}
        {isDominant && (
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(130,100%,30%)' }}>
            {variant === 'vet' ? 'Vet' : 'Admin'}
          </span>
        )}
      </Link>
    </div>
  );
}
