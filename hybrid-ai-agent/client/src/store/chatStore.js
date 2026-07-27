import { create } from "zustand";

const useChatStore = create((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],

  setConversations: (conversationsOrFn) =>
    set((state) => ({
      conversations:
        typeof conversationsOrFn === 'function'
          ? conversationsOrFn(state.conversations)
          : conversationsOrFn,
    })),

  setActiveConversation: (activeConversation) =>
    set({ activeConversation }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      ),
    })),

  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),

  addTypingUser: ({ conversationId, userId }) =>
    set((state) => ({
      typingUsers: state.typingUsers.some(
        (u) => u.conversationId === conversationId && u.userId === userId
      )
        ? state.typingUsers
        : [...state.typingUsers, { conversationId, userId }],
    })),

  removeTypingUser: ({ conversationId, userId }) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter(
        (u) => !(u.conversationId === conversationId && u.userId === userId)
      ),
    })),

  clearMessages: () => set({ messages: [] }),
}));

export default useChatStore;
