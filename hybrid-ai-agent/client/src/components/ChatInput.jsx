import { useState, useRef, useCallback, useEffect } from 'react';
import { FiSend, FiMic, FiPaperclip, FiSmile } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ChatInput({ onSend, onTypingStart, onTypingStop }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxPx = 5 * 24;
    el.style.height = `${Math.min(el.scrollHeight, maxPx)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  const emitTypingStart = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart?.();
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop?.();
    }, 2000);
  }, [onTypingStart, onTypingStop]);

  useEffect(() => () => clearTimeout(typingTimerRef.current), []);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    onTypingStop?.();
  }, [text, onSend, onTypingStop]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const type = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : 'file';
      onSend(data.data.url, type);
      toast.success('File uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast('Voice recording started', { icon: '🎙️' });
    } else {
      toast('Voice recording stopped', { icon: '⏹️' });
    }
  };

  return (
    <div className="border-t border-base-300 bg-base-100 px-4 py-3">
      <div className="flex items-end gap-2">
        <button
          className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-primary shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach file"
        >
          {uploading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <FiPaperclip size={18} />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
        />

        <textarea
          ref={textareaRef}
          className="textarea textarea-bordered flex-1 resize-none min-h-[40px] max-h-[120px] text-sm leading-6 bg-base-200"
          placeholder="Type a message..."
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            emitTypingStart();
          }}
          onKeyDown={handleKeyDown}
        />

        <button
          className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-primary shrink-0"
          title="Emoji"
        >
          <FiSmile size={18} />
        </button>

        <button
          className={`btn btn-sm btn-circle shrink-0 ${
            isRecording ? 'btn-error text-white animate-pulse' : 'btn-ghost text-base-content/50 hover:text-primary'
          }`}
          onClick={toggleRecording}
          title={isRecording ? 'Stop recording' : 'Voice message'}
        >
          <FiMic size={18} />
        </button>

        <button
          className="btn btn-primary btn-sm btn-circle shrink-0"
          onClick={handleSend}
          disabled={!text.trim()}
          title="Send"
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
}
