import mongoose from "mongoose";
import { User } from "../models/User.js";

export async function organizerRequired(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database required for organizer features. Set MONGODB_URI and ensure MongoDB is running." });
  }
  const user = await User.findById(req.userId);
  if (!user || user.role !== "organizer") {
    return res.status(403).json({ error: "Organizer account required" });
  }
  next();
}
