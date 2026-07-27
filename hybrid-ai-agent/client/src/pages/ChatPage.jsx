import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiMessageSquare,
  FiHome,
  FiTarget,
  FiSettings,
  FiShield,
  FiUser,
  FiLogOut,
  FiSend,
  FiArrowLeft,
  FiPlus,
  FiClock,
  FiZap,
  FiUserPlus,
  FiMoreVertical,
} from "react-icons/fi";
import api from "../services/api";
import useAuthStore from "../store/authStore";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
        <FiZap className="w-4 h-4 text-white" />
      </div>
      <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function AIMessage({ text }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
        <FiZap className="w-4 h-4 text-white" />
      </div>
      <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex items-start gap-3 mb-4 justify-end">
      <div className="bg-primary/90 text-primary-content rounded-2xl rounded-tr-sm px-4 py-3 max-w-lg">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [aiMessages, setAiMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your Lmina AI assistant. I can help you with business insights, lead generation, email drafting, and more. What can I do for you?",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [convInput, setConvInput] = useState("");
  const [convLoading, setConvLoading] = useState(false);
  const [convMessagesLoading, setConvMessagesLoading] = useState(false);

  const aiScrollRef = useRef(null);
  const aiInputRef = useRef(null);
  const convScrollRef = useRef(null);

  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }
  }, [aiMessages, aiLoading]);

  useEffect(() => {
    if (convScrollRef.current) {
      convScrollRef.current.scrollTop = convScrollRef.current.scrollHeight;
    }
  }, [convMessages]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/chat/conversations");
      const list = res?.conversations || res?.data?.conversations || res || [];
      setConversations(Array.isArray(list) ? list : []);
    } catch {
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleAILogout = () => {
    logout();
    navigate("/login");
  };

  const handleAISend = async () => {
    const text = aiInput.trim();
    if (!text || aiLoading) return;

    const userMsg = { role: "user", text };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setAiLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: text });
      const reply =
        res?.reply ||
        res?.message ||
        res?.data?.reply ||
        res?.data?.message ||
        "I received your message but couldn't generate a response right now. Please try again.";
      setAiMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const res = await api.post("/chat/conversations", { name: "AI Chat", type: "ai-support", participantIds: [user?._id || user?.id] });
      const conv = res?.conversation || res?.data?.conversation || res;
      if (conv?._id || conv?.id) {
        setConversations((prev) => [conv, ...prev]);
        setSelectedConversation(conv);
        toast.success("Conversation created!");
      }
    } catch {
      toast.error("Failed to create conversation");
    }
  };

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    setConvMessages([]);
    setConvMessagesLoading(true);
    try {
      const res = await api.get(`/chat/conversations/${conv._id}/messages`);
      const msgs = res?.messages || res?.data?.messages || res || [];
      setConvMessages(Array.isArray(msgs) ? msgs : []);
    } catch {
      setConvMessages([]);
    } finally {
      setConvMessagesLoading(false);
    }
  };

  const handleConvSend = async () => {
    const text = convInput.trim();
    if (!text || convLoading || !selectedConversation) return;

    const userMsg = {
      _id: Date.now().toString(),
      role: "user",
      content: text,
      sender: { name: user?.name },
      createdAt: new Date().toISOString(),
    };
    setConvMessages((prev) => [...prev, userMsg]);
    setConvInput("");
    setConvLoading(true);

    try {
      const res = await api.post(
        `/chat/conversations/${selectedConversation._id}/messages`,
        { content: text }
      );
      const msg = res?.message || res?.data?.message || res;
      if (msg) {
        setConvMessages((prev) => [...prev, msg]);
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setConvLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setConvMessages([]);
  };

  return (
    <div className="flex h-screen bg-base-100 overflow-hidden">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-64 bg-base-300 flex flex-col shrink-0 border-r border-base-content/10">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-base-content/10">
          <h1 className="text-xl font-bold">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Lmina AI
            </span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <SidebarLink
            icon={<FiMessageSquare className="w-4 h-4" />}
            label="Chat"
            active
          />
          <SidebarLink
            icon={<FiHome className="w-4 h-4" />}
            label="Dashboard"
            onClick={() => navigate("/dashboard")}
          />
          <SidebarLink
            icon={<FiTarget className="w-4 h-4" />}
            label="Leads"
            onClick={() => navigate("/leads")}
          />
          <SidebarLink
            icon={<FiSettings className="w-4 h-4" />}
            label="Agent Config"
            onClick={() => navigate("/agent")}
          />
          {user?.role === "admin" && (
            <SidebarLink
              icon={<FiShield className="w-4 h-4" />}
              label="Admin"
              onClick={() => navigate("/admin")}
            />
          )}
          <SidebarLink
            icon={<FiUser className="w-4 h-4" />}
            label="Settings"
            onClick={() => navigate("/settings")}
          />
        </nav>

        {/* User Info */}
        <div className="px-3 py-4 border-t border-base-content/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <span className="badge badge-xs badge-primary/20 text-primary border-primary/30">
                {user?.role || "user"}
              </span>
            </div>
          </div>
          <button
            onClick={handleAILogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-error/80 hover:bg-error/10 hover:text-error transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-base-200/30">
        {selectedConversation ? (
          /* ── CONVERSATION VIEW ── */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Conversation Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-base-content/10 bg-base-100/80 backdrop-blur-sm">
              <button
                onClick={handleBackToList}
                className="btn btn-ghost btn-sm btn-square"
              >
                <FiArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {selectedConversation.name || "Conversation"}
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm btn-square">
                <FiUserPlus className="w-4 h-4" />
              </button>
              <button className="btn btn-ghost btn-sm btn-square">
                <FiMoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={convScrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            >
              {convMessagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="loading loading-spinner loading-md text-primary" />
                </div>
              ) : convMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-base-content/40">
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                convMessages.map((msg, i) => {
                  const isUser =
                    msg.role === "user" ||
                    msg.sender?._id === user?._id ||
                    msg.sender?.id === user?.id;
                  return (
                    <div
                      key={msg._id || i}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-lg px-4 py-2.5 rounded-2xl text-sm ${
                          isUser
                            ? "bg-primary/90 text-primary-content rounded-tr-sm"
                            : "bg-base-200/80 backdrop-blur-sm rounded-tl-sm"
                        }`}
                      >
                        {!isUser && msg.sender?.name && (
                          <p className="text-xs font-semibold text-primary mb-1">
                            {msg.sender.name}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content || msg.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
              {convLoading && (
                <div className="flex justify-start">
                  <div className="bg-base-200/80 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Conversation Input */}
            <div className="px-4 py-3 border-t border-base-content/10 bg-base-100/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={convInput}
                  onChange={(e) => setConvInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleConvSend()}
                  placeholder="Type a message..."
                  className="input input-bordered input-sm flex-1 rounded-full bg-base-200/50"
                />
                <button
                  onClick={handleConvSend}
                  disabled={!convInput.trim() || convLoading}
                  className="btn btn-primary btn-sm btn-circle"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── SPLIT VIEW: AI CHAT + CONVERSATIONS ── */
          <div className="flex-1 flex flex-col min-h-0 p-4 gap-4 overflow-hidden">
            {/* Top: AI Assistant */}
            <div className="flex-1 flex flex-col min-h-0 bg-base-100/60 backdrop-blur-md rounded-2xl border border-base-content/10 overflow-hidden">
              {/* AI Header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-base-content/10">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <div>
                  <h2 className="font-semibold text-sm">AI Agent Assistant</h2>
                  <p className="text-xs text-base-content/50">
                    Ask me anything about your business, generate leads, or draft emails
                  </p>
                </div>
              </div>

              {/* AI Messages */}
              <div
                ref={aiScrollRef}
                className="flex-1 overflow-y-auto px-5 py-4"
              >
                {aiMessages.map((msg, i) =>
                  msg.role === "user" ? (
                    <UserMessage key={i} text={msg.text} />
                  ) : (
                    <AIMessage key={i} text={msg.text} />
                  )
                )}
                {aiLoading && <TypingIndicator />}
              </div>

              {/* AI Input */}
              <div className="px-4 py-3 border-t border-base-content/10">
                <div className="flex items-center gap-2">
                  <input
                    ref={aiInputRef}
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleAISend()
                    }
                    placeholder="Ask the AI assistant..."
                    className="input input-bordered flex-1 rounded-full bg-base-200/50 text-sm"
                  />
                  <button
                    onClick={handleAISend}
                    disabled={!aiInput.trim() || aiLoading}
                    className="btn btn-primary btn-circle"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom: Conversations */}
            <div className="h-56 shrink-0 bg-base-100/60 backdrop-blur-md rounded-2xl border border-base-content/10 flex flex-col overflow-hidden">
              {/* Conversations Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-base-content/10">
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-base-content/50" />
                  <h2 className="font-semibold text-sm">Recent Conversations</h2>
                  {conversations.length > 0 && (
                    <span className="badge badge-sm badge-primary/20 text-primary border-primary/30">
                      {conversations.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
                    <FiMessageSquare className="w-8 h-8 text-base-content/20" />
                    <p className="text-sm text-base-content/40 text-center">
                      No conversations yet. Start a new one!
                    </p>
                    <button
                      onClick={handleCreateConversation}
                      className="btn btn-primary btn-sm gap-2"
                    >
                      <FiPlus className="w-3 h-3" />
                      Start AI Chat Conversation
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-base-content/5">
                    {conversations.map((conv) => (
                      <button
                        key={conv._id || conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className="flex items-center gap-3 w-full px-5 py-3 hover:bg-base-200/40 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <FiMessageSquare className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {conv.name || "Conversation"}
                          </p>
                          <p className="text-xs text-base-content/40 truncate">
                            {conv.lastMessage?.content ||
                              conv.lastMessage?.text ||
                              "No messages yet"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-base-content/30">
                            {timeAgo(conv.updatedAt)}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="badge badge-xs badge-primary text-white">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-primary/15 text-primary"
          : "text-base-content/60 hover:bg-base-content/5 hover:text-base-content"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
