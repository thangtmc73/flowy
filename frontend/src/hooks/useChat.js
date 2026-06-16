import { useState, useCallback, useRef } from 'react'
import { sendMessage, generateId, getOrCreateUserId } from '../utils/api'
import { unlockAudioSync, playSendFeedback, playReceiveFeedback, playThinkingFeedback } from '../utils/chatSounds'

const INITIAL_WELCOME = {
  id: 'welcome',
  role: 'agent',
  content:
    'Xin chào! 👋 Mình là trợ lý tư vấn **Bảo hiểm** trên Zalopay.\n\nMình có thể giúp bạn:\n* Tìm hiểu về các sản phẩm và quyền lợi bảo hiểm\n* So sánh chi phí và điều kiện giữa các gói\n* Đọc link hoặc file bảo hiểm bên ngoài và so sánh với gói trên Zalopay\n* Quy trình mua bảo hiểm và thanh toán\n* Hướng dẫn bồi thường và sử dụng\n* Giải đáp mọi thắc mắc về hợp đồng\n\nBạn cần tư vấn điều gì hôm nay? 😊',
  timestamp: new Date().toISOString(),
}

export function useChat() {
  const [messages, setMessages] = useState([INITIAL_WELCOME])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const userId = useRef(getOrCreateUserId())
  const sessionId = useRef('session-' + generateId())
  const lastFailedRef = useRef(null)

  const clearToast = useCallback(() => setToast(null), [])

  const send = useCallback(async (messageData, options = {}) => {
    const { isRetry = false } = options
    const text = typeof messageData === 'string' ? messageData : messageData.text
    const fileData = typeof messageData === 'object' ? messageData.file : null

    if (!text.trim() || loading) return

    unlockAudioSync()
    playSendFeedback()

    const userMsg = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      hasFile: !!fileData,
      fileName: fileData?.file?.name,
      status: 'sent',
    }

    setMessages((prev) => {
      let next = prev
      if (isRetry) {
        next = [...prev]
        if (next.at(-1)?.isError) next.pop()
        const lastUser = next.at(-1)
        if (lastUser?.role === 'user' && lastUser?.status === 'failed') next.pop()
      }
      return [...next, userMsg]
    })
    setLoading(true)
    setTimeout(() => playThinkingFeedback(), 160)
    setToast(null)
    lastFailedRef.current = null

    try {
      const data = await sendMessage(
        text.trim(),
        userId.current,
        sessionId.current,
        fileData
      )

      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: 'delivered' } : m))
      )

      const agentMsg = {
        id: generateId(),
        role: 'agent',
        content: data.response,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, agentMsg])
      playReceiveFeedback()
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: 'failed' } : m))
      )

      lastFailedRef.current = messageData

      setToast({
        type: 'error',
        message: 'Không gửi được tin nhắn. Kiểm tra kết nối và thử lại.',
        detail: err.message,
      })

      const errMsg = {
        id: generateId(),
        role: 'agent',
        content: 'Xin lỗi, mình chưa trả lời được câu hỏi này. Bạn thử gửi lại nhé.',
        timestamp: new Date().toISOString(),
        isError: true,
      }
      setMessages((prev) => [...prev, errMsg])
      playReceiveFeedback()
    } finally {
      setLoading(false)
    }
  }, [loading])

  const retryLast = useCallback(() => {
    if (!lastFailedRef.current || loading) return
    const payload = lastFailedRef.current
    clearToast()
    send(payload, { isRetry: true })
  }, [loading, send, clearToast])

  const reset = useCallback(() => {
    sessionId.current = 'session-' + generateId()
    setMessages([INITIAL_WELCOME])
    setToast(null)
    lastFailedRef.current = null
  }, [])

  return { messages, loading, toast, send, retryLast, clearToast, reset }
}
