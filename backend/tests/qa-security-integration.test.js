const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Isolate test environment from live Atlas / .env overrides before importing server.js
process.env.NODE_ENV = 'test';
process.env.SKIP_DB_AUTOCONNECT = 'true';
process.env.JWT_SECRET = 'qa_test_jwt_secret_key_for_isolated_suite_2026';
process.env.RAZORPAY_KEY_ID = 'rzp_test_qa_key_id';
process.env.RAZORPAY_KEY_SECRET = 'qa_test_razorpay_secret_key_2026';

const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const CustomFitRecord = require('../models/CustomFitRecord');
const Contact = require('../models/Contact');

let mongod;
let server;
let baseUrl;

const state = {
  adminToken: null,
  customerToken: null,
  customerUserId: null,
  customer2Token: null,
  seller1Token: null,
  seller1Id: null,
  seller2Token: null,
  productId: null,
  discountedProductPrice: null,
  customFitId: null
};

async function api(path, { method = 'GET', token, body, headers = {} } = {}) {
  const reqHeaders = { ...headers };
  if (token) reqHeaders.Authorization = `Bearer ${token}`;
  if (body !== undefined && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }
  const start = performance.now();
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: reqHeaders,
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
  });
  const elapsedMs = performance.now() - start;
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { status: res.status, headers: res.headers, json, elapsedMs };
}

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Seed admin user explicitly
  await User.create({
    name: 'QA Admin',
    email: 'admin@gmail.com',
    password: 'StrongAdminPass!2026',
    role: 'admin',
    isBlocked: false
  });

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

test('1. Authentication, Registration Validation, & Hardcoded Backdoor Removal', async () => {
  // Reject invalid email & weak password & admin privilege escalation
  const badEmail = await api('/api/auth/register', {
    method: 'POST',
    body: { name: 'Bad', email: 'not-an-email', password: 'Password123' }
  });
  assert.equal(badEmail.status, 400);

  const weakPass = await api('/api/auth/register', {
    method: 'POST',
    body: { name: 'Weak', email: 'weak@example.com', password: '123' }
  });
  assert.equal(weakPass.status, 400);

  const privEsc = await api('/api/auth/register', {
    method: 'POST',
    body: { name: 'Attacker', email: 'attacker@example.com', password: 'Password123', role: 'admin' }
  });
  assert.equal(privEsc.status, 400);

  // Register Customer 1, Customer 2, Seller 1, Seller 2
  const c1 = await api('/api/auth/register', {
    method: 'POST',
    body: { name: "O'Connor & Co", email: 'customer1@example.com', password: 'Password123', role: 'user' }
  });
  assert.equal(c1.status, 201);
  assert.ok(c1.json.token);
  assert.equal(c1.json.data.role, 'user');
  state.customerToken = c1.json.token;
  state.customerUserId = c1.json.data.id;

  // Duplicate email fails cleanly with 400
  const dup = await api('/api/auth/register', {
    method: 'POST',
    body: { name: 'Dup', email: 'customer1@example.com', password: 'Password123' }
  });
  assert.equal(dup.status, 400);

  const c2 = await api('/api/auth/register', {
    method: 'POST',
    body: { name: 'Customer Two', email: 'customer2@example.com', password: 'Password123' }
  });
  assert.equal(c2.status, 201);
  state.customer2Token = c2.json.token;

  const s1 = await api('/api/auth/register', {
    method: 'POST',
    body: { name: 'Atelier Seller One', email: 'seller1@example.com', password: 'Password123', role: 'seller' }
  });
  assert.equal(s1.status, 201);
  assert.equal(s1.json.data.role, 'seller');
  state.seller1Token = s1.json.token;
  state.seller1Id = s1.json.data.id;

  const s2 = await api('/api/auth/register', {
    method: 'POST',
    body: { name: 'Seller Two', email: 'seller2@example.com', password: 'Password123', role: 'seller' }
  });
  assert.equal(s2.status, 201);
  state.seller2Token = s2.json.token;

  // Verify old hardcoded admin bypass ('123456') fails for admin whose password is StrongAdminPass!2026
  const bypassAttempt = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@gmail.com', password: '123456', role: 'admin' }
  });
  assert.equal(bypassAttempt.status, 401);

  // Verify real admin login succeeds & sets HttpOnly + SameSite=Lax cookie
  const adminLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@gmail.com', password: 'StrongAdminPass!2026', role: 'admin' }
  });
  assert.equal(adminLogin.status, 200);
  state.adminToken = adminLogin.json.token;
  const setCookie = adminLogin.headers.get('set-cookie') || '';
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
});

