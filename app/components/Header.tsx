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
              <svg width="32" height="30" viewBox="0 0 237 223" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M201.397 51.9995L129.228 4.29099C122.54 -0.1303 113.858 -0.130298 107.169 4.291L37.7618 50.1738C35.9248 51.3881 33.9758 52.4238 31.9413 53.2667V53.2667C12.6064 61.2769 0 80.1449 0 101.073V107C0 113.075 4.92487 118 11 118H35V162C35 195.689 62.3106 223 96 223H141.426C175.338 223 202.741 195.339 202.423 161.428L201.397 51.9995ZM139 128.5H97C92.0294 128.5 88 132.529 88 137.5V189C88 193.971 92.0294 198 97 198H139C143.971 198 148 193.971 148 189V137.5C148 132.529 143.971 128.5 139 128.5Z" fill="url(#paint0_linear_header)"/>
                <path d="M201.397 51.9995L202.025 118.981L225.5 118.981C231.518 118.981 236.397 114.102 236.397 108.084V106.929C236.397 84.0406 224.843 59.832 203.348 52.3193C202.722 52.1007 202.06 51.9998 201.397 51.9995V51.9995Z" fill="url(#paint1_linear_header)"/>
                <defs>
                  <linearGradient id="paint0_linear_header" x1="175" y1="36" x2="48" y2="209" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#44296D"/>
                    <stop offset="0.341346" stopColor="#178AC6"/>
                    <stop offset="0.764423" stopColor="#C95189"/>
                    <stop offset="1" stopColor="#EF9854"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_header" x1="175" y1="36" x2="48" y2="209" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#44296D"/>
                    <stop offset="0.341346" stopColor="#178AC6"/>
                    <stop offset="0.764423" stopColor="#C95189"/>
                    <stop offset="1" stopColor="#EF9854"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">TAGHAUS</span>
              <p className="text-xs text-purple-300/70 -mt-1">Powered by Doma</p>
            </div>
          </div>
          
          {/* Centered Navigation */}
          <nav className="flex items-center space-x-8">
            <button
              onClick={() => router.push('/')}
              className={`text-sm font-semibold transition-all duration-200 ${
                pathname === '/' 
                  ? 'text-purple-400 bg-purple-500/20 px-3 py-1.5 rounded-lg' 
                  : 'text-white/80 hover:text-purple-300 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg'
              }`}
            >
              Search
            </button>
            {isConnected && (
              <button
                onClick={() => router.push('/dashboard')}
                className={`text-sm font-semibold transition-all duration-200 ${
                  pathname === '/dashboard' 
                    ? 'text-purple-400 bg-purple-500/20 px-3 py-1.5 rounded-lg' 
                    : 'text-white/80 hover:text-purple-300 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg'
                }`}
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => router.push('/marketplace')}
              className={`text-sm font-semibold transition-all duration-200 ${
                pathname === '/marketplace' 
                  ? 'text-purple-400 bg-purple-500/20 px-3 py-1.5 rounded-lg' 
                  : 'text-white/80 hover:text-purple-300 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg'
              }`}
            >
              Marketplace
            </button>
          </nav>
          
          {/* Profile Menu */}
          <div className="flex items-center">
            {isConnected ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-lg px-4 py-2 border border-purple-400/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200 shadow-lg">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-sm"></div>
                  <span className="text-sm text-white font-mono font-medium">
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
