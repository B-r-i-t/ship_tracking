import { useState, useEffect, useCallback } from "react";

// ─── Mock Data Store ──────────────────────────────────────────────────────────

const STATUSES = ["Processing", "In Transit", "Out for Delivery", "Delivered", "Delayed"];
const STATUS_COLORS = {
  Processing: "#6366f1",
  "In Transit": "#0ea5e9",
  "Out for Delivery": "#f59e0b",
  Delivered: "#10b981",
  Delayed: "#ef4444",
};
const STATUS_ICONS = {
  Processing: "📦",
  "In Transit": "🚚",
  "Out for Delivery": "🏠",
  Delivered: "✅",
  Delayed: "⚠️",
};


// ─── Simulated API ────────────────────────────────────────────────────────────





// ─── Styles ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f8f7f4;
    --surface: #ffffff;
    --surface2: #f2f0ec;
    --border: #e5e2db;
    --text: #1a1915;
    --text2: #6b6860;
    --text3: #9b998f;
    --accent: #1a1915;
    --accent2: #2d2b26;
    --blue: #1d6ae5;
    --blue-bg: #eff4ff;
    --green: #16a34a;
    --green-bg: #f0fdf4;
    --amber: #d97706;
    --amber-bg: #fffbeb;
    --red: #dc2626;
    --red-bg: #fef2f2;
    --purple: #7c3aed;
    --purple-bg: #f5f3ff;
    --r: 10px;
    --r-lg: 16px;
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
    --font: 'DM Sans', sans-serif;
    --font-display: 'Space Grotesk', sans-serif;
  }

  [data-dark] {
    --bg: #111110;
    --surface: #1c1c1a;
    --surface2: #252523;
    --border: #2e2e2b;
    --text: #f5f4f0;
    --text2: #a8a69e;
    --text3: #6b6860;
    --blue-bg: #0f1d3a;
    --green-bg: #0a1f10;
    --amber-bg: #1f1600;
    --red-bg: #200a0a;
    --purple-bg: #1a1030;
    --shadow: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  }

  body { font-family: var(--font); background: var(--bg); color: var(--text); min-height: 100vh; transition: background 0.3s, color 0.3s; }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* NAV */
  .nav { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; backdrop-filter: blur(8px); }
  .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
  .logo { font-family: var(--font-display); font-weight: 700; font-size: 18px; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .logo-icon { width: 30px; height: 30px; background: var(--text); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--surface); font-size: 14px; }
  .nav-links { display: flex; align-items: center; gap: 4px; }
  .nav-btn { background: none; border: none; padding: 6px 14px; border-radius: var(--r); cursor: pointer; font-family: var(--font); font-size: 14px; color: var(--text2); transition: all 0.15s; }
  .nav-btn:hover { background: var(--surface2); color: var(--text); }
  .nav-btn.active { background: var(--text); color: var(--surface); }
  .nav-btn.icon-btn { padding: 6px 10px; font-size: 16px; }

  /* HERO */
  .hero { padding: 80px 24px 60px; text-align: center; max-width: 700px; margin: 0 auto; }
  .hero-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 4px 14px; font-size: 12px; color: var(--text2); margin-bottom: 24px; box-shadow: var(--shadow); }
  .hero h1 { font-family: var(--font-display); font-size: clamp(32px, 5vw, 56px); font-weight: 700; line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 16px; }
  .hero p { font-size: 16px; color: var(--text2); line-height: 1.6; margin-bottom: 40px; }

  /* SEARCH */
  .search-box { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; padding: 6px 6px 6px 20px; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-md); transition: border-color 0.2s, box-shadow 0.2s; }
  .search-box:focus-within { border-color: var(--text); box-shadow: 0 0 0 4px rgba(26,25,21,0.06), var(--shadow-md); }
  .search-input { flex: 1; border: none; background: transparent; font-family: var(--font); font-size: 16px; color: var(--text); outline: none; min-width: 0; }
  .search-input::placeholder { color: var(--text3); }
  .search-btn { background: var(--text); color: var(--surface); border: none; border-radius: 10px; padding: 12px 24px; font-family: var(--font); font-size: 15px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: opacity 0.15s, transform 0.1s; display: flex; align-items: center; gap: 8px; }
  .search-btn:hover { opacity: 0.85; }
  .search-btn:active { transform: scale(0.98); }
  .search-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* SPINNER */
  .spinner { width: 18px; height: 18px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* CARDS */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 24px; box-shadow: var(--shadow); }

  /* TRACKING RESULT */
  .result-container { max-width: 760px; margin: 0 auto; padding: 0 24px 60px; animation: fadeUp 0.4s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .status-header { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 24px; padding: 20px 24px; border-radius: var(--r-lg); }
  .status-badge { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 6px 16px; font-size: 13px; font-weight: 600; letter-spacing: 0.2px; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

  .progress-track { background: var(--surface2); border-radius: 999px; height: 6px; margin: 20px 0; overflow: visible; position: relative; }
  .progress-fill { height: 100%; border-radius: 999px; transition: width 1s cubic-bezier(.4,0,.2,1); }
  .progress-steps { display: flex; justify-content: space-between; margin-top: 10px; }
  .progress-step { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10px; font-weight: 500; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; max-width: 70px; text-align: center; cursor: default; }
  .progress-step.done { color: var(--text2); }
  .progress-step.current { color: var(--text); font-weight: 600; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .info-item { }
  .info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text3); font-weight: 600; margin-bottom: 4px; }
  .info-value { font-size: 15px; color: var(--text); font-weight: 500; }

  .timeline { }
  .timeline-header { font-family: var(--font-display); font-size: 15px; font-weight: 600; margin-bottom: 16px; }
  .timeline-item { display: flex; gap: 16px; padding-bottom: 20px; position: relative; }
  .timeline-item:not(:last-child)::before { content: ''; position: absolute; left: 18px; top: 36px; bottom: 0; width: 1px; background: var(--border); }
  .timeline-icon { width: 36px; height: 36px; background: var(--surface2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; border: 2px solid var(--border); z-index: 1; }
  .timeline-item.latest .timeline-icon { background: var(--text); border-color: var(--text); }
  .timeline-content { flex: 1; padding-top: 6px; }
  .timeline-event { font-size: 14px; font-weight: 500; color: var(--text); }
  .timeline-meta { font-size: 12px; color: var(--text3); margin-top: 2px; }

  /* ERROR */
  .error-box { background: var(--red-bg); border: 1px solid #fca5a5; border-radius: var(--r-lg); padding: 20px 24px; color: var(--red); display: flex; align-items: center; gap: 12px; margin: 0 24px 24px; max-width: 760px; margin-left: auto; margin-right: auto; animation: fadeUp 0.3s ease; }

  /* QUICK EXAMPLES */
  .examples { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 20px; }
  .example-chip { background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 5px 14px; font-size: 12px; color: var(--text2); cursor: pointer; transition: all 0.15s; font-family: var(--font-mono, monospace); }
  .example-chip:hover { background: var(--surface2); color: var(--text); border-color: var(--text3); }

  /* STATS */
  .stats { max-width: 1200px; margin: 0 auto; padding: 0 24px 48px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 20px; box-shadow: var(--shadow); }
  .stat-num { font-family: var(--font-display); font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 1; margin-bottom: 6px; }
  .stat-label { font-size: 12px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }

  /* ADMIN */
  .admin-layout { max-width: 1200px; margin: 0 auto; padding: 32px 24px; display: grid; grid-template-columns: 240px 1fr; gap: 24px; }
  @media (max-width: 768px) { .admin-layout { grid-template-columns: 1fr; } }
  .admin-sidebar { }
  .admin-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: var(--r); cursor: pointer; font-size: 14px; color: var(--text2); transition: all 0.15s; margin-bottom: 2px; }
  .admin-nav-item:hover { background: var(--surface2); color: var(--text); }
  .admin-nav-item.active { background: var(--text); color: var(--surface); }
  .admin-main { min-width: 0; }

  /* TABLE */
  .table-wrap { overflow-x: auto; border-radius: var(--r-lg); border: 1px solid var(--border); box-shadow: var(--shadow); }
  table { width: 100%; border-collapse: collapse; background: var(--surface); font-size: 13px; }
  th { text-align: left; padding: 12px 16px; background: var(--surface2); color: var(--text3); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; border-bottom: 1px solid var(--border); }
  td { padding: 14px 16px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--surface2); }

  /* FORMS */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 12px; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
  .form-input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r); padding: 10px 14px; font-family: var(--font); font-size: 14px; color: var(--text); outline: none; transition: border-color 0.15s; }
  .form-input:focus { border-color: var(--text); background: var(--surface); }
  select.form-input { cursor: pointer; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } .info-grid { grid-template-columns: 1fr; } }

  /* BUTTONS */
  .btn { border: none; border-radius: var(--r); padding: 10px 18px; font-family: var(--font); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
  .btn-primary { background: var(--text); color: var(--surface); }
  .btn-primary:hover { opacity: 0.8; }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { background: var(--border); }
  .btn-danger { background: var(--red-bg); color: var(--red); border: 1px solid #fca5a5; }
  .btn-danger:hover { background: #fca5a5; }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* MODAL */
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: var(--surface); border-radius: var(--r-lg); padding: 28px; width: 100%; max-width: 540px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: slideUp 0.25s ease; max-height: 90vh; overflow-y: auto; }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .modal-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; }
  .modal-close { background: var(--surface2); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; color: var(--text2); }
  .modal-close:hover { background: var(--border); }

  /* TOAST */
  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--text); color: var(--surface); padding: 12px 20px; border-radius: var(--r); font-size: 14px; font-weight: 500; z-index: 300; box-shadow: var(--shadow-md); animation: toastIn 0.3s ease; max-width: 320px; display: flex; align-items: center; gap: 8px; }
  @keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .toast.error { background: var(--red); }
  .toast.success { background: #16a34a; }

  /* LOGIN */
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .login-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 40px; width: 100%; max-width: 400px; box-shadow: var(--shadow-md); }
  .login-title { font-family: var(--font-display); font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px; }
  .login-sub { text-align: center; color: var(--text2); font-size: 14px; margin-bottom: 32px; }

  /* MISC */
  .section-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; margin-bottom: 16px; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-8 { gap: 8px; }
  .gap-12 { gap: 12px; }
  .mb-16 { margin-bottom: 16px; }
  .mb-24 { margin-bottom: 24px; }
  .tag { display: inline-flex; align-items: center; gap: 4px; border-radius: 999px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
  .divider { height: 1px; background: var(--border); margin: 20px 0; }
  .empty { text-align: center; padding: 40px; color: var(--text3); font-size: 14px; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; }
  .chip { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 6px 12px; font-size: 13px; cursor: pointer; transition: all 0.15s; color: var(--text2); }
  .chip.active, .chip:hover { background: var(--text); color: var(--surface); border-color: var(--text); }
  .id-chip { font-family: monospace; font-size: 12px; background: var(--surface2); border-radius: 6px; padding: 2px 7px; color: var(--text2); }
`;

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const colors = { Processing: ["#6366f1", "#ede9fe"], "In Transit": ["#0ea5e9", "#e0f2fe"], "Out for Delivery": ["#d97706", "#fef3c7"], Delivered: ["#16a34a", "#dcfce7"], Delayed: ["#dc2626", "#fee2e2"] };
  const [fg, bg] = colors[status] || ["#6b6860", "#f2f0ec"];
  return (
    <span className="status-badge" style={{ background: bg, color: fg }}>
      <span className="status-dot" style={{ background: fg }} />
      {status}
    </span>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`}><span>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>{msg}</div>;
}

