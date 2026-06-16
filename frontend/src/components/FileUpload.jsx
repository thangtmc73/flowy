import { useState, useRef } from 'react'

export default function FileUpload({ onFileSelect, disabled }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (file) => {
    if (!file) return

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.')
      return
    }

    if (/\.doc$/i.test(file.name) && !/\.docx$/i.test(file.name)) {
      alert('Chỉ hỗ trợ Word .docx. Vui lòng lưu file dạng .docx.')
      return
    }

    const allowedTypes = [
      'application/pdf',
      'application/json',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|json|txt|csv|docx)$/i)) {
      alert('File không hợp lệ! Chỉ chấp nhận: PDF, JSON, TXT, CSV, Word (.docx)')
      return
    }

    setSelectedFile(file)
    
    try {
      const content = await readFileContent(file)
      onFileSelect({ file, content })
    } catch (error) {
      alert('Không thể đọc file: ' + error.message)
      setSelectedFile(null)
    }
  }

  const isDocxFile = (file) =>
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || /\.docx$/i.test(file.name)

  const isBinaryUpload = (file) =>
    file.type === 'application/pdf' || isDocxFile(file)

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          if (file.type === 'application/json') {
            resolve(JSON.parse(e.target.result))
          } else if (file.type === 'application/pdf') {
            resolve({ type: 'pdf', data: e.target.result.split(',')[1] })
          } else if (isDocxFile(file)) {
            resolve({ type: 'docx', data: e.target.result.split(',')[1] })
          } else {
            resolve(e.target.result)
          }
        } catch (error) {
          reject(new Error('Không thể parse file'))
        }
      }
      
      reader.onerror = () => reject(new Error('Lỗi đọc file'))
      
      if (isBinaryUpload(file)) {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return
    
    const file = e.dataTransfer.files[0]
    if (file) handleFileChange(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-5 transition-all
            ${isDragging 
              ? 'border-brand bg-brand-light/50' 
              : 'border-slate-300 bg-white hover:border-slate-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.json,.txt,.csv,.docx"
            onChange={(e) => handleFileChange(e.target.files[0])}
            disabled={disabled}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-2 text-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Kéo thả file hoặc <span className="text-brand font-semibold">chọn file</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF, JSON, TXT, CSV, Word .docx (tối đa 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-brand-light rounded-2xl shadow-sm">
          <div className="shrink-0 w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-600">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          
          <button
            onClick={handleRemoveFile}
            disabled={disabled}
            className="cursor-pointer shrink-0 p-1.5 hover:bg-red-100 rounded-lg transition-colors duration-150 group focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Xóa file"
          >
            <svg className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
