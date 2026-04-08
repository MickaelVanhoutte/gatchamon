import { useState, useRef, useEffect, useCallback } from 'react';
import { USE_SERVER } from '../../config';
import { useGameStore } from '../../stores/gameStore';
import { useChat } from '../../hooks/useChat';
import type { ChatMessage } from '../../services/server-api.service';
import './ChatPanel.css';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso + 'Z').getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return 'now';
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

// Deterministic color from player name
function nameColor(name: string): string {
  const colors = [
    '#facc15', '#4ade80', '#60a5fa', '#f472b6',
    '#a78bfa', '#fb923c', '#2dd4bf', '#e879f9',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

export function ChatPanel() {
  if (!USE_SERVER) return null;

  const player = useGameStore(s => s.player);
  const { messages, send } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [lastSeenId, setLastSeenId] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAtBottomRef = useRef(true);

  // Track if user is scrolled to bottom
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  }, []);

  // Auto-scroll on new messages if at bottom
  useEffect(() => {
    if (isAtBottomRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as seen when panel is open
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setLastSeenId(messages[messages.length - 1].id);
    }
  }, [isOpen, messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const unreadCount = messages.filter(m => m.id > lastSeenId).length;

  const handleSubmit = async (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || !input.trim()) return;
    const text = input.trim();
    setInput('');
    setError('');
    const result = await send(text);
    if (!result.ok) {
      setError(result.error || 'Failed');
      setTimeout(() => setError(''), 2000);
    }
  };

  if (!isOpen) {
    return (
      <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {unreadCount > 0 && <span className="chat-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-title">Chat</span>
        <button className="chat-close" onClick={() => setIsOpen(false)}>&times;</button>
      </div>
      <div className="chat-messages" ref={containerRef} onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className="chat-empty">No messages yet</div>
        )}
        {messages.map((msg: ChatMessage) => (
          <div key={msg.id} className="chat-msg">
            <span className="chat-name" style={{ color: nameColor(msg.playerName) }}>
              {msg.playerName}
            </span>
            <span className="chat-text">{msg.message}</span>
            <span className="chat-time">{timeAgo(msg.createdAt)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && <div className="chat-error">{error}</div>}
      <input
        ref={inputRef}
        type="text"
        className="chat-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleSubmit}
        placeholder={player?.name ? `Chat as ${player.name}...` : 'Type a message...'}
        maxLength={200}
        enterKeyHint="send"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </div>
  );
}
