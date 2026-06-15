export const QUICK_REPLY_CATEGORIES = {
  COMPARISON: 'comparison',
  COST: 'cost',
  PROCESS: 'process',
  BENEFITS: 'benefits',
  GENERAL: 'general',
  CLAIM: 'claim',
}

export const QUICK_REPLIES = [
  {
    id: 'compare_health',
    text: '🔍 So sánh gói sức khỏe MSIG vs VBI',
    category: QUICK_REPLY_CATEGORIES.COMPARISON,
    keywords: ['so sánh', 'khác nhau', 'sức khỏe', 'health'],
  },
  {
    id: 'compare_all',
    text: '📊 So sánh tất cả gói bảo hiểm',
    category: QUICK_REPLY_CATEGORIES.COMPARISON,
    keywords: ['so sánh', 'khác nhau', 'các gói'],
  },
  {
    id: 'cost_msig',
    text: '💰 Chi phí bảo hiểm sức khỏe MSIG?',
    category: QUICK_REPLY_CATEGORIES.COST,
    keywords: ['chi phí', 'giá', 'phí', 'msig', 'sức khỏe'],
  },
  {
    id: 'cost_cyber',
    text: '💳 Chi phí bảo hiểm Cyber?',
    category: QUICK_REPLY_CATEGORIES.COST,
    keywords: ['chi phí', 'giá', 'phí', 'cyber'],
  },
  {
    id: 'cost_monthly',
    text: '📅 Có thể trả phí theo tháng không?',
    category: QUICK_REPLY_CATEGORIES.COST,
    keywords: ['trả góp', 'theo tháng', 'monthly'],
  },
  {
    id: 'process_buy',
    text: '🛒 Quy trình mua bảo hiểm?',
    category: QUICK_REPLY_CATEGORIES.PROCESS,
    keywords: ['quy trình', 'cách mua', 'mua như thế nào'],
  },
  {
    id: 'process_claim',
    text: '📋 Hướng dẫn bồi thường?',
    category: QUICK_REPLY_CATEGORIES.CLAIM,
    keywords: ['bồi thường', 'claim', 'yêu cầu'],
  },
  {
    id: 'benefits_msig',
    text: '🏥 Quyền lợi bảo hiểm MSIG?',
    category: QUICK_REPLY_CATEGORIES.BENEFITS,
    keywords: ['quyền lợi', 'bảo vệ gì', 'msig'],
  },
  {
    id: 'benefits_cyber',
    text: '🛡️ Bảo hiểm Cyber bảo vệ gì?',
    category: QUICK_REPLY_CATEGORIES.BENEFITS,
    keywords: ['cyber', 'quyền lợi', 'bảo vệ'],
  },
  {
    id: 'age_range',
    text: '👤 Độ tuổi áp dụng?',
    category: QUICK_REPLY_CATEGORIES.GENERAL,
    keywords: ['độ tuổi', 'tuổi nào', 'age'],
  },
  {
    id: 'waiting_period',
    text: '⏳ Thời gian chờ là gì?',
    category: QUICK_REPLY_CATEGORIES.GENERAL,
    keywords: ['thời gian chờ', 'waiting period'],
  },
  {
    id: 'exclusions',
    text: '⚠️ Trường hợp nào không được bồi thường?',
    category: QUICK_REPLY_CATEGORIES.CLAIM,
    keywords: ['loại trừ', 'không được', 'exclusion'],
  },
  {
    id: 'family',
    text: '👨‍👩‍👧 Mua cho người thân được không?',
    category: QUICK_REPLY_CATEGORIES.GENERAL,
    keywords: ['người thân', 'gia đình', 'family'],
  },
  {
    id: 'contact',
    text: '📞 Liên hệ hotline hỗ trợ',
    category: QUICK_REPLY_CATEGORIES.GENERAL,
    keywords: ['liên hệ', 'hotline', 'support'],
  },
]

// Default quick replies to show on welcome screen or when no context
export const DEFAULT_QUICK_REPLIES = [
  'compare_all',
  'cost_msig',
  'process_buy',
  'benefits_cyber',
]

// Smart suggestion logic: suggest relevant quick replies based on conversation
export function getSuggestedQuickReplies(lastMessage, maxSuggestions = 4) {
  if (!lastMessage) {
    // No conversation yet, show defaults
    return QUICK_REPLIES.filter(qr => DEFAULT_QUICK_REPLIES.includes(qr.id))
  }

  const messageText = lastMessage.toLowerCase()
  
  // Score each quick reply based on keyword matches
  const scoredReplies = QUICK_REPLIES.map(qr => {
    let score = 0
    qr.keywords.forEach(keyword => {
      if (messageText.includes(keyword.toLowerCase())) {
        score += 1
      }
    })
    return { ...qr, score }
  })

  // Filter out replies with score > 0, sort by score, take top N
  const relevant = scoredReplies
    .filter(qr => qr.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)

  // If not enough relevant ones, fill with defaults
  if (relevant.length < maxSuggestions) {
    const defaultReplies = QUICK_REPLIES.filter(qr => 
      DEFAULT_QUICK_REPLIES.includes(qr.id) && 
      !relevant.find(r => r.id === qr.id)
    )
    return [...relevant, ...defaultReplies].slice(0, maxSuggestions)
  }

  return relevant
}

// Get quick replies by category
export function getQuickRepliesByCategory(category) {
  return QUICK_REPLIES.filter(qr => qr.category === category)
}
