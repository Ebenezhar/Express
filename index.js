const express = require('express');
const app = express();
const cors = require('cors');
const { application } = require('express');
app.use(express.json())
app.use(cors({
    orgin: 'http://localhost:3000'
}))


let students = [];
app.get("/students", function (req, res) {
    res.json(students);
})

app.post('/student', function (req, res) {
    students.push(req.body);
    req.body.id = students.length;
    res.json({ message: "File created successfully" })
})

app.get('/student/:id', function (req, res) {
    const id = req.params.id;
    console.log(id);
    const student = students.find((student) => student.id == id);
    console.log(student);
    res.json(student);
})

app.put('/student/:id', function (req, res) {
    let id = req.params.id;
    let studentIndex = students.findIndex(student => student.id == id);
    console.log(studentIndex);
    students[studentIndex].email = req.body.email;
    students[studentIndex].password = req.body.password;
    res.json('Success')
})

app.delete('/student/:id', function (req, res) {
    let id = req.params.id;
    console.log(id);
    let studentIndex = students.findIndex(student => student.id == id);
    students.splice(studentIndex, 1);
    res.json('Successfully deleted');
})
app.listen(3001)