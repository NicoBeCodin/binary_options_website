"use client";

import React, { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import CreateMarketModal from "./CreateMarketModal";
import LockFundsModal from "./LockFundsModal";
import ResolveMarketModal from './ResolveMarketModal';
import RedeemModal from "./RedeemModal";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  const [isCreateMarketModalOpen, setCreateMarketModalOpen] = useState(false);
  const [isLockFundsOpen, setLockFundsOpen] = useState(false);
  const [isResolveMarketOpen, setResolveMarketOpen] = useState(false);
  const [isRedeemOpen, setRedeemOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-gray-800 dark:bg-gray-900 text-white flex justify-between items-center px-6 py-3 shadow-lg z-50">
        {/* Navigation Links */}
        <div className="flex space-x-6">
          <a href="#wallet" className="hover:text-blue-400">
            Wallet
          </a>
          <a href="#markets" className="hover:text-blue-400">
            Markets
          </a>
          <button
            onClick={() => setCreateMarketModalOpen(true)}
            className="hover:text-blue-400"
          >
            Create Market
          </button>
          {/* Lock Funds Button */}
          <button
            onClick={() => setLockFundsOpen(true)}
            className="hover:text-green-400"
          >
            Lock Funds
          </button>
          {/* Resolve Market Button */}
          <button
            onClick={() => setResolveMarketOpen(true)}
            className="hover:text-red-400"
          >
            Resolve Market
          </button>
          <button onClick={() => setRedeemOpen(true)} className="hover:text-yellow-400">
                        Redeem Funds
                    </button>
        </div>

        {/* Wallet Button & Dark Mode Toggle */}
        <div className="flex items-center space-x-4">
          {/* Wallet Connection Button */}
          <WalletMultiButton className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white" />

          {/* Dark Mode Toggle (Smaller) */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-lg px-2 py-1 rounded-full bg-gray-700 hover:bg-gray-600"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>
      <CreateMarketModal
        isOpen={isCreateMarketModalOpen}
        onClose={() => setCreateMarketModalOpen(false)}
      />
      <LockFundsModal
        isOpen={isLockFundsOpen}
        onClose={() => setLockFundsOpen(false)}
      />
      <ResolveMarketModal isOpen={isResolveMarketOpen} onClose={() => setResolveMarketOpen(false)} />
      <RedeemModal isOpen={isRedeemOpen} onClose={() => setRedeemOpen(false)} />
    </>
  );
}
