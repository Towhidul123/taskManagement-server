const express = require('express');
const cors = require ('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app. use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dc6i71y.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   // await client.connect();


   const taskCollection = client.db("task_management").collection("task");


   app.post('/todo', async (req, res) => {
    try {
      const newTask = req.body;
      const result = await taskCollection.insertOne(newTask);

      console.log(`Inserted ${result.insertedCount} document(s) with id ${result.insertedId}`);
      res.status(201).json({ success: true, taskId: result.insertedId });
    } catch (error) {
      console.error('Error inserting document:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }

   })

   app.get('/todo', async (req, res) => {
    const cursor = taskCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  })

  app.delete('/todo/:id', async(req,res) =>{
    const id = req.params.id;
    console.log(req.params.id)
    const query = {_id: new ObjectId(id)}
    console.log(query);
   
    const result = await taskCollection.deleteOne(query);
    console.log(result);
    res.send(result);
  })
  

  //update

  app.put('/todo/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      
      const updatedTask = req.body; 
  
      const updateDocument = {
        $set: {
          title: updatedTask.title,
          description: updatedTask.description,
          deadline: updatedTask.deadline,
          priority: updatedTask.priority
        },
      };
  
      const result = await taskCollection.updateOne(filter, updateDocument);
  
      if (result.modifiedCount > 0) {
        console.log(`Updated task with id ${id}`);
        res.status(200).json({ success: true });
      } else {
        console.log(`No task found with id ${id}`);
        res.status(404).json({ success: false, error: 'Task not found' });
      }
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}


run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
  })
  
  app.listen(port, () => {
    console.log(`server is running on port: ${port} `)
  })