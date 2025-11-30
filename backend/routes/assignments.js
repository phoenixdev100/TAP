const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const User = require('../models/User');

// Input validation and sanitization helper
const validateAndSanitize = {
  // Sanitize string inputs
  string: (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, maxLength);
  },
  
  // Validate and sanitize ObjectId
  objectId: (input) => {
    if (!mongoose.Types.ObjectId.isValid(input)) return null;
    return input;
  },
  
  // Validate date
  date: (input) => {
    const date = new Date(input);
    return isNaN(date.getTime()) ? null : date;
  },
  
  // Validate array of ObjectIds
  objectIdArray: (input) => {
    if (!Array.isArray(input)) return [];
    return input.filter(id => mongoose.Types.ObjectId.isValid(id));
  },
  
  // Validate role
  role: (input) => {
    const validRoles = ['student', 'teacher', 'college_admin'];
    return validRoles.includes(input) ? input : 'student';
  },
  
  // Validate numeric input
  number: (input, min = 0, max = 100) => {
    const num = parseInt(input);
    return isNaN(num) || num < min || num > max ? null : num;
  }
};

// Get assignment statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userRole = validateAndSanitize.role(req.user.role);
    const userId = validateAndSanitize.objectId(req.user.userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
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

// Get assignments list (role-based access)
router.get('/', auth, async (req, res) => {
  try {
    const userRole = validateAndSanitize.role(req.user.role);
    const userId = validateAndSanitize.objectId(req.user.userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
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
          className: assignment.className,
          status: assignment.status,
          submission: submission ? {
            submittedAt: submission.submittedAt,
            status: submission.status,
            score: submission.score
          } : null
        };
      });
    } else if (userRole === 'teacher' || userRole === 'college_admin') {
      // Teachers see assignments they created
      // Admins see all assignments
      const query = userRole === 'teacher' 
        ? { createdBy: userId }
        : {};
        
      assignments = await Assignment.find(query)
        .populate('createdBy', 'username')
        .populate('assignedTo', 'username email')
        .sort({ createdAt: -1 });
        
      // Format for teacher/admin view
      assignments = assignments.map(assignment => ({
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate.toISOString().split('T')[0],
        className: assignment.className,
        status: assignment.status,
        createdBy: assignment.createdBy,
        assignedTo: assignment.assignedTo,
        submissionsCount: assignment.submissions.length,
        createdAt: assignment.createdAt
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
    if (!['teacher', 'college_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and admins can create assignments'
      });
    }

    // Validate and sanitize inputs
    const sanitizedTitle = validateAndSanitize.string(title, 200);
    const sanitizedDescription = validateAndSanitize.string(description, 2000);
    const sanitizedDueDate = validateAndSanitize.date(dueDate);
    const sanitizedClassName = validateAndSanitize.string(className, 100);
    const sanitizedAssignedTo = validateAndSanitize.objectIdArray(assignedTo);
    const createdBy = validateAndSanitize.objectId(req.user.userId);

    // Validate required fields
    if (!sanitizedTitle || !sanitizedDescription || !sanitizedDueDate || !sanitizedClassName || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided and valid'
      });
    }

    // Create assignment
    const assignment = new Assignment({
      title: sanitizedTitle,
      description: sanitizedDescription,
      dueDate: sanitizedDueDate,
      className: sanitizedClassName,
      createdBy: createdBy,
      assignedTo: sanitizedAssignedTo,
      status: 'published'
    });

    await assignment.save();

    // Populate and return
    await assignment.populate('createdBy', 'username');
    await assignment.populate('assignedTo', 'username email');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assignment'
    });
  }
});

// Submit assignment
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const assignmentId = validateAndSanitize.objectId(req.params.id);
    const { submissionText, fileData, fileName, fileType } = req.body;
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!assignmentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID or user ID'
      });
    }

    // Validate permissions (students only)
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit assignments'
      });
    }

    // Validate and sanitize inputs
    const sanitizedSubmissionText = validateAndSanitize.string(submissionText, 5000);
    const sanitizedFileName = validateAndSanitize.string(fileName, 255);
    const sanitizedFileType = validateAndSanitize.string(fileType, 50);

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if student is assigned to this assignment
    if (!assignment.assignedTo.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this assignment'
      });
    }

    // Check due date
    if (new Date() > assignment.dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Assignment submission deadline has passed'
      });
    }

    // Remove any existing submission by this student
    assignment.submissions = assignment.submissions.filter(
      sub => sub.student.toString() !== userId
    );

    // Add new submission
    const submission = {
      student: userId,
      submittedAt: new Date(),
      status: 'submitted'
    };

    if (sanitizedSubmissionText) {
      submission.text = sanitizedSubmissionText;
    }

    if (fileData && sanitizedFileName && sanitizedFileType) {
      // Validate file data (in a real implementation, you'd handle file upload properly)
      submission.fileData = fileData;
      submission.fileName = sanitizedFileName;
      submission.fileType = sanitizedFileType;
    }

    assignment.submissions.push(submission);
    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assignment'
    });
  }
});

