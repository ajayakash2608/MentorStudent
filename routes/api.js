const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const Mentor = require('../models/mentor');

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

router.post('/mentor', async (req, res) => {
    try {
        const { name, email } = req.body;
        const mentor = new Mentor({ name, email });
        await mentor.save();
        res.status(201).json({ message: 'Mentor created successfully', mentor });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/student', async (req, res) => {
    try {
        const { name, email } = req.body;
        const student = new Student({ name, email });
        await student.save();
        res.status(201).json({ message: 'Student created successfully', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/assign-student', async (req, res) => {
    try {
        const { studentId, mentorId } = req.body;

        if (!isValidObjectId(studentId) || !isValidObjectId(mentorId)) {
            return res.status(400).json({ message: 'Invalid Student ID or Mentor ID' });
        }

        const student = await Student.findById(studentId);
        const mentor = await Mentor.findById(mentorId);

        if (!student || !mentor) {
            return res.status(404).json({ message: 'Student or Mentor not found' });
        }

        if (student.mentor) {
            return res.status(400).json({ message: 'Student is already assigned to a mentor' });
        }

        student.mentor = mentorId;
        mentor.students.push(studentId);

        await student.save();
        await mentor.save();

        res.status(200).json({ message: 'Student assigned to mentor successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/change-mentor', async (req, res) => {
    try {
        const { studentId, mentorId } = req.body;

        if (!isValidObjectId(studentId) || !isValidObjectId(mentorId)) {
            return res.status(400).json({ message: 'Invalid Student ID or Mentor ID' });
        }

        const student = await Student.findById(studentId);
        const newMentor = await Mentor.findById(mentorId);

        if (!student || !newMentor) {
            return res.status(404).json({ message: 'Student or Mentor not found' });
        }

        if (student.mentor) {
            const oldMentor = await Mentor.findById(student.mentor);
            oldMentor.students.pull(studentId);
            await oldMentor.save();
        }

        student.mentor = mentorId;
        newMentor.students.push(studentId);

        await student.save();
        await newMentor.save();

        res.status(200).json({ message: 'Mentor changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/mentor/:mentorId/students', async (req, res) => {
    try {
        const { mentorId } = req.params;

        if (!isValidObjectId(mentorId)) {
            return res.status(400).json({ message: 'Invalid Mentor ID' });
        }

        const mentor = await Mentor.findById(mentorId).populate('students');

        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        res.status(200).json(mentor.students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/student/:studentId/mentor', async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!isValidObjectId(studentId)) {
            return res.status(400).json({ message: 'Invalid Student ID' });
        }

        const student = await Student.findById(studentId).populate('mentor');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(student.mentor);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
