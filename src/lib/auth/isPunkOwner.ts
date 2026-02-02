import type { EthereumAddress, DelegatedPunk } from '@/types/auth';
import { getDelegatedAddresses } from './getDelegatedAddresses';
import { getPunkIdsByWallet } from './getPunksByWallet';

export interface PunkOwnership {
  ownedPunks: number[];
  delegatedPunks: DelegatedPunk[];
}

/**
 * Check if a wallet (including delegated wallets) owns any CryptoPunks
 */
export async function isPunkOwner(wallet: EthereumAddress): Promise<boolean> {
  const { ownedPunks, delegatedPunks } = await getOwnedPunks(wallet);
  return ownedPunks.length > 0 || delegatedPunks.length > 0;
}

/**
 * Get all punk IDs owned by a wallet, separated by owned vs delegated
 */
export async function getOwnedPunks(wallet: EthereumAddress): Promise<PunkOwnership> {
  // Get delegations (vaults that have delegated to this wallet)
  const delegations = await getDelegatedAddresses(wallet);

  // Fetch punks from main wallet and all delegated wallets in parallel
  const [mainWalletPunks, ...delegatedWalletPunks] = await Promise.all([
    getPunkIdsByWallet(wallet),
    ...delegations.map(d => getPunkIdsByWallet(d.from))
  ]);

  // Track which punks we've seen to avoid duplicates
  const seenPunks = new Set<number>();

  // Owned punks (directly in the connected wallet)
  const ownedPunks = mainWalletPunks.filter(punkId => {
    if (seenPunks.has(punkId)) return false;
    seenPunks.add(punkId);
    return true;
  }).sort((a, b) => a - b);

  // Delegated punks (from vault wallets)
  const delegatedPunks: DelegatedPunk[] = [];
  delegations.forEach((delegation, index) => {
    const punks = delegatedWalletPunks[index] || [];
    for (const punkId of punks) {
      if (!seenPunks.has(punkId)) {
        seenPunks.add(punkId);
        delegatedPunks.push({ punkId, from: delegation.from });
      }
    }
  });

  // Sort delegated punks by punkId
  delegatedPunks.sort((a, b) => a.punkId - b.punkId);

  return { ownedPunks, delegatedPunks };
}
