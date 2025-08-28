'use client';

import { useState, useEffect } from 'react';
import { NameActivity, TokenActivity, CommandStatus } from '../hooks/useDomaSubgraph';

interface ActivityTabProps {
  domainName: string;
  tokenId?: string;
  getNameActivities: (name: string, skip?: number, take?: number) => Promise<any>;
  getTokenActivities: (tokenId: string, skip?: number, take?: number) => Promise<any>;
  getCommandStatus: (correlationId: string) => Promise<CommandStatus | null>;
}

export default function ActivityTab({ 
  domainName, 
  tokenId, 
  getNameActivities, 
  getTokenActivities, 
  getCommandStatus 
}: ActivityTabProps) {
  const [activeTab, setActiveTab] = useState<'name' | 'token'>('name');
  const [nameActivities, setNameActivities] = useState<NameActivity[]>([]);
  const [tokenActivities, setTokenActivities] = useState<TokenActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'name') {
      fetchNameActivities();
    } else if (activeTab === 'token' && tokenId) {
      fetchTokenActivities();
    }
  }, [activeTab, domainName, tokenId]);

  const fetchNameActivities = async () => {
    setLoading(true);
    try {
      const result = await getNameActivities(domainName);
      console.log('Name activities result:', result);
      // Handle empty arrays properly - the API returns empty arrays when no activities exist
      if (result && result.items && Array.isArray(result.items)) {
        console.log('Name activities items:', result.items);
        // Log the first item to see its structure
        if (result.items.length > 0) {
          console.log('First name activity item:', JSON.stringify(result.items[0], null, 2));
          console.log('First item keys:', Object.keys(result.items[0]));
        }
        setNameActivities(result.items);
      } else {
        setNameActivities([]);
      }
    } catch (error) {
      console.error('Error fetching name activities:', error);
      setNameActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenActivities = async () => {
    if (!tokenId) return;
    
    setLoading(true);
    try {
      const result = await getTokenActivities(tokenId);
      console.log('Token activities result:', result);
      // Handle empty arrays properly - the API returns empty arrays when no activities exist
      if (result && result.items && Array.isArray(result.items)) {
        console.log('Token activities items:', result.items);
        // Log the first item to see its structure
        if (result.items.length > 0) {
          console.log('First token activity item:', JSON.stringify(result.items[0], null, 2));
          console.log('First item keys:', Object.keys(result.items[0]));
        }
        setTokenActivities(result.items);
      } else {
        setTokenActivities([]);
      }
    } catch (error) {
      console.error('Error fetching token activities:', error);
      setTokenActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    if (!type) return '📝';
    
    switch (type) {
      case 'CLAIMED':
        return '👤';
      case 'DETOKENIZED':
        return '🔴';
      case 'TOKENIZED':
        return '🟢';
      case 'RENEWED':
        return '🔄';
      case 'CLAIM_REQUESTED':
        return '📝';
      case 'MINTED':
        return '🟢';
      case 'TRANSFERRED':
        return '↔️';
      case 'LISTED':
        return '📋';
      case 'OFFER_RECEIVED':
        return '💼';
      case 'LISTING_CANCELLED':
      case 'OFFER_CANCELLED':
        return '❌';
      case 'PURCHASED':
        return '💰';
      case 'BOUGHT_OUT':
        return '💸';
      case 'FRACTIONALIZED':
        return '🔗';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    if (!type) return 'text-gray-400';
    
    switch (type) {
      case 'CLAIMED':
      case 'TOKENIZED':
      case 'RENEWED':
      case 'MINTED':
      case 'PURCHASED':
      case 'BOUGHT_OUT':
        return 'text-green-400';
      case 'FRACTIONALIZED':
      case 'TRANSFERRED':
        return 'text-blue-400';
      case 'LISTED':
      case 'OFFER_RECEIVED':
        return 'text-yellow-400';
      case 'LISTING_CANCELLED':
      case 'OFFER_CANCELLED':
      case 'DETOKENIZED':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return 'Invalid date';
    }
  };

  const shortenHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  // Parse network ID to human-readable format
  const parseNetworkId = (networkId: string) => {
    if (!networkId) return 'Unknown Network';
    
    // Remove eip155: prefix if present
    const cleanNetworkId = networkId.replace('eip155:', '');
    
    // Map common network IDs to readable names
    const networkMap: { [key: string]: string } = {
      '1': 'Ethereum Mainnet',
      '11155111': 'Sepolia Testnet',
      '137': 'Polygon',
      '80001': 'Polygon Mumbai',
      '42161': 'Arbitrum One',
      '421613': 'Arbitrum Goerli',
      '10': 'Optimism',
      '420': 'Optimism Goerli',
      '56': 'BNB Smart Chain',
      '97': 'BNB Testnet',
      '43114': 'Avalanche C-Chain',
      '43113': 'Avalanche Fuji',
      '250': 'Fantom Opera',
      '4002': 'Fantom Testnet',
      '97476': 'Doma Protocol Network', // Based on your data
    };
    
    return networkMap[cleanNetworkId] || `Network ${cleanNetworkId}`;
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('name')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'name'
              ? 'bg-white/10 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Domain Activities
        </button>
        {tokenId && (
          <button
            onClick={() => setActiveTab('token')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'token'
                ? 'bg-white/10 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Token Activities
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-2">Loading activities...</p>
        </div>
      )}

      {/* Name Activities */}
      {activeTab === 'name' && !loading && (
        <div className="space-y-3">
          {nameActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No domain activities found</p>
            </div>
          ) : (
            nameActivities.map((activity, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div>
                                             <h4 className={`font-semibold ${getActivityColor(activity.type)}`}>
                         {(activity.type || 'UNKNOWN').replace(/_/g, ' ')}
                       </h4>
                       <p className="text-sm text-gray-400">
                         {formatDate(activity.createdAt)}
                       </p>

                      {activity.sld && activity.tld && (
                        <p className="text-xs text-gray-500 mt-1">
                          Domain: {activity.sld}.{activity.tld}
                        </p>
                      )}
                      {activity.claimedBy && (
                        <p className="text-xs text-blue-400 mt-1">
                          Claimed by: {shortenHash(activity.claimedBy)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.txHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${activity.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-mono"
                      >
                        {shortenHash(activity.txHash)}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Token Activities */}
      {activeTab === 'token' && !loading && (
        <div className="space-y-3">
          {tokenActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No token activities found</p>
            </div>
          ) : (
            tokenActivities.map((activity, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div>
                                             <h4 className={`font-semibold ${getActivityColor(activity.type)}`}>
                         {(activity.type || 'UNKNOWN').replace(/_/g, ' ')}
                       </h4>
                       <p className="text-sm text-gray-400">
                         {formatDate(activity.createdAt)}
                       </p>

                                             <p className="text-xs text-gray-500 mt-1">
                         Token ID: {activity.tokenId || 'Unknown'}
                       </p>
                                               <p className="text-xs text-purple-400 mt-1">
                          Network: {parseNetworkId(activity.networkId)}
                        </p>
                      {activity.finalized !== undefined && (
                        <p className={`text-xs mt-1 ${activity.finalized ? 'text-green-400' : 'text-yellow-400'}`}>
                          {activity.finalized ? 'Finalized' : 'Pending'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.txHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${activity.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-mono"
                      >
                        {shortenHash(activity.txHash)}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
