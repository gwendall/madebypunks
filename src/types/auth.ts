export type EthereumAddress = `0x${string}`;

export interface DelegatedPunk {
  punkId: number;
  from: EthereumAddress;
}

export interface AuthSession {
  wallet: EthereumAddress;
  ownedPunks: number[];
  delegatedPunks: DelegatedPunk[];
  iat: number;
  exp: number;
}

export interface OwnedNft {
  contractAddress: EthereumAddress;
  tokenId: string;
  balance: string;
}

export interface Delegation {
  from: EthereumAddress;
  to: EthereumAddress;
  source: 'delegatecash-v1' | 'delegatecash-v2';
}
