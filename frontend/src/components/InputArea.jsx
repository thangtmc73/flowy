import { useState, useRef, useEffect } from 'react'

export default function InputArea({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(Math.max(el.scrollHeight, 40), 160) + 'px'
  }, [value])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Nhập câu hỏi về bảo hiểm..."
            rows={1}
            className="flex-1 min-w-0 min-h-10 py-2 bg-transparent resize-none outline-none text-base text-slate-800 placeholder-slate-400 leading-6 disabled:opacity-50"
            style={{ maxHeight: '160px' }}
          />

          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            aria-label={disabled ? 'Đang trả lời' : 'Gửi tin nhắn'}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              value.trim() && !disabled
                ? 'text-brand hover:bg-slate-100 active:bg-slate-200'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            Gửi
          </button>
        </div>

        <p className="hidden sm:block text-xs text-slate-400 mt-2">
          Nhấn Enter để gửi · Shift+Enter để xuống dòng
        </p>
      </div>
    </div>
  )
}
