// In production the frontend is served from the same origin as the agent (via nginx),
// so relative URLs work with no CORS issues.
// For local dev, set VITE_API_BASE_URL=/api so the Vite proxy rewrites to the prod endpoint.
const PROD_BASE = import.meta.env.VITE_API_BASE_URL || ''

/**
 * Send a message to the AgentBase insurance FAQ agent.
 * @param {string} message
 * @param {string} userId  - Stable per-browser-session ID
 * @param {string} sessionId - Current chat session ID
 * @returns {Promise<{response: string, timestamp: string}>}
 */
export async function sendMessage(message, userId, sessionId) {
  const res = await fetch(`${PROD_BASE}/invocations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GreenNode-AgentBase-User-Id': userId,
      'X-GreenNode-AgentBase-Session-Id': sessionId,
    },
    body: JSON.stringify({ message }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const data = await res.json()

  if (data.status === 'error') {
    throw new Error(data.error || 'Agent returned an error')
  }

  return {
    response: data.response ?? data.message ?? JSON.stringify(data),
    timestamp: data.timestamp ?? new Date().toISOString(),
  }
}

/** Generate a compact UUID-like random ID */
export function generateId() {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

/** Get or create a stable user ID stored in localStorage */
export function getOrCreateUserId() {
  const key = 'insurance-chat-user-id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = 'user-' + generateId()
    localStorage.setItem(key, id)
  }
  return id
}
