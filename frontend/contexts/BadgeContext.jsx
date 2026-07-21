import React, { createContext, useContext, useState, useCallback } from 'react';

const BadgeContext = createContext(null);

export const BadgeProvider = ({ children }) => {
  const [counts, setCounts] = useState({});

  // Subject pages call this to push their unseen count
  const notify = useCallback((route, count) => {
    setCounts(prev => {
      if (prev[route] === count) return prev;
      return { ...prev, [route]: count };
    });
  }, []);

  // Called when the user visits the page — resets the badge
  const clear = useCallback((route) => {
    setCounts(prev => {
      if (!prev[route]) return prev;
      const next = { ...prev };
      delete next[route];
      return next;
    });
  }, []);

  const getCount = useCallback((route) => counts[route] || 0, [counts]);

  return (
    <BadgeContext.Provider value={{ notify, clear, getCount }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadge = () => useContext(BadgeContext);
