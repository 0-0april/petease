import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/browse-pets',       label: 'Browse Pets' },
  { to: '/my-pets',           label: 'My Pets'     },
  { to: '/appointments',      label: 'Appointments'},
  { to: '/adoption-requests', label: 'Adoptions'   },
  { to: '/messages',          label: 'Messages'    },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [warnDismissed, setWarnDismissed] = useState(false);

  const handleLogout = () => { logout(); navigate('/landing'); };
  const isActive = (p) => pathname === p;

  return (
    <div className="relative min-h-screen" style={{ background: 'hsla(132,79%,89%,1)' }}>
      {/* Ambient spheres */}
      <div className="pe-bg" aria-hidden="true">
        <div className="pe-sphere animate-float-slow"
          style={{ width: '500px', height: '500px', top: '-160px', left: '-130px', opacity: 0.40 }} />
        <div className="pe-sphere animate-float-mid"
          style={{ width: '340px', height: '340px', bottom: '-100px', right: '-80px', opacity: 0.30 }} />
      </div>

      {/* Floating pill navbar */}
      <div className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8">
        <nav className="nav-glass max-w-6xl mx-auto rounded-full flex items-center justify-between px-4 sm:px-5 h-14">
          {/* Left: Logo */}
          <Link to="/browse-pets" className="shrink-0 text-xl font-black tracking-tight"
            style={{ color: 'hsl(140,100%,7%)' }}>
            🐾 PetEase
          </Link>

          {/* Center: Nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${isActive(l.to) ? 'nav-active' : 'nav-inactive hover:opacity-80'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right: Notifications + user + logout */}
          <div className="flex items-center gap-2">
            <Link to="/notifications"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ color: 'hsla(140,100%,7%,0.55)' }} title="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>
            <span className="hidden lg:block max-w-[140px] truncate text-sm font-medium"
              style={{ color: 'hsla(140,100%,7%,0.65)' }}>
              {user?.name || user?.email}
            </span>
            <button onClick={handleLogout} className="btn-pay hidden sm:inline-flex"
              style={{ padding: '8px 20px', fontSize: '0.75rem' }}>
              Logout
            </button>
            {/* Mobile hamburger */}
            <button type="button" onClick={() => setOpen(o => !o)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full md:hidden"
              style={{ background: 'rgba(255,255,255,0.50)', color: 'hsl(140,100%,7%)' }}
              aria-label="Toggle menu" aria-expanded={open}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile drawer — sits below the pill */}
        {open && (
          <div className="md:hidden mt-2 max-w-6xl mx-auto nav-glass rounded-2xl px-4 py-3">
            <div className="grid gap-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive(l.to) ? 'nav-active' : 'nav-inactive'}`}>
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl px-3 py-2 glass-inner">
                <span className="min-w-0 truncate text-sm" style={{ color: 'hsla(140,100%,7%,0.60)' }}>
                  {user?.name || user?.email}
                </span>
                <button onClick={handleLogout} className="btn-pay shrink-0"
                  style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Warning banner */}
        {user?.accStatus === 'Warning' && !warnDismissed && (
          <div className="mb-4 flex items-start justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'hsla(45,100%,51%,0.18)', border: '1px solid hsla(45,100%,51%,0.45)', color: 'hsl(35,90%,30%)' }}>
            <span>⚠️ Your account has received a warning from the admin due to a report. Please review our community guidelines to avoid further action.</span>
            <button onClick={() => setWarnDismissed(true)}
              className="shrink-0 ml-2 text-lg leading-none hover:opacity-60 transition-opacity"
              aria-label="Dismiss warning">×</button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
