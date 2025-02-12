'use client';

import React, { useState } from 'react';
import { fetchAvailableMarkets, MarketMinimal } from '@/utils/fetchMarkets';



export default function Markets() {
  const [markets, setMarkets] = useState<MarketMinimal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchMarkets = async () => {
    setLoading(true);
    setError(null);

    try {
      const availableMarkets = await fetchAvailableMarkets();
      setMarkets(availableMarkets);
    } catch (err) {
      setError('Failed to fetch markets. Try again.');
    }

    setLoading(false);
  };

  return (
    <div className="p-10 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Available Markets</h2>

      <button
        onClick={handleSearchMarkets}
        className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Search Available Markets'}
      </button>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      <div className="mt-6">
        {markets.length > 0 ? (
          markets.map((market, index) => (
            <div key={index} className="p-4 border border-gray-600 rounded-lg mb-4">
              <p className="text-green-400">Market PDA:</p>
              <a
                href={`https://explorer.solana.com/address/${market.marketPda}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {market.marketPda}
              </a>
              <p className="text-green-400">Authority:</p>
              <a
                href={`https://explorer.solana.com/address/${market.authority}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {market.authority}
              </a>
              <p className="text-green-400">Strike Price: {market.strike.toString()}</p>
              <p className="text-green-400">Expiry Price: {market.expiry.toString()}</p>
              <p className="text-green-400">Asset:  {market.asset}</p>
              <p className="text-green-400">Resolved:  {market.resolved.toString()}</p>
              <p className="text-green-400">Outcome:  {market.outcome}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No markets found.</p>
        )}
      </div>
    </div>
  );
}
