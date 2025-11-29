const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
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

// Get assignments list (role-based access)
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
          submittedAt: submission?.submittedAt,
          submissionFile: submission?.fileUrl || null
        };
      });
      
    } else if (userRole === 'teacher') {
      // Teacher sees assignments they created
      assignments = await Assignment.find({ 
        createdBy: userId,
        status: 'published'
      }).populate('assignedTo', 'username').populate('submissions.student', 'username').sort({ createdAt: -1 });
      
      // Format for teacher view
      assignments = assignments.map(assignment => ({
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate.toISOString().split('T')[0],
        className: assignment.className,
        totalSubmissions: assignment.submissions.length,
        gradedSubmissions: assignment.submissions.filter(sub => sub.score !== undefined).length,
        pendingGrading: assignment.submissions.filter(sub => sub.score === undefined).length,
        submissions: assignment.submissions.map(sub => ({
          student: sub.student.username,
          studentId: sub.student._id,
          submittedAt: sub.submittedAt,
          score: sub.score,

          
          fileData: !!sub.fileData,
          originalFileName: sub.originalFileName,
          fileSize: sub.fileSize
        }))
      }));
      
    } else if (userRole === 'college_admin') {
      // Admin sees all assignments with full control
      assignments = await Assignment.find({ 
        status: 'published'
      }).populate('createdBy', 'username').populate('assignedTo', 'username').populate('submissions.student', 'username').sort({ createdAt: -1 });
      
      // Format for admin view
      assignments = assignments.map(assignment => ({
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate.toISOString().split('T')[0],
        className: assignment.className,
        teacher: assignment.createdBy.username,
        totalSubmissions: assignment.submissions.length,
        gradedSubmissions: assignment.submissions.filter(sub => sub.score !== undefined).length,
        pendingGrading: assignment.submissions.filter(sub => sub.score === undefined).length,
        submissions: assignment.submissions.map(sub => ({
          student: sub.student.username,
          studentId: sub.student._id,
          submittedAt: sub.submittedAt,
          score: sub.score,
          fileData: !!sub.fileData,
          originalFileName: sub.originalFileName,
          fileSize: sub.fileSize,
          gradedBy: sub.gradedBy?.username
        }))
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

// Submit assignment (student only with MongoDB file storage)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { submissionText, fileData, fileName, fileType } = req.body;
    
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

    // Prepare submission data
    const submissionData = {
      student: req.user.userId,
      content: submissionText || '',
      submittedAt: new Date()
    };

    // Add file if provided (store as binary data in MongoDB)
    if (fileData && fileName && fileType) {
      // Convert base64 to buffer and store in MongoDB
      const fileBuffer = Buffer.from(fileData, 'base64');
      
      // Check file size (10MB limit)
      if (fileBuffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 10MB limit'
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'];
      if (!allowedTypes.includes(fileType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only images, PDFs, documents, and ZIP files are allowed.'
        });
      }

      submissionData.fileData = fileBuffer;           // Store binary data
      submissionData.originalFileName = fileName;     // Store original name
      submissionData.fileType = fileType;             // Store MIME type
      submissionData.fileSize = fileBuffer.length;    // Store file size
    }

    // Add submission
    assignment.submissions.push(submissionData);

    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment submitted successfully',
      submission: {
        submittedAt: submissionData.submittedAt,
        hasFile: !!fileData,
        fileName: fileName || null,
        fileSize: submissionData.fileSize || null
      }
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting assignment'
    });
  }
});

// Update assignment (teachers and admins only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user has permission to update assignments
    if (req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students cannot update assignments'
      });
    }

    const { title, description, dueDate, className, assignedTo } = req.body;
    const assignmentId = req.params.id;

    // Check if assignment exists and belongs to user (or admin can edit any)
    let assignment;
    if (req.user.role === 'college_admin') {
      // Admins can edit any assignment
      assignment = await Assignment.findById(assignmentId);
    } else {
      // Teachers can only edit their own assignments
      assignment = await Assignment.findOne({ 
        _id: assignmentId,
        createdBy: req.user.userId
      });
    }

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or you do not have permission to edit it'
      });
    }

    // Update assignment
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate ? new Date(dueDate) : assignment.dueDate;
    assignment.className = className || assignment.className;
    assignment.assignedTo = assignedTo || assignment.assignedTo;

    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment: {
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate.toISOString().split('T')[0],
        className: assignment.className
      }
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assignment'
    });
  }
});

