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
        return 'TAGHAUS';
    }
  };

  return (
    <header className="bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-purple-500/30 z-50 shadow-2xl">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/logo.svg" 
                alt="TAGHAUS Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">TAGHAUS</span>
              <p className="text-xs text-purple-300/70 -mt-1 font-medium">Powered by Doma</p>
            </div>
          </div>
          
          {/* Centered Navigation */}
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => router.push('/')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                pathname === '/' 
                  ? 'bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white border-2 border-purple-400/70 shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/25 hover:to-pink-500/25 hover:border-2 hover:border-purple-400/50'
              }`}
            >
              Search
            </button>
            {isConnected && (
              <button
                onClick={() => router.push('/dashboard')}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  pathname === '/dashboard' 
                    ? 'bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white border-2 border-purple-400/70 shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/25 hover:to-pink-500/25 hover:border-2 hover:border-purple-400/50'
                }`}
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => router.push('/marketplace')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                pathname === '/marketplace' 
                  ? 'bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white border-2 border-purple-400/70 shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/25 hover:to-pink-500/25 hover:border-2 hover:border-purple-400/50'
              }`}
            >
              Marketplace
            </button>
          </nav>
          
          {/* Profile Menu */}
          <div className="flex items-center">
            {isConnected ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/25 to-pink-500/25 backdrop-blur-md rounded-lg px-4 py-2.5 border border-purple-400/40 hover:from-purple-500/45 hover:to-pink-500/45 hover:border-purple-400/60 transition-all duration-200 shadow-lg">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-sm"></div>
                  <span className="text-sm text-white font-mono font-semibold">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-3 w-56 bg-gradient-to-br from-slate-800/95 to-purple-900/95 backdrop-blur-xl rounded-xl border border-purple-400/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 shadow-2xl">
                  <div className="py-2">
                    <div className="px-4 py-3 text-xs text-purple-300/80 border-b border-purple-400/20 font-mono">
                      {address}
                    </div>
                    <button className="w-full text-left px-4 py-3 text-sm text-white hover:bg-purple-500/20 transition-colors flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>View Profile</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm text-white hover:bg-purple-500/20 transition-colors flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="scale-90">
                <ConnectButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
