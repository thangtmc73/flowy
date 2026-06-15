let audioCtx = null
let masterGain = null
let initDone = false

const SEND_TONE = { frequency: 660, duration: 0.14, type: 'sine', volume: 0.28, attack: 0.008, decay: 0.1 }
const RECEIVE_TONE_1 = { frequency: 523, duration: 0.1, type: 'sine', volume: 0.25, attack: 0.006, decay: 0.08 }
const RECEIVE_TONE_2 = { frequency: 784, duration: 0.2, type: 'sine', volume: 0.28, attack: 0.008, decay: 0.15 }
const THINKING_TONE = { frequency: 392, duration: 0.22, type: 'triangle', volume: 0.18, attack: 0.015, decay: 0.18 }

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
    masterGain = audioCtx.createGain()
    masterGain.gain.value = 1
    masterGain.connect(audioCtx.destination)
  }
  return audioCtx
}

export function canPlayChatSounds() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('flowy-chat-sounds') !== 'off'
}

function playToneOnCtx(ctx, { frequency, duration, type, volume, attack, decay }) {
  const output = masterGain ?? ctx.destination
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, now)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), now + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay)

  osc.connect(gain)
  gain.connect(output)

  osc.start(now)
  osc.stop(now + duration + 0.05)
}

function runWithAudio(play) {
  if (!canPlayChatSounds()) return

  const ctx = getAudioContext()
  if (!ctx) return

  const start = () => {
    try {
      playToneOnCtx(ctx, play)
    } catch {
      void ctx.resume().then(() => playToneOnCtx(ctx, play)).catch(() => {})
    }
  }

  // resume() sync trong gesture, rồi phát ngay — không chờ promise
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  start()
}

/** Unlock audio — gọi trên mọi tương tác người dùng. */
export function unlockAudioSync() {
  if (!canPlayChatSounds()) return

  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
}

export function initChatSounds() {
  if (initDone || typeof window === 'undefined') return
  initDone = true

  const onInteraction = () => unlockAudioSync()

  window.addEventListener('pointerdown', onInteraction, true)
  window.addEventListener('keydown', onInteraction, true)
  window.addEventListener('touchstart', onInteraction, true)
}

export function playSendSound() {
  unlockAudioSync()
  runWithAudio(SEND_TONE)
}

export function playReceiveSound() {
  runWithAudio(RECEIVE_TONE_1)
  setTimeout(() => runWithAudio(RECEIVE_TONE_2), 100)
}

export function playThinkingSound() {
  runWithAudio(THINKING_TONE)
}
