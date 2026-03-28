const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");

// Use absolute path for logging
const logsDir = path.join(__dirname, "../logs");
const logFilePath = path.resolve(logsDir, "app.log");

console.log("📁 Logs directory path:", logsDir);
console.log("📁 Absolute log file path:", logFilePath);
console.log("📁 Logs directory exists:", fs.existsSync(logsDir));
console.log("📁 Log file exists:", fs.existsSync(logFilePath));

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log("✅ Created logs directory:", logsDir);
}

// Ensure log file exists
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "");
  console.log("✅ Created log file:", logFilePath);
}

const router = express.Router();

// SIGNUP - create user
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ email, password: hashed });
    await user.save();

    return res.status(201).json({ msg: "User created" });
  } catch (error) {
    return res.status(500).json({ msg: "Server error" });
  }
});

// LOGIN - authenticate user
router.post("/login", async (req, res) => {
  console.log("🔍 Login attempt received:", req.body);
  try {
    const { email, password } = req.body;
    console.log("📧 Email:", email, "| Password provided:", !!password);

    const user = await User.findOne({ email });
    if (!user) {
      // Log failed login attempt
      try {
        const logLine =
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "warn",
            message: "auth_failed",
            ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
            email: req.body.email || "",
            statusCode: 401,
          }) + "\n";
        fs.appendFileSync(logFilePath, logLine);
        console.log("✅ Login failure logged: User not found");
      } catch (err) {
        console.error("❌ Failed to write log:", err.message);
      }

      return res.status(400).json({ msg: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Log failed login attempt
      try {
        const logLine =
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "warn",
            message: "auth_failed",
            ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
            email: req.body.email || "",
            statusCode: 401,
          }) + "\n";
        fs.appendFileSync(logFilePath, logLine);
        console.log("✅ Login failure logged: Invalid password");
      } catch (err) {
        console.error("❌ Failed to write log:", err.message);
      }

      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.json({ token, email });
  } catch (error) {
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
