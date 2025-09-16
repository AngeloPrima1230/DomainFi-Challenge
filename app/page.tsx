'use client';

import { useState, useEffect } from 'react';
import { useDomaSubgraph } from './hooks/useDomaSubgraph';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useTheme } from './contexts/ThemeContext';

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchNames } = useDomaSubgraph();
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { getThemeClasses } = useTheme();

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchNames(query.toLowerCase());
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      } finally {
      setIsSearching(false);
    }
  };

  // Handle search input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
    } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className={`min-h-screen ${getThemeClasses('background')} flex flex-col w-full`}>

      {/* Compact Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 py-8 w-full">
        <div className="max-w-3xl mx-auto text-center w-full">
          {/* Compact Logo and Title */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <img 
                src="/logo.svg" 
                alt="TAGHAUS Logo" 
                className="w-full h-full object-contain"
              />
              </div>
            <h1 className={`text-4xl md:text-5xl font-bold ${getThemeClasses('text.primary')} mb-3`}>
            Find Your
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Perfect Domain
            </span>
          </h1>
            <p className={`text-lg ${getThemeClasses('text.muted')} mb-8 max-w-2xl mx-auto`}>
              Search, acquire, and trade domains on the blockchain.
            </p>
          </div>

          {/* Compact Search Box */}
          <div className="relative max-w-xl mx-auto mb-4">
            <div className="relative">
                <input
                  type="text"
                placeholder="Search domains (e.g. google.com, ethereum.eth)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-6 py-3 pr-12 text-base ${getThemeClasses('input')} rounded-xl shadow-lg`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${getThemeClasses('text.accent')}`}></div>
                ) : (
                  <svg className={`h-5 w-5 ${getThemeClasses('text.muted')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                )}
                      </div>
                    </div>

            {/* Compact Search Suggestions */}
            {searchTerm && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${getThemeClasses('card')} rounded-xl max-h-64 overflow-y-auto z-10 shadow-2xl`}>
                {searchResults.length > 0 ? (
                  <div className="p-1">
                    {searchResults.slice(0, 6).map((domain, index) => (
                      <div
                        key={domain.name}
                        className={`flex items-center justify-between p-3 ${getThemeClasses('cardHover')} rounded-lg cursor-pointer group transition-all duration-200`}
                        onClick={() => {
                          setSearchTerm(domain.name);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                        </div>
                          <div>
                            <p className={`${getThemeClasses('text.primary')} text-sm font-medium`}>{domain.name}</p>
                            <p className={`${getThemeClasses('text.muted')} text-xs`}>
                              {domain.registrar?.name} • {domain.tokens?.length || 0} token{(domain.tokens?.length || 0) !== 1 ? 's' : ''}
                            </p>
                      </div>
                    </div>
                        <div className={`${getThemeClasses('text.accent')} text-sm opacity-0 group-hover:opacity-100 transition-opacity font-medium`}>
                          View
                      </div>
                    </div>
                    ))}
                        </div>
                ) : searchTerm && !isSearching ? (
                  <div className="p-6 text-center">
                    <div className={`${getThemeClasses('text.accent')} mb-2`}>
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.084-2.343" />
                          </svg>
                        </div>
                    <p className={`${getThemeClasses('text.muted')} text-sm`}>No domains found for "{searchTerm}"</p>
                      </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Compact Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => router.push('/marketplace')}
              className={`${getThemeClasses('button.primary')} px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200`}
            >
              Browse Marketplace
            </button>
            {isConnected && (
            <button
                onClick={() => router.push('/dashboard')}
                className={`${getThemeClasses('button.secondary')} px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200`}
              >
                My Dashboard
            </button>
                )}
              </div>

          {/* Compact Popular TLDs */}
          <div className="text-center">
            <p className={`${getThemeClasses('text.muted')} text-sm mb-3`}>Popular extensions:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['.com', '.eth', '.org', '.net', '.io', '.xyz', '.app'].map((tld) => (
                <button
                  key={tld}
                  onClick={() => setSearchTerm(searchTerm.split('.')[0] + tld)}
                  className={`px-3 py-1.5 ${getThemeClasses('button.secondary')} rounded-lg transition-all duration-200 text-sm font-medium`}
                >
                  {tld}
                </button>
                    ))}
                  </div>
                    </div>
        </div>
      </main>

    </div>
  );
}
