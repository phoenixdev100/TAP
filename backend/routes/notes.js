const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const auth = require('../middleware/auth');
const { logger } = require('../utils/logger');

// GridFS for file storage
let bucket;
mongoose.connection.once('open', () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'notesFiles'
  });
});

// Multer storage using memory buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, and text files are allowed'), false);
    }
  }
});

// Note Schema
const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  downloads: { type: Number, default: 0 },
  pages: { type: Number, default: 0 },
  fileType: { type: String },
  fileName: { type: String },
  fileId: { type: mongoose.Schema.Types.ObjectId },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 }
  }]
});

const Note = mongoose.model('Note', NoteSchema);

// GET /api/notes - Get all notes with pagination and filtering
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category || 'all';
    const search = req.query.search || '';

    let query = {};

    // Admins can see all notes, others only see public notes
    if (req.user.role !== 'college_admin') {
      query.isPublic = true;
    }

    // Filter by category
    if (category === 'my') {
      query.author = req.user.userId;
    } else if (category === 'bookmarked') {
      query.bookmarks = req.user.userId;
    } else if (category === 'popular') {
      query = { ...query, downloads: { $gte: 50 } };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const notes = await Note.find(query)
      .populate('author', 'username email')
      .sort({ uploadDate: -1, downloads: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate average rating for each note
    const notesWithRating = notes.map(note => {
      const avgRating = note.ratings.length > 0
        ? note.ratings.reduce((sum, r) => sum + r.rating, 0) / note.ratings.length
        : 0;

      return {
        ...note.toObject(),
        rating: avgRating.toFixed(1),
        isBookmarked: note.bookmarks.some(id => id.toString() === req.user.userId),
        isLiked: note.likes.some(id => id.toString() === req.user.userId),
        userRating: note.ratings.find(r => r.user.toString() === req.user.userId)?.rating || 0
      };
    });

    const total = await Note.countDocuments(query);

    res.json({
      notes: notesWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// GET /api/notes/:id - Get single note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('author', 'username email');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Calculate average rating
    const avgRating = note.ratings.length > 0
      ? note.ratings.reduce((sum, r) => sum + r.rating, 0) / note.ratings.length
      : 0;

    const noteData = {
      ...note.toObject(),
      rating: avgRating.toFixed(1),
      isBookmarked: note.bookmarks.some(id => id.toString() === req.user.id),
      isLiked: note.likes.some(id => id.toString() === req.user.id),
      userRating: note.ratings.find(r => r.user.toString() === req.user.id)?.rating || 0
    };

    res.json(noteData);
  } catch (error) {
    logger.error('Error fetching note:', error);
    res.status(500).json({ message: 'Error fetching note' });
  }
});

// POST /api/notes - Create new note without file upload
router.post('/', auth, async (req, res) => {
  try {
    const { title, subject, description, classId, tags, isPublic } = req.body;

    if (!title || !subject || !description) {
      return res.status(400).json({ message: 'Title, subject, and description are required' });
    }

    // Parse tags - handle both string and array formats
    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.filter(tag => typeof tag === 'string' && tag.trim());
    } else if (typeof tags === 'string') {
      parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Get user info from database for authorName
    const User = mongoose.model('User');
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create note document without file
    const note = new Note({
      title,
      subject,
      description,
      classId: classId || null,
      author: req.user.userId,
      authorName: user.username,
      fileType: 'text/plain',
      fileName: `${title}.txt`,
      fileId: null,
      tags: parsedTags,
      isPublic: isPublic !== 'false',
      pages: 0
    });

    await note.save();

    // Populate author info for response
    await note.populate('author', 'username email');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: {
        ...note.toObject(),
        rating: '0.0',
        isBookmarked: false,
        isLiked: false,
        userRating: 0
      }
    });
  } catch (error) {
    logger.error('Error creating note:', error);
    res.status(500).json({ message: 'Error creating note' });
  }
});

