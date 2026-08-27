'use client'

import React, { useState } from 'react'
import {
  User,
  Link2,
  Mail,
  Shield,
  FileText,
  CreditCard,
  History,
  Tag,
  Coins,
  Sparkles,
  Key,
  Lock,
  ChevronDown,
  X,
} from 'lucide-react'
import { ToywardsIcon } from '@/components/ui/ToywardsIcon'
import { AccountTab } from './AccountSidebar'

interface MobileAccountBarProps {
  activeTab: AccountTab
  onSelectTab: (tab: AccountTab) => void
}

const TAB_CONFIG: Record<AccountTab, { label: string; icon: React.ReactNode }> = {
  settings: { label: 'Settings', icon: <User className="w-4 h-4 text-zinc-400" /> },
  linked_accounts: { label: 'Linked accounts', icon: <Link2 className="w-4 h-4 text-zinc-400" /> },
  communication: { label: 'Communication preferences', icon: <Mail className="w-4 h-4 text-zinc-400" /> },
  security: { label: 'Password and security', icon: <Shield className="w-4 h-4 text-zinc-400" /> },
  legal: { label: 'Legal history', icon: <FileText className="w-4 h-4 text-zinc-400" /> },
  payment: { label: 'Payment settings', icon: <CreditCard className="w-4 h-4 text-zinc-400" /> },
  transactions: { label: 'Transactions', icon: <History className="w-4 h-4 text-zinc-400" /> },
  subscriptions: { label: 'Subscriptions', icon: <Tag className="w-4 h-4 text-zinc-400" /> },
  currency: { label: 'In-game currency / Wallet', icon: <Coins className="w-4 h-4 text-zinc-400" /> },
  rewards: { label: 'Toywards (Rewards)', icon: <ToywardsIcon size={16} /> },
  redeem: { label: 'Redeem code', icon: <Key className="w-4 h-4 text-zinc-400" /> },
  parental: { label: 'Parental controls', icon: <Lock className="w-4 h-4 text-zinc-400" /> },
  programs: { label: 'Programs', icon: <Sparkles className="w-4 h-4 text-zinc-400" /> },
  publisher: { label: 'Publisher profile', icon: <FileText className="w-4 h-4 text-zinc-400" /> },
}

export const MobileAccountBar: React.FC<MobileAccountBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (tab: AccountTab) => {
    onSelectTab(tab)
    setIsOpen(false)
  }

  const currentConfig = TAB_CONFIG[activeTab] || TAB_CONFIG.settings

  return (
    <div className="lg:hidden w-full bg-[#121212] border-b border-[#202020] sticky top-[52px] sm:top-[58px] z-40">
      {/* Mobile Top Bar (Exact Screenshot 1 & 2 Match) */}
      <div className="w-full px-5 sm:px-8 h-[52px] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-white text-[15px] font-semibold cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            {currentConfig.icon}
            <span className="tracking-tight">{currentConfig.label}</span>
          </div>
          {isOpen ? (
            <X className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>
      </div>

      {/* Dropdown Menu (Exact Screenshot 2 Match) */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-[104px] sm:top-[110px] bg-black/75 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Floating Dropdown Overlay (Exact Epic Games Store Match) */}
          <div className="absolute top-full left-0 w-full z-50 bg-[#121212] border-b border-[#242424] shadow-2xl px-6 py-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Account Group */}
            <div>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
                Account
              </span>
              <div className="flex flex-col space-y-1">
                {(['settings', 'linked_accounts', 'communication', 'security', 'legal'] as AccountTab[]).map((tabKey) => {
                  const cfg = TAB_CONFIG[tabKey]
                  const isActive = activeTab === tabKey
                  return (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => handleSelect(tabKey)}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                        isActive
                          ? 'bg-[#222222] text-white font-bold'
                          : 'text-zinc-400 hover:text-white hover:bg-[#181818]'
                      }`}
                    >
                      {cfg.icon}
                      <span>{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Payment and Rewards Group */}
            <div className="pt-3 border-t border-[#1e1e1e]">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
                Payment and rewards
              </span>
              <div className="flex flex-col space-y-1">
                {(['payment', 'transactions', 'subscriptions', 'currency', 'rewards', 'redeem'] as AccountTab[]).map((tabKey) => {
                  const cfg = TAB_CONFIG[tabKey]
                  const isActive = activeTab === tabKey
                  return (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => handleSelect(tabKey)}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                        isActive
                          ? 'bg-[#222222] text-white font-bold'
                          : 'text-zinc-400 hover:text-white hover:bg-[#181818]'
                      }`}
                    >
                      {cfg.icon}
                      <span>{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Parental Controls */}
            <div className="pt-3 border-t border-[#1e1e1e]">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
                Parental controls
              </span>
              <button
                type="button"
                onClick={() => handleSelect('parental')}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                  activeTab === 'parental'
                    ? 'bg-[#222222] text-white font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-[#181818]'
                }`}
              >
                <Lock className="w-4 h-4 text-zinc-400" />
                <span>Parental controls</span>
              </button>
            </div>

            {/* Creator & Developer Tools */}
            <div className="pt-3 border-t border-[#1e1e1e]">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
                Creator & developer tools
              </span>
              <div className="flex flex-col space-y-1">
                {(['programs', 'publisher'] as AccountTab[]).map((tabKey) => {
                  const cfg = TAB_CONFIG[tabKey]
                  const isActive = activeTab === tabKey
                  return (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => handleSelect(tabKey)}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                        isActive
                          ? 'bg-[#222222] text-white font-bold'
                          : 'text-zinc-400 hover:text-white hover:bg-[#181818]'
                      }`}
                    >
                      {cfg.icon}
                      <span>{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
