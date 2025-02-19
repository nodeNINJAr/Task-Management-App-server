require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase, getDb } = require('./database/db');
const port = process.env.PORT || 5000;
// server
const app = express();


// middleware
app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true, 
    })
  );
//   
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
         
     
    // crud  oparation ***


    // save user data to database 
    app.post('/users', async (req, res)=>{
         const userInfo = req?.body;
          // 
         if(!userInfo) return
         const isExist = await userCollection.findOne({email:userInfo?.email});
         if(isExist){
          return res.status(403).send({message:"conflict"})
         }
         const result = await userCollection.insertOne(userInfo);
         res.send(result);

    })

    // post task
    app.post('/tasks', async (req, res) => {
        try {
            const { title, description, category,uid } = req.body;
           if (!title || title.length > 50) {
             return res.status(400).json({ error: 'Title is required and must be less than 50 characters' });
           }
         
           if (description && description.length > 200) {
             return res.status(400).json({ error: 'Description must be less than 200 characters' });
           }
         
           const newTask = {
             title,
             description: description || '',
             category: category || 'To-Do',
             uid,
             timestamp: new Date().toISOString(),
           };
          const result = await taskCollection.insertOne(newTask);
          res.status(201).json(result);
        } catch (err) {
          res.status(500).json({ error: 'Failed to create task' });
        }
      }); 

    //   get user all the task
      app.get('/tasks', async (req, res) => {
        const { uid } = req.query;
        // 
        try {
          const tasks = await taskCollection.find({ uid }).toArray();
          res.json(tasks);
        } catch (err) {
          res.status(500).json({ error: 'Failed to fetch tasks' });
        }
      });




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