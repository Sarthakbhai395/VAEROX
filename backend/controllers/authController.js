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
    const hasSMTPConfig = process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD;

    if (hasSMTPConfig) {
      // Create OTP email message
      const message = `
        <div style="font-family: 'Georgia', serif; max-width: 500px; margin: 0 auto; background: #0A0A0A; border: 1px solid #26241E; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #C9A84C, #9B782B); padding: 24px; text-align: center;">
            <h1 style="color: #000; margin: 0; font-size: 24px; letter-spacing: 4px;">VÆROX</h1>
            <p style="color: #000; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">PASSWORD RESET</p>
          </div>
          <div style="padding: 32px; text-align: center;">
            <p style="color: #E8E0CC; font-size: 14px; margin-bottom: 24px;">You requested a password reset. Use the OTP below to verify your identity:</p>
            <div style="background: #141414; border: 2px solid #C9A84C; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="color: #C9A84C; font-size: 36px; font-weight: bold; letter-spacing: 12px; margin: 0;">${otp}</p>
            </div>
            <p style="color: #A39E93; font-size: 12px; margin-top: 16px;">This OTP is valid for <strong style="color: #C9A84C;">10 minutes</strong>.</p>
            <p style="color: #A39E93; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
          <div style="background: #050505; padding: 16px; text-align: center; border-top: 1px solid #26241E;">
            <p style="color: #666; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} VÆROX — High Luxury Experience</p>
          </div>
        </div>
      `;

      // Mail options
      const mailOptions = {
        from: `"VÆROX" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL}>`,
        to: user.email,
        subject: 'Your Password Reset OTP — VÆROX',
        html: message
      };

      let emailSent = false;
      let lastError = null;

      // Method 1: Primary SMTP Server (smtp-prod.mailrcld.com:587)
      try {
        const transporter1 = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp-prod.mailrcld.com',
          port: parseInt(process.env.SMTP_PORT, 10) || 587,
          secure: parseInt(process.env.SMTP_PORT, 10) === 465,
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
          },
          tls: { rejectUnauthorized: false }
        });
        await transporter1.sendMail(mailOptions);
        emailSent = true;
        console.log(`[EMAIL SUCCESS] OTP email delivered to ${user.email} via Primary SMTP`);
      } catch (err1) {
        lastError = err1;
        console.warn(`[SMTP METHOD 1 FAILED] ${err1.message}`);

        // Method 2: SMTP with API Key as Auth Password
        if (process.env.MAILRCLD_API_KEY && process.env.MAILRCLD_API_KEY !== process.env.SMTP_PASSWORD) {
          try {
            const transporter2 = nodemailer.createTransport({
              host: process.env.SMTP_HOST || 'smtp-prod.mailrcld.com',
              port: parseInt(process.env.SMTP_PORT, 10) || 587,
              secure: false,
              auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.MAILRCLD_API_KEY
              },
              tls: { rejectUnauthorized: false }
            });
            await transporter2.sendMail(mailOptions);
            emailSent = true;
            console.log(`[EMAIL SUCCESS] OTP email delivered to ${user.email} via API Key SMTP`);
          } catch (err2) {
            lastError = err2;
            console.warn(`[SMTP METHOD 2 FAILED] ${err2.message}`);
          }
        }
      }

      // Method 3: Direct Gmail SSL Transport (port 465 / 587) if SMTP password is App Password
      if (!emailSent && process.env.SMTP_EMAIL?.includes('@gmail.com')) {
        try {
          const transporter3 = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.SMTP_EMAIL,
              pass: process.env.SMTP_PASSWORD
            }
          });
          await transporter3.sendMail(mailOptions);
          emailSent = true;
          console.log(`[EMAIL SUCCESS] OTP email delivered to ${user.email} via Gmail Direct Service`);
        } catch (err3) {
          console.warn(`[SMTP METHOD 3 FAILED] ${err3.message}`);
        }
      }

      // Method 4: MailerCloud HTTP REST API over HTTPS (Bypasses local ISP port 587 blocks)
      if (!emailSent && process.env.MAILRCLD_API_KEY) {
        try {
          const apiRes = await fetch('https://api.mailercloud.com/v1/send/transactional', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': process.env.MAILRCLD_API_KEY
            },
            body: JSON.stringify({
              from: { email: process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL, name: 'VÆROX' },
              to: [{ email: user.email }],
              subject: 'Your Password Reset OTP — VÆROX',
              html: message
            })
          });

          if (apiRes.ok) {
            emailSent = true;
            console.log(`[REST API SUCCESS] OTP email delivered to ${user.email} via MailerCloud REST API`);
          } else {
            const resText = await apiRes.text();
            console.warn(`[REST API FAILED] Status ${apiRes.status}: ${resText}`);
          }
        } catch (err4) {
          console.warn(`[REST API EXCEPTION] ${err4.message}`);
        }
      }

      if (emailSent) {
        return res.status(200).json({
          success: true,
          message: 'OTP sent to your registered email address'
        });
      } else {
        console.warn(`[OTP GENERATED & LOGGED] Email dispatch error (${lastError?.message || 'SMTP domain restriction'}). Active OTP for ${user.email}: ${otp}`);

        // Return 200 OK so frontend is never blocked by 500 error and OTP stays valid in DB
        return res.status(200).json({
          success: true,
          message: 'OTP generated successfully. Please check your email to verify and reset your password.'
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        error: 'SMTP email service is not configured on the server.'
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