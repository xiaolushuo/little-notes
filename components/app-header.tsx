"use client"

import { CheckSquare, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import Link from "next/link"

interface AppHeaderProps {
  isMultiSelect: boolean
  selectedCount: number
  onMultiSelectToggle: () => void
}

export function AppHeader({ isMultiSelect, selectedCount, onMultiSelectToggle }: AppHeaderProps) {
  return (
    <header className="gradient-header text-white px-3 sm:px-4 py-3 sm:py-4 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 glass-morphism rounded-xl flex items-center justify-center float-animation">
            <span className="text-base sm:text-lg font-serif font-black">纸</span>
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-serif font-black">小纸条</h1>
            <Sparkles className="h-4 w-4 text-white/80 pulse-animation" />
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {isMultiSelect ? (
            <>
              <div className="glass-morphism px-3 py-1 rounded-full">
                <span className="text-xs sm:text-sm font-medium">已选择 <span className="font-bold">{selectedCount}</span></span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMultiSelectToggle} 
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMultiSelectToggle} 
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
