'use client';

import { useState } from 'react';
import { useDomaMarketplace } from '../hooks/useDomaMarketplace';
import MarketplaceTab from '../components/MarketplaceTab';
import CreateListingModal from '../components/CreateListingModal';
import PlaceOfferModal from '../components/PlaceOfferModal';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function MarketplacePage() {
  const { 
    listings: marketplaceListings, 
    createListing,
    placeOffer
  } = useDomaMarketplace();
  
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showPlaceOffer, setShowPlaceOffer] = useState(false);

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
                <p className="text-xs text-gray-400">Marketplace</p>
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
              {isConnected && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-white hover:text-blue-400 transition-colors text-sm font-medium"
                >
                  Dashboard
                </button>
              )}
              <span className="text-blue-400 text-sm font-medium">Marketplace</span>
            </nav>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 hidden sm:block">
                {marketplaceListings.length.toLocaleString()} listings
              </span>
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 hidden lg:block">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <button
                    onClick={() => setShowCreateListing(true)}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
                  >
                    Create Listing
                  </button>
                  <button
                    onClick={() => setShowPlaceOffer(true)}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-colors"
                  >
                    Place Offer
                  </button>
                </div>
              ) : (
                <div className="scale-75">
                  <ConnectButton />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Compact Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
        <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <MarketplaceTab />
        </div>
      </main>

      {/* Modals */}
      <CreateListingModal
        isOpen={showCreateListing}
        onClose={() => setShowCreateListing(false)}
        onSubmit={createListing}
      />
      
      <PlaceOfferModal
        isOpen={showPlaceOffer}
        onClose={() => setShowPlaceOffer(false)}
        onSubmit={placeOffer}
      />
    </div>
  );
}
