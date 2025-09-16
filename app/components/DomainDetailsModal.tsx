'use client';

import { useState } from 'react';
import { formatEther } from 'viem';
import ActivityTab from './ActivityTab';

interface DomainDetails {
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
  claimedBy?: string;
}

interface DomainDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainDetails | null;
  getNameActivities?: (name: string, skip?: number, take?: number) => Promise<any>;
  getTokenActivities?: (tokenId: string, skip?: number, take?: number) => Promise<any>;
  getCommandStatus?: (correlationId: string) => Promise<any>;
}

export default function DomainDetailsModal({ 
  isOpen, 
  onClose, 
  domain, 
  getNameActivities, 
  getTokenActivities, 
  getCommandStatus 
}: DomainDetailsModalProps) {
  if (!isOpen || !domain) return null;

  const domainName = domain.name || domain.token?.name || '';
  const price = domain.price ? parseFloat(domain.price) : 0;
  const currency = domain.currency || 'ETH';
  const status = domain.status || 'active';
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
    if (domain.tokens && domain.tokens.length > 0) {
      return parseCAIP10Address(domain.tokens[0].ownerAddress);
    }
    // For claimed domains, use claimedBy
    if (domain.claimedBy) {
      return parseCAIP10Address(domain.claimedBy);
    }
    // For listings, use offererAddress
    if (domain.offererAddress) {
      return parseCAIP10Address(domain.offererAddress);
    }
    // Fallback for other cases
    if (domain.seller) {
      return parseCAIP10Address(domain.seller);
    }
    return 'Unknown';
  };
  
  const seller = getOwner();
  const registrar = domain.registrar 
    ? (typeof domain.registrar === 'object' ? (domain.registrar as any).name || 'Unknown' : domain.registrar)
    : 'Unknown Registrar';
  const expiryDate = domain.expiresAt || domain.domainExpiry;
  const isTokenized = domain.isTokenized || domain.type === 'tokenized_name';
  const tokenizedAt = domain.tokenizedAt;
  const tokens = domain.tokens || [];
  const [activeTab, setActiveTab] = useState<'details' | 'activities'>('details');

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {domainName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{domainName}</h2>
                <p className="text-gray-400">{registrar}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                {getStatusText(status)}
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-white/10">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'activities'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Activity History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'details' && (
            <>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Domain Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Domain Name</span>
                      <span className="text-white font-mono">{domainName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Registrar</span>
                      <span className="text-white">{registrar}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expiration</span>
                      <span className="text-white">{formatExpiry(expiryDate)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Tokenization Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tokenized</span>
                      <span className="text-white">{isTokenized ? 'Yes' : 'No'}</span>
                    </div>
                    
                    {isTokenized && tokenizedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tokenized Date</span>
                        <span className="text-white">{new Date(tokenizedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price</span>
                      <span className="text-green-400 font-semibold">
                        {price > 0 ? formatPrice(price) : isTokenized ? 'Not Listed' : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Owner</span>
                      <span className="text-white font-mono text-sm">
                        {seller.length > 10 ? `${seller.slice(0, 6)}...${seller.slice(-4)}` : seller}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Information */}
              {isTokenized && tokens.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Token Information</h3>
                  
                  <div className="bg-white/5 rounded-lg p-4 space-y-3">
                    {tokens.map((token, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Token ID:</span>
                          <span className="text-white font-mono ml-2">{token.tokenId}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white ml-2">{token.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Network:</span>
                          <span className="text-white ml-2">{token.chain?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Listing Information */}
              {domain.listing && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Listing Information</h3>
                  
                  <div className="bg-white/5 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Listing ID:</span>
                        <span className="text-white font-mono ml-2">{domain.listing.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Orderbook:</span>
                        <span className="text-white ml-2">{domain.listing.orderbook}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white ml-2">
                          {new Date(domain.listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Updated:</span>
                        <span className="text-white ml-2">
                          {new Date(domain.listing.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Activity History Tab */}
          {activeTab === 'activities' && getNameActivities && getTokenActivities && getCommandStatus && domainName && domainName !== '' && (
            <ActivityTab
              domainName={domainName}
              tokenId={tokens[0]?.tokenId}
              getNameActivities={getNameActivities}
              getTokenActivities={getTokenActivities}
              getCommandStatus={getCommandStatus}
            />
          )}
          
          {/* Show message if no valid domain name for activities */}
          {activeTab === 'activities' && (!domainName || domainName === '') && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">📝</div>
              <p className="text-gray-400">No domain name available for activity history</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
          
          {isTokenized && price === 0 && (
            <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200">
              List for Sale
            </button>
          )}
          
          {!isTokenized && status.toLowerCase() === 'active' && price > 0 && (
            <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200">
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
