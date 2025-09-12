'use client';

import { useState, useEffect, useRef } from 'react';
import { useDomaSubgraph } from './hooks/useDomaSubgraph';
import { useDomaMarketplace } from './hooks/useDomaMarketplace';
import AuctionCard from './components/AuctionCard';
import CreateAuctionModal from './components/CreateAuctionModal';
import DomainDetailsModal from './components/DomainDetailsModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { formatUnits } from 'viem';

// Advanced filter interface
interface AdvancedFilters {
  priceRange: {
    min: string;
    max: string;
  };
  expirationFilter: 'all' | 'expiring_soon' | 'expired' | 'active';
  registrarFilter: string;
  networkFilter: string;
  ownerFilter: string;
  tldFilter: string;
  sortBy: 'name' | 'price' | 'expiration' | 'newest' | 'oldest';
  sortOrder: 'asc' | 'desc';
}

export default function Home() {
  const { 
    names, 
    listings, 
    loading, 
    error, 
    getNameActivities, 
    getTokenActivities, 
    getCommandStatus,
    namesTotalCount,
    fetchNameCount,
    fetchTokenizedNames,
    fetchListings
  } = useDomaSubgraph();
  const { listings: marketplaceListings } = useDomaMarketplace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [namesSkip, setNamesSkip] = useState(0);
  const [listingsSkip, setListingsSkip] = useState(0);
  const pageSize = 15;
  const [inputValue, setInputValue] = useState('');
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    priceRange: { min: '', max: '' },
    expirationFilter: 'all',
    registrarFilter: '',
    networkFilter: '',
    ownerFilter: '',
    tldFilter: '',
    sortBy: 'newest',
    sortOrder: 'desc'
  });
  
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
      registrarId: name.registrar?.ianaId || 0,
      expiresAt: name.expiresAt,
      tokenizedAt: name.tokenizedAt,
      tokens: name.tokens,
      price: null,
      status: 'active',
      isTokenized: true,
      owner: name.claimedBy || 'Unknown',
      tld: name.name.split('.').pop() || '',
      networks: name.tokens?.map(token => token.networkId) || []
    })),

    // Add marketplace listings
    ...allListings.map(listing => {
      // prefer symbol if currency is an object (GraphQL), else take raw string
      const currencySymbol =
        (listing as any)?.currency && typeof (listing as any).currency === 'object'
          ? (listing as any).currency.symbol
          : (listing as any).currency;

      // decimals for normalization (if provided by GraphQL)
      const decimals =
        (listing as any)?.currency && typeof (listing as any).currency === 'object'
          ? (listing as any).currency.decimals
          : undefined;

      // derive name/owner/networks for subgraph listings via tokenId join against names[]
      let derivedName: string | undefined = undefined;
      let derivedOwner: string | undefined = undefined;
      let derivedNetwork: string | undefined = undefined;

      if (!('token' in listing) && (listing as any).tokenId) {
        const match = names.find(n => n.tokens?.some(t => t.tokenId === (listing as any).tokenId));
        if (match) {
          derivedName = match.name;
          const tok = match.tokens.find(t => t.tokenId === (listing as any).tokenId);
          derivedOwner = tok?.ownerAddress;
          derivedNetwork = tok?.chain?.networkId;
        }
      }

      // normalize on-chain price using decimals when available
      const normalizedPrice = (() => {
        try {
          if (decimals !== undefined && listing.price) {
            return formatUnits(BigInt(listing.price), decimals);
          }
        } catch { }
        return listing.price;
      })();

      return {
        type: 'listing' as const,
        id: listing.id,
        name: 'token' in listing ? listing.token?.name : derivedName,
        registrar: 'Doma Marketplace',
        registrarId: 0,
        expiresAt: listing.expiresAt,
        tokenizedAt: null,
        tokens: null,
        price: normalizedPrice,
        currency: currencySymbol,
        status: 'status' in listing ? listing.status : 'active',
        isTokenized: false,
        listing: listing,
        owner: 'token' in listing ? listing.token?.ownerAddress : (derivedOwner || (listing as any).offererAddress || 'Unknown'),
        tld: ('token' in listing ? listing.token?.name : derivedName)?.split('.').pop() || '',
        networks: 'token' in listing ? [listing.token?.chain?.networkId].filter(Boolean) : (derivedNetwork ? [derivedNetwork] : [])
      };
    })
  ];

  // Helper functions for filtering
  const isExpiringSoon = (expiresAt: string) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiryDate <= thirtyDaysFromNow && expiryDate > now;
  };

  const isExpired = (expiresAt: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const parsePrice = (price: string | null) => {
    if (!price) return 0;
    return parseFloat(price) || 0;
  };

  // Network mapping for readable names
  const getNetworkName = (networkId: string) => {
    const networkMap: { [key: string]: string } = {
      '1': 'Ethereum Mainnet',
      '5': 'Goerli Testnet',
      '10': 'Optimism',
      '56': 'BNB Smart Chain',
      '137': 'Polygon',
      '42161': 'Arbitrum One',
      '42170': 'Arbitrum Nova',
      '43114': 'Avalanche C-Chain',
      '8453': 'Base',
      '11155111': 'Sepolia Testnet',
      '80001': 'Mumbai Testnet',
      '97': 'BNB Smart Chain Testnet',
      '43113': 'Avalanche Fuji Testnet',
      '420': 'Optimism Goerli',
      '421613': 'Arbitrum Goerli',
      '84531': 'Base Goerli',
      '84532': 'Base Sepolia',
      '33111': 'Zora Testnet',
      '157': 'Zora Mainnet',
      '7777777': 'Zora',
      '999': 'Zora Sepolia',
      '97476': 'Doma Protocol Network'
    };

    // Handle eip155: format
    if (networkId.startsWith('eip155:')) {
      const id = networkId.replace('eip155:', '');
      return networkMap[id] || `Network ${id}`;
    }

    // Handle direct IDs
    return networkMap[networkId] || `Network ${networkId}`;
  };

  const getNetworkId = (networkName: string) => {
    const reverseNetworkMap: { [key: string]: string } = {
      'Ethereum Mainnet': '1',
      'Goerli Testnet': '5',
      'Optimism': '10',
      'BNB Smart Chain': '56',
      'Polygon': '137',
      'Arbitrum One': '42161',
      'Arbitrum Nova': '42170',
      'Avalanche C-Chain': '43114',
      'Base': '8453',
      'Sepolia Testnet': '11155111',
      'Mumbai Testnet': '80001',
      'BNB Smart Chain Testnet': '97',
      'Avalanche Fuji Testnet': '43113',
      'Optimism Goerli': '420',
      'Arbitrum Goerli': '421613',
      'Base Goerli': '84531',
      'Base Sepolia': '84532',
      'Zora Testnet': '33111',
      'Zora Mainnet': '157',
      'Zora': '7777777',
      'Zora Sepolia': '999',
      'Doma Protocol Network': '97476'
    };

    return reverseNetworkMap[networkName] || networkName;
  };

  // Filter searchable items with advanced filters
  const filteredItems = searchableItems.filter(item => {
    // Basic search filter
    // const matchesSearch = searchTerm === '' ||
    //   item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //   item.registrar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //   item.owner?.toLowerCase().includes(searchTerm.toLowerCase());

    // Basic status filter
    let matchesFilter = true;
    if (filter === 'all') {
      matchesFilter = true;
    } else if (filter === 'listed') {
      matchesFilter = item.price && parseFloat(item.price) > 0;
    } else {
      matchesFilter = item.status === filter;
    }

    // Advanced filters
    const matchesPriceRange = (!advancedFilters.priceRange.min || parsePrice(item.price) >= parseFloat(advancedFilters.priceRange.min)) &&
                             (!advancedFilters.priceRange.max || parsePrice(item.price) <= parseFloat(advancedFilters.priceRange.max));

    const matchesExpirationFilter = advancedFilters.expirationFilter === 'all' ||
      (advancedFilters.expirationFilter === 'expiring_soon' && isExpiringSoon(item.expiresAt)) ||
      (advancedFilters.expirationFilter === 'expired' && isExpired(item.expiresAt)) ||
      (advancedFilters.expirationFilter === 'active' && !isExpired(item.expiresAt));

    const matchesRegistrarFilter = !advancedFilters.registrarFilter || 
      item.registrar?.toLowerCase().includes(advancedFilters.registrarFilter.toLowerCase());

    const matchesNetworkFilter = !advancedFilters.networkFilter || 
      item.networks?.some(network => {
        if (!network) return false;
        const networkName = getNetworkName(network);
        return networkName.toLowerCase().includes(advancedFilters.networkFilter.toLowerCase());
      });

    const matchesOwnerFilter = !advancedFilters.ownerFilter || 
      item.owner?.toLowerCase().includes(advancedFilters.ownerFilter.toLowerCase());

    const matchesTldFilter = !advancedFilters.tldFilter || 
      item.tld?.toLowerCase().includes(advancedFilters.tldFilter.toLowerCase());

    // return matchesSearch && matchesFilter && matchesPriceRange && matchesExpirationFilter && 
    return matchesFilter && matchesPriceRange && matchesExpirationFilter && 
           matchesRegistrarFilter && matchesNetworkFilter && matchesOwnerFilter && matchesTldFilter;
  });

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    const order = advancedFilters.sortOrder === 'asc' ? 1 : -1;
    
    switch (advancedFilters.sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '') * order;
      case 'price':
        return (parsePrice(a.price) - parsePrice(b.price)) * order;
      case 'expiration':
        return (new Date(a.expiresAt || 0).getTime() - new Date(b.expiresAt || 0).getTime()) * order;
      case 'newest':
        return (new Date(a.tokenizedAt || 0).getTime() - new Date(b.tokenizedAt || 0).getTime()) * order;
      case 'oldest':
        return (new Date(b.tokenizedAt || 0).getTime() - new Date(a.tokenizedAt || 0).getTime()) * order;
      default:
        return 0;
    }
  });

  // Get unique values for filter options
  const uniqueRegistrars = [...new Set(searchableItems.map(item => item.registrar).filter(Boolean))];
  
  // Get networks from data and add common networks
  const dataNetworks = [...new Set(
    searchableItems
      .flatMap(item => item.networks)
      .filter(Boolean)
      .map(network => getNetworkName(network))
  )];
  
  // Add common networks that users might want to filter by
  const commonNetworks = [
    'Ethereum Mainnet',
    'Sepolia Testnet',
    'Polygon',
    'Arbitrum One',
    'Optimism',
    'Base',
    'Base Sepolia',
    'Zora',
    'Zora Mainnet',
    'Zora Testnet',
    'Doma Protocol Network'
  ];
  
  const uniqueNetworks = [...new Set([...dataNetworks, ...commonNetworks])].sort();
  
  const uniqueTlds = [...new Set(searchableItems.map(item => item.tld).filter(Boolean))];

  // Debug logging
  console.log('Search term:', searchTerm);
  console.log('Advanced filters:', {
    ...advancedFilters,
    networkFilter: advancedFilters.networkFilter ? 
      `"${advancedFilters.networkFilter}" (${getNetworkId(advancedFilters.networkFilter)})` : 
      'All Networks'
  });
  console.log('Total searchable items:', searchableItems.length);
  console.log('Filtered items:', sortedItems.length);
  console.log('Available networks:', uniqueNetworks);

  const handleViewDetails = (domain: any) => {
    setSelectedDomain(domain);
    setIsDetailsModalOpen(true);
  };

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreNames, setHasMoreNames] = useState(false);
  const [hasMoreListings, setHasMoreListings] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = async () => {
    const term = inputValue.trim();
    setSearchTerm(term);
    setNamesSkip(0);
    setListingsSkip(0);

    const namesRes = await fetchTokenizedNames(term, 0, pageSize, false);
    setSearchTotalCount(namesRes?.totalCount ?? 0);         // backend total
    setHasMoreNames(!!namesRes?.hasNextPage);

    const listingsRes = await fetchListings(term, 0, pageSize, false);
    console.log(listingsRes);
    setHasMoreListings(!!listingsRes?.hasNextPage);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setInputValue('');
    setSearchTotalCount(0);
    setHasMoreNames(false);
    setHasMoreListings(false);
    setNamesSkip(0);
    setListingsSkip(0);
    setFilter('all');
    setAdvancedFilters({
      priceRange: { min: '', max: '' },
      expirationFilter: 'all',
      registrarFilter: '',
      networkFilter: '',
      ownerFilter: '',
      tldFilter: '',
      sortBy: 'newest',
      sortOrder: 'desc'
    });
  };

  const stats = {
    activeListings: allListings.filter(l => 'status' in l ? l.status === 'active' : true).length,
    tokenizedDomains: namesTotalCount,
    totalVolume: allListings.reduce((sum, l) => sum + parseFloat(l.price || '0'), 0).toFixed(2),
    listedDomains: allListings.length,
    searchResults: searchTotalCount
  };

  // load more (e.g., in IntersectionObserver callback)
  const loadMore = async () => {
    if (isLoadingMore) return;
    if (!hasMoreNames && !hasMoreListings) return;

    setIsLoadingMore(true);

    const nextNamesSkip = names.length;
    const nextListingsSkip = listings.length;

    const [namesRes, listingsRes] = await Promise.all([
      hasMoreNames ? fetchTokenizedNames(searchTerm, nextNamesSkip, pageSize, true) : Promise.resolve(null),
      hasMoreListings ? fetchListings(searchTerm, nextListingsSkip, pageSize, true) : Promise.resolve(null),
    ]);

    if (namesRes) setHasMoreNames(!!namesRes.hasNextPage);
    if (listingsRes) setHasMoreListings(!!listingsRes.hasNextPage);

    setIsLoadingMore(false);
  };

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) loadMore();
      },
      { root: null, rootMargin: '200px', threshold: 0 } // prefetch a bit early
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadMoreRef.current, hasMoreNames, hasMoreListings, isLoadingMore, searchTerm, names.length, listings.length]);

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
          {(searchTerm || Object.values(advancedFilters).some(v => v !== '' && v !== 'all' && (typeof v === 'object' ? Object.values(v).some(x => x !== '') : true))) && (
            <div className="text-center mb-8">
              <p className="text-gray-300">
                Found <span className="text-blue-400 font-semibold">{stats.searchResults}</span> results
                {searchTerm && ` for "${searchTerm}"`}
              </p>
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-400 hover:text-white mt-2 underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Advanced Search and Filter */}
          <div className="max-w-4xl mx-auto mb-8 space-y-4">
            {/* Basic Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search domain name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
              >
                Search
              </button>
            </div>

            {/* Basic Filter Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('listed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'listed'
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                Listed
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'active'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('sold')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'sold'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                Sold
              </button>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${showAdvancedFilters
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
                  }`}
              >
                {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                {/* Filter Sections */}
                <div className="space-y-6">
                  {/* Row 1: Price Range and Expiration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price Range */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Price Range (ETH)</label>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            placeholder="Min"
                            value={advancedFilters.priceRange.min}
                            onChange={(e) => setAdvancedFilters(prev => ({
                              ...prev,
                              priceRange: { ...prev.priceRange, min: e.target.value }
                            }))}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus-ring smooth-transition"
                          />
                        </div>
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            placeholder="Max"
                            value={advancedFilters.priceRange.max}
                            onChange={(e) => setAdvancedFilters(prev => ({
                              ...prev,
                              priceRange: { ...prev.priceRange, max: e.target.value }
                            }))}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus-ring smooth-transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expiration Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Expiration Status</label>
                                              <div className="relative select-wrapper">
                          <select
                            value={advancedFilters.expirationFilter}
                            onChange={(e) => setAdvancedFilters(prev => ({
                              ...prev,
                              expirationFilter: e.target.value as any
                            }))}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white custom-select focus-ring smooth-transition"
                          >
                          <option value="all" className="bg-slate-800 text-white">All Expiration Status</option>
                          <option value="expiring_soon" className="bg-slate-800 text-white">Expiring Soon (30 days)</option>
                          <option value="expired" className="bg-slate-800 text-white">Expired</option>
                          <option value="active" className="bg-slate-800 text-white">Active</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Registrar and Network */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Registrar Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Registrar</label>
                      <div className="relative select-wrapper">
                        <select
                          value={advancedFilters.registrarFilter}
                          onChange={(e) => setAdvancedFilters(prev => ({
                            ...prev,
                            registrarFilter: e.target.value
                          }))}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white custom-select focus-ring smooth-transition"
                        >
                          <option value="" className="bg-slate-800 text-white">All Registrars</option>
                          {uniqueRegistrars.map(registrar => (
                            <option key={registrar} value={registrar} className="bg-slate-800 text-white">{registrar}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Network Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Network</label>
                      <div className="relative select-wrapper">
                        <select
                          value={advancedFilters.networkFilter}
                          onChange={(e) => setAdvancedFilters(prev => ({
                            ...prev,
                            networkFilter: e.target.value
                          }))}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white custom-select focus-ring smooth-transition"
                        >
                          <option value="" className="bg-slate-800 text-white">All Networks</option>
                          {uniqueNetworks.map(network => (
                            <option key={network} value={network} className="bg-slate-800 text-white">{network}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: TLD and Owner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* TLD Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Top-Level Domain</label>
                      <div className="relative select-wrapper">
                        <select
                          value={advancedFilters.tldFilter}
                          onChange={(e) => setAdvancedFilters(prev => ({
                            ...prev,
                            tldFilter: e.target.value
                          }))}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white custom-select focus-ring smooth-transition"
                        >
                          <option value="" className="bg-slate-800 text-white">All TLDs</option>
                          {uniqueTlds.map(tld => (
                            <option key={tld} value={tld} className="bg-slate-800 text-white">.{tld}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Owner Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Owner Address</label>
                      <input
                        type="text"
                        placeholder="Search by owner address..."
                        value={advancedFilters.ownerFilter}
                        onChange={(e) => setAdvancedFilters(prev => ({
                          ...prev,
                          ownerFilter: e.target.value
                        }))}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus-ring smooth-transition"
                      />
                    </div>
                  </div>

                  {/* Row 4: Sort Options */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Sort Options</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative select-wrapper">
                        <select
                          value={advancedFilters.sortBy}
                          onChange={(e) => setAdvancedFilters(prev => ({
                            ...prev,
                            sortBy: e.target.value as any
                          }))}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white custom-select focus-ring smooth-transition"
                        >
                          <option value="newest" className="bg-slate-800 text-white">Newest First</option>
                          <option value="oldest" className="bg-slate-800 text-white">Oldest First</option>
                          <option value="name" className="bg-slate-800 text-white">Name A-Z</option>
                          <option value="price" className="bg-slate-800 text-white">Price (Low to High)</option>
                          <option value="expiration" className="bg-slate-800 text-white">Expiration Date</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <button
                        onClick={() => setAdvancedFilters(prev => ({
                          ...prev,
                          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                        }))}
                        className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 hover:border-white/30 smooth-transition flex items-center justify-center min-w-[60px]"
                        title={advancedFilters.sortOrder === 'asc' ? 'Ascending Order' : 'Descending Order'}
                      >
                        <span className="text-lg font-medium">
                          {advancedFilters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Create New Auction
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                showAnalytics
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
              }`}
            >
              {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
            </button>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <section className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <AnalyticsDashboard 
              searchableItems={searchableItems}
              allListings={allListings}
              names={names}
            />
          </div>
        </section>
      )}

      {/* Listings Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {error ? (
            <div className="text-center py-12">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-400">Error loading data: {error}</p>
              </div>
            </div>
          ) : sortedItems.length === 0 ? (
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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedItems.map((item, index) => (
                      <AuctionCard
                        key={`${item.id}-${index}`}
                        auction={item}
                        onViewDetails={() => handleViewDetails(item)}
                      />
                    ))}
                  </div>
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      <p className="text-gray-400 mt-4">Loading domains...</p>
                    </div>
                  ) : <div ref={loadMoreRef} style={{ height: 1 }} />}
                </>
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

