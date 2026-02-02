import { cookies } from 'next/headers';
import { verifyAuthToken, COOKIE_NAME } from './jwt';
import type { EthereumAddress, DelegatedPunk } from '@/types/auth';

export interface AuthState {
  authenticated: boolean;
  wallet: EthereumAddress | null;
  ownedPunks: number[];
  delegatedPunks: DelegatedPunk[];
}

const EMPTY_STATE: AuthState = {
  authenticated: false,
  wallet: null,
  ownedPunks: [],
  delegatedPunks: [],
};

/**
 * Get auth state from cookies on the server
 * Use this in server components to pre-render the correct auth state
 */
export async function getServerAuthState(): Promise<AuthState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return EMPTY_STATE;
    }

    const session = await verifyAuthToken(token);

    if (!session) {
      return EMPTY_STATE;
    }

    return {
      authenticated: true,
      wallet: session.wallet,
      ownedPunks: session.ownedPunks,
      delegatedPunks: session.delegatedPunks,
    };
  } catch {
    return EMPTY_STATE;
  }
}
