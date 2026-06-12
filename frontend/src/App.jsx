import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import InputArea from './components/InputArea'
import { useChat } from './hooks/useChat'

export default function App() {
  const { messages, loading, send, reset } = useChat()

  return (
    <div className="flex h-full min-h-screen bg-slate-100">
      <Sidebar onSelectQuestion={send} disabled={loading} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header onReset={reset} />

        <ChatWindow messages={messages} loading={loading} />

        <InputArea onSend={send} disabled={loading} />
      </div>
    </div>
  )
}
