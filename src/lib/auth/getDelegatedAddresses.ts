import type { EthereumAddress, Delegation } from '@/types/auth';

/**
 * Fetches delegations from delegate.xyz V1 API
 */
async function getDelegatedAddressesV1(address: EthereumAddress): Promise<Delegation[]> {
  try {
    const response = await fetch(`https://api.delegate.xyz/registry/v1/${address}`);

    if (!response.ok) {
      return [];
    }

    const delegations = await response.json();

    return delegations.map((d: { delegate: string; vault: string }) => ({
      from: d.vault as EthereumAddress,
      to: d.delegate as EthereumAddress,
      source: 'delegatecash-v1' as const,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetches delegations from delegate.xyz V2 API
 */
async function getDelegatedAddressesV2(address: EthereumAddress): Promise<Delegation[]> {
  try {
    const response = await fetch(`https://api.delegate.xyz/registry/v2/${address}`);

    if (!response.ok) {
      return [];
    }

    const delegations = await response.json();

    return delegations.map((d: { from: string; to: string }) => ({
      from: d.from as EthereumAddress,
      to: d.to as EthereumAddress,
      source: 'delegatecash-v2' as const,
    }));
  } catch {
    return [];
  }
}

/**
 * Get all delegated addresses from both V1 and V2 APIs
 */
export async function getDelegatedAddresses(address: EthereumAddress): Promise<Delegation[]> {
  const [v1, v2] = await Promise.all([
    getDelegatedAddressesV1(address),
    getDelegatedAddressesV2(address),
  ]);

  // Deduplicate by 'from' address
  const seen = new Set<string>();
  const unique: Delegation[] = [];

  for (const delegation of [...v1, ...v2]) {
    if (!seen.has(delegation.from.toLowerCase())) {
      seen.add(delegation.from.toLowerCase());
      unique.push(delegation);
    }
  }

  return unique;
}

/**
 * Get all wallets (main + delegated) for an address
 */
export async function getAllWallets(address: EthereumAddress): Promise<EthereumAddress[]> {
  const delegations = await getDelegatedAddresses(address);
  const delegatedWallets = delegations.map(d => d.from);

  // Return unique wallets (main + delegated)
  const all = [address, ...delegatedWallets];
  return [...new Set(all.map(w => w.toLowerCase()))] as EthereumAddress[];
}
