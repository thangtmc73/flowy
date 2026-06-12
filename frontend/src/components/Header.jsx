export default function Header({ onReset, onMenuClick }) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-3 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Mở menu"
          className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <h2 className="font-semibold text-slate-900 text-base sm:text-lg leading-tight">
            Trò chuyện tư vấn
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 line-clamp-1 sm:line-clamp-none">
            Hỏi bất kỳ điều gì về Bảo hiểm Sức khỏe 24/7
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <span className="hidden sm:flex items-center gap-2 bg-brand-light text-brand rounded-full px-4 py-1.5 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Đang trực tuyến
        </span>

        <span
          className="sm:hidden w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"
          title="Đang trực tuyến"
        />

        <button
          onClick={onReset}
          title="Bắt đầu cuộc trò chuyện mới"
          aria-label="Cuộc trò chuyện mới"
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="hidden sm:inline">Cuộc trò chuyện mới</span>
        </button>
      </div>
    </header>
  )
}
