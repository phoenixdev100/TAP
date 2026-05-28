const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
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
  fileType: { type: String, required: true },
  fileName: { type: String, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 }
  }]
});

module.exports = mongoose.model('Note', noteSchema);
