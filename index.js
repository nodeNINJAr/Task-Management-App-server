require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectToDatabase, getDb } = require("./database/db");
const http = require("http");
const { Server } = require("socket.io");
const { ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');




// Express app and HTTP server
const app = express();

// ** Middleware **
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://task-manager-c5ec9.web.app",
      "https://task-manager-c5ec9.firebaseapp.com",
      "https://taskly-tm.netlify.app"
    ],
    credentials: true,
  })
);

  // ** HTTP Server and WebSocket **
  const server = http.createServer(app);
  const io = new Server(server, {
    cors:({
      origin: [
        "http://localhost:5173",
        "https://task-manager-c5ec9.web.app",
        "https://task-manager-c5ec9.firebaseapp.com",
        "https://taskly-tm.netlify.app"
      ],
      credentials: true,
    })
  });

app.use(express.json());
app.use(cookieParser());

// 

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log("MongoDB connection established");

    const db = getDb();
    const taskCollection = db.collection("tasks");
    const userCollection = db.collection("users");

    // ** WebSocket Connection **
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);
  
      // 
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });



  // **  middleware for user verify **
  const verifyToken = async(req,res, next)=>{
    const token = req?.cookies?.token;
    // validate if token is not available
    if(!token){
      return res.status(401).json({message:'Access denied. No token provided.'})
    }
    // verify if token have than sent,if not than err
    try{
      const decoded = jwt.verify(token,process.env.SECRET_KEY);
      req.user = decoded;
      next()
    }
    catch(err){
      return res.status(401).json(({ message: 'Invalid or expired token.' }));
    }

  }


   // **  Post User info to db
   app.post('/users', async(req,res)=>{
    const userInfo = req.body;
    const isExist = await userCollection.findOne({email:userInfo?.email});
     if(isExist) return res.status(403).send({message:"user conflicted"})
    const result = await userCollection.insertOne(userInfo);
    res.send(result);
  }) 


    // ** Post the data to task **
    app.post('/tasks',verifyToken, async (req, res) => {
      // 
      try {
          const { title, description, category, uid } = req.body;
          if (!title || title.length > 50) {
              return res.status(400).json({ error: 'Title is required and must be less than 50 characters' });
          }
  
          if (description && description.length > 200) {
              return res.status(400).json({ error: 'Description must be less than 200 characters' });
          }
          // Fetch the highest position in the given category
          const lastTask = await taskCollection.find({ category }).sort({ position: -1 }).limit(1).toArray();
          const lastPosition = lastTask.length > 0 ? lastTask[0].position : 0;
  
          const newTask = {
              title,
              description: description || '',
              category: category || 'To-Do',
              uid,
              position: parseInt(lastPosition) + 1, // Set the next available position
              timestamp: new Date(),
          };
  
          const result = await taskCollection.insertOne(newTask);
          res.status(201).json(result);
      } catch (err) {
          res.status(500).json({ error: 'Failed to create task' });
      }
  });
   

    // ** GET: Retrieve all tasks for a user **
    app.get('/tasks',verifyToken, async (req, res) => {
      const { uid } = req.query;
      const verifiedUid = req?.user?.uid;
      //  check is user is real by login
       if(uid !== verifiedUid){
            return res.status(403).send({message:"Forbidden Access"})
       }
      // 
      try {
          const tasks = await taskCollection.find({ uid }).sort({position:1}).toArray();
          res.json(tasks);
      } catch (err) {
          res.status(500).json({ error: 'Failed to fetch tasks' });
      }
  });
   
  // ** Update by user
   app.put('/tasks/:id',verifyToken, async(req,res)=>{
       const id = req?.params?.id;
       const filter = {_id: new ObjectId(id)};
       const taskData = req?.body;
       //  
       const update = {
        $set: {
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
        },
      };
      const result = await taskCollection.updateOne(filter, update);
      res.send(result)
     
   })


    // ** Update Order **
    app.put("/task/reorder",verifyToken, async (req, res) => {
      try {
        const { tasks } = req.body;
        // 
        if (!tasks || !Array.isArray(tasks)) {
          return res.status(400).json({ error: "Invalid task data" });
        }
    
        const bulkUpdates = tasks.map((task) => ({
          updateOne: {
            filter: { _id: new ObjectId(task._id) }, 
            update: { $set: { position: task.position, category: task.category } },
          },
        }));
    
        if (bulkUpdates.length === 0) {
          return res.status(400).json({ error: "No valid tasks to update" });
        }
    
        await taskCollection.bulkWrite(bulkUpdates);
        io.emit("task-updated"); 
        res.json({ message: "Tasks reordered successfully" });
    
      } catch (err) {
        console.error("Error updating task order:", err);
        res.status(500).json({ error: "Failed to reorder tasks" });
      }
    });



    // ** Delete Task
    app.delete("/task/:id",verifyToken, async(req, res)=>{
      const id = req?.params?.id;
      const query = {_id : new ObjectId(id)}
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    })

  

   // **Login route to jwt **
    app.post('/login', async(req, res) => {
      const userInfo = req.body;
      // authentication
      if (!userInfo?.email || !userInfo?.uid) {
         return  res.status(401).json({ message: 'Invalid credentials' });
      }
    const token = jwt.sign(userInfo, process.env.SECRET_KEY, { expiresIn: '1d' });
     // Set the JWT in a cookie
     res.cookie('token', token,
       { httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
      }).send({ message: 'Logged in successfully' })
      
    });


    // Logout route
    app.post('/logout', (req, res) => {
      // Clear the token cookie
      res.clearCookie('token');
      res.json({ message: 'Logged out successfully' });
    });


    
    // ** Home Route **
    app.get("/", (req, res) => {
      res.send("Task management application server running");
    });

    // Start Server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

// Start the Server
startServer();
