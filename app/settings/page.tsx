"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Settings, Sparkles } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "设置已保存",
      description: "您的设置已成功保存",
    })
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-blue-50 dark:from-brand-dark dark:via-gray-900 dark:to-slate-900">
        <div className="max-w-md mx-auto p-4 safe-area-top safe-area-bottom">
          {/* 顶部导航 */}
          <div className="flex items-center justify-between mb-8 animate-in slide-in-from-top-3 duration-500">
            <Link href="/">
              <Button variant="ghost" size="sm" className="btn-modern glass-morphism px-4 py-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center float-animation">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">设置</h1>
            </div>
            <Button onClick={handleSave} size="sm" className="btn-modern gradient-primary text-white px-4 py-2">
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>

          {/* 设置选项 */}
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <Card className="glass-card shadow-2xl border-0">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 pulse-animation">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl gradient-primary bg-clip-text text-transparent">设置中心</CardTitle>
                <CardDescription className="text-muted-foreground">个性化您的小纸条体验</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="glass-card p-6 rounded-xl">
                  <p className="text-muted-foreground mb-4">设置功能暂时不可用</p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-brand-primary rounded-full bounce-animation"></div>
                    <div className="w-2 h-2 bg-brand-secondary rounded-full bounce-animation" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-brand-accent rounded-full bounce-animation" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="btn-modern w-full"
                  onClick={() => {
                    toast({
                      title: "敬请期待",
                      description: "更多精彩功能即将上线",
                    })
                  }}
                >
                  了解更多
                </Button>
              </CardContent>
            </Card>

            {/* 装饰性卡片 */}
            <Card className="glass-card shadow-xl border-0">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4 rounded-xl text-center">
                    <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs text-muted-foreground">简洁设计</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl text-center">
                    <div className="w-8 h-8 gradient-success rounded-full flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs text-muted-foreground">流畅体验</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}