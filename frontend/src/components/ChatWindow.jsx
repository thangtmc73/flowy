import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import zlpLogoSquare from '../assets/zlp_logo_square.webp'

export default function ChatWindow({ messages, loading, onSelectQuestion, disabled }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const isWelcomeOnly = messages.length === 1 && messages[0].id === 'welcome'

  return (
    <div className="flex-1 overflow-y-auto chat-scroll bg-slate-50 min-h-0 overscroll-contain">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {isWelcomeOnly && (
          <>
            <div className="mb-5 sm:mb-8 rounded-2xl bg-white border border-slate-200 p-5 sm:p-8 shadow-sm">
              <div className="flex items-start gap-3 sm:gap-5">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                  <img src={zlpLogoSquare} alt="Zalopay" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
                    Chào mừng bạn đến với tư vấn bảo hiểm
                  </h3>
                  <p className="text-slate-500 mt-2 leading-relaxed text-sm sm:text-base">
                    Chọn câu hỏi gợi ý hoặc nhập câu hỏi của bạn bên dưới.
                    Trợ lý AI sẽ giúp bạn tìm hiểu sản phẩm, quyền lợi và quy trình bồi thường.
                  </p>
                </div>
              </div>
            </div>

          </>
        )}

        <div className="space-y-4 sm:space-y-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {loading && <TypingIndicator />}
        </div>

        <div ref={bottomRef} className="h-2 sm:h-4" />
      </div>
    </div>
  )
}
