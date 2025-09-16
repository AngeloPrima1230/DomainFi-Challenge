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

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        {/* Compact Dashboard Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
            </div>
            <button
              onClick={() => setIsCreateAuctionOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Auction
            </button>
          </div>

          {/* Compact Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-800/40 to-purple-900/40 backdrop-blur-md rounded-lg p-4 border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300/70 text-sm">Domains</p>
                  <p className="text-xl font-bold text-white">{ownedDomains.length}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 text-lg">🌐</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/40 to-purple-900/40 backdrop-blur-md rounded-lg p-4 border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300/70 text-sm">Tokens</p>
                  <p className="text-xl font-bold text-white">
                    {ownedDomains.reduce((sum, domain) => sum + (domain.tokens?.length || 0), 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-400 text-lg">🪙</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/40 to-purple-900/40 backdrop-blur-md rounded-lg p-4 border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300/70 text-sm">Listed</p>
                  <p className="text-xl font-bold text-white">0</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400 text-lg">💰</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/40 to-purple-900/40 backdrop-blur-md rounded-lg p-4 border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300/70 text-sm">Value</p>
                  <p className="text-xl font-bold text-white">-</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 text-lg">💎</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Owned Domains Section */}
        <div className="bg-gradient-to-br from-slate-800/20 via-purple-900/20 to-slate-800/20 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-2xl">
          <div className="p-4 border-b border-purple-500/20">
            <h2 className="text-md font-bold text-white">My NFT Domains</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                <span className="ml-3 text-purple-300/70 text-sm">Loading your domains...</span>
              </div>
            ) : ownedDomains.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-purple-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No domains found</h3>
                <p className="text-purple-300/70 text-sm mb-6">
                  You don't own any tokenized domains yet.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg"
                >
                  Search Domains
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownedDomains.map((domain, index) => (
                  <div
                    key={`${domain.name}-${index}`}
                    className="bg-gradient-to-br from-slate-800/40 to-purple-900/40 backdrop-blur-md rounded-lg p-4 border border-purple-500/20 hover:border-purple-400/40 hover:bg-gradient-to-br hover:from-slate-800/60 hover:to-purple-900/60 transition-all cursor-pointer shadow-lg hover:shadow-xl"
                    onClick={() => openDomainDetails(domain)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {domain.name}
                      </h3>
                      <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-lg">
                        {domain.tokens?.length || 0} token{(domain.tokens?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-purple-300/70">Registrar:</span>
                        <span className="text-white">{domain.registrar?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300/70">Expires:</span>
                        <span className="text-white">
                          {domain.expiresAt ? new Date(domain.expiresAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300/70">Tokenized:</span>
                        <span className="text-white">
                          {domain.tokenizedAt ? new Date(domain.tokenizedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                        Manage
                      </button>
                      <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
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