import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import zlpLogoSquare from '../assets/zlp_logo_square.webp'

function formatTime(iso) {
  try {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return ''
  }
}

function MessageTime({ timestamp, align }) {
  const time = formatTime(timestamp)
  if (!time) return null

  return (
    <p
      className={`text-xs text-slate-400 mt-2 tabular-nums ${
        align === 'right' ? 'text-right pr-2' : 'pl-2'
      }`}
    >
      {time}
    </p>
  )
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[80%] message-appear-user">
          <div className="bg-brand text-white rounded-3xl rounded-br-lg px-5 sm:px-6 py-3 sm:py-3.5 user-bubble">
            {message.hasFile && message.fileName && (
              <div className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-white/20">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-xs font-medium truncate">{message.fileName}</span>
              </div>
            )}
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap wrap-break-word">{message.content}</p>
          </div>
          <MessageTime timestamp={message.timestamp} align="right" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 shadow-sm agent-avatar-enter">
        <img src={zlpLogoSquare} alt="Trợ lý AI Zalopay" className="h-full w-full object-cover" />
      </div>

      <div className="max-w-[85%] sm:max-w-[80%] min-w-0 message-appear-agent">
        <div
          className={`rounded-3xl rounded-tl-lg px-5 sm:px-6 py-3.5 sm:py-4 text-[15px] wrap-break-word ${
            message.isError
              ? 'bg-red-50 text-red-800'
              : 'bg-white text-slate-800 agent-bubble'
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styling for markdown elements
              h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-900 mt-4 mb-2 first:mt-0" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-slate-800 mt-3 mb-1.5 first:mt-0" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-base font-semibold text-slate-800 mt-2 mb-1 first:mt-0" {...props} />,
              p: ({node, ...props}) => <p className="leading-relaxed mb-2 last:mb-0" {...props} />,
              ul: ({node, ...props}) => <ul className="space-y-1.5 mb-2 list-none" {...props} />,
              ol: ({node, ...props}) => <ol className="space-y-1.5 mb-2 list-decimal list-inside" {...props} />,
              li: ({node, ordered, ...props}) => (
                ordered ? (
                  <li className="ml-4" {...props} />
                ) : (
                  <li className="flex gap-2 items-start">
                    <span className="text-brand shrink-0 font-bold">•</span>
                    <span className="flex-1">{props.children}</span>
                  </li>
                )
              ),
              table: ({node, ...props}) => (
                <div className="overflow-x-auto my-3">
                  <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg" {...props} />
                </div>
              ),
              thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
              th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider" {...props} />,
              td: ({node, ...props}) => <td className="px-3 py-2 text-sm text-slate-800 border-t border-slate-200" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
              em: ({node, ...props}) => <em className="italic" {...props} />,
              code: ({node, inline, ...props}) => 
                inline 
                  ? <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                  : <code className="block bg-slate-100 px-3 py-2 rounded-lg text-xs font-mono overflow-x-auto my-2" {...props} />,
              a: ({node, ...props}) => <a className="text-brand hover:underline focus:outline-none focus:ring-2 focus:ring-brand/30 rounded" {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <MessageTime timestamp={message.timestamp} align="left" />
      </div>
    </div>
  )
}
