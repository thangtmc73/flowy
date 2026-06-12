/**
 * Render markdown-like formatting in agent messages:
 * **bold**, *italic*, bullet lists, line breaks.
 * Kept intentionally simple — no external markdown parser needed.
 */
function formatContent(text) {
  const lines = text.split('\n')
  const elements = []
  let key = 0

  for (const line of lines) {
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />)
      continue
    }

    // Bullet points
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
    const content = isBullet ? line.replace(/^[\s•\-*]+/, '') : line

    const parts = []
    let remaining = content
    let partKey = 0

    // Parse **bold** inline
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
      parts.push(<span key={partKey++}>{content.slice(lastIndex)}</span>)
    }

    if (isBullet) {
      elements.push(
        <div key={key++} className="flex gap-2 items-start">
          <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
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

export default function MessageBubble({ message, onSuggest }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end message-appear">
        <div className="max-w-[75%]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right pr-1">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 message-appear">
      {/* Agent avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mb-5 shadow-sm">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      </div>

      <div className="max-w-[78%]">
        <div
          className={`rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm text-sm leading-relaxed space-y-1 ${
            message.isError
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-white border border-slate-200 text-slate-800'
          }`}
        >
          {formatContent(message.content)}
        </div>
        <p className="text-xs text-slate-400 mt-1 pl-1">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  )
}
