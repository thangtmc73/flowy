function formatContent(text) {
  const lines = text.split('\n')
  const elements = []
  let key = 0

  for (const line of lines) {
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />)
      continue
    }

    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
    const content = isBullet ? line.replace(/^[\s•\-*]+/, '') : line

    const parts = []
    let partKey = 0

    const boldRegex = /\*\*(.*?)\*\*/g
    let lastIndex = 0
    let match
    while ((match = boldRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={partKey++}>{content.slice(lastIndex, match.index)}</span>)
      }
      parts.push(<strong key={partKey++} className="font-semibold">{match[1]}</strong>)
      lastIndex = boldRegex.lastIndex
    }
    if (lastIndex < content.length) {
      parts.push(<span key={partKey}>{content.slice(lastIndex)}</span>)
    }

    if (isBullet) {
      elements.push(
        <div key={key++} className="flex gap-2.5 items-start">
          <span className="text-brand mt-1 flex-shrink-0 font-bold">•</span>
          <span>{parts}</span>
        </div>
      )
    } else {
      elements.push(<p key={key++} className="leading-relaxed">{parts}</p>)
    }
  }

  return elements
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end message-appear">
        <div className="max-w-[70%]">
          <div className="bg-brand text-white rounded-2xl rounded-br-md px-5 py-3 shadow-sm shadow-brand/15">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 text-right pr-1">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 message-appear">
      <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center flex-shrink-0 shadow-sm shadow-brand/15">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      </div>

      <div className="max-w-[75%] min-w-0">
        <div
          className={`rounded-2xl rounded-tl-md px-5 py-4 shadow-sm text-[15px] leading-relaxed space-y-1.5 ${
            message.isError
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-white border border-slate-200 text-slate-800'
          }`}
        >
          {formatContent(message.content)}
        </div>
        <p className="text-xs text-slate-400 mt-1.5 pl-1">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  )
}
