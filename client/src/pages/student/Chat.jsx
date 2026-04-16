import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

let socket;

const ChatPage = () => {
  const { userId } = useParams(); // the OTHER user's ID
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!user?._id || !userId) return;

    // Connect socket
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5005', {
      auth: { token: localStorage.getItem('token') },
    });

    socket.emit('joinRoom', { userId: user._id });

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find((m) => m._id?.toString() === msg._id?.toString())) return prev;
        return [...prev, msg];
      });
    });

    socket.on('userTyping', ({ senderId }) => {
      if (senderId !== user._id) setIsTyping(true);
    });

    socket.on('userStoppedTyping', () => setIsTyping(false));

    loadHistory();

    return () => {
      socket.disconnect();
    };
  }, [user?._id, userId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const loadHistory = async () => {
    try {
      const { data } = await axiosInstance.get(`/api/chat/${userId}`);
      setMessages(data.data || []);
      // Grab other user info from first message
      if (data.data?.length > 0) {
        const first = data.data[0];
        const other = first.sender?._id === user._id ? first.receiver : first.sender;
        setOtherUser(other);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Chat is only available between connected student-mentor pairs');
      }
    } finally { setLoading(false); }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('sendMessage', { senderId: user._id, receiverId: userId, message: input.trim() });
    socket.emit('stopTyping', { senderId: user._id, receiverId: userId });
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit('typing', { senderId: user._id, receiverId: userId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stopTyping', { senderId: user._id, receiverId: userId });
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
          {/* Chat Header */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(26,26,46,0.6)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.1rem', overflow: 'hidden' }}>
              {otherUser?.profilePic ? <img src={otherUser.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (otherUser?.fullName?.[0] || '?')}
            </div>
            <div>
              <p style={{ fontWeight: '700', color: '#e2e8f0' }}>{otherUser?.fullName || 'Chat'}</p>
              {isTyping && <p style={{ fontSize: '0.78rem', color: '#6366f1', fontStyle: 'italic' }}>typing...</p>}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}><div className="spinner" /></div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', marginTop: '3rem' }}>
                <p style={{ fontSize: '2rem' }}>💬</p>
                <p>No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                return (
                  <div key={msg._id || i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    {!isMe && (
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', marginRight: '0.5rem', alignSelf: 'flex-end', flexShrink: 0 }}>
                        {msg.sender?.fullName?.[0] || '?'}
                      </div>
                    )}
                    <div style={{ maxWidth: '65%' }}>
                      <div style={{ padding: '0.625rem 1rem', borderRadius: isMe ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0', background: isMe ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.07)', border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {msg.message}
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.2rem', textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>?</div>
                <div style={{ padding: '0.625rem 1rem', borderRadius: '1.25rem 1.25rem 1.25rem 0', background: 'rgba(255,255,255,0.07)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1, 2].map((i) => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', opacity: 0.7 }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.75rem', background: 'rgba(26,26,46,0.6)' }}>
            <input
              id="chat-input"
              className="form-input"
              placeholder="Type a message..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              style={{ flex: 1 }}
            />
            <button id="chat-send" className="btn-primary" onClick={sendMessage} disabled={!input.trim()} style={{ padding: '0.625rem 1.25rem' }}>
              ↗️
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
