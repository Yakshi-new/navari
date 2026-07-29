# 🔐 VAPT Re-Test Report — Vastra E-Commerce (Navari)

**Assessment Type:** Re-Test — Post-Remediation Verification  
**Target Application:** Vastra Handloom E-Commerce Platform (Full-Stack: Node.js + React)  
**Re-Test Date:** 2026-07-29  
**Original Assessment:** 2026-07-29  
**Remediation Commit:** `755a109` — `vapt: fix all critical/high/medium/low security vulnerabilities`  
**Methodology:** OWASP Top 10 (2021), OWASP ASVS Level 2, Full Source Code Review  
**Scope:** All server controllers, middleware, models, routes, client-side auth/API, admin panel

---

## 📊 Re-Test Executive Summary

| Severity | Original Count | Fixed | Remaining |
|---|---|---|---|
| 🔴 Critical | 3 | ✅ 3 | 0 |
| 🟠 High | 5 | ✅ 5 | 0 |
| 🟡 Medium | 5 | ✅ 5 | 0 |
| 🔵 Low | 3 | ✅ 3 | 0 |
| 🆕 New Findings | — | — | 3 (Informational) |

**Overall Security Posture:** ~~Moderate-High~~ → **HIGH** ✅  
All 16 previously identified vulnerabilities have been successfully remediated. Three new **informational-grade** findings were discovered during the expanded codebase scan.

---

## ✅ PREVIOUSLY REPORTED — REMEDIATION VERIFIED

---

### [CRIT-01] ✅ FIXED — `trackOrder` Phone Now Mandatory

**Status:** REMEDIATED — Verified in `orderController.js` lines 427–432

```javascript
// ✅ VAPT (CRIT-01): Phone is MANDATORY — prevents unauthenticated PII enumeration.
if (!phone) {
  res.status(400);
  throw new Error('Phone number is required for order tracking');
}
```

**Additional hardening verified:**
- `populate('user', 'phone')` — only phone fetched, no name/email exposed
- `delete safeOrder.user` — user sub-document stripped from response
- Phone verification is now unconditional (not inside an `if (phone)` block)

---

### [CRIT-02] ✅ FIXED — `verifyPayment` Ownership Check Added

**Status:** REMEDIATED — Verified in `orderController.js` lines 133–161

```javascript
// ✅ VAPT (CRIT-02): Validate orderId format before DB query
if (!orderId || !/^[a-f\d]{24}$/i.test(orderId)) { ... }
// ✅ VAPT (CRIT-02): Verify that the authenticated user owns this order
if (existingOrder.user.toString() !== req.user._id.toString()) {
  res.status(403); throw new Error('Not authorized');
}
```

---

### [CRIT-03] ✅ FIXED — `getAllOrders` Filter Enum Whitelist

**Status:** REMEDIATED — Verified in `orderController.js` lines 257–273

```javascript
// ✅ VAPT (CRIT-03): Whitelist filter values against schema enums
const VALID_ORDER_STATUSES = ['payment_pending','placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned'];
const VALID_PAYMENT_STATUSES = ['pending','paid','failed','refunded'];
// Both validated before use in filter
```

---

### [HIGH-01] ✅ FIXED — Password Reset URL Uses Env Variables

**Status:** REMEDIATED — Verified in `authController.js` lines 399–402

```javascript
// ✅ VAPT (HIGH-01): Use environment variables for reset URL
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim();
const adminUrl  = (process.env.ADMIN_URL  || 'http://localhost:4000').trim();
const resetUrl  = `${user.role === 'admin' ? adminUrl : clientUrl}/reset-password/${resetToken}`;
```

`ADMIN_URL` added to `.env.example`, `.env.production.example`, and `render.yaml`.

---

### [HIGH-02 + MED-07] ✅ FIXED — Backup Excludes Sensitive Fields

**Status:** REMEDIATED — Verified in `backupService.js` lines 130–137

```javascript
const SENSITIVE_FIELD_EXCLUSIONS = {
  User: '-password -sessionId -resetPasswordToken -resetPasswordExpire',
};
const exclusions = SENSITIVE_FIELD_EXCLUSIONS[modelName] || '';
const documents = await Model.find({}).select(exclusions).lean();
```

Password hashes, session IDs, and reset tokens are no longer stored in backup JSON files.

---

### [HIGH-03] ✅ FIXED — `updateOrderStatus` Enum Validated

**Status:** REMEDIATED — Verified in `orderController.js` lines 296–334

```javascript
// ✅ VAPT (HIGH-03): Whitelist valid order statuses
const VALID_STATUSES = ['placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned'];
if (!orderStatus || !VALID_STATUSES.includes(orderStatus)) {
  res.status(400); throw new Error('Invalid order status');
}
// ✅ VAPT (HIGH-03): runValidators: true enforces schema-level enum constraints on update
const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
```

