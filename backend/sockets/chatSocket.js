const groups = {};
const Message = require("../models/Message");
const User    = require("../models/users");

const CHAT_ACTIVE_DURATION = 5 * 24 * 60 * 60 * 1000;
const CHAT_DELETE_DELAY    = 2 * 24 * 60 * 60 * 1000;

const adjectives = [
  "Cosmic", "Chaotic", "Legendary", "Sneaky", "Turbo",
  "Spicy", "Cursed", "Sleepy", "Hyper", "Feral",
  "Glitchy", "Sus", "Unhinged", "Crispy", "Vibing",
  "Caffeinated", "Mysterious", "Absurd"
];

const nouns = [
  "Penguins", "Potatoes", "Ninjas", "Raccoons", "Gremlins",
  "Noodles", "Wizards", "Goblins", "Pandas", "Tacos",
  "Ducks", "Gnomes", "Bots", "Monkeys", "Hamsters",
  "Pirates", "Sloths", "Flamingos", "Otters", "Waffles"
];

const randomGCName = () => {
  const adj  = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
};

/* ===============================
   SAVE ACTIVE GROUP TO DB
================================ */

const saveActiveGroup = async (srn, groupData) => {
  if (!srn) return;
  try {
    await User.updateOne(
      { srn: srn.toLowerCase() },
      { $set: { activeGroup: groupData } }
    );
  } catch (err) {
    console.log("Could not save active group:", err.message);
  }
};

const clearActiveGroup = async (srn) => {
  if (!srn) return;
  try {
    await User.updateOne(
      { srn: srn.toLowerCase() },
      { $set: { activeGroup: { roomId: null, displayName: null, links: [], expiresAt: null } } }
    );
  } catch (err) {
    console.log("Could not clear active group:", err.message);
  }
};

/* ===============================
   TIMER HELPERS
================================ */

const resetGroupTimer = (io, groupId) => {
  const group = groups[groupId];
  if (!group) return;

  if (group.expiryTimer) clearTimeout(group.expiryTimer);
  if (group.deleteTimer) clearTimeout(group.deleteTimer);

  const expiresAt = Date.now() + CHAT_ACTIVE_DURATION;
  group.expiresAt = expiresAt;

  io.to(groupId).emit("timerReset", { expiresAt });

  group.expiryTimer = setTimeout(() => {
    if (!groups[groupId]) return;

    groups[groupId].locked = true;
    io.to(groupId).emit("chatExpired");
    console.log(`Group ${groupId} chat locked`);

    // Clear active group from all member DB records
    const srns = groups[groupId].memberSrns || [];
    srns.forEach(srn => clearActiveGroup(srn));

    group.deleteTimer = setTimeout(() => {
      delete groups[groupId];
      console.log(`Group ${groupId} deleted`);
    }, CHAT_DELETE_DELAY);

  }, CHAT_ACTIVE_DURATION);
};


/* ===============================
   SOCKET EXPORT
================================ */

module.exports = (io) => {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    /* ===============================
       MATCH BY INTERESTS
    =============================== */

    socket.on("joinMatch", ({ interests, srn }) => {

      let targetGroup    = null;
      let bestScore      = 0;
      let sharedInterest = null;

      for (const id in groups) {
        if (groups[id].members.length >= 5) continue;
        if (groups[id].locked) continue;

        const allGroupInterests = [
          ...new Set(Object.values(groups[id].memberInterests).flat())
        ];

        const common = interests.filter(i => allGroupInterests.includes(i));

        if (common.length > 0 && common.length > bestScore) {
          bestScore      = common.length;
          targetGroup    = id;
          sharedInterest = common[0];
        }
      }

      if (!targetGroup) {
        const groupId = `group_${Date.now()}`;
        groups[groupId] = {
          members:         [],
          memberSrns:      [],
          memberInterests: {},
          displayName:     randomGCName(),
          links:           [],
          locked:          false,
          expiresAt:       null,
          expiryTimer:     null,
          deleteTimer:     null
        };
        targetGroup = groupId;
      }

      if (groups[targetGroup].members.length >= 5) {
        socket.emit("groupFull");
        return;
      }

      if (!groups[targetGroup].members.includes(socket.id)) {
        groups[targetGroup].members.push(socket.id);
        groups[targetGroup].memberInterests[socket.id] = interests;
        if (srn && !groups[targetGroup].memberSrns.includes(srn)) {
          groups[targetGroup].memberSrns.push(srn);
        }
      }

      if (sharedInterest && !groups[targetGroup].links.includes(sharedInterest)) {
        groups[targetGroup].links.push(sharedInterest);
      }

      socket.join(targetGroup);
      socket.srn     = srn;
      socket.groupId = targetGroup;

      const { displayName, links, expiresAt } = groups[targetGroup];

      // Persist to DB so user can rejoin from another device
      saveActiveGroup(srn, { roomId: targetGroup, displayName, links, expiresAt });

      socket.emit("matchedGroup", { roomId: targetGroup, displayName, links, expiresAt });

      console.log("Matched:", socket.id, "->", targetGroup, `(${displayName})`);
    });


    /* ===============================
       JOIN GROUP — send history
    =============================== */

    socket.on("joinGroup", async ({ requestedGroup, username, srn }) => {

      socket.join(requestedGroup);
      socket.srn     = srn;
      socket.groupId = requestedGroup;

      console.log(`${username} joined group: ${requestedGroup}`);

      if (groups[requestedGroup]) {
        resetGroupTimer(io, requestedGroup);
        socket.emit("timerReset", { expiresAt: groups[requestedGroup].expiresAt });

        // Track srn in group
        if (srn && !groups[requestedGroup].memberSrns?.includes(srn)) {
          if (!groups[requestedGroup].memberSrns) groups[requestedGroup].memberSrns = [];
          groups[requestedGroup].memberSrns.push(srn);
        }
      }

      const expiresAt = groups[requestedGroup]?.expiresAt || null;

      // Send chat history so other devices catch up
      try {
        const history = await Message.find({ receiver: requestedGroup })
          .sort({ timestamp: 1 })
          .limit(200)
          .lean();

        socket.emit("chatHistory", history.map(m => ({
          groupId:   m.receiver,
          sender:    m.sender,
          text:      m.text,
          timestamp: m.timestamp
        })));
      } catch (err) {
        console.log("Could not load chat history:", err.message);
      }

      socket.emit("joinedGroup", { groupId: requestedGroup, expiresAt });
    });


    /* ===============================
       SEND MESSAGE — persist to DB
    =============================== */

    socket.on("sendMessage", async (data) => {
      const group = groups[data.groupId];

      if (!group || group.locked) {
        socket.emit("chatExpired");
        return;
      }

      try {
        await Message.create({
          sender:    data.sender,
          receiver:  data.groupId,
          text:      data.text,
          timestamp: new Date()
        });
      } catch (err) {
        console.log("Could not save message:", err.message);
      }

      socket.to(data.groupId).emit("receiveMessage", data);
    });


    /* ===============================
       CHECK GROUP
    =============================== */

    socket.on("checkGroup", (groupId, callback) => {
      callback(!!groups[groupId]);
    });


    /* ===============================
       DISCONNECT
    =============================== */

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (const id in groups) {
        groups[id].members = groups[id].members.filter(m => m !== socket.id);
        delete groups[id].memberInterests[socket.id];

        if (groups[id].members.length === 0) {
          if (groups[id].expiryTimer) clearTimeout(groups[id].expiryTimer);
          if (groups[id].deleteTimer) clearTimeout(groups[id].deleteTimer);
          delete groups[id];
          console.log("Deleted empty group:", id);
        }
      }
    });

  });

};
