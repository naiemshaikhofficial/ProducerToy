'use client'

import React from 'react'

export const LinkedAccountsTab: React.FC = () => {
  const accounts = [
    { name: 'Google', desc: 'Sign in with your Google account', connected: true },
    { name: 'GitHub', desc: 'Connect for developer tools & scripts', connected: false },
    { name: 'Discord', desc: 'Sync roles in ProducerToy Community', connected: false },
    { name: 'SoundCloud', desc: 'Import demo tracks and audio stems', connected: false },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Linked accounts
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Connect external accounts for seamless sign-in and cloud sound sync.
        </p>
      </div>

      <div className="space-y-3">
        {accounts.map((item) => (
          <div
            key={item.name}
            className="bg-[#181818] border border-[#242424] p-4 rounded-xl flex items-center justify-between"
          >
            <div>
              <h3 className="text-sm font-bold text-white">{item.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
            </div>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                item.connected
                  ? 'bg-[#2a2a2a] text-zinc-300 hover:text-[#ff4053] hover:bg-[#ff4053]/15'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {item.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
