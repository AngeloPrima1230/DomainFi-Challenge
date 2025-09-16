'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Search';
      case '/dashboard':
        return 'Dashboard';
      case '/marketplace':
        return 'Marketplace';
      default:
        return 'Doma Protocol';
    }
  };

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">D</span>
            </div>
            <span className="text-sm font-bold text-white">Doma Protocol</span>
          </div>
          
          {/* Centered Navigation */}
          <nav className="flex items-center space-x-6">
            <button
              onClick={() => router.push('/')}
              className={`text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'text-blue-400' 
                  : 'text-white hover:text-blue-400'
              }`}
            >
              Search
            </button>
            {isConnected && (
              <button
                onClick={() => router.push('/dashboard')}
                className={`text-sm font-medium transition-colors ${
                  pathname === '/dashboard' 
                    ? 'text-blue-400' 
                    : 'text-white hover:text-blue-400'
                }`}
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => router.push('/marketplace')}
              className={`text-sm font-medium transition-colors ${
                pathname === '/marketplace' 
                  ? 'text-blue-400' 
                  : 'text-white hover:text-blue-400'
              }`}
            >
              Marketplace
            </button>
          </nav>
          
          {/* Profile Menu */}
          <div className="flex items-center">
            {isConnected ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-md px-3 py-1.5 border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-white font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md rounded-md border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs text-gray-400 border-b border-white/10">
                      {address}
                    </div>
                    <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                      View Profile
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                      Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors">
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="scale-75">
                <ConnectButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
