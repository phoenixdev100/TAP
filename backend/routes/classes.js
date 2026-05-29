const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Get all classes (role-based access)
router.get('/', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.userId;

    let classes;

    if (userRole === 'college_admin') {
      // Admins can see all classes
      classes = await Class.find()
        .populate('teacher', 'username firstName lastName email')
        .populate('students', 'username firstName lastName email')
        .sort({ name: 1 });
    } else if (userRole === 'teacher') {
      // Teachers can see their own classes
      classes = await Class.find({ teacher: userId })
        .populate('teacher', 'username firstName lastName email')
        .populate('students', 'username firstName lastName email')
        .sort({ name: 1 });
    } else {
      // Students can see their enrolled classes
      classes = await Class.find({ students: userId })
        .populate('teacher', 'username firstName lastName email')
        .populate('students', 'username firstName lastName email')
        .sort({ name: 1 });
    }

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    logger.error('Error fetching classes:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single class
router.get('/:id', auth, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('teacher', 'username firstName lastName email')
      .populate('students', 'username firstName lastName email')
      .populate('schedule')
      .populate('assignments')
      .populate('notes');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check access permissions
    const userRole = req.user.role;
    const userId = req.user.userId;

    if (userRole === 'college_admin') {
      // Admins can see any class
    } else if (userRole === 'student') {
      // Students can only see their enrolled classes
      if (!classData.students.some(student => student._id.toString() === userId.toString())) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (userRole === 'teacher') {
      // Teachers can only see their own classes
      if (classData.teacher._id.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({
      success: true,
      class: classData
    });
  } catch (error) {
    logger.error('Error fetching class:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create class (admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Only admin can create classes
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({ message: 'Only admins can create classes' });
    }

    const { name, code, description, department, semester, year } = req.body;

    // Check if class code already exists
    const existingClass = await Class.findOne({ code });
    if (existingClass) {
      return res.status(400).json({ message: 'Class code already exists' });
    }

    const newClass = new Class({
      name,
      code,
      description: description || '',
      department: department || '',
      semester: semester || 'Spring 2024',
      year: year || '2024'
    });

    const savedClass = await newClass.save();

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: savedClass
    });
  } catch (error) {
    logger.error('Error creating class:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update class (admin or assigned teacher)
router.put('/:id', auth, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check permissions
    const userRole = req.user.role;
    const userId = req.user.userId;

    if (userRole !== 'college_admin' && classData.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, code, description, teacher, department, credits, semester, year, isActive } = req.body;

    if (name !== undefined) classData.name = name;
    if (description !== undefined) classData.description = description;
    if (department !== undefined) classData.department = department;
    if (credits !== undefined) classData.credits = credits;
    if (semester !== undefined) classData.semester = semester;
    if (year !== undefined) classData.year = year;
    if (isActive !== undefined) classData.isActive = isActive;

    // If changing teacher, verify new teacher
    if (teacher !== undefined && teacher !== classData.teacher.toString()) {
      const teacherUser = await User.findById(teacher);
      if (!teacherUser || teacherUser.role !== 'teacher') {
        return res.status(400).json({ message: 'Invalid teacher' });
      }
      classData.teacher = teacher;
    }

    const updatedClass = await classData.save();

    res.json({
      success: true,
      message: 'Class updated successfully',
      class: updatedClass
    });
  } catch (error) {
    logger.error('Error updating class:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete class (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admin can delete classes
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({ message: 'Only admins can delete classes' });
    }

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Remove class from all enrolled students
    await User.updateMany(
      { enrolledClasses: req.params.id },
      { $pull: { enrolledClasses: req.params.id } }
    );

    await Class.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting class:', error);
    res.status(500).json({ message: error.message });
  }
});

// Enroll student in class (admin or teacher)
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check permissions
    const userRole = req.user.role;
    const userId = req.user.userId;

    if (userRole !== 'college_admin' && classData.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { studentId } = req.body;

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (student.role !== 'student') {
      return res.status(400).json({ message: 'User is not a student' });
    }

    // Check if already enrolled
    if (classData.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled in this class' });
    }

    // Add student to class
    classData.students.push(studentId);
    await classData.save();

    // Add class to student's enrolled classes
    student.enrolledClasses.push(classData._id);
    await student.save();

    res.json({
      success: true,
      message: 'Student enrolled successfully'
    });
  } catch (error) {
    logger.error('Error enrolling student:', error);
    res.status(400).json({ message: error.message });
  }
});

// Remove student from class (admin or teacher)
router.delete('/:id/enroll/:studentId', auth, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check permissions
    const userRole = req.user.role;
    const userId = req.user.userId;

    if (userRole !== 'college_admin' && classData.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const studentId = req.params.studentId;

    // Remove student from class
    classData.students = classData.students.filter(id => id.toString() !== studentId);
    await classData.save();

    // Remove class from student's enrolled classes
    await User.updateOne(
      { _id: studentId },
      { $pull: { enrolledClasses: req.params.id } }
    );

    res.json({
      success: true,
      message: 'Student removed from class successfully'
    });
  } catch (error) {
    logger.error('Error removing student:', error);
    res.status(400).json({ message: error.message });
  }
});

// Assign teacher to class (admin only)
router.post('/:id/teacher', auth, async (req, res) => {
  try {
    // Only admin can assign teachers
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({ message: 'Only admins can assign teachers' });
    }

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const { teacherId } = req.body;

    // Verify teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }

    // Update class teacher
    classData.teacher = teacherId;
    await classData.save();

    // Add class to teacher's enrolled classes
    if (!teacher.enrolledClasses.includes(classData._id)) {
      teacher.enrolledClasses.push(classData._id);
      await teacher.save();
    }

    res.json({
      success: true,
      message: 'Teacher assigned successfully'
    });
  } catch (error) {
    logger.error('Error assigning teacher:', error);
    res.status(400).json({ message: error.message });
  }
});

// Remove teacher from class (admin only)
router.delete('/:id/teacher/:teacherId', auth, async (req, res) => {
  try {
    // Only admin can remove teachers
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({ message: 'Only admins can remove teachers' });
    }

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const teacherId = req.params.teacherId;

    // Remove teacher from class
    classData.teacher = null;
    await classData.save();

    // Remove class from teacher's enrolled classes
    await User.updateOne(
      { _id: teacherId },
      { $pull: { enrolledClasses: req.params.id } }
    );

    res.json({
      success: true,
      message: 'Teacher removed successfully'
    });
  } catch (error) {
    logger.error('Error removing teacher:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get students for a class (teacher or admin)
router.get('/:id/students', auth, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('students', 'username firstName lastName email year major gpa');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check permissions
    const userRole = req.user.role;
    const userId = req.user.userId;

    if (userRole !== 'college_admin' && classData.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      students: classData.students
    });
  } catch (error) {
    logger.error('Error fetching students:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
