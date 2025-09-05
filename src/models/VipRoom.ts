import { Schema, model, Document, models } from 'mongoose'

export type VipRoom = Document & {
  userId: string
  guildId: string
  channelId: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const VipRoomSchema = new Schema<VipRoom>(
  {
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
)

VipRoomSchema.index({ expiresAt: 1 })
VipRoomSchema.index({ userId: 1, guildId: 1 }, { unique: true })

export default models.VipRoom || model<VipRoom>('VipRoom', VipRoomSchema)
