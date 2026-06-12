export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 sm:gap-3 message-appear">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand flex items-center justify-center flex-shrink-0 shadow-sm shadow-brand/15">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand dot-1" />
          <span className="w-2 h-2 rounded-full bg-brand dot-2" />
          <span className="w-2 h-2 rounded-full bg-brand dot-3" />
        </div>
      </div>
    </div>
  )
}
