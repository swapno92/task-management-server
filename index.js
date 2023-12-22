const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_Pass}@cluster0.hktnvnf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const tasksCollection = client.db('management').collection('task')

    app.get('/tasks',  async (req, res) => {
      const result = await tasksCollection.find().toArray();
      res.send(result);
    });

    app.get("/myTasks/:email",  async (req, res) => {
      const email = req.params.email;
      const cursor = tasksCollection.find({ email: email });
      const result = await cursor.toArray();
      res.send(result);
    });

     app.post('/tasks', async (req, res) => {
       const newTasks = req.body;
       const result = await tasksCollection.insertOne(newTasks);
       res.send(result);
     });

     app.get('/tasks/:id', async (req, res) => {
       const id = req.params.id;
       const query = { _id: new ObjectId(id) };
       const result = await tasksCollection.findOne(query);
       res.send(result);
     });

    //  app.patch("/tasks/:id", async (req, res) => {
    //    const task = req.body;
    //    const id = req.params.id;
    //    const filter = { _id: new ObjectId(id) };
    //    const updateTask = {
    //      $set: {
    //        title: task.title,
    //        description: task.description,
    //        deadline: task.deadline,
    //        priority: task.priority,
    //      },
    //    };
    //    const result = await tasksCollection.updateOne(filter, updateTask);
    //    res.send(result);
    //  });

    
    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTask = req.body;
      const task = {
        $set: {
          title: updateTask.title,
          deadline: updateTask.deadline,
          priority: updateTask.priority,
          description: updateTask.description,
        },
      };
      const result = await tasksCollection.updateOne(
        filter,
        task,
        options
      );
      res.send(result);
    });

      app.delete('/tasks/:id',  async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await tasksCollection.deleteOne(query);
        res.send(result);
      });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('management web is running')
})

app.listen(port, () =>{
    console.log(`running on port ${port}`)
})