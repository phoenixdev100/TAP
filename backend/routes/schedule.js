const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');

// Get all classes for a user
router.get('/', auth, async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.user.userId })
      .sort({ dayOfWeek: 1, startTime: 1 });
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

// Add a new class
router.post('/', auth, async (req, res) => {
  try {
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

// Update a class
router.put('/:id', auth, async (req, res) => {
  try {
    const { className, professor, dayOfWeek, startTime, endTime, location, color } = req.body;
    const scheduleId = req.params.id;

    // Check if schedule exists and belongs to user
    const schedule = await Schedule.findOne({ 
      _id: scheduleId,
      userId: req.user.userId
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
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

// Delete a class
router.delete('/:id', auth, async (req, res) => {
  try {
    const scheduleId = req.params.id;

    // Check if schedule exists and belongs to user
    const schedule = await Schedule.findOne({
      _id: scheduleId,
      userId: req.user.userId
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
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