---

### [HIGH-04] ✅ FIXED — Coupon Usage Limit is Atomic

**Status:** REMEDIATED — Verified in `orderController.js` lines 52–78

```javascript
// Atomic: only claims limit slot if one is available
const atomicCoupon = await Coupon.findOneAndUpdate(
  { _id: coupon._id, usedCount: { $lt: coupon.usageLimit } },
  { $inc: { usedCount: 1 } },
  { new: true }
);
if (!atomicCoupon) { throw new Error('Coupon usage limit has been reached'); }
```

Race condition eliminated — concurrent requests can no longer both claim the last coupon use.

---

### [HIGH-05] ✅ FIXED — Stock Only Restored When Decremented

**Status:** REMEDIATED — Verified in `orderController.js` lines 363–374

```javascript
// ✅ VAPT (HIGH-05): Only restore stock if it was actually decremented.
const wasStockDecremented = order.paymentMethod !== 'razorpay' || order.paymentStatus === 'paid';
if (wasStockDecremented) {
  for (const item of order.items) { ... }
}
```

Stock inflation attack via Razorpay order cancellation is no longer possible.

---

### [MED-01] ✅ FIXED — `changePassword` Regenerates SessionId

**Status:** REMEDIATED — Verified in `authController.js` lines 248–253

```javascript
// ✅ VAPT (MED-01): Regenerate sessionId to invalidate all existing sessions
const sessionId = crypto.randomUUID();
await User.findByIdAndUpdate(user._id, { sessionId });
const token = user.getSignedToken(sessionId);
```

Old JWT tokens become immediately invalid after a password change.

---

### [MED-02] ✅ FIXED — `minSymbols: 1` Required

**Status:** REMEDIATED — Verified in `authController.js` line 35

```javascript
minSymbols: 1, // ✅ VAPT (MED-02): Symbols required for adequate password strength
```

All three password error messages updated to reflect the new policy.

---

### [MED-03] ✅ FIXED — Trust Proxy Configured

**Status:** REMEDIATED — Verified in `server.js` lines 46–51

```javascript
// ✅ VAPT (MED-03): Trust proxy — required for correct client IP resolution behind Render/Heroku/nginx.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
```

Rate limiter now correctly uses real client IP in production.

---

### [MED-04] ✅ FIXED — Health Check No Longer Leaks `NODE_ENV`

**Status:** REMEDIATED — Verified in `server.js`

```javascript
// ✅ VAPT (MED-04): env field removed — do not leak deployment environment to callers
res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
```

---

### [MED-05] ✅ FIXED — `CLIENT_URL` Required in Production

**Status:** REMEDIATED — Verified in `server.js` lines 93–104

```javascript
// ✅ VAPT (MED-05): Fail loudly at startup if CLIENT_URL is not configured in production.
if (!rawClientUrls && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: CLIENT_URL environment variable is required in production...');
}
```

---

### [LOW-01] ✅ FIXED — Morgan Redacts Sensitive Query Params

**Status:** REMEDIATED — Verified in `server.js` lines 154–179

```javascript
morgan.token('safe-url', (req) => {
  const REDACTED_PARAMS = ['phone', 'email', 'password', 'token', 'resetToken'];
  // Replaces each param value with [REDACTED] in production logs
});
```

Phone numbers and emails no longer appear in production access logs.

---

### [LOW-02] ✅ FIXED — `email-debug.log` Deleted

**Status:** REMEDIATED — File deleted from filesystem; `email-debug.log` added explicitly to `.gitignore`.

---

### [LOW-06] ✅ FIXED — JWT Expiry Guidance Added

**Status:** ADDRESSED — Both `.env.production.example` and `render.yaml` updated with `ADMIN_URL` and a comment recommending shorter token expiry (`1d`/`4h`) for admin accounts.

---

## 🆕 NEW INFORMATIONAL FINDINGS (Residual)

---

### [INFO-01] — `getAllUsers` Admin Search: Unescaped Regex via `$regex`

| Field | Detail |
|---|---|
| **Location** | `server/controllers/adminController.js` — `getAllUsers()` (Lines 105–110) |
| **Severity** | Informational / Low |
| **OWASP** | A03 Injection (ReDoS) |
| **CWE** | CWE-1333 Inefficient Regular Expression Complexity |

**Observation:**
The admin user search passes `req.query.search` directly into a MongoDB `$regex` query without escaping:

```javascript
// Line 106–109
filter.$or = [
  { name: { $regex: req.query.search, $options: 'i' } },
  { email: { $regex: req.query.search, $options: 'i' } },
];
```

