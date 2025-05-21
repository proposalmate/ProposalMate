const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  clientName: {
    type: String,
    trim: true,
    maxlength: [100, 'Client name cannot be more than 100 characters']
  },
  clientEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  content: {
    type: String
  },
  template: {
    type: String,
    enum: ['default', 'photography', 'planning', 'venue', 'catering'],
    default: 'default'
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'declined'],
    default: 'draft'
  },
  acceptedBy: {
    name: String,
    email: String,
    signature: String,
    date: Date
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
ProposalSchema.index({ user: 1, createdAt: -1 });

// Log proposal creation for debugging
ProposalSchema.pre('save', function(next) {
  if (this.isNew) {
    console.log(`Creating new proposal: ${this.title} for user: ${this.user}`);
  } else {
    console.log(`Updating proposal: ${this._id}, status: ${this.status}`);
  }
  next();
});

module.exports = mongoose.model('Proposal', ProposalSchema);
