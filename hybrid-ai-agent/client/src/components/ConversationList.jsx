import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiUsers, FiCpu, FiMessageCircle } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import UserAvatar from './UserAvatar';
import SearchBar from './SearchBar';
import EmptyState from './EmptyState';

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'online', label: 'Online' },
  { key: 'groups', label: 'Groups' },
  { key: 'ai', label: 'AI Support' },
];

export default function ConversationList({
  conversations = [],
  activeConversation,
  onSelect,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onlineUserIds = [],
}) {
  const { user } = useAuthStore();
  const currentUserId = user?._id;

  const sorted = useMemo(() => {
    let filtered = [...conversations];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.participants?.some((p) => p.name?.toLowerCase().includes(q))
      );
    }

    if (filter === 'online') {
      filtered = filtered.filter((c) =>
        c.participants?.some(
          (p) => p._id && onlineUserIds.includes(p._id) && p._id !== currentUserId
        )
      );
    } else if (filter === 'groups') {
      filtered = filtered.filter((c) => c.type === 'group');
    } else if (filter === 'ai') {
      filtered = filtered.filter((c) => c.type === 'ai-support');
    }

    return filtered.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.updatedAt || 0;
      const bTime = b.lastMessage?.createdAt || b.updatedAt || 0;
      return new Date(bTime) - new Date(aTime);
    });
  }, [conversations, searchQuery, filter, onlineUserIds, activeConversation]);

  const getConversationName = (conv) => {
    if (conv.name) return conv.name;
    if (conv.type === 'ai-support') return 'AI Support';
    const others = conv.participants?.filter((p) => p._id !== currentUserId) || [];
    return others.map((p) => p.name).join(', ') || 'Unknown';
  };

  const isOnline = (conv) => {
    if (conv.type === 'group' || conv.type === 'ai-support') return false;
    return conv.participants?.some(
      (p) => p._id && onlineUserIds.includes(p._id) && p._id !== currentUserId
    );
  };

  return (
    <div className="flex flex-col h-full bg-base-100 border-r border-base-300">
      <div className="p-3 border-b border-base-300">
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Search conversations..." />
      </div>

      <div className="flex gap-1 px-3 pt-2 pb-1 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            className={`btn btn-xs rounded-full ${
              filter === tab.key ? 'btn-primary' : 'btn-ghost'
            }`}
            onClick={() => onFilterChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {sorted.length === 0 ? (
          <EmptyState
            icon={FiMessageCircle}
            title="No conversations"
            description="Start a new conversation to begin chatting."
          />
        ) : (
          sorted.map((conv) => {
            const active = activeConversation?._id === conv._id;
            const online = isOnline(conv);
            const lastMsg = conv.lastMessage;
            const unread = conv.unreadCount || 0;
            let preview = lastMsg?.content || '';
            if (lastMsg?.type === 'image') preview = '📷 Image';
            else if (lastMsg?.type === 'video') preview = '🎥 Video';
            else if (lastMsg?.type === 'file') preview = '📎 File';
            else if (lastMsg?.type === 'voice') preview = '🎤 Voice message';
            else if (lastMsg?.type === 'system') preview = lastMsg.content;

            let timeStr = '';
            if (lastMsg?.createdAt) {
              timeStr = formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false });
            } else if (conv.updatedAt) {
              timeStr = formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: false });
            }

            return (
              <button
                key={conv._id}
                className={`flex items-center gap-3 w-full px-3 py-3 text-left hover:bg-base-200 transition-colors ${
                  active ? 'bg-primary/10 border-r-2 border-primary' : ''
                }`}
                onClick={() => onSelect(conv)}
              >
                <div className="relative shrink-0">
                  {conv.type === 'group' ? (
                    <div className="w-11 h-11 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
                      <FiUsers size={20} />
                    </div>
                  ) : conv.type === 'ai-support' ? (
                    <div className="w-11 h-11 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                      <FiCpu size={20} />
                    </div>
                  ) : (
                    <UserAvatar
                      user={conv.participants?.find((p) => p._id !== currentUserId)}
                      size="md"
                      online={online}
                      showStatus
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{getConversationName(conv)}</span>
                    <span className="text-[10px] text-base-content/40 shrink-0 ml-2">{timeStr}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-base-content/50 truncate max-w-[180px]">{preview}</p>
                    {unread > 0 && (
                      <span className="badge badge-primary badge-sm shrink-0 ml-2">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
