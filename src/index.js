const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const otpStore = new Map();

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/otp/send", (req, res) => {
  const { user_id, signup_method, platform, device } = req.body;
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const createdAt = Date.now();
  const expiresInSec = 300;
  otpStore.set(user_id, { otp, createdAt });

  // POC: return OTP directly so the frontend can continue the flow.
  res.json({ otp, expires_in_sec: expiresInSec });
});

app.post("/otp/verify", (req, res) => {
  const { user_id, otp, signup_method, platform, device } = req.body;
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const otpEntry = otpStore.get(user_id);
  const savedOtp = otpEntry?.otp;
  const isValid = savedOtp === otp;
  const otpAgeMs = otpEntry ? Date.now() - otpEntry.createdAt : null;

  res.json({ success: isValid });
});

app.post("/signup/complete", (req, res) => {
  const { user_id, signup_method, platform, device } = req.body;

  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
