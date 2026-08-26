'use client'

import React from 'react'
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
} from 'lucide-react'

export type AccountTab =
  | 'settings'
  | 'linked_accounts'
  | 'communication'
  | 'security'
  | 'legal'
  | 'payment'
  | 'transactions'
  | 'subscriptions'
  | 'currency'
  | 'rewards'
  | 'redeem'
  | 'parental'
  | 'programs'
  | 'publisher'

interface AccountSidebarProps {
  activeTab: AccountTab
  onSelectTab: (tab: AccountTab) => void
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="bg-[#161616] border border-[#222222] rounded-[18px] p-5 space-y-6">
      {/* Group 1: Account */}
      <div>
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
          Account
        </span>
        <div className="flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <User className="w-4 h-4 text-zinc-400" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('linked_accounts')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'linked_accounts'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <Link2 className="w-4 h-4 text-zinc-400" />
            <span>Linked accounts</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('communication')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'communication'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <Mail className="w-4 h-4 text-zinc-400" />
            <span>Communication preferences</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('security')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>Password and security</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('legal')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'legal'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <FileText className="w-4 h-4 text-zinc-400" />
            <span>Legal history</span>
          </button>
        </div>
      </div>

      {/* Group 2: Payment and Rewards */}
      <div className="pt-2 border-t border-[#202020]">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
          Payment and rewards
        </span>
        <div className="flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => onSelectTab('payment')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-zinc-400" />
            <span>Payment settings</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('transactions')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-zinc-400" />
              <span>Transactions</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('subscriptions')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <Tag className="w-4 h-4 text-zinc-400" />
            <span>Subscriptions</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('currency')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'currency'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <Coins className="w-4 h-4 text-zinc-400" />
            <span>In-game currency / Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('rewards')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <span>Epic rewards</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('redeem')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'redeem'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <Key className="w-4 h-4 text-zinc-400" />
            <span>Redeem code</span>
          </button>
        </div>
      </div>

      {/* Group 3: Parental Controls */}
      <div className="pt-2 border-t border-[#202020]">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
          Parental controls
        </span>
        <button
          type="button"
          onClick={() => onSelectTab('parental')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
            activeTab === 'parental'
              ? 'bg-[#242424] text-white font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
          }`}
        >
          <Lock className="w-4 h-4 text-zinc-400" />
          <span>Parental controls</span>
        </button>
      </div>

      {/* Group 4: Creator & Developer Tools */}
      <div className="pt-2 border-t border-[#202020]">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
          Creator & developer tools
        </span>
        <div className="flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => onSelectTab('programs')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'programs'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <span>Programs</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('publisher')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
              activeTab === 'publisher'
                ? 'bg-[#242424] text-white font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <FileText className="w-4 h-4 text-zinc-400" />
            <span>Publisher profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
