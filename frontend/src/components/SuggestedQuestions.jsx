import { SUGGESTIONS } from './Sidebar'

export default function SuggestedQuestions({ onSelectQuestion, disabled }) {
  // Show max 4 suggestions on initial load
  const visibleSuggestions = SUGGESTIONS.slice(0, 4)

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-3 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {visibleSuggestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuestion(question)}
              disabled={disabled}
              className="text-left px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm text-slate-700 hover:text-slate-900 group"
            >
              <span className="line-clamp-2">{question}</span>
              <svg className="w-4 h-4 inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