test('2. RBAC, Unauthenticated Route Lockdowns, & Mass Assignment Protection', async () => {
  // Contact debug PII dump must reject unauthenticated & non-admin requests
  assert.equal((await api('/api/contact/debug')).status, 401);
  assert.equal((await api('/api/contact/debug', { token: state.customerToken })).status, 403);
  assert.equal((await api('/api/contact/debug', { token: state.adminToken })).status, 200);

  // Test email endpoint must reject unauthenticated & non-admin requests
  assert.equal((await api('/api/test-email')).status, 401);
  assert.equal((await api('/api/test-email', { token: state.customerToken })).status, 403);

  // Admin endpoints enforce admin role
  for (const path of ['/api/users/admin', '/api/custom-fits/admin', '/api/payment/orders/admin', '/api/activities']) {
    assert.equal((await api(path)).status, 401, `${path} unauth`);
    assert.equal((await api(path, { token: state.customerToken })).status, 403, `${path} customer`);
    assert.equal((await api(path, { token: state.seller1Token })).status, 403, `${path} seller`);
    assert.equal((await api(path, { token: state.adminToken })).status, 200, `${path} admin`);
  }

  // User profile update cannot elevate role or bypass block status via mass assignment
  const profRes = await api('/api/users/profile', {
    method: 'PUT',
    token: state.customerToken,
    body: { name: "O'Connor Updated", role: 'admin', isBlocked: false }
  });
  assert.equal(profRes.status, 200);
  assert.equal(profRes.json.data.name, "O'Connor Updated");
  assert.equal(profRes.json.data.role, 'user');

  // Product ownership & seller overwrite protection
  const createProd = await api('/api/products', {
    method: 'POST',
    token: state.seller1Token,
    body: {
      name: 'Bespoke Cashmere Coat',
      description: 'Hand-tailored luxury overcoat.',
      price: 10000,
      discount: 10,
      category: 'premium-men',
      tier: 'premium',
      gender: 'men',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35'
    }
  });
  assert.equal(createProd.status, 201);
  state.productId = createProd.json.data._id;
  state.discountedProductPrice = 9000;

  // Seller 2 cannot modify or delete Seller 1's product (403 Forbidden)
  const crossEdit = await api(`/api/products/${state.productId}`, {
    method: 'PUT',
    token: state.seller2Token,
    body: { price: 1 }
  });
  assert.equal(crossEdit.status, 403);

  // Seller 1 cannot reassign seller via mass assignment
  const sellerMassAssign = await api(`/api/products/${state.productId}`, {
    method: 'PUT',
    token: state.seller1Token,
    body: { seller: state.customerUserId, price: 10000 }
  });
  assert.equal(sellerMassAssign.status, 200);
  assert.equal(sellerMassAssign.json.data.seller, state.seller1Id);

  // Blocked user token immediately rejected on protected route
  const blockRes = await api(`/api/users/admin/${state.customerUserId}/block`, {
    method: 'PUT',
    token: state.adminToken
  });
  assert.equal(blockRes.status, 200);
  const blockedAccess = await api('/api/auth/me', { token: state.customerToken });
  assert.equal(blockedAccess.status, 401);
  await api(`/api/users/admin/${state.customerUserId}/unblock`, {
    method: 'PUT',
    token: state.adminToken
  });
});

