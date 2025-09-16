'use client';

import { useState, useEffect } from 'react';
import { calculateMarketplaceFees, formatFeeCalculation, getSupportedCurrenciesForChain, CurrencyInfo } from '../utils/marketplaceFees';
import { parseUnits } from 'viem';

interface FeeCalculatorProps {
  className?: string;
  chainId?: string;
  onFeeCalculation?: (fees: any) => void;
}

export default function FeeCalculator({ 
  className = '', 
  chainId = '11155111',
  onFeeCalculation 
}: FeeCalculatorProps) {
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('ETH');
  const [royaltyPercentage, setRoyaltyPercentage] = useState(0);
  const [supportedCurrencies, setSupportedCurrencies] = useState<CurrencyInfo[]>([]);
  const [feeCalculation, setFeeCalculation] = useState<any>(null);

  useEffect(() => {
    const currencies = getSupportedCurrenciesForChain(chainId);
    setSupportedCurrencies(currencies);
    if (currencies.length > 0) {
      setCurrency(currencies[0].symbol);
    }
  }, [chainId]);

  useEffect(() => {
    if (price && currency) {
      const currencyInfo = supportedCurrencies.find(c => c.symbol === currency);
      if (currencyInfo) {
        try {
          const priceBigInt = parseUnits(price, currencyInfo.decimals);
          const fees = calculateMarketplaceFees(
            priceBigInt,
            currency,
            royaltyPercentage,
            currencyInfo.decimals
          );
          const formattedFees = formatFeeCalculation(fees, currency, currencyInfo.decimals);
          setFeeCalculation(formattedFees);
          onFeeCalculation?.(formattedFees);
        } catch (error) {
          console.error('Error calculating fees:', error);
          setFeeCalculation(null);
        }
      }
    } else {
      setFeeCalculation(null);
    }
  }, [price, currency, royaltyPercentage, supportedCurrencies, onFeeCalculation]);

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Fee Calculator</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.1"
            step="0.001"
            min="0"
          />
        </div>
        
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {supportedCurrencies.map((curr) => (
              <option key={curr.symbol} value={curr.symbol}>
                {curr.symbol} - {curr.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="royalty" className="block text-sm font-medium text-gray-700 mb-1">
          Royalty Percentage
        </label>
        <input
          type="number"
          id="royalty"
          value={royaltyPercentage}
          onChange={(e) => setRoyaltyPercentage(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
          step="0.1"
          min="0"
          max="10"
        />
        <p className="text-xs text-gray-500 mt-1">
          Royalty percentage varies per token (0-10%)
        </p>
      </div>

      {feeCalculation && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Fee Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price:</span>
              <span className="font-medium">{feeCalculation.basePrice} {currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Protocol Fee (0.5%):</span>
              <span className="font-medium text-red-600">-{feeCalculation.protocolFee} {currency}</span>
            </div>
            {royaltyPercentage > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Royalty Fee ({royaltyPercentage}%):</span>
                <span className="font-medium text-red-600">-{feeCalculation.royaltyFee} {currency}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fees:</span>
                <span className="font-medium text-red-600">-{feeCalculation.totalFee} {currency}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-900">You Receive:</span>
                <span className="text-green-600">{feeCalculation.finalPrice} {currency}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Fee Summary:</div>
              <div>• Doma Protocol Fee: 0.5% (fixed)</div>
              <div>• Royalty Fee: {royaltyPercentage}% (varies per token)</div>
              <div>• Total Fee: {feeCalculation.totalFeePercentage}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
