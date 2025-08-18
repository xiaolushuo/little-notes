"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit, Trash2, Share, Heart, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useBackground } from "@/hooks/use-background"

import { getNotes, deleteNote, togglePinNote } from "@/lib/storage"

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { noteBackground } = useBackground()
  const [note, setNote] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
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
      setNote(foundNote)
    }
  }, [id])

  const handleEdit = () => {
    router.push(`/note/${id}/edit`)
  }

  const handleDelete = () => {
    if (confirm("确定要删除这条笔记吗？")) {
      try {
        deleteNote(id)
        router.push("/")
      } catch (error) {
        console.error("Error deleting note:", error)
      }
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

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">笔记不存在</p>
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
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
              返回
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTogglePin}
                className="text-white hover:bg-white/20"
              >
                <Pin className={`h-4 w-4 ${note.isPinned ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="text-white hover:bg-white/20"
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleEdit} className="text-white hover:bg-white/20">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-white hover:bg-white/20">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 py-6 pb-40">
          <div className="max-w-md mx-auto">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              {/* 置顶标识 */}
              {note.isPinned && (
                <div className="mb-4 flex items-center">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                    <Pin className="h-3 w-3" />
                    <span>置顶</span>
                  </div>
                </div>
              )}

              {/* Image */}
              {note.image && (
                <div className="mb-4 rounded-xl overflow-hidden">
                  <Image
                    src={note.image || "/placeholder.svg"}
                    alt="笔记图片"
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="mb-4">
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base">{note.content}</p>
              </div>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Date */}
              <div className="text-sm text-slate-500 dark:text-slate-400">
                创建于{" "}
                {note.createdAt.toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
