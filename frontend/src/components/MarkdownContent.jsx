import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const markdownComponents = {
  h1: ({ ...props }) => <h1 className="text-lg font-bold text-slate-900 mt-3 mb-2 first:mt-0" {...props} />,
  h2: ({ ...props }) => <h2 className="text-base font-semibold text-slate-800 mt-2 mb-1.5 first:mt-0" {...props} />,
  h3: ({ ...props }) => <h3 className="text-sm font-semibold text-slate-800 mt-2 mb-1 first:mt-0" {...props} />,
  p: ({ ...props }) => <p className="leading-relaxed mb-2 last:mb-0 text-sm" {...props} />,
  ul: ({ ...props }) => <ul className="space-y-1 mb-2 list-none" {...props} />,
  ol: ({ ...props }) => <ol className="space-y-1 mb-2 list-decimal list-inside text-sm" {...props} />,
  li: ({ ordered, children, ...props }) =>
    ordered ? (
      <li className="ml-4 text-sm" {...props}>{children}</li>
    ) : (
      <li className="flex gap-2 items-start text-sm" {...props}>
        <span className="text-blue-600 shrink-0 font-bold">•</span>
        <span className="flex-1">{children}</span>
      </li>
    ),
  table: ({ ...props }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg text-sm" {...props} />
    </div>
  ),
  thead: ({ ...props }) => <thead className="bg-slate-50" {...props} />,
  th: ({ ...props }) => (
    <th className="px-2 py-1.5 text-left text-xs font-semibold text-slate-700 uppercase" {...props} />
  ),
  td: ({ ...props }) => <td className="px-2 py-1.5 text-sm text-slate-800 border-t border-slate-200" {...props} />,
  strong: ({ ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
  em: ({ ...props }) => <em className="italic" {...props} />,
  code: ({ inline, ...props }) =>
    inline ? (
      <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono" {...props} />
    ) : (
      <code className="block bg-slate-100 px-2 py-1.5 rounded text-xs font-mono overflow-x-auto my-1" {...props} />
    ),
  a: ({ ...props }) => (
    <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
  ),
}

export default function MarkdownContent({ children, className = '' }) {
  return (
    <div className={`prose prose-sm max-w-none prose-slate ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {children || ''}
      </ReactMarkdown>
    </div>
  )
}
