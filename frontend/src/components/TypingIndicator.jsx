import zlpLogoSquare from '../assets/zlp_logo_square.webp'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 sm:gap-4 message-appear">
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 shadow-sm">
        <img src={zlpLogoSquare} alt="Trợ lý AI đang trả lời" className="h-full w-full object-cover" />
      </div>

      <div className="bg-white rounded-3xl px-6 py-4 shadow-sm" role="status" aria-live="polite" aria-label="Trợ lý AI đang trả lời">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand dot-1" aria-hidden="true" />
          <span className="w-2 h-2 rounded-full bg-brand dot-2" aria-hidden="true" />
          <span className="w-2 h-2 rounded-full bg-brand dot-3" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
