const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const URL = process.env.DB;
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
// Middleweare
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

let students = [];

let authenticate = function (req, res, next) {
  if (req.headers.authorization) {
   try {
    let verify = jwt.verify(req.headers.authorization, SECRET);
    if (verify) {
      req.userid = verify._id;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
   } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
   }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

app.post("/register", async function (req, res) {
  try {
    // Open the Connection
    const connection = await mongoClient.connect(URL);

    // Select the DB
    const db = connection.db("b35wd_tamil");

    // Select the Collection
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt);
    req.body.password = hash;
    await db.collection("users").insertOne(req.body);

    // Close the connection
    await connection.close();

    res.json({
      message: "Successfully Registered",
    });
  } catch (error) {
    res.json({
      message: "Error",
    });
  }
});

app.post("/login", async function (req, res) {
  try {
    // Open the Connection
    const connection = await mongoClient.connect(URL);

    // Select the DB
    const db = connection.db("b35wd_tamil");

    // Select the Collection
    const user = await db
      .collection("users")
      .findOne({ username: req.body.username });

    if (user) {
      const match = await bcryptjs.compare(req.body.password, user.password);
      if (match) {
        // Token
        const token = jwt.sign({ _id: user._id }, SECRET, { expiresIn: "1m" });
        res.json({
          message: "Successfully Logged In",
          token,
        });
      } else {
        res.status(401).json({
          message: "Password is incorrect",
        });
      }
    } else {
      res.status(401).json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/students", authenticate, async function (req, res) {
  try {
    // Open the Connection
    const connection = await mongoClient.connect(URL);

    // Select the DB
    const db = connection.db("b35wd_tamil");

    // Select the collection and do the operation
    let students = await db
      .collection("students")
      .find({ userid: mongodb.ObjectId(req.userid) })
      .toArray();

    // Close the connection
    await connection.close();

    res.json(students);
  } catch (error) {
    console.log(error);
  }
});

app.post("/student", authenticate, async function (req, res) {
  try {
    // Open the Connection
    const connection = await mongoClient.connect(URL);

    // Select the DB
    const db = connection.db("b35wd_tamil");

    // Select the collection and do the operation
    req.body.userid = mongodb.ObjectId(req.userid);
    await db.collection("students").insertOne(req.body);

    // Close the connection
    await connection.close();

    res.json({
      message: "Student added successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/student/:id", authenticate, async function (req, res) {
  try {
    // Open the Connection
    const connection = await mongoClient.connect(URL);

    // Select the DB
    const db = connection.db("b35wd_tamil");

    // Select the collection and do the operation
    let student = await db
      .collection("students")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    // Close the connection
    await connection.close();

    res.json(student);
  } catch (error) {
    console.log(error);
  }
});

app.put("/student/:id", authenticate, async function (req, res) {
  try {
    // Open the Connection
    const connection = await mongoClient.connect(URL);

    // Select the DB
    const db = connection.db("b35wd_tamil");

    // Select the collection and do the operation
    let student = await db
      .collection("students")
      .updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    // Close the connection
    await connection.close();

    res.json({
      message: "Student updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.delete("/student/:id", authenticate, async function (req, res) {
  try {
    // Open the Connection
    const connection = await mongoClient.connect(URL);

    // Select the DB
    const db = connection.db("b35wd_tamil");

    // Select the collection and do the operation
    let student = await db
      .collection("students")
      .deleteOne({ _id: mongodb.ObjectId(req.params.id) });

    // Close the connection
    await connection.close();

    res.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT || 3001);
Footer