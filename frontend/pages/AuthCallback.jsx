import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const getDashboardPath = (userData) => {
  if (userData?.role === 'admin') return '/admin/dashboard';
  if (userData?.role === 'vet') return '/vet/dashboard';
  return '/';
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const [warningUser, setWarningUser] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const response = await handleGoogleCallback();
        const userData = response?.user || response;

        if (userData?.accStatus === 'Warning') {
          // Show warning banner before proceeding
          setWarningUser(userData);
        } else {
          navigate(getDashboardPath(userData), { replace: true });
        }
      } catch (error) {
        console.error('Google auth callback error:', error);
        // If the error is a 403 (suspended), pass it along to the login page
        const msg = error?.response?.data?.error || '';
        if (msg.toLowerCase().includes('suspended')) {
          navigate('/login?error=suspended', { replace: true });
        } else {
          navigate('/login?error=auth_failed', { replace: true });
        }
      }
    };

    processCallback();
  }, [handleGoogleCallback, navigate]);

  // Warning banner for Google-authed users with Warning status
  if (warningUser) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden"
        style={{ background: 'hsla(132,79%,89%,1)' }}>
        <div className="pe-bg" aria-hidden="true">
          <div className="pe-sphere animate-float-slow"
            style={{ width: '560px', height: '560px', top: '-160px', left: '-140px', opacity: 0.52 }} />
          <div className="pe-sphere animate-float-mid"
            style={{ width: '400px', height: '400px', bottom: '-120px', right: '-100px', opacity: 0.40 }} />
        </div>

        <div className="glass-card relative z-10 w-full max-w-lg px-8 py-10 flex flex-col gap-6">
          <div className="rounded-2xl border px-5 py-4 flex items-start gap-3"
            style={{
              background: 'hsla(48,100%,96%,0.92)',
              borderColor: 'hsla(45,90%,60%,0.60)',
            }}>
            {/* Close (x) button — left side */}
            <button
              onClick={() => navigate(getDashboardPath(warningUser), { replace: true })}
              className="shrink-0 rounded-lg p-1 mt-0.5 transition-opacity hover:opacity-70"
              style={{ color: 'hsl(38,80%,40%)' }}
              aria-label="Dismiss warning and continue">
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Warning icon */}
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor"
              strokeWidth={1.8} viewBox="0 0 24 24"
              style={{ color: 'hsl(38,95%,45%)' }} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>

            <div className="flex-1">
              <p className="font-semibold text-sm mb-1" style={{ color: 'hsl(38,95%,30%)' }}>
                Account Warning
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(38,80%,35%)' }}>
                Your account has received a warning from the admin. Please review our community
                guidelines and ensure your activity complies with PetEase policies.
                Continued violations may result in suspension.
              </p>
            </div>
          </div>

          <p className="text-center text-sm" style={{ color: 'hsla(140,100%,7%,0.55)' }}>
            Click <strong>×</strong> to acknowledge and proceed to your dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Default: loading spinner while processing
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'hsla(132,79%,89%,1)' }}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
          style={{ borderColor: 'hsl(130,100%,30%)' }} />
        <p style={{ color: 'hsla(140,100%,7%,0.55)' }}>Completing sign in…</p>
      </div>
    </div>
  );
};

export default AuthCallback;
