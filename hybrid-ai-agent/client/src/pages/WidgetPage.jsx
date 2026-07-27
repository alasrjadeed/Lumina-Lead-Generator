import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FiSend, FiWifi, FiWifiOff } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function WidgetPage() {
  const { businessId } = useParams();
  const [config, setConfig] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState(true);
  const messagesEndRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get(`/widget/config/${businessId}`);
        setConfig(data);
        document.documentElement.setAttribute('data-theme', data.theme || 'light');
        setMessages([
          {
            _id: 'greeting',
            text: data.greeting || `Hi! Welcome to ${data.businessName || 'our business'}. How can we help you today?`,
            sender: 'bot',
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch {
        toast.error('Failed to load widget');
      } finally {
        setLoading(false);
      }
    };
    if (businessId) fetchConfig();
  }, [businessId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = {
      _id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const { data } = await api.post(`/widget/chat/${conversationId || 'new'}/message`, {
        businessId,
        text: userMessage.text,
      });

      if (data.conversationId) setConversationId(data.conversationId);

      setMessages((prev) => [
        ...prev,
        {
          _id: data._id || Date.now().toString() + '-bot',
          text: data.reply || data.text || 'Thank you for your message.',
          sender: 'bot',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString() + '-err',
          text: 'Sorry, something went wrong. Please try again.',
          sender: 'bot',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <p className="text-base-content/40">Widget not available</p>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col bg-base-100 max-w-md mx-auto shadow-2xl"
      style={{ fontFamily: config.fontFamily || 'inherit' }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-base-200"
        style={{ backgroundColor: config.headerColor || undefined }}
      >
        {config.logo && (
          <img
            src={config.logo}
            alt={config.businessName}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h2 className="font-bold text-sm">{config.businessName || 'Chat'}</h2>
          <div className="flex items-center gap-1 text-xs text-base-content/60">
            {online ? (
              <>
                <FiWifi className="text-success" /> Online
              </>
            ) : (
              <>
                <FiWifiOff className="text-error" /> Offline
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-content rounded-br-sm'
                  : 'bg-base-200 text-base-content rounded-bl-sm'
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-[10px] opacity-50 mt-1">
                {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : ''}
              </p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-base-200 px-4 py-3 rounded-2xl rounded-bl-sm">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 p-3 border-t border-base-200"
      >
        <input
          ref={inputRef}
          type="text"
          className="input input-bordered flex-1 input-sm"
          placeholder={config.inputPlaceholder || 'Type your message...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className={`btn btn-primary btn-circle btn-sm ${sending ? 'loading' : ''}`}
          disabled={!input.trim() || sending}
        >
          <FiSend className="w-4 h-4" />
        </button>
      </form>

      {config.poweredBy && (
        <div className="text-center text-[10px] text-base-content/30 py-1">
          Powered by {config.poweredBy}
        </div>
      )}
    </div>
  );
}
