import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "小纸条 - 用心记录 轻便生活",
  description: "简单记录生活的美好",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <style>{`
html {
  font-family: ${openSans.style.fontFamily};
  --font-sans: ${openSans.variable};
  --font-serif: ${montserrat.variable};
}
        `}</style>
      </head>
      <body className={`${montserrat.variable} ${openSans.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
