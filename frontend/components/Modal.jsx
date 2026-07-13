import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex min-h-screen items-center justify-center px-4 py-6">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />
        <div className="relative glass-card max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 id="modal-title" className="heading-dark text-lg">{title}</h3>
            <button onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:opacity-70"
              style={{ color:'hsla(140,100%,7%,0.55)' }} aria-label="Close modal">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
