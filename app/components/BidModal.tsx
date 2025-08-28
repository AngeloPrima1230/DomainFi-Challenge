'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, DollarSign } from 'lucide-react';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBid: (amount: string) => void;
  currentBid?: string;
  minBid?: string;
  domainName: string;
  loading?: boolean;
}

export function BidModal({ 
  isOpen, 
  onClose, 
  onBid, 
  currentBid, 
  minBid, 
  domainName,
  loading = false 
}: BidModalProps) {
  const [bidAmount, setBidAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bidAmount && parseFloat(bidAmount) > 0) {
      onBid(bidAmount);
      setBidAmount('');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Place Bid
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Domain:</p>
            <p className="font-medium text-gray-900">{domainName}</p>
          </div>

          {currentBid && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Current Bid:</p>
              <p className="font-medium text-gray-900">{currentBid} ETH</p>
            </div>
          )}

          {minBid && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Minimum Bid:</p>
              <p className="font-medium text-gray-900">{minBid} ETH</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Bid Amount (ETH)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  step="0.01"
                  min={minBid || "0"}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bid amount"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !bidAmount || parseFloat(bidAmount) <= 0}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Bid...' : 'Place Bid'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
