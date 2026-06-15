export default function Header({ onReset, onMenuClick }) {
  return (
    <header className="bg-white px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2 flex-shrink-0 shadow-sm">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Mở menu"
        className="cursor-pointer lg:hidden w-10 h-10 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center flex-shrink-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <button
        onClick={onReset}
        title="Bắt đầu cuộc trò chuyện mới"
        aria-label="Cuộc trò chuyện mới"
        className="cursor-pointer ml-auto inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="hidden sm:inline">Cuộc trò chuyện mới</span>
      </button>
    </header>
  )
}
