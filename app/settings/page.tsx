"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Trash2, Download, Upload } from "lucide-react"
import Link from "next/link"

interface UserSettings {
  autoSave: boolean
  fontSize: number
  userName: string
}

export default function SettingsPage() {
  const [autoSave, setAutoSave] = useState(true)
  const [fontSize, setFontSize] = useState(16)
  const [userName, setUserName] = useState("")
  const { toast } = useToast()

  // 加载保存的设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      try {
        const settings: UserSettings = JSON.parse(savedSettings)
        setAutoSave(settings.autoSave)
        setFontSize(settings.fontSize)
        setUserName(settings.userName)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  const handleSave = () => {
    const settings: UserSettings = {
      autoSave,
      fontSize,
      userName
    }
    
    localStorage.setItem('userSettings', JSON.stringify(settings))
    
    toast({
      title: "设置已保存",
      description: "您的设置已成功保存",
    })
  }

  const handleExportData = () => {
    try {
      // 获取所有数据
      const settings = localStorage.getItem('userSettings')
      const notes = localStorage.getItem('notes')
      
      const exportData = {
        settings: settings ? JSON.parse(settings) : null,
        notes: notes ? JSON.parse(notes) : null,
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
        
        // 重置为默认设置
        setAutoSave(true)
        setFontSize(16)
        setUserName("")
        
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

  return (
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
          {/* 用户设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">用户设置</CardTitle>
              <CardDescription>个性化您的使用体验</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  placeholder="请输入您的用户名"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fontsize">字体大小</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="fontsize"
                    type="number"
                    min="12"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">像素</span>
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
                <span className="text-muted-foreground">开发者</span>
                <span>小纸条团队</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}