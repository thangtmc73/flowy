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
    <div className="bg-white px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-5 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <div className="max-w-4xl mx-auto">
        {showUpload && (
          <div className="mb-3 animate-[slide-fade-in_0.2s_ease-out]">
            <FileUpload 
              onFileSelect={handleFileSelect}
              disabled={disabled}
            />
          </div>
        )}

        <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-3xl px-4 sm:px-5 py-2 sm:py-2.5 focus-within:border-brand transition-all duration-200 shadow-sm">
          <button
            onClick={() => setShowUpload(!showUpload)}
            disabled={disabled}
            aria-label={showUpload ? 'Đóng upload' : 'Upload file'}
            className={`cursor-pointer shrink-0 p-2 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand/30 ${
              showUpload
                ? 'text-brand bg-brand-light'
                : 'text-slate-400 hover:text-brand hover:bg-slate-100'
            }`}
            title="Upload file bảo hiểm để so sánh"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
            className="flex-1 min-w-0 min-h-10 py-2.5 bg-transparent resize-none outline-none text-[15px] text-slate-800 placeholder-slate-400 leading-6 disabled:opacity-50"
            style={{ maxHeight: '160px' }}
          />

          <button
            onClick={handleSubmit}
            disabled={disabled || (!value.trim() && !uploadedFile)}
            aria-label={disabled ? 'Đang trả lời' : 'Gửi tin nhắn'}
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/30 ${
              (value.trim() || uploadedFile) && !disabled
                ? 'cursor-pointer bg-brand text-white hover:bg-brand-hover shadow-sm'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        <p className="hidden sm:block text-xs text-slate-400 mt-2.5 px-1">
          Nhấn Enter để gửi · Shift+Enter để xuống dòng
          {uploadedFile && <span className="text-brand font-medium"> · File đã chọn: {uploadedFile.file.name}</span>}
        </p>
      </div>
    </div>
  )
}
