const http = require('http');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const { app, server } = require('./server');

const request = (options, body = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
};

async function runAudit() {
  console.log('====================================================');
  console.log('  STARTING FULL-STACK SECURITY & SEO AUDIT SUITE   ');
  console.log('====================================================\n');

  const results = [];

  // --- CHECK 1: Backend Security Headers (Helmet) ---
  const resBase = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET'
  });
  const hasXContentType = resBase.headers['x-content-type-options'] === 'nosniff';
  results.push({
    test: 'Security Headers (X-Content-Type-Options: nosniff)',
    passed: hasXContentType,
    detail: `Header value: ${resBase.headers['x-content-type-options']}`
  });

  // --- CHECK 2: Unauthorized Admin Submissions Access ---
  const resSubNoAuth = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/submissions',
    method: 'GET'
  });
  results.push({
    test: 'Block unauthenticated access to /api/admin/submissions (401)',
    passed: resSubNoAuth.status === 401,
    detail: `Status received: ${resSubNoAuth.status}`
  });

  // --- CHECK 3: Fake Token Protection ---
  const resSubFake = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/submissions',
    method: 'GET',
    headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid' }
  });
  results.push({
    test: 'Block forged JWT access to /api/admin/submissions (401)',
    passed: resSubFake.status === 401,
    detail: `Status received: ${resSubFake.status}`
  });

  // --- CHECK 4: Admin Authentication ---
  const resBadAuth = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'kadiyaparth612@gmail.com', password: 'IncorrectPassword' });
  results.push({
    test: 'Reject incorrect admin password (401)',
    passed: resBadAuth.status === 401,
    detail: `Status: ${resBadAuth.status}, Message: ${resBadAuth.body?.message}`
  });

  const resGoodAuth = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'kadiyaparth612@gmail.com', password: 'Flower@123' });
  const adminToken = resGoodAuth.body?.token;
  results.push({
    test: 'Accept correct admin credentials and issue JWT (200)',
    passed: resGoodAuth.status === 200 && !!adminToken,
    detail: `Status: ${resGoodAuth.status}, Token received: ${!!adminToken}`
  });

  // --- CHECK 5: Authorized Submissions Fetch & Data Minimization ---
  const resSubAuth = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/submissions',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const subData = resSubAuth.body;
  const hasCount = typeof subData.count === 'number';
  const isArray = Array.isArray(subData.submissions);
  let leakedKeys = false;
  if (isArray && subData.submissions.length > 0) {
    const first = subData.submissions[0];
    if (first.password || first.__v !== undefined || first.connection) {
      leakedKeys = true;
    }
  }
  results.push({
    test: 'Authorized submissions retrieval with count and minimal safe fields',
    passed: resSubAuth.status === 200 && hasCount && isArray && !leakedKeys,
    detail: `Count: ${subData.count}, Records count: ${subData.submissions?.length}`
  });

  // --- CHECK 6: Anti-NoSQL Injection on Contact Form ---
  const resNoSQL = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/contact',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: { "$ne": null }, mobile: "9876543210", message: "NoSQL Test" });
  results.push({
    test: 'NoSQL object injection rejected (400)',
    passed: resNoSQL.status === 400,
    detail: `Status: ${resNoSQL.status}, Response: ${resNoSQL.body?.message}`
  });

  // --- CHECK 7: Request Payload Body Limit (10KB limit) ---
  const resPayload = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/contact',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'Large User', mobile: '9876543210', message: 'X'.repeat(15000) });
  results.push({
    test: 'Oversized payload rejected (413 Payload Too Large)',
    passed: resPayload.status === 413,
    detail: `Status: ${resPayload.status}, Message: ${resPayload.body?.message}`
  });

  // --- CHECK 8: CORS Whitelisting ---
  const resAllowedCors = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET',
    headers: { 'Origin': 'https://parthkadiya.vercel.app' }
  });
  results.push({
    test: 'CORS allows whitelisted origin (https://parthkadiya.vercel.app)',
    passed: resAllowedCors.headers['access-control-allow-origin'] === 'https://parthkadiya.vercel.app',
    detail: `Access-Control-Allow-Origin: ${resAllowedCors.headers['access-control-allow-origin']}`
  });

  const resBlockedCors = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/contact/health',
    method: 'GET',
    headers: { 'Origin': 'https://evil-hacker.com' }
  });
  results.push({
    test: 'CORS blocks unauthorized origin (https://evil-hacker.com)',
    passed: resBlockedCors.status === 403,
    detail: `Status: ${resBlockedCors.status}`
  });

  // --- CHECK 9: Robots.txt and Sitemap.xml SEO Check ---
  const robotsTxt = fs.readFileSync(path.join(__dirname, '../frontend/public/robots.txt'), 'utf8');
  const sitemapXml = fs.readFileSync(path.join(__dirname, '../frontend/public/sitemap.xml'), 'utf8');

  const robotsHasAdminDisallow = robotsTxt.includes('Disallow: /admin');
  const sitemapHasNoAdmin = !sitemapXml.includes('/admin');

  results.push({
    test: 'robots.txt disallows /admin and /admin/',
    passed: robotsHasAdminDisallow,
    detail: `Contains Disallow: /admin`
  });

  results.push({
    test: 'sitemap.xml strictly excludes admin URLs',
    passed: sitemapHasNoAdmin,
    detail: `Admin URLs found in sitemap: ${!sitemapHasNoAdmin}`
  });

  // --- CHECK 10: Zero Secrets in Frontend Codebase ---
  const frontendBuildDir = path.join(__dirname, '../frontend/build');
  let secretsFoundInBuild = false;
  if (fs.existsSync(frontendBuildDir)) {
    const mainJsFiles = fs.readdirSync(path.join(frontendBuildDir, 'static/js'))
      .filter(f => f.startsWith('main.') && f.endsWith('.js') && !f.endsWith('.map'));
    for (const f of mainJsFiles) {
      const code = fs.readFileSync(path.join(frontendBuildDir, 'static/js', f), 'utf8');
      if (code.includes('Flower@123') || code.includes('Potay127s') || code.includes('f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8')) {
        secretsFoundInBuild = true;
      }
    }
  }
  results.push({
    test: 'Production frontend JS bundle contains ZERO backend secrets/passwords',
    passed: !secretsFoundInBuild,
    detail: `Secrets found in bundle: ${secretsFoundInBuild}`
  });

  // --- PRINT SUMMARY TABLE ---
  console.log('\nRESULTS SUMMARY:');
  console.log('----------------------------------------------------');
  let allPassed = true;
  for (const r of results) {
    const mark = r.passed ? '✓ PASS' : '✗ FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${mark}] ${r.test}`);
    console.log(`       Detail: ${r.detail}`);
  }
  console.log('----------------------------------------------------');
  console.log(`OVERALL RESULT: ${allPassed ? 'ALL 10 AUDITS PASSED SUCCESSFULLY' : 'FAILURES DETECTED'}\n`);

  server.close();
  process.exit(allPassed ? 0 : 1);
}

runAudit().catch(err => {
  console.error('Fatal audit error:', err);
  server.close();
  process.exit(1);
});
