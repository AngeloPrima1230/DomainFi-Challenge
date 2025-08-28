'use client';

import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { polygonMumbai, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { metaMaskWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';

const { chains, publicClient } = configureChains(
  [sepolia, polygonMumbai],
  [publicProvider()]
);

// Use specific wallets instead of getDefaultWallets to avoid WalletConnect issues
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
  autoConnect: false, // Disable auto-connect to avoid WebSocket issues
  connectors,
  publicClient,
  // Remove webSocketPublicClient to avoid connection errors
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

