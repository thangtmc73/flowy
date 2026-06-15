import { useCallback, useState } from 'react'
import { unlockAudioSync, playSendSound } from '../utils/chatSounds'

function getInitialSoundOn() {
  if (typeof window === 'undefined') return true
  return localStorage.getItem('flowy-chat-sounds') !== 'off'
}

export default function Header({ onReset, onMenuClick }) {
  const [soundOn, setSoundOn] = useState(getInitialSoundOn)

  const toggleSound = useCallback(() => {
    const next = !soundOn
    setSoundOn(next)
    localStorage.setItem('flowy-chat-sounds', next ? 'on' : 'off')
    if (next) {
      unlockAudioSync()
      playSendSound()
    }
  }, [soundOn])

  return (
    <header className="bg-white px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2 flex-shrink-0 shadow-sm">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Mở menu"
        className="cursor-pointer lg:hidden w-10 h-10 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center flex-shrink-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSound}
          title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
          aria-label={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
          aria-pressed={soundOn}
          className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/30 ${
            soundOn ? 'bg-brand-light text-brand hover:bg-brand/15' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
          }`}
        >
          {soundOn ? (
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
          className="cursor-pointer inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/30"
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
