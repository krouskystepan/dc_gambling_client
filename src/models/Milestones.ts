import { Schema, model, Document, models } from 'mongoose'

export type Milestones = Document & {
  guildId: string
  milestones: { threshold: number; reward: number }[]
  createdAt: Date
  updatedAt: Date
}

const MilestonesSchema = new Schema<Milestones>(
  {
    guildId: { type: String, required: true, unique: true }, // unique tady stačí
    milestones: [
      {
        threshold: { type: Number, required: true },
        reward: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
)

export default models.Milestones ||
  model<Milestones>('Milestones', MilestonesSchema)
