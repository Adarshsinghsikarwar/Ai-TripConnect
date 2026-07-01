// __tests__/setup.js
// Shared setup used by every test file via `require('./setup')`.
// Spins up an in-memory MongoDB instance so tests:
//  - never touch your real database
//  - run in isolation (each test file gets a clean slate)
//  - don't need an internet connection or Atlas account

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Boot in-memory DB before all tests in this file
async function connect() {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}

// Drop all collections between tests so one test's data doesn't affect the next
async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

// Tear down after all tests in the file are done
async function disconnect() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}

module.exports = { connect, clearDB, disconnect };