// PUT /api/notes/:id - Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, subject, description, classId, tags, isPublic } = req.body;

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user is the author or admin
    if (note.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }

    // Update fields
    if (title) note.title = title;
    if (subject) note.subject = subject;
    if (description) note.description = description;
    if (classId !== undefined) note.classId = classId || null;
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        note.tags = tags.filter(tag => typeof tag === 'string' && tag.trim());
      } else if (typeof tags === 'string') {
        note.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }
    if (isPublic !== undefined) note.isPublic = isPublic;

    await note.save();

    // Populate author info for response
    await note.populate('author', 'username email');

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    logger.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note' });
  }
});

// POST /api/notes/upload - Upload new note
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, subject, description, tags, isPublic } = req.body;

    if (!title || !subject || !description) {
      return res.status(400).json({ message: 'Title, subject, and description are required' });
    }

    // Upload file to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        uploadDate: new Date(),
        uploadedBy: req.user.id
      }
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      try {
        // Parse tags
        const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        // Create note document
        const note = new Note({
          title,
          subject,
          description,
          author: req.user.id,
          authorName: req.user.username,
          fileType: req.file.mimetype,
          fileName: req.file.originalname,
          fileId: uploadStream.id,
          tags: parsedTags,
          isPublic: isPublic !== 'false', // Default to true
          pages: 0 // You might want to extract this from the file
        });

        await note.save();

        // Populate author info for response
        await note.populate('author', 'username email');

        res.status(201).json({
          message: 'Note uploaded successfully',
          note: {
            ...note.toObject(),
            rating: '0.0',
            isBookmarked: false,
            isLiked: false,
            userRating: 0
          }
        });
      } catch (error) {
        logger.error('Error saving note:', error);
        res.status(500).json({ message: 'Error saving note' });
      }
    });

    uploadStream.on('error', (error) => {
      logger.error('GridFS upload error:', error);
      res.status(500).json({ message: 'Error uploading file' });
    });

  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading note' });
  }
});

// GET /api/notes/:id/download - Download note file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if note has a file
    if (!note.fileId) {
      return res.status(400).json({ message: 'This note does not have an associated file' });
    }

    // Increment download count
    await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });

    // Get file from GridFS
    const downloadStream = bucket.openDownloadStream(note.fileId);

    res.set({
      'Content-Type': note.fileType,
      'Content-Disposition': `attachment; filename="${note.fileName}"`
    });

    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      logger.error('Download error:', error);
      res.status(500).json({ message: 'Error downloading file' });
    });

  } catch (error) {
    logger.error('Download error:', error);
    res.status(500).json({ message: 'Error downloading note' });
  }
});

// POST /api/notes/:id/bookmark - Toggle bookmark
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const isBookmarked = note.bookmarks.includes(req.user.id);

    if (isBookmarked) {
      note.bookmarks.pull(req.user.id);
    } else {
      note.bookmarks.push(req.user.id);
    }

    await note.save();

    res.json({
      message: isBookmarked ? 'Bookmark removed' : 'Bookmark added',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    logger.error('Bookmark error:', error);
    res.status(500).json({ message: 'Error updating bookmark' });
  }
});

// POST /api/notes/:id/like - Toggle like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const isLiked = note.likes.includes(req.user.id);

    if (isLiked) {
      note.likes.pull(req.user.id);
    } else {
      note.likes.push(req.user.id);
    }

    await note.save();

    res.json({
      message: isLiked ? 'Like removed' : 'Like added',
      isLiked: !isLiked
    });
  } catch (error) {
    logger.error('Like error:', error);
    res.status(500).json({ message: 'Error updating like' });
  }
});

// POST /api/notes/:id/rate - Rate note
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Remove existing rating by this user
    note.ratings = note.ratings.filter(r => r.user.toString() !== req.user.id);

    // Add new rating
    note.ratings.push({ user: req.user.id, rating });

    await note.save();

    // Calculate new average rating
    const avgRating = note.ratings.reduce((sum, r) => sum + r.rating, 0) / note.ratings.length;

    res.json({
      message: 'Rating submitted successfully',
      averageRating: avgRating.toFixed(1),
      userRating: rating
    });
  } catch (error) {
    logger.error('Rating error:', error);
    res.status(500).json({ message: 'Error submitting rating' });
  }
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user is the author or admin
    if (note.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    // Delete file from GridFS if it exists
    if (note.fileId) {
      await bucket.delete(note.fileId);
    }

    // Delete note document
    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    logger.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;
