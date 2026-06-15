import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import SuggestedQuestions from './components/SuggestedQuestions'
import QuickReplyButtons from './components/QuickReplyButtons'
import InputArea from './components/InputArea'
import { useChat } from './hooks/useChat'

export default function App() {
  const { messages, loading, send, reset } = useChat()
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

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
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
      </div>
    </div>
  )
}
