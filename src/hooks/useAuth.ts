'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { SiweMessage } from 'siwe';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { useInitialAuth } from '@/components/providers/Web3Provider';
import type { EthereumAddress, DelegatedPunk } from '@/types/auth';

interface AuthState {
  authenticated: boolean;
  wallet: EthereumAddress | null;
  ownedPunks: number[];
  delegatedPunks: DelegatedPunk[];
}

interface UseAuthReturn {
  // State
  isConnected: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  wallet: EthereumAddress | null;
  ownedPunks: number[];
  delegatedPunks: DelegatedPunk[];
  /** All punk IDs (owned + delegated) */
  allPunkIds: number[];

  // Actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  disconnect: () => void;

  // Helpers
  ownsPunk: (punkId: number) => boolean;
  preferredPunk: number | null;
  setPreferredPunk: (punkId: number) => void;
  /** Get delegation info for a punk, or null if owned directly */
  getDelegationInfo: (punkId: number) => DelegatedPunk | null;
}

const PREFERRED_PUNK_KEY = 'preferred-punk';

const EMPTY_STATE: AuthState = {
  authenticated: false,
  wallet: null,
  ownedPunks: [],
  delegatedPunks: [],
};

export function useAuth(): UseAuthReturn {
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Get initial auth state from server (passed via context to avoid hydration mismatch)
  const initialAuth = useInitialAuth();

  // Fetch current auth status
  const { data: authState, isLoading } = useQuery<AuthState>({
    queryKey: ['auth'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        return EMPTY_STATE;
      }
      return res.json();
    },
    // Use server-provided initial data to prevent hydration mismatch
    initialData: initialAuth ?? undefined,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Compute all punk IDs (owned + delegated)
  const allPunkIds = useMemo(() => {
    const owned = authState?.ownedPunks ?? [];
    const delegated = (authState?.delegatedPunks ?? []).map(d => d.punkId);
    return [...owned, ...delegated].sort((a, b) => a - b);
  }, [authState?.ownedPunks, authState?.delegatedPunks]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('No wallet connected');

      // 1. Get nonce
      const nonceRes = await fetch('/api/auth/nonce');
      const { nonce } = await nonceRes.json();

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Made by Punks',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce,
      });

      const messageString = message.prepareMessage();

      // 3. Sign message
      const signature = await signMessageAsync({ message: messageString });

      // 4. Verify with backend
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageString, signature }),
      });

      if (!loginRes.ok) {
        const error = await loginRes.json();
        throw new Error(error.message || error.error || 'Login failed');
      }

      return loginRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth'], EMPTY_STATE);
    },
  });

  const login = useCallback(async () => {
    await loginMutation.mutateAsync();
  }, [loginMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const disconnect = useCallback(() => {
    logoutMutation.mutate();
    wagmiDisconnect();
  }, [logoutMutation, wagmiDisconnect]);

  const ownsPunk = useCallback(
    (punkId: number) => allPunkIds.includes(punkId),
    [allPunkIds]
  );

  const getDelegationInfo = useCallback(
    (punkId: number): DelegatedPunk | null => {
      return authState?.delegatedPunks?.find(d => d.punkId === punkId) ?? null;
    },
    [authState?.delegatedPunks]
  );

  // Preferred punk (stored in localStorage)
  // Use state + effect to avoid SSR hydration mismatch
  const [preferredPunk, setPreferredPunkState] = useState<number | null>(() => {
    // Default to first punk from initial auth state (works for SSR)
    // Prefer owned punks first
    const firstOwned = initialAuth?.ownedPunks?.[0];
    const firstDelegated = initialAuth?.delegatedPunks?.[0]?.punkId;
    return firstOwned ?? firstDelegated ?? null;
  });

  // Sync preferred punk from localStorage after mount
  // This is a valid pattern for hydrating from localStorage - the setState is intentional
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = localStorage.getItem(PREFERRED_PUNK_KEY);
    if (stored) {
      const id = Number(stored);
      // Validate that user still owns this punk (owned or delegated)
      if (allPunkIds.includes(id)) {
        setPreferredPunkState(id);
        return;
      }
    }
    // Fallback to first punk (prefer owned)
    const firstOwned = authState?.ownedPunks?.[0];
    const firstDelegated = authState?.delegatedPunks?.[0]?.punkId;
    setPreferredPunkState(firstOwned ?? firstDelegated ?? null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [allPunkIds, authState?.ownedPunks, authState?.delegatedPunks]);

  const setPreferredPunk = useCallback((punkId: number) => {
    localStorage.setItem(PREFERRED_PUNK_KEY, String(punkId));
    setPreferredPunkState(punkId);
  }, []);

  return {
    isConnected,
    isAuthenticated: authState?.authenticated ?? false,
    isLoading: isLoading || loginMutation.isPending,
    wallet: authState?.wallet ?? null,
    ownedPunks: authState?.ownedPunks ?? [],
    delegatedPunks: authState?.delegatedPunks ?? [],
    allPunkIds,
    login,
    logout,
    disconnect,
    ownsPunk,
    preferredPunk,
    setPreferredPunk,
    getDelegationInfo,
  };
}
