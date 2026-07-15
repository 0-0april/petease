import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
const servicesItems = [
  { label: 'Consultation',        desc: 'General health checkups' },
  { label: 'Anti-Rabies Vaccine', desc: 'Regular vaccination program' },
  { label: 'Spay / Neuter',       desc: 'Scheduled surgical services' },
];
const adoptionItems = [
  { label: 'Browse Pets',    desc: 'Find your perfect companion' },
  { label: 'How to Adopt',   desc: 'Step-by-step guide' },
  { label: 'Success Stories',desc: 'Happy adoption stories' },
];

function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors"
        style={{ color: 'hsl(140,100%,7%)' }}
      >
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 nav-glass rounded-2xl overflow-hidden z-50">
          {items.map((item, i) => (
            <div key={i} className="px-4 py-3 hover:bg-primary/10 cursor-pointer transition-colors border-b last:border-0"
              style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
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
      <div className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
        <nav className="nav-glass max-w-6xl mx-auto rounded-full flex items-center justify-between px-4 sm:px-6 h-14">
          {/* Left: Logo */}
          <span className="text-xl font-black tracking-tight shrink-0" style={{ color:'hsl(140,100%,7%)' }}>
            🐾 PetEase
          </span>

          {/* Center: Nav links with dropdowns */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-full transition-colors hover:bg-primary/10"
              style={{ color: 'hsl(140,100%,7%)' }}>
              Home
            </Link>
            <NavDropdown label="Adoption" items={adoptionItems} />
            <NavDropdown label="Services" items={servicesItems} />
            <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-full transition-colors hover:bg-primary/10"
              style={{ color: 'hsl(140,100%,7%)' }}>
              About
            </Link>
          </div>

          {/* Right: CTA */}
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium rounded-full transition-colors hover:bg-primary/10"
              style={{ color: 'hsl(140,100%,7%)' }}>
              Login
            </Link>
            <Link to="/login" className="btn-outline" style={{ padding: '9px 22px', fontSize: '0.75rem' }}>
              Contact Us
            </Link>
          </div>
        </nav>
      </div>

      {/* ── Hero Section ── */}
      <section className="relative z-10 pt-16 pb-0 px-4 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, hsla(130,100%,40%,0.08) 0%, hsla(135,95%,18%,0.06) 50%, hsla(132,79%,89%,0) 100%)',
        }}>
        {/* Dot texture overlay */}
        <div className="absolute inset-0 opacity-30" aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(hsla(135,95%,18%,0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 py-20">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ background:'hsla(130,100%,30%,0.14)', color:'hsl(130,100%,30%)' }}>
              Pet Adoption &amp; Veterinary System
            </span>
            <h1 className="heading-dark text-5xl sm:text-6xl lg:text-7xl mb-6">
              Find a Friend.<br />
              <span style={{ color:'hsl(130,100%,30%)' }}>Care for Life.</span>
            </h1>
            <p className="text-lg mb-10 max-w-xl mx-auto lg:mx-0 font-light"
              style={{ color:'hsla(140,100%,7%,0.58)', lineHeight:'1.75' }}>
              PetEase connects pet owners, adopters, and veterinary staff in one seamless platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register" className="btn-pay text-center" style={{ padding:'14px 36px' }}>Start Adopting</Link>
              <Link to="/login"    className="btn-outline text-center" style={{ padding:'13px 36px' }}>Sign In</Link>
            </div>
          </div>

          {/* Pet photo grid */}
          <div className="flex-1 grid grid-cols-2 gap-4 max-w-md w-full">
            {[
              { src:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300', alt:'Dog',   mt:'' },
              { src:'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300', alt:'Cat',   mt:'mt-8' },
              { src:'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=300', alt:'Cat 2', mt:'-mt-4' },
              { src:'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=300', alt:'Dog 2', mt:'mt-4' },
            ].map(i => (
              <img key={i.alt} src={i.src} alt={i.alt}
                className={`rounded-3xl object-cover w-full h-48 shadow-glass ${i.mt}`} />
            ))}
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
      <section className="relative z-10 py-10 px-4">
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
      <section className="relative z-10 py-24 px-4">
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

      {/* ── Vet Services ── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-dark text-4xl mb-4">Veterinary Services</h2>
            <p className="font-light" style={{ color:'hsla(140,100%,7%,0.55)' }}>
              Professional care for your pets, scheduled at your convenience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title:'Consultation',        schedule:'Every Monday', desc:'General health checkups and medical consultations with our licensed veterinarians.' },
              { title:'Anti-Rabies Vaccine', schedule:'Weekdays',     desc:'Keep your pets protected with our regular anti-rabies vaccination program.' },
              { title:'Spay / Neuter',       schedule:'By Schedule',  desc:'Scheduled spay and neuter services announced by our veterinary staff.' },
            ].map((s, i) => (
              <div key={i} className="glass-inner p-6"
                style={{ borderTop:'2.5px solid hsl(130,100%,30%)' }}>
                <h3 className="text-sm font-black uppercase tracking-wider mb-1"
                  style={{ color:'hsl(140,100%,7%)' }}>{s.title}</h3>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color:'hsl(130,100%,30%)' }}>{s.schedule}</p>
                <p className="text-sm font-light" style={{ color:'hsla(140,100%,7%,0.55)', lineHeight:'1.7' }}>
                  {s.desc}
                </p>
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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xl font-black" style={{ color:'hsl(140,100%,7%)' }}>PetEase</p>
            <p className="text-sm font-light mt-0.5"
              style={{ color:'hsla(140,100%,7%,0.45)' }}>
              Pet Adoption &amp; Veterinary Appointment System
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/login"    className="font-light transition-opacity hover:opacity-100" style={{ color:'hsla(140,100%,7%,0.50)' }}>Login</Link>
            <Link to="/register" className="font-light transition-opacity hover:opacity-100" style={{ color:'hsla(140,100%,7%,0.50)' }}>Register</Link>
          </div>
          <p className="text-sm font-light" style={{ color:'hsla(140,100%,7%,0.35)' }}>
            © {new Date().getFullYear()} PetEase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
