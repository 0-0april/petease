import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/admin/dashboard',     label: 'Dashboard'     },
  { to: '/admin/users',         label: 'Users'         },
  { to: '/admin/reports',       label: 'Reports'       },
  { to: '/admin/announcements', label: 'Announcements' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/landing'); };
  const isActive = (p) => pathname === p;

  return (
    <div className="relative min-h-screen" style={{ background:'hsla(132,79%,89%,1)' }}>
      <div className="pe-bg" aria-hidden="true">
        <div className="pe-sphere animate-float-slow"
          style={{ width:'480px', height:'480px', top:'-150px', left:'-120px', opacity:0.38 }} />
        <div className="pe-sphere animate-float-mid"
          style={{ width:'320px', height:'320px', bottom:'-90px', right:'-70px', opacity:0.28 }} />
      </div>

      <nav className="nav-glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center justify-between gap-3 py-2">
            <div className="flex min-w-0 items-center gap-5 lg:gap-8">
              <Link to="/admin/dashboard"
                className="shrink-0 font-black tracking-tight text-xl sm:text-2xl"
                style={{ color:'hsl(140,100%,7%)' }}>
                PetEase
                <span className="ml-2 text-xs font-semibold uppercase tracking-widest align-middle"
                  style={{ color:'hsl(130,100%,30%)' }}>
                  Admin
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-0.5">
                {navLinks.map(l => (
                  <Link key={l.to} to={l.to}
                    className={`relative px-3 py-2 text-sm rounded-lg transition-colors ${isActive(l.to) ? 'nav-active' : 'nav-inactive hover:opacity-80'}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/admin/notifications"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                style={{ color:'hsla(140,100%,7%,0.55)' }} title="Notifications">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>
              <span className="hidden sm:block max-w-[160px] truncate text-sm font-medium"
                style={{ color:'hsla(140,100%,7%,0.65)' }}>
                {user?.name || user?.email}
              </span>
              <button onClick={handleLogout} className="btn-pay hidden sm:inline-flex"
                style={{ padding:'8px 20px', fontSize:'0.75rem' }}>
                Logout
              </button>
              <button type="button" onClick={() => setOpen(o => !o)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl md:hidden"
                style={{ border:'1px solid rgba(255,255,255,0.6)', background:'rgba(255,255,255,0.35)', color:'hsl(140,100%,7%)' }}
                aria-label="Toggle menu" aria-expanded={open}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>

          {open && (
            <div className="md:hidden border-t py-3" style={{ borderColor:'rgba(255,255,255,0.40)' }}>
              <div className="grid gap-1">
                {navLinks.map(l => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive(l.to) ? 'nav-active' : 'nav-inactive'}`}>
                    {l.label}
                  </Link>
                ))}
                <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl px-3 py-2 glass-inner">
                  <span className="min-w-0 truncate text-sm" style={{ color:'hsla(140,100%,7%,0.60)' }}>
                    {user?.name || user?.email}
                  </span>
                  <button onClick={handleLogout} className="btn-pay shrink-0"
                    style={{ padding:'6px 16px', fontSize:'0.75rem' }}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
