import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../../services/api';

const ForgotPassword = () => {
  // Step 1: Email, Step 2: OTP, Step 3: New Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState('');
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Auto-focus first OTP input when step 2 is reached
  useEffect(() => {
    if (step === 2 && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    }
  }, [step]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newOtp = [...otp];
      digits.split('').forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace for OTP inputs
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // STEP 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Strict email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address (e.g. user@gmail.com).');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email.trim());

      if (response.success) {
        setMessage(response.message);
        if (response.devOtp) {
          setDevOtp(response.devOtp);
        }
        setStep(2);
        setCountdown(60); // 60-second resend cooldown
      } else {
        setError(response.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setError('');
    setMessage('');
    setOtp(['', '', '', '', '', '']);
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email.trim());
      if (response.success) {
        setMessage('New OTP sent to your email!');
        if (response.devOtp) {
          setDevOtp(response.devOtp);
        }
        setCountdown(60);
      } else {
        setError(response.error || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyOTP(email.trim(), otpValue);

      if (response.success) {
        setMessage('OTP verified! Set your new password.');
        setStep(3);
      } else {
        setError(response.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const otpValue = otp.join('');
      const response = await authAPI.resetPasswordOTP(email.trim(), otpValue, password);

      if (response.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setError(response.error || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step indicator icons
  const stepIcons = [
    // Step 1: Email
    <svg className="h-8 w-8 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>,
    // Step 2: OTP
    <svg className="h-8 w-8 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>,
    // Step 3: New Password
    <svg className="h-8 w-8 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ];

  const stepTitles = ['Enter Your Email', 'Verify OTP', 'Set New Password'];
  const stepSubtitles = [
    'We\'ll send a verification code to your email',
    'Enter the 6-digit code sent to your email',
    'Create a strong new password'
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#E8E0CC]">
      <motion.div
        className="max-w-md w-full space-y-8 bg-[#0A0A0A] p-10 rounded-2xl shadow-2xl border border-[#26241E]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Step Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step >= s
                    ? 'bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black'
                    : 'bg-[#141414] text-[#A39E93] border border-[#26241E]'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 transition-all duration-300 ${step > s ? 'bg-[#C9A84C]' : 'bg-[#26241E]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="mx-auto h-16 w-16 rounded-full bg-[#141414] border border-[#C9A84C]/40 flex items-center justify-center shadow-lg">
              {stepIcons[step - 1]}
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[#FFF5D6] font-serif tracking-tight">
              {stepTitles[step - 1]}
            </h2>
            <p className="mt-2 text-center text-sm text-[#C9A84C] uppercase tracking-widest font-semibold">
              {stepSubtitles[step - 1]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Messages */}
        {message && (
          <motion.div
            className="bg-green-950/30 border border-green-500/40 text-green-300 px-4 py-3 rounded-xl text-sm font-semibold"
            role="alert"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="block sm:inline">{message}</span>
          </motion.div>
        )}

        {devOtp && step === 2 && (
          <motion.div
            className="bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#FFF5D6] px-4 py-3 rounded-xl text-sm"
            role="alert"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="block font-bold text-[#C9A84C] text-xs uppercase tracking-wider mb-1">Dev Mode OTP:</span>
            <span className="block text-2xl font-mono font-bold tracking-widest text-center">{devOtp}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="bg-red-950/50 border border-red-500/60 text-red-200 px-4 py-3 rounded-xl text-sm font-semibold"
            role="alert"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}

        {/* Step 1: Email Form */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              className="mt-8 space-y-6"
              onSubmit={handleSendOTP}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label htmlFor="email-address" className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1">
                  Registered Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-[#26241E] placeholder-[#A39E93] text-[#E8E0CC] rounded-xl focus:outline-none focus:border-[#C9A84C] text-sm transition duration-300 bg-[#121212]"
                  placeholder="Enter your registered email"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-extrabold rounded-xl text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] hover:scale-102 focus:outline-none disabled:opacity-50 transition duration-300 uppercase tracking-wider shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : 'Send OTP'}
              </motion.button>
            </motion.form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <motion.form
              key="step2"
              className="mt-8 space-y-6"
              onSubmit={handleVerifyOTP}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-3 text-center">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 border-[#26241E] rounded-xl bg-[#121212] text-[#FFF5D6] focus:outline-none focus:border-[#C9A84C] transition duration-300"
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-[#A39E93]">
                    Resend OTP in <span className="text-[#C9A84C] font-bold">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-xs font-semibold text-[#C9A84C] hover:text-[#FFF5D6] transition-colors disabled:opacity-50"
                  >
                    Didn't receive OTP? Resend
                  </button>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-extrabold rounded-xl text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] hover:scale-102 focus:outline-none disabled:opacity-50 transition duration-300 uppercase tracking-wider shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : 'Verify OTP'}
              </motion.button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setMessage(''); setOtp(['', '', '', '', '', '']); }}
                className="w-full text-xs font-medium text-[#A39E93] hover:text-[#E8E0CC] transition-colors text-center"
              >
                ← Change email
              </button>
            </motion.form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <motion.form
              key="step3"
              className="mt-8 space-y-6"
              onSubmit={handleResetPassword}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border border-[#26241E] placeholder-[#A39E93] text-[#E8E0CC] rounded-xl focus:outline-none focus:border-[#C9A84C] text-sm transition duration-300 bg-[#121212]"
                    placeholder="Min. 6 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border border-[#26241E] placeholder-[#A39E93] text-[#E8E0CC] rounded-xl focus:outline-none focus:border-[#C9A84C] text-sm transition duration-300 bg-[#121212]"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-extrabold rounded-xl text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] hover:scale-102 focus:outline-none disabled:opacity-50 transition duration-300 uppercase tracking-wider shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password...
                  </span>
                ) : 'Reset Password'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer Link */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs text-[#E8E0CC]/70">
            Remember your password?{' '}
            <Link to="/login" className="font-bold text-[#C9A84C] hover:text-[#FFF5D6] transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
