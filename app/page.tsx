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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* Compact Hero Section */}
      <main className="flex flex-col items-center justify-center px-3 py-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Compact Logo and Title */}
          <div className="mb-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Find Your
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Perfect Domain
              </span>
            </h1>
            <p className="text-sm text-gray-300 mb-6 max-w-xl mx-auto">
              Search, discover, and acquire tokenized domains on the blockchain
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
                className="w-full px-4 py-2.5 pr-10 text-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                ) : (
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Compact Search Suggestions */}
            {searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg max-h-64 overflow-y-auto z-10">
                {searchResults.length > 0 ? (
                  <div className="p-1">
                    {searchResults.slice(0, 6).map((domain, index) => (
                      <div
                        key={domain.name}
                        className="flex items-center justify-between p-2 hover:bg-white/10 rounded-md cursor-pointer group"
                        onClick={() => {
                          setSearchTerm(domain.name);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{domain.name}</p>
                            <p className="text-gray-400 text-xs">
                              {domain.registrar?.name} • {domain.tokens?.length || 0} token{(domain.tokens?.length || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-green-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchTerm && !isSearching ? (
                  <div className="p-4 text-center">
                    <div className="text-gray-400 mb-1">
                      <svg className="mx-auto h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.084-2.343" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-xs">No domains found for "{searchTerm}"</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Compact Action Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => router.push('/marketplace')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            >
              Browse Marketplace
            </button>
            {isConnected && (
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
              >
                My Dashboard
              </button>
            )}
          </div>

          {/* Compact Popular TLDs */}
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-2">Popular extensions:</p>
            <div className="flex flex-wrap justify-center gap-1">
              {['.com', '.eth', '.org', '.net', '.io', '.xyz', '.app'].map((tld) => (
                <button
                  key={tld}
                  onClick={() => setSearchTerm(searchTerm.split('.')[0] + tld)}
                  className="px-2 py-1 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-colors text-xs"
                >
                  {tld}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Compact Footer */}
      <footer className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10 py-2">
        <div className="max-w-6xl mx-auto px-3 text-center">
          <p className="text-gray-400 text-xs">
            Powered by Doma Protocol • Discover, Trade, Own Digital Domains
          </p>
        </div>
      </footer>
    </div>
  );
}