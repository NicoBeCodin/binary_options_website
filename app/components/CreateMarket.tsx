'use client'
import React, { useState } from 'react'

export default function CreateMarket() {
  const [asset, setAsset] = useState('')
  const [strike, setStrike] = useState('')
  const [expiry, setExpiry] = useState('')

  const handleCreateMarket = () => {
    console.log('Creating market:', { asset, strike, expiry })
  }

  return (
    <div className="p-10 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Create a New Market</h2>
      <input 
        type="text" 
        placeholder="Asset (e.g., SOL)" 
        value={asset} 
        onChange={(e) => setAsset(e.target.value)}
        className="w-full mb-2 p-2 rounded bg-gray-700 text-white"
      />
      <input 
        type="number" 
        placeholder="Strike Price" 
        value={strike} 
        onChange={(e) => setStrike(e.target.value)}
        className="w-full mb-2 p-2 rounded bg-gray-700 text-white"
      />
      <input 
        type="date" 
        value={expiry} 
        onChange={(e) => setExpiry(e.target.value)}
        className="w-full mb-2 p-2 rounded bg-gray-700 text-white"
      />
      <button 
        onClick={handleCreateMarket} 
        className="w-full p-2 bg-blue-500 rounded-lg hover:bg-blue-600 text-white font-bold"
      >
        Create Market
      </button>
    </div>
  )
}
