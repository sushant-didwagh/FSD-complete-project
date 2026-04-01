const express = require('express');
const router = express.Router();
const {
  getPendingMentors,
  approveMentor,
  rejectMentor,
  getAllUsers,
  getStats,
  getAllStudents,
  getAllMentors,
  deleteUser,
  getMentorDocument
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All admin routes are protected and require 'admin' role
router.use(protect, authorize('admin'));

// Stats
router.get('/stats', getStats);
router.get('/users', getAllUsers); // backward compatible

// Students
router.get('/students', getAllStudents);

// Mentors
router.get('/mentors', getAllMentors);
router.get('/mentors/pending', getPendingMentors);
router.put('/mentors/:id/approve', approveMentor);
router.put('/mentors/:id/reject', rejectMentor);
router.get('/mentors/:id/document', getMentorDocument);

// Delete user
router.delete('/users/:id', deleteUser);

module.exports = router;
