"use client"

import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from "react"
import { Plus, Filter, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { NoteCard } from "@/components/note-card"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { TagFilter } from "@/components/tag-filter"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import Link from "next/link"

const sampleNotes = [
  {
    id: "1",
    content: "今天天气很好，适合出去走走。记得带上相机拍些美丽的风景。",
    tags: ["生活", "摄影"],
    createdAt: new Date("2024-01-15"),
    image: "/beautiful-landscape.png",
  },
  {
    id: "2",
    content: "学习新的编程技术，今天完成了React组件的开发。#编程 #学习",
    tags: ["编程", "学习", "工作"],
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    content: "晚餐做了红烧肉，味道不错。下次可以试试加点八角。",
    tags: ["美食", "烹饪"],
    createdAt: new Date("2024-01-13"),
  },
  {
    id: "4",
    content: "今天去了新开的咖啡店，环境很棒，适合工作。#咖啡 #工作",
    tags: ["咖啡", "工作", "生活"],
    createdAt: new Date("2024-01-12"),
  },
  {
    id: "5",
    content: "完成了这周的学习计划，掌握了新的设计技巧。",
    tags: ["学习", "设计"],
    createdAt: new Date("2024-01-11"),
  },
]

export default function HomePage() {
  const [notes, setNotes] = useState(sampleNotes)
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showTagFilter, setShowTagFilter] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // 客户端检测，避免服务端渲染问题
  useEffect(() => {
    setIsClient(true)
  }, [])

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
      // Ctrl/Cmd + F: 搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      }
      // Ctrl/Cmd + T: 标签筛选
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault()
        setShowTagFilter(true)
      }
      // Escape: 关闭搜索/标签筛选
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowTagFilter(false)
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
        setNotes(prev => prev.filter(note => !selectedNotes.includes(note.id)))
        setSelectedNotes([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isClient, isMultiSelect, selectedNotes, filteredNotes])

  // 虚拟滚动优化：限制同时渲染的笔记数量
  const visibleNotes = useMemo(() => {
    return filteredNotes.slice(0, 20) // 限制显示前20条，可以按需加载更多
  }, [filteredNotes])

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
    <div className="min-h-screen flex flex-col safe-area-top">
      <AppHeader
        isMultiSelect={isMultiSelect}
        selectedCount={selectedNotes.length}
        onMultiSelectToggle={() => {
          setIsMultiSelect(!isMultiSelect)
          setSelectedNotes([])
        }}
      />

      <main className="flex-1 px-3 sm:px-4 py-4 sm:py-6 pb-24 safe-area-bottom smooth-scroll">
        <div className="max-w-md mx-auto space-y-3 sm:space-y-4 mobile-spacing-y-3">
          <div className="flex items-center justify-between animate-in slide-in-from-top-3 duration-500">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center space-x-1 sm:space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-md h-9 sm:h-10 px-2 sm:px-3 touch-feedback"
                title="快捷键: Ctrl/Cmd + F"
              >
                <Search className="h-4 w-4" />
                <span className="text-xs sm:text-sm">搜索</span>
                {searchQuery && (
                  <Badge variant="secondary" className="ml-1 animate-pulse text-xs">
                    1
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTagFilter(!showTagFilter)}
                className="flex items-center space-x-1 sm:space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-md h-9 sm:h-10 px-2 sm:px-3 touch-feedback"
                title="快捷键: Ctrl/Cmd + T"
              >
                <Filter className="h-4 w-4" />
                <span className="text-xs sm:text-sm">标签</span>
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-1 animate-pulse text-xs">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </div>

            {(selectedTags.length > 0 || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearTagFilter()
                  clearSearch()
                }}
                className="text-slate-500 transition-all duration-300 hover:scale-105 h-9 sm:h-10 px-2 touch-feedback"
              >
                <X className="h-4 w-4 mr-1" />
                <span className="text-xs sm:text-sm">清除</span>
              </Button>
            )}
          </div>

          {showSearch && (
            <div className="animate-in slide-in-from-top-4 duration-300">
              <div className="relative">
                <Input
                  placeholder="搜索笔记内容或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 h-10 sm:h-11 text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {showTagFilter && (
            <div className="animate-in slide-in-from-top-4 duration-300">
              <TagFilter
                allTags={allTags}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onClose={() => setShowTagFilter(false)}
              />
            </div>
          )}

          {isMultiSelect && selectedNotes.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    已选择 {selectedNotes.length} 个笔记
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    (快捷键: Delete 删除, Ctrl+A 全选)
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setNotes(prev => prev.filter(note => !selectedNotes.includes(note.id)))
                    setSelectedNotes([])
                    setIsMultiSelect(false)
                  }}
                  className="text-xs self-end sm:self-auto"
                >
                  删除选中
                </Button>
              </div>
            </div>
          )}

          {(selectedTags.length > 0 || searchQuery) && (
            <div className="flex flex-wrap gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg animate-in slide-in-from-left-3 duration-400">
              {searchQuery && (
                <div className="flex items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium mr-2">搜索:</span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition-all duration-300 hover:scale-110"
                    onClick={clearSearch}
                  >
                    {searchQuery}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                </div>
              )}

              {selectedTags.length > 0 && (
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">标签:</span>
                  {selectedTags.map((tag, index) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-rose-500 text-white cursor-pointer hover:bg-rose-600 transition-all duration-300 hover:scale-110"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {(selectedTags.length > 0 || searchQuery) && (
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center animate-in fade-in duration-500">
              找到 <span className="font-semibold text-rose-500">{filteredNotes.length}</span> 条相关小纸条
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            {visibleNotes.map((note, index) => (
              <div
                key={note.id}
                className="animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <NoteCard
                  note={note}
                  isSelected={selectedNotes.includes(note.id)}
                  isMultiSelect={isMultiSelect}
                  onSelect={() => handleNoteSelect(note.id)}
                  onLongPress={() => handleLongPress(note.id)}
                  index={index}
                />
              </div>
            ))}
            
            {/* 显示加载更多提示 */}
            {filteredNotes.length > visibleNotes.length && (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  还有 {filteredNotes.length - visibleNotes.length} 条笔记，继续滚动查看更多
                </p>
              </div>
            )}
          </div>

          {filteredNotes.length === 0 && (selectedTags.length > 0 || searchQuery) && (
            <div className="text-center py-8 sm:py-12 animate-in zoom-in-50 duration-500">
              <div className="text-slate-400 dark:text-slate-500 mb-4">
                <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50 animate-pulse" />
                <p className="text-base sm:text-lg font-medium">没有找到相关小纸条</p>
                <p className="text-sm">试试调整搜索关键词或筛选条件</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  clearTagFilter()
                  clearSearch()
                }}
                className="mt-4 bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-md text-sm"
              >
                清除所有筛选
              </Button>
            </div>
          )}
        </div>

        <Link href="/create">
          <Button
            size="lg"
            className="fixed bottom-20 right-4 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full gradient-header shadow-lg hover:shadow-2xl 
                       transition-all duration-500 hover:scale-110 hover:rotate-90 group animate-in zoom-in-50 duration-700 touch-feedback"
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300 group-hover:scale-110" />
          </Button>
        </Link>
      </main>

      <AppFooter />
    </div>
  )
}
