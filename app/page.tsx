'use client'
import React, {useEffect, useState} from 'react'
import WalletSection from '@/components/WalletSection'
import Markets from '@/components/Markets'
import CreateMarket from '@/components/CreateMarket'
import './globals.css'; // Adjust the path as necessary

export default function Home() {
  const [darkMode, setDarkMode] = useState(true)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white flex justify-center p-4 shadow-lg z-50">
        <a href="#wallet" className="mx-4 hover:text-blue-400">Wallet</a>
        <a href="#markets" className="mx-4 hover:text-blue-400">Markets</a>
        <a href="#create-market" className="mx-4 hover:text-blue-400">Create Market</a>
        <button 
          onClick={toggleDarkMode} 
          className="ml-6 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </nav>

      {/* Sections */}
      <div className="pt-20">
        <section id="wallet" className="py-20 flex justify-center">
          <WalletSection />
        </section>

        <section id="markets" className="py-20">
          <Markets />
        </section>

        <section id="create-market" className="py-20">
          <CreateMarket />
        </section>
      </div>
    </div>
  )
}
