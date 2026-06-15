import { useState, useCallback, useRef } from 'react'
import { sendMessage, generateId, getOrCreateUserId } from '../utils/api'

const INITIAL_WELCOME = {
  id: 'welcome',
  role: 'agent',
  content:
    'Xin chào! 👋 Mình là trợ lý tư vấn **Bảo hiểm** trên Zalopay.\n\nMình có thể giúp bạn:\n• Tìm hiểu về các sản phẩm và quyền lợi bảo hiểm\n• So sánh chi phí và điều kiện giữa các gói\n• Quy trình mua bảo hiểm và thanh toán\n• Hướng dẫn bồi thường và sử dụng\n• Giải đáp mọi thắc mắc về hợp đồng\n\nBạn cần tư vấn điều gì hôm nay? 😊',
  timestamp: new Date().toISOString(),
}

export function useChat() {
  const [messages, setMessages] = useState([INITIAL_WELCOME])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const userId = useRef(getOrCreateUserId())
  const sessionId = useRef('session-' + generateId())

  const send = useCallback(async (messageData) => {
    const text = typeof messageData === 'string' ? messageData : messageData.text
    const fileData = typeof messageData === 'object' ? messageData.file : null
    
    if (!text.trim() || loading) return

    const userMsg = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      hasFile: !!fileData,
      fileName: fileData?.file?.name,
    }

    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setError(null)

    try {
      const data = await sendMessage(
        text.trim(), 
        userId.current, 
        sessionId.current,
        fileData
      )

      const agentMsg = {
        id: generateId(),
        role: 'agent',
        content: data.response,
        timestamp: data.timestamp,
      }
      setMessages((prev) => [...prev, agentMsg])
    } catch (err) {
      setError(err.message)
      const errMsg = {
        id: generateId(),
        role: 'agent',
        content:
          '⚠️ Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại sau.\n\n_' + err.message + '_',
        timestamp: new Date().toISOString(),
        isError: true,
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }, [loading])

  const reset = useCallback(() => {
    sessionId.current = 'session-' + generateId()
    setMessages([INITIAL_WELCOME])
    setError(null)
  }, [])

  return { messages, loading, error, send, reset }
}
