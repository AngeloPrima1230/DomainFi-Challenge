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

      {/* Compact Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <div className="bg-gradient-to-br from-slate-800/20 via-purple-900/20 to-slate-800/20 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 shadow-2xl">
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
