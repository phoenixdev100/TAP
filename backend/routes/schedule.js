const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');

// Get all classes (role-based access)
router.get('/', auth, async (req, res) => {
  try {
    let schedules;
    
    if (req.user.role === 'student') {
      // Students can see all schedules (created by teachers/admins)
      schedules = await Schedule.find({})
        .populate('userId', 'username role')
        .sort({ dayOfWeek: 1, startTime: 1 });
    } else if (req.user.role === 'college_admin') {
      // Admins can see all schedules in the system
      schedules = await Schedule.find({})
        .populate('userId', 'username role')
        .sort({ dayOfWeek: 1, startTime: 1 });
    } else {
      // Teachers see their own schedules
      schedules = await Schedule.find({ userId: req.user.userId })
        .populate('userId', 'username role')
        .sort({ dayOfWeek: 1, startTime: 1 });
    }
    
    res.json({
      success: true,
      schedules
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

    // Validate required fields
    if (!className || !professor || !dayOfWeek || !startTime || !endTime || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create new schedule
    const schedule = new Schedule({
      userId: req.user.userId,
      className,
      professor,
      dayOfWeek,
      startTime,
      endTime,
      location,
      color
    });

    await schedule.save();

    res.status(201).json({
      success: true,
      message: 'Class schedule added successfully',
      schedule
    });
  } catch (error) {
    console.error('Error adding schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding class schedule'
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

    const { className, professor, dayOfWeek, startTime, endTime, location, color } = req.body;
    const scheduleId = req.params.id;

    // Check if schedule exists and belongs to user (or admin can edit any)
    let schedule;
    if (req.user.role === 'college_admin') {
      // Admins can edit any schedule
      schedule = await Schedule.findById(scheduleId);
    } else {
      // Teachers can only edit their own schedules
      schedule = await Schedule.findOne({ 
        _id: scheduleId,
        userId: req.user.userId
      });
    }

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or you do not have permission to edit it'
      });
    }

    // Update schedule
    schedule.className = className || schedule.className;
    schedule.professor = professor || schedule.professor;
    schedule.dayOfWeek = dayOfWeek || schedule.dayOfWeek;
    schedule.startTime = startTime || schedule.startTime;
    schedule.endTime = endTime || schedule.endTime;
    schedule.location = location || schedule.location;
    schedule.color = color || schedule.color;

    await schedule.save();

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

    const scheduleId = req.params.id;

    // Check if schedule exists and belongs to user (or admin can delete any)
    let schedule;
    if (req.user.role === 'college_admin') {
      // Admins can delete any schedule
      schedule = await Schedule.findById(scheduleId);
    } else {
      // Teachers can only delete their own schedules
      schedule = await Schedule.findOne({
        _id: scheduleId,
        userId: req.user.userId
      });
    }

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or you do not have permission to delete it'
      });
    }

    await schedule.deleteOne();

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

module.exports = router;