'use client';

import { useState, useEffect } from 'react';
import { useDomaSubgraph } from './hooks/useDomaSubgraph';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchNames } = useDomaSubgraph();
  const { isConnected, address } = useAccount();
  const router = useRouter();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col w-full">

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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Find Your
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Perfect Domain
            </span>
          </h1>
            <p className="text-lg text-purple-300/80 mb-8 max-w-2xl mx-auto">
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
                className="w-full px-6 py-3 pr-12 text-base bg-gradient-to-r from-slate-900/80 to-purple-900/80 backdrop-blur-md border border-purple-500/50 rounded-xl text-white placeholder-purple-200/70 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent shadow-lg"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                ) : (
                  <svg className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                )}
                      </div>
                    </div>

            {/* Compact Search Suggestions */}
            {searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-slate-800/95 to-purple-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl max-h-64 overflow-y-auto z-10 shadow-2xl">
                {searchResults.length > 0 ? (
                  <div className="p-1">
                    {searchResults.slice(0, 6).map((domain, index) => (
                      <div
                        key={domain.name}
                        className="flex items-center justify-between p-3 hover:bg-purple-500/20 rounded-lg cursor-pointer group transition-all duration-200"
                        onClick={() => {
                          setSearchTerm(domain.name);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                        </div>
                          <div>
                            <p className="text-white text-sm font-medium">{domain.name}</p>
                            <p className="text-purple-300/70 text-xs">
                              {domain.registrar?.name} • {domain.tokens?.length || 0} token{(domain.tokens?.length || 0) !== 1 ? 's' : ''}
                            </p>
                      </div>
                    </div>
                        <div className="text-purple-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          View
                      </div>
                    </div>
                    ))}
                        </div>
                ) : searchTerm && !isSearching ? (
                  <div className="p-6 text-center">
                    <div className="text-purple-400 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.084-2.343" />
                          </svg>
                        </div>
                    <p className="text-purple-300/70 text-sm">No domains found for "{searchTerm}"</p>
                      </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Compact Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => router.push('/marketplace')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Browse Marketplace
            </button>
            {isConnected && (
            <button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-slate-800/40 to-purple-900/40 backdrop-blur-md border border-purple-500/30 text-white hover:from-slate-800/60 hover:to-purple-900/60 hover:border-purple-400/50 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                My Dashboard
            </button>
                )}
              </div>

          {/* Compact Popular TLDs */}
          <div className="text-center">
            <p className="text-purple-300/70 text-sm mb-3">Popular extensions:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['.com', '.eth', '.org', '.net', '.io', '.xyz', '.app'].map((tld) => (
                <button
                  key={tld}
                  onClick={() => setSearchTerm(searchTerm.split('.')[0] + tld)}
                  className="px-3 py-1.5 bg-gradient-to-r from-slate-800/30 to-purple-900/30 border border-purple-500/20 text-purple-300 hover:from-slate-800/50 hover:to-purple-900/50 hover:text-white hover:border-purple-400/40 rounded-lg transition-all duration-200 text-sm font-medium hover:shadow-md"
                >
                  {tld}
                </button>
                    ))}
                  </div>
                    </div>
        </div>
      </main>

      {/* Compact Footer */}
      <footer className="bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-t border-purple-500/30 py-3">
        <div className="max-w-6xl mx-auto px-3 text-center">
          <p className="text-purple-300/70 text-sm">
            Powered by Doma Protocol • Discover, Trade, Own Digital Domains
          </p>
        </div>
      </footer>
    </div>
  );
}
