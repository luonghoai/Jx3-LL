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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.models.MeetingRequest || mongoose.model('MeetingRequest', meetingRequestSchema) 