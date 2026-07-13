import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const getDashboardPath = (u) => {
  if (u?.role === 'admin') return '/admin/dashboard';
  if (u?.role === 'vet')   return '/vet/dashboard';
  return '/';
};

const Field = ({ label, icon, textarea, rows, ...props }) => (
  <div>
    <p className="label-caps mb-2">{label}</p>
    <div className="flex items-start gap-2.5">
      {icon && (
        <svg className="w-4 h-4 mt-2 shrink-0 opacity-40" fill="none" stroke="currentColor"
          strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      )}
      {textarea
        ? <textarea className="input-ul flex-1 resize-none" rows={rows || 2} {...props} />
        : <input    className="input-ul flex-1" {...props} />
      }
    </div>
  </div>
);

const ICONS = {
  user:   'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  email:  'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  lock:   'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  phone:  'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  pin:    'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
};

export default function Register() {
  const [form,    setForm]    = useState({ username:'', name:'', email:'', password:'', phone:'', address:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await register(form);
      const user = res?.user || res;
      navigate(getDashboardPath(user), { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError('');
    try { await loginWithGoogle(); }
    catch { setError('Google sign up failed. Please try again.'); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden"
      style={{ background:'hsla(132,79%,89%,1)' }}>

      {/* Spheres */}
      <div className="pe-bg" aria-hidden="true">
        <div className="pe-sphere animate-float-slow"
          style={{ width:'520px', height:'520px', top:'-140px', left:'-120px', opacity:0.50 }} />
        <div className="pe-sphere animate-float-mid"
          style={{ width:'360px', height:'360px', bottom:'-110px', right:'-90px', opacity:0.38 }} />
        <div className="pe-sphere"
          style={{ width:'180px', height:'180px', top:'60%', left:'60%', opacity:0.18,
                   filter:'blur(50px)' }} />
      </div>

      {/* Glass card */}
      <div className="glass-card relative z-10 w-full max-w-4xl flex flex-col lg:flex-row overflow-hidden">

        {/* Left visual */}
        <div className="lg:w-[40%] flex flex-col items-center justify-center gap-6 px-8 py-10 relative overflow-hidden"
          style={{ background:'rgba(255,255,255,0.18)' }}>

          {/* Green glow */}
          <div style={{
            position:'absolute', bottom:'-60px', right:'-60px',
            width:'240px', height:'240px', borderRadius:'50%',
            background:'radial-gradient(circle, hsla(130,100%,40%,0.40) 0%, transparent 70%)',
            filter:'blur(32px)',
          }} aria-hidden="true" />

          {/* Pet image */}
          <div className="relative w-full max-w-[260px]">
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500"
              alt="A happy dog"
              className="w-full h-64 object-cover rounded-3xl shadow-glass"
            />
            <img
              src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300"
              alt="A cute cat"
              className="absolute -bottom-5 -right-5 w-24 h-24 object-cover rounded-2xl shadow-glass"
              style={{ border:'3px solid rgba(255,255,255,0.70)' }}
            />
          </div>

          <div className="text-center mt-4 relative z-10">
            <p className="heading-dark text-3xl">PetEase</p>
            <p className="text-xs tracking-widest mt-2 font-light"
              style={{ color:'hsla(140,100%,7%,0.50)' }}>
              pet adoption and services system
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex-1 px-8 py-10 lg:px-12 overflow-y-auto" style={{ maxHeight:'92vh' }}>
          <h1 className="heading-dark text-3xl sm:text-4xl mb-1">Create account</h1>
          <p className="text-sm font-light tracking-wide mb-8"
            style={{ color:'hsla(140,100%,7%,0.50)' }}>
            fill in your details below
          </p>

          {error && (
            <div className="mb-6 rounded-2xl px-4 py-3 text-sm border"
              style={{ background:'hsla(0,80%,96%,0.70)', borderColor:'hsla(0,65%,80%,0.50)',
                       color:'hsl(0,65%,40%)' }}>
              {error}
            </div>
          )}

          {/* Google */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-2xl mb-6 py-3 px-4 text-sm font-medium transition-all"
            style={{ background:'rgba(255,255,255,0.65)', border:'1px solid rgba(255,255,255,0.75)',
                     color:'hsla(140,100%,7%,0.75)' }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop:'1px solid hsla(135,40%,50%,0.18)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs tracking-wider"
                style={{ color:'hsla(140,100%,7%,0.38)' }}>
                or register with email
              </span>
            </div>
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Username"    icon={ICONS.user}  type="text"     name="username" value={form.username} onChange={e => set('username', e.target.value)} placeholder="johndoe" required />
            <Field label="Full Name"   icon={ICONS.user}  type="text"     name="name"     value={form.name}     onChange={e => set('name',     e.target.value)} placeholder="John Doe" required />
            <Field label="Email Address" icon={ICONS.email} type="email"  name="email"    value={form.email}    onChange={e => set('email',    e.target.value)} placeholder="you@example.com" required autoComplete="email" />
            <Field label="Password"    icon={ICONS.lock}  type="password" name="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" required minLength={6} autoComplete="new-password" />
            <Field label="Phone Number" icon={ICONS.phone} type="tel"     name="phone"    value={form.phone}    onChange={e => set('phone',    e.target.value)} placeholder="+1 (555) 000-0000" required />
            <Field label="Address"     icon={ICONS.pin}   textarea        name="address"  value={form.address}  onChange={e => set('address',  e.target.value)} placeholder="123 Main St, City, State" required />

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="label-caps">Join</p>
                <p className="text-lg font-bold mt-0.5" style={{ color:'hsl(130,100%,30%)' }}>
                  PetEase
                </p>
              </div>
              <button type="submit" disabled={loading} className="btn-pay">
                {loading ? 'Creating…' : 'Register'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color:'hsla(140,100%,7%,0.48)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:opacity-80 transition-opacity"
              style={{ color:'hsl(130,100%,30%)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
