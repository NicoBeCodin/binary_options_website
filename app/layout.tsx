// app/layout.tsx
'use client';

import React from 'react';
import './globals.css'; // Adjust the path as necessary
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    // Configure the network and endpoint
    const network = 'devnet'; // or 'mainnet-beta', 'testnet'
    const endpoint = `https://api.${network}.solana.com`;

    // Configure the wallet(s) you want to support
    const wallets = [new PhantomWalletAdapter()];

    return (
        <html lang="en">
            <head>
                <title>My Solana App</title>
            </head>
            <body>
                <ConnectionProvider endpoint={endpoint}>
                    <WalletProvider wallets={wallets} autoConnect>
                        <WalletModalProvider>{children}</WalletModalProvider>
                    </WalletProvider>
                </ConnectionProvider>
            </body>
        </html>
    );
}
