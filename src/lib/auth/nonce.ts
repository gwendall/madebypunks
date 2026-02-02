import { cookies } from 'next/headers';

const NONCE_COOKIE = 'siwe-nonce';

/**
 * Generate a random nonce for SIWE
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store nonce in a cookie for verification
 */
export async function setNonceCookie(nonce: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 5, // 5 minutes
    path: '/',
  });
}

/**
 * Get and consume the nonce from cookie
 */
export async function consumeNonce(): Promise<string | null> {
  const cookieStore = await cookies();
  const nonce = cookieStore.get(NONCE_COOKIE)?.value || null;

  if (nonce) {
    cookieStore.delete(NONCE_COOKIE);
  }

  return nonce;
}
