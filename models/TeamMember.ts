import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMember extends Document {
  name: string;
  discordUid: string;
  roles: string[];
  classes: string[];
  avatar?: string;
  isActive: boolean;
  lastUpdated: Date;
}

const TeamMemberSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  discordUid: {
    type: String,
    required: false,
    trim: true,
  },
  roles: [{
    type: String,
    required: true,
  }],
  classes: [{
    type: String,
    required: true,
  }],
  avatar: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Update lastUpdated field on save
TeamMemberSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.models.TeamMember || mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema); 