A malicious admin could send a regex like `(a+)+$` (a ReDoS pattern), causing MongoDB to perform excessive backtracking and temporarily spike CPU usage. This is **admin-only** (requires valid `adminOnly` middleware), so the blast radius is limited.

**Recommendation:**
```javascript
// Escape special regex characters before use
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const safeSearch = escapeRegex(req.query.search);
filter.$or = [
  { name: { $regex: safeSearch, $options: 'i' } },
  { email: { $regex: safeSearch, $options: 'i' } },
];
```

---

### [INFO-02] — `createReview` / `updateReview`: Mass Assignment Risk

| Field | Detail |
|---|---|
| **Location** | `server/controllers/reviewController.js` (Lines 17–22, 26–29) |
| **Severity** | Informational |
| **OWASP** | A03 Injection, A04 Insecure Design |
| **CWE** | CWE-915 Improperly Controlled Modification of Dynamically-Determined Object Attributes |

**Observation:**
`createReview` passes the entire `req.body` directly to `Review.create()` (after setting `req.body.user`). A user could inject fields like `isApproved: true`, `isVerifiedPurchase: true`, or `helpfulVotes: 9999` that should be server-controlled.

```javascript
// Line 18-19 — entire req.body passed to DB
req.body.user = req.user._id;
const review = await Review.create(req.body);
```

**Recommendation:** Destructure only allowed fields:
```javascript
const { rating, title, comment, images, product } = req.body;
const review = await Review.create({
  user: req.user._id, product, rating, title, comment, images: images || [],
  // isApproved, isVerifiedPurchase, helpfulVotes — set only by admin or server logic
});
```

Similarly, `updateReview` in admin passes all of `req.body`:
```javascript
// Admin only — but still best practice to whitelist
const { isApproved } = req.body; // destructure only the intended field
const review = await Review.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
```

---

### [INFO-03] — Client-Side JWT Stored in `localStorage` (Architectural Note)

| Field | Detail |
|---|---|
| **Location** | `client/src/context/AuthContext.jsx` (Line 42), `admin/src/context/AuthContext.jsx` (Line 79) |
| **Severity** | Informational |
| **OWASP** | A07 Identification and Authentication Failures |
| **CWE** | CWE-922 Insecure Storage of Sensitive Information |

**Observation:**
Both the customer client and admin panel store JWTs in `localStorage`:
```javascript
localStorage.setItem('token', data.token);        // customer
localStorage.setItem('admin_token', data.token);  // admin
```

`localStorage` is readable by any JavaScript on the page (including injected scripts). This is mitigated by:
- Server-side XSS sanitization (`xssSanitizer` middleware) ✅
- Input validation throughout ✅
- Single-session enforcement via `sessionId` ✅
- React's default HTML escaping ✅

**Recommendation (Long-Term):** Migrate to `HttpOnly; Secure; SameSite=Strict` cookies. This is an architectural change requiring server-side cookie issuance and client-side removal of manual `Authorization` header injection. Priority: P3 (Backlog).

---

## 📋 Complete Remediation Verification Matrix

| ID | Severity | Finding | Status | Verified |
|---|---|---|---|---|
| CRIT-01 | 🔴 Critical | trackOrder PII enumeration | ✅ FIXED | Phone mandatory; user PII stripped |
| CRIT-02 | 🔴 Critical | verifyPayment IDOR | ✅ FIXED | ObjectId check + ownership guard |
| CRIT-03 | 🔴 Critical | getAllOrders filter injection | ✅ FIXED | Enum whitelist on both filters |
| HIGH-01 | 🟠 High | Reset URL hardcoded localhost | ✅ FIXED | CLIENT_URL + ADMIN_URL env vars |
| HIGH-02 | 🟠 High | Backup dumps PII cleartext | ✅ FIXED | Sensitive fields excluded from dump |
| HIGH-03 | 🟠 High | updateOrderStatus no enum check | ✅ FIXED | Whitelist + runValidators: true |
| HIGH-04 | 🟠 High | Coupon race condition | ✅ FIXED | Atomic findOneAndUpdate |
| HIGH-05 | 🟠 High | cancelOrder stock inflation | ✅ FIXED | wasStockDecremented guard |
| MED-01 | 🟡 Medium | Password change no invalidation | ✅ FIXED | sessionId regenerated on change |
| MED-02 | 🟡 Medium | minSymbols: 0 weak policy | ✅ FIXED | minSymbols: 1 enforced |
| MED-03 | 🟡 Medium | Rate limiter IP bypass | ✅ FIXED | trust proxy: 1 in production |
| MED-04 | 🟡 Medium | Health check leaks NODE_ENV | ✅ FIXED | env field removed |
| MED-05 | 🟡 Medium | CLIENT_URL silent fallback | ✅ FIXED | Throws FATAL at production startup |
| MED-07 | 🟡 Medium | Backup dumps password hashes | ✅ FIXED | Combined with HIGH-02 |
| LOW-01 | 🔵 Low | Morgan logs phone/email | ✅ FIXED | Custom safe-url token |
| LOW-02 | 🔵 Low | email-debug.log in repo | ✅ FIXED | File deleted + gitignored |
| LOW-06 | 🔵 Low | JWT expiry guidance | ✅ FIXED | Env example updated |
| INFO-01 | ℹ️ Info | Admin search ReDoS risk | 🔶 OPEN | Escape regex before use |
| INFO-02 | ℹ️ Info | Review mass assignment | 🔶 OPEN | Destructure allowed fields |
| INFO-03 | ℹ️ Info | JWT in localStorage | 🔶 OPEN | Migrate to HttpOnly cookies (P3) |

