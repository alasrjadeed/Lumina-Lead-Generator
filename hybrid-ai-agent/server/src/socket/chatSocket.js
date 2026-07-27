import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

const onlineUsers = new Map();

function emitError(socket, event, message) {
  socket.emit(event, { success: false, error: message });
}

function isParticipant(conversation, userId) {
  return conversation.participants.some(
    (p) => p.toString() === userId.toString()
  );
}

export function setupSocketHandlers(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id || socket.user._id;
    console.log(`User connected: ${userId}`);

    onlineUsers.set(userId, socket.id);

    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      });
    } catch {
      // non-critical, continue
    }

    io.emit('user_online', { userId });

    socket.on('join_conversation', async (conversationId, callback) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          const err = 'Conversation not found';
          if (callback) return callback({ success: false, error: err });
          return emitError(socket, 'join_conversation_error', err);
        }

        if (!isParticipant(conversation, userId)) {
          const err = 'You are not a participant of this conversation';
          if (callback) return callback({ success: false, error: err });
          return emitError(socket, 'join_conversation_error', err);
        }

        socket.join(conversationId);
        socket.currentConversation = conversationId;

        if (callback) return callback({ success: true });
      } catch (error) {
        if (callback) return callback({ success: false, error: error.message });
        emitError(socket, 'join_conversation_error', error.message);
      }
    });

    socket.on('leave_conversation', (conversationId, callback) => {
      try {
        socket.leave(conversationId);

        if (socket.currentConversation === conversationId) {
          socket.currentConversation = null;
        }

        if (callback) return callback({ success: true });
      } catch (error) {
        if (callback) return callback({ success: false, error: error.message });
        emitError(socket, 'leave_conversation_error', error.message);
      }
    });

    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, content, type = 'text', mediaUrl = null } = data;

        if (!conversationId || !content) {
          const err = 'conversationId and content are required';
          if (callback) return callback({ success: false, error: err });
          return emitError(socket, 'send_message_error', err);
        }

        const conversation = await Conversation.findById(conversationId).populate('business');

        if (!conversation) {
          const err = 'Conversation not found';
          if (callback) return callback({ success: false, error: err });
          return emitError(socket, 'send_message_error', err);
        }

        if (!isParticipant(conversation, userId)) {
          const err = 'You are not a participant of this conversation';
          if (callback) return callback({ success: false, error: err });
          return emitError(socket, 'send_message_error', err);
        }

        const message = await Message.create({
          sender: userId,
          conversation: conversationId,
          content,
          type,
          mediaUrl,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          $inc: Object.fromEntries(
            conversation.participants
              .filter((p) => p.toString() !== userId.toString())
              .map((p) => [`unreadCount.${p.toString()}`, 1])
          ),
        });

        const populated = await Message.findById(message._id).populate(
          'sender',
          'name avatar role'
        );

        io.to(conversationId).emit('new_message', {
          success: true,
          message: populated,
        });

        if (callback) callback({ success: true, message: populated });

        // Auto-reply with AI if no agent assigned
        if (conversation && !conversation.assignedAgent) {
          try {
            const { default: aiService } = await import('../services/ai/aiService.js');
            const KnowledgeBase = (await import('../models/KnowledgeBase.js')).default;

            // Get business knowledge for context
            const knowledge = await KnowledgeBase.find({ businessId: conversation.business }).limit(10);
            const businessContext = knowledge.map(k => `${k.title}: ${k.content}`).join('\n');

            // Build conversation history
            const history = await Message.find({ conversation: conversationId })
              .sort({ createdAt: -1 })
              .limit(20);

            const messages = history.reverse().map(m => ({
              role: m.senderType === 'ai' ? 'assistant' : 'user',
              content: m.content
            }));

            // Emit typing indicator
            io.to(conversationId).emit('ai_thinking', { conversationId });

            // Get AI response
            const aiResponse = await aiService.agentChat(messages, businessContext);

            if (aiResponse) {
              const aiMessage = await Message.create({
                conversation: conversationId,
                content: aiResponse,
                type: 'text',
                senderType: 'ai',
                senderName: 'AI Agent',
                readBy: []
              });

              conversation.lastMessage = aiMessage._id;
              await conversation.save();

              io.to(conversationId).emit('new_message', {
                _id: aiMessage._id,
                conversation: conversationId,
                content: aiResponse,
                senderType: 'ai',
                senderName: 'AI Agent',
                createdAt: aiMessage.createdAt
              });

              io.to(conversationId).emit('ai_done', { conversationId });
            }
          } catch (err) {
            console.error('[Socket] AI auto-reply error:', err.message);
            io.to(conversationId).emit('ai_done', { conversationId });
          }
        }
      } catch (error) {
        if (callback) return callback({ success: false, error: error.message });
        emitError(socket, 'send_message_error', error.message);
      }
    });

    socket.on('typing_start', (conversationId) => {
      try {
        if (!conversationId) return;

        socket.to(conversationId).emit('user_typing', {
          userId,
          conversationId,
        });
      } catch {
        // non-critical
      }
    });

    socket.on('typing_stop', (conversationId) => {
      try {
        if (!conversationId) return;

        socket.to(conversationId).emit('user_stopped_typing', {
          userId,
          conversationId,
        });
      } catch {
        // non-critical
      }
    });

    socket.on('mark_read', async (data) => {
      try {
        const { conversationId } = data;

        if (!conversationId) return emitError(socket, 'mark_read_error', 'conversationId is required');

        const conversation = await Conversation.findById(conversationId);

        if (!conversation || !isParticipant(conversation, userId)) {
          return emitError(socket, 'mark_read_error', 'Conversation not found or access denied');
        }

        await Message.updateMany(
          {
            conversation: conversationId,
            'readBy.user': { $ne: userId },
          },
          {
            $push: {
              readBy: { user: userId, readAt: new Date() },
            },
          }
        );

        await Conversation.findByIdAndUpdate(conversationId, {
          [`unreadCount.${userId}`]: 0,
        });

        io.to(conversationId).emit('messages_read', {
          userId,
          conversationId,
          readAt: new Date(),
        });
      } catch (error) {
        emitError(socket, 'mark_read_error', error.message);
      }
    });

    socket.on('user_status_change', async (data) => {
      try {
        const { status } = data;
        const validStatuses = ['online', 'away', 'busy'];

        if (!validStatuses.includes(status)) {
          return emitError(socket, 'user_status_change_error', `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

        io.emit('user_status_change', {
          userId,
          status,
          updatedAt: new Date(),
        });
      } catch (error) {
        emitError(socket, 'user_status_change_error', error.message);
      }
    });

    socket.on('whatsapp_message', async (data, callback) => {
      try {
        const { to, message, media } = data;

        if (!to || !message) {
          const err = 'to and message are required';
          if (callback) return callback({ success: false, error: err });
          return emitError(socket, 'whatsapp_message_error', err);
        }

        // Delegate to WhatsApp service (initialized externally via app.set('io'))
        // The whatsappClient module should expose a send function
        // For now, emit to a WhatsApp channel for the service to pick up
        io.emit('whatsapp_outbound', { to, message, media, from: userId });

        if (callback) return callback({ success: true, message: 'WhatsApp message queued' });
      } catch (error) {
        if (callback) return callback({ success: false, error: error.message });
        emitError(socket, 'whatsapp_message_error', error.message);
      }
    });

    socket.on('request_ai_response', async (data, callback) => {
      try {
        const { conversationId, message } = data;

        if (!conversationId || !message) {
          const err = 'conversationId and message are required';
          if (callback) return callback({ success: false, error: err });
          return emitError(socket, 'request_ai_response_error', err);
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          const err = 'Conversation not found';
          if (callback) return callback({ success: false, error: err });
          return emitError(socket, 'request_ai_response_error', err);
        }

        // Save user message if one wasn't already sent via send_message
        // Emit thinking indicator
        io.to(conversationId).emit('ai_thinking', { conversationId });

        // Placeholder: AI service integration point.
        // Replace this with actual AI service call when available.
        let aiReply = 'AI service is not configured yet. Please set up the AI service module.';

        try {
          const aiModule = await import('../services/ai/aiService.js').catch(
            () => null
          );

          if (aiModule?.default?.chat) {
            const response = await aiModule.default.chat(
              [{ role: 'user', content: message }],
            );
            aiReply = response;
          }
        } catch {
          // AI service not available, use default reply
        }

        const aiMessage = await Message.create({
          sender: new mongoose.Types.ObjectId(),
          conversation: conversationId,
          content: aiReply,
          type: 'text',
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: aiMessage._id,
        });

        const populated = await Message.findById(aiMessage._id);

        io.to(conversationId).emit('new_message', {
          success: true,
          message: populated,
        });

        if (callback) return callback({ success: true, message: populated });
      } catch (error) {
        if (callback) return callback({ success: false, error: error.message });
        emitError(socket, 'request_ai_response_error', error.message);
      }
    });

    socket.on('agent_assigned', async (data) => {
      try {
        const { conversationId, agentId } = data;

        if (!conversationId || !agentId) {
          return emitError(socket, 'agent_assigned_error', 'conversationId and agentId are required');
        }

        const conversation = await Conversation.findByIdAndUpdate(
          conversationId,
          { assignedAgent: agentId },
          { new: true }
        );

        if (!conversation) {
          return emitError(socket, 'agent_assigned_error', 'Conversation not found');
        }

        const agent = await User.findById(agentId).select('name avatar role');

        io.to(conversationId).emit('agent_assigned', {
          conversationId,
          agent: agent
            ? { _id: agent._id, name: agent.name, avatar: agent.avatar, role: agent.role }
            : { _id: agentId },
          assignedAt: new Date(),
        });
      } catch (error) {
        emitError(socket, 'agent_assigned_error', error.message);
      }
    });

    socket.on('disconnect', async (reason) => {
      console.log(`User disconnected: ${userId} (${reason})`);

      onlineUsers.delete(userId);

      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
      } catch {
        // non-critical
      }

      io.emit('user_online', { userId, online: false });
    });
  });

  return { onlineUsers };
}
