import { Schema, model, Document, models } from 'mongoose'

export type Milestones = Document & {
  guildId: string
  baseThreshold: number
  baseReward: number
  multiplierThreshold: number
  multiplierReward: number
  createdAt: Date
  updatedAt: Date
}

const MilestonesSchema = new Schema<Milestones>(
  {
    guildId: { type: String, required: true, unique: true },
    baseThreshold: { type: Number, required: true, default: 10_000 },
    baseReward: { type: Number, required: true, default: 500 },
    multiplierThreshold: { type: Number, required: true, default: 1.5 },
    multiplierReward: { type: Number, required: true, default: 1.5 },
  },
  { timestamps: true }
)

export default models.Milestones ||
  model<Milestones>('Milestones', MilestonesSchema)
