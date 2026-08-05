import React from 'react';
import { Link } from 'react-router-dom';

let pvoLogo, peteaseLogo;
try { pvoLogo = new URL('../data/pvo-logo.png', import.meta.url).href; } catch { pvoLogo = null; }
try { peteaseLogo = new URL('../data/petease-logo.png', import.meta.url).href; } catch { peteaseLogo = null; }

const programs = [
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'Free Rabies Vaccination',
    desc: 'Regular anti-rabies vaccination drives for pets and livestock throughout the province. The program aims to eliminate rabies transmission and protect both animal and public health.',
  },
  {
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    title: 'Spay & Neuter Drives',
    desc: 'Scheduled community-based spay and neuter programs to support responsible pet ownership and manage the stray animal population across Lanao del Sur.',
  },
  {
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    title: 'Disease Preparedness',
    desc: 'Active surveillance, rapid response, and disease-prevention programs to safeguard animal and public health, including monitoring of zoonotic diseases and livestock epidemics.',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    title: 'Veterinary Consultations',
    desc: 'Walk-in and scheduled consultations with licensed government veterinarians, providing accessible professional care for pets and livestock in the province.',
  },
  {
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    title: 'Livestock Development',
    desc: 'Technical assistance, training, and support programs for livestock raisers to improve animal productivity and promote sustainable agricultural practices.',
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    title: 'Community Outreach',
    desc: 'Education and awareness campaigns on responsible pet ownership, animal welfare, and zoonotic disease prevention targeted at barangay-level communities.',
  },
];

