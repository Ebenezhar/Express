const express = require('express');
const app = express();
const cors = require('cors');
const bcryptjs = require('bcryptjs');
app.use(express.json());
app.use(cors({ orgin: '*' }))
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const dotenv = require('dotenv').config();
const URL = process.env.DB;
const jwt = require('jsonwebtoken');

let students = [];
let authenticate = function (req, res, next) {
        if (req.headers.authorization) {
        const verify = jwt.verify(req.headers.authorization, "process.env.SECRET_KEY");
        if (verify) {
            req.userid = verify._id;
            next();
        } else {
            res.status(401).json({ message: 'Unauthorized' })
        }
    } else {
        res.status(401).json({ message: 'Unauthorized' })
    }
}

app.post('/register', async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db('schoolManagement');
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        req.body.password = hash;
        await db.collection('users').insertOne(req.body);
        await connection.close();
        res.json({ message: "User created registered successfully" })
    } catch (error) {
        console.log(error);
    }
})

app.post('/login', async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db('schoolManagement');
        const user = await db.collection('users').findOne({ username: req.body.username });
        if (user) {
            const match = await bcryptjs.compare(req.body.password, user.password);
            if (match) {
                const token = jwt.sign({ _id: user._id }, "process.env.SECRET_KEY", { expiresIn: "30m" });
                res.status(200).json({
                    message: 'Successfully Logged in',
                    token: token,
                })
            } else {
                res.status(401).json({ message: 'Password Incorrect'});
            }
        }
        else {
            res.status(401).json({ message: 'User not found' })
        }
    } catch (error) {
        console.log(error);
    }
})

app.post('/student',authenticate, async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db('schoolManagement');
        req.body.userid = mongodb.ObjectId(req.userid);
        await db.collection('students').insertOne(req.body);
        await connection.close();
        res.json({ message: "File created successfully" })
    } catch (error) {
        console.log(error);
    }
})

app.get("/students", authenticate, async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db('schoolManagement');
        const students = await db.collection('students').find({ userid: mongodb.ObjectId(req.userid) }).toArray();
        await connection.close();
        res.status(200).json(students);
    } catch (error) {
        console.log(error);
    }
})

app.get('/student/:id',authenticate, async function (req, res) {
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

app.put('/student/:id',authenticate, async function (req, res) {
    try {
        console.log(req.params.id);
        const connection = await mongoClient.connect(URL);
        const db = connection.db('schoolManagement');
        delete req.body._id;
        const student = await db.collection('students')
            .updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });
        await connection.close();
        res.json({ message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})

app.delete('/student/:id',authenticate, async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db('schoolManagement')
        await db.collection('students').deleteOne({ _id: mongodb.ObjectId(req.params.id) })
        await connection.close();
        res.json({ message: 'successfully deleted' });
    } catch (error) {
        console.log(error);
    }
})
app.listen(process.env.PORT || 3001)