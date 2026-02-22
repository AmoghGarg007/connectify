import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import socket from "../socket";

function FindGroup() {

  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");

  const activeGroup = localStorage.getItem("active_group");

  const getSrn = () => {
    try { return JSON.parse(localStorage.getItem("user") || "{}").srn || ""; }
    catch { return ""; }
  };

  useEffect(() => {
    document.title = "Find Group | Connectify";

    socket.on("matchedGroup", (roomId) => {
      localStorage.setItem("active_group", typeof roomId === "string" ? roomId : roomId.roomId);
      setMessage("Matched! Redirecting to chat...");
      navigate("/chat", { state: { groupId: roomId } });
    });

    return () => { socket.off("matchedGroup"); };
  }, [navigate]);

  const interests = [
    "AI / ML", "Web Dev", "Cybersecurity", "Gaming",
    "Design", "Music", "Entrepreneurship", "Fitness",
  ];

  const toggleInterest = (item) => {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const matchUser = () => {
    if (selected.length === 0) return;
    socket.emit("joinMatch", { interests: selected, srn: getSrn() });
  };

  if (activeGroup) {
    return (
      <div className="page-root">
        <section className="section findgroup-section">
          <h2 className="section-title">You are already part of a group</h2>
          <button onClick={() => navigate("/chat")}>Go to Chat</button>
          <div style={{ marginTop: "20px" }}>
            <button
              style={{ background: "#ef4444" }}
              onClick={() => {
                localStorage.removeItem("active_group");
                window.location.reload();
              }}
            >
              Leave Current Group
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-root">
      <section className="section findgroup-section">
        <h2 className="section-title">Find Your Group</h2>

        <div className="interest-grid">
          {interests.map((item) => (
            <div
              key={item}
              className={`interest-card glass ${selected.includes(item) ? "selected" : ""}`}
              onClick={() => toggleInterest(item)}
            >
              {item}
            </div>
          ))}
        </div>

        <div className="match-btn-wrapper">
          <button disabled={selected.length === 0} onClick={matchUser}>
            Match Me
          </button>
        </div>

        {message && <p>{message}</p>}
      </section>
    </div>
  );
}

export default FindGroup;
