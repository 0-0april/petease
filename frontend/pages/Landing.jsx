import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import landingVideo from '../data/landingvideo.mp4';

let pvoLogo, peteaseLogo;
try { pvoLogo = new URL('../data/pvo-logo.png', import.meta.url).href; } catch { pvoLogo = null; }
try { peteaseLogo = new URL('../data/petease-logo.png', import.meta.url).href; } catch { peteaseLogo = null; }

// Smooth-scroll to a section id, offset by the sticky navbar height
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const navHeight = 72; // sticky navbar ~72px
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: 'smooth' });
}

const features = [
  { icon:'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    title:'Pet Adoption',    desc:'Browse and adopt pets from loving owners. Find your perfect companion today.' },
  { icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    title:'Vet Appointments',desc:'Book consultations, anti-rabies vaccines, and spay/neuter services with ease.' },
  { icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title:'Medical Records',  desc:"Keep track of your pet's complete medical history, medications, and treatments." },
  { icon:'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    title:'Direct Messaging', desc:'Message pet owners directly to ask questions before requesting adoption.' },
  { icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    title:'Notifications',    desc:'Stay updated on adoption requests, appointment confirmations, and more.' },
  { icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title:'Verified Adoptions',desc:'All adoptions are processed with official waivers witnessed by vet staff.' },
];

const stats = [
  { value:'500+',   label:'Pets Adopted' },
  { value:'1,200+', label:'Registered Users' },
  { value:'300+',   label:'Appointments Booked' },
  { value:'50+',    label:'Vet Services' },
];

const steps = [
  { n:'01', title:'Create an Account',   desc:'Register as a pet owner or adopter in minutes.' },
  { n:'02', title:'Browse or List Pets', desc:'Find pets available for adoption or list your own.' },
  { n:'03', title:'Connect & Adopt',     desc:'Message owners, request adoption, and complete the process.' },
  { n:'04', title:'Book Vet Services',   desc:'Schedule appointments for your new or existing pets.' },
];

// Dropdown menu items
// sectionId  → smooth-scroll to that id on this page
// to         → navigate to a different route
const servicesItems = [
  { label: 'Consultation',        desc: 'General health checkups',    sectionId: 'about' },
  { label: 'Anti-Rabies Vaccine', desc: 'Regular vaccination program', sectionId: 'about' },
  { label: 'Spay / Neuter',       desc: 'Scheduled surgical services', sectionId: 'about' },
];
const adoptionItems = [
  { label: 'Browse Pets',     desc: 'Find your perfect companion', to: '/register' },
  { label: 'How to Adopt',    desc: 'Step-by-step guide',          sectionId: 'how-it-works' },
  { label: 'Success Stories', desc: 'Happy adoption stories',      sectionId: 'stats' },
];

function NavDropdown({ label, items, navigate }) {
  const [open, setOpen] = useState(false);

  function handleItemClick(item) {
    setOpen(false);
    if (item.to) {
      navigate(item.to);
    } else if (item.sectionId) {
      scrollToSection(item.sectionId);
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors"
        style={{ color: 'hsl(140,100%,7%)' }}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Invisible bridge — keeps hover alive across the gap */}
      {open && (
        <div className="absolute left-0 right-0 h-3 top-full" aria-hidden="true" />
      )}

      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-56 rounded-2xl overflow-hidden"
          style={{
            top: 'calc(100% + 8px)',
            zIndex: 9999,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.70)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              className="px-4 py-3 cursor-pointer transition-colors"
              style={{
                borderBottom: i < items.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              }}
              onClick={() => handleItemClick(item)}
              onKeyDown={e => e.key === 'Enter' && handleItemClick(item)}
              onMouseEnter={e => e.currentTarget.style.background = 'hsla(130,100%,30%,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <p className="text-sm font-semibold" style={{ color: 'hsl(140,100%,7%)' }}>{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'hsla(140,100%,7%,0.50)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen overflow-x-hidden"
      style={{ background:'hsla(132,79%,89%,1)' }}>

      {/* Ambient spheres */}
      <div className="pe-bg" aria-hidden="true">
        <div className="pe-sphere animate-float-slow"
          style={{ width:'640px', height:'640px', top:'-200px', left:'-180px', opacity:0.48 }} />
        <div className="pe-sphere animate-float-mid"
          style={{ width:'420px', height:'420px', top:'40%', right:'-130px', opacity:0.30 }} />
        <div className="pe-sphere"
          style={{ width:'260px', height:'260px', bottom:'-80px', left:'30%', opacity:0.20, filter:'blur(60px)' }} />
      </div>

      {/* ── Floating Pill Navbar ── */}
      <div className="sticky top-0 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-2"
        style={{ zIndex: 9990 }}>
        <nav className="nav-glass max-w-6xl mx-auto rounded-full flex items-center justify-between px-4 sm:px-6 h-12 sm:h-14"
          style={{ overflow: 'visible' }}>
          {/* Left: Co-brand lockup */}
          <div className="flex items-center gap-2 shrink-0">
            {/* PVO Logo */}
            <a href="https://www.facebook.com/PVO.LDS" target="_blank" rel="noopener noreferrer"
              className="flex items-center shrink-0" title="Provincial Veterinary Office – Lanao del Sur">
              {pvoLogo ? (
                <img src={pvoLogo} alt="PVO Lanao del Sur"
                  style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'hsl(140,100%,7%)' }}>PVO</span>
              )}
            </a>
            {/* Divider */}
            <div className="w-px h-6" style={{ background: 'hsla(140,100%,7%,0.20)' }} />
            {/* PetEase Logo */}
            <Link to="/" className="flex items-center shrink-0">
              {peteaseLogo ? (
                <img src={peteaseLogo} alt="PetEase"
                  style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <span className="text-base sm:text-xl font-black tracking-tight"
                  style={{ color: 'hsl(140,100%,7%)' }}>🐾 PetEase</span>
              )}
            </Link>
          </div>

          {/* Center: Nav links with dropdowns — hidden on small screens */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/login" className="px-3 py-2 text-sm font-medium rounded-full transition-colors hover:bg-primary/10"
              style={{ color: 'hsl(140,100%,7%)' }}>
              Home
            </Link>
            <NavDropdown label="Adoption" items={adoptionItems} navigate={navigate} />
            <NavDropdown label="Services" items={servicesItems} navigate={navigate} />
            <button
              onClick={() => scrollToSection('about')}
              className="px-3 py-2 text-sm font-medium rounded-full transition-colors hover:bg-primary/10"
              style={{ color: 'hsl(140,100%,7%)' }}>
              About
            </button>
          </div>

          {/* Right: CTA + mobile hamburger */}
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-flex px-3 py-2 text-sm font-medium rounded-full transition-colors hover:bg-primary/10"
              style={{ color: 'hsl(140,100%,7%)' }}>
              Login
            </Link>
            <Link to="/login" className="hidden md:inline-flex btn-outline" style={{ padding: '8px 18px', fontSize: '0.75rem' }}>
              Contact Us
            </Link>
            {/* Mobile hamburger */}
            <button type="button" onClick={() => setMobileOpen(o => !o)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full md:hidden"
              style={{ background: 'rgba(255,255,255,0.50)', color: 'hsl(140,100%,7%)' }}
              aria-label="Toggle menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden mt-2 max-w-6xl mx-auto nav-glass rounded-2xl px-4 py-3">
            <div className="grid gap-1">
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium nav-inactive">Home</Link>
              <button onClick={() => { setMobileOpen(false); scrollToSection('how-it-works'); }}
                className="rounded-xl px-3 py-2 text-sm font-medium nav-inactive text-left">Adoption</button>
              <button onClick={() => { setMobileOpen(false); scrollToSection('about'); }}
                className="rounded-xl px-3 py-2 text-sm font-medium nav-inactive text-left">Services</button>
              <button onClick={() => { setMobileOpen(false); scrollToSection('about'); }}
                className="rounded-xl px-3 py-2 text-sm font-medium nav-inactive text-left">About</button>
              <div className="flex gap-2 mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.4)' }}>
                <Link to="/login" className="flex-1 text-center btn-outline" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Login</Link>
                <Link to="/login" className="flex-1 text-center btn-pay" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Contact Us</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Hero Section ── */}
      <section className="relative z-10 pt-16 pb-0 px-4 overflow-hidden">

        {/* Layer 1 (bottom): video — absolute inset, full coverage, hidden on mobile */}
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover hidden lg:block"
          style={{
            objectPosition: 'left center',
            maskImage:       'linear-gradient(to right, transparent 0%, black 30%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%)',
          }}
        >
          <source src={landingVideo} type="video/mp4" />
        </video>

        {/* Layer 2 (middle): green gradient + dot texture — sits on top of video,
            fades out to the right so the video shows through on that side */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{background: 'linear-gradient(to right, hsla(132, 39%, 59%, 1) 0%, hsla(132, 39%, 59%, 0.5) 40%, hsla(132, 39%, 59%, .2) 70%)',
            
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(hsla(135,95%,18%,0) 1px, transparent 1px)',
            backgroundSize:  '24px 24px',
          }}
        />

        {/* ── All hero content sits above both background layers ── */}
        <div className="relative max-w-7xl mx-auto flex flex-col items-start py-20"
          style={{ zIndex: 2 }}>
          <div className="w-full lg:w-[58%] text-center lg:text-left">
            <span className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ background:'hsla(130,100%,30%,0.14)', color:'hsl(140,100%,7%)', textShadow:'0 1px 8px rgba(255,255,255,0.8)' }}>
              Pet Adoption &amp; Veterinary System
            </span>
            <h1 className="heading-dark text-5xl sm:text-6xl lg:text-7xl mb-6"
              style={{ textShadow:'0 2px 16px rgba(255,255,255,0.7)' }}>
              Find a Friend.<br />
              <span style={{ color:'hsl(130,100%,22%)', textShadow:'0 2px 16px rgba(255,255,255,0.7)' }}>Care for Life.</span>
            </h1>
            <p className="text-lg mb-10 max-w-xl mx-auto lg:mx-0 font-light"
              style={{ color:'hsla(140,100%,7%,0.75)', lineHeight:'1.75', textShadow:'0 1px 8px rgba(255,255,255,0.7)' }}>
              PetEase connects pet owners, adopters, and veterinary staff in one seamless platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register" className="btn-pay text-center" style={{ padding:'14px 36px' }}>Start Adopting</Link>
              <Link to="/login" className="btn-outline text-center" style={{ padding:'13px 36px' }}>Sign In</Link>
            </div>
          </div>
        </div>

        {/* Wave SVG divider */}
        <div className="relative -mb-1" aria-hidden="true">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block"
            preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              fill="hsla(132,79%,89%,1)" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="relative z-10 py-10 px-4">
        <div className="max-w-5xl mx-auto glass-card overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="text-center py-8 px-4"
                style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.45)' : 'none' }}>
                <p className="text-4xl font-black" style={{ color:'hsl(140,100%,7%)' }}>{s.value}</p>
                <p className="mt-1 text-sm font-light tracking-wide"
                  style={{ color:'hsla(140,100%,7%,0.50)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-dark text-4xl mb-4">Everything You Need</h2>
            <p className="font-light max-w-xl mx-auto"
              style={{ color:'hsla(140,100%,7%,0.55)', lineHeight:'1.75' }}>
              A complete platform for pet adoption and veterinary care management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="glass-inner p-6 transition-all hover:shadow-glass">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background:'hsla(130,100%,30%,0.13)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color:'hsl(130,100%,30%)' }} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2"
                  style={{ color:'hsl(140,100%,7%)' }}>{f.title}</h3>
                <p className="text-sm font-light" style={{ color:'hsla(140,100%,7%,0.55)', lineHeight:'1.7' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-dark text-4xl mb-4">How It Works</h2>
            <p className="font-light" style={{ color:'hsla(140,100%,7%,0.55)' }}>
              Get started in just a few simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg mx-auto mb-4 shadow-glass"
                  style={{ background:'linear-gradient(135deg, hsl(130,100%,40%) 0%, hsl(135,95%,22%) 100%)' }}>
                  {s.n}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2"
                  style={{ color:'hsl(140,100%,7%)' }}>{s.title}</h3>
                <p className="text-sm font-light" style={{ color:'hsla(140,100%,7%,0.55)', lineHeight:'1.7' }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Partner Office ── */}
      <section id="about" className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-16">
            <span className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ background: 'hsla(130,100%,30%,0.14)', color: 'hsl(140,100%,7%)' }}>
              About PetEase
            </span>
            <h2 className="heading-dark text-4xl mb-4">Our Partner Office</h2>
            <p className="font-light max-w-xl mx-auto"
              style={{ color: 'hsla(140,100%,7%,0.55)', lineHeight: '1.75' }}>
              PetEase is built in official partnership with the Provincial Veterinary Office of Lanao del Sur —
              the government agency responsible for animal health and welfare across the province.
            </p>
          </div>

          {/* PVO Identity Card */}
          <div className="glass-card overflow-hidden mb-10">
            <div className="flex flex-col lg:flex-row">

              {/* Left: Logo + contact */}
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

              {/* Right: Mandate + Partnership */}
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
                    PetEase was developed as a digital solution to support the PVO's outreach and services. Through
                    this platform, residents of Lanao del Sur can book veterinary appointments, facilitate pet
                    adoptions, and access PVO's free services — all in one place. The PVO's veterinary staff manages
                    appointments, adoption processing, and medical records directly through the system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Programs & Services */}
          <div className="text-center mb-10">
            <h3 className="heading-dark text-3xl mb-3">Programs &amp; Services</h3>
            <p className="font-light max-w-xl mx-auto"
              style={{ color: 'hsla(140,100%,7%,0.55)', lineHeight: '1.75' }}>
              Free and subsidized programs run by the PVO for communities across Lanao del Sur.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
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
            ].map((prog, i) => (
              <div key={i} className="glass-inner p-6 transition-all hover:shadow-glass">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'hsla(130,100%,30%,0.13)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'hsl(130,100%,30%)' }} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={prog.icon} />
                  </svg>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'hsl(140,100%,7%)' }}>{prog.title}</h3>
                <p className="text-sm font-light leading-relaxed"
                  style={{ color: 'hsla(140,100%,7%,0.55)', lineHeight: '1.7' }}>{prog.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-3xl mx-auto glass-card text-center px-8 py-16">
          <h2 className="heading-dark text-4xl sm:text-5xl mb-4">Ready to Find Your Pet?</h2>
          <p className="text-lg font-light mb-10"
            style={{ color:'hsla(140,100%,7%,0.55)' }}>
            Join hundreds of pet owners and adopters already using PetEase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-pay text-center"  style={{ padding:'14px 36px' }}>Create Free Account</Link>
            <Link to="/login"    className="btn-outline text-center" style={{ padding:'13px 36px' }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-10 px-4"
        style={{ borderTop:'1px solid rgba(255,255,255,0.50)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* PetEase info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {peteaseLogo ? (
                <img src={peteaseLogo} alt="PetEase" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <p className="text-xl font-black" style={{ color:'hsl(140,100%,7%)' }}>🐾 PetEase</p>
              )}
            </div>
            <p className="text-xs font-light" style={{ color:'hsla(140,100%,7%,0.45)' }}>
              Pet Adoption &amp; Veterinary Appointment System
            </p>
          </div>

          {/* In Partnership With */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: 'hsla(140,100%,7%,0.45)' }}>
              In Partnership With
            </p>
            <a href="https://www.facebook.com/PVO.LDS" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {pvoLogo ? (
                <img src={pvoLogo} alt="PVO Lanao del Sur"
                  style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-lg shadow-sm">🏛️</div>
              )}
              <div>
                <p className="text-sm font-semibold" style={{ color: 'hsl(140,100%,7%)' }}>
                  Provincial Veterinary Office
                </p>
                <p className="text-xs" style={{ color: 'hsla(140,100%,7%,0.50)' }}>Lanao del Sur, Philippines</p>
              </div>
            </a>
            <div className="text-xs mt-1 space-y-0.5" style={{ color: 'hsla(140,100%,7%,0.50)' }}>
              <p>📍 Capitol Compound, Marawi City, Lanao del Sur</p>
              <p>📞 [Office contact — to be provided]</p>
              <p>🕐 Mon – Fri, 8:00 AM – 5:00 PM</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-1 text-sm">
            <button onClick={() => scrollToSection('about')} className="font-light transition-opacity hover:opacity-100 text-left" style={{ color:'hsla(140,100%,7%,0.50)' }}>About</button>
            <Link to="/login"    className="font-light transition-opacity hover:opacity-100" style={{ color:'hsla(140,100%,7%,0.50)' }}>Login</Link>
            <Link to="/register" className="font-light transition-opacity hover:opacity-100" style={{ color:'hsla(140,100%,7%,0.50)' }}>Register</Link>
            <a href="https://www.facebook.com/PVO.LDS" target="_blank" rel="noopener noreferrer"
              className="font-light transition-opacity hover:opacity-100" style={{ color:'hsla(140,100%,7%,0.50)' }}>
              PVO Facebook Page ↗
            </a>
          </div>
        </div>
        <p className="text-center text-xs mt-8 font-light" style={{ color:'hsla(140,100%,7%,0.35)' }}>
          © {new Date().getFullYear()} PetEase · In partnership with the Provincial Veterinary Office – Lanao del Sur
        </p>
      </footer>
    </div>
  );
}
