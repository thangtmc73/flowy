const SUGGESTIONS = [
  'Bảo hiểm Sức khỏe 24/7 là gì?',
  'Quyền lợi nội trú gồm những gì?',
  'Làm thế nào để mua bảo hiểm?',
  'Quy trình bồi thường như thế nào?',
  'Phí bảo hiểm hàng tháng là bao nhiêu?',
  'Khám ngoại trú có được bồi thường không?',
]

export default function SuggestedQuestions({ onSelect }) {
  return (
    <div className="px-4 pb-3">
      <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Câu hỏi gợi ý</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-3 py-1.5 transition-colors leading-tight text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