export default function About() {
  return (
    <div className="relative min-h-screen overflow-x-hidden"
      style={{ background: 'hsla(132,79%,89%,1)' }}>

      {/* Ambient spheres */}
      <div className="pe-bg" aria-hidden="true">
        <div className="pe-sphere animate-float-slow"
          style={{ width: '560px', height: '560px', top: '-180px', left: '-150px', opacity: 0.45 }} />
        <div className="pe-sphere animate-float-mid"
          style={{ width: '380px', height: '380px', top: '50%', right: '-110px', opacity: 0.28 }} />
        <div className="pe-sphere"
          style={{ width: '220px', height: '220px', bottom: '-60px', left: '25%', opacity: 0.18, filter: 'blur(60px)' }} />
      </div>

      {/* ── Navbar ── */}
      <div className="sticky top-0 z-50 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-2">
        <nav className="nav-glass max-w-6xl mx-auto rounded-full flex items-center justify-between px-4 sm:px-6 h-12 sm:h-14">
          {/* Left: Co-brand lockup */}
          <div className="flex items-center gap-2 shrink-0">
            <a href="https://www.facebook.com/PVO.LDS" target="_blank" rel="noopener noreferrer"
              className="flex items-center shrink-0" title="Provincial Veterinary Office – Lanao del Sur">
              {pvoLogo ? (
                <img src={pvoLogo} alt="PVO Lanao del Sur"
                  style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'hsl(140,100%,7%)' }}>PVO</span>
              )}
            </a>
            <div className="w-px h-6" style={{ background: 'hsla(140,100%,7%,0.20)' }} />
            <Link to="/landing" className="flex items-center shrink-0">
              {peteaseLogo ? (
                <img src={peteaseLogo} alt="PetEase"
                  style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <span className="text-base sm:text-xl font-black tracking-tight"
                  style={{ color: 'hsl(140,100%,7%)' }}>🐾 PetEase</span>
              )}
            </Link>
          </div>

          {/* Center: Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/landing" className="px-3 py-2 text-sm font-medium rounded-full transition-colors hover:bg-primary/10"
              style={{ color: 'hsl(140,100%,7%)' }}>
              Home
            </Link>
            <Link to="/about" className="px-3 py-2 text-sm font-medium rounded-full transition-colors"
              style={{ color: 'hsl(140,100%,7%)', background: 'hsla(130,100%,30%,0.12)' }}>
              About
            </Link>
          </div>

          {/* Right: CTAs */}
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-flex px-3 py-2 text-sm font-medium rounded-full transition-colors hover:bg-primary/10"
              style={{ color: 'hsl(140,100%,7%)' }}>
              Login
            </Link>
            <Link to="/register" className="hidden md:inline-flex btn-pay" style={{ padding: '8px 18px', fontSize: '0.75rem' }}>
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-16 pb-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ background: 'hsla(130,100%,30%,0.14)', color: 'hsl(140,100%,7%)' }}>
            About PetEase
          </span>
          <h1 className="heading-dark text-5xl sm:text-6xl mb-6">
            Our Partner Office
          </h1>
          <p className="text-lg font-light leading-relaxed"
            style={{ color: 'hsla(140,100%,7%,0.65)' }}>
            PetEase is built in official partnership with the Provincial Veterinary Office of Lanao del Sur —
            the government office responsible for animal health and welfare across the province.
          </p>
        </div>
      </section>

      {/* ── PVO Identity Card ── */}
      <section className="relative z-10 py-10 px-4">
        <div className="max-w-5xl mx-auto glass-card overflow-hidden">
          <div className="flex flex-col lg:flex-row">

            {/* Left: Logo + identity */}
            <div className="lg:w-[38%] flex flex-col items-center justify-center gap-6 px-10 py-14 text-center"
              style={{ background: 'rgba(255,255,255,0.22)', borderRight: '1px solid rgba(255,255,255,0.35)' }}>
              {pvoLogo ? (
                <img src={pvoLogo} alt="Provincial Veterinary Office – Lanao del Sur"
                  style={{ height: '130px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <div className="w-28 h-28 rounded-full flex items-center justify-center text-5xl"
                  style={{ background: 'rgba(255,255,255,0.50)' }}>🏛️</div>
              )}
              <div>
                <p className="text-xl font-black" style={{ color: 'hsl(140,100%,7%)' }}>
                  Provincial Veterinary Office
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: 'hsl(130,100%,30%)' }}>
                  Lanao del Sur, Philippines
                </p>
              </div>
              <div className="text-sm space-y-2 font-light" style={{ color: 'hsla(140,100%,7%,0.60)' }}>
                <p>📍 Capitol Compound, Marawi City<br />Lanao del Sur</p>
                <p>📞 [Office contact — to be provided]</p>
                <p>✉️ [Email — to be provided]</p>
                <p>🕐 Mon – Fri, 8:00 AM – 5:00 PM</p>
              </div>
              <a href="https://www.facebook.com/PVO.LDS" target="_blank" rel="noopener noreferrer"
                className="btn-outline" style={{ padding: '9px 22px', fontSize: '0.8rem' }}>
                Visit Facebook Page ↗
              </a>
            </div>

            {/* Right: Mandate */}
            <div className="flex-1 px-8 py-12 lg:px-12 flex flex-col justify-center gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: 'hsl(130,100%,30%)' }}>Mandate</p>
                <p className="text-sm font-light leading-relaxed"
                  style={{ color: 'hsla(140,100%,7%,0.70)' }}>
                  The Provincial Veterinary Office (PVO) of Lanao del Sur is the lead provincial government agency
                  responsible for animal health, welfare, and disease control. Its mandate covers the regulation of
                  veterinary practice, management of livestock diseases, and the delivery of veterinary services to
                  the communities of Lanao del Sur.
                  {/* Placeholder — replace with the official mandate from the PVO */}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: 'hsl(130,100%,30%)' }}>Our Partnership</p>
                <p className="text-sm font-light leading-relaxed"
                  style={{ color: 'hsla(140,100%,7%,0.70)' }}>
                  PetEase was developed as a digital solution to support the PVO's outreach and services. Through this
                  platform, residents of Lanao del Sur can book veterinary appointments, facilitate pet adoptions, and
                  access PVO's free services — all in one place. The PVO's veterinary staff manages appointments,
                  adoption processing, and medical records directly through the system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Programs & Services ── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="heading-dark text-4xl mb-4">Programs &amp; Services</h2>
            <p className="font-light max-w-xl mx-auto"
              style={{ color: 'hsla(140,100%,7%,0.55)', lineHeight: '1.75' }}>
              The PVO runs several free and subsidized programs for the communities of Lanao del Sur.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map((p, i) => (
              <div key={i} className="glass-inner p-6 transition-all hover:shadow-glass">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'hsla(130,100%,30%,0.13)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'hsl(130,100%,30%)' }} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={p.icon} />
                  </svg>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'hsl(140,100%,7%)' }}>{p.title}</h3>
                <p className="text-sm font-light leading-relaxed"
                  style={{ color: 'hsla(140,100%,7%,0.55)' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-3xl mx-auto glass-card text-center px-8 py-14">
          <h2 className="heading-dark text-3xl sm:text-4xl mb-4">Ready to Get Started?</h2>
          <p className="text-base font-light mb-8"
            style={{ color: 'hsla(140,100%,7%,0.55)' }}>
            Create an account to book appointments, browse pets, and access PVO services online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-pay text-center" style={{ padding: '13px 32px' }}>Create Free Account</Link>
            <Link to="/landing"  className="btn-outline text-center" style={{ padding: '12px 32px' }}>Back to Home</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-10 px-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.50)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            {peteaseLogo ? (
              <img src={peteaseLogo} alt="PetEase" style={{ height: '30px', width: 'auto', objectFit: 'contain', marginBottom: '6px' }} />
            ) : (
              <p className="text-xl font-black mb-1" style={{ color: 'hsl(140,100%,7%)' }}>🐾 PetEase</p>
            )}
            <p className="text-xs font-light" style={{ color: 'hsla(140,100%,7%,0.45)' }}>
              Pet Adoption &amp; Veterinary Appointment System
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: 'hsla(140,100%,7%,0.45)' }}>In Partnership With</p>
            <a href="https://www.facebook.com/PVO.LDS" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {pvoLogo ? (
                <img src={pvoLogo} alt="PVO Lanao del Sur"
                  style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-lg shadow-sm">🏛️</div>
              )}
              <div>
                <p className="text-sm font-semibold" style={{ color: 'hsl(140,100%,7%)' }}>Provincial Veterinary Office</p>
                <p className="text-xs" style={{ color: 'hsla(140,100%,7%,0.50)' }}>Lanao del Sur, Philippines</p>
              </div>
            </a>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <Link to="/landing"  className="font-light hover:opacity-100 transition-opacity" style={{ color: 'hsla(140,100%,7%,0.55)' }}>Home</Link>
            <Link to="/login"    className="font-light hover:opacity-100 transition-opacity" style={{ color: 'hsla(140,100%,7%,0.55)' }}>Login</Link>
            <Link to="/register" className="font-light hover:opacity-100 transition-opacity" style={{ color: 'hsla(140,100%,7%,0.55)' }}>Register</Link>
            <a href="https://www.facebook.com/PVO.LDS" target="_blank" rel="noopener noreferrer"
              className="font-light hover:opacity-100 transition-opacity" style={{ color: 'hsla(140,100%,7%,0.55)' }}>
              PVO Facebook ↗
            </a>
          </div>
        </div>
        <p className="text-center text-xs mt-8 font-light" style={{ color: 'hsla(140,100%,7%,0.35)' }}>
          © {new Date().getFullYear()} PetEase · In partnership with the Provincial Veterinary Office – Lanao del Sur
        </p>
      </footer>
    </div>
  );
}
