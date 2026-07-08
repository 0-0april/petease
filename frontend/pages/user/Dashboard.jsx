import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

const cards = [
  { to:'/browse-pets',       label:'Browse Pets',   desc:'Find your perfect companion',
    iconPath:'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    bg:'hsla(130,100%,30%,0.12)', ic:'hsl(130,100%,28%)' },
  { to:'/my-pets',           label:'My Pets',        desc:'Register and manage your pets',
    iconPath:'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    bg:'hsla(350,80%,58%,0.11)', ic:'hsl(350,65%,50%)' },
  { to:'/appointments',      label:'Appointments',   desc:'Book vet appointments',
    iconPath:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    bg:'hsla(215,80%,60%,0.11)', ic:'hsl(215,65%,48%)' },
  { to:'/adoption-requests', label:'Adoptions',      desc:'Manage adoption requests',
    iconPath:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    bg:'hsla(270,65%,58%,0.11)', ic:'hsl(270,50%,50%)' },
  { to:'/messages',          label:'Messages',       desc:'Chat with pet owners',
    iconPath:'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    bg:'hsla(42,85%,54%,0.13)', ic:'hsl(38,65%,42%)' },
  { to:'/notifications',     label:'Notifications',  desc:'View your latest updates',
    iconPath:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    bg:'hsla(25,82%,56%,0.11)', ic:'hsl(22,62%,44%)' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="heading-dark text-3xl sm:text-4xl">
            Welcome, {user?.name?.split(' ')[0] || user?.email}
          </h1>
          <p className="mt-2 text-sm font-light tracking-wide"
            style={{ color:'hsla(140,100%,7%,0.50)' }}>
            what would you like to do today?
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {cards.map(c => (
            <Link key={c.to} to={c.to}
              className="group glass-inner flex items-start gap-4 p-5 transition-all hover:shadow-glass">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center
                              transition-transform group-hover:scale-105"
                style={{ background:c.bg }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ color:c.ic }} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={c.iconPath} />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold uppercase tracking-wide transition-opacity group-hover:opacity-70"
                  style={{ color:'hsl(140,100%,7%)' }}>
                  {c.label}
                </h3>
                <p className="text-xs font-light mt-0.5"
                  style={{ color:'hsla(140,100%,7%,0.50)' }}>
                  {c.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
