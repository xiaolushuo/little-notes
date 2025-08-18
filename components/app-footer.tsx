export function AppFooter() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 footer-blur border-t border-white/20 dark:border-gray-700/20 
                       animate-in slide-in-from-bottom-2 duration-500"
    >
      <div className="max-w-md mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <p
          className="text-center text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 
                      animate-in fade-in duration-700 delay-300"
        >
          小纸条 用心记录 轻便生活
        </p>
      </div>
    </footer>
  )
}
