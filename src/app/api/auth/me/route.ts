import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuthToken, COOKIE_NAME } from '@/lib/auth/jwt';
import { getOwnedPunks } from '@/lib/auth/isPunkOwner';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = await verifyAuthToken(token);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    wallet: session.wallet,
    ownedPunks: session.ownedPunks,
    delegatedPunks: session.delegatedPunks,
  });
}

/**
 * Refresh punk ownership (re-check on-chain)
 */
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = await verifyAuthToken(token);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Re-fetch punks from chain
  const { ownedPunks, delegatedPunks } = await getOwnedPunks(session.wallet);

  return NextResponse.json({
    authenticated: true,
    wallet: session.wallet,
    ownedPunks,
    delegatedPunks,
  });
}
