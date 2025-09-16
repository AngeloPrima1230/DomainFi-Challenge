'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, getThemeClasses } = useTheme();

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

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'purple':
        return '🎨';
      default:
        return '🎨';
    }
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'purple'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <header className={`${getThemeClasses('header')} z-50`}>
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
              <span className={`text-2xl font-bold ${getThemeClasses('text.primary')} tracking-tight`}>TAGHAUS</span>
              <p className={`text-xs ${getThemeClasses('text.muted')} -mt-1 font-medium`}>Powered by Doma</p>
            </div>
          </div>
          
          {/* Centered Navigation */}
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => router.push('/')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 border-2 ${
                pathname === '/' 
                  ? getThemeClasses('nav.active')
                  : getThemeClasses('nav.inactive') + ' border-transparent'
              }`}
            >
              Search
            </button>
            {isConnected && (
              <button
                onClick={() => router.push('/dashboard')}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 border-2 ${
                  pathname === '/dashboard' 
                    ? getThemeClasses('nav.active')
                    : getThemeClasses('nav.inactive') + ' border-transparent'
                }`}
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => router.push('/marketplace')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 border-2 ${
                pathname === '/marketplace' 
                  ? getThemeClasses('nav.active')
                  : getThemeClasses('nav.inactive') + ' border-transparent'
              }`}
            >
              Marketplace
            </button>
          </nav>
          
          {/* Theme Switcher & Profile Menu */}
          <div className="flex items-center space-x-3">
            {/* Theme Switcher */}
            <button 
              onClick={cycleTheme}
              className={`${getThemeClasses('button.secondary')} rounded-md p-2 transition-all duration-200`}
              title={`Current theme: ${theme}. Click to cycle themes.`}
            >
              <span className="text-sm">{getThemeIcon(theme)}</span>
            </button>

            {isConnected ? (
              <div className="relative group">
                <button className={`flex items-center space-x-2 ${getThemeClasses('button.secondary')} rounded-lg px-4 py-2.5 transition-all duration-200`}>
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-sm"></div>
                  <span className={`text-sm ${getThemeClasses('text.primary')} font-mono font-semibold`}>
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <svg className={`w-4 h-4 ${getThemeClasses('text.muted')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute right-0 mt-3 w-56 ${getThemeClasses('card')} rounded-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 shadow-2xl`}>
                  <div className="py-2">
                    <div className={`px-4 py-3 text-xs ${getThemeClasses('text.muted')} border-b ${getThemeClasses('text.muted')}/20 font-mono`}>
                      {address}
                    </div>
                    <button className={`w-full text-left px-4 py-3 text-sm ${getThemeClasses('text.primary')} hover:${getThemeClasses('cardHover')} transition-colors flex items-center space-x-2`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>View Profile</span>
                    </button>
                    <button className={`w-full text-left px-4 py-3 text-sm ${getThemeClasses('text.primary')} hover:${getThemeClasses('cardHover')} transition-colors flex items-center space-x-2`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </button>
                    <button className={`w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center space-x-2`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="">
                <ConnectButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
