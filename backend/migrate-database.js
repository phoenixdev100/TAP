const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Schedule = require('./models/Schedule');
const Assignment = require('./models/Assignment');
const Attendance = require('./models/Attendance');
const { logger } = require('./utils/logger');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tap')
  .then(async () => {
    logger.log('Connected to MongoDB');
    
    try {
      logger.log('Starting migration...');
      
      // Update User model - add enrolledClasses field
      const userUpdateResult = await User.updateMany(
        { enrolledClasses: { $exists: false } },
        { $set: { enrolledClasses: [] } }
      );
      logger.log(`Updated ${userUpdateResult.modifiedCount} users with enrolledClasses field`);
      
      // Update Schedule model - add classId field (set to null for now)
      const scheduleUpdateResult = await Schedule.updateMany(
        { classId: { $exists: false } },
        { $set: { classId: null } }
      );
      logger.log(`Updated ${scheduleUpdateResult.modifiedCount} schedules with classId field`);
      
      // Update Assignment model - add classId field (set to null for now)
      const assignmentUpdateResult = await Assignment.updateMany(
        { classId: { $exists: false } },
        { $set: { classId: null } }
      );
      logger.log(`Updated ${assignmentUpdateResult.modifiedCount} assignments with classId field`);
      
      // Update Attendance model - add classId field (set to null for now)
      const attendanceUpdateResult = await Attendance.updateMany(
        { classId: { $exists: false } },
        { $set: { classId: null } }
      );
      logger.log(`Updated ${attendanceUpdateResult.modifiedCount} attendance records with classId field`);
      
      logger.log('Migration completed successfully!');
      logger.log('All existing documents now have the new schema fields.');
      logger.log('Note: classId fields are set to null and will need to be linked to actual classes.');
      
      process.exit(0);
    } catch (error) {
      logger.error('Migration error:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });
