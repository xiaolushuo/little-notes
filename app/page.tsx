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

  // 时间筛选和排序状态
  const [timeFilter, setTimeFilter] = useState<'all' | 'expired' | 'urgent' | 'warning'>('all')
  const [sortBy, setSortBy] = useState<'created' | 'expiration'>('created')

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
      clearTimeFilter()
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

    // 标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter((note) => selectedTags.some((tag) => note.tags.includes(tag)))
    }

    // 搜索筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (note) =>
          note.content.toLowerCase().includes(query) || note.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // 时间筛选
    if (timeFilter !== 'all') {
      filtered = filtered.filter((note) => {
        if (!note.expirationDate) return false
        
        const now = new Date()
        const expiration = new Date(note.expirationDate)
        const timeDiff = expiration.getTime() - now.getTime()
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
        
        switch (timeFilter) {
          case 'expired':
            return timeDiff <= 0
          case 'urgent':
            return timeDiff > 0 && daysDiff <= 1
          case 'warning':
            return timeDiff > 0 && daysDiff <= 3
          default:
            return true
        }
      })
    }

    // 排序
    if (sortBy === 'expiration') {
      filtered = [...filtered].sort((a, b) => {
        // 有到期时间的笔记排在前面
        if (a.expirationDate && !b.expirationDate) return -1
        if (!a.expirationDate && b.expirationDate) return 1
        if (!a.expirationDate && !b.expirationDate) return 0
        
        // 都有到期时间，按时间排序
        return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
      })
    } else {
      // 按创建时间排序（最新的在前）
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
  }, [notes, selectedTags, searchQuery, timeFilter, sortBy])

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
        clearTimeFilter()
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

  const clearTimeFilter = useCallback(() => {
    setTimeFilter('all')
    setSortBy('created')
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

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8 safe-area-bottom smooth-scroll relative">
        <div className="max-w-md mx-auto space-y-4 pb-20">
          {/* 搜索框 */}
          <div className="animate-in fade-in duration-300">
            <div className="glass-card p-4 shadow-lg">
              <div className="flex items-center">
                <div className="mr-3 text-brand-primary">
                  <Search className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <Input
                    placeholder="搜索笔记内容或标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 px-0 py-2 text-base placeholder:text-muted-foreground text-foreground focus:ring-0 focus:outline-none"
                    enterKeyHint="search"
                    inputMode="search"
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
                
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="ml-2 h-8 w-8 p-0 hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 标签筛选 */}
          <div className="animate-in fade-in duration-300 delay-100">
            <div className="glass-card p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground flex items-center">
                  <span className="w-2 h-2 bg-brand-primary rounded-full mr-2"></span>
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
                    className="text-muted-foreground hover:text-foreground h-7 px-3 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    清除
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "secondary"}
                    className={`cursor-pointer text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-brand-primary text-white"
                        : "bg-muted text-muted-foreground hover:bg-brand-primary/10"
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

          {/* 时间筛选 */}
          <div className="animate-in fade-in duration-300 delay-200">
            <div className="glass-card p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  时间筛选
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTimeFilter('all')
                    setSortBy('created')
                  }}
                  className="text-muted-foreground hover:text-foreground h-7 px-3 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  重置
                </Button>
              </div>
              <div className="space-y-3">
                {/* 时间状态筛选 */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={timeFilter === 'all' ? "default" : "secondary"}
                    className={`cursor-pointer text-sm transition-colors ${
                      timeFilter === 'all'
                        ? "bg-brand-primary text-white"
                        : "bg-muted text-muted-foreground hover:bg-brand-primary/10"
                    }`}
                    onClick={() => setTimeFilter('all')}
                  >
                    全部
                  </Badge>
                  <Badge
                    variant={timeFilter === 'expired' ? "default" : "secondary"}
                    className={`cursor-pointer text-sm transition-colors ${
                      timeFilter === 'expired'
                        ? "bg-red-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-red-500/10"
                    }`}
                    onClick={() => setTimeFilter('expired')}
                  >
                    已过期
                  </Badge>
                  <Badge
                    variant={timeFilter === 'urgent' ? "default" : "secondary"}
                    className={`cursor-pointer text-sm transition-colors ${
                      timeFilter === 'urgent'
                        ? "bg-yellow-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-yellow-500/10"
                    }`}
                    onClick={() => setTimeFilter('urgent')}
                  >
                    即将到期
                  </Badge>
                  <Badge
                    variant={timeFilter === 'warning' ? "default" : "secondary"}
                    className={`cursor-pointer text-sm transition-colors ${
                      timeFilter === 'warning'
                        ? "bg-orange-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-orange-500/10"
                    }`}
                    onClick={() => setTimeFilter('warning')}
                  >
                    需要注意
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 排序选项 */}
          <div className="animate-in fade-in duration-300 delay-300">
            <div className="glass-card p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">排序方式:</span>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={sortBy === 'created' ? "default" : "secondary"}
                    className={`cursor-pointer text-sm transition-colors ${
                      sortBy === 'created'
                        ? "bg-brand-secondary text-white"
                        : "bg-muted text-muted-foreground hover:bg-brand-secondary/10"
                    }`}
                    onClick={() => setSortBy('created')}
                  >
                    创建时间
                  </Badge>
                  <Badge
                    variant={sortBy === 'expiration' ? "default" : "secondary"}
                    className={`cursor-pointer text-sm transition-colors ${
                      sortBy === 'expiration'
                        ? "bg-brand-accent text-white"
                        : "bg-muted text-muted-foreground hover:bg-brand-accent/10"
                    }`}
                    onClick={() => setSortBy('expiration')}
                  >
                    到期时间
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {isMultiSelect && selectedNotes.length > 0 && (
            <div className="glass-card p-3 sm:p-6 animate-in fade-in duration-300">
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
            <div className="flex flex-wrap gap-1.5 p-3 glass-card animate-in fade-in duration-300">
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
            <div className="text-sm text-muted-foreground text-center animate-in fade-in duration-300">
              找到 <span className="font-semibold gradient-primary bg-clip-text text-transparent">{filteredNotes.length}</span> 条相关小纸条
            </div>
          )}

          <div className="space-y-3">
            {/* 置顶笔记 */}
            {filteredNotes.filter(note => note.isPinned).map((note, index) => (
              <div
                key={`pinned-${note.id}`}
                className="animate-in fade-in duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
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
                className="animate-in fade-in duration-300"
                style={{ animationDelay: `${(filteredNotes.filter(note => note.isPinned).length + index) * 100}ms` }}
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
            <div className="text-center py-6 sm:py-12 animate-in fade-in duration-300">
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
                  clearTimeFilter()
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
