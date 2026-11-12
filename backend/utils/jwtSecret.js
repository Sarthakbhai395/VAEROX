const crypto = require('crypto');

let ephemeralDevSecret = null;

/**
 * Resolves the JWT signing/verification secret consistently across models and middleware.
 * Never falls back to a static hardcoded secret committed to source control.
 */
exports.getJwtSecret = () => {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim()) {
    return process.env.JWT_SECRET.trim();
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be configured in production');
  }

  if (!ephemeralDevSecret) {
    ephemeralDevSecret = crypto.randomBytes(32).toString('hex');
  }

  return ephemeralDevSecret;
};