// Delete assignment (teachers and admins only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user has permission to delete assignments
    if (req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students cannot delete assignments'
      });
    }

    const assignmentId = req.params.id;

    // Check if assignment exists and belongs to user (or admin can delete any)
    let assignment;
    if (req.user.role === 'college_admin') {
      // Admins can delete any assignment
      assignment = await Assignment.findById(assignmentId);
    } else {
      // Teachers can only delete their own assignments
      assignment = await Assignment.findOne({
        _id: assignmentId,
        createdBy: req.user.userId
      });
    }

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or you do not have permission to delete it'
      });
    }

    await assignment.deleteOne();

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

// Grade submission (teachers and admins only)
router.post('/:id/grade/:studentId', auth, async (req, res) => {
  try {
    // Check if user has permission to grade assignments
    if (req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students cannot grade assignments'
      });
    }

    const { score, feedback } = req.body;
    const assignmentId = req.params.id;
    const studentId = req.params.studentId;

    // Check if assignment exists and belongs to user (or admin can grade any)
    let assignment;
    if (req.user.role === 'college_admin') {
      // Admins can grade any assignment
      assignment = await Assignment.findById(assignmentId);
    } else {
      // Teachers can only grade their own assignments
      assignment = await Assignment.findOne({ 
        _id: assignmentId,
        createdBy: req.user.userId
      });
    }

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or you do not have permission to grade it'
      });
    }

    // Find student submission
    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Update submission with grade
    submission.score = score;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.userId;

    await assignment.save();

    res.json({
      success: true,
      message: 'Submission graded successfully',
      grade: {
        score: submission.score,
        feedback: submission.feedback,
        gradedAt: submission.gradedAt
      }
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error grading submission'
    });
  }
});

// Update assignment status (admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    // Only admins can change assignment status
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can change assignment status'
      });
    }

    const { status } = req.body;
    const assignmentId = req.params.id;

    // Validate status
    if (!['draft', 'published', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be draft, published, or closed'
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

    // Update status
    assignment.status = status;
    await assignment.save();

    res.json({
      success: true,
      message: `Assignment status updated to ${status}`,
      assignment: {
        id: assignment._id,
        title: assignment.title,
        status: assignment.status
      }
    });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assignment status'
    });
  }
});

// Override/delete submission (admin only)
router.delete('/:id/submission/:studentId', auth, async (req, res) => {
  try {
    // Only admins can delete submissions
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete submissions'
      });
    }

    const assignmentId = req.params.id;
    const studentId = req.params.studentId;

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Find and remove submission
    const submissionIndex = assignment.submissions.findIndex(
      sub => sub.student.toString() === studentId
    );

    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Remove submission
    assignment.submissions.splice(submissionIndex, 1);
    await assignment.save();

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting submission'
    });
  }
});

// Get all assignments with full details (admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get all assignments with full population
    const assignments = await Assignment.find({})
      .populate('createdBy', 'username email role')
      .populate('assignedTo', 'username email')
      .populate('submissions.student', 'username email')
      .populate('submissions.gradedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      assignments: assignments.map(assignment => ({
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        className: assignment.className,
        status: assignment.status,
        createdBy: {
          id: assignment.createdBy._id,
          username: assignment.createdBy.username,
          email: assignment.createdBy.email,
          role: assignment.createdBy.role
        },
        assignedTo: assignment.assignedTo.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email
        })),
        submissions: assignment.submissions.map(sub => ({
          student: {
            id: sub.student._id,
            username: sub.student.username,
            email: sub.student.email
          },
          submittedAt: sub.submittedAt,
          content: sub.content,
          fileUrl: sub.fileUrl,
          originalFileName: sub.originalFileName,
          score: sub.score,
          feedback: sub.feedback,
          gradedAt: sub.gradedAt,
          gradedBy: sub.gradedBy ? {
            id: sub.gradedBy._id,
            username: sub.gradedBy.username
          } : null
        })),
        totalSubmissions: assignment.submissions.length,
        gradedSubmissions: assignment.submissions.filter(sub => sub.score !== undefined).length,
        pendingGrading: assignment.submissions.filter(sub => sub.score === undefined).length,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching admin assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments'
    });
  }
});

// Download assignment file from MongoDB
router.get('/download/:assignmentId/:studentId', auth, async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Find submission
    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );

    if (!submission || !submission.fileData) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', submission.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${submission.originalFileName}"`);
    res.setHeader('Content-Length', submission.fileData.length);

    // Send file data from MongoDB
    res.send(submission.fileData);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file'
    });
  }
});

module.exports = router;
