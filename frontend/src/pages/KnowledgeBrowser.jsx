import { useState, useEffect } from 'react'
import { Link } from 'wouter'

export default function KnowledgeBrowser() {
  const [knowledgeFiles, setKnowledgeFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch from static manifest file
    fetch('/knowledge/manifest.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch knowledge files')
        return res.json()
      })
      .then(async (data) => {
        // Fetch each file to get FAQ count and metadata
        const filesWithMeta = await Promise.all(
          data.files.map(async (file) => {
            try {
              const fetchPath = file.file || file.path
              const res = await fetch(`/knowledge/${fetchPath}`)
              const content = await res.json()
              return {
                ...file,
                faq_count: content.faqs?.length || 0,
                last_updated: content.last_updated || '',
                version: content.version || '',
                categories: Array.from(new Set(
                  content.faqs?.map(faq => faq.category).filter(Boolean) || []
                ))
              }
            } catch (err) {
              console.error(`Error loading ${file.path}:`, err)
              return { ...file, faq_count: 0 }
            }
          })
        )
        setKnowledgeFiles(filesWithMeta)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading knowledge base...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Knowledge Base Browser</h1>
            <p className="text-slate-600 mt-2">Browse and review FAQ content</p>
          </div>
          <Link href="/">
            <div className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Back to Chat
            </div>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {knowledgeFiles.map((file) => (
            <Link key={file.path} href={`/knowledge/${file.path}`}>
              <div className="cursor-pointer block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {file.product_name || file.name}
                    </h3>
                    {file.partner_name && (
                      <p className="text-sm text-slate-600">Partner: {file.partner_name}</p>
                    )}
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                    {file.faq_count} FAQs
                  </span>
                </div>
                
                <div className="text-sm text-slate-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Path:</span>
                    <span className="font-mono text-xs">{file.path}</span>
                  </div>
                  {file.last_updated && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Updated:</span>
                      <span>{file.last_updated}</span>
                    </div>
                  )}
                </div>

                {file.categories && file.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {file.categories.slice(0, 3).map((cat, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {cat}
                      </span>
                    ))}
                    {file.categories.length > 3 && (
                      <span className="text-xs text-slate-500">
                        +{file.categories.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {knowledgeFiles.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No knowledge files found
          </div>
        )}
      </div>
    </div>
  )
}
