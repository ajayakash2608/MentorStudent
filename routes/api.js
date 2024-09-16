const express = require('express');
const router = express.Router();
const Mentor = require('../models/mentor');
const Student = require('../models/student');

router.post('/mentors', async (req, res) => {
    const { name, email } = req.body;

    try {
        const mentor = new Mentor({ name, email });
        await mentor.save();
        res.status(201).json({ message: 'Mentor created successfully!' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/students', async (req, res) => {
    const { name, email } = req.body;

    try {
        const student = new Student({ name, email });
        await student.save();
        res.status(201).json({ message: 'Student created successfully!' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/assign-student', async (req, res) => {
    const { studentId, mentorId } = req.body;

    try {
        const student = await Student.findById(studentId);
        const mentor = await Mentor.findById(mentorId);

        if (!student || !mentor) {
            return res.status(404).json({ message: 'Mentor or student not found' });
        }

        if (student.mentor) {
            return res.status(400).json({ message: 'Student already has a mentor' });
        }

        student.mentor = mentor._id;
        await student.save();

        mentor.students.push(student._id);
        await mentor.save();

        res.status(200).json({ message: 'Student assigned to mentor successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/change-mentor', async (req, res) => {
    const { studentId, newMentorId } = req.body;

    try {
        const student = await Student.findById(studentId);
        const newMentor = await Mentor.findById(newMentorId);

        if (!student || !newMentor) {
            return res.status(404).json({ message: 'Mentor or student not found' });
        }

        if (student.mentor) {
            const previousMentor = await Mentor.findById(student.mentor);
            previousMentor.students = previousMentor.students.filter(id => id.toString() !== student._id.toString());
            await previousMentor.save();

            student.previousMentor = student.mentor;
        }

        student.mentor = newMentor._id;
        await student.save();

        newMentor.students.push(student._id);
        await newMentor.save();

        res.status(200).json({ message: 'Mentor changed successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/mentor-students/:mentorId', async (req, res) => {
    const { mentorId } = req.params;

    try {
        const mentor = await Mentor.findById(mentorId).populate('students');

        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        res.status(200).json({ students: mentor.students });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/previous-mentor/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        const student = await Student.findById(studentId).populate('previousMentor');

        if (!student || !student.previousMentor) {
            return res.status(404).json({ message: 'Previous mentor not found' });
        }

        res.status(200).json({ previousMentor: student.previousMentor });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
