import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../utils/axiosInstance';

const AskAI = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Hi! I'm Student Buddy AI. Ask me any academic question — math, science, history, coding, anything study-related!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const askQuestion = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setInput('');

    const newMessages = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.slice(-10);
      const { data } = await axiosInstance.post('/api/ai/ask', { question, history });
      setMessages([...newMessages, { role: 'assistant', content: data.data.answer }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI is unavailable right now');
      setMessages([...newMessages, { role: 'assistant', content: '❌ Sorry, I could not process your question right now. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askQuestion(); }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "👋 Hi! I'm Student Buddy AI. Ask me any academic question!" }]);
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e2e8f0' }}>🤖 Ask AI</h1>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Powered by OpenAI · Academic questions only</p>
            </div>
            <button onClick={clearChat} className="btn-secondary" style={{ fontSize: '0.85rem' }}>🗑️ Clear</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0', minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animationDelay: `${i * 0.05}s` }} className="animate-fade-in">
                {msg.role === 'assistant' && (
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, marginRight: '0.625rem', alignSelf: 'flex-end' }}>🤖</div>
                )}
                <div style={{ maxWidth: '70%', padding: '0.875rem 1.125rem', borderRadius: msg.role === 'user' ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0', background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, marginLeft: '0.625rem', alignSelf: 'flex-end' }}>👤</div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🤖</div>
                <div style={{ padding: '0.875rem 1.25rem', borderRadius: '1.25rem 1.25rem 1.25rem 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', animation: 'spin 1s ease infinite', animationDelay: `${i * 0.2}s', opacity: 0.8` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 0 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <textarea
              id="ai-input"
              className="form-input"
              placeholder="Ask any academic question... (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={2}
              style={{ flex: 1, resize: 'none', lineHeight: 1.5 }}
            />
            <button
              id="ai-send"
              className="btn-primary"
              onClick={askQuestion}
              disabled={loading || !input.trim()}
              style={{ alignSelf: 'flex-end', padding: '0.75rem 1.5rem' }}
            >
              {loading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} /> : '↗️'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AskAI;
