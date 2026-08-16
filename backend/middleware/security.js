/**
 * Security Middleware for Akario Mart Backend
 * Protects against NoSQL Injection, Brute-Force Attacks, DoS, and Parameter Tampering.
 */

// 1. NoSQL Injection Sanitization Helper
const sanitizeValue = (data) => {
  if (data instanceof Object) {
    for (const key in data) {
      if (key.startsWith('$') || key.includes('.')) {
        console.warn(`SECURITY ALERT: Removed suspicious NoSQL operator key: ${key}`);
        delete data[key];
      } else {
        data[key] = sanitizeValue(data[key]);
      }
    }
  }
  return data;
};

// NoSQL Injection Prevention Middleware
exports.mongoSanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

// 2. In-Memory Rate Limiter Helper (Window-based)
const rateLimitStore = new Map();

// Periodic cleanup every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Custom Rate Limiter Factory
 * @param {Object} options - { windowMs, max, message }
 */
exports.rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const max = options.max || 100; // 100 requests limit per window default
  const message = options.message || 'Too many requests from this IP, please try again later.';

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, record);
    } else {
      record.count += 1;
    }

    // Set standard rate limit response headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      console.warn(`SECURITY ALERT: Rate limit exceeded for IP: ${ip} on route: ${req.originalUrl}`);
      return res.status(429).json({
        success: false,
        error: message
      });
    }

    next();
  };
};

// 3. Security Headers Enforcement
exports.secureHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};
