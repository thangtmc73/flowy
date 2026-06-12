const HIGHLIGHTS = [
  {
    title: 'Tư vấn 24/7',
    desc: 'Hỗ trợ mọi lúc, mọi nơi qua Zalopay',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: 'Quyền lợi rõ ràng',
    desc: 'Nội trú, ngoại trú và bồi thường minh bạch',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    title: 'MSIG Việt Nam',
    desc: 'Đối tác bảo hiểm uy tín hàng đầu',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
  },
]

import { useEffect } from 'react'

export const SUGGESTIONS = [
  'Bảo hiểm Sức khỏe 24/7 là gì?',
  'Quyền lợi nội trú gồm những gì?',
  'Làm thế nào để mua bảo hiểm?',
  'Quy trình bồi thường như thế nào?',
  'Phí bảo hiểm hàng tháng là bao nhiêu?',
  'Khám ngoại trú có được bồi thường không?',
]

export default function Sidebar({ onSelectQuestion, disabled, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-[min(100vw,20rem)] xl:w-96 flex-shrink-0 flex flex-col
          bg-brand text-white h-full border-r border-brand-hover/30
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
      {/* Brand */}
      <div className="px-5 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-white/10">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="lg:hidden w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0 ring-1 ring-white/20">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-snug">Bảo hiểm Sức khỏe 24/7</h1>
            <p className="text-white/70 text-sm mt-0.5">MSIG Việt Nam × Zalopay</p>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="px-6 py-6 space-y-4 border-b border-white/10">
        {HIGHLIGHTS.map((item) => (
          <div key={item.title} className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested questions */}
      <div className="flex-1 overflow-y-auto chat-scroll px-6 py-6 min-h-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">
          Câu hỏi thường gặp
        </p>
        <div className="space-y-2">
          {SUGGESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => onSelectQuestion(q)}
              disabled={disabled}
              className="w-full text-left text-sm bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-xl px-4 py-3 transition-colors leading-snug"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 sm:px-6 py-4 border-t border-white/10 text-xs text-white/50">
        Thông tin chỉ mang tính tham khảo. Vui lòng tham khảo hợp đồng bảo hiểm chính thức.
      </div>
    </aside>
    </>
  )
}
