const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  clientName: {
    type: String,
    required: [true, 'Please add a client name'],
    trim: true,
    maxlength: [100, 'Client name cannot be more than 100 characters']
  },
  clientEmail: {
    type: String,
    required: [true, 'Please add a client email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  template: {
    type: String,
    enum: ['default', 'photography', 'planning', 'venue', 'catering'],
    default: 'default'
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected'],
    default: 'draft'
  },
  acceptedBy: {
    name: String,
    email: String,
    signature: String,
    date: Date
  },
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewed: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
ProposalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Proposal', ProposalSchema);
