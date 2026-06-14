import { useState, useRef, useEffect } from 'react'
import { SUGGESTIONS } from './Sidebar'

export default function SuggestedQuestions({ onSelectQuestion, disabled }) {
  const [expanded, setExpanded] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)
  const hiddenContentRef = useRef(null)

  useEffect(() => {
    if (hiddenContentRef.current) {
      setContentHeight(hiddenContentRef.current.scrollHeight)
    }
  }, [])

  return (
    <div className="border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="max-w-4xl mx-auto">
        {SUGGESTIONS.length > 3 && (
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-brand hover:text-brand-hover font-medium transition-colors flex items-center gap-1"
            >
              {expanded ? 'Thu gọn' : `Xem thêm (${SUGGESTIONS.length - 3})`}
              <svg 
                className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.slice(0, 3).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onSelectQuestion(q)}
              disabled={disabled}
              className="text-left text-sm bg-slate-50 hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 hover:border-brand/30 rounded-xl px-3.5 py-2.5 transition-colors leading-snug text-slate-700"
            >
              {q}
            </button>
          ))}
        </div>
        
        <div 
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: expanded ? `${contentHeight}px` : '0' }}
        >
          <div ref={hiddenContentRef} className="flex flex-wrap gap-2 mt-2">
            {SUGGESTIONS.slice(3).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onSelectQuestion(q)}
                disabled={disabled}
                className="text-left text-sm bg-slate-50 hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 hover:border-brand/30 rounded-xl px-3.5 py-2.5 transition-colors leading-snug text-slate-700"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
