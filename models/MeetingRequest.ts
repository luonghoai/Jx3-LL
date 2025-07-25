import mongoose from 'mongoose'

const meetingParticipantSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  discordUid: {
    type: String,
    required: false
  },
  meetingRole: {
    type: String,
    required: true
  },
  meetingClass: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    default: 0
  }
})

const temporaryGuestSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  discordUid: {
    type: String,
    required: false
  },
  roles: [{
    type: String,
    required: true
  }],
  classes: [{
    type: String,
    required: true
  }],
  meetingRole: {
    type: String,
    required: true
  },
  meetingClass: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    default: 0
  }
})

const joinRequestSchema = new mongoose.Schema({
  discordUid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  requestedRole: {
    type: String,
    required: true
  },
  requestedClass: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date,
    default: null
  },
  processedBy: {
    type: String,
    default: null
  },
  reason: {
    type: String,
    default: null
  }
})

const meetingRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'confirmed', 'completed', 'canceled'],
    default: 'draft'
  },
  participants: [meetingParticipantSchema],
  temporaryGuests: [temporaryGuestSchema],
  joinRequests: [joinRequestSchema],
  hoster: {
    memberId: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    discordUid: {
      type: String,
      required: false
    },
    meetingRole: {
      type: String,
      required: false
    },
    meetingClass: {
      type: String,
      required: false
    },
    score: {
      type: Number,
      required: false
    },
    selectedAt: {
      type: Date,
      required: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.models.MeetingRequest || mongoose.model('MeetingRequest', meetingRequestSchema) 