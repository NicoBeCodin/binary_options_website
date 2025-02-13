"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { redeemFunds } from "@/utils/solanaMarket"; // Import function
import { PublicKey } from "@solana/web3.js";

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketPda: string; // ✅ Fix here
}

export default function RedeemModal({ isOpen, onClose, marketPda }: RedeemModalProps) {
  const wallet = useWallet();

  // const [marketPda, setMarketPda] = useState<string>("");
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

      // Call redeem function
      await redeemFunds(marketPdaKey, wallet);

      setMessage(`Funds successfully redeemed!`);
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
        <h2 className="text-xl font-bold mb-4">Redeem Funds</h2>

        <label className="block mb-2">Market PDA:</label>
        <input
          type="text"
          value={marketPda}
          // onChange={(e) => setMarketPda(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Enter Market PDA"
        />

        <button
          onClick={handleSubmit}
          className="w-full mt-4 p-2 bg-green-500 rounded hover:bg-green-600"
          disabled={loading}
        >
          {loading ? "Redeeming Funds..." : "Redeem Funds"}
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
