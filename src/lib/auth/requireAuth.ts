import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAuthToken, COOKIE_NAME } from './jwt';
import { getOwnedPunks } from './isPunkOwner';
import type { EthereumAddress, DelegatedPunk } from '@/types/auth';

interface AuthResult {
  wallet: EthereumAddress;
  ownedPunks: number[];
  delegatedPunks: DelegatedPunk[];
  /** All punk IDs (owned + delegated) */
  allPunkIds: number[];
}

interface AuthError {
  error: string;
  status: number;
}

/**
 * Server-side auth check for API routes
 * Returns the authenticated session or an error
 */
export async function requireAuth(): Promise<AuthResult | AuthError> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return { error: 'Not authenticated', status: 401 };
  }

  const session = await verifyAuthToken(token);

  if (!session) {
    return { error: 'Invalid or expired session', status: 401 };
  }

  const allPunkIds = [
    ...session.ownedPunks,
    ...session.delegatedPunks.map(d => d.punkId)
  ];

  return {
    wallet: session.wallet,
    ownedPunks: session.ownedPunks,
    delegatedPunks: session.delegatedPunks,
    allPunkIds,
  };
}

/**
 * Check if the authenticated user owns a specific punk
 */
export async function requirePunkOwnership(punkId: number): Promise<AuthResult | AuthError> {
  const auth = await requireAuth();

  if ('error' in auth) {
    return auth;
  }

  // Check if user owns this punk (from JWT)
  if (!auth.allPunkIds.includes(punkId)) {
    // Double-check on-chain in case of recent transfer
    const { ownedPunks, delegatedPunks } = await getOwnedPunks(auth.wallet);
    const currentPunkIds = [
      ...ownedPunks,
      ...delegatedPunks.map(d => d.punkId)
    ];

    if (!currentPunkIds.includes(punkId)) {
      return { error: 'You do not own this punk', status: 403 };
    }
  }

  return auth;
}

/**
 * Helper to create error responses
 */
export function authError(result: AuthError): NextResponse {
  return NextResponse.json({ error: result.error }, { status: result.status });
}

/**
 * Type guard to check if result is an error
 */
export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return 'error' in result;
}
