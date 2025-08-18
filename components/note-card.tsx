"use client"

import { useState } from "react"
import { Calendar, Tag, Heart, Pin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { togglePinNote } from "@/lib/storage"

interface Note {
  id: string
  content: string
  tags: string[]
  createdAt: Date
  image?: string
  isPinned?: boolean
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
  const router = useRouter()

  const handleTogglePin = async (e: React.MouseEvent) => {
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

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsPressed(true)
    touchStartY = e.touches[0].clientY
    touchStartX = e.touches[0].clientX
    
    pressTimer = setTimeout(() => {
      onLongPress()
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // 如果用户移动了手指超过一定距离，取消长按
    if (pressTimer) {
      const touchY = e.touches[0].clientY
      const touchX = e.touches[0].clientX
      const deltaY = Math.abs(touchY - touchStartY)
      const deltaX = Math.abs(touchX - touchStartX)
      
      if (deltaY > 10 || deltaX > 10) {
        clearTimeout(pressTimer)
        pressTimer = null
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
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
    
    if (deltaY < 10 && deltaX < 10 && !isMultiSelect) {
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
      className={`note-card p-4 sm:p-6 cursor-pointer group touch-optimized card-touch ${
        isSelected ? "ring-2 ring-brand-primary shadow-2xl" : ""
      } ${isPressed ? "scale-95" : ""}`}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={isMultiSelect ? onSelect : undefined}
    >
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
                  : "bg-muted/50 dark:bg-muted/20 text-muted-foreground hover:bg-brand-primary/10"
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

      <div className="flex items-center justify-between">
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
            className={`transition-all duration-300 hover:scale-110 p-1 h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-brand-primary/10 ${
              note.isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <Pin
              className={`h-3 w-3 sm:h-4 sm:w-4 transition-all duration-300 ${
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
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 p-1 h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-brand-primary/10"
          >
            <Heart
              className={`h-3 w-3 sm:h-4 sm:w-4 transition-all duration-300 ${
                isLiked ? "fill-brand-primary text-brand-primary scale-110" : "text-muted-foreground hover:text-brand-primary"
              }`}
            />
          </Button>
        </div>
      </div>
    </Card>
  )
}
