"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { resolveMarket } from "@/utils/solanaMarket"; // Import function
import { PublicKey } from "@solana/web3.js";

const price_feeds = {
  btc: "4cSM2e6rvbGQUFiJbqytoVMi5GgghSMr8LwVrT9VPSPo",
  sol: "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE",
  eth: "42amVS4KgzR9rA28tkVYqVXjq9Qa8dcZQMbH5EYFX6XC",
};

interface ResolveMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketPda: string; // ✅ Fix here
}

export default function ResolveMarketModal({ isOpen, onClose, marketPda }: ResolveMarketModalProps) {
  const wallet = useWallet();

  // const [marketPda, setMarketPda] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<"btc" | "sol" | "eth">("sol");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!wallet.publicKey) {
      setMessage("Wallet not connected! Please connect your wallet.");
      return;
    }

    if (!marketPda) {
      setMessage("Please enter a valid Market PDA.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const marketPdaKey = new PublicKey(marketPda);
      const priceAccount = new PublicKey(price_feeds[selectedAsset]);

      // Call resolveMarket function
      await resolveMarket(marketPdaKey, priceAccount, wallet);

      setMessage(`Market resolved successfully!`);
    } catch (error) {
      setMessage(
        error instanceof Error ? `Error: ${error.message}` : "An unknown error occurred."
      );
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white">
        <h2 className="text-xl font-bold mb-4">Resolve Market</h2>

        <label className="block mb-2">Market PDA:</label>
        <input
          type="text"
          value={marketPda}
          // onChange={(e) => setMarketPda(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Enter Market PDA"
        />

        <label className="block mt-4 mb-2">Select Asset:</label>
        <select
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value as "btc" | "sol" | "eth")}
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value="btc">Bitcoin (BTC)</option>
          <option value="sol">Solana (SOL)</option>
          <option value="eth">Ethereum (ETH)</option>
        </select>

        {/* Display corresponding Solana price feed account */}
        <p className="mt-2 text-gray-400 text-sm">
          Price Feed: {price_feeds[selectedAsset]}
        </p>

        <button
          onClick={handleSubmit}
          className="w-full mt-4 p-2 bg-blue-500 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Resolving Market..." : "Resolve Market"}
        </button>

        {/* Success/Error Message */}
        {message && <p className="mt-4 text-center text-yellow-400">{message}</p>}

        <button
          onClick={onClose}
          className="mt-4 w-full p-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
