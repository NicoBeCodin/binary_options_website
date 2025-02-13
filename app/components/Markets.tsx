'use client';

import React, { useState, useEffect } from 'react';
import { fetchAvailableMarkets, MarketMinimal } from '@/utils/fetchMarkets';
import { getOnchainTime } from '@/utils/solanaMarket';
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiSolana } from "react-icons/si";
import LockFundsModal from '@/components/LockFundsModal';
import ResolveMarketModal from '@/components/ResolveMarketModal';
import RedeemFundsModal from '@/components/RedeemModal';

export default function Markets() {
  const [markets, setMarkets] = useState<MarketMinimal[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<MarketMinimal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onchainTime, setOnchainTime] = useState<number | null>(null);

  // Modal State
  const [selectedMarketPda, setSelectedMarketPda] = useState<string | null>(null);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  useEffect(() => {
    const fetchTime = async () => {
      const unixTimestamp = await getOnchainTime();
      setOnchainTime(unixTimestamp ?? null);
    };
    fetchTime();
  }, []);

  const handleSearchMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      const availableMarkets = await fetchAvailableMarkets();
      setMarkets(availableMarkets);
      setFilteredMarkets(availableMarkets);
    } catch (err) {
      setError("Failed to fetch markets. Try again.");
    }
    setLoading(false);
  };

  // Function to determine expiry color
  const getExpiryColor = (expiry: bigint) => {
    if (onchainTime && Number(expiry) <= onchainTime) {
      return "text-green-400"; // Expired market
    }
    return "text-white"; // Active market
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

  // Open Lock Funds Modal
  const openLockFundsModal = (marketPda: string) => {
    setSelectedMarketPda(marketPda);
    setIsLockModalOpen(true);
  };

  // Open Resolve Market Modal
  const openResolveModal = (marketPda: string) => {
    setSelectedMarketPda(marketPda);
    setIsResolveModalOpen(true);
  };

  // Open Redeem Funds Modal
  const openRedeemModal = (marketPda: string) => {
    setSelectedMarketPda(marketPda);
    setIsRedeemModalOpen(true);
  };

  return (
    <div className="p-10 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Available Markets</h2>

      {onchainTime && (
        <p className="text-gray-400 mb-4">
          On-Chain Time: {new Date(onchainTime * 1000).toLocaleString()}
        </p>
      )}

      <button
        onClick={handleSearchMarkets}
        className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Searching..." : "Search Available Markets"}
      </button>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {/* Display Markets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((market, index) => {
            const isExpired = onchainTime && Number(market.expiry) <= onchainTime;
            return (
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

                <div className="mt-4 text-lg font-bold">
                  <p>Strike Price: {market.strike.toString()}</p>
                  <p className={getExpiryColor(market.expiry)}>
                    Expiry: {new Date(Number(market.expiry) * 1000).toLocaleString()}
                  </p>
                </div>

                <p className="text-gray-300 mt-2">Resolved: {market.resolved ? "Yes" : "No"}</p>

                {/* Market Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {/* Lock Funds - Only if Market is NOT Expired */}
                  {!isExpired && (
                    <button
                      onClick={() => openLockFundsModal(market.marketPda)}
                      className="p-2 bg-yellow-500 rounded hover:bg-yellow-600 text-black"
                    >
                      Lock Funds
                    </button>
                  )}

                  {/* Resolve Market - If Expired & Not Resolved */}
                  {isExpired && !market.resolved && (
                    <button
                      onClick={() => openResolveModal(market.marketPda)}
                      className="p-2 bg-red-500 rounded hover:bg-red-600 text-white"
                    >
                      Resolve
                    </button>
                  )}

                  {/* Redeem Funds - If Resolved */}
                  {market.resolved && (
                    <button
                      onClick={() => openRedeemModal(market.marketPda)}
                      className="p-2 bg-green-500 rounded hover:bg-green-600 text-white"
                    >
                      Redeem
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 col-span-full">No markets found.</p>
        )}
      </div>

      {/* Modals */}
      {isLockModalOpen && selectedMarketPda && (
        <LockFundsModal
          isOpen={isLockModalOpen}
          onClose={() => setIsLockModalOpen(false)}
          marketPda={selectedMarketPda}
        />
      )}
      {isResolveModalOpen && selectedMarketPda && (
        <ResolveMarketModal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          marketPda={selectedMarketPda}
        />
      )}
      {isRedeemModalOpen && selectedMarketPda && (
        <RedeemFundsModal
          isOpen={isRedeemModalOpen}
          onClose={() => setIsRedeemModalOpen(false)}
          marketPda={selectedMarketPda}
        />
      )}
    </div>
  );
}
