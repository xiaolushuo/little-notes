"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Hash, Sparkles, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const BUILT_IN_TAGS = ["生活", "工作", "学习", "美食", "旅行", "健康", "娱乐", "购物"]

// Added expiration and reminder presets
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

// Added Todo item interface
interface TodoItem {
  id: string
  text: string
  completed: boolean
  indent: number
  children?: TodoItem[]
}

const TEXT_TEMPLATES = [
  {
    name: "今日计划",
    icon: "📅",
    content: `# 今日计划 - ${new Date().toLocaleDateString()}

## 重要任务
- [ ] 
- [ ] 
- [ ] 

## 一般任务
- [ ] 
- [ ] 

## 备注
`,
  },
  {
    name: "会议记录",
    icon: "📝",
    content: `# 会议记录

**时间：** ${new Date().toLocaleString()}
**参与人员：** 

## 会议议题
1. 
2. 
3. 

## 讨论要点
- 
- 
- 

## 行动项
- [ ] 
- [ ] 

## 下次会议
**时间：** 
**议题：** 
`,
  },
  {
    name: "学习笔记",
    icon: "📚",
    content: `# 学习笔记

**主题：** 
**日期：** ${new Date().toLocaleDateString()}

## 核心概念
- 
- 
- 

## 重点内容
> 

## 疑问点
- [ ] 
- [ ] 

## 总结
`,
  },
  {
    name: "读书摘录",
    icon: "📖",
    content: `# 读书摘录

**书名：** 
**作者：** 
**阅读日期：** ${new Date().toLocaleDateString()}

## 精彩片段
> 

## 个人感悟
- 
- 

## 行动启发
- [ ] 
- [ ] 
`,
  },
  {
    name: "项目总结",
    icon: "🎯",
    content: `# 项目总结

**项目名称：** 
**完成时间：** ${new Date().toLocaleDateString()}

## 项目成果
- ✅ 
- ✅ 
- ✅ 

## 遇到的挑战
- 
- 

## 经验教训
- 
- 

## 改进建议
- [ ] 
- [ ] 
`,
  },
  {
    name: "灵感记录",
    icon: "💡",
    content: `# 灵感记录

**时间：** ${new Date().toLocaleString()}
**灵感来源：** 

## 核心想法
> 

## 具体描述
- 
- 
- 

## 可行性分析
**优势：** 
**挑战：** 

## 下一步行动
- [ ] 
- [ ] 
`,
  },
]

