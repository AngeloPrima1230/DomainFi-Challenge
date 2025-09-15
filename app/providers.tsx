'use client';

import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { polygonMumbai, sepolia } from 'wagmi/chains';
import { publicProvider, jsonRpcProvider, alchemyProvider, infuraProvider } from 'wagmi';
import { metaMaskWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';

const { chains, publicClient } = configureChains(
  [sepolia, polygonMumbai],
  [
    // Priority 1: Alchemy (if key provided)
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
    }),
    // Priority 2: Infura (if key provided)
    infuraProvider({
      apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY || '',
    }),
    // Priority 3: Custom RPC fallback(s)
    jsonRpcProvider({
      stallTimeout: 1500,
      rpc: (chain) => {
        if (chain.id === sepolia.id) {
          return { http: process.env.NEXT_PUBLIC_SEPOLIA_RPC || 'https://rpc.sepolia.org' };
        }
        if (chain.id === polygonMumbai.id) {
          return { http: process.env.NEXT_PUBLIC_MUMBAI_RPC || (chain.rpcUrls.default.http[0] || '') };
        }
        return null;
      },
    }),
    // Priority 4: Public provider as a final fallback
    publicProvider(),
  ],
  { stallTimeout: 1500 }
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ chains, projectId: 'demo-project-id' }),
      coinbaseWallet({ appName: 'DomainFi Auction Marketplace', chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}