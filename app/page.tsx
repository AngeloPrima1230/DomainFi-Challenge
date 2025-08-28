'use client';

import { useState, useEffect } from 'react';
import { useDomaSubgraph } from './hooks/useDomaSubgraph';
import { useDomaMarketplace } from './hooks/useDomaMarketplace';
import AuctionCard from './components/AuctionCard';
import CreateAuctionModal from './components/CreateAuctionModal';
import DomainDetailsModal from './components/DomainDetailsModal';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export default function Home() {
  const { 
    names, 
    listings, 
    loading, 
    error, 
    getNameActivities, 
    getTokenActivities, 
    getCommandStatus 
  } = useDomaSubgraph();
  const { listings: marketplaceListings } = useDomaMarketplace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  // Network switching for Doma Protocol (Sepolia)
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  
  // Auto-switch to Sepolia when connected
  useEffect(() => {
    if (isConnected && chain && chain.id !== sepolia.id && switchNetwork) {
      console.log('Switching to Sepolia for Doma Protocol...');
      switchNetwork(sepolia.id);
    }
  }, [isConnected, chain, switchNetwork]);

  // Combine data from both sources
  const allListings = [...listings, ...marketplaceListings];
  
  // Create searchable items from both tokenized names and listings
  const searchableItems = [
    // Add tokenized names as searchable items
    ...names.map(name => ({
      type: 'tokenized_name' as const,
      id: name.name,
      name: name.name,
      registrar: name.registrar?.name || 'Unknown',
      expiresAt: name.expiresAt,
      tokenizedAt: name.tokenizedAt,
      tokens: name.tokens,
      price: null,
      status: 'active',
      isTokenized: true
    })),
    // Add marketplace listings
    ...allListings.map(listing => ({
      type: 'listing' as const,
      id: listing.id,
      name: 'token' in listing ? listing.token?.name : listing.name,
      registrar: 'Doma Marketplace',
      expiresAt: listing.expiresAt,
      tokenizedAt: null,
      tokens: null,
      price: listing.price,
      status: 'status' in listing ? listing.status : 'active',
      isTokenized: false,
      listing: listing
    }))
  ];

  // Filter searchable items
              const filteredItems = searchableItems.filter(item => {
              const matchesSearch = searchTerm === '' ||
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.registrar?.toLowerCase().includes(searchTerm.toLowerCase());

              let matchesFilter = true;
              if (filter === 'all') {
                matchesFilter = true;
              } else if (filter === 'listed') {
                // Show only items that have a price > 0 (are listed for sale)
                matchesFilter = item.price && parseFloat(item.price) > 0;
              } else {
                matchesFilter = item.status === filter;
              }

              return matchesSearch && matchesFilter;
            });

  // Debug logging
  console.log('Search term:', searchTerm);
  console.log('Total searchable items:', searchableItems.length);
  console.log('Filtered items:', filteredItems.length);
  console.log('Sample searchable items:', searchableItems.slice(0, 3));

  const handleViewDetails = (domain: any) => {
    setSelectedDomain(domain);
    setIsDetailsModalOpen(true);
  };

  const stats = {
    activeListings: allListings.filter(l => 'status' in l ? l.status === 'active' : true).length,
    tokenizedDomains: names.length,
    totalVolume: allListings.reduce((sum, l) => sum + parseFloat(l.price || '0'), 0).toFixed(2),
    listedDomains: allListings.length,
    searchResults: filteredItems.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Doma Protocol</h1>
                <p className="text-sm text-gray-300">Marketplace</p>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Tokenized Domain
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Marketplace
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover, trade, and invest in tokenized domains on the most transparent marketplace 
            built on Doma Protocol. Experience instant settlement and true price discovery.
          </p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-blue-400">{stats.activeListings}</div>
              <div className="text-sm text-gray-400">Active Listings</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-purple-400">{stats.tokenizedDomains}</div>
              <div className="text-sm text-gray-400">Tokenized Domains</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-green-400">${stats.totalVolume}</div>
              <div className="text-sm text-gray-400">Total Volume</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-orange-400">{stats.listedDomains}</div>
              <div className="text-sm text-gray-400">Listed Domains</div>
            </div>
          </div>

          {/* Search Results Counter */}
          {searchTerm && (
            <div className="text-center mb-8">
              <p className="text-gray-300">
                Found <span className="text-blue-400 font-semibold">{stats.searchResults}</span> results for "{searchTerm}"
              </p>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('listed')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'listed'
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                Listed
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'active'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('sold')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'sold'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                Sold
              </button>
            </div>
          </div>

          {/* Create Auction Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Create New Auction
          </button>
        </div>
      </section>

      {/* Listings Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4">Loading domains...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-400">Error loading data: {error}</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto border border-white/10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-400 mt-4">
                  {searchTerm ? `No domains found for "${searchTerm}"` : 'No domains found'}
                </p>
                {searchTerm && (
                  <p className="text-gray-500 mt-2 text-sm">
                    Try searching for a different term or browse all domains
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <AuctionCard 
                  key={item.id || index} 
                  auction={item} 
                  onViewDetails={() => handleViewDetails(item)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create Auction Modal */}
      <CreateAuctionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Domain Details Modal */}
      <DomainDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        domain={selectedDomain}
        getNameActivities={getNameActivities}
        getTokenActivities={getTokenActivities}
        getCommandStatus={getCommandStatus}
      />
    </div>
  );
}

