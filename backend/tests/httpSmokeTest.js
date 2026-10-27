import { startServer } from '../src/server.js';
import { closeDB } from '../src/config/db.js';

async function testHttpEndpoints() {
  console.log('🌐 Testing Live HTTP API Endpoints...');
  let server;
  const testPort = 5055;
  try {
    server = await startServer(testPort);
    const baseUrl = `http://localhost:${testPort}/api/v1`;

    // 1. Test Health endpoint
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    if (healthRes.status !== 'ok') throw new Error('Health check failed');
    console.log(' Health check OK');

    // 2. Test Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@idurar.com',
        password: 'admin123',
      }),
    }).then((r) => r.json());

    if (!loginRes.success || !loginRes.result?.token) {
      throw new Error('Login API failed: ' + loginRes.message);
    }
    const token = loginRes.result.token;
    console.log(` Login endpoint OK (Token issued for ${loginRes.result.current.name})`);

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 3. Test Clients API
    const clientsRes = await fetch(`${baseUrl}/clients`, { headers: authHeaders }).then((r) =>
      r.json()
    );
    if (!clientsRes.success || !Array.isArray(clientsRes.result)) {
      throw new Error('Clients endpoint failed');
    }
    console.log(` Clients API OK (${clientsRes.result.length} clients fetched)`);

    // 4. Test Products API
    const productsRes = await fetch(`${baseUrl}/products`, { headers: authHeaders }).then((r) =>
      r.json()
    );
    if (!productsRes.success || !Array.isArray(productsRes.result)) {
      throw new Error('Products endpoint failed');
    }
    console.log(` Products API OK (${productsRes.result.length} products fetched)`);

    // 5. Test Invoices API
    const invoicesRes = await fetch(`${baseUrl}/invoices`, { headers: authHeaders }).then((r) =>
      r.json()
    );
    if (!invoicesRes.success || !Array.isArray(invoicesRes.result)) {
      throw new Error('Invoices endpoint failed');
    }
    console.log(` Invoices API OK (${invoicesRes.result.length} invoices fetched)`);

    // 6. Test Dashboard Stats API
    const dashboardRes = await fetch(`${baseUrl}/dashboard/stats`, { headers: authHeaders }).then(
      (r) => r.json()
    );
    if (!dashboardRes.success || !dashboardRes.result?.summary) {
      throw new Error('Dashboard stats endpoint failed');
    }
    console.log(
      ` Dashboard Stats API OK (Total Revenue: $${dashboardRes.result.summary.totalRevenue})`
    );

    console.log('\n🎉 ALL HTTP REST ENDPOINTS VERIFIED & WORKING!');
  } catch (err) {
    console.error('❌ HTTP Test Failed:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await closeDB();
    process.exit(process.exitCode || 0);
  }
}

testHttpEndpoints();
