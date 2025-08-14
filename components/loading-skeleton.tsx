export function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header Skeleton */}
      <div className="gradient-header px-4 py-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse" />
            <div className="w-20 h-6 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded animate-pulse" />
            <div className="w-8 h-8 bg-white/20 rounded animate-pulse" />
            <div className="w-8 h-8 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="max-w-md mx-auto space-y-4">
          {/* Filter Button Skeleton */}
          <div className="w-32 h-8 bg-white/60 dark:bg-gray-700/60 rounded animate-pulse" />

          {/* Note Cards Skeleton */}
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="note-card p-4 space-y-3 animate-pulse"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="w-full h-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="flex space-x-2">
                <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </main>

      {/* Footer Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 footer-blur border-t border-white/20 dark:border-gray-700/20">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="w-48 h-4 bg-slate-200/60 dark:bg-slate-700/60 rounded mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}
