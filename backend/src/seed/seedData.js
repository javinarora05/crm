import dotenv from 'dotenv';
dotenv.config();

import Admin from '../models/Admin.js';
import Client from '../models/Client.js';
import Product from '../models/Product.js';
import Invoice from '../models/Invoice.js';

export const seedDatabase = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      console.log(' Database already initialized, skipping seed.');
      return;
    }

    console.log(' Seeding demo CRM & ERP data...');

    // 1. Create Admin
    const admin = await Admin.create({
      name: 'IDURAR Admin',
      email: 'admin@idurar.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(` Created default admin: admin@idurar.com / admin123`);

    // 2. Create Clients
    const clients = await Client.create([
      {
        name: 'John Miller',
        company: 'Acme Corporation',
        email: 'john@acme.com',
        phone: '+1 555-0199',
        country: 'United States',
        address: '123 Market St, San Francisco, CA',
        status: 'active',
        createdBy: admin._id,
      },
      {
        name: 'Sarah Connor',
        company: 'Cyberdyne Systems',
        email: 'sarah@cyberdyne.io',
        phone: '+1 555-0248',
        country: 'United States',
        address: '800 Terminator Way, Los Angeles, CA',
        status: 'active',
        createdBy: admin._id,
      },
      {
        name: 'Elena Rostova',
        company: 'Nova Innovations',
        email: 'elena@novatech.eu',
        phone: '+44 20 7946 0991',
        country: 'United Kingdom',
        address: '42 Baker Street, London',
        status: 'lead',
        createdBy: admin._id,
      },
      {
        name: 'Rajesh Patel',
        company: 'Apex Digital Hub',
        email: 'rajesh@apexdigital.in',
        phone: '+91 98765 43210',
        country: 'India',
        address: '15 MG Road, Bengaluru',
        status: 'active',
        createdBy: admin._id,
      },
    ]);
    console.log(` Seeded ${clients.length} sample clients`);

    // 3. Create Products
    const products = await Product.create([
      {
        name: 'Custom Web Application Development',
        description: 'Full-stack MERN enterprise software engineering',
        price: 3500,
        taxRate: 10,
        category: 'Development',
        createdBy: admin._id,
      },
      {
        name: 'Cloud Infrastructure & DevOps Setup',
        description: 'Docker containerization and AWS cloud configuration',
        price: 1200,
        taxRate: 10,
        category: 'DevOps',
        createdBy: admin._id,
      },
      {
        name: 'Monthly Maintenance & Support Retainer',
        description: '24/7 bug fixes, monitoring, and security patching',
        price: 800,
        taxRate: 0,
        category: 'Support',
        createdBy: admin._id,
      },
      {
        name: 'UI/UX Design System & Prototyping',
        description: 'Figma high-fidelity components and design tokens',
        price: 1500,
        taxRate: 10,
        category: 'Design',
        createdBy: admin._id,
      },
    ]);
    console.log(` Seeded ${products.length} sample products`);

    // 4. Create Invoices
    const currentYear = new Date().getFullYear();

    await Invoice.create([
      {
        number: 1001,
        year: currentYear,
        client: clients[0]._id,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        expiredDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        items: [
          {
            product: products[0]._id,
            itemName: products[0].name,
            description: products[0].description,
            quantity: 1,
            price: 3500,
            total: 3500,
          },
          {
            product: products[1]._id,
            itemName: products[1].name,
            description: products[1].description,
            quantity: 1,
            price: 1200,
            total: 1200,
          },
        ],
        subTotal: 4700,
        taxRate: 10,
        taxTotal: 470,
        total: 5170,
        currency: 'USD',
        status: 'paid',
        paymentStatus: 'paid',
        notes: 'Thank you for your business!',
        createdBy: admin._id,
      },
      {
        number: 1002,
        year: currentYear,
        client: clients[1]._id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expiredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        items: [
          {
            product: products[2]._id,
            itemName: products[2].name,
            description: products[2].description,
            quantity: 2,
            price: 800,
            total: 1600,
          },
        ],
        subTotal: 1600,
        taxRate: 0,
        taxTotal: 0,
        total: 1600,
        currency: 'USD',
        status: 'pending',
        paymentStatus: 'unpaid',
        notes: 'Net 15 payment terms.',
        createdBy: admin._id,
      },
      {
        number: 1003,
        year: currentYear,
        client: clients[3]._id,
        date: new Date(),
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [
          {
            product: products[3]._id,
            itemName: products[3].name,
            description: products[3].description,
            quantity: 1,
            price: 1500,
            total: 1500,
          },
        ],
        subTotal: 1500,
        taxRate: 10,
        taxTotal: 150,
        total: 1650,
        currency: 'USD',
        status: 'pending',
        paymentStatus: 'unpaid',
        notes: 'Initial milestone invoice.',
        createdBy: admin._id,
      },
    ]);
    console.log(` Seeded 3 sample invoices`);

    console.log(' Database seed complete!');
  } catch (error) {
    console.error('Seed error:', error);
  }
};

// Allow running directly: node src/seed/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  import('../config/db.js').then(async ({ connectDB, closeDB }) => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  });
}
