export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 message-appear">
      {/* Agent avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mb-1">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 dot-1" />
          <span className="w-2 h-2 rounded-full bg-blue-400 dot-2" />
          <span className="w-2 h-2 rounded-full bg-blue-400 dot-3" />
        </div>
      </div>
    </div>
  )
}
