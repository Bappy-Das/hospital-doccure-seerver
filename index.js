const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()
var cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dl2nf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("conncect in async")
        const database = client.db("dronetastic");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");
        const userCollection = database.collection("users");
        const reviewCollection = database.collection("reviews");

        // Add new product
        app.post('/addservice', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product)
            res.json(result)
        })
        app.post('/addreview', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.json(result)
        })

        // Add user
        app.post('/adduser', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user)
            res.json(result)
        })

        app.put('/adduser', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updatedDoc = { $set: user }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.json(result)
        })

        // Make Admin
        app.put('/adduser/admin', async (req, res) => {
            const user = req.body;
            console.log(user)
            const filter = { email: user.adminEmail };
            console.log("filter", filter)
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result)
        })
        // get admin user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);

            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }

            res.send({ admin: isAdmin })
        })


        // get all products
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })


        // Post Order
        app.post('/purchaseorder', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.json(result)
        })
        // Get all Order

        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const services = await cursor.toArray();
            res.send(services)
        })

        // get single Product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await productCollection.findOne(query);
            res.json(service)
        })
        // Delete Order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: ObjectId(id) };
            const service = await orderCollection.deleteOne(query);
            res.json(service)
        })
        // Product Manage/delete Product
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: ObjectId(id) };
            const service = await productCollection.deleteOne(query);
            res.json(service)
        })
        // Update Status
        app.put('/updatestatus/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    'status': 'Approved'
                }
            };
            const result = await orderCollection.updateOne(query, updatedDoc, options);
            res.send(result)
        })

    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);










app.get('/', (req, res) => {
    res.send("Server Connected")
});
app.listen(port, () => {
    console.log("Connected from", port)
})