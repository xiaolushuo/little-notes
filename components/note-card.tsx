"use client"

import { useState, useEffect } from "react"
import { Calendar, Tag, Heart, Pin, Clock, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { togglePinNote, getNoteTimeStatus, type TimeStatus } from "@/lib/storage"

interface Note {
  id: string
  content: string
  tags: string[]
  createdAt: Date
  image?: string
  isPinned?: boolean
  expirationDate?: Date
}

interface NoteCardProps {
  note: Note
  isSelected: boolean
  isMultiSelect: boolean
  onSelect: () => void
  onLongPress: () => void
  refreshNotes: () => void
  index?: number
}

export function NoteCard({ note, isSelected, isMultiSelect, onSelect, onLongPress, refreshNotes, index = 0 }: NoteCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [timeStatus, setTimeStatus] = useState<TimeStatus | null>(null)
  const router = useRouter()

  // 更新倒计时状态
  useEffect(() => {
    const updateTimeStatus = () => {
      const status = getNoteTimeStatus(note)
      setTimeStatus(status)
    }

    updateTimeStatus()
    
    // 如果有到期时间，每秒更新一次倒计时
    let interval: NodeJS.Timeout | null = null
    if (note.expirationDate) {
      interval = setInterval(updateTimeStatus, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [note.expirationDate])

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await togglePinNote(note.id)
      refreshNotes()
    } catch (error) {
      console.error("Error toggling pin:", error)
    }
  }

  // 移动端触摸事件处理
  let pressTimer: NodeJS.Timeout | null = null
  let touchStartY = 0
  let touchStartX = 0
  let lastTouchY = 0
  let isScrolling = false

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPressed(true)
    touchStartY = e.touches[0].clientY
    touchStartX = e.touches[0].clientX
    lastTouchY = touchStartY
    isScrolling = false
    
    pressTimer = setTimeout(() => {
      if (!isScrolling) {
        onLongPress()
      }
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY
    const touchX = e.touches[0].clientX
    const deltaY = Math.abs(touchY - touchStartY)
    const deltaX = Math.abs(touchX - touchStartX)
    const scrollDeltaY = Math.abs(touchY - lastTouchY)
    
    // 检测是否在滚动
    if (scrollDeltaY > 5) {
      isScrolling = true
    }
    
    // 如果用户移动了手指超过一定距离，取消长按
    if (pressTimer && (deltaY > 15 || deltaX > 15)) {
      clearTimeout(pressTimer)
      pressTimer = null
    }
    
    lastTouchY = touchY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pressTimer) {
      clearTimeout(pressTimer)
      pressTimer = null
    }
    setIsPressed(false)
    
    // 只有在没有移动的情况下才触发导航
    const touchEndY = e.changedTouches[0].clientY
    const touchEndX = e.changedTouches[0].clientX
    const deltaY = Math.abs(touchEndY - touchStartY)
    const deltaX = Math.abs(touchEndX - touchStartX)
    
    if (deltaY < 10 && deltaX < 10 && !isMultiSelect && !isScrolling) {
      router.push(`/note/${note.id}`)
    }
  }

  const handleMouseDown = () => {
    setIsPressed(true)
    const timer = setTimeout(() => {
      onLongPress()
    }, 500)

    const handleMouseUp = () => {
      clearTimeout(timer)
      setIsPressed(false)
      if (!isMultiSelect) {
        router.push(`/note/${note.id}`)
      }
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <Card
      className={`note-card p-4 sm:p-6 cursor-pointer group touch-optimized select-none ${
        isSelected ? "ring-2 ring-brand-primary shadow-lg" : ""
      } ${isPressed ? "scale-98 opacity-90" : ""}`}
      style={{
        animationDelay: `${index * 100}ms`,
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        transition: 'transform 0.15s ease, opacity 0.15s ease, box-shadow 0.2s ease',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={isMultiSelect ? onSelect : undefined}
    >
      {/* 时间状态指示器 */}
      {timeStatus && (
        <div className={`mb-3 sm:mb-4 p-3 rounded-lg transition-all duration-300 ${
          timeStatus.isExpired 
            ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800' 
            : timeStatus.isUrgent 
              ? 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
              : timeStatus.isWarning 
                ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800'
                : 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
        }`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              <div className="mr-2">
                {timeStatus.isExpired ? <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" /> : 
                 timeStatus.isUrgent ? <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" /> : 
                 timeStatus.isWarning ? <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" /> : 
                 <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />}
              </div>
              <div>
                <div className="font-semibold text-sm">
                  {timeStatus.isExpired ? '已过期' : 
                   timeStatus.isUrgent ? '即将到期' : 
                   timeStatus.isWarning ? '需要注意' : '正常进行'}
                </div>
              </div>
            </div>
            {timeStatus.isCountingDown && (
              <div className={`text-xs font-mono font-medium px-2 py-1 rounded ${
                timeStatus.isExpired ? 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-200' : 
                timeStatus.isUrgent ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-200' : 
                timeStatus.isWarning ? 'bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-200' : 
                'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-200'
              }`}>
                {timeStatus.timeLeftText}
              </div>
            )}
          </div>
          
          {timeStatus.isCountingDown && (
            <div className={`text-xs px-2 py-1 rounded ${
              timeStatus.isExpired ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 
              timeStatus.isUrgent ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 
              timeStatus.isWarning ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' : 
              'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            }`}>
              剩余时间: {timeStatus.detailedText}
            </div>
          )}
        </div>
      )}

      {isMultiSelect && (
        <div className="mb-3 sm:mb-4 animate-in slide-in-from-top-2 duration-300">
          <Checkbox checked={isSelected} onChange={onSelect} />
        </div>
      )}

      {note.image && (
        <div className="mb-3 sm:mb-4 rounded-xl overflow-hidden group-hover:shadow-lg transition-all duration-500">
          <img
            src={note.image || "/placeholder.svg"}
            alt="Note attachment"
            className="w-full h-28 sm:h-36 object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <p className="text-foreground font-sans leading-relaxed mb-3 sm:mb-4 transition-colors duration-300 text-sm sm:text-base">
        {note.content}
      </p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {note.tags.map((tag, tagIndex) => (
            <Badge
              key={tag}
              variant="secondary"
              className={`badge-modern cursor-pointer ${
                false 
                  ? "gradient-primary text-white shadow-lg" 
                  : "bg-muted/60 dark:bg-muted/30 text-muted-foreground hover:bg-brand-primary/20 dark:hover:bg-brand-primary/20"
              }`}
              style={{
                animationDelay: `${index * 100 + tagIndex * 50}ms`,
              }}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center text-xs text-muted-foreground transition-colors duration-300">
          <Calendar className="h-3 w-3 mr-1" />
          {note.createdAt.toLocaleDateString("zh-CN")}
        </div>

        <div className="flex items-center space-x-1">
          {/* 置顶按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTogglePin}
            className={`transition-all duration-150 ease-out hover:scale-105 active:scale-95 p-1 h-8 w-8 sm:h-8 sm:w-8 rounded-lg hover:bg-brand-primary/10 ${
              note.isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            style={{ 
              touchAction: 'manipulation',
              transition: 'transform 0.15s ease-out, opacity 0.15s ease-out, background-color 0.15s ease-out'
            }}
          >
            <Pin
              className={`h-4 w-4 transition-all duration-200 ease-out ${
                note.isPinned 
                  ? "fill-brand-primary text-brand-primary scale-110" 
                  : "text-muted-foreground hover:text-brand-primary"
              }`}
            />
          </Button>

          {/* 点赞按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
            className="opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out hover:scale-105 active:scale-95 p-1 h-8 w-8 sm:h-8 sm:w-8 rounded-lg hover:bg-brand-primary/10"
            style={{ 
              touchAction: 'manipulation',
              transition: 'transform 0.15s ease-out, opacity 0.15s ease-out, background-color 0.15s ease-out'
            }}
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ease-out ${
                isLiked ? "fill-brand-primary text-brand-primary scale-110" : "text-muted-foreground hover:text-brand-primary"
              }`}
            />
          </Button>
        </div>
      </div>
    </Card>
  )
}
