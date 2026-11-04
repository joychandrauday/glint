import { useState, useEffect, useCallback } from 'react';

const GUEST_LIMIT_KEY = 'glint_guest_searches_left';
const MAX_GUEST_SEARCHES = 10;

export function useGuestMode(isAuthenticated: boolean) {
  const [searchesLeft, setSearchesLeft] = useState<number>(() => {
    const saved = localStorage.getItem(GUEST_LIMIT_KEY);
    return saved !== null ? Number(saved) : MAX_GUEST_SEARCHES;
  });

  useEffect(() => {
    localStorage.setItem(GUEST_LIMIT_KEY, searchesLeft.toString());
  }, [searchesLeft]);

  const isLocked = !isAuthenticated && searchesLeft <= 0;

  const decrementSearchCount = useCallback(() => {
    if (isAuthenticated) return true; // Authenticated users have unlimited offline searches

    if (searchesLeft <= 0) {
      return false; // Locked
    }

    setSearchesLeft((prev) => Math.max(0, prev - 1));
    return true;
  }, [isAuthenticated, searchesLeft]);

  const resetGuestCounter = useCallback(() => {
    setSearchesLeft(MAX_GUEST_SEARCHES);
    localStorage.setItem(GUEST_LIMIT_KEY, MAX_GUEST_SEARCHES.toString());
  }, []);

  return {
    searchesLeft,
    maxLimit: MAX_GUEST_SEARCHES,
    isLocked,
    decrementSearchCount,
    resetGuestCounter,
  };
}
