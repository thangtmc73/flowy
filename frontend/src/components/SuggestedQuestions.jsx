import { SUGGESTIONS } from '../constants/suggestions'

export default function SuggestedQuestions({ onSelectQuestion, disabled }) {
  // Show max 4 suggestions on initial load
  const visibleSuggestions = SUGGESTIONS.slice(0, 4)

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-4 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {visibleSuggestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuestion(question)}
              disabled={disabled}
              className="cursor-pointer text-left px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 shadow-sm border border-slate-100"
            >
              <span className="line-clamp-2">{question}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
