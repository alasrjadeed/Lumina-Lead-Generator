import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { FiCheck, FiCheckCircle, FiDownload, FiPlay, FiPause, FiMoreVertical, FiCornerUpLeft, FiTrash2 } from 'react-icons/fi';

export default function MessageBubble({ message, isOwn, isGroup }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const menuRef = useRef(null);

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3 animate-fade-in">
        <span className="text-xs text-base-content/50 bg-base-200 rounded-full px-3 py-1">
          {message.content}
        </span>
      </div>
    );
  }

  const timestamp = message.createdAt
    ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
    : '';

  const isRead = message.readBy?.length > 1;

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <>
      <div
        className={`flex gap-2 mb-3 animate-fade-in group ${
          isOwn ? 'flex-row-reverse' : 'flex-row'
        }`}
        onMouseLeave={() => setShowMenu(false)}
      >
        {!isOwn && isGroup && message.sender?.avatar ? (
          <img
            src={message.sender.avatar}
            alt=""
            className="w-8 h-8 rounded-full object-cover mt-1 shrink-0"
          />
        ) : !isOwn && isGroup ? (
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center mt-1 shrink-0">
            {message.sender?.name?.[0]?.toUpperCase() || '?'}
          </div>
        ) : null}

        <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && isGroup && message.sender?.name && (
            <span className="text-xs font-medium text-primary mb-1 px-1">
              {message.sender.name}
            </span>
          )}

          <div className="relative">
            <div
              className={`rounded-2xl px-4 py-2 text-sm leading-relaxed break-words ${
                isOwn
                  ? 'bg-primary text-primary-content rounded-br-md'
                  : 'bg-base-200 text-base-content rounded-bl-md'
              }`}
            >
              {message.type === 'text' && message.content && (
                <div className="prose prose-sm max-w-none prose-p:my-0 prose-pre:bg-base-300 prose-code:text-xs">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}

              {message.type === 'image' && message.mediaUrl && (
                <div
                  className="cursor-pointer rounded-lg overflow-hidden max-w-[280px]"
                  onClick={() => setShowImage(true)}
                >
                  <img
                    src={message.mediaUrl}
                    alt="Image"
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                </div>
              )}

              {message.type === 'video' && message.mediaUrl && (
                <video
                  src={message.mediaUrl}
                  controls
                  className="max-w-[280px] rounded-lg"
                />
              )}

              {message.type === 'file' && message.mediaUrl && (
                <a
                  href={message.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 p-2 rounded-lg hover:bg-opacity-20 ${
                    isOwn ? 'hover:bg-white/10' : 'hover:bg-base-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                    <FiDownload size={18} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium truncate max-w-[160px]">
                      {message.content || 'File'}
                    </p>
                    <p className="text-[10px] opacity-60">Click to download</p>
                  </div>
                </a>
              )}

              {message.type === 'voice' && message.mediaUrl && (
                <div className="flex items-center gap-2 min-w-[180px]">
                  <button
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={toggleAudio}
                  >
                    {playing ? <FiPause size={14} /> : <FiPlay size={14} />}
                  </button>
                  <div className="flex-1 h-1 bg-base-300/50 rounded-full overflow-hidden">
                    <div className="h-full bg-current rounded-full w-0" />
                  </div>
                  <audio
                    ref={audioRef}
                    src={message.mediaUrl}
                    onEnded={() => setPlaying(false)}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <div
              className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                isOwn ? '-left-8' : '-right-8'
              }`}
            >
              <button
                className="btn btn-ghost btn-xs btn-circle text-base-content/40"
                onClick={toggleMenu}
              >
                <FiMoreVertical size={14} />
              </button>
            </div>

            {showMenu && (
              <div
                ref={menuRef}
                className={`absolute top-full mt-1 z-30 bg-base-100 border border-base-300 rounded-lg shadow-lg py-1 min-w-[120px] ${
                  isOwn ? 'right-0' : 'left-0'
                }`}
              >
                <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-base-200">
                  <FiCornerUpLeft size={12} /> Reply
                </button>
                {isOwn && (
                  <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-base-200 text-error">
                    <FiTrash2 size={12} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>

          <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] text-base-content/40">{timestamp}</span>
            {isOwn && (
              <span className="text-base-content/50">
                {isRead ? <FiCheckCircle size={12} className="text-primary" /> : <FiCheck size={12} />}
              </span>
            )}
          </div>

          {message.reactions?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 px-1">
              {message.reactions.map((r, i) => (
                <span
                  key={i}
                  className="text-xs bg-base-200 rounded-full px-1.5 py-0.5 border border-base-300"
                >
                  {r.emoji}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {showImage && message.mediaUrl && (
        <dialog className="modal modal-open" onClick={() => setShowImage(false)}>
          <div className="modal-box max-w-3xl p-2 bg-transparent">
            <img
              src={message.mediaUrl}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowImage(false)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
}
