"use client"

import { useState, useEffect } from 'react'

interface BackgroundSettings {
  homeBackground: string | null
  noteBackground: string | null
}

export function useBackground() {
  const [homeBackground, setHomeBackground] = useState<string | null>(null)
  const [noteBackground, setNoteBackground] = useState<string | null>(null)

  // 加载背景设置
  useEffect(() => {
    const loadBackgrounds = () => {
      try {
        const savedSettings = localStorage.getItem('userSettings')
        const savedBackgrounds = localStorage.getItem('backgroundSettings')
        
        // 从userSettings中加载（兼容旧版本）
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          if (settings.homeBackground) {
            setHomeBackground(settings.homeBackground)
          }
          if (settings.noteBackground) {
            setNoteBackground(settings.noteBackground)
          }
        }
        
        // 从backgroundSettings中加载（新版本）
        if (savedBackgrounds) {
          const backgrounds: BackgroundSettings = JSON.parse(savedBackgrounds)
          setHomeBackground(backgrounds.homeBackground)
          setNoteBackground(backgrounds.noteBackground)
        }
      } catch (error) {
        console.error('Failed to load background settings:', error)
      }
    }

    loadBackgrounds()

    // 监听storage变化，支持多标签页同步
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSettings' || e.key === 'backgroundSettings') {
        loadBackgrounds()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 设置主页背景
  const setHomeBackgroundImage = (imageData: string | null) => {
    try {
      const savedBackgrounds = localStorage.getItem('backgroundSettings')
      const backgrounds: BackgroundSettings = savedBackgrounds 
        ? JSON.parse(savedBackgrounds)
        : { homeBackground: null, noteBackground: null }
      
      backgrounds.homeBackground = imageData
      localStorage.setItem('backgroundSettings', JSON.stringify(backgrounds))
      setHomeBackground(imageData)

      // 同时更新userSettings以保持兼容性
      const savedSettings = localStorage.getItem('userSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        settings.homeBackground = imageData || undefined
        localStorage.setItem('userSettings', JSON.stringify(settings))
      }
    } catch (error) {
      console.error('Failed to save home background:', error)
    }
  }

  // 设置笔记页背景
  const setNoteBackgroundImage = (imageData: string | null) => {
    try {
      const savedBackgrounds = localStorage.getItem('backgroundSettings')
      const backgrounds: BackgroundSettings = savedBackgrounds 
        ? JSON.parse(savedBackgrounds)
        : { homeBackground: null, noteBackground: null }
      
      backgrounds.noteBackground = imageData
      localStorage.setItem('backgroundSettings', JSON.stringify(backgrounds))
      setNoteBackground(imageData)

      // 同时更新userSettings以保持兼容性
      const savedSettings = localStorage.getItem('userSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        settings.noteBackground = imageData || undefined
        localStorage.setItem('userSettings', JSON.stringify(settings))
      }
    } catch (error) {
      console.error('Failed to save note background:', error)
    }
  }

  // 清除主页背景
  const clearHomeBackground = () => {
    setHomeBackgroundImage(null)
  }

  // 清除笔记页背景
  const clearNoteBackground = () => {
    setNoteBackgroundImage(null)
  }

  // 清除所有背景
  const clearAllBackgrounds = () => {
    setHomeBackgroundImage(null)
    setNoteBackgroundImage(null)
  }

  return {
    homeBackground,
    noteBackground,
    setHomeBackgroundImage,
    setNoteBackgroundImage,
    clearHomeBackground,
    clearNoteBackground,
    clearAllBackgrounds
  }
}