import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "14d" });
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, asOrganizer } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const role = asOrganizer === true || asOrganizer === "true" ? "organizer" : "user";
    const user = await User.create({
      email: String(email).toLowerCase(),
      passwordHash,
      name: name || "",
      interests: [],
      favorites: [],
      role,
    });
    const token = signToken(user._id.toString());
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        interests: user.interests,
        favorites: user.favorites,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken(user._id.toString());
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        interests: user.interests,
        favorites: user.favorites,
        role: user.role || "user",
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", authRequired, async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
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

export default router;
