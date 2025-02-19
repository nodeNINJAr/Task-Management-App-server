require('dotenv').config();
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
// server
const app = express();


// middleware
app.use(cors());
app.use(express.json());









// 
app.get('/', (req,res)=>{
  res.send('task management application server running')
})

app.listen(port,()=>{
    console.log(`Task Management Application server is running on port ${port}`);
})