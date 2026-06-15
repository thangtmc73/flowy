const HIGHLIGHTS = [
  {
    title: 'Tư vấn 24/7',
    desc: 'Hỗ trợ mọi lúc, mọi nơi qua Zalopay',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: 'Đa dạng sản phẩm',
    desc: 'Nhiều gói bảo hiểm phù hợp với nhu cầu',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
  },
  {
    title: 'So sánh dễ dàng',
    desc: 'Chi phí, quyền lợi, độ tuổi của các gói',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    ),
  },
]

import { useEffect } from 'react'
import zlpLogoHorizontalWhite from '../assets/zlp_logo_horizontal_white.webp'

export default function Sidebar({ isOpen, onClose }) {
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
          bg-brand text-white h-full
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
      {/* Brand */}
      <div className="px-5 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-7">
        <div className="flex items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="lg:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <img
              src={zlpLogoHorizontalWhite}
              alt="Zalopay"
              className="h-7 sm:h-8 w-auto max-w-full object-contain object-left"
            />
            <h1 className="font-semibold text-lg leading-snug mt-3.5">
              Tư vấn bảo hiểm Zalopay
            </h1>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="flex-1 overflow-y-auto chat-scroll px-5 sm:px-6 py-2 space-y-1 min-h-0">
        {HIGHLIGHTS.map((item) => (
          <div key={item.title} className="flex gap-3.5 p-3 rounded-2xl hover:bg-white/5 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
              <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {item.icon}
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-white/75 text-xs mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 sm:px-6 py-4 text-xs text-white/60 leading-relaxed">
        Thông tin chỉ mang tính tham khảo. Vui lòng tham khảo hợp đồng bảo hiểm chính thức.
      </div>
    </aside>
    </>
  )
}
