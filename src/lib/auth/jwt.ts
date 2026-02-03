import { SignJWT, jwtVerify } from 'jose';
import type { EthereumAddress, AuthSession, DelegatedPunk } from '@/types/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

const COOKIE_NAME = 'punk-auth';
const EXPIRATION = '24h';

export { COOKIE_NAME };

/**
 * Create a signed JWT for an authenticated user
 */
export async function createAuthToken(
  wallet: EthereumAddress,
  ownedPunks: number[],
  delegatedPunks: DelegatedPunk[]
): Promise<string> {
  return new SignJWT({ wallet, ownedPunks, delegatedPunks })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an auth token
 */
export async function verifyAuthToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Cookie options for the auth token
 */
export const cookieOptions = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24, // 24 hours
  path: '/',
};
