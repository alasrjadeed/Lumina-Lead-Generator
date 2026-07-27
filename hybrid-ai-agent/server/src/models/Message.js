import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation is required'],
    },
    content: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'voice', 'video', 'system'],
      default: 'text',
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deliveredTo: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        emoji: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    senderType: {
      type: String,
      enum: ['user', 'ai', 'visitor', 'agent'],
      default: 'user',
    },
    senderName: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
