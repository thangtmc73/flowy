import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { SUGGESTIONS } from './Sidebar'

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
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-brand flex items-center justify-center flex-shrink-0 shadow-md shadow-brand/20">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
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

            <div className="lg:hidden mb-5 sm:mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Câu hỏi thường gặp
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onSelectQuestion(q)}
                    disabled={disabled}
                    className="text-left text-sm bg-white hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 hover:border-brand/30 rounded-xl px-3.5 py-2.5 transition-colors leading-snug text-slate-700"
                  >
                    {q}
                  </button>
                ))}
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
