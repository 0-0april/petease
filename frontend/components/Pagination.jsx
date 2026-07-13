import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const left  = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const btnBase = 'inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all';

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className={`${btnBase} glass-inner disabled:opacity-40 disabled:cursor-not-allowed`}
        style={{ color:'hsla(140,100%,7%,0.65)' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Prev</span>
      </button>

      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`e-${idx}`} className="px-2 py-2 text-sm select-none"
            style={{ color:'hsla(140,100%,7%,0.40)' }}>…</span>
        ) : (
          <button key={page} onClick={() => onPageChange(page)}
            className={`min-w-[36px] px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              currentPage === page ? 'btn-pay shadow' : 'glass-inner'
            }`}
            style={currentPage !== page ? { color:'hsla(140,100%,7%,0.65)' } : {}}>
            {page}
          </button>
        )
      )}

      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className={`${btnBase} glass-inner disabled:opacity-40 disabled:cursor-not-allowed`}
        style={{ color:'hsla(140,100%,7%,0.65)' }}>
        <span className="hidden sm:inline">Next</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
