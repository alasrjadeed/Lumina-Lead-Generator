import mongoose from 'mongoose';

const knowledgeBaseSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: 50000,
    },
    category: {
      type: String,
      trim: true,
      default: 'general',
    },
    embedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeBaseSchema.index({ businessId: 1 });
knowledgeBaseSchema.index({ businessId: 1, category: 1 });
knowledgeBaseSchema.index({ businessId: 1, isActive: 1 });

const KnowledgeBase = mongoose.model('KnowledgeBase', knowledgeBaseSchema);

export default KnowledgeBase;
