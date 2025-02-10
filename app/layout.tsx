'use client';

import React, { useState, useEffect } from 'react';
import './globals.css'; // Ensure this is correct
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import Navbar from '@/components/Navbar'
import '@solana/wallet-adapter-react-ui/styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const network = 'devnet'; // or 'mainnet-beta', 'testnet'
    const endpoint = `https://api.${network}.solana.com`;

    const wallets = [new PhantomWalletAdapter()];

    // Dark mode state (stored in localStorage)
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setDarkMode(storedTheme === 'dark');
        }
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <html lang="en">
            <head>
                <title>My Binary Options App</title>
            </head>
            <body className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'}`}>
                <ConnectionProvider endpoint={endpoint}>
                    <WalletProvider wallets={wallets} autoConnect>
                        <WalletModalProvider>
                            {/* Pass darkMode state to Navbar */}
                            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                            {children}
                        </WalletModalProvider>
                    </WalletProvider>
                </ConnectionProvider>
            </body>
        </html>
    );
}
