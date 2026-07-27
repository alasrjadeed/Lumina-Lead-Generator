import mongoose from 'mongoose';

const otpSessionSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
    },
    purpose: {
      type: String,
      enum: ['login', 'register', 'reset'],
      required: [true, 'Purpose is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

otpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSessionSchema.index({ phone: 1, purpose: 1 });
otpSessionSchema.index({ email: 1, purpose: 1 });

const OTPSession = mongoose.model('OTPSession', otpSessionSchema);

export default OTPSession;
