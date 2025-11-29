const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    content: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    feedback: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  maxScore: {
    type: Number,
    default: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
assignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get assignment statistics for a user
assignmentSchema.statics.getStats = async function(userId, userRole) {
  try {
    let stats;
    
    if (userRole === 'student') {
      // Student stats - assignments assigned to them
      const assignments = await this.find({ 
        assignedTo: userId,
        status: 'published'
      }).populate('submissions.student');
      
      const totalAssignments = assignments.length;
      const completedAssignments = assignments.filter(assignment => 
        assignment.submissions.some(sub => sub.student.toString() === userId.toString())
      ).length;
      
      const pendingAssignments = totalAssignments - completedAssignments;
      
      // Calculate average score
      const submittedAssignments = assignments.filter(assignment => 
        assignment.submissions.some(sub => sub.student.toString() === userId.toString() && sub.score !== undefined)
      );
      
      const avgScore = submittedAssignments.length > 0 
        ? submittedAssignments.reduce((sum, assignment) => {
            const submission = assignment.submissions.find(sub => sub.student.toString() === userId.toString());
            return sum + (submission?.score || 0);
          }, 0) / submittedAssignments.length
        : 0;
      
      // Count upcoming deadlines (within 7 days)
      const upcomingDeadlines = assignments.filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);
        return daysUntilDue > 0 && daysUntilDue <= 7 && 
               !assignment.submissions.some(sub => sub.student.toString() === userId.toString());
      }).length;
      
      stats = {
        completionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0,
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        avgScore: Math.round(avgScore),
        upcomingDeadlines
      };
      
    } else if (userRole === 'teacher') {
      // Teacher stats - assignments they created
      const assignments = await this.find({ 
        createdBy: userId,
        status: 'published'
      }).populate('submissions.student');
      
      const totalAssignments = assignments.length;
      const totalSubmissions = assignments.reduce((sum, assignment) => sum + assignment.submissions.length, 0);
      
      // Calculate average score across all submissions
      const gradedSubmissions = assignments.reduce((sum, assignment) => {
        return sum + assignment.submissions.filter(sub => sub.score !== undefined).length;
      }, 0);
      
      const avgScore = gradedSubmissions > 0
        ? assignments.reduce((sum, assignment) => {
            return sum + assignment.submissions.reduce((subSum, sub) => subSum + (sub.score || 0), 0);
          }, 0) / gradedSubmissions
        : 0;
      
      // Count pending grading
      const pendingGrading = assignments.reduce((sum, assignment) => {
        return sum + assignment.submissions.filter(sub => sub.score === undefined).length;
      }, 0);
      
      stats = {
        completionRate: totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0,
        totalAssignments,
        completedAssignments: gradedSubmissions,
        pendingAssignments: pendingGrading,
        avgScore: Math.round(avgScore),
        totalSubmissions,
        pendingGrading
      };
      
    } else {
      // Admin stats - system-wide
      const assignments = await this.find({ status: 'published' }).populate('submissions.student');
      const totalAssignments = assignments.length;
      const totalSubmissions = assignments.reduce((sum, assignment) => sum + assignment.submissions.length, 0);
      
      const gradedSubmissions = assignments.reduce((sum, assignment) => {
        return sum + assignment.submissions.filter(sub => sub.score !== undefined).length;
      }, 0);
      
      const avgScore = gradedSubmissions > 0
        ? assignments.reduce((sum, assignment) => {
            return sum + assignment.submissions.reduce((subSum, sub) => subSum + (sub.score || 0), 0);
          }, 0) / gradedSubmissions
        : 0;
      
      stats = {
        completionRate: totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0,
        totalAssignments,
        completedAssignments: gradedSubmissions,
        pendingAssignments: totalAssignments - gradedSubmissions,
        avgScore: Math.round(avgScore),
        totalSubmissions,
        systemAvg: Math.round(avgScore)
      };
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting assignment stats:', error);
    throw error;
  }
};

module.exports = mongoose.model('Assignment', assignmentSchema);
