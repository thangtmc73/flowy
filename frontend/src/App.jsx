import Header from './components/Header'
import ChatWindow from './components/ChatWindow'
import SuggestedQuestions from './components/SuggestedQuestions'
import InputArea from './components/InputArea'
import { useChat } from './hooks/useChat'

export default function App() {
  const { messages, loading, send, reset } = useChat()

  // Only show suggested questions when the conversation only has the welcome message
  const showSuggestions = messages.length === 1

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-white shadow-xl">
      <Header onReset={reset} />

      <ChatWindow messages={messages} loading={loading} onSuggest={send} />

      {showSuggestions && <SuggestedQuestions onSelect={send} />}

      <InputArea onSend={send} disabled={loading} />
    </div>
  )
}
