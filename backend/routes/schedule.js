const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

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
  
  // Validate time format (HH:MM)
  time: (input) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const sanitized = validateAndSanitize.string(input, 5);
    return timeRegex.test(sanitized) ? sanitized : null;
  },
  
  // Validate day of week
  dayOfWeek: (input) => {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sanitized = validateAndSanitize.string(input, 10);
    return validDays.includes(sanitized) ? sanitized : null;
  },
  
  // Validate color format (hex color)
  color: (input) => {
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    const sanitized = validateAndSanitize.string(input, 7);
    return colorRegex.test(sanitized) ? sanitized : '#7C3AED';
  },
  
  // Validate role
  role: (input) => {
    const validRoles = ['student', 'teacher', 'college_admin'];
    return validRoles.includes(input) ? input : 'student';
  }
};

// Get all classes (role-based access)
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
    
    let schedules;
    
    if (userRole === 'student') {
      // Students can see all schedules (created by teachers/admins)
      schedules = await Schedule.find({})
        .populate('userId', 'username role')
        .sort({ dayOfWeek: 1, startTime: 1 });
    } else if (userRole === 'college_admin') {
      // Admins can see all schedules in the system
      schedules = await Schedule.find({})
        .populate('userId', 'username role')
        .sort({ dayOfWeek: 1, startTime: 1 });
    } else {
      // Teachers see their own schedules
      schedules = await Schedule.find({ userId: userId })
        .populate('userId', 'username role')
        .sort({ dayOfWeek: 1, startTime: 1 });
    }
    
    // Sanitize schedule data before sending
    const sanitizedSchedules = schedules.map(schedule => ({
      id: schedule._id,
      className: validateAndSanitize.string(schedule.className, 100),
      professor: validateAndSanitize.string(schedule.professor, 100),
      dayOfWeek: validateAndSanitize.dayOfWeek(schedule.dayOfWeek),
      startTime: validateAndSanitize.time(schedule.startTime),
      endTime: validateAndSanitize.time(schedule.endTime),
      location: validateAndSanitize.string(schedule.location, 100),
      color: validateAndSanitize.color(schedule.color),
      userId: schedule.userId,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt
    }));
    
    res.json({
      success: true,
      schedules: sanitizedSchedules
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching class schedules'
    });
  }
});

// Add a new class (teachers and admins only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user has permission to create schedules
    if (req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students cannot create class schedules'
      });
    }

    const { className, professor, dayOfWeek, startTime, endTime, location, color } = req.body;
    const userId = validateAndSanitize.objectId(req.user.userId);

    // Validate and sanitize inputs
    const sanitizedClassName = validateAndSanitize.string(className, 100);
    const sanitizedProfessor = validateAndSanitize.string(professor, 100);
    const sanitizedDayOfWeek = validateAndSanitize.dayOfWeek(dayOfWeek);
    const sanitizedStartTime = validateAndSanitize.time(startTime);
    const sanitizedEndTime = validateAndSanitize.time(endTime);
    const sanitizedLocation = validateAndSanitize.string(location, 100);
    const sanitizedColor = validateAndSanitize.color(color);

    // Validate required fields
    if (!sanitizedClassName || !sanitizedProfessor || !sanitizedDayOfWeek || 
        !sanitizedStartTime || !sanitizedEndTime || !sanitizedLocation || !userId) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided and valid'
      });
    }

    // Validate time logic (end time should be after start time)
    const startMinutes = parseInt(sanitizedStartTime.split(':')[0]) * 60 + parseInt(sanitizedStartTime.split(':')[1]);
    const endMinutes = parseInt(sanitizedEndTime.split(':')[0]) * 60 + parseInt(sanitizedEndTime.split(':')[1]);
    
    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check for scheduling conflicts
    const conflictSchedule = await Schedule.findOne({
      userId: userId,
      dayOfWeek: sanitizedDayOfWeek,
      $or: [
        {
          startTime: { $lt: sanitizedEndTime },
          endTime: { $gt: sanitizedStartTime }
        }
      ]
    });

    if (conflictSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Time slot conflicts with existing schedule'
      });
    }

    // Create new schedule
    const schedule = new Schedule({
      className: sanitizedClassName,
      professor: sanitizedProfessor,
      dayOfWeek: sanitizedDayOfWeek,
      startTime: sanitizedStartTime,
      endTime: sanitizedEndTime,
      location: sanitizedLocation,
      color: sanitizedColor,
      userId: userId
    });

    await schedule.save();
    await schedule.populate('userId', 'username role');

    res.status(201).json({
      success: true,
      message: 'Class schedule created successfully',
      schedule
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating class schedule'
    });
  }
});

