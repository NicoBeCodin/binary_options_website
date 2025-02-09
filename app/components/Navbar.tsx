'use client';

import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface NavbarProps {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
    return (
        <nav className="fixed top-0 left-0 w-full bg-gray-800 dark:bg-gray-900 text-white flex justify-between items-center px-6 py-3 shadow-lg z-50">
            {/* Navigation Links */}
            <div className="flex space-x-6">
                <a href="#wallet" className="hover:text-blue-400">Wallet</a>
                <a href="#markets" className="hover:text-blue-400">Markets</a>
                <a href="#create-market" className="hover:text-blue-400">Create Market</a>
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
                    {darkMode ? '☀️' : '🌙'}
                </button>
            </div>
        </nav>
    );
}
