"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { lockFunds } from "@/utils/solanaMarket"; // Import function
import { PublicKey } from "@solana/web3.js";


interface LockFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketPda: string; // ✅ Add this line
}

export default function LockFundsModal({ isOpen, onClose, marketPda }: LockFundsModalProps) {
  const wallet = useWallet();

  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!wallet.publicKey) {
      setMessage("Wallet not connected! Please connect your wallet.");
      return;
    }

    if (!marketPda || !tokenAmount) {
      setMessage("Please enter valid values.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const marketPdaKey = new PublicKey(marketPda);
      const tokenCount = parseInt(tokenAmount);

      // Call lockFunds function
      await lockFunds(marketPdaKey, tokenCount, wallet);

      setMessage(`Successfully locked ${tokenCount * 100000} lamports in market!`);
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
        <h2 className="text-xl font-bold mb-4">Lock Funds in Market</h2>

        <label className="block mb-2">Market PDA:</label>
        <input
          type="text"
          value={marketPda} // ✅ Use the pre-filled marketPda from props
          className="w-full p-2 rounded bg-gray-700 text-gray-400"
          disabled
        />

        <label className="block mt-4 mb-2">Number of Yes/No Tokens:</label>
        <input
          type="number"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Enter number of tokens"
        />

        <button
          onClick={handleSubmit}
          className="w-full mt-4 p-2 bg-blue-500 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Locking Funds..." : "Lock Funds"}
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
