import { useCallback, useState } from 'react'
import { isChatFeedbackEnabled, setChatFeedbackEnabled, previewChatFeedback } from '../utils/chatSounds'

export default function Header({ onReset, onMenuClick }) {
  const [feedbackOn, setFeedbackOn] = useState(isChatFeedbackEnabled)

  const toggleFeedback = useCallback(() => {
    const next = !feedbackOn
    setFeedbackOn(next)
    setChatFeedbackEnabled(next)
    if (next) {
      previewChatFeedback()
    }
  }, [feedbackOn])

  return (
    <header className="bg-transparent px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2 shrink-0">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Mở menu"
        className="cursor-pointer lg:hidden w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 flex items-center justify-center shrink-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/30 shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggleFeedback}
          title={feedbackOn ? 'Tắt âm thanh & rung' : 'Bật âm thanh & rung'}
          aria-label={feedbackOn ? 'Tắt âm thanh & rung' : 'Bật âm thanh & rung'}
          aria-pressed={feedbackOn}
          className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/30 shadow-sm border ${
            feedbackOn
              ? 'bg-white border-brand/25 text-brand hover:bg-brand-light hover:border-brand/35'
              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          {feedbackOn ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6 10H4a1 1 0 00-1 1v2a1 1 0 001 1h2l4 4V6L6 10z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        <button
          onClick={onReset}
          title="Bắt đầu cuộc trò chuyện mới"
          aria-label="Cuộc trò chuyện mới"
          className="cursor-pointer inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="hidden sm:inline">Cuộc trò chuyện mới</span>
        </button>
      </div>
    </header>
  )
}
