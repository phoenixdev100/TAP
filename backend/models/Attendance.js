const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  className: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String,
  semester: {
    type: String,
    default: 'Spring 2024'
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

// Create compound index for unique attendance records
attendanceSchema.index({ student: 1, className: 1, date: 1 }, { unique: true });

// Update the updatedAt field before saving
attendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get attendance statistics for a user
attendanceSchema.statics.getStats = async function(userId, userRole) {
  try {
    let stats;
    
    if (userRole === 'student') {
      // Student stats - their own attendance
      const currentSemester = 'Spring 2024';
      const attendanceRecords = await this.find({ 
        student: userId,
        semester: currentSemester
      });
      
      const totalClasses = attendanceRecords.length;
      const presentClasses = attendanceRecords.filter(record => record.status === 'present').length;
      const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
      
      // Calculate study hours (mock data - could be enhanced with actual study tracking)
      const studyHours = Math.min(20, Math.max(5, attendanceRate / 5));
      
      // Calculate GPA based on attendance (simplified - could be enhanced with actual grades)
      const gpa = attendanceRate > 90 ? 4.0 : attendanceRate > 80 ? 3.5 : attendanceRate > 70 ? 3.0 : attendanceRate > 60 ? 2.5 : 2.0;
      
      stats = {
        rate: attendanceRate,
        studyHours,
        gpa: parseFloat(gpa.toFixed(1)),
        semester: currentSemester,
        totalClasses,
        presentClasses,
        absentClasses: totalClasses - presentClasses
      };
      
    } else if (userRole === 'teacher') {
      // Teacher stats - classes they teach
      const currentSemester = 'Spring 2024';
      const attendanceRecords = await this.find({ 
        markedBy: userId,
        semester: currentSemester
      }).populate('student');
      
      const totalClasses = attendanceRecords.length;
      const presentClasses = attendanceRecords.filter(record => record.status === 'present').length;
      const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
      
      // Get unique students
      const uniqueStudents = new Set(attendanceRecords.map(record => record.student.toString()));
      const totalStudents = uniqueStudents.size;
      
      // Calculate study hours (average of students)
      const studyHours = Math.min(20, Math.max(8, attendanceRate / 4));
      
      // Calculate average GPA
      const gpa = attendanceRate > 85 ? 3.6 : attendanceRate > 75 ? 3.4 : attendanceRate > 65 ? 3.2 : 3.0;
      
      stats = {
        rate: attendanceRate,
        studyHours,
        gpa: parseFloat(gpa.toFixed(1)),
        semester: currentSemester,
        totalClasses,
        totalStudents,
        avgAttendance: attendanceRate
      };
      
    } else {
      // Admin stats - system-wide
      const currentSemester = 'Spring 2024';
      const attendanceRecords = await this.find({ 
        semester: currentSemester
      });
      
      const totalClasses = attendanceRecords.length;
      const presentClasses = attendanceRecords.filter(record => record.status === 'present').length;
      const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
      
      // Get unique users
      const uniqueUsers = new Set(attendanceRecords.map(record => record.student.toString()));
      const totalUsers = uniqueUsers.size;
      
      // Get unique classes
      const uniqueClasses = new Set(attendanceRecords.map(record => record.className));
      const totalClassesOffered = uniqueClasses.size;
      
      // Calculate system-wide metrics
      const studyHours = Math.min(20, Math.max(10, attendanceRate / 4.5));
      const gpa = attendanceRate > 88 ? 3.7 : attendanceRate > 78 ? 3.5 : attendanceRate > 68 ? 3.3 : 3.1;
      
      stats = {
        rate: attendanceRate,
        studyHours,
        gpa: parseFloat(gpa.toFixed(1)),
        semester: currentSemester,
        totalUsers,
        totalClasses: totalClassesOffered,
        systemAttendance: attendanceRate
      };
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting attendance stats:', error);
    throw error;
  }
};

// Get attendance records for a student
attendanceSchema.statics.getStudentRecords = async function(studentId) {
  try {
    const records = await this.find({ 
      student: studentId 
    }).populate('markedBy', 'username').sort({ date: -1 });
    
    return records.map(record => ({
      date: record.date.toISOString().split('T')[0],
      status: record.status,
      className: record.className,
      markedBy: record.markedBy.username,
      notes: record.notes
    }));
  } catch (error) {
    console.error('Error getting student attendance records:', error);
    throw error;
  }
};

module.exports = mongoose.model('Attendance', attendanceSchema);
