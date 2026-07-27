/**
 * xssSanitizer.js — VAPT Hardening
 * 
 * Recursively sanitizes all string values in req.body, req.query, req.params
 * using the maintained `xss` library (replaces deprecated xss-clean).
 * Strips dangerous HTML tags and attributes while preserving valid text content.
 */
const xss = require('xss');

const xssOptions = {
  whiteList: {}, // Allow NO HTML tags — strip everything
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object'],
};

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return xss(value, xssOptions).trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    return sanitizeObject(value);
  }
  return value;
};

const sanitizeObject = (obj) => {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = sanitizeValue(obj[key]);
  }
  return result;
};

const xssSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

module.exports = xssSanitizer;
