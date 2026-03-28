import mongoose from "mongoose";

const eventStatSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    views: { type: Number, default: 0 },
    regionKey: { type: String, index: true },
  },
  { timestamps: true }
);

export const EventStat = mongoose.model("EventStat", eventStatSchema);
