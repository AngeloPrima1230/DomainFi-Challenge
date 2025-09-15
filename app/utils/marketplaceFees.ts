import { formatUnits } from 'viem';

export interface FeeCalculation {
  basePrice: bigint;
  protocolFee: bigint;
  royaltyFee: bigint;
  totalFee: bigint;
  finalPrice: bigint;
  protocolFeePercentage: number;
  royaltyFeePercentage: number;
  totalFeePercentage: number;
}

export interface CurrencyInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

// Doma Protocol fee configuration
export const DOMA_PROTOCOL_FEE = {
  percentage: 0.5, // 0.5%
  receiver: '0x2E7cC63800e77BB8c662c45Ef33D1cCc23861532',
};

// Supported currencies for Doma testnet
export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  ETH: {
    address: '0x0000000000000000000000000000000000000000', // Native ETH
    symbol: 'ETH',
    decimals: 18,
    name: 'Ethereum',
  },
  USDC_SEPOLIA: {
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin (Sepolia)',
  },
  WETH_SEPOLIA: {
    address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
    symbol: 'WETH',
    decimals: 18,
    name: 'Wrapped Ethereum (Sepolia)',
  },
  USDC_BASE_SEPOLIA: {
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin (Base Sepolia)',
  },
  WETH_BASE_SEPOLIA: {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    decimals: 18,
    name: 'Wrapped Ethereum (Base Sepolia)',
  },
  USDC_DOMA: {
    address: '0x2f3463756C59387D6Cd55b034100caf7ECfc757b',
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin (Doma)',
  },
  WETH_DOMA: {
    address: '0x6f898cd313dcEe4D28A87F675BD93C471868B0Ac',
    symbol: 'WETH',
    decimals: 18,
    name: 'Wrapped Ethereum (Doma)',
  },
};

/**
 * Calculate marketplace fees for a given price and currency
 */
export function calculateMarketplaceFees(
  price: bigint,
  currency: string,
  royaltyPercentage: number = 0,
  decimals: number = 18
): FeeCalculation {
  // Calculate protocol fee (0.5%)
  const protocolFee = (price * BigInt(Math.floor(DOMA_PROTOCOL_FEE.percentage * 100))) / BigInt(10000);
  
  // Calculate royalty fee (variable, per token)
  const royaltyFee = (price * BigInt(Math.floor(royaltyPercentage * 100))) / BigInt(10000);
  
  // Total fees
  const totalFee = protocolFee + royaltyFee;
  
  // Final price (what the seller receives)
  const finalPrice = price - totalFee;
  
  return {
    basePrice: price,
    protocolFee,
    royaltyFee,
    totalFee,
    finalPrice,
    protocolFeePercentage: DOMA_PROTOCOL_FEE.percentage,
    royaltyFeePercentage: royaltyPercentage,
    totalFeePercentage: DOMA_PROTOCOL_FEE.percentage + royaltyPercentage,
  };
}

/**
 * Format fee calculation for display
 */
export function formatFeeCalculation(
  feeCalc: FeeCalculation,
  currency: string,
  decimals: number = 18
): {
  basePrice: string;
  protocolFee: string;
  royaltyFee: string;
  totalFee: string;
  finalPrice: string;
  protocolFeePercentage: string;
  royaltyFeePercentage: string;
  totalFeePercentage: string;
} {
  return {
    basePrice: formatUnits(feeCalc.basePrice, decimals),
    protocolFee: formatUnits(feeCalc.protocolFee, decimals),
    royaltyFee: formatUnits(feeCalc.royaltyFee, decimals),
    totalFee: formatUnits(feeCalc.totalFee, decimals),
    finalPrice: formatUnits(feeCalc.finalPrice, decimals),
    protocolFeePercentage: `${feeCalc.protocolFeePercentage}%`,
    royaltyFeePercentage: `${feeCalc.royaltyFeePercentage}%`,
    totalFeePercentage: `${feeCalc.totalFeePercentage}%`,
  };
}

/**
 * Get currency info by address or symbol
 */
export function getCurrencyInfo(identifier: string): CurrencyInfo | null {
  // Try to find by address first
  for (const [key, currency] of Object.entries(SUPPORTED_CURRENCIES)) {
    if (currency.address.toLowerCase() === identifier.toLowerCase()) {
      return currency;
    }
  }
  
  // Try to find by symbol
  for (const [key, currency] of Object.entries(SUPPORTED_CURRENCIES)) {
    if (currency.symbol.toLowerCase() === identifier.toLowerCase()) {
      return currency;
    }
  }
  
  return null;
}

/**
 * Validate if a currency is supported
 */
export function isCurrencySupported(identifier: string): boolean {
  return getCurrencyInfo(identifier) !== null;
}

/**
 * Get all supported currencies for a specific chain
 */
export function getSupportedCurrenciesForChain(chainId: string): CurrencyInfo[] {
  const currencies: CurrencyInfo[] = [];
  
  switch (chainId) {
    case '11155111': // Sepolia
      currencies.push(
        SUPPORTED_CURRENCIES.ETH,
        SUPPORTED_CURRENCIES.USDC_SEPOLIA,
        SUPPORTED_CURRENCIES.WETH_SEPOLIA
      );
      break;
    case '84532': // Base Sepolia
      currencies.push(
        SUPPORTED_CURRENCIES.ETH,
        SUPPORTED_CURRENCIES.USDC_BASE_SEPOLIA,
        SUPPORTED_CURRENCIES.WETH_BASE_SEPOLIA
      );
      break;
    case '97476': // Doma Testnet
      currencies.push(
        SUPPORTED_CURRENCIES.ETH,
        SUPPORTED_CURRENCIES.USDC_DOMA,
        SUPPORTED_CURRENCIES.WETH_DOMA
      );
      break;
    default:
      // Default to Sepolia currencies
      currencies.push(
        SUPPORTED_CURRENCIES.ETH,
        SUPPORTED_CURRENCIES.USDC_SEPOLIA,
        SUPPORTED_CURRENCIES.WETH_SEPOLIA
      );
  }
  
  return currencies;
}
