"use client"

import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from "react"
import { Plus, Filter, X, Search, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { NoteCard } from "@/components/note-card"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import Link from "next/link"
import { getNotes, deleteNotes, togglePinNote, type Note } from "@/lib/storage"

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showTagFilter, setShowTagFilter] = useState(true) // 默认显示标签筛选
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(true) // 默认显示搜索框
  const [isClient, setIsClient] = useState(false)
  
  // 手势相关状态
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  // 客户端检测和加载笔记
  useEffect(() => {
    setIsClient(true)
    loadNotes()
  }, [])

  // 加载笔记数据
  const loadNotes = () => {
    try {
      const savedNotes = getNotes()
      setNotes(savedNotes)
    } catch (error) {
      console.error("Error loading notes:", error)
      setNotes([])
    } finally {
      setIsLoading(false)
    }
  }

  // 刷新笔记数据
  const refreshNotes = useCallback(() => {
    loadNotes()
  }, [])

  // 手势处理函数
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchStartY(e.touches[0].clientY)
    setIsSwiping(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return

    const touchEndX = e.touches[0].clientX
    const touchEndY = e.touches[0].clientY
    const deltaX = touchEndX - touchStartX
    const deltaY = touchEndY - touchStartY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // 检测是否为横向滑动
    if (absDeltaX > absDeltaY && absDeltaX > 50) {
      setIsSwiping(true)
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY || !isSwiping) return

    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchEndX - touchStartX

    // 左滑清空搜索和筛选
    if (deltaX < -100) {
      clearSearch()
      clearTagFilter()
    }
    // 右滑显示搜索框
    else if (deltaX > 100) {
      // 可以在这里添加其他功能
    }

    // 重置状态
    setTouchStartX(0)
    setTouchStartY(0)
    setIsSwiping(false)
  }

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach((note) => {
      note.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [notes])

  const filteredNotes = useMemo(() => {
    let filtered = notes

    if (selectedTags.length > 0) {
      filtered = filtered.filter((note) => selectedTags.some((tag) => note.tags.includes(tag)))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (note) =>
          note.content.toLowerCase().includes(query) || note.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    return filtered
  }, [notes, selectedTags, searchQuery])

  // 添加键盘快捷键支持（仅在客户端）
  useEffect(() => {
    if (!isClient) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F: 聚焦搜索框
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder="搜索笔记内容或标签..."]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
      // Escape: 清除搜索和标签筛选
      if (e.key === 'Escape') {
        clearSearch()
        clearTagFilter()
      }
      // Ctrl/Cmd + A: 全选
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        if (isMultiSelect) {
          setSelectedNotes(filteredNotes.map(note => note.id))
        }
      }
      // Delete: 删除选中的笔记
      if (e.key === 'Delete' && selectedNotes.length > 0) {
        e.preventDefault()
        try {
          deleteNotes(selectedNotes)
          setSelectedNotes([])
          setIsMultiSelect(false)
          refreshNotes()
        } catch (error) {
          console.error("Error deleting notes:", error)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isClient, isMultiSelect, selectedNotes, filteredNotes])

  const handleNoteSelect = useCallback((noteId: string) => {
    if (isMultiSelect) {
      setSelectedNotes((prev) => (prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]))
    }
  }, [isMultiSelect])

  const handleLongPress = useCallback((noteId: string) => {
    setIsMultiSelect(true)
    setSelectedNotes([noteId])
  }, [])

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }, [])

  const clearTagFilter = useCallback(() => {
    setSelectedTags([])
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setShowSearch(false)
  }, [])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div 
      className="min-h-screen flex flex-col safe-area-top relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      <AppHeader
        isMultiSelect={isMultiSelect}
        selectedCount={selectedNotes.length}
        onMultiSelectToggle={() => {
          setIsMultiSelect(!isMultiSelect)
          setSelectedNotes([])
        }}
      />

      <main className="flex-1 px-2 sm:px-4 py-3 sm:py-6 safe-area-bottom smooth-scroll relative">
        <div className="max-w-md mx-auto space-y-2 sm:space-y-4 mobile-spacing-y-2 pb-20">
          {/* 搜索框 - 始终显示 */}
          <div className="animate-in slide-in-from-top-3 duration-300 ease-out">
            <div className="relative">
              <Input
                placeholder="搜索笔记内容或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-modern pl-10 pr-8 h-12 sm:h-16 text-sm sm:text-base shadow-2xl"
                enterKeyHint="search"
                inputMode="search"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-primary pointer-events-none" />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-brand-primary/10 transition-all duration-200 ease-out rounded-lg"
                >
                  <X className="h-3 w-3 text-brand-primary" />
                </Button>
              )}
            </div>
          </div>

          {/* 标签筛选 - 始终显示在搜索框下方 */}
          <div className="animate-in slide-in-from-top-4 duration-300 ease-out">
            <div className="glass-card p-4 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-sm font-semibold text-foreground flex items-center">
                  <span className="w-3 h-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full mr-2 float-animation"></span>
                  标签筛选
                </span>
                {(selectedTags.length > 0 || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearTagFilter()
                      clearSearch()
                    }}
                    className="text-muted-foreground hover:text-foreground h-7 px-3 text-xs font-medium transition-all duration-200 ease-out hover:bg-brand-primary/10 rounded-lg"
                  >
                    <X className="h-3 w-3 mr-1" />
                    清除
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "secondary"}
                    className={`badge-modern cursor-pointer text-xs sm:text-sm transition-all duration-200 ease-out ${
                      selectedTags.includes(tag)
                        ? "gradient-primary text-white shadow-lg"
                        : "bg-muted/60 dark:bg-muted/30 text-muted-foreground hover:bg-brand-primary/20 dark:hover:bg-brand-primary/20"
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && <X className="h-2.5 w-2.5 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {isMultiSelect && selectedNotes.length > 0 && (
            <div className="glass-card p-3 sm:p-6 animate-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">
                    已选择 <span className="gradient-primary bg-clip-text text-transparent font-bold">{selectedNotes.length}</span> 个笔记
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (快捷键: Delete 删除, Ctrl+A 全选)
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    try {
                      deleteNotes(selectedNotes)
                      setSelectedNotes([])
                      setIsMultiSelect(false)
                      refreshNotes()
                    } catch (error) {
                      console.error("Error deleting notes:", error)
                    }
                  }}
                  className="btn-modern gradient-destructive text-white text-xs self-end sm:self-auto h-8 px-4"
                >
                  删除选中
                </Button>
              </div>
            </div>
          )}

          {(selectedTags.length > 0 || searchQuery) && (
            <div className="flex flex-wrap gap-1.5 p-3 glass-card animate-in slide-in-from-left-3 duration-400">
              {searchQuery && (
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground font-medium mr-2">搜索:</span>
                  <Badge
                    variant="secondary"
                    className="badge-modern gradient-primary text-white cursor-pointer text-xs"
                    onClick={clearSearch}
                  >
                    {searchQuery}
                    <X className="h-2.5 w-2.5 ml-1" />
                  </Badge>
                </div>
              )}

              {selectedTags.length > 0 && (
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="text-sm text-muted-foreground font-medium">标签:</span>
                  {selectedTags.map((tag, index) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="badge-modern gradient-secondary text-white cursor-pointer text-xs"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      <X className="h-2.5 w-2.5 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {(selectedTags.length > 0 || searchQuery) && (
            <div className="text-sm text-muted-foreground text-center animate-in fade-in duration-500">
              找到 <span className="font-semibold gradient-primary bg-clip-text text-transparent">{filteredNotes.length}</span> 条相关小纸条
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            {/* 置顶笔记 */}
            {filteredNotes.filter(note => note.isPinned).map((note, index) => (
              <div
                key={`pinned-${note.id}`}
                className="animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                      <Pin className="h-3 w-3" />
                      <span>置顶</span>
                    </div>
                  </div>
                  <NoteCard
                    note={note}
                    isSelected={selectedNotes.includes(note.id)}
                    isMultiSelect={isMultiSelect}
                    onSelect={() => handleNoteSelect(note.id)}
                    onLongPress={() => handleLongPress(note.id)}
                    refreshNotes={refreshNotes}
                    index={index}
                  />
                </div>
              </div>
            ))}
            
            {/* 普通笔记 */}
            {filteredNotes.filter(note => !note.isPinned).map((note, index) => (
              <div
                key={`normal-${note.id}`}
                className="animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${(filteredNotes.filter(note => note.isPinned).length + index) * 150}ms` }}
              >
                <NoteCard
                  note={note}
                  isSelected={selectedNotes.includes(note.id)}
                  isMultiSelect={isMultiSelect}
                  onSelect={() => handleNoteSelect(note.id)}
                  onLongPress={() => handleLongPress(note.id)}
                  refreshNotes={refreshNotes}
                  index={filteredNotes.filter(note => note.isPinned).length + index}
                />
              </div>
            ))}
          </div>
          
          {filteredNotes.length === 0 && (selectedTags.length > 0 || searchQuery) && (
            <div className="text-center py-6 sm:py-12 animate-in zoom-in-50 duration-500">
              <div className="text-muted-foreground/60 mb-4">
                <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50 pulse-animation" />
                <p className="text-sm sm:text-base font-medium">没有找到相关小纸条</p>
                <p className="text-xs sm:text-sm">试试调整搜索关键词或筛选条件</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  clearTagFilter()
                  clearSearch()
                }}
                className="mt-3 sm:mt-4 bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-md text-xs sm:text-sm"
              >
                清除所有筛选
              </Button>
            </div>
          )}
        </div>

        <Link href="/create" className="relative z-50">
          <Button
            size="lg"
            className="fab-modern h-14 w-14 sm:h-16 sm:w-16"
          >
            <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-white transition-transform duration-300 group-hover:rotate-90" />
          </Button>
        </Link>
      </main>

      <AppFooter />
    </div>
  )
}
