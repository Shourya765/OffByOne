import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    interests: [{ type: String }],
    favorites: [{ type: String }],
    categoryViews: { type: mongoose.Schema.Types.Mixed, default: {} },
    notifiedEventIds: [{ type: String }],
    role: { type: String, enum: ["user", "organizer"], default: "user" },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
