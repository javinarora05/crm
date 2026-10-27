import { connectDB, closeDB } from '../src/config/db.js';
import { seedDatabase } from '../src/seed/seedData.js';
import Admin from '../src/models/Admin.js';
import Client from '../src/models/Client.js';
import Product from '../src/models/Product.js';
import Invoice from '../src/models/Invoice.js';

async function runSmokeTests() {
  console.log('🧪 Starting API & Database Smoke Tests...\n');
  try {
    await connectDB();
    await seedDatabase();

    // Test 1: Admin verification
    const admin = await Admin.findOne({ email: 'admin@idurar.com' });
    if (!admin) throw new Error('Default admin not found in DB');
    const isPasswordValid = await admin.matchPassword('admin123');
    if (!isPasswordValid) throw new Error('Admin password hash mismatch');
    console.log(' Admin authentication & bcrypt check passed');

    // Test 2: Client CRUD check
    const clientCount = await Client.countDocuments({ removed: false });
    if (clientCount < 1) throw new Error('Client seeding failed');
    console.log(` Client models verified (${clientCount} active clients found)`);

    // Test 3: Product catalog check
    const productCount = await Product.countDocuments({ removed: false });
    if (productCount < 1) throw new Error('Product seeding failed');
    console.log(` Product catalog verified (${productCount} products found)`);

    // Test 4: Invoices & calculations check
    const invoices = await Invoice.find({ removed: false }).populate('client');
    if (invoices.length < 1) throw new Error('Invoice seeding failed');

    const firstInvoice = invoices[0];
    if (!firstInvoice.client || !firstInvoice.items.length) {
      throw new Error('Invoice relations / line items invalid');
    }
    console.log(` Invoicing engine verified (${invoices.length} invoices, relations intact)`);

    console.log('\n All smoke tests passed successfully!');
    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Smoke test failed:', err);
    await closeDB().catch(() => {});
    process.exit(1);
  }
}

runSmokeTests();
