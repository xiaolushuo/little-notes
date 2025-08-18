"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Palette, Type, Image, Settings, Check, Eye, Download, Upload, Upload as UploadIcon, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTheme, themes, ThemeConfig } from "@/hooks/use-theme"

interface CustomThemeSettings {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
  }
  fonts: {
    primary: string
    secondary: string
    size: number
    weight: string
  }
  styles: {
    borderRadius: string
    shadow: string
    animation: string
  }
  customIcons: {
    enabled: boolean
    iconSet: string
  }
  customBackgrounds: {
    enabled: boolean
    homeBackground: string | null
    noteBackground: string | null
  }
}

export default function ThemeCustomizerPage() {
  const { currentTheme, setTheme } = useTheme()
  const { toast } = useToast()
  const [customTheme, setCustomTheme] = useState<CustomThemeSettings>({
    id: '',
    name: '',
    description: '',
    colors: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      accent: '#ffeb3b',
      background: '#fff8e1',
      surface: '#ffffff',
      text: '#5d4037',
      textSecondary: '#8d6e63',
      border: '#ffcc02'
    },
    fonts: {
      primary: '"Comic Sans MS", "Marker Felt", "Chalkboard", cursive',
      secondary: 'Arial, sans-serif',
      size: 16,
      weight: 'normal'
    },
    styles: {
      borderRadius: '16px',
      shadow: '0 8px 16px rgba(255, 107, 53, 0.2)',
      animation: 'crayonBounce 0.6s ease-out'
    },
    customIcons: {
      enabled: false,
      iconSet: 'default'
    },
    customBackgrounds: {
      enabled: false,
      homeBackground: null,
      noteBackground: null
    }
  })
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (currentTheme) {
      setCustomTheme(prev => ({
        ...prev,
        id: currentTheme.id,
        name: currentTheme.name,
        description: currentTheme.description,
        colors: currentTheme.colors,
        fonts: {
          ...currentTheme.fonts,
          size: prev.fonts.size,
          weight: 'normal'
        },
        styles: currentTheme.styles
      }))
    }
  }, [currentTheme])

  const handleColorChange = (colorKey: keyof CustomThemeSettings['colors'], value: string) => {
    setCustomTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }))
    setHasChanges(true)
  }

  const handleFontChange = (fontKey: keyof CustomThemeSettings['fonts'], value: string | number) => {
    setCustomTheme(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontKey]: value
      }
    }))
    setHasChanges(true)
  }

  const handleStyleChange = (styleKey: keyof CustomThemeSettings['styles'], value: string) => {
    setCustomTheme(prev => ({
      ...prev,
      styles: {
        ...prev.styles,
        [styleKey]: value
      }
    }))
    setHasChanges(true)
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
        
        setCustomTheme(prev => ({
          ...prev,
          customBackgrounds: {
            ...prev.customBackgrounds,
            [type === 'home' ? 'homeBackground' : 'noteBackground']: imageData
          }
        }))
        
        setHasChanges(true)
        
        toast({
          title: "背景图片已上传",
          description: `${type === 'home' ? '主页' : '笔记页'}背景图片已设置`,
        })
      }
      
      reader.readAsDataURL(file)
    }
    
    input.click()
  }

  const handleBackgroundRemove = (type: 'home' | 'note') => {
    setCustomTheme(prev => ({
      ...prev,
      customBackgrounds: {
        ...prev.customBackgrounds,
        [type === 'home' ? 'homeBackground' : 'noteBackground']: null
      }
    }))
    setHasChanges(true)
    
    toast({
      title: "背景图片已移除",
      description: `${type === 'home' ? '主页' : '笔记页'}背景图片已清除`,
    })
  }

  const handleSave = () => {
    const newTheme: ThemeConfig = {
      id: customTheme.id,
      name: customTheme.name,
      description: customTheme.description,
      preview: `/${customTheme.id}-preview.png`,
      colors: customTheme.colors,
      fonts: {
        primary: customTheme.fonts.primary,
        secondary: customTheme.fonts.secondary
      },
      backgrounds: {
        pattern: `linear-gradient(135deg, ${customTheme.colors.background} 0%, ${customTheme.colors.surface} 100%)`,
        home: currentTheme?.backgrounds.home || '',
        notes: currentTheme?.backgrounds.notes || ''
      },
      styles: customTheme.styles
    }

    setTheme(newTheme)
    
    localStorage.setItem(`customTheme_${customTheme.id}`, JSON.stringify(customTheme))
    
    const userSettings = {
      fontSize: customTheme.fonts.size,
      fontFamily: 'inter',
      fontWeight: customTheme.fonts.weight,
      autoSave: true
    }
    localStorage.setItem('userSettings', JSON.stringify(userSettings))
    
    const backgroundSettings = {
      homeBackground: customTheme.customBackgrounds.homeBackground,
      noteBackground: customTheme.customBackgrounds.noteBackground
    }
    localStorage.setItem('backgroundSettings', JSON.stringify(backgroundSettings))
    
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--user-font-size', `${customTheme.fonts.size}px`)
      root.style.setProperty('--user-font-weight', customTheme.fonts.weight)
      document.body.style.fontSize = `${customTheme.fonts.size}px`
      document.body.style.fontWeight = customTheme.fonts.weight
    }
    
    toast({
      title: "主题已保存",
      description: "您的自定义主题已成功保存并应用",
    })
    
    setHasChanges(false)
  }

  const handleReset = () => {
    if (currentTheme) {
      setCustomTheme(prev => ({
        ...prev,
        colors: currentTheme.colors,
        fonts: {
          ...currentTheme.fonts,
          size: prev.fonts.size,
          weight: prev.fonts.weight
        },
        styles: currentTheme.styles
      }))
      setHasChanges(false)
      
      toast({
        title: "已重置",
        description: "主题设置已重置为默认值",
      })
    }
  }

  const handleExportTheme = () => {
    const exportData = {
      theme: customTheme,
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `主题配置_${customTheme.name}_${new Date().toLocaleDateString()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: "导出成功",
      description: "主题配置已导出到本地文件",
    })
  }

  const handleImportTheme = () => {
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
          
          if (data.theme) {
            setCustomTheme(data.theme)
            setHasChanges(true)
            
            toast({
              title: "导入成功",
              description: "主题配置已成功导入",
            })
          } else {
            toast({
              title: "导入失败",
              description: "文件格式不正确",
            })
          }
        } catch (error) {
          toast({
            title: "导入失败",
            description: "文件解析失败",
          })
        }
      }
      
      reader.readAsText(file)
    }
    
    input.click()
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-4 safe-area-top safe-area-bottom">
          <div className="flex items-center justify-between mb-6">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回设置
              </Button>
            </Link>
            <h1 className="text-xl font-serif font-bold">主题定制器</h1>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportTheme}
                disabled={!hasChanges}
              >
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleImportTheme}
              >
                <Upload className="h-4 w-4 mr-2" />
                导入
              </Button>
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={!hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                当前主题: {customTheme.name}
              </CardTitle>
              <CardDescription>{customTheme.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-lg border-2"
                    style={{
                      background: `linear-gradient(135deg, ${customTheme.colors.primary} 0%, ${customTheme.colors.secondary} 100%)`,
                      borderColor: customTheme.colors.border
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Object.entries(customTheme.colors).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-1">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: value }}
                        />
                        <span className="text-xs text-muted-foreground">{key}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={previewMode === 'dark'} 
                      onCheckedChange={(checked) => setPreviewMode(checked ? 'dark' : 'light')}
                    />
                    <span className="text-sm">预览模式</span>
                    <span className="text-xs text-muted-foreground">
                      ({previewMode === 'light' ? '浅色' : '深色'})
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="colors" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="colors" className="flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                色彩
              </TabsTrigger>
              <TabsTrigger value="fonts" className="flex items-center">
                <Type className="h-4 w-4 mr-2" />
                字体
              </TabsTrigger>
              <TabsTrigger value="styles" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                样式
              </TabsTrigger>
              <TabsTrigger value="backgrounds" className="flex items-center">
                <Image className="h-4 w-4 mr-2" alt="" />
                背景
              </TabsTrigger>
              <TabsTrigger value="icons" className="flex items-center">
                <Image className="h-4 w-4 mr-2" alt="" />
                图标
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors">
              <Card>
                <CardHeader>
                  <CardTitle>色彩设置</CardTitle>
                  <CardDescription>自定义主题的各种颜色</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(customTheme.colors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`color-${key}`} className="capitalize">
                          {key === 'primary' ? '主色' :
                           key === 'secondary' ? '辅色' :
                           key === 'accent' ? '强调色' :
                           key === 'background' ? '背景色' :
                           key === 'surface' ? '表面色' :
                           key === 'text' ? '文字色' :
                           key === 'textSecondary' ? '次要文字色' :
                           key === 'border' ? '边框色' : key}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded border cursor-pointer"
                            style={{ backgroundColor: value }}
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'color'
                              input.value = value
                              input.onchange = (e) => {
                                handleColorChange(key as keyof CustomThemeSettings['colors'], (e.target as HTMLInputElement).value)
                              }
                              input.click()
                            }}
                          />
                          <Input
                            id={`color-${key}`}
                            type="text"
                            value={value}
                            onChange={(e) => handleColorChange(key as keyof CustomThemeSettings['colors'], e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fonts">
              <Card>
                <CardHeader>
                  <CardTitle>字体设置</CardTitle>
                  <CardDescription>自定义主题的字体样式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary-font">主要字体</Label>
                      <Select value={customTheme.fonts.primary} onValueChange={(value) => handleFontChange('primary', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='"Comic Sans MS", "Marker Felt", "Chalkboard", cursive'>Comic Sans MS</SelectItem>
                          <SelectItem value='"Georgia", "Times New Roman", serif'>Georgia</SelectItem>
                          <SelectItem value='"Arial", sans-serif'>Arial</SelectItem>
                          <SelectItem value='"Helvetica", sans-serif'>Helvetica</SelectItem>
                          <SelectItem value='"Times New Roman", serif'>Times New Roman</SelectItem>
                          <SelectItem value='"Courier New", monospace'>Courier New</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary-font">次要字体</Label>
                      <Select value={customTheme.fonts.secondary} onValueChange={(value) => handleFontChange('secondary', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Arial, sans-serif'>Arial</SelectItem>
                          <SelectItem value='"Helvetica", sans-serif'>Helvetica</SelectItem>
                          <SelectItem value='"Times New Roman", serif'>Times New Roman</SelectItem>
                          <SelectItem value='"Georgia", serif'>Georgia</SelectItem>
                          <SelectItem value='"Courier New", monospace'>Courier New</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="font-size">字体大小: {customTheme.fonts.size}px</Label>
                      <Input
                        id="font-size"
                        type="range"
                        min="12"
                        max="24"
                        value={customTheme.fonts.size}
                        onChange={(e) => handleFontChange('size', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="font-weight">字体粗细</Label>
                      <Select value={customTheme.fonts.weight} onValueChange={(value) => handleFontChange('weight', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">正常</SelectItem>
                          <SelectItem value="bold">粗体</SelectItem>
                          <SelectItem value="lighter">细体</SelectItem>
                          <SelectItem value="bolder">特粗</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="styles">
              <Card>
                <CardHeader>
                  <CardTitle>样式设置</CardTitle>
                  <CardDescription>自定义主题的样式效果</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="border-radius">圆角大小</Label>
                      <Select value={customTheme.styles.borderRadius} onValueChange={(value) => handleStyleChange('borderRadius', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0px">无圆角</SelectItem>
                          <SelectItem value="8px">小圆角</SelectItem>
                          <SelectItem value="16px">中圆角</SelectItem>
                          <SelectItem value="24px">大圆角</SelectItem>
                          <SelectItem value="32px">超大圆角</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shadow">阴影效果</Label>
                      <Select value={customTheme.styles.shadow} onValueChange={(value) => handleStyleChange('shadow', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">无阴影</SelectItem>
                          <SelectItem value="0 2px 4px rgba(0,0,0,0.1)">轻微阴影</SelectItem>
                          <SelectItem value="0 4px 8px rgba(0,0,0,0.1)">中等阴影</SelectItem>
                          <SelectItem value="0 8px 16px rgba(0,0,0,0.1)">明显阴影</SelectItem>
                          <SelectItem value="0 12px 24px rgba(0,0,0,0.15)">强烈阴影</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="animation">动画效果</Label>
                      <Select value={customTheme.styles.animation} onValueChange={(value) => handleStyleChange('animation', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">无动画</SelectItem>
                          <SelectItem value="fadeIn 0.3s ease-in">淡入</SelectItem>
                          <SelectItem value="slideUp 0.3s ease-out">上滑</SelectItem>
                          <SelectItem value="bounce 0.5s ease-out">弹跳</SelectItem>
                          <SelectItem value="pulse 0.6s ease-in-out">脉冲</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backgrounds">
              <Card>
                <CardHeader>
                  <CardTitle>背景设置</CardTitle>
                  <CardDescription>自定义主题的背景图片</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="custom-backgrounds"
                      checked={customTheme.customBackgrounds.enabled}
                      onCheckedChange={(checked) => {
                        setCustomTheme(prev => ({
                          ...prev,
                          customBackgrounds: {
                            ...prev.customBackgrounds,
                            enabled: checked
                          }
                        }))
                        setHasChanges(true)
                      }}
                    />
                    <Label htmlFor="custom-backgrounds">启用自定义背景</Label>
                  </div>
                  
                  {customTheme.customBackgrounds.enabled && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="text-sm font-medium">主页背景</div>
                          {customTheme.customBackgrounds.homeBackground ? (
                            <div className="space-y-2">
                              <div 
                                className="w-full h-32 rounded-lg bg-cover bg-center border"
                                style={{ backgroundImage: `url(${customTheme.customBackgrounds.homeBackground})` }}
                              />
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleBackgroundUpload('home')}
                                >
                                  <UploadIcon className="h-4 w-4 mr-2" />
                                  更换
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleBackgroundRemove('home')}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  移除
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-full h-32 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                                <div className="text-center">
                                  <UploadIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                  <p className="text-sm text-muted-foreground">点击上传背景图片</p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleBackgroundUpload('home')}
                                className="w-full"
                              >
                                <UploadIcon className="h-4 w-4 mr-2" />
                                上传主页背景
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="text-sm font-medium">笔记页背景</div>
                          {customTheme.customBackgrounds.noteBackground ? (
                            <div className="space-y-2">
                              <div 
                                className="w-full h-32 rounded-lg bg-cover bg-center border"
                                style={{ backgroundImage: `url(${customTheme.customBackgrounds.noteBackground})` }}
                              />
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleBackgroundUpload('note')}
                                >
                                  <UploadIcon className="h-4 w-4 mr-2" />
                                  更换
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleBackgroundRemove('note')}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  移除
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-full h-32 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                                <div className="text-center">
                                  <UploadIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                  <p className="text-sm text-muted-foreground">点击上传背景图片</p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleBackgroundUpload('note')}
                                className="w-full"
                              >
                                <UploadIcon className="h-4 w-4 mr-2" />
                                上传笔记页背景
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="icons">
              <Card>
                <CardHeader>
                  <CardTitle>图标设置</CardTitle>
                  <CardDescription>自定义主题的图标样式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="custom-icons"
                      checked={customTheme.customIcons.enabled}
                      onCheckedChange={(checked) => {
                        setCustomTheme(prev => ({
                          ...prev,
                          customIcons: {
                            ...prev.customIcons,
                            enabled: checked
                          }
                        }))
                        setHasChanges(true)
                      }}
                    />
                    <Label htmlFor="custom-icons">启用自定义图标</Label>
                  </div>
                  
                  {customTheme.customIcons.enabled && (
                    <div className="space-y-4">
                      <div className="text-sm font-medium">图标风格</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { value: 'default', label: '默认', icon: '⭐' },
                          { value: 'cute', label: '可爱', icon: '🎀' },
                          { value: 'minimal', label: '极简', icon: '⚡' },
                          { value: 'colorful', label: '彩色', icon: '🌈' },
                          { value: 'outline', label: '轮廓', icon: '📝' }
                        ].map((style) => (
                          <div key={style.value} className="space-y-2">
                            <Button
                              variant={customTheme.customIcons.iconSet === style.value ? 'default' : 'outline'}
                              className="w-full h-20 flex flex-col items-center justify-center space-y-1"
                              onClick={() => {
                                setCustomTheme(prev => ({
                                  ...prev,
                                  customIcons: {
                                    ...prev.customIcons,
                                    iconSet: style.value
                                  }
                                }))
                                setHasChanges(true)
                              }}
                            >
                              <span className="text-2xl">{style.icon}</span>
                              <span className="text-xs">{style.label}</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm font-medium mb-2">预览效果</div>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <Image className={`h-6 w-6 text-primary ${customTheme.customIcons.enabled ? `icons-${customTheme.customIcons.iconSet}` : ''}`} alt="" />
                            <span className="text-sm">图片</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Settings className={`h-6 w-6 text-primary ${customTheme.customIcons.enabled ? `icons-${customTheme.customIcons.iconSet}` : ''}`} />
                            <span className="text-sm">设置</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Palette className={`h-6 w-6 text-primary ${customTheme.customIcons.enabled ? `icons-${customTheme.customIcons.iconSet}` : ''}`} />
                            <span className="text-sm">调色板</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handleReset}>
              重置为默认
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setHasChanges(false)}>
                取消更改
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                保存主题
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}