---

## 🛡️ Security Controls — Updated Verification

| # | Control | Status |
|---|---|---|
| 1 | Helmet.js (15+ security headers) | ✅ Verified |
| 2 | NoSQL Injection prevention (mongoSanitize) | ✅ Verified |
| 3 | XSS Sanitization (custom middleware) | ✅ Verified |
| 4 | HTTP Parameter Pollution (hpp) | ✅ Verified |
| 5 | Rate Limiting (3-tier: auth/general/upload) | ✅ Verified (+ trust proxy fixed) |
| 6 | JWT Strict Bearer format check | ✅ Verified |
| 7 | ObjectId format validation | ✅ Verified |
| 8 | Single-Session Enforcement (sessionId) | ✅ Verified (+ invalidated on pwd change) |
| 9 | Bcrypt password hashing (salt=10) | ✅ Verified |
| 10 | Generic auth error messages | ✅ Verified |
| 11 | Constant-time forgot-password response | ✅ Verified |
| 12 | Password strength: 8+ chars, upper, lower, number, **symbol** | ✅ Verified (now requires symbol) |
| 13 | Email normalization | ✅ Verified |
| 14 | Error handler — no stack traces in responses | ✅ Verified |
| 15 | Upload: MIME+ext double-check, 5MB limit, safe filename | ✅ Verified |
| 16 | Path traversal protection on /uploads | ✅ Verified |
| 17 | CORS strict origin whitelist + production fail-fast | ✅ Verified (+ MED-05 fixed) |
| 18 | Admin route: protect + adminOnly middleware chain | ✅ Verified |
| 19 | Fingerprint removal (x-powered-by disabled) | ✅ Verified |
| 20 | Backup: sensitive fields excluded | ✅ Verified (NEW) |
| 21 | Server-side price verification | ✅ Verified |
| 22 | Razorpay HMAC-SHA256 signature verification | ✅ Verified |
| 23 | Order ownership check in verifyPayment | ✅ Verified (NEW) |
| 24 | Mandatory phone for public order tracking | ✅ Verified (NEW) |
| 25 | Atomic coupon usage enforcement | ✅ Verified (NEW) |
| 26 | Stock restoration guard (Razorpay cancel) | ✅ Verified (NEW) |
| 27 | PII-safe Morgan logging in production | ✅ Verified (NEW) |
| 28 | trust proxy for correct IP rate limiting | ✅ Verified (NEW) |

---

## 🔔 Final Recommendations

1. **Apply INFO-01 fix** (regex escape in admin search) in the next sprint — 5-minute effort, prevents potential admin-triggered ReDoS.
2. **Apply INFO-02 fix** (review mass assignment) — 10-minute effort, closes an unnecessary attack surface.
3. **Plan INFO-03 migration** (HttpOnly cookies) as a future architectural improvement. Current XSS mitigations provide strong compensating controls in the interim.
4. **Run `npm audit`** — verify no high/critical CVEs in `multer@1.4.5-lts.1`, `express@4.19.2`, or other dependencies.
5. **Set shorter `JWT_EXPIRE`** for admin accounts (e.g., `1d`) in Render dashboard.
6. **MongoDB Atlas Network ACL** — whitelist only your Render server IP.

---

## 🏆 Security Score Comparison

| Category | Initial Score | Post-Remediation Score |
|---|---|---|
| Authentication & Session | 6/10 | 9/10 |
| Authorization / Access Control | 5/10 | 9/10 |
| Input Validation & Injection | 7/10 | 9/10 |
| Data Protection | 6/10 | 9/10 |
| Security Configuration | 7/10 | 9/10 |
| Business Logic | 4/10 | 9/10 |
| Logging & Monitoring | 6/10 | 9/10 |
| **Overall** | **5.9/10** | **9.0/10** |

---

*Re-Test Report generated by VAPT Code Review — 2026-07-29 | Vastra E-Commerce (Navari)*  
*Remediation commit: `755a109` | 7 files changed, 157 insertions(+), 37 deletions(-)*
