'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, createContext, useContext, type ReactNode } from 'react';
import { wagmiConfig } from '@/lib/auth/wagmiConfig';
import type { AuthState } from '@/lib/auth/getServerAuthState';

// Context for initial auth state (used to avoid hydration mismatch)
const InitialAuthContext = createContext<AuthState | null>(null);

export function useInitialAuth() {
  return useContext(InitialAuthContext);
}

interface Web3ProviderProps {
  children: ReactNode;
  initialAuthState?: AuthState;
}

export function Web3Provider({ children, initialAuthState }: Web3ProviderProps) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          refetchOnWindowFocus: false,
        },
      },
    });

    // Hydrate the auth query with server-side data
    if (initialAuthState) {
      client.setQueryData(['auth'], initialAuthState);
    }

    return client;
  });

  return (
    <InitialAuthContext.Provider value={initialAuthState ?? null}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </InitialAuthContext.Provider>
  );
}
