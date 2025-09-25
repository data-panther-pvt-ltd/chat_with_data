'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ApiKeyContextValue = {
  apiKey: string;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
};

const ApiKeyContext = createContext<ApiKeyContextValue | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState('');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') : null;
    if (stored) setApiKeyState(stored);
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    try { localStorage.setItem('openai_api_key', key); } catch {}
  };

  const clearApiKey = () => {
    setApiKeyState('');
    try { localStorage.removeItem('openai_api_key'); } catch {}
  };

  const value = useMemo(() => ({ apiKey, setApiKey, clearApiKey }), [apiKey]);
  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
}

export function useApiKey(): ApiKeyContextValue {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error('useApiKey must be used within ApiKeyProvider');
  return ctx;
}


