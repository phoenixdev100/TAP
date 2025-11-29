const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const User = require('../models/User');

// Get assignment statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userRole = req.user.role || 'student';
    const userId = req.user.userId;
    
    const stats = await Assignment.getStats(userId, userRole);
    
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment statistics'
    });
  }
});

// Get assignments list
router.get('/', auth, async (req, res) => {
  try {
    const userRole = req.user.role || 'student';
    const userId = req.user.userId;
    let assignments;

    if (userRole === 'student') {
      // Student sees assignments assigned to them
      assignments = await Assignment.find({ 
        assignedTo: userId,
        status: 'published'
      }).populate('createdBy', 'username').sort({ dueDate: 1 });
      
      // Format for student view
      assignments = assignments.map(assignment => {
        const submission = assignment.submissions.find(sub => sub.student.toString() === userId.toString());
        return {
          id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate.toISOString().split('T')[0],
          status: submission ? 'completed' : 'pending',
          score: submission?.score || null,
          className: assignment.className,
          submittedAt: submission?.submittedAt
        };
      });
      
    } else if (userRole === 'teacher') {
      // Teacher sees assignments they created
      assignments = await Assignment.find({ 
        createdBy: userId,
        status: 'published'
      }).populate('assignedTo', 'username').sort({ createdAt: -1 });
      
      // Format for teacher view
      assignments = assignments.map(assignment => ({
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate.toISOString().split('T')[0],
        className: assignment.className,
        totalSubmissions: assignment.submissions.length,
        gradedSubmissions: assignment.submissions.filter(sub => sub.score !== undefined).length,
        pendingGrading: assignment.submissions.filter(sub => sub.score === undefined).length
      }));
      
    } else {
      // Admin sees all assignments
      assignments = await Assignment.find({ 
        status: 'published'
      }).populate('createdBy', 'username').sort({ createdAt: -1 });
      
      // Format for admin view
      assignments = assignments.map(assignment => ({
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate.toISOString().split('T')[0],
        className: assignment.className,
        teacher: assignment.createdBy.username,
        totalSubmissions: assignment.submissions.length
      }));
    }

    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments'
    });
  }
});

// Create assignment (teacher/admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, className, assignedTo } = req.body;
    
    // Validate permissions
    if (req.user.role !== 'teacher' && req.user.role !== 'college_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and admins can create assignments'
      });
    }

    // Validate required fields
    if (!title || !description || !dueDate || !className) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Create assignment
    const assignment = new Assignment({
      title,
      description,
      dueDate: new Date(dueDate),
      className,
      createdBy: req.user.userId,
      assignedTo: assignedTo || [],
      status: 'published'
    });

    await assignment.save();
    await assignment.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment: {
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate.toISOString().split('T')[0],
        className: assignment.className,
        createdBy: assignment.createdBy.username
      }
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assignment'
    });
  }
});

// Submit assignment (student only)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { submissionText } = req.body;
    
    // Validate that user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit assignments'
      });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if assignment is published
    if (assignment.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Assignment is not available for submission'
      });
    }

    // Check if student is assigned to this assignment
    if (assignment.assignedTo.length > 0 && !assignment.assignedTo.includes(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this assignment'
      });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === req.user.userId.toString()
    );
    
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Assignment already submitted'
      });
    }

    // Add submission
    assignment.submissions.push({
      student: req.user.userId,
      content: submissionText,
      submittedAt: new Date()
    });

    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assignment'
    });
  }
});

module.exports = router;
