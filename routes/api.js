const express = require('express');
const router = express.Router();
const Mentor = require('../models/mentorModel');
const Student = require('../models/studentModel');

router.post('/mentor', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }
        const newMentor = new Mentor({ name, email });
        await newMentor.save();
        res.status(201).json({ message: 'Mentor created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/student', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }
        const newStudent = new Student({ name, email });
        await newStudent.save();
        res.status(201).json({ message: 'Student created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/assign-student', async (req, res) => {
    try {
        const { studentId, mentorId } = req.body;
        if (!studentId || !mentorId) {
            return res.status(400).json({ message: 'Student ID and Mentor ID are required' });
        }

        const student = await Student.findById(studentId);
        const mentor = await Mentor.findById(mentorId);

        if (!student || !mentor) {
            return res.status(404).json({ message: 'Student or Mentor not found' });
        }

        if (student.mentor) {
            return res.status(400).json({ message: 'Student already assigned to a mentor' });
        }

        student.mentor = mentorId;
        await student.save();
        res.status(200).json({ message: 'Student assigned to mentor successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/change-mentor', async (req, res) => {
    try {
        const { studentId, newMentorId } = req.body;
        if (!studentId || !newMentorId) {
            return res.status(400).json({ message: 'Student ID and new Mentor ID are required' });
        }

        const student = await Student.findById(studentId);
        const newMentor = await Mentor.findById(newMentorId);

        if (!student || !newMentor) {
            return res.status(404).json({ message: 'Student or Mentor not found' });
        }

        if (student.mentor) {
            const previousMentor = await Mentor.findById(student.mentor);
            if (previousMentor) {
                previousMentor.students.pull(studentId);
                await previousMentor.save();
            }
        }

        student.mentor = newMentorId;
        await student.save();

        newMentor.students.push(studentId);
        await newMentor.save();

        res.status(200).json({ message: 'Mentor updated for student successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/mentor/:mentorId/students', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const mentor = await Mentor.findById(mentorId).populate('students');
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }
        res.status(200).json(mentor.students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/student/:studentId/previous-mentor', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId).populate('mentor');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (!student.mentor) {
            return res.status(404).json({ message: 'No mentor assigned' });
        }
        res.status(200).json(student.mentor);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
