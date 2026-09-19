require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { app, server } = require('./server');
const Contact = require('./models/Contact');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runApiTests() {
  console.log('Starting API Endpoint Tests on Express server...');
  let testId = null;

  try {
    // Wait a moment for DB connection
    await new Promise(r => setTimeout(r, 2000));

    // Test 1: GET /api/contact/health
    const healthRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/contact/health',
      method: 'GET'
    });
    console.log(`[PASS] GET /api/contact/health status: ${healthRes.status}, body:`, healthRes.data);
    if (healthRes.status !== 200) throw new Error('Health check failed');

    // Test 2: POST /api/contact with VALID data
    const validPayload = {
      name: 'Test Sender',
      mobile: '9123456780',
      message: 'This is a test message from automated verification.'
    };
    const validRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/contact',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      validPayload
    );
    console.log(`[PASS] POST /api/contact (Valid) status: ${validRes.status}, message: ${validRes.data.message}`);
    if (validRes.status !== 201 || !validRes.data.success) {
      throw new Error(`Valid POST failed: ${JSON.stringify(validRes.data)}`);
    }
    testId = validRes.data.data.id;

    // Test 3: POST /api/contact with INVALID mobile (e.g., '123')
    const invalidMobilePayload = {
      name: 'Invalid User',
      mobile: '123',
      message: 'Testing invalid mobile validation.'
    };
    const invalidRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/contact',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      invalidMobilePayload
    );
    console.log(`[PASS] POST /api/contact (Invalid Mobile) rejected with status: ${invalidRes.status}, error: ${invalidRes.data.message}`);
    if (invalidRes.status !== 400) throw new Error('Invalid mobile was not rejected with 400');

    // Test 4: POST /api/contact with EMPTY fields
    const emptyPayload = { name: '', mobile: '', message: '' };
    const emptyRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/contact',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      emptyPayload
    );
    console.log(`[PASS] POST /api/contact (Empty Fields) rejected with status: ${emptyRes.status}, error: ${emptyRes.data.message}`);
    if (emptyRes.status !== 400) throw new Error('Empty payload was not rejected with 400');

    // Cleanup valid test entry
    if (testId) {
      await Contact.findByIdAndDelete(testId);
      console.log(`[PASS] Cleaned up created test entry with ID: ${testId}`);
    }

    console.log('[ALL API TESTS PASSED SUCCESSFULLY]');
  } catch (err) {
    console.error('[FAIL] API test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(process.exitCode || 0);
  }
}

runApiTests();
