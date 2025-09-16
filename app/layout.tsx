import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'TAGHAUS - Decentralized Domain Marketplace',
  description: 'Discover, trade, and own digital domains on the blockchain. Powered by Doma Protocol.',
  keywords: ['TAGHAUS', 'Domain', 'Marketplace', 'NFT', 'Domains', 'Doma Protocol', 'Web3', 'Blockchain'],
  authors: [{ name: 'TAGHAUS Team' }],
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: 'TAGHAUS - Decentralized Domain Marketplace',
    description: 'Discover, trade, and own digital domains on the blockchain. Powered by Doma Protocol.',
    type: 'website',
    url: 'https://taghaus.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TAGHAUS - Decentralized Domain Marketplace',
    description: 'Discover, trade, and own digital domains on the blockchain. Powered by Doma Protocol.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.className} h-full overflow-x-hidden`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

