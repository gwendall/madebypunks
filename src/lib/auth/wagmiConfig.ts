'use client';

import { http, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
    ...(projectId ? [
      walletConnect({
        projectId,
        metadata: {
          name: 'Made by Punks',
          description: 'A directory of projects built by CryptoPunks holders',
          url: 'https://madebypunks.com',
          icons: ['https://madebypunks.com/icon.png'],
        },
      }),
      coinbaseWallet({
        appName: 'Made by Punks',
      }),
    ] : []),
  ],
  transports: {
    [mainnet.id]: http(),
  },
  ssr: true,
});
