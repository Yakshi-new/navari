/**
 * admin.js — re-exports adminOnly from auth.js for backward compatibility.
 * The canonical implementation lives in middleware/auth.js.
 */
const { adminOnly } = require('./auth');
module.exports = { adminOnly };
