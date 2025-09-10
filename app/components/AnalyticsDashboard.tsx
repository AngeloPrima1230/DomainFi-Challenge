'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalVolume: number;
  activeListings: number;
  totalDomains: number;
  averagePrice: number;
  priceChange24h: number;
  volumeChange24h: number;
  topDomains: Array<{
    name: string;
    price: number;
    volume: number;
  }>;
  registrarStats: Array<{
    name: string;
    domains: number;
    volume: number;
    avgPrice: number;
  }>;
  recentActivity: Array<{
    type: string;
    domain: string;
    price?: number;
    timestamp: string;
  }>;
  priceRanges: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  tldStats: Array<{
    tld: string;
    count: number;
    avgPrice: number;
  }>;
}

interface AnalyticsDashboardProps {
  searchableItems: any[];
  allListings: any[];
  names: any[];
}

export default function AnalyticsDashboard({ 
  searchableItems, 
  allListings, 
  names 
}: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'domains' | 'registrars'>('overview');

  useEffect(() => {
    if (searchableItems.length > 0) {
      calculateAnalytics();
    }
  }, [searchableItems, allListings, names]);

  const calculateAnalytics = () => {
    // Calculate total volume
    const totalVolume = allListings.reduce((sum, listing) => {
      return sum + parseFloat(listing.price || '0');
    }, 0);

    // Calculate active listings
    const activeListings = allListings.filter(listing => 
      'status' in listing ? listing.status === 'active' : true
    ).length;

    // Calculate average price
    const listedItems = allListings.filter(listing => parseFloat(listing.price || '0') > 0);
    const averagePrice = listedItems.length > 0 
      ? listedItems.reduce((sum, listing) => sum + parseFloat(listing.price || '0'), 0) / listedItems.length
      : 0;

    // Get top domains by price
    const topDomains = searchableItems
      .filter(item => item.price && parseFloat(item.price) > 0)
      .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      .slice(0, 10)
      .map(item => ({
        name: item.name,
        price: parseFloat(item.price),
        volume: parseFloat(item.price) // Simplified volume calculation
      }));

    // Calculate registrar statistics
    const registrarMap = new Map();
    searchableItems.forEach(item => {
      const registrar = item.registrar || 'Unknown';
      if (!registrarMap.has(registrar)) {
        registrarMap.set(registrar, {
          name: registrar,
          domains: 0,
          volume: 0,
          prices: []
        });
      }
      const stats = registrarMap.get(registrar);
      stats.domains++;
      if (item.price && parseFloat(item.price) > 0) {
        stats.volume += parseFloat(item.price);
        stats.prices.push(parseFloat(item.price));
      }
    });

    const registrarStats = Array.from(registrarMap.values())
      .map(stats => ({
        name: stats.name,
        domains: stats.domains,
        volume: stats.volume,
        avgPrice: stats.prices.length > 0 ? stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length : 0
      }))
      .sort((a, b) => b.volume - a.volume);

    // Calculate price ranges
    const priceRanges = [
      { range: '0-0.1 ETH', min: 0, max: 0.1 },
      { range: '0.1-0.5 ETH', min: 0.1, max: 0.5 },
      { range: '0.5-1 ETH', min: 0.5, max: 1 },
      { range: '1-5 ETH', min: 1, max: 5 },
      { range: '5+ ETH', min: 5, max: Infinity }
    ].map(range => {
      const count = searchableItems.filter(item => {
        const price = parseFloat(item.price || '0');
        return price >= range.min && price < range.max;
      }).length;
      return {
        range: range.range,
        count,
        percentage: searchableItems.length > 0 ? (count / searchableItems.length) * 100 : 0
      };
    });

    // Calculate TLD statistics
    const tldMap = new Map();
    searchableItems.forEach(item => {
      const tld = item.tld || 'unknown';
      if (!tldMap.has(tld)) {
        tldMap.set(tld, {
          tld,
          count: 0,
          totalPrice: 0,
          prices: []
        });
      }
      const stats = tldMap.get(tld);
      stats.count++;
      if (item.price && parseFloat(item.price) > 0) {
        stats.totalPrice += parseFloat(item.price);
        stats.prices.push(parseFloat(item.price));
      }
    });

    const tldStats = Array.from(tldMap.values())
      .map(stats => ({
        tld: stats.tld,
        count: stats.count,
        avgPrice: stats.prices.length > 0 ? stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Mock recent activity (in real app, this would come from activity feeds)
    const recentActivity = searchableItems
      .slice(0, 5)
      .map(item => ({
        type: item.price && parseFloat(item.price) > 0 ? 'Listed' : 'Tokenized',
        domain: item.name,
        price: item.price ? parseFloat(item.price) : undefined,
        timestamp: new Date().toISOString() // Mock timestamp
      }));

    setAnalyticsData({
      totalVolume,
      activeListings,
      totalDomains: searchableItems.length,
      averagePrice,
      priceChange24h: 0, // Mock data - would need historical data
      volumeChange24h: 0, // Mock data - would need historical data
      topDomains,
      registrarStats,
      recentActivity,
      priceRanges,
      tldStats
    });
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(4)} ETH`;
  };

  const formatVolume = (volume: number) => {
    return `${volume.toFixed(2)} ETH`;
  };

  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getPriceChangeIcon = (change: number) => {
    return change >= 0 ? '↗' : '↘';
  };

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-gray-400 mt-2">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Market Analytics</h2>
          <p className="text-gray-400">Real-time marketplace insights</p>
        </div>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-white/10 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'trends', label: 'Trends', icon: '📈' },
          { id: 'domains', label: 'Top Domains', icon: '🏆' },
          { id: 'registrars', label: 'Registrars', icon: '🏢' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white/10 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-blue-400">{formatVolume(analyticsData.totalVolume)}</div>
              <div className="text-sm text-gray-400">Total Volume</div>
              <div className={`text-xs mt-1 ${getPriceChangeColor(analyticsData.volumeChange24h)}`}>
                {getPriceChangeIcon(analyticsData.volumeChange24h)} {Math.abs(analyticsData.volumeChange24h).toFixed(2)}%
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-green-400">{analyticsData.activeListings}</div>
              <div className="text-sm text-gray-400">Active Listings</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-purple-400">{analyticsData.totalDomains}</div>
              <div className="text-sm text-gray-400">Total Domains</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-orange-400">{formatPrice(analyticsData.averagePrice)}</div>
              <div className="text-sm text-gray-400">Avg Price</div>
              <div className={`text-xs mt-1 ${getPriceChangeColor(analyticsData.priceChange24h)}`}>
                {getPriceChangeIcon(analyticsData.priceChange24h)} {Math.abs(analyticsData.priceChange24h).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Price Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Price Distribution</h3>
              <div className="space-y-3">
                {analyticsData.priceRanges.map((range, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{range.range}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${range.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400 w-12 text-right">{range.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        activity.type === 'Listed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {activity.type}
                      </span>
                      <span className="text-sm text-gray-300">{activity.domain}</span>
                    </div>
                    {activity.price && (
                      <span className="text-sm text-gray-400">{formatPrice(activity.price)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Market Trends</h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-400">Historical price and volume charts</p>
              <p className="text-sm text-gray-500 mt-2">Coming soon with real-time data feeds</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Domains Tab */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Top Domains by Price</h3>
            <div className="space-y-3">
              {analyticsData.topDomains.map((domain, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <div className="font-semibold text-white">{domain.name}</div>
                      <div className="text-sm text-gray-400">Volume: {formatVolume(domain.volume)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">{formatPrice(domain.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TLD Statistics */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Top-Level Domain Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyticsData.tldStats.map((tld, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-semibold text-white">.{tld.tld}</div>
                    <div className="text-sm text-gray-400">{tld.count} domains</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-400">{formatPrice(tld.avgPrice)}</div>
                    <div className="text-xs text-gray-400">avg price</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Registrars Tab */}
      {activeTab === 'registrars' && (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Registrar Performance</h3>
            <div className="space-y-3">
              {analyticsData.registrarStats.map((registrar, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <div className="font-semibold text-white">{registrar.name}</div>
                      <div className="text-sm text-gray-400">{registrar.domains} domains</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-400">{formatVolume(registrar.volume)}</div>
                    <div className="text-xs text-gray-400">avg: {formatPrice(registrar.avgPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
