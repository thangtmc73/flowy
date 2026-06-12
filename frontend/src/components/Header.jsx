export default function Header({ onReset }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 className="font-semibold text-slate-900 text-lg">Trò chuyện tư vấn</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Hỏi bất kỳ điều gì về Bảo hiểm Sức khỏe 24/7
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 bg-brand-light text-brand rounded-full px-4 py-1.5 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Đang trực tuyến
        </span>

        <button
          onClick={onReset}
          title="Bắt đầu cuộc trò chuyện mới"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Cuộc trò chuyện mới
        </button>
      </div>
    </header>
  )
}
