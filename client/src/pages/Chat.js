import React, { useState, useEffect, useRef } from 'react';
import { MdSend, MdDelete, MdSearch } from 'react-icons/md';
import { toast } from 'react-toastify';
import API from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotificationContext';

const avatarBg = ['#E1F5EE','#E6F1FB','#FAEEDA','#FCE8F8','#FCEBEB','#f0eaff'];
const avatarFg = ['#0F6E56','#185FA5','#BA7517','#8B21A5','#A32D2D','#7c3aed'];
const colorFor = (id) => [avatarBg[id % 6], avatarFg[id % 6]];

export default function Chat() {
  const { user } = useAuth();
  const { onlineUsers } = useNotif();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [typing, setTyping] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    fetchMessages();
    const socket = getSocket();
    if (!socket) return;

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    socket.on('message_deleted', ({ id }) => {
      setMessages(prev => prev.filter(m => m.id !== id));
    });
    socket.on('user_typing', ({ name, house }) => {
      setTyping(`${name} (House ${house}) is typing…`);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(''), 2500);
    });

    return () => {
      socket.off('new_message');
      socket.off('message_deleted');
      socket.off('user_typing');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await API.get('/chat', { params: { limit: 80 } });
      setMessages(data.messages);
    } catch {
      toast.error('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const socket = getSocket();
    if (socket) socket.emit('send_message', { message: text });
    setInput('');
  };

  const deleteMessage = (id) => {
    const socket = getSocket();
    if (socket) socket.emit('delete_message', { id });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (socket) {
      socket.emit('typing');
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => socket.emit('stop_typing'), 1500);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const filtered = search
    ? messages.filter(m => m.message.toLowerCase().includes(search.toLowerCase()))
    : messages;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Community Chat</div>
        <div className="page-subtitle">Sriram Nagar · Group</div>
      </div>

      {/* Online users */}
      {onlineUsers.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
          {onlineUsers.slice(0, 8).map((u, i) => (
            <span key={i} className="online-chip">
              <span className="online-dot" />
              {u.name}
            </span>
          ))}
          {onlineUsers.length > 8 && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>
              +{onlineUsers.length - 8} more
            </span>
          )}
        </div>
      )}

      {/* Search */}
      <div className="search-box">
        <MdSearch className="search-icon" />
        <input
          placeholder="Search messages…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: '0.875rem' }}>
        <div className="chat-window">
          <div className="chat-messages">
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : filtered.map(msg => {
              const isSelf = msg.user_id === user?.id;
              const [bg, fg] = colorFor(msg.user_id);
              return (
                <div key={msg.id} className={`msg-row${isSelf ? ' self' : ''}`} style={{ alignSelf: isSelf ? 'flex-end' : 'flex-start' }}>
                  <div className="msg-avatar-sm" style={{ background: bg, color: fg }}>
                    {msg.user_name?.charAt(0)}
                  </div>
                  <div style={{ maxWidth: '100%' }}>
                    {!isSelf && <div className="msg-name">{msg.user_name} · House {msg.house_number}</div>}
                    <div className={`msg-bubble ${isSelf ? 'self' : 'other'}`} style={{ position: 'relative' }}>
                      {msg.message}
                      {isSelf && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          style={{
                            position: 'absolute', top: -8, right: -8,
                            background: 'var(--red-400)', color: '#fff',
                            border: 'none', borderRadius: '50%',
                            width: 18, height: 18, fontSize: 10,
                            display: 'none', alignItems: 'center', justifyContent: 'center',
                          }}
                          className="del-btn"
                        >
                          <MdDelete style={{ fontSize: 10 }} />
                        </button>
                      )}
                    </div>
                    <div className="msg-time">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {typing && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 0', minHeight: 16 }}>
              {typing}
            </div>
          )}

          <div className="chat-input-bar">
            <input
              value={input}
              onChange={handleTyping}
              onKeyDown={handleKey}
              placeholder="Type a message… (Enter to send)"
            />
            <button className="chat-send-btn" onClick={sendMessage}>
              <MdSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
