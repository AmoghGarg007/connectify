const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  srn: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  interests: [{
    type: String
  }],
  joinedGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group"
  }],
  // Active chat group info for cross-device persistence
  activeGroup: {
    roomId:      { type: String, default: null },
    displayName: { type: String, default: null },
    links:       [{ type: String }],
    expiresAt:   { type: Number, default: null }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
