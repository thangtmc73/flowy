import zlpLogoSquare from '../assets/zlp_logo_square.webp'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 sm:gap-3 message-appear">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shrink-0 shadow-sm">
        <img src={zlpLogoSquare} alt="Zalopay" className="h-full w-full object-cover" />
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
