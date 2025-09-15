'use client';

import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { createConfig, WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { http } from 'viem';
import { defineChain } from 'viem';
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

// Define Doma testnet
const domaTestnet = defineChain({
  id: 97476,
  name: 'Doma Testnet',
  nativeCurrency: {
    name: 'Doma Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.doma.xyz'] },
    public: { http: ['https://rpc-testnet.doma.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Doma Explorer', url: 'https://explorer-testnet.doma.xyz' },
  },
});

const chains = [domaTestnet, sepolia] as const;

// Create a client
const queryClient = new QueryClient();

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet,
    ],
  },
], {
  projectId: 'demo-project-id',
  appName: 'DomainFi Auction Marketplace',
});

const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [domaTestnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}