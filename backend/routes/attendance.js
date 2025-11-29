const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Get student attendance statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userRole = req.user.role || 'student';
    const userId = req.user.userId;
    
    const stats = await Attendance.getStats(userId, userRole);
    
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance statistics'
    });
  }
});

// Get attendance records for a student
router.get('/records', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role || 'student';
    
    let records;
    if (userRole === 'student') {
      // Student sees their own records
      records = await Attendance.getStudentRecords(userId);
    } else {
      // Teachers and admins can see records (could be filtered by query params)
      const studentId = req.query.studentId;
      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required for teachers and admins'
        });
      }
      records = await Attendance.getStudentRecords(studentId);
    }

    res.json({
      success: true,
      records
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records'
    });
  }
});

// Mark attendance (teacher only)
router.post('/mark', auth, async (req, res) => {
  try {
    const { studentId, status, date, className, notes } = req.body;
    
    // Validate that user is a teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'college_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and admins can mark attendance'
      });
    }

    // Validate required fields
    if (!studentId || !status || !date || !className) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate status
    const validStatuses = ['present', 'absent', 'late', 'excused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: present, absent, late, excused'
      });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Create attendance record
    const attendance = new Attendance({
      student: studentId,
      className,
      date: new Date(date),
      status,
      markedBy: req.user.userId,
      notes: notes || ''
    });

    await attendance.save();
    await attendance.populate('student', 'username');
    await attendance.populate('markedBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: {
        id: attendance._id,
        student: attendance.student.username,
        className: attendance.className,
        date: attendance.date.toISOString().split('T')[0],
        status: attendance.status,
        markedBy: attendance.markedBy.username,
        notes: attendance.notes
      }
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    
    // Handle duplicate key error (already marked for this date/class)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this student on this date for this class'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error marking attendance'
    });
  }
});

module.exports = router;
