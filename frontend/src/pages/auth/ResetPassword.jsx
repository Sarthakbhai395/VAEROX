import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { resettoken } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.resetPassword(resettoken, password);

      if (response.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.error || response.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#E8E0CC]">
      <motion.div 
        className="max-w-md w-full space-y-8 bg-[#0A0A0A] p-10 rounded-2xl shadow-2xl border border-[#26241E]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="mx-auto h-16 w-16 rounded-full bg-[#141414] border border-[#C9A84C]/40 flex items-center justify-center shadow-lg">
            <svg className="h-8 w-8 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#FFF5D6] font-serif tracking-tight">
            Set New Password
          </h2>
          <p className="mt-2 text-center text-sm text-[#C9A84C] uppercase tracking-widest font-semibold">
            Create a strong new password
          </p>
        </motion.div>
        
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
        
        <motion.form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1">
                New Password
              </label>
              <input
                id="password"
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

          <div>
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
                  Resetting...
                </span>
              ) : 'Reset Password'}
            </motion.button>
          </div>
        </motion.form>
        
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

export default ResetPassword;
