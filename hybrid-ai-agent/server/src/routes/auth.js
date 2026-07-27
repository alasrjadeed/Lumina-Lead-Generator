import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTPSession from '../models/OTPSession.js';
import { protect } from '../middleware/auth.js';

const router = Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || undefined,
      role: 'user'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, message: 'Account has been banned' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, theme: user.theme, status: user.status }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Phone or email is required' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const otpQuery = phone ? { phone } : { email };
    const otpData = { otp, expiresAt, purpose: 'login' };
    if (phone) otpData.phone = phone;
    if (email) otpData.email = email;

    await OTPSession.findOneAndDelete(otpQuery);
    await OTPSession.create(otpData);

    const identifier = phone || email;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[OTP] ${identifier}: ${otp}`);
    }

    res.json({ success: true, data: { message: 'OTP sent successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, email, otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    const identifier = phone || email;
    const otpQuery = phone ? { phone, otp } : { email, otp };
    const session = await OTPSession.findOne(otpQuery);

    if (!session) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > session.expiresAt) {
      await OTPSession.deleteOne({ _id: session._id });
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    await OTPSession.deleteOne({ _id: session._id });

    let user = await User.findOne(
      phone ? { phone: identifier } : { email: identifier }
    );

    if (!user) {
      const defaultEmail = email || `${phone}@temp.placeholder`;
      const defaultPhone = phone || undefined;
      user = await User.create({
        name: 'User',
        email: defaultEmail,
        phone: defaultPhone,
        password: await bcrypt.hash(Math.random().toString(36).slice(-12), 10),
        isVerified: true
      });
    }

    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, avatar, theme, status } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;
    if (theme !== undefined) updates.theme = theme;
    if (status !== undefined) updates.status = status;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, data: { message: 'Password updated successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
