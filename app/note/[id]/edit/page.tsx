"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Camera, ImageIcon, Save, Pin, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useBackground } from "@/hooks/use-background"

import { getNotes, updateNote, togglePinNote } from "@/lib/storage"

const builtInTags = ["生活", "工作", "学习", "美食", "旅行"]
const EXPIRATION_PRESETS = [
  { label: "1小时", value: 1, unit: "hour" },
  { label: "3小时", value: 3, unit: "hour" },
  { label: "1天", value: 1, unit: "day" },
  { label: "3天", value: 3, unit: "day" },
  { label: "1周", value: 1, unit: "week" },
  { label: "1个月", value: 1, unit: "month" },
  { label: "3个月", value: 3, unit: "month" },
  { label: "自定义", value: 0, unit: "custom" },
]

const REMINDER_PRESETS = [
  { label: "5分钟前", value: 5, unit: "minute" },
  { label: "15分钟前", value: 15, unit: "minute" },
  { label: "30分钟前", value: 30, unit: "minute" },
  { label: "1小时前", value: 1, unit: "hour" },
  { label: "3小时前", value: 3, unit: "hour" },
  { label: "1天前", value: 1, unit: "day" },
]

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

  // 时间管理状态
  const [expirationDate, setExpirationDate] = useState<Date | null>(null)
  const [selectedExpiration, setSelectedExpiration] = useState<string>("")
  const [customExpirationDate, setCustomExpirationDate] = useState("")
  const [reminderTime, setReminderTime] = useState<Date | null>(null)
  const [selectedReminder, setSelectedReminder] = useState<string>("")
  const [reminderType, setReminderType] = useState<"popup" | "badge">("popup")
  const [showTimeSettings, setShowTimeSettings] = useState(false)

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
        
        // 加载时间管理数据
        setExpirationDate(foundNote.expirationDate ? new Date(foundNote.expirationDate) : null)
        setReminderTime(foundNote.reminderTime ? new Date(foundNote.reminderTime) : null)
        setReminderType(foundNote.reminderType || "popup")
        
        // 设置选中的过期时间预设
        if (foundNote.expirationDate) {
          const expDate = new Date(foundNote.expirationDate)
          const now = new Date()
          const timeDiff = expDate.getTime() - now.getTime()
          const hoursDiff = timeDiff / (1000 * 60 * 60)
          const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
          
          if (hoursDiff <= 1) {
            setSelectedExpiration("1小时")
          } else if (hoursDiff <= 3) {
            setSelectedExpiration("3小时")
          } else if (daysDiff <= 1) {
            setSelectedExpiration("1天")
          } else if (daysDiff <= 3) {
            setSelectedExpiration("3天")
          } else if (daysDiff <= 7) {
            setSelectedExpiration("1周")
          } else if (daysDiff <= 30) {
            setSelectedExpiration("1个月")
          } else if (daysDiff <= 90) {
            setSelectedExpiration("3个月")
          } else {
            setSelectedExpiration("自定义")
            setCustomExpirationDate(expDate.toISOString().slice(0, 16))
          }
        }
        
        // 设置选中的提醒时间预设
        if (foundNote.reminderTime && foundNote.expirationDate) {
          const remTime = new Date(foundNote.reminderTime)
          const expTime = new Date(foundNote.expirationDate)
          const timeDiff = expTime.getTime() - remTime.getTime()
          const minutesDiff = timeDiff / (1000 * 60)
          
          if (minutesDiff <= 5) {
            setSelectedReminder("5分钟前")
          } else if (minutesDiff <= 15) {
            setSelectedReminder("15分钟前")
          } else if (minutesDiff <= 30) {
            setSelectedReminder("30分钟前")
          } else if (minutesDiff <= 60) {
            setSelectedReminder("1小时前")
          } else if (minutesDiff <= 180) {
            setSelectedReminder("3小时前")
          } else if (minutesDiff <= 1440) {
            setSelectedReminder("1天前")
          }
        }
      }
    }
  }, [id])

  useEffect(() => {
    // 自动提取标签
    const hashTags = content.match(/#[\u4e00-\u9fa5a-zA-Z0-9]+/g) || []
    const cleanTags = hashTags.map((tag) => tag.substring(1))
    setExtractedTags(cleanTags)
  }, [content])

  // 时间管理函数
  const calculateExpirationDate = (preset: (typeof EXPIRATION_PRESETS)[0]) => {
    const now = new Date()
    if (preset.unit === "hour") {
      return new Date(now.getTime() + preset.value * 60 * 60 * 1000)
    } else if (preset.unit === "day") {
      return new Date(now.getTime() + preset.value * 24 * 60 * 60 * 1000)
    } else if (preset.unit === "week") {
      return new Date(now.getTime() + preset.value * 7 * 24 * 60 * 60 * 1000)
    } else if (preset.unit === "month") {
      const newDate = new Date(now)
      newDate.setMonth(newDate.getMonth() + preset.value)
      return newDate
    }
    return null
  }

  const calculateReminderTime = (expirationDate: Date, preset: (typeof REMINDER_PRESETS)[0]) => {
    if (preset.unit === "minute") {
      return new Date(expirationDate.getTime() - preset.value * 60 * 1000)
    } else if (preset.unit === "hour") {
      return new Date(expirationDate.getTime() - preset.value * 60 * 60 * 1000)
    } else if (preset.unit === "day") {
      return new Date(expirationDate.getTime() - preset.value * 24 * 60 * 60 * 1000)
    }
    return null
  }

  const handleExpirationChange = (presetLabel: string) => {
    setSelectedExpiration(presetLabel)
    const preset = EXPIRATION_PRESETS.find((p) => p.label === presetLabel)
    if (preset) {
      if (preset.unit === "custom") {
        setExpirationDate(null)
      } else {
        const expDate = calculateExpirationDate(preset)
        setExpirationDate(expDate)
        // 如果有提醒时间，重新计算
        if (selectedReminder) {
          const reminderPreset = REMINDER_PRESETS.find((p) => p.label === selectedReminder)
          if (reminderPreset && expDate) {
            const remTime = calculateReminderTime(expDate, reminderPreset)
            setReminderTime(remTime)
          }
        }
      }
    }
  }

  const handleCustomExpirationChange = (dateString: string) => {
    setCustomExpirationDate(dateString)
    if (dateString) {
      const customDate = new Date(dateString)
      setExpirationDate(customDate)
      // 如果有提醒时间，重新计算
      if (selectedReminder) {
        const reminderPreset = REMINDER_PRESETS.find((p) => p.label === selectedReminder)
        if (reminderPreset) {
          const remTime = calculateReminderTime(customDate, reminderPreset)
          setReminderTime(remTime)
        }
      }
    }
  }

  const handleReminderChange = (presetLabel: string) => {
    setSelectedReminder(presetLabel)
    if (expirationDate) {
      const preset = REMINDER_PRESETS.find((p) => p.label === presetLabel)
      if (preset) {
        const remTime = calculateReminderTime(expirationDate, preset)
        setReminderTime(remTime)
      }
    }
  }

  const getExpirationStatus = (expDate: Date | null) => {
    if (!expDate) return null

    const now = new Date()
    const timeDiff = expDate.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    if (timeDiff <= 0) {
      return { status: "expired", color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-900/20" }
    } else if (hoursDiff <= 24) {
      return { status: "warning", color: "text-orange-500", bgColor: "bg-orange-50 dark:bg-orange-900/20" }
    } else {
      return { status: "normal", color: "text-green-500", bgColor: "bg-green-50 dark:bg-green-900/20" }
    }
  }

  const formatDateTime = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 更新笔记到本地存储
      const updatedNote = updateNote(id, {
        content,
        tags: selectedTags,
        image,
        expirationDate,
        reminderTime,
        reminderType,
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

            {/* Time Management */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-slate-700 dark:text-slate-200 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  时间管理
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTimeSettings(!showTimeSettings)}
                  className="text-slate-500 hover:text-rose-500 transition-all duration-300"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </div>

              {showTimeSettings && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  {/* Expiration settings */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">过期时间</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EXPIRATION_PRESETS.map((preset) => (
                        <Button
                          key={preset.label}
                          variant={selectedExpiration === preset.label ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleExpirationChange(preset.label)}
                          className="text-xs transition-all duration-300 hover:scale-105 active:scale-95 touch-optimized"
                          style={{
                            touchAction: 'manipulation',
                            WebkitTapHighlightColor: 'transparent',
                            userSelect: 'none',
                          }}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>

                    {selectedExpiration === "自定义" && (
                      <Input
                        type="datetime-local"
                        value={customExpirationDate}
                        onChange={(e) => handleCustomExpirationChange(e.target.value)}
                        className="text-sm"
                        min={new Date().toISOString().slice(0, 16)}
                        enterKeyHint="next"
                        inputMode="none"
                        onTouchStart={(e) => {
                          // 在移动端，点击时显示更好的时间选择器
                          e.currentTarget.showPicker?.()
                        }}
                      />
                    )}
                  </div>

                  {/* Reminder settings */}
                  {expirationDate && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">提醒设置</label>
                      <div className="grid grid-cols-2 gap-2">
                        {REMINDER_PRESETS.map((preset) => (
                          <Button
                            key={preset.label}
                            variant={selectedReminder === preset.label ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleReminderChange(preset.label)}
                            className="text-xs transition-all duration-300 hover:scale-105 active:scale-95 touch-optimized"
                            style={{
                              touchAction: 'manipulation',
                              WebkitTapHighlightColor: 'transparent',
                              userSelect: 'none',
                            }}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-slate-600 dark:text-slate-300">提醒方式:</span>
                        <Button
                          variant={reminderType === "popup" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setReminderType("popup")}
                          className="text-xs"
                        >
                          弹窗
                        </Button>
                        <Button
                          variant={reminderType === "badge" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setReminderType("badge")}
                          className="text-xs"
                        >
                          徽章
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Time status display */}
              {expirationDate && (
                <div className={`mt-3 p-3 rounded-lg ${getExpirationStatus(expirationDate)?.bgColor || "bg-slate-50 dark:bg-slate-800"}`}>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className={`h-4 w-4 ${getExpirationStatus(expirationDate)?.color || "text-slate-500"}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        过期时间: {formatDateTime(expirationDate)}
                      </div>
                      {reminderTime && (
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          提醒时间: {formatDateTime(reminderTime)}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={`text-xs ${getExpirationStatus(expirationDate)?.color || "text-slate-500"}`}>
                      {getExpirationStatus(expirationDate)?.status === "expired"
                        ? "已过期"
                        : getExpirationStatus(expirationDate)?.status === "warning"
                          ? "即将过期"
                          : "正常"}
                    </Badge>
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