test('3. CORS Allowlist Enforcement, Security Headers, NoSQLi & Prototype Pollution', async () => {
  const goodCors = await api('/api/products', {
    headers: { Origin: 'http://localhost:5173' }
  });
  assert.equal(goodCors.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  assert.equal(goodCors.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(goodCors.headers.get('x-frame-options'), 'DENY');

  const evilCors = await api('/api/products', {
    headers: { Origin: 'https://evil-attacker.com' }
  });
  assert.equal(evilCors.headers.get('access-control-allow-origin'), null);

  const spoofCors = await api('/api/products', {
    headers: { Origin: 'https://evil-localhost.com' }
  });
  assert.equal(spoofCors.headers.get('access-control-allow-origin'), null);

  // NoSQL injection login payload stripped
  const nosqli = await api('/api/auth/login', {
    method: 'POST',
    body: { email: { $ne: '' }, password: { $gt: '' } }
  });
  assert.ok(nosqli.status === 400 || nosqli.status === 401);

  // Prototype pollution attempt in JSON string body
  const protoRes = await api('/api/products', {
    method: 'POST',
    token: state.seller1Token,
    body: '{"name":"Safe Item","description":"Test desc","price":1000,"category":"clothes","__proto__":{"polluted":true},"constructor":{"prototype":{"polluted2":true}}}'
  });
  assert.equal(protoRes.status, 201);
  assert.equal(({}).polluted, undefined);
  assert.equal(({}).polluted2, undefined);
});

test('4. Per-User OTP Brute-Force Lockout & Legacy Reset Password Validation', async () => {
  const userDoc = await User.findOne({ email: 'customer1@example.com' });
  const realOtp = userDoc.generateOTP();
  await userDoc.save({ validateBeforeSave: false });

  // 4 failed attempts -> 400
  for (let i = 0; i < 4; i += 1) {
    const failRes = await api('/api/auth/verify-otp', {
      method: 'POST',
      body: { email: 'customer1@example.com', otp: `00000${i}` }
    });
    assert.equal(failRes.status, 400);
  }

  // 5th failed attempt triggers per-account lockout (429) and invalidates OTP
  const lockoutRes = await api('/api/auth/verify-otp', {
    method: 'POST',
    body: { email: 'customer1@example.com', otp: '999999' }
  });
  assert.equal(lockoutRes.status, 429);

  // Subsequent attempt even with the formerly valid OTP is rejected
  const postLockRes = await api('/api/auth/verify-otp', {
    method: 'POST',
    body: { email: 'customer1@example.com', otp: realOtp }
  });
  assert.equal(postLockRes.status, 400);

  // Legacy resetpassword rejects short/empty password
  const u2 = await User.findOne({ email: 'customer2@example.com' });
  const resetTok = u2.getResetPasswordToken();
  await u2.save({ validateBeforeSave: false });
  const shortReset = await api(`/api/auth/resetpassword/${resetTok}`, {
    method: 'PUT',
    body: { password: '123' }
  });
  assert.equal(shortReset.status, 400);
});

test('5. Custom Fit Validation, Payment Price/Signature Verification, & Order Isolation', async () => {
  // Cart rejects unconfirmed Custom Fit or out-of-range chest
  const unconfCart = await api('/api/users/cart', {
    method: 'POST',
    token: state.customerToken,
    body: {
      productId: state.productId,
      quantity: 1,
      selectedSize: 'Custom Fit',
      selectedSizeType: 'custom',
      customMeasurements: {
        chest: '40', shoulder: '18', waist: '34', thigh: '22', torso: '28', hips: '40',
        fitPreference: 'Tailored Fit', confirmed: false, policyAccepted: false
      }
    }
  });
  assert.equal(unconfCart.status, 400);

  const badChestCart = await api('/api/users/cart', {
    method: 'POST',
    token: state.customerToken,
    body: {
      productId: state.productId,
      quantity: 1,
      selectedSize: 'Custom Fit',
      selectedSizeType: 'custom',
      customMeasurements: {
        chest: '5', shoulder: '18', waist: '34', thigh: '22', torso: '28', hips: '40',
        fitPreference: 'Tailored Fit', confirmed: true, policyAccepted: true
      }
    }
  });
  assert.equal(badChestCart.status, 400);

  const goodCart = await api('/api/users/cart', {
    method: 'POST',
    token: state.customerToken,
    body: {
      productId: state.productId,
      quantity: 1,
      selectedSize: 'Custom Fit',
      selectedSizeType: 'custom',
      customMeasurements: {
        chest: '40', shoulder: '18', waist: '34', thigh: '22', torso: '28', hips: '40',
        fitPreference: 'Tailored Fit', confirmed: true, policyAccepted: true
      }
    }
  });
  assert.equal(goodCart.status, 200);
  assert.equal(goodCart.json.data.length, 1);

  const sign = (orderId, paymentId) =>
    crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');

  // Invalid Razorpay signature rejected
  const badSig = await api('/api/payment/verify', {
    method: 'POST',
    token: state.customerToken,
    body: {
      razorpay_order_id: 'order_bad_sig',
      razorpay_payment_id: 'pay_bad_sig',
      razorpay_signature: '0'.repeat(64)
    }
  });
  assert.equal(badSig.status, 400);

  // Price tampering (client modifies item price from 9000 to 1 with valid signature) rejected
  const oidTamper = 'order_tamper_price';
  const pidTamper = 'pay_tamper_price';
  const priceTamper = await api('/api/payment/verify', {
    method: 'POST',
    token: state.customerToken,
    body: {
      razorpay_order_id: oidTamper,
      razorpay_payment_id: pidTamper,
      razorpay_signature: sign(oidTamper, pidTamper),
      orderData: {
        id: 'VRX-TAMPER1',
        user: { name: "O'Connor", email: 'customer1@example.com', phone: '9876543210', address: '10 Royal Ave' },
        items: [{ id: state.productId, name: 'Bespoke Cashmere Coat', price: 1, quantity: 1, size: 'L' }],
        subtotal: 1,
        tax: 0,
        totalAmount: 1
      }
    }
  });
  assert.equal(priceTamper.status, 400);

  // Legitimate confirmed Custom Fit checkout with WELCOME10 coupon (9000 * 0.9 = 8100 + 8% tax = 8748)
  const oidGood = 'order_custom_ok';
  const pidGood = 'pay_custom_ok';
  const goodVerify = await api('/api/payment/verify', {
    method: 'POST',
    token: state.customerToken,
    body: {
      razorpay_order_id: oidGood,
      razorpay_payment_id: pidGood,
      razorpay_signature: sign(oidGood, pidGood),
      orderData: {
        id: 'VRX-900100',
        user: { name: "O'Connor", email: 'customer1@example.com', phone: '9876543210', address: '10 Royal Ave', city: 'Jaipur', state: 'RJ', zipCode: '302001' },
        items: [{
          id: state.productId,
          name: 'Bespoke Cashmere Coat',
          price: 9000,
          quantity: 1,
          size: 'Custom Fit',
          sizeType: 'custom',
          customMeasurements: {
            chest: '40', shoulder: '18', waist: '34', thigh: '22', torso: '28', hips: '40',
            fitPreference: 'Tailored Fit', confirmed: true, policyAccepted: true
          }
        }],
        couponCode: 'WELCOME10',
        subtotal: 8100,
        tax: 648,
        totalAmount: 8748
      }
    }
  });
  assert.equal(goodVerify.status, 200);
  assert.equal(goodVerify.json.customFitCount, 1);
  assert.equal(goodVerify.json.order.totalAmount, 8748);

  // Replay payment verification does not duplicate CustomFitRecord
  const replayVerify = await api('/api/payment/verify', {
    method: 'POST',
    token: state.customerToken,
    body: {
      razorpay_order_id: oidGood,
      razorpay_payment_id: pidGood,
      razorpay_signature: sign(oidGood, pidGood),
      orderData: {
        id: 'VRX-900100',
        user: { name: "O'Connor", email: 'customer1@example.com' },
        items: [{ id: state.productId, price: 9000, quantity: 1, size: 'Custom Fit', sizeType: 'custom' }],
        subtotal: 9000,
        totalAmount: 9000
      }
    }
  });
  assert.equal(replayVerify.status, 200);
  assert.equal(replayVerify.json.customFitCount, 0);

  // Admin Custom Fit endpoint returns record and allows status progression
  const adminCF = await api('/api/custom-fits/admin', { token: state.adminToken });
  assert.equal(adminCF.status, 200);
  assert.equal(adminCF.json.data.length, 1);
  state.customFitId = adminCF.json.data[0]._id;
  assert.equal(adminCF.json.data[0].measurements.chest, 40);

  const patchStatus = await api(`/api/custom-fits/admin/${state.customFitId}/status`, {
    method: 'PATCH',
    token: state.adminToken,
    body: { status: 'In Tailoring', tailoringNotes: 'Pattern drafted cleanly' }
  });
  assert.equal(patchStatus.status, 200);
  assert.equal(patchStatus.json.data.status, 'In Tailoring');

  // Cross-account order isolation
  const c1Orders = await api('/api/payment/orders/my', { token: state.customerToken });
  const c2Orders = await api('/api/payment/orders/my', { token: state.customer2Token });
  assert.equal(c1Orders.json.data.length, 1);
  assert.equal(c2Orders.json.data.length, 0);
});

test('6. Controlled Concurrency & API Latency Benchmark (30 parallel GET /api/products)', async () => {
  const results = await Promise.all(
    Array.from({ length: 30 }, () => api('/api/products'))
  );
  const latencies = results.map((r) => r.elapsedMs).sort((a, b) => a - b);
  for (const r of results) {
    assert.equal(r.status, 200);
    assert.equal(r.json.success, true);
  }
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const max = latencies[latencies.length - 1];
  console.log(`LOAD_BENCHMARK_30X: p50=${p50.toFixed(1)}ms p95=${p95.toFixed(1)}ms max=${max.toFixed(1)}ms`);
  assert.ok(p95 < 2000, `Expected p95 < 2000ms, got ${p95}`);
});

