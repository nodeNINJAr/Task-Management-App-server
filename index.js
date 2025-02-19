require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase, getDb } = require('./database/db');
const port = process.env.PORT || 5000;
// server
const app = express();


// middleware
app.use(cors());
app.use(express.json());




// 
const startServer =async()=>{
   
    try{
    // Connect to mongoDD
    await  connectToDatabase()
    console.log('MongoDB connection established');
    
     // Get the database instance
     const db = getDb();

     // Assign collections
     const taskCollection = db.collection('tasks');
     const userCollection = db.collection('users'); 
         
        


    // 
    app.get('/', (req,res)=>{
    res.send('task management application server running')
    })

    app.listen(port,()=>{
        console.log(`Task Management Application server is running on port ${port}`);
    })

    }
    catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
      }
}


// Call the function to start the server
startServer();