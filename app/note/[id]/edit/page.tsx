"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Camera, ImageIcon, Save, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useBackground } from "@/hooks/use-background"

import { getNotes, updateNote, togglePinNote } from "@/lib/storage"

const builtInTags = ["生活", "工作", "学习", "美食", "旅行"]

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { noteBackground } = useBackground()
  const [note, setNote] = useState<any>(null)
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [extractedTags, setExtractedTags] = useState<string[]>([])
  const [image, setImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [id, setId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (id) {
      // 从本地存储中查找笔记
      const notes = getNotes()
      const foundNote = notes.find((n) => n.id === id)
      if (foundNote) {
        setNote(foundNote)
        setContent(foundNote.content)
        setSelectedTags(foundNote.tags)
        setImage(foundNote.image || null)
      }
    }
  }, [id])

  useEffect(() => {
    // 自动提取标签
    const hashTags = content.match(/#[\u4e00-\u9fa5a-zA-Z0-9]+/g) || []
    const cleanTags = hashTags.map((tag) => tag.substring(1))
    setExtractedTags(cleanTags)
  }, [content])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 更新笔记到本地存储
      const updatedNote = updateNote(id, {
        content,
        tags: selectedTags,
        image,
      })
      
      if (updatedNote) {
        await new Promise((resolve) => setTimeout(resolve, 500)) // 模拟保存延迟
        router.push(`/note/${id}`)
      } else {
        console.error("Failed to update note")
      }
    } catch (error) {
      console.error("Error saving note:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePin = async () => {
    try {
      const updatedNote = togglePinNote(id)
      if (updatedNote) {
        setNote(updatedNote)
      }
    } catch (error) {
      console.error("Error toggling pin:", error)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">笔记不存在</p>
          <Button onClick={() => router.push("/")}>返回首页</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* 背景图片 */}
      {noteBackground && (
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url(${noteBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-blue-50 dark:from-brand-dark dark:via-gray-900 dark:to-slate-900 relative">
        {/* Header */}
        <header className="gradient-header text-white px-3 sm:px-4 py-3 sm:py-4 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              取消
            </Button>

            <h1 className="font-bold text-lg">编辑笔记</h1>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleTogglePin}
              className="text-white hover:bg-white/20"
            >
              <Pin className={`h-4 w-4 mr-2 ${note.isPinned ? "fill-current" : ""}`} />
              {note.isPinned ? "取消置顶" : "置顶"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="text-white hover:bg-white/20"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 py-6 pb-40">
          <div className="max-w-md mx-auto space-y-6">
            {/* Image Upload */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
              {image ? (
                <div className="relative rounded-xl overflow-hidden mb-4">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt="笔记图片"
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2"
                  >
                    删除
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
                  <div className="flex justify-center space-x-4 mb-4">
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      拍照
                    </Button>
                    <Button variant="outline" size="sm">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      相册
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500">添加图片让笔记更生动</p>
                </div>
              )}
            </div>

            {/* Text Content */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="记录你的想法..."
                className="min-h-[200px] border-none bg-transparent resize-none focus:ring-0 text-base leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
              <h3 className="font-medium mb-3 text-slate-700 dark:text-slate-200">标签</h3>

              {/* Built-in Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {builtInTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-rose-500 text-white hover:bg-rose-600"
                        : "hover:bg-rose-100 dark:hover:bg-rose-900/30"
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Extracted Tags */}
              {extractedTags.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">从文本中提取的标签：</p>
                  <div className="flex flex-wrap gap-2">
                    {extractedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
