'use client'

import React from 'react'
import Image from 'next/image'
import { ShieldCheck, HardDrive, Music2, Cpu, CheckCircle2, Layers } from 'lucide-react'

// Simple SVG Icons for OS
export function WindowsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <Image
      src="/icons8-windows-100.png"
      alt="Windows"
      width={24}
      height={24}
      className={`${className} object-contain inline-block`}
    />
  )
}

export function AppleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <Image
      src="/icons8-apple-100.png"
      alt="macOS"
      width={24}
      height={24}
      className={`${className} object-contain inline-block`}
    />
  )
}

export interface ProductTypeProps {
  product: {
    product_type?: string
    vst_format?: string
    supported_daws?: string
    operating_system?: string
    delivery_method?: string
    license_type?: string
    category_name?: string
    subcategory_name?: string
    name?: string
  }
}

// Helper to determine normalized format category
export function detectProductCategory(product: ProductTypeProps['product']): 'plugin' | 'sample_pack' | 'midi' | 'bundle' {
  const pType = (product.product_type || '').toLowerCase()
  const name = (product.name || '').toLowerCase()
  const cat = (product.category_name || '').toLowerCase()
  const subcat = (product.subcategory_name || '').toLowerCase()

  if (pType === 'plugin' || pType === 'vst' || pType === 'preset' || name.includes('vst') || name.includes('plugin') || name.includes('synth') || cat.includes('plugin')) {
    return 'plugin'
  }
  if (name.includes('midi') || cat.includes('midi') || subcat.includes('midi')) {
    return 'midi'
  }
  if (name.includes('bundle') || cat.includes('bundle') || subcat.includes('bundle')) {
    return 'bundle'
  }
  return 'sample_pack'
}

// Get Badge Format String (e.g. VST3, WAV, MIDI, BUNDLE)
export function getProductBadgeFormat(product: ProductTypeProps['product']): string {
  const cat = detectProductCategory(product)
  if (product.vst_format && product.vst_format.trim() !== '') {
    return product.vst_format.toUpperCase()
  }
  switch (cat) {
    case 'plugin':
      return 'VST3 / AU'
    case 'midi':
      return 'MIDI'
    case 'bundle':
      return 'BUNDLE'
    case 'sample_pack':
    default:
      return '24-BIT WAV'
  }
}

export function ProductSpecsOverview({ product }: ProductTypeProps) {
  const cat = detectProductCategory(product)
  const titleName = product.name || 'Product'

  return (
    <div className="space-y-4 pt-6">
      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
        {titleName} System Requirements
      </h3>

      <div className="bg-[#202020] rounded-2xl p-6 sm:p-8 space-y-6">
        
        {/* Platform Sub-Tab Indicator */}
        <div className="border-b border-[#333333]">
          <span className="text-sm font-bold text-white border-b-2 border-white pb-3 inline-block">
            {cat === 'plugin' ? 'Windows / macOS' : 'Universal DAW Format'}
          </span>
        </div>

        {/* 2-Column Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          
          {/* Column 1: Minimum / Core Specs */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-white tracking-wide">
              {cat === 'plugin' ? 'Minimum' : 'Specifications'}
            </h4>
            
            <div className="space-y-1">
              <span className="text-xs text-zinc-400 block">OS version</span>
              <span className="text-sm text-white font-medium">
                {cat === 'plugin' ? (product.operating_system || 'Windows 10 / macOS 10.15+') : 'Windows 7+ / macOS 10.12+'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-zinc-400 block">Format & Resolution</span>
              <span className="text-sm text-white font-medium">
                {cat === 'plugin' 
                  ? (product.vst_format || 'VST3 / AU / AAX') 
                  : '24-Bit / 44.1kHz WAV'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-zinc-400 block">License Type</span>
              <span className="text-sm text-white font-medium">
                {product.license_type || '100% Royalty-Free Commercial Use'}
              </span>
            </div>
          </div>

          {/* Column 2: Recommended / Compatibility */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-white tracking-wide">
              {cat === 'plugin' ? 'Recommended' : 'Compatibility'}
            </h4>
            
            <div className="space-y-1">
              <span className="text-xs text-zinc-400 block">Supported DAWs</span>
              <span className="text-sm text-white font-medium">
                {product.supported_daws || 'FL Studio, Ableton Live, Logic Pro, Pro Tools, Cubase'}
              </span>
            </div>

            {cat === 'plugin' && (
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block">Plugin Formats</span>
                <span className="text-sm text-white font-medium">
                  {product.vst_format || '64-Bit VST3, AU, AAX'}
                </span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}

// Render Compact Sidebar Badge Sub-Component
export function ProductSidebarBadge({ product }: ProductTypeProps) {
  const cat = detectProductCategory(product)
  const badgeText = getProductBadgeFormat(product)

  let title = 'Universal Studio Standard'
  let subtitle = '64-Bit DAW Compatible • Direct Delivery'

  if (cat === 'sample_pack') {
    title = '24-Bit Studio WAV Format'
    subtitle = 'Works in All DAWs • 100% Royalty Free'
  } else if (cat === 'midi') {
    title = 'Standard MIDI & Audio Demos'
    subtitle = 'Key & BPM Tagged • Instant Drag & Drop'
  } else if (cat === 'bundle') {
    title = 'Complete Producer Suite'
    subtitle = 'Universal DAW Support • Instant ZIP Download'
  }

  return (
    <div className="border border-[#262626] bg-[#161616] p-3.5 rounded-xl flex items-center gap-3.5">
      <div className="w-11 h-11 bg-[#222222] border border-[#333333] rounded-lg flex items-center justify-center font-extrabold text-[11px] text-white flex-shrink-0 tracking-tighter uppercase px-1 text-center">
        {badgeText}
      </div>
      <div>
        <span className="text-xs font-bold text-white block">{title}</span>
        <span className="text-[11px] text-zinc-400 block">{subtitle}</span>
      </div>
    </div>
  )
}
