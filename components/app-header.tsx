"use client"

import { Settings, Moon, Sun, CheckSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Link from "next/link"

interface AppHeaderProps {
  isMultiSelect: boolean
  selectedCount: number
  onMultiSelectToggle: () => void
}

export function AppHeader({ isMultiSelect, selectedCount, onMultiSelectToggle }: AppHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = () => {
    if (theme === "light") {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="gradient-header text-white px-3 sm:px-4 py-3 sm:py-4 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-base sm:text-lg font-serif font-black">纸</span>
          </div>
          <h1 className="text-lg sm:text-xl font-serif font-black">小纸条</h1>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {isMultiSelect ? (
            <>
              <span className="text-xs sm:text-sm font-medium">已选择 {selectedCount}</span>
              <Button variant="ghost" size="sm" onClick={onMultiSelectToggle} className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0">
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onMultiSelectToggle} className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0">
                <CheckSquare className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleThemeToggle} className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0">
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="h-4 w-4 hidden dark:block" />
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
