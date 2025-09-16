'use client';

import { useState, useEffect } from 'react';
import { useDomaSubgraph } from '../hooks/useDomaSubgraph';
import type { TokenizedName } from '../hooks/useDomaSubgraph';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import CreateAuctionModal from '../components/CreateAuctionModal';
import DomainDetailsModal from '../components/DomainDetailsModal';

export default function DashboardPage() {
  const { 
    getNamesByOwner, 
    getNameActivities, 
    getTokenActivities, 
    getCommandStatus 
  } = useDomaSubgraph();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [ownedDomains, setOwnedDomains] = useState<TokenizedName[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateAuctionOpen, setIsCreateAuctionOpen] = useState(false);

  // Fetch owned domains
  useEffect(() => {
    const fetchOwned = async () => {
      if (isConnected && address) {
        setLoading(true);
        const caip10 = `eip155:97476:${address.toLowerCase()}`;
        const domains = await getNamesByOwner(caip10);
        setOwnedDomains(domains);
        setLoading(false);
      } else {
        setOwnedDomains([]);
        setLoading(false);
      }
    };
    fetchOwned();
  }, [isConnected, address]);

  const openDomainDetails = (domain: TokenizedName) => {
    setSelectedDomain(domain);
    setIsDetailsModalOpen(true);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🔐</span>
          </div>
          <h1 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h1>
          <p className="text-gray-400 text-sm mb-4">Please connect your wallet to view your dashboard</p>
          <div className="scale-90">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Compact Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Doma Protocol</h1>
                <p className="text-xs text-gray-400">Dashboard</p>
              </div>
            </div>
            
            {/* Compact Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-white hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Search
              </button>
              <span className="text-blue-400 text-sm font-medium">Dashboard</span>
              <button
                onClick={() => router.push('/marketplace')}
                className="text-white hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Marketplace
              </button>
            </nav>
            
            <div className="scale-75">
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
        {/* Compact Dashboard Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">My Dashboard</h1>
              <p className="text-gray-400 text-xs">
                {address?.slice(0, 6)}...{address?.slice(-4)} • 
                <span className="ml-1">{ownedDomains.length} domain{ownedDomains.length !== 1 ? 's' : ''}</span>
              </p>
            </div>
            <button
              onClick={() => setIsCreateAuctionOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105"
            >
              Create Auction
            </button>
          </div>

          {/* Compact Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="bg-white/10 backdrop-blur-md rounded-md p-3 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Domains</p>
                  <p className="text-lg font-bold text-white">{ownedDomains.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-500/20 rounded-md flex items-center justify-center">
                  <span className="text-blue-400 text-sm">🌐</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-md p-3 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Tokens</p>
                  <p className="text-lg font-bold text-white">
                    {ownedDomains.reduce((sum, domain) => sum + (domain.tokens?.length || 0), 0)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-500/20 rounded-md flex items-center justify-center">
                  <span className="text-purple-400 text-sm">🪙</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-md p-3 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Listed</p>
                  <p className="text-lg font-bold text-white">0</p>
                </div>
                <div className="w-8 h-8 bg-green-500/20 rounded-md flex items-center justify-center">
                  <span className="text-green-400 text-sm">💰</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-md p-3 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Value</p>
                  <p className="text-lg font-bold text-white">-</p>
                </div>
                <div className="w-8 h-8 bg-yellow-500/20 rounded-md flex items-center justify-center">
                  <span className="text-yellow-400 text-sm">💎</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Owned Domains Section */}
        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
          <div className="p-3 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">My Tokenized Domains</h2>
          </div>
          
          <div className="p-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                <span className="ml-2 text-gray-400 text-sm">Loading your domains...</span>
              </div>
            ) : ownedDomains.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-300 mb-1">No domains found</h3>
                <p className="text-gray-400 text-sm mb-4">
                  You don't own any tokenized domains yet.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Search Domains
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ownedDomains.map((domain, index) => (
                  <div
                    key={`${domain.name}-${index}`}
                    className="bg-white/10 backdrop-blur-md rounded-md p-3 border border-white/20 hover:border-white/30 transition-all hover:scale-105 cursor-pointer"
                    onClick={() => openDomainDetails(domain)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {domain.name}
                      </h3>
                      <span className="text-xs text-gray-400 bg-gray-700/50 px-1.5 py-0.5 rounded">
                        {domain.tokens?.length || 0} token{(domain.tokens?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Registrar:</span>
                        <span className="text-white">{domain.registrar?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expires:</span>
                        <span className="text-white">
                          {domain.expiresAt ? new Date(domain.expiresAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tokenized:</span>
                        <span className="text-white">
                          {domain.tokenizedAt ? new Date(domain.tokenizedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs font-medium transition-colors">
                        Manage
                      </button>
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs font-medium transition-colors">
                        List for Sale
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateAuctionModal isOpen={isCreateAuctionOpen} onClose={() => setIsCreateAuctionOpen(false)} />
      
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