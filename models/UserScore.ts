import mongoose from 'mongoose'

const modificationSchema = new mongoose.Schema({
  scoreChange: {
    type: Number,
    required: true
  },
  oldScore: {
    type: Number,
    required: true
  },
  newScore: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  processedBy: {
    type: String,
    required: true
  },
  processedAt: {
    type: Date,
    default: Date.now
  }
})

const userScoreSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember',
    required: true,
    unique: true
  },
  discordUid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 100,
    min: 0
  },
  totalMeetingsJoined: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  modifications: [modificationSchema]
}, { timestamps: true })

// Index for efficient queries
userScoreSchema.index({ memberId: 1 })
userScoreSchema.index({ score: -1 }) // For leaderboard queries



// Static method to get leaderboard
userScoreSchema.statics.getLeaderboard = async function(limit: number = 10) {
  return await this.find()
    .sort({ score: -1, totalMeetingsJoined: -1 })
    .limit(limit)
    .populate('memberId', 'name discordUid avatar')
}

// Add TypeScript interfaces
interface IModification {
  scoreChange: number
  oldScore: number
  newScore: number
  reason: string
  processedBy: string
  processedAt: Date
}

interface IUserScore {
  memberId: mongoose.Types.ObjectId
  discordUid: string
  name: string
  score: number
  totalMeetingsJoined: number
  lastUpdated: Date
  modifications?: IModification[]
}

interface IUserScoreModel extends mongoose.Model<IUserScore> {
  getLeaderboard(limit?: number): Promise<IUserScore[]>
}

const UserScore = (mongoose.models.UserScore || mongoose.model('UserScore', userScoreSchema)) as IUserScoreModel

export default UserScore 