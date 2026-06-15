import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import zlpLogoSquare from '../assets/zlp_logo_square.webp'

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const isWelcomeOnly = messages.length === 1 && messages[0].id === 'welcome'

  return (
    <div className="flex-1 overflow-y-auto chat-scroll bg-slate-50 min-h-0 overscroll-contain">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isWelcomeOnly && (
          <>
            <div className="mb-8 sm:mb-10 rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 shadow-sm">
                  <img src={zlpLogoSquare} alt="Trợ lý AI Zalopay" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
                    Chào mừng bạn đến với tư vấn bảo hiểm
                  </h3>
                  <p className="text-slate-600 mt-2.5 leading-relaxed text-[15px]">
                    Chọn câu hỏi gợi ý hoặc nhập câu hỏi của bạn bên dưới.
                    Trợ lý AI sẽ giúp bạn tìm hiểu sản phẩm, quyền lợi và quy trình bồi thường.
                  </p>
                </div>
              </div>
            </div>

          </>
        )}

        <div className="space-y-5 sm:space-y-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {loading && <TypingIndicator />}
        </div>

        <div ref={bottomRef} className="h-4 sm:h-6" />
      </div>
    </div>
  )
}
