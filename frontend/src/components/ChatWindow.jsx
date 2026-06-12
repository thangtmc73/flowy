import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const isWelcomeOnly = messages.length === 1 && messages[0].id === 'welcome'

  return (
    <div className="flex-1 overflow-y-auto chat-scroll bg-slate-50 min-h-0">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {isWelcomeOnly && (
          <div className="mb-8 rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center flex-shrink-0 shadow-md shadow-brand/20">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Chào mừng bạn đến với tư vấn bảo hiểm
                </h3>
                <p className="text-slate-500 mt-2 leading-relaxed">
                  Chọn câu hỏi gợi ý bên trái hoặc nhập câu hỏi của bạn bên dưới.
                  Trợ lý AI sẽ giúp bạn tìm hiểu sản phẩm, quyền lợi và quy trình bồi thường.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {loading && <TypingIndicator />}
        </div>

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  )
}