// Update assignment (teacher/admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const assignmentId = validateAndSanitize.objectId(req.params.id);
    const { title, description, dueDate, className, assignedTo } = req.body;
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!assignmentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID or user ID'
      });
    }

    // Validate permissions
    if (!['teacher', 'college_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and admins can update assignments'
      });
    }

    // Validate and sanitize inputs
    const sanitizedTitle = validateAndSanitize.string(title, 200);
    const sanitizedDescription = validateAndSanitize.string(description, 2000);
    const sanitizedDueDate = validateAndSanitize.date(dueDate);
    const sanitizedClassName = validateAndSanitize.string(className, 100);
    const sanitizedAssignedTo = validateAndSanitize.objectIdArray(assignedTo);

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check permissions (teachers can only update their own assignments)
    if (req.user.role === 'teacher' && assignment.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own assignments'
      });
    }

    // Update assignment
    if (sanitizedTitle) assignment.title = sanitizedTitle;
    if (sanitizedDescription) assignment.description = sanitizedDescription;
    if (sanitizedDueDate) assignment.dueDate = sanitizedDueDate;
    if (sanitizedClassName) assignment.className = sanitizedClassName;
    if (sanitizedAssignedTo) assignment.assignedTo = sanitizedAssignedTo;

    await assignment.save();

    // Populate and return
    await assignment.populate('createdBy', 'username');
    await assignment.populate('assignedTo', 'username email');

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assignment'
    });
  }
});

// Delete assignment (teacher/admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const assignmentId = validateAndSanitize.objectId(req.params.id);
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!assignmentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID or user ID'
      });
    }

    // Validate permissions
    if (!['teacher', 'college_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and admins can delete assignments'
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

    // Check permissions (teachers can only delete their own assignments)
    if (req.user.role === 'teacher' && assignment.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own assignments'
      });
    }

    await Assignment.findByIdAndDelete(assignmentId);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting assignment'
    });
  }
});

// Grade assignment (teacher/admin only)
router.post('/:id/grade/:studentId', auth, async (req, res) => {
  try {
    const assignmentId = validateAndSanitize.objectId(req.params.id);
    const studentId = validateAndSanitize.objectId(req.params.studentId);
    const { score, feedback } = req.body;
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!assignmentId || !studentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IDs provided'
      });
    }

    // Validate permissions
    if (!['teacher', 'college_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and admins can grade assignments'
      });
    }

    // Validate and sanitize inputs
    const sanitizedScore = validateAndSanitize.number(score, 0, 100);
    const sanitizedFeedback = validateAndSanitize.string(feedback, 1000);

    if (sanitizedScore === null) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 0 and 100'
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

    // Check permissions (teachers can only grade their own assignments)
    if (req.user.role === 'teacher' && assignment.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only grade your own assignments'
      });
    }

    // Find student submission
    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found for this student'
      });
    }

    // Update submission with grade
    submission.score = sanitizedScore;
    submission.feedback = sanitizedFeedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();

    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment graded successfully',
      submission
    });
  } catch (error) {
    console.error('Error grading assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error grading assignment'
    });
  }
});

// Update assignment status (teacher/admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const assignmentId = validateAndSanitize.objectId(req.params.id);
    const { status } = req.body;
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!assignmentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID or user ID'
      });
    }

    // Validate permissions
    if (!['teacher', 'college_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and admins can update assignment status'
      });
    }

    // Validate status
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
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

    // Check permissions (teachers can only update their own assignments)
    if (req.user.role === 'teacher' && assignment.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own assignments'
      });
    }

    // Update status
    assignment.status = status;
    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment status updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assignment status'
    });
  }
});

// Get assignment details
router.get('/:id', auth, async (req, res) => {
  try {
    const assignmentId = validateAndSanitize.objectId(req.params.id);
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!assignmentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID or user ID'
      });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    if (userRole === 'student') {
      // Students can only see assignments assigned to them
      if (!assignment.assignedTo.some(id => id.toString() === userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      // Remove other students' submissions
      assignment.submissions = assignment.submissions.filter(
        sub => sub.student.toString() === userId
      );
    } else if (userRole === 'teacher') {
      // Teachers can only see their own assignments
      if (assignment.createdBy._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    // Admins can see all assignments

    res.json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment details'
    });
  }
});

// Get student's submission for an assignment
router.get('/:id/submission/:studentId', auth, async (req, res) => {
  try {
    const assignmentId = validateAndSanitize.objectId(req.params.id);
    const studentId = validateAndSanitize.objectId(req.params.studentId);
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!assignmentId || !studentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IDs provided'
      });
    }

    // Validate permissions
    if (!['teacher', 'college_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and admins can view submissions'
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

    // Check permissions (teachers can only view submissions for their own assignments)
    if (req.user.role === 'teacher' && assignment.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view submissions for your own assignments'
      });
    }

    // Find student submission
    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found for this student'
      });
    }

    // Get student details
    const student = await User.findById(studentId, 'username email');

    res.json({
      success: true,
      submission: {
        ...submission.toObject(),
        student
      }
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission'
    });
  }
});

module.exports = router;
