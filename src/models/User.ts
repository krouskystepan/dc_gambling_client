import { Schema, model, Document, models } from 'mongoose'

export type UserDoc = Document & {
  userId: string
  guildId: string
  balance: number
  lastDailyClaim: Date
  dailyStreak: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<UserDoc>(
  {
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    balance: { type: Number, default: 0 },
    lastDailyClaim: { type: Date, default: null },
    dailyStreak: { type: Number, default: 0 },
  },
  { timestamps: true }
)

UserSchema.index({ userId: 1, guildId: 1 }, { unique: true })

export default models.User || model<UserDoc>('User', UserSchema)
