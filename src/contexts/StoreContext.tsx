import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Store {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  is_active: boolean;
}

interface StoreContextType {
  currentStore: Store | null;
  stores: Store[];
  setStore: (store: Store) => void;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load store from localStorage
    const storedStore = localStorage.getItem('currentStore');
    if (storedStore) {
      try {
        const parsed = JSON.parse(storedStore);
        setCurrentStore(parsed);
      } catch {
        localStorage.removeItem('currentStore');
      }
    }
    setIsLoading(false);
  }, []);

  const setStore = (store: Store) => {
    setCurrentStore(store);
    localStorage.setItem('currentStore', JSON.stringify(store));
  };

  return (
    <StoreContext.Provider value={{
      currentStore,
      stores,
      setStore,
      isLoading,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}