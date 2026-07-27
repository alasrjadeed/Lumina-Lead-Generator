import mongoose from 'mongoose';

const widgetConfigSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      unique: true,
    },
    theme: {
      type: Map,
      of: String,
      default: {
        primaryColor: '#4F46E5',
        secondaryColor: '#7C3AED',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        headerColor: '#4F46E5',
        headerTextColor: '#FFFFFF',
        widgetButtonColor: '#4F46E5',
      },
    },
    position: {
      type: String,
      enum: ['bottom-right', 'bottom-left'],
      default: 'bottom-right',
    },
    greeting: {
      type: String,
      maxlength: 500,
      default: 'Hello! How can I help you today?',
    },
    autoReply: {
      type: Boolean,
      default: false,
    },
    aiEnabled: {
      type: Boolean,
      default: true,
    },
    allowedDomains: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    workingHours: {
      start: {
        type: String,
        default: '09:00',
      },
      end: {
        type: String,
        default: '17:00',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
    customCSS: {
      type: String,
      maxlength: 10000,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

widgetConfigSchema.index({ businessId: 1 });

const WidgetConfig = mongoose.model('WidgetConfig', widgetConfigSchema);

export default WidgetConfig;
