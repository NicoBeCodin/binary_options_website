"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { initializeMarket } from "@/utils/solanaMarket"; // Import the function
import { error } from "console";

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateMarketModal({
  isOpen,
  onClose,
}: CreateMarketModalProps) {
  const wallet = useWallet();
  const [asset, setAsset] = useState<string>("SOL");
  const [strike, setStrike] = useState<string>("");
  const [expiryMinutes, setExpiryMinutes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Convert asset name to number (1 = BTC, 2 = SOL, 3 = ETH)
  const getAssetCode = (asset: string): number => {
    return asset === "BTC" ? 1 : asset === "SOL" ? 2 : 3;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!strike || !expiryMinutes) {
      setMessage("Please enter valid values.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Call the initializeMarket function
      const marketPda = await initializeMarket(
        parseInt(strike),
        getAssetCode(asset),
        parseInt(expiryMinutes),
        wallet
      );

      setMessage(`Market Created! Market PDA: ${marketPda.toString()}`);
    } catch (err) {
      // console.error(err);
      setMessage(`Error: ${err}`);
    }

    setLoading(false);
  };

  if (!isOpen) return null; // Hide modal if not open

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white">
        <h2 className="text-xl font-bold mb-4">Create New Market</h2>

        {/* Select Asset */}
        <label className="block mb-2">Asset:</label>
        <select
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="SOL">Solana (SOL)</option>
          <option value="ETH">Ethereum (ETH)</option>
        </select>

        {/* Strike Price */}
        <label className="block mt-4 mb-2">Strike Price:</label>
        <input
          type="number"
          value={strike}
          onChange={(e) => setStrike(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />

        {/* Expiry Time */}
        <label className="block mt-4 mb-2">Expiry Time (Minutes):</label>
        <input
          type="number"
          value={expiryMinutes}
          onChange={(e) => setExpiryMinutes(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full mt-4 p-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          {loading ? "Creating Market..." : "Create Market"}
        </button>

        {/* Status Message */}
        {message && (
          <p className="mt-4 text-center text-yellow-400">{message}</p>
        )}

        {/* Close Button */}
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
