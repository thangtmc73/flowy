import { useMemo } from 'react'
import { getSuggestedQuickReplies } from '../constants/quickReplies'

export default function QuickReplyButtons({ messages, onSelectReply, disabled }) {
  // Get the last user or agent message to determine context
  const lastMessage = useMemo(() => {
    if (!messages || messages.length <= 1) return null
    
    // Find last meaningful message (skip welcome message)
    const meaningfulMessages = messages.filter(m => m.id !== 'welcome')
    if (meaningfulMessages.length === 0) return null
    
    const last = meaningfulMessages[meaningfulMessages.length - 1]
    return last.content
  }, [messages])

  // Get suggested quick replies based on context
  const quickReplies = useMemo(() => {
    return getSuggestedQuickReplies(lastMessage, 4)
  }, [lastMessage])

  // Don't show if no replies or disabled
  if (!quickReplies || quickReplies.length === 0) return null

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-3 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickReplies.map((reply) => (
            <button
              key={reply.id}
              onClick={() => onSelectReply(reply.text)}
              disabled={disabled}
              className="flex-shrink-0 cursor-pointer px-3.5 py-2 rounded-full bg-white hover:bg-brand-light hover:border-brand border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm text-slate-700 hover:text-brand font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 shadow-sm whitespace-nowrap"
              title={`Click để hỏi: ${reply.text}`}
            >
              {reply.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
