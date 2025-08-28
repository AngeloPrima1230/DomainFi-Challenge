'use client';

import { useState } from 'react';
import { formatEther } from 'viem';

interface Auction {
  id: string;
  name?: string;
  type?: 'tokenized_name' | 'listing';
  token?: {
    name: string;
    ownerAddress: string;
  };
  price?: string | null;
  currency?: string;
  status?: string;
  expiresAt?: string;
  registrar?: string;
  seller?: string;
  offererAddress?: string;
  domainExpiry?: string;
  tokenizedAt?: string;
  tokens?: any[];
  isTokenized?: boolean;
  listing?: any;
}

interface AuctionCardProps {
  auction: Auction;
  onViewDetails?: () => void;
}

export default function AuctionCard({ auction, onViewDetails }: AuctionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const domainName = auction.name || auction.token?.name || 'Unknown Domain';
  const price = auction.price ? parseFloat(auction.price) : 0;
  const currency = auction.currency || 'ETH';
  const status = auction.status || 'active';
  // Parse CAIP-10 address to get just the EVM address
  const parseCAIP10Address = (caip10Address: string) => {
    if (caip10Address && caip10Address.includes(':')) {
      return caip10Address.split(':').pop(); // Get the last part (the actual EVM address)
    }
    return caip10Address;
  };

  // Get the owner from the correct data structure
  const getOwner = () => {
    // For tokenized names, check tokens array for owner
    if (auction.tokens && auction.tokens.length > 0) {
      return parseCAIP10Address(auction.tokens[0].ownerAddress);
    }
    // For listings, use offererAddress
    if (auction.offererAddress) {
      return parseCAIP10Address(auction.offererAddress);
    }
    // Fallback for other cases
    if (auction.seller) {
      return parseCAIP10Address(auction.seller);
    }
    if (auction.token?.ownerAddress) {
      return parseCAIP10Address(auction.token.ownerAddress);
    }
    return 'Unknown';
  };
  
  const seller = getOwner();
  const registrar = auction.registrar || 'Unknown Registrar';
  const expiryDate = auction.expiresAt || auction.domainExpiry;
  const isTokenized = auction.isTokenized || auction.type === 'tokenized_name';
  const tokenizedAt = auction.tokenizedAt;

  const formatPrice = (price: number) => {
    if (currency === 'ETH') {
      return `${price.toFixed(4)} ETH`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatExpiry = (expiryDate: string) => {
    if (!expiryDate) return 'Unknown';
    const date = new Date(expiryDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sold':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'sold':
        return 'Sold';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer ${
        isHovered ? 'transform -translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onViewDetails}
    >
      {/* Domain Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {domainName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{domainName}</h3>
        <p className="text-sm text-gray-400">{registrar}</p>
      </div>

      {/* Domain Details */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Price</span>
          <span className="text-2xl font-bold text-green-400">
            {price > 0 ? formatPrice(price) : isTokenized ? 'Not Listed' : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Expiry</span>
          <span className="text-sm text-white">{formatExpiry(expiryDate)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Owner</span>
          <span className="text-sm text-white font-mono">
            {seller.length > 10 ? `${seller.slice(0, 6)}...${seller.slice(-4)}` : seller}
          </span>
        </div>

        {isTokenized && tokenizedAt && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Tokenized</span>
            <span className="text-sm text-blue-400">
              {new Date(tokenizedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 pt-0 space-y-3">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
        >
          View Details
        </button>
        
        {isTokenized && price === 0 && (
          <button 
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 border border-white/20 hover:border-white/30"
          >
            List for Sale
          </button>
        )}
        
        {!isTokenized && status.toLowerCase() === 'active' && price > 0 && (
          <button 
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 border border-white/20 hover:border-white/30"
          >
            Buy Now
          </button>
        )}
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
      )}
    </div>
  );
}


