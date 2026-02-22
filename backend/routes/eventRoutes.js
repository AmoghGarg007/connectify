const express = require("express");
const router = express.Router();
const Event = require("../models/event");

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    // Map _id to id so the frontend works without changes
    const mapped = events.map(e => ({
      id: e._id,
      date: e.date,
      title: e.title,
      location: e.location,
      whatsapp: e.whatsapp,
      poster: e.poster
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// POST create new event
router.post("/", async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const saved = await newEvent.save();
    res.status(201).json({
      id: saved._id,
      date: saved.date,
      title: saved.title,
      location: saved.location,
      whatsapp: saved.whatsapp,
      poster: saved.poster
    });
  } catch (err) {
    res.status(400).json({ message: "Failed to create event", error: err.message });
  }
});

// PUT update existing event
router.put("/:id", async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({
      id: updated._id,
      date: updated.date,
      title: updated.title,
      location: updated.location,
      whatsapp: updated.whatsapp,
      poster: updated.poster
    });
  } catch (err) {
    res.status(400).json({ message: "Failed to update event", error: err.message });
  }
});

// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete event", error: err.message });
  }
});

module.exports = router;