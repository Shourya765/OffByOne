import mongoose from "mongoose";
import { getSampleEventsWithDates } from "../data/sampleEvents.js";
import { OrganizerEvent } from "../models/OrganizerEvent.js";

export function docToAppEvent(doc) {
  return {
    id: doc.id,
    source: "organizer",
    name: doc.name,
    description: doc.description || "",
    startDate: doc.startDate,
    venue: doc.venue || "",
    address: doc.address || "",
    city: doc.city,
    stateCode: doc.stateCode || "",
    countryCode: doc.countryCode,
    lat: doc.lat,
    lng: doc.lng,
    category: doc.category,
    image: doc.image || "",
    url: doc.url || null,
    priceRange: doc.priceRange || "paid",
    organizer: doc.organizer,
  };
}

/** Sample events plus organizer-created events (MongoDB), for search and detail. */
export async function getCatalogEventsWithDates() {
  const sample = getSampleEventsWithDates();
  if (mongoose.connection.readyState !== 1) return sample;
  const docs = await OrganizerEvent.find({}).lean();
  if (!docs.length) return sample;
  return [...sample, ...docs.map(docToAppEvent)];
}

export async function getOrganizerEventById(id) {
  if (mongoose.connection.readyState !== 1) return null;
  const doc = await OrganizerEvent.findOne({ id }).lean();
  return doc ? docToAppEvent(doc) : null;
}
