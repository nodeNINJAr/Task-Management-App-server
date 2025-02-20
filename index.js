require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectToDatabase, getDb } = require("./database/db");
const http = require("http");
const { Server } = require("socket.io");
const { ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;



// Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log("MongoDB connection established");

    const db = getDb();
    const taskCollection = db.collection("tasks");
    // const userCollection = db.collection("users");

    // ** WebSocket Connection **
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // ** Post the data to task **
    app.post('/tasks', async (req, res) => {
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
              timestamp: new Date().toLocaleDateString(),
          };
  
          const result = await taskCollection.insertOne(newTask);
          res.status(201).json(result);
      } catch (err) {
          res.status(500).json({ error: 'Failed to create task' });
      }
  });
  
  
    // ** GET: Retrieve all tasks for a user **
    app.get('/tasks', async (req, res) => {
      const { uid } = req.query;
      try {
          const tasks = await taskCollection.find({ uid }).sort({ position: 1 }).toArray();
          res.json(tasks);
      } catch (err) {
          res.status(500).json({ error: 'Failed to fetch tasks' });
      }
  });
   
  // ** Update by user
   app.put('/tasks/:id', async(req,res)=>{
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
    app.put("/task/reorder", async (req, res) => {
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
    app.delete("/task/:id", async(req, res)=>{
      const id = req?.params?.id;
      const query = {_id : new ObjectId(id)}
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    })

  
    
    // ** Home Route **
    app.get("/", (req, res) => {
      res.send("Task management application server running");
    });

    // Start Server
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

// Start the Server
startServer();
