import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'wouter'
import MarkdownContent from '../components/MarkdownContent'

function TagList({ tags, limit }) {
  if (!tags?.length) return <span className="text-slate-400">—</span>

  const visible = limit ? tags.slice(0, limit) : tags
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((tag) => (
        <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
          {tag}
        </span>
      ))}
      {limit && tags.length > limit && (
        <span className="text-xs text-slate-500">+{tags.length - limit}</span>
      )}
    </div>
  )
}

function FAQTableRow({ faq, index, expanded, onToggle }) {
  const variantCount = faq.user_questions?.length || 0

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-slate-200 transition-colors ${
          expanded ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'
        }`}
      >
        <td className="p-3 text-sm text-slate-500 align-top w-10">{index + 1}</td>
        <td className="p-3 font-mono text-xs text-slate-600 align-top whitespace-nowrap">{faq.id}</td>
        <td className="p-3 align-top min-w-[220px]">
          <p className="font-medium text-slate-900 text-sm leading-snug">{faq.canonical_question}</p>
        </td>
        <td className="p-3 text-sm text-slate-600 align-top whitespace-nowrap">{faq.category || '—'}</td>
        <td className="p-3 text-center align-top">
          {faq.priority != null ? (
            <span className="inline-block bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-medium">
              {faq.priority}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>
        <td className="p-3 align-top min-w-[120px]">
          <TagList tags={faq.tags} limit={3} />
        </td>
        <td className="p-3 text-center text-sm text-slate-600 align-top">
          {variantCount > 0 ? variantCount : '—'}
        </td>
        <td className="p-3 text-center align-top">
          <span className="text-blue-600 text-xs font-medium">{expanded ? '▲ Thu gọn' : '▼ Xem'}</span>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-blue-50/50 border-b border-slate-200">
          <td colSpan={8} className="p-0">
            <div className="px-4 py-4 space-y-4 border-t border-blue-100">
              <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-600">
                {faq.source && (
                  <div>
                    <span className="font-semibold text-slate-700">Source:</span> {faq.source}
                  </div>
                )}
                {faq.scope && (
                  <div>
                    <span className="font-semibold text-slate-700">Scope:</span> {faq.scope}
                  </div>
                )}
                {faq.related_faq_ids?.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-semibold text-slate-700">Related:</span>{' '}
                    {faq.related_faq_ids.join(', ')}
                  </div>
                )}
              </div>

              {variantCount > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">
                    Câu hỏi tương tự ({variantCount})
                  </h4>
                  <ul className="space-y-1.5 bg-white rounded-lg border border-slate-200 p-3">
                    {faq.user_questions.map((question, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-slate-400 shrink-0">{idx + 1}.</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Câu trả lời</h4>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <MarkdownContent>{faq.answer}</MarkdownContent>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function FAQList() {
  const [location] = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTag, setSelectedTag] = useState('all')
  const [sortBy, setSortBy] = useState('priority')

  const filePath = location.replace('/knowledge/', '')

  useEffect(() => {
    if (!filePath) {
      setLoading(false)
      setData(null)
      return
    }

    const jsonPath = filePath.endsWith('.json') ? filePath : `${filePath}.json`
    const fetchUrl = `/knowledge/${jsonPath}`

    setLoading(true)
    setError(null)
    setExpandedId(null)

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch knowledge file (${res.status})`)
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [location, filePath])

  const categories = useMemo(() => {
    const cats = new Set(data?.faqs?.map((faq) => faq.category).filter(Boolean) || [])
    return ['all', ...Array.from(cats)]
  }, [data])

  const allTags = useMemo(() => {
    const tags = new Set()
    data?.faqs?.forEach((faq) => {
      faq.tags?.forEach((tag) => tags.add(tag))
    })
    return ['all', ...Array.from(tags)]
  }, [data])

  const filteredFAQs = useMemo(() => {
    let faqs = data?.faqs || []

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      faqs = faqs.filter(
        (faq) =>
          faq.canonical_question?.toLowerCase().includes(term) ||
          faq.user_questions?.some((q) => q.toLowerCase().includes(term)) ||
          faq.answer?.toLowerCase().includes(term) ||
          faq.tags?.some((t) => t.toLowerCase().includes(term)) ||
          faq.id?.toLowerCase().includes(term)
      )
    }

    if (selectedCategory !== 'all') {
      faqs = faqs.filter((faq) => faq.category === selectedCategory)
    }

    if (selectedTag !== 'all') {
      faqs = faqs.filter((faq) => faq.tags?.includes(selectedTag))
    }

    return [...faqs].sort((a, b) => {
      if (sortBy === 'priority') return (b.priority || 0) - (a.priority || 0)
      if (sortBy === 'id') return (a.id || '').localeCompare(b.id || '')
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '')
      return 0
    })
  }, [data, searchTerm, selectedCategory, selectedTag, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Đang tải...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/knowledge">
            <div className="cursor-pointer text-blue-600 hover:underline">← Quay lại Knowledge Browser</div>
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-600">
          <p className="mb-4">Không tìm thấy file knowledge</p>
          <Link href="/knowledge">
            <div className="cursor-pointer text-blue-600 hover:underline">← Quay lại Knowledge Browser</div>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
          <Link href="/knowledge">
            <div className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm mb-3 inline-block">
              ← Quay lại Knowledge Browser
            </div>
          </Link>

          <h1 className="text-2xl font-bold text-slate-900">
            {data.product_name || filePath}
          </h1>
          {data.partner_name && (
            <p className="text-slate-600 mt-1">Partner: {data.partner_name}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
            <span><strong className="text-slate-800">{data.faqs?.length || 0}</strong> FAQs</span>
            {data.version && <span>Version: <strong className="text-slate-800">{data.version}</strong></span>}
            {data.last_updated && <span>Cập nhật: <strong className="text-slate-800">{data.last_updated}</strong></span>}
            <span className="font-mono text-xs">{filePath}</span>
          </div>

          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Tìm theo câu hỏi, câu trả lời, tag hoặc ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">Tất cả category</option>
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">Tất cả tags</option>
                {allTags.slice(1).map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="priority">Sắp xếp theo Priority</option>
                <option value="id">Sắp xếp theo ID</option>
                <option value="category">Sắp xếp theo Category</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-900">
              Danh sách FAQ ({filteredFAQs.length})
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Bấm vào từng dòng để xem câu hỏi tương tự và câu trả lời (markdown)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="bg-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-700 w-10">#</th>
                  <th className="text-left p-3 font-semibold text-slate-700">ID</th>
                  <th className="text-left p-3 font-semibold text-slate-700 min-w-[220px]">Câu hỏi</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Category</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Priority</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Tags</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Tương tự</th>
                  <th className="text-center p-3 font-semibold text-slate-700 w-20">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredFAQs.map((faq, index) => (
                  <FAQTableRow
                    key={faq.id}
                    faq={faq}
                    index={index}
                    expanded={expandedId === faq.id}
                    onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Không tìm thấy FAQ phù hợp
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
