import { useState, useEffect, useRef, useCallback } from 'react';
import { isToday, isYesterday, isSameDay, format } from 'date-fns';
import { FiMoreVertical, FiPhone, FiVideo } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import { getSocket } from '../services/socket';
import api from '../services/api';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import UserAvatar from './UserAvatar';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;

  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt);
    if (!currentDate || !isSameDay(currentDate, msgDate)) {
      currentDate = msgDate;
      groups.push({ date: msgDate, messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  });

  return groups;
}

function formatDateLabel(date) {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

export default function ChatWindow({ conversation }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const { user } = useAuthStore();
  const { typingUsers, addTypingUser, removeTypingUser } = useChatStore();
  const typingUsersForConv = typingUsers.filter(
    (u) => u.conversationId === conversation?._id && u.userId !== user?._id
  );

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  useEffect(() => {
    if (!conversation?._id) return;
    setLoading(true);
    setMessages([]);

    const controller = new AbortController();

    api
      .get(`/chat/conversations/${conversation._id}/messages`, {
        signal: controller.signal,
      })
      .then(({ data }) => {
        setMessages(data.data.messages || []);
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 50);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [conversation?._id, scrollToBottom]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversation?._id) return;

    socket.emit('join_conversation', conversation._id);

    const handleNewMessage = ({ success, message }) => {
      if (success && message) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTimeout(() => scrollToBottom(true), 50);
      }
    };

    const handleTyping = ({ userId, conversationId }) => {
      if (conversationId === conversation._id) {
        addTypingUser({ userId, conversationId });
      }
    };

    const handleStoppedTyping = ({ userId, conversationId }) => {
      if (conversationId === conversation._id) {
        removeTypingUser({ conversationId, userId });
      }
    };

    const handleRead = ({ conversationId }) => {
      if (conversationId === conversation._id) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.sender?._id === user?._id && !m.readBy?.some((r) => r.user === user?._id)) {
              return {
                ...m,
                readBy: [...(m.readBy || []), { user: user._id, readAt: new Date() }],
              };
            }
            return m;
          })
        );
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStoppedTyping);
    socket.on('messages_read', handleRead);

    return () => {
      socket.emit('leave_conversation', conversation._id);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStoppedTyping);
      socket.off('messages_read', handleRead);
    };
  }, [conversation?._id, user?._id, addTypingUser, removeTypingUser, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages.length, scrollToBottom]);

  const handleSend = useCallback(
    (content, type = 'text', mediaUrl = null) => {
      const socket = getSocket();
      if (!socket || !conversation?._id) return;

      const tempMsg = {
        _id: `temp-${Date.now()}`,
        sender: { _id: user?._id, name: user?.name, avatar: user?.avatar },
        conversation: conversation._id,
        content,
        type,
        mediaUrl,
        createdAt: new Date().toISOString(),
        readBy: [{ user: user?._id }],
        reactions: [],
      };

      setMessages((prev) => [...prev, tempMsg]);
      setTimeout(() => scrollToBottom(true), 50);

      const payload = {
        conversationId: conversation._id,
        content,
        type,
        mediaUrl,
      };

      socket.emit('send_message', payload, (response) => {
        if (response?.success && response.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempMsg._id ? response.message : m))
          );
        }
      });
    },
    [conversation?._id, user, scrollToBottom]
  );

  const handleTypingStart = useCallback(() => {
    const socket = getSocket();
    if (socket && conversation?._id) {
      socket.emit('typing_start', conversation._id);
    }
  }, [conversation?._id]);

  const handleTypingStop = useCallback(() => {
    const socket = getSocket();
    if (socket && conversation?._id) {
      socket.emit('typing_stop', conversation._id);
    }
  }, [conversation?._id]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base-200/30">
        <EmptyState
          title="Select a conversation"
          description="Choose a conversation from the sidebar to start chatting."
        />
      </div>
    );
  }

  const otherParticipant = conversation.participants?.find(
    (p) => p._id !== user?._id
  );

  const isGroup = conversation.type === 'group';
  const showTyping = typingUsersForConv.length > 0;

  const dateGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col h-full bg-base-200/30">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-base-300 bg-base-100 shrink-0">
        {isGroup ? (
          <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        ) : (
          <UserAvatar user={otherParticipant} size="md" online={false} showStatus />
        )}

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">
            {conversation.name ||
              (isGroup
                ? conversation.name || 'Group Chat'
                : otherParticipant?.name || 'Unknown')}
          </h2>
          {isGroup ? (
            <p className="text-[11px] text-base-content/50">
              {conversation.participants?.length} members
            </p>
          ) : showTyping ? (
            <p className="text-[11px] text-primary animate-pulse">typing...</p>
          ) : (
            <p className="text-[11px] text-base-content/50">
              {otherParticipant?.status === 'active' ? 'Online' : 'Offline'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button className="btn btn-ghost btn-sm btn-circle" title="Voice call">
            <FiPhone size={16} />
          </button>
          <button className="btn btn-ghost btn-sm btn-circle" title="Video call">
            <FiVideo size={16} />
          </button>
          <button className="btn btn-ghost btn-sm btn-circle" title="More options">
            <FiMoreVertical size={16} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        {loading ? (
          <LoadingSpinner size="md" text="Loading messages..." />
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Send a message to start the conversation."
          />
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {dateGroups.map((group, gi) => (
              <div key={gi}>
                <div className="flex justify-center my-4">
                  <span className="text-[11px] text-base-content/40 bg-base-200/80 rounded-full px-3 py-1 font-medium">
                    {formatDateLabel(group.date)}
                  </span>
                </div>
                {group.messages.map((msg) => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isOwn={msg.sender?._id === user?._id || msg.sender === user?._id}
                    isGroup={isGroup}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {showTyping && (
          <div className="flex items-center gap-2 mt-3 animate-fade-in">
            <div className="flex gap-1 bg-base-200 rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-base-content/40 animate-pulse-dot" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 rounded-full bg-base-content/40 animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-base-content/40 animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSend}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />
    </div>
  );
}
