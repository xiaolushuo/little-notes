"use client"

import { useState, useEffect } from 'react'

export interface ThemeConfig {
  id: string
  name: string
  description: string
  preview: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
  }
  fonts: {
    primary: string
    secondary: string
  }
  backgrounds: {
    home?: string
    notes?: string
    pattern?: string
  }
  styles: {
    borderRadius: string
    shadow: string
    animation: string
  }
}

export const themes: ThemeConfig[] = [
  {
    id: 'crayon',
    name: '蜡笔小新',
    description: '活泼可爱的蜡笔风格',
    preview: '/crayon-preview.png',
    colors: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      accent: '#ffeb3b',
      background: '#fff8e1',
      surface: '#ffffff',
      text: '#5d4037',
      textSecondary: '#8d6e63',
      border: '#ffcc02'
    },
    fonts: {
      primary: '"Comic Sans MS", "Marker Felt", "Chalkboard", cursive',
      secondary: 'Arial, sans-serif'
    },
    backgrounds: {
      pattern: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
      home: '/crayon-background.jpg',
      notes: '/crayon-background.jpg'
    },
    styles: {
      borderRadius: '16px',
      shadow: '0 8px 16px rgba(255, 107, 53, 0.2)',
      animation: 'none'
    }
  },
  {
    id: 'sakura',
    name: '魔法小樱',
    description: '梦幻浪漫的樱花风格',
    preview: '/sakura-preview.png',
    colors: {
      primary: '#ff69b4',
      secondary: '#ff1493',
      accent: '#ffb6c1',
      background: '#fef7f7',
      surface: '#ffffff',
      text: '#8b008b',
      textSecondary: '#da70d6',
      border: '#ffc0cb'
    },
    fonts: {
      primary: '"Georgia", "Times New Roman", serif',
      secondary: 'Arial, sans-serif'
    },
    backgrounds: {
      pattern: 'linear-gradient(135deg, #fef7f7 0%, #fce4ec 100%)',
      home: '/sakura-background.jpg',
      notes: '/sakura-background.jpg'
    },
    styles: {
      borderRadius: '18px',
      shadow: '0 10px 20px rgba(255, 105, 180, 0.15)',
      animation: 'none'
    }
  }
]

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themes[0])

  useEffect(() => {
    // 最简单的主题加载
    if (typeof window !== 'undefined') {
      try {
        const savedThemeId = localStorage.getItem('selectedTheme')
        if (savedThemeId) {
          const theme = themes.find(t => t.id === savedThemeId)
          if (theme) {
            setCurrentTheme(theme)
            applyTheme(theme)
          } else {
            // 如果保存的主题不存在，应用默认主题
            applyTheme(themes[0])
          }
        } else {
          // 如果没有保存的主题，应用默认主题
          applyTheme(themes[0])
        }
      } catch (error) {
        // 静默处理错误，但确保应用默认主题
        applyTheme(themes[0])
      }
    }
  }, [])

  const applyTheme = (theme: ThemeConfig) => {
    // 确保在客户端执行
    if (typeof window === 'undefined') return
    
    // 移除 next-themes 的主题类，避免冲突
    document.body.classList.remove('light', 'dark')
    
    // Remove existing theme classes
    document.body.classList.remove('theme-crayon', 'theme-sakura', 'theme-ocean-breeze', 'theme-forest-calm', 'theme-sunset-warm', 'theme-lavender-dream', 'theme-midnight-dark')
    
    // Add new theme class
    document.body.classList.add(`theme-${theme.id}`)
    
    // Apply CSS custom properties
    const root = document.documentElement
    root.style.setProperty('--theme-primary', theme.colors.primary)
    root.style.setProperty('--theme-secondary', theme.colors.secondary)
    root.style.setProperty('--theme-accent', theme.colors.accent)
    root.style.setProperty('--theme-background', theme.colors.background)
    root.style.setProperty('--theme-surface', theme.colors.surface)
    root.style.setProperty('--theme-text', theme.colors.text)
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--theme-border', theme.colors.border)
    root.style.setProperty('--theme-font-primary', theme.fonts.primary)
    root.style.setProperty('--theme-font-secondary', theme.fonts.secondary)
    root.style.setProperty('--theme-border-radius', theme.styles.borderRadius)
    root.style.setProperty('--theme-shadow', theme.styles.shadow)
    root.style.setProperty('--theme-animation', theme.styles.animation)
    
    // Apply background patterns
    if (theme.backgrounds.pattern) {
      root.style.setProperty('--theme-bg-pattern', theme.backgrounds.pattern)
    }
    if (theme.backgrounds.home) {
      root.style.setProperty('--theme-bg-home', `url('${theme.backgrounds.home}')`)
    }
    if (theme.backgrounds.notes) {
      root.style.setProperty('--theme-bg-notes', `url('${theme.backgrounds.notes}')`)
    }
    
    // Apply custom icon settings if they exist
    try {
      const customThemeSettings = localStorage.getItem(`customTheme_${theme.id}`)
      if (customThemeSettings) {
        const customTheme = JSON.parse(customThemeSettings)
        if (customTheme.customIcons && customTheme.customIcons.enabled) {
          root.style.setProperty('--theme-icon-set', customTheme.customIcons.iconSet)
          // Add icon-specific classes to body
          document.body.classList.remove('icons-default', 'icons-cute', 'icons-minimal', 'icons-colorful', 'icons-outline')
          document.body.classList.add(`icons-${customTheme.customIcons.iconSet}`)
        } else {
          root.style.setProperty('--theme-icon-set', 'default')
          document.body.classList.remove('icons-default', 'icons-cute', 'icons-minimal', 'icons-colorful', 'icons-outline')
          document.body.classList.add('icons-default')
        }
      }
    } catch (error) {
      console.error('Failed to apply custom icon settings:', error)
      // Fallback to default icons
      root.style.setProperty('--theme-icon-set', 'default')
      document.body.classList.remove('icons-default', 'icons-cute', 'icons-minimal', 'icons-colorful', 'icons-outline')
      document.body.classList.add('icons-default')
    }
  }

  const setTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme)
    applyTheme(theme)
    
    // 确保在客户端执行
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('selectedTheme', theme.id)
      } catch (error) {
        console.error('Failed to save theme:', error)
      }
    }
  }

  const resetTheme = () => {
    setTheme(themes[0])
  }

  return {
    currentTheme,
    themes,
    setTheme,
    resetTheme
  }
}