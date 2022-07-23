const express = require('express');
const app = express();
const cors = require('cors');
const { request } = require('express');
app.use(express.json());
app.use(cors({ orgin: 'https://animated-gingersnap-40629f.netlify.app/' }))
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const dotenv = require('dotenv').config();
const URL = process.env.DB;

let students = [];



app.post('/student', async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db('schoolManagement');
        await db.collection('students').insertOne(req.body);
        await connection.close();
        res.json({ message: "File created successfully" })
    } catch (error) {
        console.log(error);
    }
})

app.get("/students", async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db('schoolManagement');
        const students = await db.collection('students').find().toArray();
        await connection.close();
        res.json(students);
    } catch (error) {
        console.log(error);
    }

})

app.get('/student/:id', async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db('schoolManagement');
        const student = await db.collection('students').findOne({ _id: mongodb.ObjectId(req.params.id) });
        await connection.close();
        res.json(student);
    } catch (error) {
        console.log(error);
    }
})

app.put('/student/:id', async function (req, res) {
    try {
        console.log(req.params.id);
        const connection=  await mongoClient.connect(URL);
        const db = connection.db('schoolManagement');
        delete req.body._id;
        const student = await db.collection('students')
        .updateOne({_id:mongodb.ObjectId(req.params.id)},{ $set: req.body});
        await connection.close();
        res.json({message: "Successfully updated"})
    } catch (error) {
        console.log(error);
    }
})

app.delete('/student/:id', async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db('schoolManagement')
        await db.collection('students').deleteOne({ _id: mongodb.ObjectId(req.params.id) })
        await connection.close();
        res.json({message:'successfully deleted'});
    } catch (error) {
        console.log(error);
    }

})
app.listen(process.env.PORT || 3001)