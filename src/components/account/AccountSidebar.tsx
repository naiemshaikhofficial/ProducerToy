'use client'

import React from 'react'
import {
  User,
  Link2,
  Mail,
  Shield,
  FileText,
  CreditCard,
  Clock,
  Tag,
  Coins,
  Key,
  ChevronDown,
} from 'lucide-react'
import { ToywardsSparkleIcon } from './RewardsAndWalletTab'

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

interface AccountSidebarProps {
  activeTab: AccountTab
  onSelectTab: (tab: AccountTab) => void
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="bg-[#161616] border border-[#222222] rounded-[20px] p-4 sm:p-5 space-y-6 select-none">
      
      {/* Group 1: Account */}
      <div>
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
          Account
        </span>
        <div className="flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left w-full cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#242424] text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-zinc-400'}`} />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('linked_accounts')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left w-full cursor-pointer ${
              activeTab === 'linked_accounts'
                ? 'bg-[#242424] text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
            }`}
          >
            <Link2 className={`w-4 h-4 ${activeTab === 'linked_accounts' ? 'text-white' : 'text-zinc-400'}`} />
            <span>Linked accounts</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('communication')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left w-full cursor-pointer ${
              activeTab === 'communication'
                ? 'bg-[#242424] text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
            }`}
          >
            <Mail className={`w-4 h-4 ${activeTab === 'communication' ? 'text-white' : 'text-zinc-400'}`} />
            <span>Communication preferences</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('security')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left w-full cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#242424] text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeTab === 'security' ? 'text-white' : 'text-zinc-400'}`} />
            <span>Password and security</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('legal')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left w-full cursor-pointer ${
              activeTab === 'legal'
                ? 'bg-[#242424] text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'legal' ? 'text-white' : 'text-zinc-400'}`} />
            <span>Legal history</span>
          </button>
        </div>
      </div>

      {/* Group 2: Payment and rewards */}
      <div className="pt-2 border-t border-[#202020]">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
          Payment and rewards
        </span>
        <div className="flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => onSelectTab('payment')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left w-full cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-[#242424] text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
            }`}
          >
            <CreditCard className={`w-4 h-4 ${activeTab === 'payment' ? 'text-white' : 'text-zinc-400'}`} />
            <span>Payment settings</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('transactions')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left w-full cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-[#242424] text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className={`w-4 h-4 ${activeTab === 'transactions' ? 'text-white' : 'text-zinc-400'}`} />
              <span>Transactions</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('subscriptions')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left w-full cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'bg-[#242424] text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
            }`}
          >
            <Tag className={`w-4 h-4 ${activeTab === 'subscriptions' ? 'text-white' : 'text-zinc-400'}`} />
            <span>Subscriptions</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('currency')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left w-full cursor-pointer ${
              activeTab === 'currency'
                ? 'bg-[#242424] text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
            }`}
          >
            <Coins className={`w-4 h-4 ${activeTab === 'currency' ? 'text-white' : 'text-zinc-400'}`} />
            <span>In-game currency</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('rewards')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left w-full cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-[#242424] text-white font-semibold shadow-sm ring-1 ring-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
            }`}
          >
            <ToywardsSparkleIcon
              size={16}
              className={activeTab === 'rewards' ? 'text-white' : 'text-zinc-400'}
            />
            <span>Toywards</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('redeem')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left w-full cursor-pointer ${
              activeTab === 'redeem'
                ? 'bg-[#242424] text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
            }`}
          >
            <Key className={`w-4 h-4 ${activeTab === 'redeem' ? 'text-white' : 'text-zinc-400'}`} />
            <span>Redeem code</span>
          </button>
        </div>
      </div>

    </div>
  )
}
