"use client"

import { useState, useEffect } from 'react'

export function useBackground() {
  const [noteBackground, setNoteBackground] = useState<string | null>(null)

  useEffect(() => {
    // 设置一个默认的背景图片
    setNoteBackground('/beautiful-landscape.png')
  }, [])

  const setBackground = (background: string | null) => {
    setNoteBackground(background)
  }

  return {
    noteBackground,
    setBackground
  }
}