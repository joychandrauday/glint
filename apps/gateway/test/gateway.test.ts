import assert from 'node:assert';
import app from '../src/index';

async function runTests() {
  console.log('--- Testing Glint AI Gateway ---');

  // 1. Health check
  const healthRes = await app.request('/health');
  assert.strictEqual(healthRes.status, 200, 'Health check should return 200');
  const healthJson = await healthRes.json();
  assert.strictEqual(healthJson.status, 'ok');
  console.log('✓ Health check passed');

  // 2. Cheatsheets catalog
  const sheetsRes = await app.request('/api/v1/cheatsheets?category=docker');
  assert.strictEqual(sheetsRes.status, 200);
  const sheetsJson = await sheetsRes.json();
  assert.ok(sheetsJson.data.length > 0, 'Should return docker cheatsheets');
  console.log(`✓ Cheatsheet retrieval passed (${sheetsJson.data.length} docker items found)`);

  // 3. AI Query without Auth should fail with 401
  const unauthRes = await app.request('/api/v1/ai/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'kill port 3000' }),
  });
  assert.strictEqual(unauthRes.status, 401, 'AI query should require auth (Guest lock enforced)');
  console.log('✓ AI query unauthenticated rejection passed (401)');

  // 4. AI Query with Auth
  const authRes = await app.request('/api/v1/ai/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer dev-user-123',
    },
    body: JSON.stringify({ query: 'kill port 3000' }),
  });
  assert.strictEqual(authRes.status, 200, 'AI query with auth should return 200');
  const authJson = await authRes.json();
  assert.strictEqual(authJson.cached, false, 'First query should be a cache miss');
  assert.ok(authJson.suggestions.length > 0, 'Should return command suggestions');
  console.log(`✓ AI query execution passed (Provider: ${authJson.provider}, Latency: ${authJson.latencyMs}ms)`);

  // 5. Cache hit verification
  const cachedRes = await app.request('/api/v1/ai/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer dev-user-123',
    },
    body: JSON.stringify({ query: 'kill port 3000' }),
  });
  const cachedJson = await cachedRes.json();
  assert.strictEqual(cachedJson.cached, true, 'Second identical query must be a cache hit');
  console.log(`✓ Cache hit verified (Instant response: ${cachedJson.latencyMs}ms)`);

  // 6. User Quota verification
  const quotaRes = await app.request('/api/v1/user/quota', {
    headers: { Authorization: 'Bearer dev-user-123' },
  });
  assert.strictEqual(quotaRes.status, 200);
  const quotaJson = await quotaRes.json();
  assert.strictEqual(quotaJson.quota.queriesUsedToday, 1, 'Should have used exactly 1 quota token');
  console.log(`✓ Quota tracking verified (Used: ${quotaJson.quota.queriesUsedToday}, Remaining: ${quotaJson.quota.remainingQueries})`);

  console.log('--- ALL GATEWAY TESTS PASSED ---');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
