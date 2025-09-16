'use client';

import { useState, useEffect } from 'react';
import { useDomaSubgraph } from '../hooks/useDomaSubgraph';
import type { TokenizedName } from '../hooks/useDomaSubgraph';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useTheme } from '../contexts/ThemeContext';
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
  const { getThemeClasses } = useTheme();
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
      <div className={`min-h-screen ${getThemeClasses('background')} flex items-center justify-center`}>
        <div className={`text-center ${getThemeClasses('card')} rounded-lg p-6 max-w-md`}>
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🔐</span>
          </div>
          <h1 className={`text-lg font-bold ${getThemeClasses('text.primary')} mb-2`}>Connect Your Wallet</h1>
          <p className={`${getThemeClasses('text.muted')} text-sm mb-4`}>Please connect your wallet to view your dashboard</p>
          <div className="">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getThemeClasses('background')}`}>
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        {/* Compact Dashboard Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-2xl font-bold ${getThemeClasses('text.accent')} mb-2`}>My TAGHAUS Dashboard</h1>
              <p className={`${getThemeClasses('text.muted')} text-sm`}>
                {address?.slice(0, 6)}...{address?.slice(-4)} • 
                <span className="ml-1">{ownedDomains.length} domain{ownedDomains.length !== 1 ? 's' : ''}</span>
              </p>
            </div>
            <button
              onClick={() => setIsCreateAuctionOpen(true)}
              className={`${getThemeClasses('button.accent')} px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200`}
            >
              Create Auction
            </button>
          </div>

          {/* Compact Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`${getThemeClasses('card')} ${getThemeClasses('cardHover')} rounded-lg p-4 transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getThemeClasses('text.muted')} text-sm`}>Domains</p>
                  <p className={`text-xl font-bold ${getThemeClasses('text.primary')}`}>{ownedDomains.length}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 text-lg">🌐</span>
                </div>
              </div>
            </div>
            
            <div className={`${getThemeClasses('card')} ${getThemeClasses('cardHover')} rounded-lg p-4 transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getThemeClasses('text.muted')} text-sm`}>Tokens</p>
                  <p className={`text-xl font-bold ${getThemeClasses('text.primary')}`}>
                    {ownedDomains.reduce((sum, domain) => sum + (domain.tokens?.length || 0), 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-400 text-lg">🪙</span>
                </div>
              </div>
            </div>
            
            <div className={`${getThemeClasses('card')} ${getThemeClasses('cardHover')} rounded-lg p-4 transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getThemeClasses('text.muted')} text-sm`}>Listed</p>
                  <p className={`text-xl font-bold ${getThemeClasses('text.primary')}`}>0</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400 text-lg">💰</span>
                </div>
              </div>
            </div>
            
            <div className={`${getThemeClasses('card')} ${getThemeClasses('cardHover')} rounded-lg p-4 transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${getThemeClasses('text.muted')} text-sm`}>Value</p>
                  <p className={`text-xl font-bold ${getThemeClasses('text.primary')}`}>-</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 text-lg">💎</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Owned Domains Section */}
        <div className={`${getThemeClasses('section')} rounded-xl shadow-2xl`}>
          <div className={`p-4 border-b ${getThemeClasses('text.muted')}/20`}>
            <h2 className={`text-xl font-bold ${getThemeClasses('text.primary')}`}>My Tokenized Domains</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${getThemeClasses('text.accent')}`}></div>
                <span className={`ml-3 ${getThemeClasses('text.muted')} text-sm`}>Loading your domains...</span>
              </div>
            ) : ownedDomains.length === 0 ? (
              <div className="text-center py-12">
                <div className={`${getThemeClasses('text.accent')} mb-4`}>
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold ${getThemeClasses('text.primary')} mb-2`}>No domains found</h3>
                <p className={`${getThemeClasses('text.muted')} text-sm mb-6`}>
                  You don't own any tokenized domains yet.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className={`${getThemeClasses('button.primary')} px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200`}
                >
                  Search Domains
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedDomains.map((domain, index) => (
                  <div
                    key={`${domain.name}-${index}`}
                    className={`${getThemeClasses('card')} ${getThemeClasses('cardHover')} transition-all duration-200 p-6 rounded-xl`}
                  >
                    {/* Domain Name - Most Important */}
                    <div className="mb-6">
                      <h3 className={`text-xl font-bold ${getThemeClasses('text.primary')} mb-2 leading-tight`}>
                        {domain.name}
                      </h3>
                      <div className="w-full h-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full"></div>
                    </div>
                    
                    {/* Domain Data */}
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className={`${getThemeClasses('text.muted')} text-sm font-medium`}>Registrar</span>
                        <span className={`${getThemeClasses('text.primary')} text-sm font-semibold`}>
                          {domain.registrar?.name || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`${getThemeClasses('text.muted')} text-sm font-medium`}>Expires</span>
                        <span className={`${getThemeClasses('text.primary')} text-sm font-semibold`}>
                          {domain.expiresAt ? new Date(domain.expiresAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`${getThemeClasses('text.muted')} text-sm font-medium`}>Tokenized</span>
                        <span className={`${getThemeClasses('text.primary')} text-sm font-semibold`}>
                          {domain.tokenizedAt ? new Date(domain.tokenizedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button 
                        onClick={() => openDomainDetails(domain)}
                        className={`w-full ${getThemeClasses('button.primary')} py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200`}
                      >
                        View Details
                      </button>
                      <button className={`w-full ${getThemeClasses('button.accent')} py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200`}>
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