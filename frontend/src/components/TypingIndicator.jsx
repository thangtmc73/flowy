import { useEffect, useState } from 'react'
import zlpLogoSquare from '../assets/zlp_logo_square.webp'

const WAITING_PHRASES = [
  'Để mình xem nhé',
  'Mình đang tra cứu giúp bạn',
  'Chờ mình một chút nhé',
  'Để mình kiểm tra thông tin',
]

export default function TypingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(() =>
    Math.floor(Math.random() * WAITING_PHRASES.length)
  )
  const [fading, setFading] = useState(false)
  const [dotCount, setDotCount] = useState(1)

  useEffect(() => {
    const id = setInterval(() => {
      setDotCount((c) => (c % 3) + 1)
    }, 300)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setFading(true), 3800)
    return () => clearInterval(id)
  }, [])

  const handlePhraseTransitionEnd = (e) => {
    if (e.propertyName !== 'opacity' || !fading) return
    setPhraseIndex((i) => (i + 1) % WAITING_PHRASES.length)
    setFading(false)
  }

  const phrase = WAITING_PHRASES[phraseIndex]

  return (
    <div className="flex items-start gap-3 sm:gap-4 typing-indicator-enter">
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 shadow-sm avatar-thinking">
        <img src={zlpLogoSquare} alt="Trợ lý tư vấn đang trả lời" className="h-full w-full object-cover" />
      </div>

      <div
        className="bg-brand-light/70 rounded-3xl rounded-tl-lg px-5 sm:px-6 py-3.5 sm:py-4 thinking-bubble border border-brand/20"
        role="status"
        aria-live="polite"
        aria-label={`${phrase}...`}
      >
        <span className="text-sm font-medium text-brand-muted typing-phrase-line ai-streaming">
          <span
            className={`typing-phrase typing-phrase-shimmer ${fading ? 'typing-phrase-hidden' : 'typing-phrase-visible'}`}
            onTransitionEnd={handlePhraseTransitionEnd}
          >
            {phrase}
          </span>
          <span className="typing-ellipsis" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`ellipsis-dot${i < dotCount ? ' is-visible' : ''}`}
              >
                .
              </span>
            ))}
          </span>
        </span>
      </div>
    </div>
  )
}
