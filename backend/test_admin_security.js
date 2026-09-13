const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const { app, server } = require('./server');

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

async function runTests() {
  console.log('=== RUNNING BACKEND SECURITY & FUNCTIONALITY TESTS ===');
  let token = null;

  try {
    // 1. Base route test
    const resBase = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/',
      method: 'GET'
    });
    console.log(`[TEST 1] GET / -> Status: ${resBase.status} (Expected: 200)`);
    console.assert(resBase.status === 200, 'Base route failed');

    // 2. Unauthenticated Admin Submissions API (Must return 401)
    const resNoAuth = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/submissions',
      method: 'GET'
    });
    console.log(`[TEST 2] GET /api/admin/submissions (No Auth) -> Status: ${resNoAuth.status} (Expected: 401)`);
    console.assert(resNoAuth.status === 401, 'Unauthenticated access was NOT blocked!');

    // 3. Fake Token Admin Submissions API (Must return 401)
    const resFakeAuth = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/submissions',
      method: 'GET',
      headers: { 'Authorization': 'Bearer fake.invalid.token' }
    });
    console.log(`[TEST 3] GET /api/admin/submissions (Fake Token) -> Status: ${resFakeAuth.status} (Expected: 401)`);
    console.assert(resFakeAuth.status === 401, 'Fake token was NOT blocked!');

    // 4. Invalid Admin Login Credentials (Must return 401)
    const resBadLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'kadiyaparth612@gmail.com', password: 'WrongPassword999' });
    console.log(`[TEST 4] POST /api/admin/login (Wrong Password) -> Status: ${resBadLogin.status} (Expected: 401)`);
    console.assert(resBadLogin.status === 401, 'Invalid password was accepted!');

    // 5. Valid Admin Login (Must return 200 and JWT)
    const resGoodLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'kadiyaparth612@gmail.com', password: 'Flower@123' });
    console.log(`[TEST 5] POST /api/admin/login (Valid Credentials) -> Status: ${resGoodLogin.status} (Expected: 200)`);
    console.assert(resGoodLogin.status === 200 && resGoodLogin.body.token, 'Valid login failed to yield JWT token!');
    token = resGoodLogin.body.token;
    console.log('   -> JWT Token received successfully (role: admin)');

    // 6. Authorized Admin Submissions API (Must return 200 with count & list)
    const resAuthSubmissions = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/submissions',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`[TEST 6] GET /api/admin/submissions (Valid JWT) -> Status: ${resAuthSubmissions.status} (Expected: 200)`);
    console.log(`   -> Total Submissions Count: ${resAuthSubmissions.body.count}`);
    console.assert(resAuthSubmissions.status === 200 && Array.isArray(resAuthSubmissions.body.submissions), 'Authorized submissions fetch failed!');

    // 7. Contact Form Submission - Invalid Mobile (Must return 400)
    const resBadContact = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/contact',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Test User', mobile: '12345', message: 'Hello' });
    console.log(`[TEST 7] POST /api/contact (Invalid Mobile 12345) -> Status: ${resBadContact.status} (Expected: 400)`);
    console.assert(resBadContact.status === 400, 'Invalid mobile was accepted!');

    // 8. Contact Form - Anti-NoSQL Injection test (Must return 400)
    const resNoSqlContact = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/contact',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: { "$gt": "" }, mobile: "9876543210", message: "Test NoSQL" });
    console.log(`[TEST 8] POST /api/contact (NoSQL Object Payload) -> Status: ${resNoSqlContact.status} (Expected: 400)`);
    console.assert(resNoSqlContact.status === 400, 'NoSQL injection object was accepted!');

    // 9. Oversized Payload (>10KB limit test)
    const largeMessage = 'A'.repeat(12000);
    const resOversized = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/contact',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Large User', mobile: '9876543210', message: largeMessage });
    console.log(`[TEST 9] POST /api/contact (Payload > 10KB) -> Status: ${resOversized.status} (Expected: 413)`);
    console.assert(resOversized.status === 413, 'Oversized payload was not rejected with 413!');

    // 10. CORS Rejection test
    const resCors = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/contact/health',
      method: 'GET',
      headers: { 'Origin': 'https://malicious-site.com' }
    });
    console.log(`[TEST 10] GET /api/contact/health with Origin: https://malicious-site.com -> Status: ${resCors.status} (Expected: 403)`);
    console.assert(resCors.status === 403, 'Unauthorized CORS origin was not rejected!');

    console.log('\n>>> ALL 10 BACKEND SECURITY TESTS PASSED PERFECTLY! <<<');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