export default function CreateNotePage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  // Added time management states
  const [expirationDate, setExpirationDate] = useState<Date | null>(null)
  const [selectedExpiration, setSelectedExpiration] = useState<string>("")
  const [customExpirationDate, setCustomExpirationDate] = useState("")
  const [reminderTime, setReminderTime] = useState<Date | null>(null)
  const [selectedReminder, setSelectedReminder] = useState<string>("")
  const [reminderType, setReminderType] = useState<"popup" | "badge">("popup")
  const [showTimeSettings, setShowTimeSettings] = useState(false)

  // Added Todo management states
  const [isTodoMode, setIsTodoMode] = useState(false)
  const [todoItems, setTodoItems] = useState<TodoItem[]>([])
  const [newTodoText, setNewTodoText] = useState("")

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcription, setTranscription] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Drawing states
  const [showDrawing, setShowDrawing] = useState(false)
  const [drawingData, setDrawingData] = useState<string | null>(null)
  const [currentTool, setCurrentTool] = useState<"pen" | "eraser" | "select">("pen")
  const [brushSize, setBrushSize] = useState(3)
  const [drawingHistory, setDrawingHistory] = useState<string[]>([])
  const [historyStep, setHistoryStep] = useState(-1)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Added time management functions
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
      }
    }
  }

  const handleCustomExpirationChange = (dateString: string) => {
    setCustomExpirationDate(dateString)
    if (dateString) {
      const customDate = new Date(dateString)
      setExpirationDate(customDate)
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

  // Added Todo management functions
  const addTodoItem = () => {
    if (newTodoText.trim()) {
      const newItem: TodoItem = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
        indent: 0,
      }
      setTodoItems([...todoItems, newItem])
      setNewTodoText("")
    }
  }

  const toggleTodoItem = (id: string) => {
    setTodoItems((items) => items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const deleteTodoItem = (id: string) => {
    setTodoItems((items) => items.filter((item) => item.id !== id))
  }

  const indentTodoItem = (id: string, direction: "in" | "out") => {
    setTodoItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const newIndent = direction === "in" ? Math.min(item.indent + 1, 3) : Math.max(item.indent - 1, 0)
          return { ...item, indent: newIndent }
        }
        return item
      }),
    )
  }

  const updateTodoText = (id: string, text: string) => {
    setTodoItems((items) => items.map((item) => (item.id === id ? { ...item, text } : item)))
  }

  const convertTodosToMarkdown = () => {
    const completedCount = todoItems.filter((item) => item.completed).length
    const totalCount = todoItems.length

    let markdown = `# 清单 (${completedCount}/${totalCount})\n\n`

    todoItems.forEach((item) => {
      const indent = "  ".repeat(item.indent)
      const checkbox = item.completed ? "[x]" : "[ ]"
      const textStyle = item.completed ? `~~${item.text}~~` : item.text
      markdown += `${indent}- ${checkbox} ${textStyle}\n`
    })

    return markdown
  }

  const switchToTodoMode = () => {
    setIsTodoMode(true)
    if (todoItems.length === 0) {
      // Add some default todo items
      setTodoItems([
        { id: "1", text: "新的任务", completed: false, indent: 0 },
        { id: "2", text: "子任务", completed: false, indent: 1 },
        { id: "3", text: "已完成的任务", completed: true, indent: 0 },
      ])
    }
  }

  const switchToTextMode = () => {
    if (todoItems.length > 0) {
      const todoMarkdown = convertTodosToMarkdown()
      setContent(todoMarkdown)
      handleContentChange(todoMarkdown)
    }
    setIsTodoMode(false)
  }

  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        transcribeAudio(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true)
    setTimeout(() => {
      const mockTranscription = "这是一段模拟的语音转文字内容。在实际应用中，这里会调用语音识别API来转换音频为文字。"
      setTranscription(mockTranscription)
      if (isTodoMode) {
        // Add as new todo item
        const newItem: TodoItem = {
          id: Date.now().toString(),
          text: mockTranscription,
          completed: false,
          indent: 0,
        }
        setTodoItems((prev) => [...prev, newItem])
      } else {
        setContent((prev) => prev + (prev ? "\n\n" : "") + mockTranscription)
        handleContentChange(content + (content ? "\n\n" : "") + mockTranscription)
      }
      setIsTranscribing(false)
    }, 2000)
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
    }
  }

  // Drawing functionality
  const startDrawing = () => {
    setShowDrawing(true)
    setTimeout(() => {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.strokeStyle = "#000"
          ctx.lineWidth = brushSize
          ctx.lineCap = "round"
          ctx.lineJoin = "round"
          saveToHistory()
        }
      }
    }, 100)
  }

  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const newHistory = drawingHistory.slice(0, historyStep + 1)
      newHistory.push(canvas.toDataURL())
      setDrawingHistory(newHistory)
      setHistoryStep(newHistory.length - 1)
    }
  }

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (canvas && ctx) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }
        img.src = drawingHistory[historyStep - 1]
        setHistoryStep(historyStep - 1)
      }
    }
  }

  const redo = () => {
    if (historyStep < drawingHistory.length - 1) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (canvas && ctx) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }
        img.src = drawingHistory[historyStep + 1]
        setHistoryStep(historyStep + 1)
      }
    }
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL()
      setDrawingData(dataUrl)
      setShowDrawing(false)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      saveToHistory()
    }
  }

  // Drawing event handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !showDrawing) return

    let isDrawing = false
    let lastX = 0
    let lastY = 0

    const startDraw = (e: MouseEvent | TouchEvent) => {
      isDrawing = true
      const rect = canvas.getBoundingClientRect()
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
      lastX = clientX - rect.left
      lastY = clientY - rect.top
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
      const currentX = clientX - rect.left
      const currentY = clientY - rect.top

      ctx.globalCompositeOperation = currentTool === "eraser" ? "destination-out" : "source-over"
      ctx.lineWidth = brushSize
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(currentX, currentY)
      ctx.stroke()

      lastX = currentX
      lastY = currentY
    }

    const stopDraw = () => {
      if (isDrawing) {
        isDrawing = false
        saveToHistory()
      }
    }

    canvas.addEventListener("mousedown", startDraw)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseup", stopDraw)
    canvas.addEventListener("touchstart", startDraw)
    canvas.addEventListener("touchmove", draw)
    canvas.addEventListener("touchend", stopDraw)

    return () => {
      canvas.removeEventListener("mousedown", startDraw)
      canvas.removeEventListener("mousemove", draw)
      canvas.removeEventListener("mouseup", stopDraw)
      canvas.removeEventListener("touchstart", startDraw)
      canvas.removeEventListener("touchmove", draw)
      canvas.removeEventListener("touchend", stopDraw)
    }
  }, [showDrawing, currentTool, brushSize])

  const extractHashtags = (text: string) => {
    const hashtags = text.match(/#[\u4e00-\u9fa5\w]+/g) || []
    return hashtags.map((tag) => tag.substring(1))
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    const extractedTags = extractHashtags(value)
    setCustomTags(extractedTags)
  }

  const insertFormatting = (before: string, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

    setContent(newText)
    handleContentChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const insertTemplate = (template: (typeof TEXT_TEMPLATES)[0]) => {
    setContent(template.content)
    handleContentChange(template.content)
    setShowTemplates(false)
  }

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-base font-medium mb-1">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^- \[ \] (.*$)/gm, '<li class="ml-4">☐ $1</li>')
      .replace(/^- \[x\] (.*$)/gm, '<li class="ml-4">☑ $1</li>')
      .replace(
        /^> (.*$)/gm,
        '<blockquote class="border-l-4 border-rose-300 pl-4 italic text-slate-600">$1</blockquote>',
      )
      .replace(/\n/g, "<br>")
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const allTags = [...selectedTags, ...customTags]
    const finalContent = isTodoMode ? convertTodosToMarkdown() : content

    const newNote = {
      content: finalContent,
      todos: isTodoMode ? todoItems : undefined,
      tags: allTags,
      image: uploadedImage,
      drawing: drawingData,
      audio: audioUrl,
      transcription,
      // Added time management data to save
      expirationDate,
      reminderTime,
      reminderType,
      createdAt: new Date(),
    }
    console.log("Saving note:", newNote)
    setIsSaving(false)
    router.push("/")
  }

  const allTags = [...selectedTags, ...customTags]
  const expirationStatus = getExpirationStatus(expirationDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <header className="gradient-header text-white px-4 py-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-white hover:bg-white/20 p-2 transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-serif font-black">新建小纸条</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={(!content.trim() && todoItems.length === 0) || isSaving}
            className="bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-lg 
                       transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>保存中...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Sparkles className="h-4 w-4" />
                <span>保存</span>
              </div>
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* ... existing voice recording, drawing, image upload, templates sections ... */}

        {/* Added time management section */}
        <Card className="note-card p-4 animate-in slide-in-from-top-4 duration-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-semibold text-slate-700 dark:text-slate-200">时间管理</h3>
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
                      className="text-xs transition-all duration-300 hover:scale-105"
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
                        className="text-xs transition-all duration-300 hover:scale-105"
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
            <div className={`mt-3 p-3 rounded-lg ${expirationStatus?.bgColor || "bg-slate-50 dark:bg-slate-800"}`}>
              <div className="flex items-center space-x-2">
                <AlertCircle className={`h-4 w-4 ${expirationStatus?.color || "text-slate-500"}`} />
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
                <Badge variant="outline" className={`text-xs ${expirationStatus?.color || "text-slate-500"}`}>
                  {expirationStatus?.status === "expired"
                    ? "已过期"
                    : expirationStatus?.status === "warning"
                      ? "即将过期"
                      : "正常"}
                </Badge>
              </div>
            </div>
          )}
        </Card>

        {/* ... existing content, tags sections ... */}

        <Card className="note-card p-4 animate-in slide-in-from-top-7 duration-900">
          <h3 className="font-serif font-semibold text-slate-700 dark:text-slate-200 mb-3">选择标签</h3>
          <div className="flex flex-wrap gap-2">
            {BUILT_IN_TAGS.map((tag, index) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-300 hover:scale-110 ${
                  selectedTags.includes(tag)
                    ? "bg-rose-500 text-white hover:bg-rose-600 animate-pulse"
                    : "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/20"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </Card>

        {customTags.length > 0 && (
          <Card className="note-card p-4 animate-in slide-in-from-bottom-3 duration-500">
            <h3 className="font-serif font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
              <Hash className="h-4 w-4 mr-2 text-pink-500 animate-pulse" />
              自动提取的标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {customTags.map((tag, index) => (
                <Badge
                  key={`${tag}-${index}`}
                  className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300
                             animate-in zoom-in-50 duration-300 hover:scale-110 hover:shadow-lg transition-all"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {allTags.length > 0 && (
          <Card className="note-card p-4 animate-in slide-in-from-bottom-4 duration-600">
            <h3 className="font-serif font-semibold text-slate-700 dark:text-slate-200 mb-3">标签预览</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <Badge
                  key={`preview-${tag}-${index}`}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white animate-in zoom-in-50 duration-300
                             hover:scale-110 hover:shadow-lg transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
