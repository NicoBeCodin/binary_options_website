"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { initializeMarket } from "@/utils/solanaMarket"; // Import the function
import { error } from "console";

interface CreateMarketModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  export default function CreateMarketModal({ isOpen, onClose }: CreateMarketModalProps) {
    const wallet = useWallet();
  
    const [asset, setAsset] = useState<number>(2); // Default to SOL=2
    const [strike, setStrike] = useState<string>('');
    const [expiryMinutes, setExpiryMinutes] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [marketPda, setMarketPda] = useState<string | null>(null);
  
    const handleSubmit = async () => {
      if (!wallet.publicKey) {
        setMessage("Wallet not connected! Please connect your wallet.");
        return;
      }
      
      if (!strike || !expiryMinutes) {
        setMessage("Please enter valid values.");
        return;
      }
  
      setLoading(true);
      setMessage(null);
      setMarketPda(null); // Reset previous market PDA
  
      try {
        // ✅ Pass `wallet` to `initializeMarket`
        const marketPdaKey = await initializeMarket(parseInt(strike), asset, parseInt(expiryMinutes), wallet);
  
        setMarketPda(marketPdaKey.toString()); // ✅ Store market PDA separately
        setMessage("Market successfully created!");
      } catch (error: unknown) {
        setMessage(error instanceof Error ? `Error: ${error.message}` : "An unknown error occurred.");
      }
  
      setLoading(false);
    };
  
    const copyToClipboard = () => {
      if (marketPda) {
        navigator.clipboard.writeText(marketPda);
        alert("Market PDA copied to clipboard!");
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white">
          <h2 className="text-xl font-bold mb-4">Create New Market</h2>
  
          <label className="block mb-2">Asset:</label>
          <select value={asset} onChange={(e) => setAsset(parseInt(e.target.value))} className="w-full p-2 rounded bg-gray-700 text-white">
            <option value={1}>Bitcoin (BTC)</option>
            <option value={2}>Solana (SOL)</option>
            <option value={3}>Ethereum (ETH)</option>
          </select>
  
          <label className="block mt-4 mb-2">Strike Price:</label>
          <input type="number" value={strike} onChange={(e) => setStrike(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
  
          <label className="block mt-4 mb-2">Expiry Time (Minutes):</label>
          <input type="number" value={expiryMinutes} onChange={(e) => setExpiryMinutes(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
  
          <button onClick={handleSubmit} className="w-full mt-4 p-2 bg-blue-500 rounded hover:bg-blue-600">
            {loading ? 'Creating Market...' : 'Create Market'}
          </button>
  
          {/* ✅ Success Message */}
          {message && <p className="mt-4 text-center text-yellow-400">{message}</p>}
  
          {/* ✅ Copyable Market PDA */}
          {marketPda && (
            <div className="mt-4 text-center">
              <p className="text-green-400">Market PDA:</p>
              <a 
                href={`https://explorer.solana.com/address/${marketPda}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {marketPda}
              </a>
              <button onClick={copyToClipboard} className="ml-2 p-1 bg-gray-700 rounded hover:bg-gray-600">
                📋 Copy
              </button>
            </div>
          )}
  
          <button onClick={onClose} className="mt-4 w-full p-2 bg-gray-700 rounded hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    );
  }