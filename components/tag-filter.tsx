"use client"

import { Hash, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface TagFilterProps {
  allTags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClose: () => void
}

export function TagFilter({ allTags, selectedTags, onTagToggle, onClose }: TagFilterProps) {
  return (
    <Card className="note-card p-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-rose-500" />
          <h3 className="font-serif font-semibold text-slate-700 dark:text-slate-200">选择标签筛选</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag)
          return (
            <Badge
              key={tag}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                isSelected
                  ? "bg-rose-500 text-white hover:bg-rose-600"
                  : "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/20"
              }`}
              onClick={() => onTagToggle(tag)}
            >
              {tag}
              {isSelected && <X className="h-3 w-3 ml-1" />}
            </Badge>
          )
        })}
      </div>

      {allTags.length === 0 && (
        <div className="text-center py-4 text-slate-400 dark:text-slate-500">
          <p className="text-sm">还没有任何标签</p>
          <p className="text-xs mt-1">创建小纸条时添加标签吧</p>
        </div>
      )}
    </Card>
  )
}
