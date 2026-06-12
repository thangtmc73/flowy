export default function Header({ onReset }) {
  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-md flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Shield icon — represents insurance trust */}
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z" />
          </svg>
        </div>

        <div>
          <h1 className="font-semibold text-base leading-tight">Tư vấn Bảo hiểm Sức khỏe 24/7</h1>
          <p className="text-blue-100 text-xs leading-tight">MSIG Việt Nam × Zalopay</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Online indicator */}
        <span className="flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </span>

        {/* New chat button */}
        <button
          onClick={onReset}
          title="Bắt đầu cuộc trò chuyện mới"
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
