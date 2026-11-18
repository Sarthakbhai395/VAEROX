# COMPREHENSIVE TEST CASE SPECIFICATION & EXECUTION MATRIX
**Application**: VÆROX (Akario Mart Luxury Bespoke E-Commerce)  
**Document Ref**: VRX-QA-TC-2026-V1  
**Total Test Cases Defined**: 40  
**Total Passed**: 40  
**Total Failed**: 0  
**Execution Status**: 100% Passed  

---

## 1. Authentication & User Management (AUTH)

### TC-AUTH-001: Customer Registration with Valid Details
- **Priority**: High | **Type**: Functional / API
- **Pre-conditions**: Database accessible, email is unregistered.
- **Steps**:
  1. Send `POST /api/auth/register` with valid `name`, `email`, `password`.
  2. Inspect HTTP status code and response payload.
- **Input Data**: `{ name: "Jane Doe", email: "jane.doe@example.com", password: "Password123!" }`
- **Expected Result**: HTTP 201 Created, returns JWT token and customer user record with default role `user`.
- **Actual Result**: HTTP 201 Created, JWT token generated, user object returned.
- **Status**: **PASS**

### TC-AUTH-002: Customer Registration Privilege Escalation Prevention
- **Priority**: Critical | **Type**: Security / API
- **Pre-conditions**: Public registration endpoint open.
- **Steps**:
  1. Send `POST /api/auth/register` supplying malicious `role: "admin"`.
  2. Verify server denies or strips escalated role.
- **Input Data**: `{ name: "Attacker", email: "attacker@example.com", password: "Password123!", role: "admin" }`
- **Expected Result**: HTTP 400 Bad Request with alert message or forced downgrade to `user`.
- **Actual Result**: HTTP 400 Bad Request: "Unauthorized to assign this role during registration."
- **Status**: **PASS**

### TC-AUTH-003: Customer Registration Missing Required Fields
- **Priority**: Medium | **Type**: Validation / Functional
- **Pre-conditions**: None.
- **Steps**:
  1. Send `POST /api/auth/register` without password or name.
  2. Check response status and error structure.
- **Input Data**: `{ email: "incomplete@example.com" }`
- **Expected Result**: HTTP 400 Bad Request with field-level validation errors.
- **Actual Result**: HTTP 400 Bad Request: "Please provide all required fields."
- **Status**: **PASS**

### TC-AUTH-004: Duplicate Email Registration Rejection
- **Priority**: High | **Type**: Functional / API
- **Pre-conditions**: User with email already exists in system.
- **Steps**:
  1. Attempt to register with the same email as an existing account.
- **Input Data**: Existing user email.
- **Expected Result**: HTTP 400 Bad Request indicating user already exists.
- **Actual Result**: HTTP 400 Bad Request: "User already exists with this email."
- **Status**: **PASS**

### TC-AUTH-005: Admin Login with Default Credentials
- **Priority**: Critical | **Type**: Functional / Auth
- **Pre-conditions**: Active backend with admin auto-sync enabled.
- **Steps**:
  1. Send `POST /api/auth/login` with email `admin@gmail.com` and password `123456`.
  2. Verify returned role is `admin`.
- **Input Data**: `{ email: "admin@gmail.com", password: "123456", role: "admin" }`
- **Expected Result**: HTTP 200 OK, returns JWT token, `role: "admin"`.
- **Actual Result**: HTTP 200 OK, token issued, admin role verified.
- **Status**: **PASS**

### TC-AUTH-006: Login with Incorrect Password
- **Priority**: High | **Type**: Functional / Security
- **Pre-conditions**: Existing user.
- **Steps**:
  1. Send `POST /api/auth/login` with wrong password.
- **Input Data**: `{ email: "admin@gmail.com", password: "WrongPassword999!" }`
- **Expected Result**: HTTP 401 Unauthorized with generic "Invalid credentials" error.
- **Actual Result**: HTTP 401 Unauthorized: "Invalid credentials".
- **Status**: **PASS**

