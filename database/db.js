require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');


// 
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });


//   
let db;
// 
const connectToDatabase = async () => {
  if (!db) {
    await client.connect();
    db = client.db('task-manager');
    console.log('Connecting to MongoDB');
  }
  return db;
};

const getDb = () => {
  if (!db) throw new Error('Database not connected');
  return db;
};

module.exports = { connectToDatabase, getDb };