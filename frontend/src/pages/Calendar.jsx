import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState, useEffect } from "react";

function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    whatsapp: "",
    poster: ""
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const res = await fetch("http://localhost:5000/api/events");
    const data = await res.json();
    setEvents(data);
    return data;
  };

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleDateClick = async (value) => {
    setDate(value);
    const formatted = formatDate(value);

    const res = await fetch("http://localhost:5000/api/events");
    const freshEvents = await res.json();
    setEvents(freshEvents);

    const existing = freshEvents.find(e => e.date === formatted);

    if (existing) {
      setSelectedEvent(existing);
      setIsAdding(false);
      setFormData({
        title: existing.title,
        location: existing.location,
        whatsapp: existing.whatsapp,
        poster: existing.poster
      });
    } else {
      setSelectedEvent(null);
      setIsAdding(true);
      setFormData({ title: "", location: "", whatsapp: "", poster: "" });
    }
  };

  const handleSave = async () => {
    const formatted = formatDate(date);

    if (selectedEvent) {
      await fetch(`http://localhost:5000/api/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, date: formatted })
      });
    } else {
      await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, date: formatted })
      });
    }

    const res = await fetch("http://localhost:5000/api/events");
    const updatedData = await res.json();
    setEvents(updatedData);

    const saved = updatedData.find(e => e.date === formatted);
    setSelectedEvent(saved);
    setIsAdding(false);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    await fetch(`http://localhost:5000/api/events/${selectedEvent.id}`, {
      method: "DELETE"
    });

    const res = await fetch("http://localhost:5000/api/events");
    const updatedData = await res.json();
    setEvents(updatedData);

    setSelectedEvent(null);
    setIsAdding(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, poster: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // Highlight dates that have events
  const tileClassName = ({ date: tileDate, view }) => {
    if (view === "month") {
      const formatted = formatDate(tileDate);
      const hasEvent = events.some(e => e.date === formatted);
      if (hasEvent) return "has-event";
    }
    return null;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Events Calendar</h2>

      <style>{`
        .has-event {
          background-color: #f97316 !important;
          color: white !important;
          border-radius: 50% !important;
          font-weight: bold !important;
        }
        .has-event:hover {
          background-color: #ea6a08 !important;
        }
      `}</style>

      <Calendar
        onChange={handleDateClick}
        value={date}
        tileClassName={tileClassName}
      />

      {isAdding && (
        <div style={{ marginTop: "20px" }}>
          <h3>{selectedEvent ? "Edit Event" : "Add Event"}</h3>

          <input
            placeholder="Event Name"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <br /><br />

          <input
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <br /><br />

          <input
            placeholder="WhatsApp Link"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />

          <br /><br />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          {formData.poster && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={formData.poster}
                alt="Preview"
                style={{ width: "200px", borderRadius: "8px" }}
              />
            </div>
          )}

          <br />

          <button onClick={handleSave}>Save</button>
        </div>
      )}

      {selectedEvent && !isAdding && (
        <div style={{ marginTop: "20px" }}>
          <h3>{selectedEvent.title}</h3>

          <p><strong>Date:</strong> {selectedEvent.date}</p>
          <p><strong>Location:</strong> {selectedEvent.location}</p>

          {selectedEvent.whatsapp && (
            <p>
              <strong>WhatsApp:</strong>{" "}
              <a
                href={selectedEvent.whatsapp}
                target="_blank"
                rel="noreferrer"
                style={{ color: "blue" }}
              >
                Join Group
              </a>
            </p>
          )}

          {selectedEvent.poster && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={selectedEvent.poster}
                alt="Event Poster"
                style={{ width: "300px", borderRadius: "8px" }}
              />
            </div>
          )}

          <br />

          <button onClick={() => {
            setIsAdding(true);
            setFormData({
              title: selectedEvent.title,
              location: selectedEvent.location,
              whatsapp: selectedEvent.whatsapp,
              poster: selectedEvent.poster
            });
          }}>
            Edit
          </button>

          <button
            onClick={handleDelete}
            style={{ marginLeft: "10px", background: "red", color: "white" }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
