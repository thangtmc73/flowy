export const QUICK_REPLY_CATEGORIES = {
  COMPARISON: 'comparison',
  COST: 'cost',
  PROCESS: 'process',
  BENEFITS: 'benefits',
  GENERAL: 'general',
  CLAIM: 'claim',
}

export const INSURANCE_PRODUCTS = {
  MSIG: 'msig',
  VBI: 'vbi',
  GIC: 'gic',
  BAOVIET: 'baoviet',
}

const PRODUCT_DETECTORS = [
  {
    product: INSURANCE_PRODUCTS.BAOVIET,
    keywords: ['bảo việt', 'baoviet', 'chuyến bay', 'trễ chuyến', 'hủy chuyến', 'saladin', 'vé máy bay'],
  },
  {
    product: INSURANCE_PRODUCTS.MSIG,
    keywords: ['msig', 'sức khỏe 24/7', 'sức khỏe 24', 'pharmacity', 'whitecoat', 'telemed'],
  },
  {
    product: INSURANCE_PRODUCTS.VBI,
    keywords: ['vbi', 'cyber', 'an ninh mạng'],
  },
  {
    product: INSURANCE_PRODUCTS.GIC,
    keywords: ['gic', 'sống tự tin', 'credit topup', 'thất nghiệp'],
  },
]

export const QUICK_REPLIES = [
  {
    id: 'compare_health',
    text: '🔍 So sánh gói sức khỏe MSIG vs VBI',
    category: QUICK_REPLY_CATEGORIES.COMPARISON,
    keywords: ['so sánh', 'khác nhau', 'sức khỏe', 'health'],
    products: [INSURANCE_PRODUCTS.MSIG],
  },
  {
    id: 'compare_all',
    text: '📊 So sánh tất cả gói bảo hiểm',
    category: QUICK_REPLY_CATEGORIES.COMPARISON,
    keywords: ['so sánh', 'khác nhau', 'các gói'],
    products: ['cross'],
  },
  {
    id: 'cost_msig',
    text: '💰 Chi phí bảo hiểm sức khỏe MSIG?',
    category: QUICK_REPLY_CATEGORIES.COST,
    keywords: ['chi phí', 'giá', 'phí', 'msig', 'sức khỏe'],
    products: [INSURANCE_PRODUCTS.MSIG],
  },
  {
    id: 'cost_cyber',
    text: '💳 Chi phí bảo hiểm Cyber?',
    category: QUICK_REPLY_CATEGORIES.COST,
    keywords: ['chi phí', 'giá', 'phí', 'cyber'],
    products: [INSURANCE_PRODUCTS.VBI],
  },
  {
    id: 'cost_gic',
    text: '💰 Chi phí bảo hiểm Sống tự tin GIC?',
    category: QUICK_REPLY_CATEGORIES.COST,
    keywords: ['chi phí', 'giá', 'phí', 'gic', 'sống tự tin'],
    products: [INSURANCE_PRODUCTS.GIC],
  },
  {
    id: 'cost_baoviet',
    text: '💰 Chi phí bảo hiểm trễ/hủy chuyến bay?',
    category: QUICK_REPLY_CATEGORIES.COST,
    keywords: ['chi phí', 'giá', 'phí', 'chuyến bay', 'bảo việt'],
    products: [INSURANCE_PRODUCTS.BAOVIET],
  },
  {
    id: 'cost_monthly',
    text: '📅 Có thể trả phí theo tháng không?',
    category: QUICK_REPLY_CATEGORIES.COST,
    keywords: ['trả góp', 'theo tháng', 'monthly'],
    products: [INSURANCE_PRODUCTS.VBI, INSURANCE_PRODUCTS.GIC],
  },
  {
    id: 'process_buy',
    text: '🛒 Quy trình mua bảo hiểm?',
    category: QUICK_REPLY_CATEGORIES.PROCESS,
    keywords: ['quy trình', 'cách mua', 'mua như thế nào'],
    products: ['any'],
  },
  {
    id: 'process_claim',
    text: '📋 Hướng dẫn bồi thường?',
    category: QUICK_REPLY_CATEGORIES.CLAIM,
    keywords: ['bồi thường', 'claim', 'yêu cầu'],
    products: ['any'],
  },
  {
    id: 'benefits_msig',
    text: '🏥 Quyền lợi bảo hiểm MSIG?',
    category: QUICK_REPLY_CATEGORIES.BENEFITS,
    keywords: ['quyền lợi', 'bảo vệ gì', 'msig'],
    products: [INSURANCE_PRODUCTS.MSIG],
  },
  {
    id: 'benefits_cyber',
    text: '🛡️ Bảo hiểm Cyber bảo vệ gì?',
    category: QUICK_REPLY_CATEGORIES.BENEFITS,
    keywords: ['cyber', 'quyền lợi', 'bảo vệ'],
    products: [INSURANCE_PRODUCTS.VBI],
  },
  {
    id: 'benefits_gic',
    text: '🛡️ Quyền lợi bảo hiểm GIC?',
    category: QUICK_REPLY_CATEGORIES.BENEFITS,
    keywords: ['quyền lợi', 'bảo vệ gì', 'gic', 'thất nghiệp'],
    products: [INSURANCE_PRODUCTS.GIC],
  },
  {
    id: 'benefits_baoviet',
    text: '✈️ Quyền lợi bảo hiểm chuyến bay Bảo Việt?',
    category: QUICK_REPLY_CATEGORIES.BENEFITS,
    keywords: ['quyền lợi', 'trễ chuyến', 'hủy chuyến', 'bảo việt'],
    products: [INSURANCE_PRODUCTS.BAOVIET],
  },
  {
    id: 'age_range',
    text: '👤 Độ tuổi áp dụng?',
    category: QUICK_REPLY_CATEGORIES.GENERAL,
    keywords: ['độ tuổi', 'tuổi nào', 'age'],
    products: ['any'],
  },
  {
    id: 'waiting_period',
    text: '⏳ Thời gian chờ là gì?',
    category: QUICK_REPLY_CATEGORIES.GENERAL,
    keywords: ['thời gian chờ', 'waiting period'],
    products: [INSURANCE_PRODUCTS.MSIG],
  },
  {
    id: 'exclusions',
    text: '⚠️ Trường hợp nào không được bồi thường?',
    category: QUICK_REPLY_CATEGORIES.CLAIM,
    keywords: ['loại trừ', 'không được', 'exclusion'],
    products: ['any'],
  },
  {
    id: 'family',
    text: '👨‍👩‍👧 Mua cho người thân được không?',
    category: QUICK_REPLY_CATEGORIES.GENERAL,
    keywords: ['người thân', 'gia đình', 'family'],
    products: [INSURANCE_PRODUCTS.MSIG],
  },
  {
    id: 'contact',
    text: '📞 Liên hệ hotline hỗ trợ',
    category: QUICK_REPLY_CATEGORIES.GENERAL,
    keywords: ['liên hệ', 'hotline', 'support'],
    products: ['any'],
  },
]