### TC-AUTH-007: Blocked User Login Denial
- **Priority**: High | **Type**: Security / Business Logic
- **Pre-conditions**: User has `isBlocked: true`.
- **Steps**:
  1. Admin blocks user via `PUT /api/users/admin/:id/block`.
  2. Blocked user attempts to authenticate or query `/api/auth/me`.
- **Input Data**: Blocked user token and credentials.
- **Expected Result**: HTTP 401 Unauthorized: "Account has been blocked. Contact administrator."
- **Actual Result**: HTTP 401 Unauthorized returned, access blocked.
- **Status**: **PASS**

### TC-AUTH-008: OTP Brute-Force Rate Limiting Lockout
- **Priority**: Critical | **Type**: Security / Rate Limiting
- **Pre-conditions**: User requests password reset OTP.
- **Steps**:
  1. Submit 5 consecutive incorrect OTP values for target email.
  2. Submit 6th attempt.
- **Input Data**: `POST /api/auth/verify-otp` with incorrect OTPs: "000000", "111111", etc.
- **Expected Result**: 1st-5th attempts return 400; 6th attempt returns HTTP 429 Too Many Requests lockout.
- **Actual Result**: 5 attempts return 400, 6th attempt returns HTTP 429 with security lockout message.
- **Status**: **PASS**

---

## 2. Role-Based Access Control & Security (SEC)

### TC-SEC-001: Unauthenticated Access to Admin Users Route
- **Priority**: Critical | **Type**: Security / RBAC
- **Pre-conditions**: Request sent without `Authorization` header.
- **Steps**:
  1. Send `GET /api/users/admin`.
- **Input Data**: None.
- **Expected Result**: HTTP 401 Unauthorized: "Not authorized to access this route."
- **Actual Result**: HTTP 401 Unauthorized.
- **Status**: **PASS**

### TC-SEC-002: Customer Access to Admin Users Route (Vertical Privilege Escalation)
- **Priority**: Critical | **Type**: Security / RBAC
- **Pre-conditions**: Authenticated with standard customer token (`role: "user"`).
- **Steps**:
  1. Send `GET /api/users/admin` with customer Bearer token.
- **Input Data**: `Authorization: Bearer <customer_token>`
- **Expected Result**: HTTP 403 Forbidden: "User role user is not authorized to access this route."
- **Actual Result**: HTTP 403 Forbidden.
- **Status**: **PASS**

### TC-SEC-003: Lockdown of Sensitive Debug Routes
- **Priority**: Critical | **Type**: Security / Info Disclosure
- **Pre-conditions**: Unauthenticated or non-admin client.
- **Steps**:
  1. Query `GET /api/contact/debug` and `GET /api/test-email`.
- **Input Data**: None / customer token.
- **Expected Result**: Unauthenticated returns 401; non-admin returns 403.
- **Actual Result**: Both endpoints return 401 / 403 respectively; debug info guarded.
- **Status**: **PASS**

### TC-SEC-004: NoSQL Injection via Operator Payloads
- **Priority**: Critical | **Type**: Security / Injection
- **Pre-conditions**: None.
- **Steps**:
  1. Attempt login with `{ email: { "$ne": null }, password: { "$gt": "" } }`.
- **Input Data**: NoSQL injection objects in body.
- **Expected Result**: Sanitizer strips dangerous keys; input rejected as invalid string (400 Bad Request).
- **Actual Result**: Sanitizer logged alert, stripped keys; controller returned 400 Bad Request cleanly.
- **Status**: **PASS**

### TC-SEC-005: Prototype Pollution Prevention
- **Priority**: High | **Type**: Security / Sanitization
- **Pre-conditions**: None.
- **Steps**:
  1. Send payload containing `__proto__` and `constructor` properties.
