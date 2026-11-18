# AUTOMATION TEST RESULTS & EXECUTION LOG
**Application**: VÆROX (Akario Mart Luxury Bespoke E-Commerce)  
**Execution Environment**: Node.js v24.18.1 Built-in Test Runner & Headless Chrome CDP  
**Execution Timestamp**: November 18, 2026 11:15–11:20 IST  
**Total Test Suites Executed**: 2 Primary Automation Frameworks (Backend API & Frontend CDP)  
**Overall Result**: **100% PASSED (0 FAILURES, 0 REGRESSIONS)**  

---

## 1. Backend Integration & Security Test Suite Run

- **Command**: `node --test tests/qa-security-integration.test.js`
- **Working Directory**: `d:\Akario-Mart-main\backend`
- **Exit Code**: `0` (Success)
- **Total Duration**: `11,040 ms` (11.04 seconds)

### Test Suite Execution Output

```text
> server@1.0.0 test
> node --test tests/*.test.js

◇ injected env (16) from .env // tip: ◈ secrets for agents [www.dotenvx.com]

[SUITE 1: AUTHENTICATION, REGISTRATION VALIDATION & ADMIN SYNC]
POST /api/auth/register 400 10.576 ms - 105
POST /api/auth/register 400 0.738 ms - 72
SECURITY ALERT: Public signup attempted role escalation to 'admin'. Email: attacker@example.com, IP: 127.0.0.1
POST /api/auth/register 400 0.718 ms - 85
POST /api/auth/register 201 91.613 ms - 308
POST /api/auth/register 400 85.535 ms - 48
POST /api/auth/register 201 97.236 ms - 307
POST /api/auth/register 201 89.562 ms - 313
POST /api/auth/register 201 82.764 ms - 305
POST /api/auth/login 401 105.841 ms - 51
POST /api/auth/login 200 181.710 ms - 298
✔ 1. Authentication, Registration Validation, & Hardcoded Backdoor Removal (1397.6975ms)

[SUITE 2: RBAC, UNAUTHENTICATED ROUTE LOCKDOWNS & MASS ASSIGNMENT]
GET /api/contact/debug 401 0.559 ms - 63
GET /api/contact/debug 403 7.331 ms - 76
GET /api/contact/debug 200 7.156 ms - 36
GET /api/test-email 401 0.939 ms - 63
GET /api/test-email 403 2.743 ms - 76
GET /api/users/admin 401 0.355 ms - 63
GET /api/users/admin 403 3.273 ms - 76
GET /api/users/admin 403 2.436 ms - 76
GET /api/users/admin 200 6.916 ms - 1071
GET /api/custom-fits/admin 401 0.318 ms - 63
GET /api/custom-fits/admin 403 3.325 ms - 76
GET /api/custom-fits/admin 403 2.503 ms - 76
GET /api/custom-fits/admin 200 9.175 ms - 36
GET /api/payment/orders/admin 401 0.700 ms - 63
GET /api/payment/orders/admin 403 4.253 ms - 76
GET /api/payment/orders/admin 403 4.095 ms - 76
GET /api/payment/orders/admin 200 10.369 ms - 36
GET /api/activities 401 0.399 ms - 63
GET /api/activities 403 3.068 ms - 76
GET /api/activities 403 3.806 ms - 76
GET /api/activities 200 6.558 ms - 36
PUT /api/users/profile 200 10.810 ms - 235
POST /api/products 201 10.070 ms - 514
PUT /api/products/6afd3b73504bfec44c969ddc 403 5.702 ms - 65
PUT /api/products/6afd3b73504bfec44c969ddc 200 9.220 ms - 514
PUT /api/users/admin/6afd3b72504bfec44c969db8/block 200 9.315 ms - 281
GET /api/auth/me 401 4.402 ms - 66
PUT /api/users/admin/6afd3b72504bfec44c969db8/unblock 200 12.115 ms - 284
✔ 2. RBAC, Unauthenticated Route Lockdowns, & Mass Assignment Protection (385.8961ms)

[SUITE 3: CORS ALLOWLIST, SECURITY HEADERS, NOSQLI & PROTOTYPE POLLUTION]
GET /api/products 200 18.227 ms - 562
GET /api/products 200 6.989 ms - 562
GET /api/products 200 3.452 ms - 562
SECURITY ALERT: Removed suspicious key: $ne
SECURITY ALERT: Removed suspicious key: $gt
POST /api/auth/login 400 0.379 ms - 61
SECURITY ALERT: Removed suspicious key: __proto__
SECURITY ALERT: Removed suspicious key: constructor
POST /api/products 201 6.622 ms - 375
✔ 3. CORS Allowlist Enforcement, Security Headers, NoSQLi & Prototype Pollution (70.0136ms)

[SUITE 4: PER-USER OTP BRUTE-FORCE LOCKOUT & LEGACY RESET PASSWORD]
POST /api/auth/verify-otp 400 4.171 ms - 77
POST /api/auth/verify-otp 400 4.996 ms - 77
POST /api/auth/verify-otp 400 5.651 ms - 77
POST /api/auth/verify-otp 400 5.517 ms - 77
POST /api/auth/verify-otp 429 11.053 ms - 83
POST /api/auth/verify-otp 400 2.205 ms - 77
PUT /api/auth/resetpassword/80025c3aee36ae96561f3de026d9117e29243aa1 400 2.849 ms - 71
✔ 4. Per-User OTP Brute-Force Lockout & Legacy Reset Password Validation (104.368ms)

[SUITE 5: CUSTOM FIT VALIDATION, PAYMENT PRICE/SIGNATURE VERIFY & ORDER ISOLATION]
POST /api/users/cart 400 4.586 ms - 108
POST /api/users/cart 400 3.543 ms - 94
POST /api/users/cart 200 19.715 ms - 615
POST /api/payment/verify 400 5.257 ms - 55
POST /api/payment/verify 400 8.368 ms - 120
[INVOICE EMAIL SENT SUCCESS] Delivered invoice for Order VRX-900100 to customer1@example.com
[MESSAGE ID]: <3f83fc4c-bc99-d198-ed8d-daceb4b3eac5@gmail.com>
[PAYMENT VERIFY] Email invoice result for customer1@example.com: {
  success: true,
  messageId: '<3f83fc4c-bc99-d198-ed8d-daceb4b3eac5@gmail.com>'
}
POST /api/payment/verify 200 3957.104 ms - 1112
GET /api/custom-fits/admin 200 11.484 ms - 1962
PATCH /api/custom-fits/admin/6afd3b74504bfec44c969e22/status 200 11.720 ms - 1945
GET /api/payment/orders/my 200 7.259 ms - 971
GET /api/payment/orders/my 200 4.179 ms - 36
✔ 5. Custom Fit Validation, Payment Price/Signature Verification, & Order Isolation (8055.1908ms)

[SUITE 6: CONTROLLED CONCURRENCY & API LATENCY BENCHMARK (30 PARALLEL)]
GET /api/products 200 75.863 ms - 950
GET /api/products 200 76.981 ms - 950
... (30 total concurrent GET requests)
LOAD_BENCHMARK_30X: p50=211.8ms p95=221.2ms max=221.6ms
✔ 6. Controlled Concurrency & API Latency Benchmark (30 parallel GET /api/products) (226.1538ms)

------------------------------------------------------------------------
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 11040.1893
------------------------------------------------------------------------
```