// Default quick replies when no product context yet
export const DEFAULT_QUICK_REPLIES = [
  'compare_all',
  'cost_msig',
  'process_buy',
  'benefits_cyber',
]

const PRODUCT_DEFAULT_QUICK_REPLIES = {
  [INSURANCE_PRODUCTS.MSIG]: ['cost_msig', 'benefits_msig', 'process_buy', 'process_claim'],
  [INSURANCE_PRODUCTS.VBI]: ['cost_cyber', 'benefits_cyber', 'process_buy', 'process_claim'],
  [INSURANCE_PRODUCTS.GIC]: ['cost_gic', 'benefits_gic', 'process_buy', 'process_claim'],
  [INSURANCE_PRODUCTS.BAOVIET]: ['cost_baoviet', 'benefits_baoviet', 'process_buy', 'process_claim'],
}

function isReplyInScope(reply, activeProduct) {
  if (!activeProduct) {
    return reply.products.includes('cross') || DEFAULT_QUICK_REPLIES.includes(reply.id)
  }
  return reply.products.includes(activeProduct) || reply.products.includes('any')
}

export function detectActiveProduct(conversationText) {
  if (!conversationText) return null

  const text = conversationText.toLowerCase()
  let bestProduct = null
  let bestScore = 0

  for (const { product, keywords } of PRODUCT_DETECTORS) {
    let score = 0
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestProduct = product
    }
  }

  return bestScore > 0 ? bestProduct : null
}

// Suggest relevant quick replies based on conversation context
export function getSuggestedQuickReplies(conversationText, maxSuggestions = 4) {
  if (!conversationText) {
    return QUICK_REPLIES.filter(qr => DEFAULT_QUICK_REPLIES.includes(qr.id))
  }

  const activeProduct = detectActiveProduct(conversationText)
  const messageText = conversationText.toLowerCase()
  const pool = QUICK_REPLIES.filter(qr => isReplyInScope(qr, activeProduct))

  const scoredReplies = pool.map(qr => {
    let score = 0
    qr.keywords.forEach(keyword => {
      if (messageText.includes(keyword.toLowerCase())) {
        score += 1
      }
    })
    return { ...qr, score }
  })

  const relevant = scoredReplies
    .filter(qr => qr.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)

  if (relevant.length < maxSuggestions) {
    const fallbackIds = activeProduct
      ? PRODUCT_DEFAULT_QUICK_REPLIES[activeProduct]
      : DEFAULT_QUICK_REPLIES

    const fallbacks = QUICK_REPLIES.filter(qr =>
      fallbackIds.includes(qr.id) &&
      !relevant.find(r => r.id === qr.id) &&
      isReplyInScope(qr, activeProduct)
    )
    return [...relevant, ...fallbacks].slice(0, maxSuggestions)
  }

  return relevant
}

// Get quick replies by category
export function getQuickRepliesByCategory(category) {
  return QUICK_REPLIES.filter(qr => qr.category === category)
}
