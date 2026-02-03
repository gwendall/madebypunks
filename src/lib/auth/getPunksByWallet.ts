import type { EthereumAddress, OwnedNft } from '@/types/auth';
import { CRYPTOPUNKS_CONTRACT } from './config';

/**
 * Fetches CryptoPunks owned by a wallet using Alchemy NFT API
 */
export async function getPunksByWallet(wallet: EthereumAddress): Promise<OwnedNft[]> {
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (!apiKey) {
    console.error('ALCHEMY_API_KEY not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner?` +
      new URLSearchParams({
        owner: wallet,
        'contractAddresses[]': CRYPTOPUNKS_CONTRACT,
        withMetadata: 'false',
      }),
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      console.error('Alchemy API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.ownedNfts as OwnedNft[];
  } catch (error) {
    console.error('Error fetching punks:', error);
    return [];
  }
}

/**
 * Get punk IDs as numbers from a wallet
 */
export async function getPunkIdsByWallet(wallet: EthereumAddress): Promise<number[]> {
  const nfts = await getPunksByWallet(wallet);
  return nfts.map(nft => Number(nft.tokenId));
}
