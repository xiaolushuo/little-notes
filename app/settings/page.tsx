"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Trash2, Download, Upload, Image, Check, Palette, Crop, Type, Settings } from "lucide-react"
import Link from "next/link"
import { useTheme, themes } from "@/hooks/use-theme"

interface UserSettings {
  autoSave: boolean
  fontSize: number
  fontFamily: string
  fontWeight: string
  homeBackground?: string
  noteBackground?: string
}

interface BackgroundSettings {
  homeBackground: string | null
  noteBackground: string | null
}

// Helper functions for font styling
const getFontFamily = (fontFamily: string): string => {
  const fontMap: Record<string, string> = {
    inter: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    merriweather: '"Merriweather", Georgia, serif',
    nunito: '"Nunito", "Comic Sans MS", cursive',
    playfair: '"Playfair Display", Georgia, serif',
    jetbrains: '"JetBrains Mono", "Fira Code", monospace'
  }
  return fontMap[fontFamily] || fontMap.inter
}

const getFontWeight = (fontWeight: string): string => {
  const weightMap: Record<string, string> = {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
  return weightMap[fontWeight] || weightMap.normal
}

export default function SettingsPage() {
  const [autoSave, setAutoSave] = useState(true)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("inter")
  const [fontWeight, setFontWeight] = useState("normal")
  const [homeBackground, setHomeBackground] = useState<string | null>(null)
  const [noteBackground, setNoteBackground] = useState<string | null>(null)
  const [croppingImage, setCroppingImage] = useState<string | null>(null)
  const [cropType, setCropType] = useState<'home' | 'note'>('home')
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const { toast } = useToast()
  const { currentTheme, themes: availableThemes, setTheme } = useTheme()

  // 加载保存的设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings')
    const savedBackgrounds = localStorage.getItem('backgroundSettings')
    
    if (savedSettings) {
      try {
        const settings: UserSettings = JSON.parse(savedSettings)
        setAutoSave(settings.autoSave)
        setFontSize(settings.fontSize)
        setFontFamily(settings.fontFamily || "inter")
        setFontWeight(settings.fontWeight || "normal")
        setHomeBackground(settings.homeBackground || null)
        setNoteBackground(settings.noteBackground || null)
        
        // Apply font settings immediately after loading
        setTimeout(() => {
          const tempFontFamily = settings.fontFamily || "inter"
          const tempFontWeight = settings.fontWeight || "normal"
          const tempFontSize = settings.fontSize
          
          if (typeof window !== 'undefined') {
            const root = document.documentElement
            const fontFamilyCSS = getFontFamily(tempFontFamily)
            const fontWeightCSS = getFontWeight(tempFontWeight)
            
            root.style.setProperty('--user-font-family', fontFamilyCSS)
            root.style.setProperty('--user-font-weight', fontWeightCSS)
            root.style.setProperty('--user-font-size', `${tempFontSize}px`)
            
            document.body.style.fontFamily = fontFamilyCSS
            document.body.style.fontWeight = fontWeightCSS
            document.body.style.fontSize = `${tempFontSize}px`
          }
        }, 100)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    
    if (savedBackgrounds) {
      try {
        const backgrounds: BackgroundSettings = JSON.parse(savedBackgrounds)
        setHomeBackground(backgrounds.homeBackground)
        setNoteBackground(backgrounds.noteBackground)
      } catch (error) {
        console.error('Failed to load background settings:', error)
      }
    }
  }, [])

  // Apply font settings when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      const fontFamilyCSS = getFontFamily(fontFamily)
      const fontWeightCSS = getFontWeight(fontWeight)
      
      root.style.setProperty('--user-font-family', fontFamilyCSS)
      root.style.setProperty('--user-font-weight', fontWeightCSS)
      root.style.setProperty('--user-font-size', `${fontSize}px`)
      
      document.body.style.fontFamily = fontFamilyCSS
      document.body.style.fontWeight = fontWeightCSS
      document.body.style.fontSize = `${fontSize}px`
    }
  }, [fontFamily, fontWeight, fontSize])

  const handleSave = () => {
    const settings: UserSettings = {
      autoSave,
      fontSize,
      fontFamily,
      fontWeight,
      homeBackground: homeBackground || undefined,
      noteBackground: noteBackground || undefined
    }
    
    const backgrounds: BackgroundSettings = {
      homeBackground,
      noteBackground
    }
    
    localStorage.setItem('userSettings', JSON.stringify(settings))
    localStorage.setItem('backgroundSettings', JSON.stringify(backgrounds))
    
    // Apply font settings immediately
    applyFontSettings()
    
    toast({
      title: "设置已保存",
      description: "您的设置已成功保存",
    })
  }

  const applyFontSettings = () => {
    // 确保在客户端执行
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    const fontFamilyCSS = getFontFamily(fontFamily)
    const fontWeightCSS = getFontWeight(fontWeight)
    
    // Apply font settings to the root element
    root.style.setProperty('--user-font-family', fontFamilyCSS)
    root.style.setProperty('--user-font-weight', fontWeightCSS)
    root.style.setProperty('--user-font-size', `${fontSize}px`)
    
    // Apply font to body
    document.body.style.fontFamily = fontFamilyCSS
    document.body.style.fontWeight = fontWeightCSS
    document.body.style.fontSize = `${fontSize}px`
  }

  const handleBackgroundUpload = (type: 'home' | 'note') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setCroppingImage(imageData)
        setCropType(type)
        // Initialize crop area
        setCrop({ x: 0, y: 0, width: 100, height: 100 })
      }
      
      reader.readAsDataURL(file)
    }
    
    input.click()
  }

  const handleBackgroundRemove = (type: 'home' | 'note') => {
    if (type === 'home') {
      setHomeBackground(null)
    } else {
      setNoteBackground(null)
    }
    
    toast({
      title: "背景图片已移除",
      description: `${type === 'home' ? '主页' : '笔记页'}背景图片已清除`,
    })
  }

  // Cropping functionality
  const handleCropMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(rect.width - prev.width, prev.x + deltaX)),
      y: Math.max(0, Math.min(rect.height - prev.height, prev.y + deltaY))
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleCropMouseUp = () => {
    setIsDragging(false)
  }

  const applyCrop = () => {
    if (!croppingImage || !canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY

    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    const croppedImageData = canvas.toDataURL('image/jpeg', 0.9)
    
    if (cropType === 'home') {
      setHomeBackground(croppedImageData)
    } else {
      setNoteBackground(croppedImageData)
    }

    setCroppingImage(null)
    toast({
      title: "背景图片已裁剪",
      description: `${cropType === 'home' ? '主页' : '笔记页'}背景图片已更新`,
    })
  }

  const cancelCrop = () => {
    setCroppingImage(null)
  }

  const handleExportData = () => {
    try {
      // 获取所有数据
      const settings = localStorage.getItem('userSettings')
      const notes = localStorage.getItem('notes')
      const backgrounds = localStorage.getItem('backgroundSettings')
      const selectedTheme = localStorage.getItem('selectedTheme')
      
      const exportData = {
        settings: settings ? JSON.parse(settings) : null,
        notes: notes ? JSON.parse(notes) : null,
        backgrounds: backgrounds ? JSON.parse(backgrounds) : null,
        theme: selectedTheme,
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      }
      
      // 创建下载链接
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `小纸条数据备份_${new Date().toLocaleDateString()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "导出成功",
        description: "数据已成功导出到本地文件",
      })
    } catch (error) {
      toast({
        title: "导出失败",
        description: "数据导出过程中出现错误",
      })
    }
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          
          // 验证数据格式
          if (data.settings && typeof data.settings === 'object') {
            localStorage.setItem('userSettings', JSON.stringify(data.settings))
          }
          
          if (data.notes && Array.isArray(data.notes)) {
            localStorage.setItem('notes', JSON.stringify(data.notes))
          }
          
          if (data.backgrounds && typeof data.backgrounds === 'object') {
            localStorage.setItem('backgroundSettings', JSON.stringify(data.backgrounds))
          }
          
          if (data.theme) {
            localStorage.setItem('selectedTheme', data.theme)
          }
          
          // 重新加载页面以应用新设置
          window.location.reload()
          
          toast({
            title: "导入成功",
            description: "数据已成功导入，页面将刷新以应用新设置",
          })
        } catch (error) {
          toast({
            title: "导入失败",
            description: "文件格式不正确或数据损坏",
          })
        }
      }
      
      reader.readAsText(file)
    }
    
    input.click()
  }

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      try {
        // 清除所有本地数据
        localStorage.removeItem('userSettings')
        localStorage.removeItem('notes')
        localStorage.removeItem('backgroundSettings')
        localStorage.removeItem('selectedTheme')
        
        // 重置为默认设置
        setAutoSave(true)
        setFontSize(16)
        setFontFamily("inter")
        setFontWeight("normal")
        setHomeBackground(null)
        setNoteBackground(null)
        
        toast({
          title: "清除成功",
          description: "所有数据已清除，设置已重置为默认值",
        })
      } catch (error) {
        toast({
          title: "清除失败",
          description: "数据清除过程中出现错误",
        })
      }
    }
  }

  const handleThemeSelect = (theme: typeof themes[0]) => {
    setTheme(theme)
    toast({
      title: "主题已切换",
      description: `已切换到${theme.name}主题`,
    })
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto p-4 safe-area-top safe-area-bottom">
          {/* 顶部导航 */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            </Link>
            <h1 className="text-xl font-serif font-bold">设置</h1>
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>

          {/* 设置选项 */}
          <div className="space-y-6">
            {/* 主题选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    主题选择
                  </div>
                  <Link href="/theme-customizer">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      定制主题
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>选择您喜欢的主题风格，或点击"定制主题"进行个性化设置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {availableThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        currentTheme.id === theme.id
                          ? 'border-primary shadow-md ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleThemeSelect(theme)}
                      style={{
                        background: theme.backgrounds.pattern,
                        fontFamily: theme.fonts.primary,
                        color: theme.colors.text
                      }}
                    >
                      {currentTheme.id === theme.id && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4">
                        {/* 主题预览图 */}
                        <div className="flex-shrink-0">
                          <div
                            className="w-16 h-16 rounded-lg border-2 overflow-hidden bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${theme.preview})`,
                              borderColor: theme.colors.border
                            }}
                          />
                        </div>
                        
                        {/* 主题信息 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1" style={{ color: theme.colors.text }}>
                            {theme.name}
                          </h3>
                          <p className="text-sm opacity-80" style={{ color: theme.colors.textSecondary }}>
                            {theme.description}
                          </p>
                          
                          {/* 主题颜色预览 */}
                          <div className="flex items-center space-x-2 mt-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.border }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: theme.colors.accent, borderColor: theme.colors.border }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: theme.colors.border, borderColor: theme.colors.border }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* 主题样式预览 */}
                      <div className="mt-3 flex space-x-2">
                        <div
                          className="px-3 py-1 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor: theme.colors.accent,
                            color: theme.colors.text,
                            borderColor: theme.colors.border
                          }}
                        >
                          按钮
                        </div>
                        <div
                          className="px-3 py-1 rounded-full text-xs font-medium border-2"
                          style={{
                            backgroundColor: 'transparent',
                            color: theme.colors.text,
                            borderColor: theme.colors.border
                          }}
                        >
                          标签
                        </div>
                        <Link href={`/theme-customizer?theme=${theme.id}`}>
                          <div
                            className="px-3 py-1 rounded-full text-xs font-medium border-2 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: 'transparent',
                              color: theme.colors.text,
                              borderColor: theme.colors.border
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            定制
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 主题定制入口 */}
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">想要更多个性化？</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        深度定制主题色彩、字体、样式等各个元素
                      </p>
                    </div>
                    <Link href="/theme-customizer">
                      <Button size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        开始定制
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 编辑设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">编辑设置</CardTitle>
                <CardDescription>配置编辑器行为</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autosave">自动保存</Label>
                    <p className="text-sm text-muted-foreground">编辑时自动保存更改</p>
                  </div>
                  <Switch
                    id="autosave"
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 主题定制提示 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  高级主题设置
                </CardTitle>
                <CardDescription>字体和背景设置已移至主题定制器</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">字体设置</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        字体族、字体粗细、字体大小等设置已移至主题定制器的"字体"标签页中
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">背景设置</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        主页背景、笔记页背景等设置已移至主题定制器的"背景"标签页中
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link href="/theme-customizer">
                        <Button size="sm" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          打开主题定制器
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 数据管理 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">数据管理</CardTitle>
                <CardDescription>管理您的笔记数据</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    className="justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    导出数据
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleImportData}
                    className="justify-start"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    导入数据
                  </Button>
                  
                  <Separator />
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleClearData}
                    className="justify-start"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    清除所有数据
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 关于 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">关于</CardTitle>
                <CardDescription>应用信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">版本</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">当前主题</span>
                  <span>{currentTheme.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">开发者</span>
                  <span>小纸条团队</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 图片裁剪对话框 */}
      <Dialog open={!!croppingImage} onOpenChange={(open) => !open && cancelCrop()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Crop className="h-5 w-5 mr-2" />
              裁剪背景图片
            </DialogTitle>
            <DialogDescription>
              拖拽选择区域来裁剪{cropType === 'home' ? '主页' : '笔记页'}背景图片
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 图片预览和裁剪区域 */}
            <div className="relative border rounded-lg overflow-hidden bg-muted" 
                 onMouseDown={handleCropMouseDown}
                 onMouseMove={handleCropMouseMove}
                 onMouseUp={handleCropMouseUp}
                 onMouseLeave={handleCropMouseUp}>
              <img
                ref={imageRef}
                src={croppingImage || ''}
                alt="待裁剪图片"
                className="max-w-full max-h-96 object-contain"
                onLoad={() => {
                  if (imageRef.current) {
                    const img = imageRef.current
                    const size = Math.min(img.width, img.height, 200)
                    setCrop({ x: 0, y: 0, width: size, height: size })
                  }
                }}
              />
              
              {/* 裁剪框 */}
              <div
                className="absolute border-2 border-primary bg-primary/20 cursor-move"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height,
                }}
              >
                {/* 裁剪框控制点 */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"></div>
              </div>
            </div>
            
            {/* 裁剪信息 */}
            <div className="text-sm text-muted-foreground">
              裁剪区域: {Math.round(crop.width)} × {Math.round(crop.height)} 像素
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelCrop}>
                取消
              </Button>
              <Button onClick={applyCrop}>
                应用裁剪
              </Button>
            </div>
          </div>
          
          {/* 隐藏的画布用于裁剪操作 */}
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  )
}