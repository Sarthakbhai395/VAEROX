const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Input Validation & Sanitization
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address. Please use a valid email format (e.g. user@gmail.com).'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    // 2. Strict Privilege Escalation Auditing & Protection
    let registrationRole = 'user'; // Strict default
    
    if (role) {
      const sanitizedRole = role.toLowerCase().trim();
      
      if (sanitizedRole === 'admin') {
        console.warn(`SECURITY ALERT: Public signup attempted role escalation to 'admin'. Email: ${normalizedEmail}, IP: ${req.ip || req.headers['x-forwarded-for']}`);
        return res.status(400).json({
          success: false,
          error: 'Registration with administrator privileges is prohibited.'
        });
      }

      if (sanitizedRole === 'seller') {
        registrationRole = 'seller';
      }
    }

    // 3. Create user in database
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: registrationRole
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Validate email & password
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, password, and role'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address (e.g. user@gmail.com)'
      });
    }

    // Regular login handles all roles securely using the database
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Wrong email or password'
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(401).json({
        success: false,
        error: 'You are blocked by admin'
      });
    }

    // Check if role matches
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        error: `Please login as ${user.role}`
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Wrong email or password'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    // Check for user
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address'
      });
    }

    // Generate 6-digit OTP
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Check if SMTP credentials are configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.error('[SMTP CONFIG ERROR] Missing required SMTP credentials in environment variables.');
      return res.status(500).json({
        success: false,
        error: 'SMTP email service is not configured on the server.'
      });
    }

    // MailerCloud HTML message with Akario Mart branding
    const message = `
      <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; background: #0A0A0A; border: 1px solid #26241E; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #C9A84C, #9B782B); padding: 24px; text-align: center;">
          <h1 style="color: #000; margin: 0; font-size: 24px; letter-spacing: 4px;">AKARIO MART</h1>
          <p style="color: #000; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">PASSWORD RESET VERIFICATION</p>
        </div>
        <div style="padding: 32px; text-align: center;">
          <p style="color: #E8E0CC; font-size: 14px; margin-bottom: 24px;">You requested a password reset for your Akario Mart account. Use the verification OTP below to proceed:</p>
          <div style="background: #141414; border: 2px solid #C9A84C; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="color: #C9A84C; font-size: 36px; font-weight: bold; letter-spacing: 12px; margin: 0;">${otp}</p>
          </div>
          <p style="color: #A39E93; font-size: 12px; margin-top: 16px;">This OTP is valid for <strong style="color: #C9A84C;">10 minutes</strong>.</p>
          <p style="color: #A39E93; font-size: 12px;">If you didn't request this password reset, please secure your account.</p>
        </div>
        <div style="background: #050505; padding: 16px; text-align: center; border-top: 1px solid #26241E;">
          <p style="color: #666; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Akario Mart — Premier Shopping Experience</p>
        </div>
      </div>
    `;

    // Configure MailerCloud Transporter
    const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      requireTLS: smtpPort === 587,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000
    });

    // Step 1: Verify SMTP Connection & Authentication
    try {
      await transporter.verify();
      console.log('[MAILERCLOUD SMTP VERIFY SUCCESS] Established connection with MailerCloud SMTP.');
    } catch (verifyErr) {
      console.error('[MAILERCLOUD SMTP VERIFY FAILED]', {
        code: verifyErr.code,
        responseCode: verifyErr.responseCode,
        command: verifyErr.command,
        response: verifyErr.response,
        message: verifyErr.message
      });
      return res.status(502).json({
        success: false,
        error: 'Unable to connect to email provider. Please try again later.'
      });
    }

    // Step 2: Attempt Email Delivery
    const mailOptions = {
      from: `"Akario Mart" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL}>`,
      to: user.email,
      subject: 'Your Password Reset OTP — Akario Mart',
      html: message
    };

    try {
      const info = await transporter.sendMail(mailOptions);

      if (!info || !info.messageId) {
        throw new Error('Email provider did not return a valid message ID');
      }

      console.log('[MAILERCLOUD DISPATCH SUCCESS]', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response
      });

      // Step 3: Persist OTP in MongoDB ONLY after email delivery is accepted by MailerCloud
      await user.save({ validateBeforeSave: false });

      return res.status(200).json({
        success: true,
        message: 'OTP sent to your registered email address'
      });
    } catch (emailErr) {
      console.error('[MAILERCLOUD DISPATCH FAILED]', {
        code: emailErr.code,
        responseCode: emailErr.responseCode,
        command: emailErr.command,
        response: emailErr.response,
        message: emailErr.message
      });

      return res.status(502).json({
        success: false,
        error: 'Unable to send OTP email. Please try again later.'
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Hash the provided OTP to compare
    const hashedOTP = require('crypto').createHash('sha256').update(otp.toString()).digest('hex');

    const user = await User.findOne({
      email: normalizedEmail,
      otpCode: hashedOTP,
      otpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // OTP is valid — generate a short-lived reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      resetToken
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Reset password after OTP verification
// @route   PUT /api/auth/reset-password-otp
// @access  Public
exports.resetPasswordOTP = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, OTP, and new password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Hash the provided OTP to compare
    const hashedOTP = require('crypto').createHash('sha256').update(otp.toString()).digest('hex');

    const user = await User.findOne({
      email: normalizedEmail,
      otpCode: hashedOTP,
      otpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // Set new password
    user.password = password;
    user.otpCode = undefined;
    user.otpExpire = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (err) {
    console.error('Reset password OTP error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Reset password (via token link - legacy)
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = require('crypto').createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};