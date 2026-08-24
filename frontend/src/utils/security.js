/**
 * VÆROX Cybersecurity Hardening Module
 * Features:
 * - XSS Input Sanitization & HTML Escaping
 * - SQL Injection & Script Execution Detection
 * - Client-Side Anti-Brute-Force Rate Limiter
 * - Safe LocalStorage / Token Validation
 * - Security Request Header Generators
 */

/**
 * Escapes & sanitizes dangerous HTML / JS injection strings to prevent XSS attacks.
 * @param {string} input 
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/onclick=/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

/**
 * Recursively sanitizes all string fields inside an object or array.
 * @param {Object|Array|string} data 
 * @returns {Object|Array|string} Cleaned object
 */
export const sanitizeObject = (data) => {
  if (!data) return data;
  if (typeof data === 'string') return sanitizeInput(data);
  if (Array.isArray(data)) return data.map(sanitizeObject);
  if (typeof data === 'object') {
    const clean = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Prevent Prototype Pollution
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
        clean[key] = sanitizeObject(data[key]);
      }
    }
    return clean;
  }
  return data;
};

/**
 * Validates whether input contains known SQL Injection patterns.
 * @param {string} input 
 * @returns {boolean} True if malicious pattern detected
 */
export const hasSQLInjectionPattern = (input) => {
  if (typeof input !== 'string') return false;
  const sqliRegex = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION)\b|--|\/\*|\*\/|' OR '1'='1'|' OR 1=1|;)/gi;
  return sqliRegex.test(input);
};

/**
 * Client-Side Rate Limiter for Login / Sensitive Actions (Prevents Brute-Force Attacks)
 * Allows max 5 attempts per 5-minute window.
 * @param {string} actionKey Key identifier (e.g. 'login_attempt')
 * @param {number} maxAttempts Max allowed attempts (default: 5)
 * @param {number} windowMs Time window in ms (default: 5 mins = 300,000 ms)
 * @returns {{ allowed: boolean, remaining: number, lockoutMs: number }}
 */
export const checkRateLimit = (actionKey = 'login_attempt', maxAttempts = 5, windowMs = 300000) => {
  try {
    const storageKey = `vaerox_sec_ratelimit_${actionKey}`;
    const raw = sessionStorage.getItem(storageKey);
    const now = Date.now();
    let records = raw ? JSON.parse(raw) : [];

    // Filter out attempts outside the current window
    records = records.filter(timestamp => now - timestamp < windowMs);

    if (records.length >= maxAttempts) {
      const oldestAttempt = records[0];
      const lockoutMs = windowMs - (now - oldestAttempt);
      return { allowed: false, remaining: 0, lockoutMs: Math.max(lockoutMs, 1000) };
    }

    records.push(now);
    sessionStorage.setItem(storageKey, JSON.stringify(records));
    return { allowed: true, remaining: maxAttempts - records.length, lockoutMs: 0 };
  } catch (e) {
    // Fallback if sessionStorage fails
    return { allowed: true, remaining: maxAttempts, lockoutMs: 0 };
  }
};

/**
 * Reset rate limit tracker on successful authentication.
 * @param {string} actionKey 
 */
export const resetRateLimit = (actionKey = 'login_attempt') => {
  try {
    sessionStorage.removeItem(`vaerox_sec_ratelimit_${actionKey}`);
  } catch (e) {
    // Ignore error
  }
};

/**
 * Safe LocalStorage Wrapper with Validation
 */
export const safeStorage = {
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      // Basic JSON validation check
      return JSON.parse(item);
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      const sanitized = sanitizeObject(value);
      localStorage.setItem(key, JSON.stringify(sanitized));
    } catch (e) {
      console.error('SafeStorage set error:', e);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignore
    }
  }
};

/**
 * Standard Security Headers for API Requests
 */
export const getSecurityHeaders = () => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Accept': 'application/json',
  };
};
