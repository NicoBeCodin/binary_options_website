'use client'
import React, { useState } from 'react'

export default function Markets() {
  const [markets] = useState([
    { id: '1', asset: 'SOL', strike: 100, expiry: '2025-02-10', status: 'Active' },
    { id: '2', asset: 'BTC', strike: 50000, expiry: '2025-02-15', status: 'Expired' },
  ])

  return (
    <div className="p-10 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Active Markets</h2>
      {markets.map((market) => (
        <div key={market.id} className="p-4 border border-gray-600 rounded-lg mb-4">
          <p><strong>Asset:</strong> {market.asset}</p>
          <p><strong>Strike Price:</strong> {market.strike}</p>
          <p><strong>Expiry:</strong> {market.expiry}</p>
          <p><strong>Status:</strong> <span className="text-green-400">{market.status}</span></p>
        </div>
      ))}
    </div>
  )
}
