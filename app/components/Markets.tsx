'use client';

import React, { useState, useEffect } from 'react';
import { fetchAvailableMarkets, MarketMinimal } from '@/utils/fetchMarkets';
import { getOnchainTime } from '@/utils/solanaMarket';
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiSolana } from "react-icons/si";

export default function Markets() {
  const [markets, setMarkets] = useState<MarketMinimal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onchainTime, setOnchainTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchTime = async () => {
      const unixTimestamp = await getOnchainTime();
      if (!unixTimestamp){
        setOnchainTime("Can't fetch onchain time");
      }else {
        const date = new Date(unixTimestamp * 1000).toLocaleString();
        setOnchainTime(date);
      }
    };

    fetchTime();
  }, []);

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

  // Function to determine outcome color
  const getOutcomeColor = (outcome: string | null) => {
    if (outcome === "YES") return "text-green-400";
    if (outcome === "NO") return "text-red-400";
    return "text-yellow-400";
  };

  // Function to render asset icon
  const getAssetIcon = (asset: string) => {
    switch (asset) {
      case "BTC":
        return <FaBitcoin className="text-yellow-400 text-2xl" />;
      case "SOL":
        return <SiSolana className="text-purple-400 text-2xl" />;
      case "ETH":
        return <FaEthereum className="text-blue-400 text-2xl" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-10 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Available Markets</h2>
      {onchainTime && <p className="text-gray-400 mb-4">On-Chain Time: {onchainTime}</p>}

      <button
        onClick={handleSearchMarkets}
        className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Search Available Markets'}
      </button>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {markets.length > 0 ? (
          markets.map((market, index) => (
            <div key={index} className="p-4 border border-gray-600 rounded-lg bg-gray-700 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{market.asset}</h3>
                {getAssetIcon(market.asset)}
              </div>

              <p className="text-green-400 text-sm">Market PDA:</p>
              <a
                href={`https://explorer.solana.com/address/${market.marketPda}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline text-sm"
              >
                {market.marketPda}
              </a>

              <p className="text-green-400 text-sm">Authority:</p>
              <a
                href={`https://explorer.solana.com/address/${market.authority}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline text-sm"
              >
                {market.authority}
              </a>

              <div className="mt-4 text-lg font-bold">
                <p>Strike Price: {market.strike.toString()}</p>
                <p>Expiry: {new Date(Number(market.expiry) * 1000).toLocaleString()}</p>
              </div>

              <p className="text-gray-300 mt-2">Resolved: {market.resolved ? "Yes" : "No"}</p>

              <p className={`mt-2 ${getOutcomeColor(market.outcome)}`}>
                Outcome: {market.outcome || "N/A"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 col-span-full">No markets found.</p>
        )}
      </div>
    </div>
  );
}
