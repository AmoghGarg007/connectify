import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

function Navbar() {

  const [showNav, setShowNav]       = useState(true);
  const [userName, setUserName]     = useState(null);
  const [dropdownOpen, setDropdown] = useState(false);
  const dropdownRef                 = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setUserName(user.name);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    let lastScroll = window.scrollY;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowNav(currentScroll <= lastScroll);
      lastScroll = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("active_group");
    localStorage.removeItem("active_group_display_name");
    localStorage.removeItem("active_group_links");
    localStorage.removeItem("active_group_expires_at");
    localStorage.removeItem("demo_username");
    window.location.href = "/";
  };

  return (
    <nav className={`navbar ${showNav ? "nav-show" : "nav-hide"}`}>
      <h2 className="logo">Connectify</h2>

      <div className="nav-links" style={{ flexWrap: "nowrap", alignItems: "center" }}>
        <Link to="/">Home</Link>
        <Link to="/find-group">Find Group</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/calendar">Calendar</Link>

        {userName ? (
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <span
              onClick={() => setDropdown(o => !o)}
              style={{
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                userSelect: "none",
                whiteSpace: "nowrap"
              }}
            >
              {userName}
              <span style={{ fontSize: "10px", opacity: 0.7 }}>▼</span>
            </span>

            {dropdownOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                backgroundColor: "#1e2130",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                padding: "4px",
                minWidth: "120px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                zIndex: 1000
              }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "8px 14px",
                    background: "none",
                    border: "none",
                    color: "#f87171",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    borderRadius: "6px",
                    textAlign: "left"
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = "rgba(239,68,68,0.1)"}
                  onMouseLeave={e => e.target.style.backgroundColor = "transparent"}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