// Update a class (teachers and admins only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user has permission to update schedules
    if (req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students cannot update class schedules'
      });
    }

    const scheduleId = validateAndSanitize.objectId(req.params.id);
    const { className, professor, dayOfWeek, startTime, endTime, location, color } = req.body;
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!scheduleId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID or user ID'
      });
    }

    // Find existing schedule
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check permissions (teachers can only update their own schedules)
    if (req.user.role === 'teacher' && schedule.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own schedules'
      });
    }

    // Validate and sanitize inputs
    const sanitizedClassName = className ? validateAndSanitize.string(className, 100) : schedule.className;
    const sanitizedProfessor = professor ? validateAndSanitize.string(professor, 100) : schedule.professor;
    const sanitizedDayOfWeek = dayOfWeek ? validateAndSanitize.dayOfWeek(dayOfWeek) : schedule.dayOfWeek;
    const sanitizedStartTime = startTime ? validateAndSanitize.time(startTime) : schedule.startTime;
    const sanitizedEndTime = endTime ? validateAndSanitize.time(endTime) : schedule.endTime;
    const sanitizedLocation = location ? validateAndSanitize.string(location, 100) : schedule.location;
    const sanitizedColor = color ? validateAndSanitize.color(color) : schedule.color;

    // Validate time logic
    const startMinutes = parseInt(sanitizedStartTime.split(':')[0]) * 60 + parseInt(sanitizedStartTime.split(':')[1]);
    const endMinutes = parseInt(sanitizedEndTime.split(':')[0]) * 60 + parseInt(sanitizedEndTime.split(':')[1]);
    
    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check for scheduling conflicts (excluding current schedule)
    const conflictSchedule = await Schedule.findOne({
      _id: { $ne: scheduleId },
      userId: userId,
      dayOfWeek: sanitizedDayOfWeek,
      $or: [
        {
          startTime: { $lt: sanitizedEndTime },
          endTime: { $gt: sanitizedStartTime }
        }
      ]
    });

    if (conflictSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Time slot conflicts with existing schedule'
      });
    }

    // Update schedule
    schedule.className = sanitizedClassName;
    schedule.professor = sanitizedProfessor;
    schedule.dayOfWeek = sanitizedDayOfWeek;
    schedule.startTime = sanitizedStartTime;
    schedule.endTime = sanitizedEndTime;
    schedule.location = sanitizedLocation;
    schedule.color = sanitizedColor;

    await schedule.save();
    await schedule.populate('userId', 'username role');

    res.json({
      success: true,
      message: 'Class schedule updated successfully',
      schedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating class schedule'
    });
  }
});

// Delete a class (teachers and admins only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user has permission to delete schedules
    if (req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students cannot delete class schedules'
      });
    }

    const scheduleId = validateAndSanitize.objectId(req.params.id);
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!scheduleId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID or user ID'
      });
    }

    // Find existing schedule
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check permissions (teachers can only delete their own schedules)
    if (req.user.role === 'teacher' && schedule.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own schedules'
      });
    }

    await Schedule.findByIdAndDelete(scheduleId);

    res.json({
      success: true,
      message: 'Class schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting class schedule'
    });
  }
});