function ProgressBar({ status }) {
  const steps = ["Processing", "In Transit", "Out for Delivery", "Delivered"];
  const pct = { Processing: 15, "In Transit": 45, "Out for Delivery": 78, Delivered: 100, Delayed: 45 };
  const cur = steps.indexOf(status === "Delayed" ? "In Transit" : status);
  const fillColor = status === "Delayed" ? "#ef4444" : status === "Delivered" ? "#10b981" : "#1d6ae5";
  return (
    <div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct[status] || 0}%`, background: fillColor }} />
      </div>
      <div className="progress-steps">
        {steps.map((s, i) => (
          <div key={s} className={`progress-step${i < cur ? " done" : ""}${i === cur ? " current" : ""}`}>
            <span style={{ fontSize: 14 }}>{i <= cur ? "●" : "○"}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function Home({ onTrack }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSearch = async (id) => {
    const q = (id || input).trim().toUpperCase();
    if (!q) { setError("Please enter a tracking ID"); return; }
    if (q.length < 4) { setError("Tracking ID must be at least 4 characters"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/shipments/${q}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tracking ID not found");
      setResult(data.shipment);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="hero">
        <div className="hero-badge">🚀 Real-time global shipment tracking</div>
        <h1>Track any<br />shipment, anywhere</h1>
        <p>Enter your tracking ID below to get real-time updates on your shipment's location and delivery status.</p>
        <div className="search-box">
          <span style={{ fontSize: 20, color: "var(--text3)" }}>🔍</span>
          <input
            className="search-input"
            placeholder="Enter tracking ID (e.g. SHT001ABC)"
            value={input}
            onChange={e => { setInput(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={() => handleSearch()} disabled={loading}>
            {loading ? <span className="spinner" /> : "Track"}
          </button>
        </div>

      </div>

      {error && (
        <div className="error-box">
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div><strong>Error:</strong> {error}</div>
        </div>
      )}

      {result && <TrackingResult shipment={result} />}

      {!result && !error && (
        <div className="stats">
          {[["12M+", "Packages Delivered"], ["99.2%", "On-time Rate"], ["180+", "Countries"], ["24/7", "Live Support"]].map(([n, l]) => (
            <div key={l} className="stat-card">
              <div className="stat-num">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TRACKING RESULT ─────────────────────────────────────────────────────────
function TrackingResult({ shipment: s }) {
  const statusBg = { Processing: "var(--purple-bg)", "In Transit": "var(--blue-bg)", "Out for Delivery": "var(--amber-bg)", Delivered: "var(--green-bg)", Delayed: "var(--red-bg)" };
  return (
    <div className="result-container">
      <div className="card">
        <div style={{ background: statusBg[s.status] || "var(--surface2)", borderRadius: "var(--r)", padding: "16px 20px", marginBottom: 20 }}>
          <div className="flex items-center justify-between mb-16" style={{ flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text3)", fontWeight: 600, marginBottom: 4 }}>Tracking ID</div>
              <span className="id-chip" style={{ fontSize: 15, fontWeight: 700 }}>{s.id}</span>
            </div>
            <StatusBadge status={s.status} />
          </div>
          <ProgressBar status={s.status} />
        </div>

        <div className="info-grid mb-24">
          {[["From", s.sender?.name || s.sender], ["To", s.receiver?.name || s.receiver], ["Origin", s.origin], ["Destination", s.destination], ["Service", s.service], ["Weight", s.weight ? `${s.weight} kg` : ""], ["Est. Delivery", s.estimatedDelivery], ["Created", s.createdAt]].map(([l, v]) => (
            <div key={l} className="info-item">
              <div className="info-label">{l}</div>
              <div className="info-value">{v}</div>
            </div>
          ))}
        </div>

        <div className="timeline">
          <div className="timeline-header">Shipment History</div>
          {[...s.history].reverse().map((h, i) => (
            <div key={i} className={`timeline-item${i === 0 ? " latest" : ""}`}>
              <div className="timeline-icon" style={i === 0 ? { color: "var(--surface)" } : {}}>{h.icon}</div>
              <div className="timeline-content">
                <div className="timeline-event">{h.event}</div>
                <div className="timeline-meta">{h.date} · {h.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !pass) { setErr("Please fill in all fields"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid credentials");
      localStorage.setItem("token", data.token);
      onLogin();
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="logo-icon" style={{ width: 48, height: 48, margin: "0 auto 16px", fontSize: 22 }}>📦</div>
        </div>
        <div className="login-title">Admin Portal</div>
        <div className="login-sub">Sign in to manage shipments</div>
        {err && <div className="error-box" style={{ marginBottom: 16 }}><span>⚠️</span>{err}</div>}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your email" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" value={pass} onChange={e => { setPass(e.target.value); setErr(""); }} type="password" placeholder="Enter password" onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={handle} disabled={loading}>
          {loading ? <span className="spinner" /> : "Sign In"}
        </button>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
function AdminDashboard({ onLogout, showToast }) {
  const [tab, setTab] = useState("shipments");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/shipments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setShipments(data.shipments || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = shipments.filter(s => {
    const matchStatus = filter === "All" || s.status === filter;
    const matchSearch = !search || s.id.toLowerCase().includes(search.toLowerCase()) || s.receiver.toLowerCase().includes(search.toLowerCase()) || s.sender.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = STATUSES.reduce((a, s) => ({ ...a, [s]: shipments.filter(x => x.status === s).length }), {});

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text3)", fontWeight: 600, marginBottom: 8, paddingLeft: 14 }}>Navigation</div>
          {[["📊", "shipments", "Shipments"], ["➕", "create", "Create New"], ["📈", "analytics", "Analytics"]].map(([icon, id, label]) => (
            <div key={id} className={`admin-nav-item${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>
              <span>{icon}</span>{label}
            </div>
          ))}
          <div className="divider" />
          <div className="admin-nav-item" onClick={onLogout}><span>🚪</span>Sign Out</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text3)", fontWeight: 600, marginBottom: 12 }}>Status Summary</div>
          {STATUSES.map(s => (
            <div key={s} className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text2)" }}>{s}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[s] }}>{counts[s] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-main">
        {tab === "shipments" && (
          <ShipmentsTab
            shipments={filtered}
            allShipments={shipments}
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
            loading={loading}
            onEdit={s => setModal({ type: "edit", shipment: s })}
            onAddEvent={s => setModal({ type: "event", shipment: s })}
            onDelete={async s => {
              // eslint-disable-next-line no-restricted-globals
              if (!window.confirm(`Delete shipment ${s.id}?`)) return;
              await fetch(`${process.env.REACT_APP_API_URL}/api/admin/shipments/${s._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
              });
              showToast("Shipment deleted", "error");
              load();
            }}
          />
        )}
        {tab === "create" && <CreateTab onCreated={() => { load(); setTab("shipments"); showToast("Shipment created! 🎉", "success"); }} />}
        {tab === "analytics" && <AnalyticsTab shipments={shipments} />}
      </div>

      {modal?.type === "edit" && (
        <EditModal
          shipment={modal.shipment}
          onClose={() => setModal(null)}
          onSave={async (updates) => {
            await fetch(`${process.env.REACT_APP_API_URL}/api/admin/shipments/${modal.shipment._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
              body: JSON.stringify(updates)
            });
            showToast("Shipment updated", "success");
            setModal(null); load();
          }}
        />
      )}
      {modal?.type === "event" && (
        <AddEventModal
          shipment={modal.shipment}
          onClose={() => setModal(null)}
          onSave={async (event) => {
            await fetch(`${process.env.REACT_APP_API_URL}/api/admin/shipments/${modal.shipment._id}/events`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
              body: JSON.stringify(event)
            });
            showToast("Event added", "success");
            setModal(null); load();
          }}
        />
      )}
    </div>
  );
}

