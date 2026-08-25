'use client'

import React from 'react'
import Image from 'next/image'
import { Play, Pause, Square, Music, Volume2 } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'
import { LogoIcon } from '@/components/Logo'

export function AudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, stopTrack, progress, duration, seek } = useAudio()

  if (!currentTrack) return null

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const currentTime = (progress / 100) * duration

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] text-white border-t border-[#202020] shadow-2xl backdrop-blur-xl">
      
      {/* Monochrome Progress Bar (Clickable) */}
      <div
        className="w-full bg-[#202025] h-1.5 cursor-pointer relative group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const percent = (clickX / rect.width) * 100
          seek(percent)
        }}
      >
        <div
          className="bg-white h-full transition-all duration-75 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border border-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Track Thumbnail & Info */}
        <div className="flex items-center gap-3 min-w-0 max-w-[40%]">
          <div className="w-10 h-10 bg-[#202020] border border-[#2a2a2a] rounded-md relative flex-shrink-0 overflow-hidden">
            {currentTrack.coverImage ? (
              <Image
                src={currentTrack.coverImage}
                alt={currentTrack.name}
                fill
                className="object-cover"
              />
            ) : (
              <Music className="w-5 h-5 text-zinc-400 absolute inset-0 m-auto" />
            )}
          </div>

          <div className="min-w-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider line-clamp-1">
              {currentTrack.brand}
            </div>
            <div className="text-xs font-bold text-white line-clamp-1">
              {currentTrack.name}
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-white text-black font-bold rounded-full flex items-center justify-center border border-white hover:bg-zinc-200 transition-colors shadow-md"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black translate-x-0.5" />
            )}
          </button>

          <button
            onClick={stopTrack}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Stop audio"
          >
            <Square className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume / Audition Status */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400">
          <LogoIcon size={18} />
          <span className="text-white font-bold tracking-wider">PRODUCER TOY PLAYER</span>
        </div>

      </div>
    </div>
  )
}
