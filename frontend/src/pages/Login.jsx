import { useState } from "react";
import { useNavigate } from "react-router-dom";

const validateSRN = (srn) => {
  const regex = /^pes[12]ug(2[2-5])(cs|am|ec)\d{3}$/i;
  return regex.test(srn);
};

function LoginPage() {
  const navigate = useNavigate();
  const [srn, setSrn] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const getSRNError = (value) => {
    if (!value) return "";
    const lower = value.toLowerCase();
    if (!lower.startsWith("pes")) return "Must start with 'pes'";
    if (lower.length > 3 && !["1", "2"].includes(lower[3]))
      return "4th character must be 1 or 2 (e.g. pes1...)";
    if (lower.length > 4 && lower.slice(4, 6) !== "ug")
      return "Must have 'ug' after the number (e.g. pes1ug...)";
    if (lower.length > 6) {
      const year = lower.slice(6, 8);
      const validYears = ["22", "23", "24", "25"];
      if (year.length === 2 && !validYears.includes(year))
        return "Year must be 22, 23, 24, or 25";
    }
    if (lower.length > 8) {
      const branch = lower.slice(8, 10);
      if (branch.length === 2 && !["cs", "am", "ec"].includes(branch))
        return "Branch must be cs, am, or ec";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTouched(true);

    if (!validateSRN(srn)) {
      setError("Invalid SRN. Format: pes1ug22cs001");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ srn: srn.toLowerCase(), password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      // Restore active group from DB into localStorage so Chat works cross-device
      const ag = data.user.activeGroup;
      if (ag && ag.roomId) {
        localStorage.setItem("active_group", ag.roomId);
        localStorage.setItem("active_group_display_name", ag.displayName || "");
        localStorage.setItem("active_group_links", JSON.stringify(ag.links || []));
        if (ag.expiresAt) {
          localStorage.setItem("active_group_expires_at", String(ag.expiresAt));
        }
      }

      // Hard refresh so Navbar re-reads localStorage and shows name
      window.location.href = "/";

    } catch (err) {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const srnHint = touched && srn.length > 0 ? getSRNError(srn) : "";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        borderRadius: "12px",
        padding: "40px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        backgroundColor: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h2 style={{ margin: "0 0 6px 0", fontSize: "26px", fontWeight: "700" }}>
          Login
        </h2>
        <p style={{ margin: "0 0 28px 0", opacity: 0.6, fontSize: "14px" }}>
          Enter your Student Registration Number
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600" }}>SRN</label>
            <input
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "15px",
                outline: "none",
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "inherit",
                width: "100%",
                boxSizing: "border-box"
              }}
              placeholder="e.g. pes1ug22cs001"
              value={srn}
              onChange={(e) => { setSrn(e.target.value); setError(""); }}
              onBlur={() => setTouched(true)}
              autoComplete="username"
            />
            {srnHint && (
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#f87171" }}>
                {srnHint}
              </p>
            )}
            <p style={{ margin: "2px 0 0 0", fontSize: "11px", opacity: 0.45 }}>
              Format: pes[1/2] + ug + [22-25] + [cs/am/ec] + [3 digits]
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600" }}>Password</label>
            <input
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "15px",
                outline: "none",
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "inherit",
                width: "100%",
                boxSizing: "border-box"
              }}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#f87171",
              fontSize: "14px"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default LoginPage;
