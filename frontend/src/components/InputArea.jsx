import { useState, useRef, useEffect } from 'react'
import FileUpload from './FileUpload'

export default function InputArea({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(Math.max(el.scrollHeight, 40), 160) + 'px'
  }, [value])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if ((!trimmed && !uploadedFile) || disabled) return
    
    const messageData = {
      text: trimmed || 'So sánh file bảo hiểm này với sản phẩm hiện có',
      file: uploadedFile
    }
    
    onSend(messageData)
    setValue('')
    setUploadedFile(null)
    setShowUpload(false)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleFileSelect = (fileData) => {
    setUploadedFile(fileData)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4 shrink-0">
      <div className="max-w-4xl mx-auto">
        {showUpload && (
          <div className="mb-3 animate-[slide-fade-in_0.2s_ease-out]">
            <FileUpload 
              onFileSelect={handleFileSelect}
              disabled={disabled}
            />
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 transition-all">
          <button
            onClick={() => setShowUpload(!showUpload)}
            disabled={disabled}
            aria-label={showUpload ? 'Đóng upload' : 'Upload file'}
            className={`shrink-0 p-2 rounded-lg transition-colors ${
              showUpload
                ? 'text-brand bg-brand-light'
                : 'text-slate-400 hover:text-brand hover:bg-slate-100'
            }`}
            title="Upload file bảo hiểm để so sánh"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={uploadedFile ? "Nhập câu hỏi về file (hoặc để trống để so sánh)..." : "Nhập câu hỏi về bảo hiểm..."}
            rows={1}
            className="flex-1 min-w-0 min-h-10 py-2 bg-transparent resize-none outline-none text-base text-slate-800 placeholder-slate-400 leading-6 disabled:opacity-50"
            style={{ maxHeight: '160px' }}
          />

          <button
            onClick={handleSubmit}
            disabled={disabled || (!value.trim() && !uploadedFile)}
            aria-label={disabled ? 'Đang trả lời' : 'Gửi tin nhắn'}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (value.trim() || uploadedFile) && !disabled
                ? 'text-brand hover:bg-slate-100 active:bg-slate-200'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            Gửi
          </button>
        </div>

        <p className="hidden sm:block text-xs text-slate-400 mt-2">
          Nhấn Enter để gửi · Shift+Enter để xuống dòng
          {uploadedFile && <span className="text-brand"> · File đã chọn: {uploadedFile.file.name}</span>}
        </p>
      </div>
    </div>
  )
}
