import { useState } from 'react'
import { useLocation } from 'wouter'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import SuggestedQuestions from './components/SuggestedQuestions'
import QuickReplyButtons from './components/QuickReplyButtons'
import InputArea from './components/InputArea'
import Toast from './components/Toast'
import { useChat } from './hooks/useChat'
import KnowledgeBrowser from './pages/KnowledgeBrowser'
import FAQList from './pages/FAQList'

function normalizePath(path) {
  const trimmed = path.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

function ChatPage() {
  const { messages, loading, toast, send, retryLast, clearToast, reset } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSend = (text) => {
    send(text)
    setSidebarOpen(false)
  }

  const showSuggestions = messages.length === 1 && messages[0].id === 'welcome'
  const showQuickReplies = messages.length > 1 && !loading

  return (
    <div className="flex h-dvh min-h-dvh bg-slate-50 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 min-h-0 chat-bg">
        <Header onReset={reset} onMenuClick={() => setSidebarOpen(true)} />

        <ChatWindow
          messages={messages}
          loading={loading}
        />

        {showSuggestions && (
          <SuggestedQuestions onSelectQuestion={handleSend} disabled={loading} />
        )}

        {showQuickReplies && (
          <QuickReplyButtons 
            messages={messages}
            onSelectReply={handleSend} 
            disabled={loading} 
          />
        )}

        <InputArea onSend={handleSend} disabled={loading} />

        <Toast
          message={toast?.message}
          type={toast?.type}
          actionLabel={toast?.type === 'error' ? 'Thử lại' : undefined}
          onAction={retryLast}
          onDismiss={clearToast}
        />
      </div>
    </div>
  )
}

export default function App() {
  const [location] = useLocation()
  const path = normalizePath(location)

  if (path === '/knowledge') {
    return <KnowledgeBrowser />
  }

  if (path.startsWith('/knowledge/')) {
    return <FAQList />
  }

  if (path === '/') {
    return <ChatPage />
  }

  return <div style={{padding:'40px'}}>404 - Page not found: {location}</div>
}
