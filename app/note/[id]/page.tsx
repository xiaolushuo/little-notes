"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit, Trash2, Share, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useBackground } from "@/hooks/use-background"

// 模拟笔记数据
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
      // 根据ID查找笔记
      const foundNote = sampleNotes.find((n) => n.id === id)
      setNote(foundNote)
    }
  }, [id])

  const handleEdit = () => {
    router.push(`/note/${id}/edit`)
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
      
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative">
        {/* Header */}
        <header className="gradient-header text-white px-4 py-4 shadow-lg sticky top-0 z-50">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>

            <div className="flex items-center space-x-2">
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
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
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