---

## 2. Headless Chrome CDP End-to-End Automation Run

- **Driver**: Direct WebSocket Connection to Headless Google Chrome v131
- **Target URL**: `http://localhost:5173`
- **Total Viewport Audits**: 48 (16 routes $\times$ 3 viewports: 375px, 768px, 1440px)
- **Horizontal Overflows**: **0 / 48 (100% Pass)**

### 2.1. Viewport Overflow Matrix

```text
Route Tested                         Mobile (375x812)  Tablet (768x1024) Desktop (1440x900)
-------------------------------------------------------------------------------------------
/                                    PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/products                            PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/products?category=premium-men       PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/products?category=women-couture     PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/product/6aabf6a9426ed8d33c3dfa54    PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/cart                                PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/checkout                            PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/wishlist                            PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/login                               PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/register                            PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/forgot-password                     PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/about                               PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/contact                             PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/admin/dashboard                     PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/seller/dashboard                    PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
/user/dashboard                      PASS (0 ovf)      PASS (0 ovf)      PASS (0 ovf)
-------------------------------------------------------------------------------------------
Total Viewport Evaluations:          16 / 16 PASS      16 / 16 PASS      16 / 16 PASS
```

### 2.2. Custom Fit Measurement Confirmation Modal E2E Run

```text
[CDP AUTOMATION LOG: CUSTOM FIT USER JOURNEY]
1. Navigated to: http://localhost:5173/product/6aabf6a9426ed8d33c3dfa54
2. Clicked Sizing Tab: 'CUSTOM FIT ✨'
3. Verified Form Expansion: 6 measurement fields rendered (chest, shoulder, waist, thigh, torso, hips)
4. Populated Dimensions:
   - chest: 40 in
   - shoulder: 18 in
   - waist: 34 in
   - thigh: 24 in
   - torso: 29 in
   - hips: 38 in
5. Selected Fit Preference: 'Tailored Fit'
6. Detected Action Button: 'CONFIRM MEASUREMENTS' surfaced dynamically
7. Clicked 'CONFIRM MEASUREMENTS' -> 3D Modal Rendered
8. Policy Check:
   - "Once measurements are confirmed, custom-fit products are not eligible for return or exchange..." -> VERIFIED
   - "If the customer receives a damaged or defective product, exchange only will be provided..." -> VERIFIED
9. Clicked 'CANCEL MEASUREMENTS'
   - Modal dismissed
   - Inputs reset to: chest='', shoulder='', waist='', thigh='', torso='', hips='' -> VERIFIED
10. Re-populated Dimensions & Clicked 'CONFIRM MEASUREMENTS'
11. Confirmed inside 3D Modal:
   - Green Status Badge Displayed: "Measurements Confirmed" -> VERIFIED
   - Policy Accepted & Saved to Local Cart Draft -> VERIFIED
```

### 2.3. Admin Authentication & Dashboard Navigation E2E Run

```text
[CDP AUTOMATION LOG: ADMIN LOGIN WORKFLOW]
1. Navigated to: http://localhost:5173/login
2. Injected Values:
   - Email: 'admin@gmail.com'
   - Password: '••••••' (123456)
   - Role Select: 'admin'
3. Triggered Submit Button
4. Observed HTTP POST /api/auth/login -> 200 OK
5. Verified Navigation to: http://localhost:5173/admin/dashboard
6. Rendered Elements:
   - Header H1: 'Admin Panel'
   - Admin Navigation Tabs: 'Dashboard', 'Products', 'Orders', 'Users', 'User Custom Fit'
7. Outcome: 100% Successful Admin Session Establishment
```

