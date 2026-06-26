import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CEOPage from "./pages/CEOPage";
import SalesPage from "./pages/SalesPage";
import MarketingPage from "./pages/MarketingPage";
import FinancePage from "./pages/FinancePage";
import RnDPage from "./pages/RnDPage";
import LoginPage from "./pages/LoginPage";
import AgentIntelPage from "./pages/AgentIntelPage";
import axios from "axios";
import "./App.css";

const API = "https://avebackend.onrender.com/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("hq_token"));
  const [backingUp, setBackingUp] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  async function handleBackup() {
    setBackingUp(true);
    try {
      const r = await axios.post(`${API}/backup`);
      alert(r.data.success ? `✅ Backup: ${r.data.file}` : "❌ Backup failed");
    } catch(e) {}
    setBackingUp(false);
  }

  function handleLogout() {
    localStorage.removeItem("hq_token");
    localStorage.removeItem("hq_user");
    setToken(null);
  }

  if (!token) return <LoginPage onLogin={(t) => setToken(t)} />;

  return (
    <BrowserRouter>
      <div className="app">
        <button className="mobile-menu-btn" onClick={() => setNavOpen(true)} aria-label="Menu">☰</button>
        <div className={navOpen ? "nav-overlay open" : "nav-overlay"} onClick={() => setNavOpen(false)}></div>
        <aside className={navOpen ? "sidebar open" : "sidebar"}>
          <div className="sidebar-brand">
            <div className="brand-icon">🛡️</div>
            <div>
              <div className="brand-name">Aventrix HQ</div>
              <div className="brand-sub">AI. Secured. Governed.</div>
            </div>
            <button className="sidebar-close" onClick={() => setNavOpen(false)} aria-label="Close">✕</button>
          </div>
          <nav className="sidebar-nav" onClick={() => setNavOpen(false)}>
            {[
              ["/","📊","Dashboard"],
              ["/ceo","👑","CEO — Alex"],
              ["/intel","🧠","Agent Intel"],
              ["/sales","📈","Sales Team"],
              ["/marketing","📣","Marketing"],
              ["/finance","💰","Finance"],
              ["/rnd","🔬","R&D"],
            ].map(([path,icon,label])=>(
              <NavLink key={path} to={path} end={path==="/"} className={({isActive})=>isActive?"nav-item active":"nav-item"}>
                <span>{icon}</span> {label}
              </NavLink>
            ))}
          </nav>
          <div style={{padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
            <button onClick={handleBackup} disabled={backingUp}
              style={{width:"100%",padding:"7px",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,color:"rgba(255,255,255,0.6)",fontSize:12,cursor:"pointer",marginBottom:6}}>
              {backingUp?"Backing up...":"💾 Backup Data"}
            </button>
            <button onClick={handleLogout}
              style={{width:"100%",padding:"7px",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,color:"rgba(255,255,255,0.6)",fontSize:12,cursor:"pointer"}}>
              🚪 Logout
            </button>
          </div>
          <div className="sidebar-footer">
            <div className="agent-count">15 agents active</div>
            <div className="agent-dot"></div>
          </div>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ceo" element={<CEOPage />} />
            <Route path="/intel" element={<AgentIntelPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/marketing" element={<MarketingPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/rnd" element={<RnDPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
