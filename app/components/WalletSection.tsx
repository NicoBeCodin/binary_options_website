'use client'
import React, { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function WalletSection() {
  const { publicKey } = useWallet()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    if (publicKey) {
      setWalletAddress(publicKey.toBase58())
    } else {
      setWalletAddress(null)
    }
  }, [publicKey])

  return (
    <div className="flex flex-col items-center p-10 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
      <WalletMultiButton className="mt-4 bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg text-white" />
      {walletAddress && (
        <p className="mt-4 text-green-400">Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
      )}
    </div>
  )
}
