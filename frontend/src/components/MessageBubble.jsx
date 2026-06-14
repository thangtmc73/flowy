import zlpLogoSquare from '../assets/zlp_logo_square.webp'

function parseBoldText(content) {
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

  return parts.length > 0 ? parts : [content]
}

function formatContent(text) {
  const lines = text.split('\n')
  const elements = []
  let key = 0

  for (const line of lines) {
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />)
      continue
    }

    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/)
    if (headerMatch) {
      const level = headerMatch[1].length
      const text = headerMatch[2]
      const className = level === 1 
        ? 'text-xl font-bold text-slate-900 mt-4 mb-2'
        : level === 2
        ? 'text-lg font-semibold text-slate-800 mt-3 mb-1.5'
        : 'text-base font-semibold text-slate-800 mt-2 mb-1'
      
      elements.push(
        <div key={key++} className={className}>{parseBoldText(text)}</div>
      )
      continue
    }

    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
    const content = isBullet ? line.replace(/^[\s•\-*]+/, '') : line
    const parts = parseBoldText(content)

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
        <div className="max-w-[88%] sm:max-w-[75%] lg:max-w-[70%]">
          <div className="bg-brand text-white rounded-2xl rounded-br-md px-4 sm:px-5 py-2.5 sm:py-3 shadow-sm shadow-brand/15">
            <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 text-right pr-1">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 sm:gap-3 message-appear">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shrink-0 shadow-sm">
        <img src={zlpLogoSquare} alt="Zalopay" className="h-full w-full object-cover" />
      </div>

      <div className="max-w-[88%] sm:max-w-[80%] lg:max-w-[75%] min-w-0">
        <div
          className={`rounded-2xl rounded-tl-md px-4 sm:px-5 py-3 sm:py-4 shadow-sm text-sm sm:text-[15px] leading-relaxed space-y-1.5 break-words ${
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
