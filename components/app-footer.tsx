import { Sparkles } from "lucide-react"

export function AppFooter() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 gradient-header border-t border-white/20 dark:border-gray-700/20 
                       animate-in slide-in-from-bottom-2 duration-500 backdrop-blur-md z-40"
    >
      <div className="max-w-md mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-4 w-4 text-white/80 pulse-animation" />
          <p
            className="text-center text-sm sm:text-base font-medium text-white 
                       animate-in fade-in duration-700 delay-300"
          >
            小纸条 用心记录 轻便生活
          </p>
          <Sparkles className="h-4 w-4 text-white/80 pulse-animation" style={{animationDelay: '0.5s'}} />
        </div>
      </div>
    </footer>
  )
}