function ShipmentsTab({ shipments, allShipments, filter, setFilter, search, setSearch, loading, onEdit, onAddEvent, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>Shipments</h2>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>{allShipments.length} total · {shipments.length} shown</div>
        </div>
      </div>

      <div className="chip-row">
        {["All", ...STATUSES].map(s => (
          <span key={s} className={`chip${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>{s}</span>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="search-box" style={{ borderRadius: "var(--r)", padding: "4px 4px 4px 14px" }}>
          <span style={{ color: "var(--text3)", fontSize: 16 }}>🔍</span>
          <input className="search-input" placeholder="Search by ID, sender or receiver..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 14 }} />
        </div>
      </div>

      {loading ? (
        <div className="empty"><span className="spinner" style={{ display: "inline-block", borderColor: "var(--text3)", borderRightColor: "transparent" }} /></div>
      ) : shipments.length === 0 ? (
        <div className="empty">No shipments found</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Tracking ID</th><th>Receiver</th><th>Destination</th><th>Status</th><th>Est. Delivery</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {shipments.map(s => (
                <tr key={s.id}>
                  <td><span className="id-chip">{s.trackingId}</span></td>
                  <td><div style={{ fontWeight: 500, fontSize: 14 }}>{s.receiver?.name || s.receiver}</div><div style={{ fontSize: 11, color: "var(--text3)" }}>{s.sender?.name || s.sender}</div></td>
                  <td style={{ color: "var(--text2)", fontSize: 13 }}>{s.destination}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td style={{ color: "var(--text2)", fontSize: 13 }}>{s.estimatedDelivery}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-secondary btn-sm" onClick={() => onEdit(s)}>✏️ Edit</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => onAddEvent(s)}>＋ Event</button>
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete(s)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreateTab({ onCreated }) {
  const init = { sender: "", receiver: "", origin: "", destination: "", status: "Processing", estimatedDelivery: "", weight: "", service: "Standard International" };
  const [form, setForm] = useState(init);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.sender || !form.receiver || !form.origin || !form.destination) return alert("Please fill in all required fields");
    setLoading(true);
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/shipments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({
        sender: { name: form.sender },
        receiver: { name: form.receiver },
        origin: form.origin,
        destination: form.destination,
        status: form.status,
        estimatedDelivery: form.estimatedDelivery,
        service: form.service,
        weight: form.weight
      })
    });
    const data = await res.json();
    const s = data.shipment;
    setLoading(false);
    setForm(init);
    onCreated(s);
  };

  return (
    <div>
      <h2 className="section-title mb-24">Create New Shipment</h2>
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Sender *</label><input className="form-input" value={form.sender} onChange={e => set("sender", e.target.value)} placeholder="Company or person name" /></div>
          <div className="form-group"><label className="form-label">Receiver *</label><input className="form-input" value={form.receiver} onChange={e => set("receiver", e.target.value)} placeholder="Recipient name" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Origin *</label><input className="form-input" value={form.origin} onChange={e => set("origin", e.target.value)} placeholder="City, Country" /></div>
          <div className="form-group"><label className="form-label">Destination *</label><input className="form-input" value={form.destination} onChange={e => set("destination", e.target.value)} placeholder="City, Country" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Service</label>
            <select className="form-input" value={form.service} onChange={e => set("service", e.target.value)}>
              {["Standard International", "Express International", "Premium Express", "Economy"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Weight (kg)</label><input className="form-input" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="e.g. 2.5 kg" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Est. Delivery</label><input className="form-input" type="date" value={form.estimatedDelivery} onChange={e => set("estimatedDelivery", e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 8 }}>
          <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ padding: "12px 28px" }}>
            {loading ? <span className="spinner" /> : "Create Shipment →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ shipment, onClose, onSave }) {
  const [form, setForm] = useState({ sender: shipment.sender, receiver: shipment.receiver, origin: shipment.origin, destination: shipment.destination, status: shipment.status, estimatedDelivery: shipment.estimatedDelivery, weight: shipment.weight || "", service: shipment.service || "" });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Edit Shipment</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>ID: <span className="id-chip">{shipment.id}</span></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Sender</label><input className="form-input" value={form.sender} onChange={e => set("sender", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Receiver</label><input className="form-input" value={form.receiver} onChange={e => set("receiver", e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Origin</label><input className="form-input" value={form.origin} onChange={e => set("origin", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Destination</label><input className="form-input" value={form.destination} onChange={e => set("destination", e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Est. Delivery</label><input className="form-input" type="date" value={form.estimatedDelivery} onChange={e => set("estimatedDelivery", e.target.value)} /></div>
        </div>
        <div className="flex gap-8" style={{ marginTop: 8 }}>
          <button className="btn btn-primary" disabled={loading} onClick={async () => { setLoading(true); await onSave(form); }}>
            {loading ? <span className="spinner" /> : "Save Changes"}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AddEventModal({ shipment, onClose, onSave }) {
  const [form, setForm] = useState({ event: "", location: "", icon: "📦" });
  const [loading, setLoading] = useState(false);
  const icons = ["📦", "🚚", "✈️", "🏭", "🏠", "✅", "⚠️", "📋", "⚙️", "🔍"];

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Add Timeline Event</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>Shipment: <span className="id-chip">{shipment.id}</span></div>
        <div className="form-group">
          <label className="form-label">Event Description *</label>
          <input className="form-input" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))} placeholder="e.g. Arrived at customs" />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Lagos, Nigeria" />
        </div>
        <div className="form-group">
          <label className="form-label">Icon</label>
          <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
            {icons.map(ic => (
              <span key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, borderRadius: 8, cursor: "pointer", background: form.icon === ic ? "var(--text)" : "var(--surface2)", border: `1px solid ${form.icon === ic ? "var(--text)" : "var(--border)"}` }}>{ic}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-8" style={{ marginTop: 8 }}>
          <button className="btn btn-primary" disabled={loading || !form.event} onClick={async () => { setLoading(true); await onSave(form); }}>
            {loading ? <span className="spinner" /> : "Add Event"}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab({ shipments }) {
  const total = shipments.length;
  const delivered = shipments.filter(s => s.status === "Delivered").length;
  const delayed = shipments.filter(s => s.status === "Delayed").length;
  const rate = total ? Math.round((delivered / total) * 100) : 0;

  const byStatus = STATUSES.map(s => ({ label: s, count: shipments.filter(x => x.status === s).length, color: STATUS_COLORS[s] }));

  return (
    <div>
      <h2 className="section-title mb-24">Analytics Overview</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[["Total Shipments", total, "var(--text)"], ["Delivered", delivered, "#16a34a"], ["Delayed", delayed, "#dc2626"], ["Success Rate", `${rate}%`, "#1d6ae5"]].map(([l, v, c]) => (
          <div key={l} className="stat-card">
            <div className="stat-num" style={{ color: c }}>{v}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 20 }}>Status Breakdown</div>
        {byStatus.map(({ label, count, color }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{STATUS_ICONS[label]} {label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>{count}</span>
            </div>
            <div style={{ background: "var(--surface2)", borderRadius: 999, height: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: total ? `${(count / total) * 100}%` : 0, background: color, borderRadius: 999, transition: "width 1s" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [dark, setDark] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type, key: Date.now() });
  }, []);

  useEffect(() => {
    if (dark) document.body.setAttribute("data-dark", "");
    else document.body.removeAttribute("data-dark");
  }, [dark]);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-inner">
            <div className="logo" onClick={() => setPage("home")}>
              <div className="logo-icon">📦</div>
              ShipTrack
            </div>
            <div className="nav-links">
              <button className={`nav-btn${page === "home" ? " active" : ""}`} onClick={() => setPage("home")}>Track</button>
              <button className={`nav-btn${page === "admin" ? " active" : ""}`} onClick={() => setPage("admin")}>Admin</button>
              <button className="nav-btn icon-btn" onClick={() => setDark(d => !d)} title="Toggle dark mode">
                {dark ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </nav>

        {page === "home" && <Home />}
        {page === "admin" && (
          adminLoggedIn
            ? <AdminDashboard onLogout={() => { setAdminLoggedIn(false); }} showToast={showToast} />
            : <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
        )}

        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}