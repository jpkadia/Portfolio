require('dotenv').config();
const mongoose = require('mongoose');
const Contact = require('./models/Contact');

async function testConnection() {
  console.log('Testing connection to MongoDB Atlas...');
  console.log('URI:', process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@') : 'UNDEFINED');

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[PASS] MongoDB Atlas Connected successfully!`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);

    // Test writing a contact record
    const testRecord = new Contact({
      name: 'Automated Test User',
      mobile: '9876543210',
      message: 'Hello, this is a code-level verification test.'
    });

    const saved = await testRecord.save();
    console.log(`[PASS] Test contact inserted with ID: ${saved._id}`);

    // Test reading the record back
    const retrieved = await Contact.findById(saved._id);
    if (!retrieved || retrieved.name !== 'Automated Test User') {
      throw new Error('Verification failed: retrieved document does not match inserted document.');
    }
    console.log(`[PASS] Retrieved test document correctly: ${retrieved.name} (${retrieved.mobile})`);

    // Clean up test document
    await Contact.findByIdAndDelete(saved._id);
    console.log(`[PASS] Cleaned up test record.`);

    await mongoose.connection.close();
    console.log('[ALL TESTS PASSED] Database connection and schema verification successful!');
    process.exit(0);
  } catch (error) {
    console.error('[FAIL] MongoDB Atlas test failed:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

testConnection();
