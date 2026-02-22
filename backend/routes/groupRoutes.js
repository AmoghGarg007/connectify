const express = require("express");
const router = express.Router();

let groups = [];

router.post("/join", (req, res) => {
  const { interests } = req.body;

  if (!interests || interests.length === 0) {
    return res.status(400).json({ message: "No interests selected" });
  }

  const interest = interests[0]; // match by first interest

  let group = groups.find(
    g => g.interest === interest && g.members.length < 5
  );

  if (!group) {
    group = {
      id: Date.now().toString(),
      interest,
      members: []
    };
    groups.push(group);
  }

  group.members.push(`User-${Math.floor(Math.random() * 1000)}`);

  res.json(group);
});

module.exports = router;