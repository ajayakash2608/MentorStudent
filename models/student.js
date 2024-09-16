const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
    previousMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }
});

module.exports = mongoose.model('Student', StudentSchema);
