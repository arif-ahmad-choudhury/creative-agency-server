const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra')
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const app = express()

app.use(bodyParser.json()); 
app.use(cors());
app.use(express.static('service'));
app.use(fileUpload());

const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cfjij.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("creativeAgency").collection("services");
    const feedbackCollection = client.db("creativeAgency").collection("feedback");
    const adminCollection = client.db("creativeAgency").collection("admin");
    const orderCollection = client.db("creativeAgency").collection("order");

    console.log("Database connected");

    //add service from admin
    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        console.log(file, title, description);

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    //get service from admin
    app.get('/getService', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    // feedback post from customer
    app.post('/addReview', (req, res) => {
        const review = req.body;
        feedbackCollection.insertOne(review)
            .then(result => {
                res.send(result.insertedCount);
            })
    })
    // feedback get from customer
    app.get('/feedback', (req, res) => {
        feedbackCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    //makeAdmin from admin panel
    app.post('/makeAdmin', (req, res) => {
        const insertAdmin = req.body;
        adminCollection.insertOne(insertAdmin)
            .then(result => {
                res.send(result.insertedCount);
            })
    })

    //get Admin from admin panel
    app.get('/allAdmin', (req, res) => {
        adminCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    // add Order from customer
    app.post('/addOrder', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const project = req.body.project;
        const projectDetails = req.body.projectDetails;
        const price = req.body.price;
        const status = req.body.status;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        orderCollection.insertOne({ name, email, project, projectDetails, price, status, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })

    })
    // show Order to customer
    app.get('/showOrder', (req, res) => {
        orderCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // Show all Service list to admin 
    app.get('/adminShowServices', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
});


app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})


app.listen(process.env.PORT || port)