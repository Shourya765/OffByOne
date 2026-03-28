import mongoose from "mongoose";

const organizerEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    source: { type: String, default: "organizer" },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startDate: { type: String, required: true },
    venue: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, required: true, trim: true },
    stateCode: { type: String, default: "", trim: true, uppercase: true },
    countryCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 2 },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    url: { type: String, default: null },
    priceRange: { type: String, enum: ["free", "paid", "unknown"], default: "paid" },
    organizer: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const OrganizerEvent = mongoose.model("OrganizerEvent", organizerEventSchema);
