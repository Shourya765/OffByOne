import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { getEventById } from "../services/ticketmaster.js";

const router = Router();

router.patch("/interests", authRequired, async (req, res) => {
  const { interests } = req.body;
  if (!Array.isArray(interests)) {
    return res.status(400).json({ error: "interests must be an array" });
  }
  const user = await User.findByIdAndUpdate(
    req.userId,
    { interests: interests.map(String).slice(0, 20) },
    { new: true }
  ).select("-passwordHash");
  res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      interests: user.interests,
      favorites: user.favorites,
      role: user.role || "user",
    },
  });
});

router.get("/favorites", authRequired, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "Not found" });
  const events = [];
  for (const id of user.favorites || []) {
    const ev = await getEventById(id);
    if (ev) events.push(ev);
  }
  res.json({ events });
});

router.post("/favorites/:eventId", authRequired, async (req, res) => {
  const { eventId } = req.params;
  const ev = await getEventById(eventId);
  if (!ev) return res.status(404).json({ error: "Event not found" });
  await User.findByIdAndUpdate(req.userId, { $addToSet: { favorites: eventId } });
  const u = await User.findById(req.userId);
  res.json({ ok: true, favoritesCount: u?.favorites?.length ?? 0 });
});

router.delete("/favorites/:eventId", authRequired, async (req, res) => {
  await User.findByIdAndUpdate(req.userId, { $pull: { favorites: req.params.eventId } });
  res.json({ ok: true });
});

router.get("/notifications-preview", authRequired, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "Not found" });
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 3600 * 1000);
  const upcoming = [];
  for (const id of user.favorites || []) {
    const ev = await getEventById(id);
    if (!ev?.startDate) continue;
    const d = new Date(ev.startDate);
    if (d >= now && d <= in48h && !user.notifiedEventIds?.includes(id)) {
      upcoming.push({ id: ev.id, name: ev.name, startDate: ev.startDate });
    }
  }
  res.json({ upcoming });
});

router.post("/notifications/mark-sent", authRequired, async (req, res) => {
  const { eventIds } = req.body;
  if (!Array.isArray(eventIds)) return res.status(400).json({ error: "eventIds array required" });
  await User.findByIdAndUpdate(req.userId, { $addToSet: { notifiedEventIds: { $each: eventIds } } });
  res.json({ ok: true });
});

export default router;
