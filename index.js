const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.suh58.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

async function run() {
    try{
        await client.connect();
        const database = client.db('tour_sphere');
        const eventCollection = database.collection('events');
        const bookCollection = database.collection('booking');

        //Get event api
        app.get('/events',async(req,res)=>{
            const cursor = eventCollection.find({});
            const events = await cursor.toArray();
            res.send(events);
        })

        // addEvent
        app.post('/addEvent',(req,res) =>{
            const newEvent = req.body;
             eventCollection.insertOne(newEvent).then((result) =>{
                 res.send(result.insertedId>0);
             })
        })

        // deleteproduct
        app.delete('/deleteEvent/:id',async (req,res)=>{
            eventCollection.deleteOne({ _id: ObjectID(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
        });

        // update 
        app.patch('/update/:id', (req, res) => {
            eventCollection.updateOne({ _id: ObjectID(req.params.id) },
                {
                    $set: { eventName: req.body.eventName, eventPrice: req.body.eventPrice, eventDuration: req.body.eventDuration, image: req.body.image }
                })
                .then(result => {
                    res.send(result.modifiedCount > 0)
                })
        })

        app.post('/addOrder', (req, res) => {
            const newOrder = req.body;
            console.log('adding new order: ', newOrder)
            bookCollection.insertOne(newOrder)
                .then(result => {
                    console.log('inserted count', result.insertedCount);
                    res.send(result.insertedCount > 0)
                })
        })
        app.get('/bookings', (req, res) => {
            bookCollection.find({ email: req.query.email })
                .toArray((err, items) => {
                    res.send(items)
                })
        })

        app.get('/orders', (req, res) => {
            bookCollection.find()
                .toArray((err, items) => {
                    res.send(items)
                })
        })
    }
    finally{

    }
}
run().catch(console.dir);
app.get('/',(req, res)=>{
    res.send('Server Running');
});
app.listen(port, () =>{
    console.log('server running at port',port)
}) 