// Get schedule by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const scheduleId = validateAndSanitize.objectId(req.params.id);
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!scheduleId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID or user ID'
      });
    }

    const schedule = await Schedule.findById(scheduleId)
      .populate('userId', 'username role');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check access permissions
    const userRole = req.user.role;
    if (userRole === 'student') {
      // Students can view all schedules
      // No additional checks needed
    } else if (userRole === 'teacher') {
      // Teachers can only view their own schedules
      if (schedule.userId._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    // Admins can view all schedules

    // Sanitize schedule data
    const sanitizedSchedule = {
      id: schedule._id,
      className: validateAndSanitize.string(schedule.className, 100),
      professor: validateAndSanitize.string(schedule.professor, 100),
      dayOfWeek: validateAndSanitize.dayOfWeek(schedule.dayOfWeek),
      startTime: validateAndSanitize.time(schedule.startTime),
      endTime: validateAndSanitize.time(schedule.endTime),
      location: validateAndSanitize.string(schedule.location, 100),
      color: validateAndSanitize.color(schedule.color),
      userId: schedule.userId,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt
    };

    res.json({
      success: true,
      schedule: sanitizedSchedule
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedule'
    });
  }
});

// Get schedules by day of week
router.get('/day/:dayOfWeek', auth, async (req, res) => {
  try {
    const dayOfWeek = validateAndSanitize.dayOfWeek(req.params.dayOfWeek);
    const userRole = validateAndSanitize.role(req.user.role);
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!dayOfWeek || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day of week or user ID'
      });
    }

    let schedules;

    if (userRole === 'student') {
      // Students can see all schedules for the day
      schedules = await Schedule.find({ dayOfWeek: dayOfWeek })
        .populate('userId', 'username role')
        .sort({ startTime: 1 });
    } else if (userRole === 'college_admin') {
      // Admins can see all schedules for the day
      schedules = await Schedule.find({ dayOfWeek: dayOfWeek })
        .populate('userId', 'username role')
        .sort({ startTime: 1 });
    } else {
      // Teachers see their own schedules for the day
      schedules = await Schedule.find({ 
        userId: userId,
        dayOfWeek: dayOfWeek
      })
        .populate('userId', 'username role')
        .sort({ startTime: 1 });
    }

    // Sanitize schedule data
    const sanitizedSchedules = schedules.map(schedule => ({
      id: schedule._id,
      className: validateAndSanitize.string(schedule.className, 100),
      professor: validateAndSanitize.string(schedule.professor, 100),
      dayOfWeek: validateAndSanitize.dayOfWeek(schedule.dayOfWeek),
      startTime: validateAndSanitize.time(schedule.startTime),
      endTime: validateAndSanitize.time(schedule.endTime),
      location: validateAndSanitize.string(schedule.location, 100),
      color: validateAndSanitize.color(schedule.color),
      userId: schedule.userId
    }));

    res.json({
      success: true,
      schedules: sanitizedSchedules
    });
  } catch (error) {
    console.error('Error fetching schedules by day:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedules by day'
    });
  }
});

// Get schedules for current user (teachers only)
router.get('/my', auth, async (req, res) => {
  try {
    const userRole = validateAndSanitize.role(req.user.role);
    const userId = validateAndSanitize.objectId(req.user.userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Only teachers can use this endpoint
    if (userRole !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can view their own schedules'
      });
    }

    const schedules = await Schedule.find({ userId: userId })
      .populate('userId', 'username role')
      .sort({ dayOfWeek: 1, startTime: 1 });

    // Sanitize schedule data
    const sanitizedSchedules = schedules.map(schedule => ({
      id: schedule._id,
      className: validateAndSanitize.string(schedule.className, 100),
      professor: validateAndSanitize.string(schedule.professor, 100),
      dayOfWeek: validateAndSanitize.dayOfWeek(schedule.dayOfWeek),
      startTime: validateAndSanitize.time(schedule.startTime),
      endTime: validateAndSanitize.time(schedule.endTime),
      location: validateAndSanitize.string(schedule.location, 100),
      color: validateAndSanitize.color(schedule.color),
      userId: schedule.userId,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt
    }));

    res.json({
      success: true,
      schedules: sanitizedSchedules
    });
  } catch (error) {
    console.error('Error fetching user schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user schedules'
    });
  }
});

module.exports = router;
