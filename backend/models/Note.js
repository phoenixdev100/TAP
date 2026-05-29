const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  className: { type: String },
  url: { type: String },
  date: { type: Date },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  pages: { type: Number, default: 0 },
  fileType: { type: String },
  fileName: { type: String },
  fileId: { type: mongoose.Schema.Types.ObjectId },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Note', noteSchema);
