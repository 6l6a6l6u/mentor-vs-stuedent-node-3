// index.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// index.js

// ...

// Connect to MongoDB
mongoose.connect('mongodb://localhost/mentor_student_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
// index.js

// ...

// Define Mentor Schema
const mentorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  });
  
  // Define Student Schema
  const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  });
  
  // Create Mentor and Student models
  const Mentor = mongoose.model('Mentor', mentorSchema);
  const Student = mongoose.model('Student', studentSchema);
// index.js

// ...

// API to create a mentor
app.post('/mentors', (req, res) => {
    const { name } = req.body;
    const mentor = new Mentor({ name });
  
    mentor.save((err, savedMentor) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create mentor' });
      } else {
        res.status(200).json(savedMentor);
      }
    });
  });
// index.js

// ...

// API to create a student
app.post('/students', (req, res) => {
    const { name } = req.body;
    const student = new Student({ name });
  
    student.save((err, savedStudent) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create student' });
      } else {
        res.status(200).json(savedStudent);
      }
    });
  });
// index.js

// ...

// API to assign a student to a mentor
app.put('/mentors/:mentorId/students/:studentId', (req, res) => {
    const { mentorId, studentId } = req.params;
  
    Mentor.findByIdAndUpdate(
      mentorId,
      { $addToSet: { students: studentId } },
      { new: true },
      (err, updatedMentor) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to assign student to mentor' });
        } else {
          Student.findByIdAndUpdate(
            studentId,
            { mentor: mentorId },
            { new: true },
            (err, updatedStudent) => {
              if (err) {
                console.error(err);
                res
                  .status(500)
                  .json({ error: 'Failed to update student with mentor' });
              } else {
                res.status(200).json(updatedStudent);
              }
            }
          );
        }
      }
    );
  });
// index.js

// ...

// API to assign or change mentor for a student
app.put('/students/:studentId/mentor/:mentorId', (req, res) => {
    const { studentId, mentorId } = req.params;
  
    Mentor.findById(mentorId, (err, mentor) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to find mentor' });
      } else if (!mentor) {
        res.status(404).json({ error: 'Mentor not found' });
      } else {
        Student.findByIdAndUpdate(
          studentId,
          { mentor: mentorId },
          { new: true },
          (err, updatedStudent) => {
            if (err) {
              console.error(err);
              res
                .status(500)
                .json({ error: 'Failed to update student with mentor' });
            } else {
              res.status(200).json(updatedStudent);
            }
          }
        );
      }
    });
  });
// index.js

// ...

// API to show all students for a mentor
app.get('/mentors/:mentorId/students', (req, res) => {
    const { mentorId } = req.params;
  
    Mentor.findById(mentorId)
      .populate('students')
      .exec((err, mentor) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to find mentor' });
        } else if (!mentor) {
          res.status(404).json({ error: 'Mentor not found' });
        } else {
          res.status(200).json(mentor.students);
        }
      });
  });
// index.js

// ...

// API to show the previously assigned mentor for a student
app.get('/students/:studentId/mentor', (req, res) => {
    const { studentId } = req.params;
  
    Student.findById(studentId)
      .populate('mentor')
      .exec((err, student) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to find student' });
        } else if (!student) {
          res.status(404).json({ error: 'Student not found' });
        } else {
          res.status(200).json(student.mentor);
        }
      });
  });
              