# Security Audit & Hardening: User Authentication, Login, and Registration Flows

## Description
Perform a complete security and validation audit of the registration, login, JWT token issuance, and password recovery / OTP verification flows. Fix authentication vulnerabilities and ensure strict server-side validation.

## Tasks & Requirements

### 1. Registration Flow Hardening
- [ ] **Input Validation**: Implement strict Pydantic/Zod-like Joi/Express-validator checks for email formatting, passwords, and name inputs on `/api/auth/register`.
- [ ] **Password Security**: Ensure passwords are encrypted using `bcryptjs` with appropriate salt rounds before storing them in MongoDB.
- [ ] **Role Protection**: Enforce that standard registration endpoints do not allow escalation to 'admin' role via raw request payloads.

### 2. Login & JWT Handling
- [ ] **Token Expiration**: Set standard JWT expiration times (e.g., 24h) and secure cookies/headers for transport.
- [ ] **Rate Limiting**: Apply express-rate-limit middleware on authentication routes (`/api/auth/login`, `/api/auth/register`, `/api/otp`) to prevent brute-force attacks.

### 3. Password Reset & OTP Flow
- [ ] **Secure OTP**: Validate that OTP generation is randomized, short-lived (e.g., 5-10 minutes), and transmitted securely via Twilio / Nodemailer.
- [ ] **No Leakage**: Verify that backend logs or network responses do not leak the OTP code to the client browser before verification.

## Acceptance Criteria
- All authentication endpoints are fully validated on the server side.
- Rate limits are active on all public auth endpoints.
- OTP code is never exposed in API responses.
