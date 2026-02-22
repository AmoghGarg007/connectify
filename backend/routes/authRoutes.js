const express = require("express");
const router = express.Router();
const User = require("../models/users");

const validateSRN = (srn) => {
  const regex = /^pes[12]ug(2[2-5])(cs|am|ec)\d{3}$/i;
  return regex.test(srn);
};

const buildUserResponse = (u) => ({
  id:          u._id,
  name:        u.name,
  srn:         u.srn,
  interests:   u.interests,
  joinedGroups: u.joinedGroups,
  activeGroup: u.activeGroup || null
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { srn, password } = req.body;

  if (!srn || !password)
    return res.status(400).json({ message: "SRN and password are required" });

  if (!validateSRN(srn))
    return res.status(400).json({ message: "Invalid SRN format. Expected format: pes1ug22cs001" });

  try {
    const existingUser = await User.findOne({ srn: srn.toLowerCase() });

    if (existingUser) {
      if (existingUser.password !== password)
        return res.status(401).json({ message: "Incorrect password" });

      return res.json({
        message: "Login successful",
        user: buildUserResponse(existingUser)
      });
    }

    // New user — name is the password
    const newUser = new User({
      srn:      srn.toLowerCase(),
      name:     password,
      password: password
    });

    const saved = await newUser.save();
    return res.status(201).json({
      message: "Account created and logged in",
      user: buildUserResponse(saved)
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PATCH /api/auth/active-group — called by socket when user joins a group
router.patch("/active-group", async (req, res) => {
  const { srn, activeGroup } = req.body;
  if (!srn) return res.status(400).json({ message: "SRN required" });

  try {
    await User.updateOne({ srn: srn.toLowerCase() }, { $set: { activeGroup } });
    res.json({ message: "Active group updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
