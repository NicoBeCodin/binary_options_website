"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  initializeMarket,
  createMetadataTokens,
  getOnchainTime,
} from "@/utils/solanaMarket"; // Import the function
import { PublicKey } from "@solana/web3.js";
import { AiOutlineReload, AiOutlineQuestionCircle } from "react-icons/ai"; // Import refresh icon

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateMarketModal({
  isOpen,
  onClose,
}: CreateMarketModalProps) {
  const wallet = useWallet();
  const [expiryDate, setExpiryDate] = useState(""); // Store user-inputted date
  const [onchainTime, setOnchainTime] = useState<number | null>(null); // On-chain time in UNIX seconds
  const [asset, setAsset] = useState<number>(2); // Default to SOL=2
  const [strike, setStrike] = useState<string>("");
  const [expiryMinutes, setExpiryMinutes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [marketPda, setMarketPda] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [yesMintPda, setYesMintPda] = useState<PublicKey | null>(null);
  const [noMintPda, setNoMintPda] = useState<PublicKey | null>(null);
  const [loadingTime, setLoadingTime] = useState(false); // Track reloading state
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    fetchOnchainTime();
  }, []);

  const fetchOnchainTime = async () => {
    setLoadingTime(true);
    const unixTimestamp = await getOnchainTime();
    setOnchainTime(unixTimestamp);
    setLoadingTime(false);
  };
  // Convert user-inputted date to UNIX timestamp in seconds
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userDate = new Date(e.target.value);
    if (!isNaN(userDate.getTime())) {
      const unixTimestamp = Math.floor(userDate.getTime() / 1000); // Convert to seconds
      setExpiryDate(e.target.value); // Store formatted date
      setExpiryMinutes(unixTimestamp.toString()); // Convert to UNIX and set state
    }
  };

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
      const marketPdaKey = await initializeMarket(
        parseInt(strike),
        asset,
        parseInt(expiryMinutes),
        wallet
      );

      setMarketPda(marketPdaKey.toString()); // ✅ Store market PDA separately
      setMessage("Market successfully created!");
    } catch (error: unknown) {
      setMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "An unknown error occurred."
      );
    }

    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleMintOutcomeTokens = async () => {
    if (!marketPda || !wallet.publicKey) return;

    setMinting(true);
    setMessage(null);

    try {
      const marketPdaKey = new PublicKey(marketPda);
      const { yesMintPda, noMintPda } = await createMetadataTokens(
        marketPdaKey,
        wallet
      );
      setYesMintPda(yesMintPda);
      setNoMintPda(noMintPda);
      setMessage("Outcome tokens successfully minted!");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to mint outcome tokens."
      );
    } finally {
      setMinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white">
        <h2 className="text-xl font-bold mb-4">Create New Market</h2>

        <label className="block mb-2">Asset:</label>
        <select
          value={asset}
          onChange={(e) => setAsset(parseInt(e.target.value))}
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value={1}>Bitcoin (BTC)</option>
          <option value={2}>Solana (SOL)</option>
          <option value={3}>Ethereum (ETH)</option>
        </select>

        <label className="block mt-4 mb-2">Strike Price:</label>
        <input
          type="number"
          value={strike}
          onChange={(e) => setStrike(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        {/* Expiry Time Input */}
        <label className="block mt-4 mb-2">
          Expiry Time (Standard Format):
        </label>
        <input
          type="datetime-local"
          value={expiryDate}
          onChange={handleExpiryChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />

        {/* On-Chain Time, Reload, and Tooltip - Fixed Layout */}
        <div className="flex items-center space-x-2 mt-2">
          <p className="text-gray-400 text-sm">
            Current On-Chain Time:{" "}
            {onchainTime
              ? new Date(onchainTime * 1000).toLocaleString()
              : "Loading..."}
          </p>

          {/* Reload Button */}
          <button
            onClick={fetchOnchainTime}
            className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-white flex items-center"
          >
            <AiOutlineReload className="text-lg" />
          </button>

          {/* Tooltip Button with Correct Positioning */}
          <div className="relative">
            <button
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              <AiOutlineQuestionCircle className="text-lg" />
            </button>

            {/* Tooltip Appears Right Next to Question Mark */}
            {tooltipVisible && (
              <div className="absolute top-0 left-full ml-2 w-64 bg-gray-700 text-white text-xs p-2 rounded-lg shadow-lg">
                On-chain time may slightly differ from real-world time due to
                network latency.
              </div>
            )}
          </div>
        </div>

        {/* Buttons Positioned Below */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleSubmit}
            className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            {loading ? "Creating Market..." : "Create Market"}
          </button>
          <button
            onClick={onClose}
            className="w-full p-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
        {/* ✅ Success Message */}
        {message && (
          <p className="mt-4 text-center text-yellow-400">{message}</p>
        )}

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
            <button
              onClick={() => copyToClipboard(marketPda.toString())}
              className="ml-2 p-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              📋 Copy
            </button>
          </div>
        )}

        {marketPda && (
          <button
            onClick={handleMintOutcomeTokens}
            className="w-full mt-4 p-2 bg-green-500 rounded hover:bg-green-600"
            disabled={minting}
          >
            {minting
              ? "Generating Outcome Tokens..."
              : "Generate Outcome Mints"}
          </button>
        )}

        {yesMintPda && noMintPda && (
          <div className="mt-4 text-center">
            <p className="text-green-400">Yes Mint PDA: </p>
            <a
              href={`https://explorer.solana.com/address/${yesMintPda}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              {yesMintPda.toString()}
            </a>

            <button
              onClick={() => copyToClipboard(yesMintPda.toString())}
              className="ml-2 p-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              📋 Copy
            </button>

            <p className="text-red-400 mt-2">No Mint PDA:</p>
            <a
              href={`https://explorer.solana.com/address/${noMintPda}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              {noMintPda.toString()}
            </a>

            <button
              onClick={() => copyToClipboard(noMintPda.toString())}
              className="ml-2 p-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              📋 Copy
            </button>
          </div>
        )}


      </div>
    </div>
  );
}
