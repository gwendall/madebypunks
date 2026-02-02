import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { cookies } from 'next/headers';
import { consumeNonce } from '@/lib/auth/nonce';
import { createAuthToken, cookieOptions } from '@/lib/auth/jwt';
import { getOwnedPunks } from '@/lib/auth/isPunkOwner';
import type { EthereumAddress } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();

    if (!message || !signature) {
      return NextResponse.json(
        { error: 'Missing message or signature' },
        { status: 400 }
      );
    }

    // Parse and verify the SIWE message
    const siweMessage = new SiweMessage(message);

    // Verify the nonce matches what we issued
    const storedNonce = await consumeNonce();
    if (!storedNonce || siweMessage.nonce !== storedNonce) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 401 }
      );
    }

    // Verify the signature
    const verification = await siweMessage.verify({ signature });

    if (!verification.success) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const wallet = siweMessage.address as EthereumAddress;

    // Check punk ownership (including delegated wallets)
    const { ownedPunks, delegatedPunks } = await getOwnedPunks(wallet);

    if (ownedPunks.length === 0 && delegatedPunks.length === 0) {
      return NextResponse.json(
        {
          error: 'No CryptoPunks found',
          message: 'This app is exclusively for CryptoPunk owners. Connect a wallet that owns a CryptoPunk or has one delegated to it.',
        },
        { status: 403 }
      );
    }

    // Create JWT token
    const token = await createAuthToken(wallet, ownedPunks, delegatedPunks);

    // Set the auth cookie
    const cookieStore = await cookies();
    cookieStore.set(cookieOptions.name, token, cookieOptions);

    return NextResponse.json({
      success: true,
      wallet,
      ownedPunks,
      delegatedPunks,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