- **Input Data**: `{ name: "Item", "__proto__": { "polluted": true } }`
- **Expected Result**: Dangerous keys stripped, prototype remains clean (`Object.prototype.polluted === undefined`).
- **Actual Result**: Keys removed by sanitizer middleware, prototype unpolluted.
- **Status**: **PASS**

### TC-SEC-006: HTTP Security Headers Audit
- **Priority**: High | **Type**: Security / Infrastructure
- **Pre-conditions**: Active server responding to HTTP requests.
- **Steps**:
  1. Inspect response headers on any API request.
- **Expected Result**: Presence of `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
- **Actual Result**: Security headers present on all responses.
- **Status**: **PASS**

---

## 3. Product Catalog & Details (PROD)

### TC-PROD-001: Public Catalog Retrieval with Pagination & Filters
- **Priority**: High | **Type**: Functional / API
- **Pre-conditions**: Database populated with products.
- **Steps**:
  1. Send `GET /api/products?page=1&limit=12`.
- **Expected Result**: HTTP 200 OK, returns list of products, total count, pagination metadata.
- **Actual Result**: HTTP 200 OK, product array returned with correct count.
- **Status**: **PASS**

### TC-PROD-002: Product Detail Page Retrieval by ID
- **Priority**: High | **Type**: Functional / API
- **Pre-conditions**: Valid product `_id` exists.
- **Steps**:
  1. Send `GET /api/products/:id`.
- **Expected Result**: HTTP 200 OK with product details, stock, images, categories.
- **Actual Result**: HTTP 200 OK with complete product schema.
- **Status**: **PASS**

### TC-PROD-003: Product Detail Non-Existent ID Handling
- **Priority**: Medium | **Type**: Error Handling
- **Pre-conditions**: Random 24-character hex ID that does not exist.
- **Steps**:
  1. Send `GET /api/products/600000000000000000000000`.
- **Expected Result**: HTTP 404 Not Found: "Product not found".
- **Actual Result**: HTTP 404 Not Found returned cleanly without unhandled exception.
- **Status**: **PASS**

---

## 4. Custom Fit & Bespoke Measurement Flow (CFIT)

### TC-CFIT-001: Dynamic Custom Fit Form Visibility
- **Priority**: High | **Type**: UI / Functional
- **Pre-conditions**: Product detail page loaded in browser.
- **Steps**:
  1. Click "CUSTOM FIT ✨" size tab button.
  2. Verify bespoke measurement section appears.
- **Expected Result**: Form opens with 6 inputs (Chest, Shoulder, Waist, Thigh, Torso, Hips) and Fit Preference selector.
- **Actual Result**: Form renders smoothly with gold accents and bespoke tailoring badges.
- **Status**: **PASS**

### TC-CFIT-002: Incomplete Measurements - Confirm Button Hidden
- **Priority**: High | **Type**: UI / Business Logic
- **Pre-conditions**: Custom Fit tab selected.
- **Steps**:
  1. Enter only 4 out of 6 measurements (leave 2 blank).
  2. Check if "Confirm Measurements" button appears.
- **Expected Result**: "Confirm Measurements" button remains hidden until all 6 dimensions are valid numbers.
- **Actual Result**: Button is not rendered; helper text prompts for complete measurements.
- **Status**: **PASS**

### TC-CFIT-003: Boundary Measurement Validation (Zero, Negative, Out of Range)
- **Priority**: High | **Type**: Validation / UI & Backend
- **Pre-conditions**: Custom Fit mode active.
- **Steps**:
  1. Enter chest measurement `0` or `150` or `-5`.
  2. Attempt to add to cart or confirm.
- **Expected Result**: Input highlighted as invalid (must be between 1 and 120 inches); API rejects with HTTP 400.
- **Actual Result**: Validation error displayed: "Please enter valid measurements between 1 and 120 inches." Backend rejects with 400.
- **Status**: **PASS**

### TC-CFIT-004: Confirm Measurements Button Surfaces on Complete Valid Input
- **Priority**: High | **Type**: UI / Functional
- **Pre-conditions**: Product page open.
- **Steps**:
  1. Enter chest: 40, shoulder: 18, waist: 34, thigh: 24, torso: 29, hips: 38.
  2. Select "Tailored Fit" preference.
- **Expected Result**: "Confirm Measurements" gradient gold button animates into view.
- **Actual Result**: Button renders immediately upon entering all 6 valid values.
- **Status**: **PASS**

### TC-CFIT-005: 3D Animated Confirmation Modal Display & Policy Verification
- **Priority**: Critical | **Type**: UI / Legal & Business Compliance
- **Pre-conditions**: All measurements entered; "Confirm Measurements" button visible.
- **Steps**:
  1. Click "Confirm Measurements".
  2. Inspect modal content and policy disclosure.
- **Expected Result**: 3D modal displays with exact mandatory policy:
  *"Once measurements are confirmed, custom-fit products are not eligible for return or exchange due to incorrect customer-provided measurements.*
  *If the customer receives a damaged or defective product, exchange only will be provided. No refund will be available."*
  Two buttons present: "Cancel Measurements" and "Confirm Measurements".
- **Actual Result**: Modal opens with required text, luxury badge, and both action buttons.
- **Status**: **PASS**

### TC-CFIT-006: Cancel Measurements Resets Inputs & Dismisses Modal
- **Priority**: High | **Type**: Functional / State Management
- **Pre-conditions**: Modal open.
- **Steps**:
  1. Click "Cancel Measurements".
  2. Inspect measurement input fields and draft state.
- **Expected Result**: Modal closes; all 6 measurement inputs reset to empty `""`; confirmed state is false; draft cleared from localStorage.
- **Actual Result**: Modal dismissed, all inputs reset to blank, confirmed flag cleared.
- **Status**: **PASS**

### TC-CFIT-007: Confirm Measurements Locks State & Shows Confirmed Badge
- **Priority**: High | **Type**: Functional / State Management
- **Pre-conditions**: Modal open with valid measurements.
- **Steps**:
  1. Click "Confirm Measurements" inside modal.
- **Expected Result**: Modal closes; green "Measurements Confirmed" badge displays; measurements saved to draft; user ready to add to cart.
- **Actual Result**: Modal closes, "Measurements Confirmed - Policy accepted • Ready to add to cart or checkout" badge rendered.
- **Status**: **PASS**

### TC-CFIT-008: Adding Unconfirmed Custom Fit Item to Cart Rejected by Backend
- **Priority**: Critical | **Type**: Security / API Validation
- **Pre-conditions**: Authenticated customer.
- **Steps**:
  1. Send `POST /api/users/cart` with `selectedSize: "Custom Fit"` and `customMeasurements.confirmed: false`.
- **Expected Result**: HTTP 400 Bad Request: "Custom fit measurements must be confirmed before adding to cart."
- **Actual Result**: HTTP 400 Bad Request returned.
- **Status**: **PASS**

### TC-CFIT-009: Adding Confirmed Custom Fit Item to Cart Persists Correctly
- **Priority**: High | **Type**: Functional / Persistence
- **Pre-conditions**: Confirmed measurement payload.
- **Steps**:
  1. Send `POST /api/users/cart` with complete confirmed measurements.
  2. Send `GET /api/users/cart`.
- **Expected Result**: HTTP 200 OK; cart item contains full measurement breakdown and confirmed timestamp.
- **Actual Result**: HTTP 200 OK; cart item saved with all 6 dimensions and `confirmed: true`.
- **Status**: **PASS**

### TC-CFIT-010: Custom Fit Records Excluded from Admin Before Checkout
- **Priority**: High | **Type**: Business Logic / Admin
- **Pre-conditions**: Customer has added custom fit item to cart but has not completed payment.
- **Steps**:
  1. Admin queries `GET /api/custom-fits/admin`.
- **Expected Result**: Custom fit record count is 0 (measurements appear ONLY after checkout).
- **Actual Result**: Count is 0; no cart drafts appear in admin tailoring queue.
- **Status**: **PASS**

---

## 5. Shopping Cart, Checkout & Payment (CART / CHK)

### TC-CART-001: Add Standard Product to Cart
- **Priority**: High | **Type**: Functional
- **Pre-conditions**: Valid product ID and standard size (e.g., 'M').
- **Steps**:
  1. Send `POST /api/users/cart` with product ID, quantity 1, size 'M'.
- **Expected Result**: HTTP 200 OK; item added to user's cart.
- **Actual Result**: HTTP 200 OK; item persisted in MongoDB.
- **Status**: **PASS**

### TC-CART-002: Update Cart Item Quantity
- **Priority**: Medium | **Type**: Functional
- **Pre-conditions**: Item in cart.
- **Steps**:
  1. Send `PUT /api/users/cart/:itemId` with new quantity 3.
- **Expected Result**: HTTP 200 OK; quantity updated.
- **Actual Result**: HTTP 200 OK; updated quantity reflected.
- **Status**: **PASS**

### TC-CART-003: Remove Item from Cart
- **Priority**: Medium | **Type**: Functional
- **Pre-conditions**: Item in cart.
- **Steps**:
  1. Send `DELETE /api/users/cart/:itemId`.
- **Expected Result**: HTTP 200 OK; item removed.
- **Actual Result**: HTTP 200 OK; cart item count decreases.
- **Status**: **PASS**

### TC-CHK-001: Payment Creation Price Integrity Verification
- **Priority**: Critical | **Type**: Security / Payment
- **Pre-conditions**: Items in cart.
- **Steps**:
  1. Initiate checkout sending manipulated lower client price (e.g. ₹100 instead of ₹10,000).
- **Expected Result**: Backend ignores client price and calculates server-side price from database catalog.
- **Actual Result**: Order created using authoritative database prices; client price tampering thwarted.
- **Status**: **PASS**

### TC-CHK-002: Payment Verification with Invalid Razorpay Signature
- **Priority**: Critical | **Type**: Security / Payment
- **Pre-conditions**: Order created.
- **Steps**:
  1. Send `POST /api/payment/verify` with fabricated `razorpay_signature`.
- **Expected Result**: HTTP 400 Bad Request: "Invalid payment signature."
- **Actual Result**: HTTP 400 Bad Request: HMAC signature mismatch detected.
- **Status**: **PASS**

### TC-CHK-003: Payment Verification with Valid Signature & Custom Fit Generation
- **Priority**: Critical | **Type**: Functional / Business Logic
- **Pre-conditions**: Valid Razorpay order with confirmed custom fit items.
- **Steps**:
  1. Send `POST /api/payment/verify` with authentic HMAC signature.
  2. Verify:
     - Order status transitions to `paid`.
     - Cart is cleared.
     - Invoice email is queued/dispatched.
     - Custom fit record is generated and linked to customer, product, and order.
- **Expected Result**: HTTP 200 OK; Order created; CustomFitRecord created in DB.
- **Actual Result**: HTTP 200 OK; Order saved; invoice dispatched; CustomFitRecord linked.
- **Status**: **PASS**

### TC-CHK-004: Customer Order Isolation (IDOR Prevention)
- **Priority**: Critical | **Type**: Security / Authorization
- **Pre-conditions**: Customer A and Customer B both have orders.
- **Steps**:
  1. Customer A requests `GET /api/payment/orders/my`.
  2. Verify Customer A only receives their own orders.
- **Expected Result**: Response contains only Customer A orders; Customer B orders omitted.
- **Actual Result**: Filter enforces `user: req.user._id`; complete isolation verified.
- **Status**: **PASS**

---

## 6. Admin Panel & Management (ADM)

### TC-ADM-001: Admin Panel Dashboard Access
- **Priority**: High | **Type**: Functional / UI
- **Pre-conditions**: Logged in as administrator.
- **Steps**:
  1. Navigate to `/admin/dashboard`.
- **Expected Result**: Dashboard displays analytics cards, total revenue, orders, users, and navigation tabs.
- **Actual Result**: Admin Panel loaded successfully; header 'Admin Panel' visible.
- **Status**: **PASS**

### TC-ADM-002: "User Custom Fit" Admin Section Display
- **Priority**: High | **Type**: Functional / Admin
- **Pre-conditions**: Admin logged in; completed custom fit order exists.
- **Steps**:
  1. Navigate to `/admin/custom-fit` or select "User Custom Fit" sidebar tab.
  2. Inspect displayed columns and records.
- **Expected Result**: Table lists Customer Details, Product Name, Order ID, 6 Measurements (Chest, Shoulder, Waist, Thigh, Torso, Hips), Fit Preference, Confirmation Date, and Tailoring Status.
- **Actual Result**: All customer measurements and order associations displayed cleanly.
- **Status**: **PASS**

### TC-ADM-003: Update Custom Fit Tailoring Status
- **Priority**: High | **Type**: Functional / API
- **Pre-conditions**: Custom fit record ID.
- **Steps**:
  1. Send `PATCH /api/custom-fits/admin/:id/status` with body `{ tailoringStatus: "In Tailoring" }`.
- **Expected Result**: HTTP 200 OK; status updated to "In Tailoring".
- **Actual Result**: HTTP 200 OK; updated record returned.
- **Status**: **PASS**

### TC-ADM-004: User Block and Unblock Workflow
- **Priority**: High | **Type**: Functional / Admin
- **Pre-conditions**: Target customer user.
- **Steps**:
  1. Send `PUT /api/users/admin/:id/block`.
  2. Verify user `isBlocked: true`.
  3. Send `PUT /api/users/admin/:id/unblock`.
  4. Verify user `isBlocked: false`.
- **Expected Result**: Both calls return HTTP 200 OK; user status updates as expected.
- **Actual Result**: Block and unblock cycles execute cleanly.
- **Status**: **PASS**

---

## 7. Responsive Layout & Cross-Device UI (RESP)

### TC-RESP-001: Mobile Viewport (375px × 812px) Layout & Overflow Check
- **Priority**: High | **Type**: Responsive / UI
- **Pre-conditions**: Headless browser set to 375×812.
- **Steps**:
  1. Load 16 core pages (`/`, `/products`, `/product/:id`, `/cart`, `/checkout`, `/login`, `/register`, `/admin/dashboard`, etc.).
  2. Measure `document.documentElement.scrollWidth <= window.innerWidth`.
- **Expected Result**: `scrollWidth <= innerWidth` across all 16 pages; 0 horizontal overflows.
- **Actual Result**: 16/16 pages PASS with 0 horizontal overflows.
- **Status**: **PASS**

### TC-RESP-002: Tablet Viewport (768px × 1024px) Layout & Grid Check
- **Priority**: High | **Type**: Responsive / UI
- **Pre-conditions**: Headless browser set to 768×1024.
- **Steps**:
  1. Load all 16 core pages.
  2. Inspect navigation bar collapse, catalog grid columns, and checkout split view.
- **Expected Result**: Clean layout transitions without overlapping text or clipped modals.
- **Actual Result**: 16/16 pages PASS with 0 horizontal overflows.
- **Status**: **PASS**

### TC-RESP-003: Desktop Viewport (1440px × 900px) High-Resolution Layout
- **Priority**: High | **Type**: Responsive / UI
- **Pre-conditions**: Headless browser set to 1440×900.
- **Steps**:
  1. Load all 16 core pages.
  2. Verify full desktop navigation, luxury hero carousels, and admin sidebar positioning.
- **Expected Result**: Flawless full-width presentation, centered containers, and crisp typography.
- **Actual Result**: 16/16 pages PASS with 0 horizontal overflows.
- **Status**: **PASS**

