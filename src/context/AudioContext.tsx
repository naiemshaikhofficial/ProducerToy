'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

interface AudioTrack {
  id: string
  name: string
  brand: string
  audioUrl: string
  coverImage?: string
}

interface AudioContextType {
  currentTrack: AudioTrack | null
  isPlaying: boolean
  playTrack: (track: AudioTrack) => void
  togglePlay: () => void
  stopTrack: () => void
  progress: number
  duration: number
  seek: (percent: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playTrack = (track: AudioTrack) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
      return
    }

    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current
    audio.src = track.audioUrl
    audio.load()

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0)
    }

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    audio.onended = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.play()
      .then(() => {
        setCurrentTrack(track)
        setIsPlaying(true)
      })
      .catch((err) => {
        console.error('Audio play error:', err)
      })
  }

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio resume error:', err))
    }
  }

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setProgress(0)
  }

  const seek = (percent: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const targetTime = (percent / 100) * audioRef.current.duration
      audioRef.current.currentTime = targetTime
      setProgress(percent)
    }
  }

  return (
    <AudioContext.Provider value={{ currentTrack, isPlaying, playTrack, togglePlay, stopTrack, progress, duration, seek }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) throw new Error('useAudio must be used within AudioProvider')
  return context
}
