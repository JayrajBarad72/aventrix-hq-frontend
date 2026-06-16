import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://avebackend.onrender.com/api";

export default function Dashboard() {
  const [metrics, setMetrics] = useState({total_leads:0,emails_sent:0,demos_booked:0,pipeline_value:0});
  const [activity, setActivity] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    axios.get(`${API}/metrics`)
    axios.get(`${API}/email/analytics`).then(r => setAnalytics(r.data.summary)).catch(()=>{}).then(r => setMetrics(r.data)).catch(()=>{});
    axios.get(`${API}/activity`).then(r => setActivity(r.data)).catch(()=>{});
    const interval = setInterval(() => {
      axios.get(`${API}/metrics`)
    axios.get(`${API}/email/analytics`).then(r => setAnalytics(r.data.summary)).catch(()=>{}).then(r => setMetrics(r.data)).catch(()=>{});
      axios.get(`${API}/activity`).then(r => setActivity(r.data)).catch(()=>{});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🏢 Aventrix AI HQ</div>
        <div className="page-sub">SecureAI Gateway — Agent Command Center · {new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Leads</div>
          <div className="metric-value">{metrics.total_leads}</div>
          <div className="metric-note">Found by Scout Agent</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Emails Sent</div>
          <div className="metric-value">{metrics.emails_sent}</div>
          <div className="metric-note">Outreach Agent</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Demos Booked</div>
          <div className="metric-value">{metrics.demos_booked}</div>
          <div className="metric-note">Booking Agent</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pipeline Value</div>
          <div className="metric-value">${metrics.pipeline_value.toFixed(0)}</div>
          <div className="metric-note">Est. revenue</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">🤖 Agent Status</div>
          {[
            {name:"CEO Agent",role:"Oversees all",status:"active"},
            {name:"Sales Manager",role:"Sales pipeline",status:"active"},
            {name:"Scout Agent",role:"Lead finder",status:"scheduled"},
            {name:"Outreach Agent",role:"Email sender",status:"scheduled"},
            {name:"Qualifier Agent",role:"Lead scoring",status:"scheduled"},
            {name:"Blog Writer",role:"Content",status:"scheduled"},
            {name:"Finance Agent",role:"Revenue tracking",status:"active"},
            {name:"R&D Agent",role:"Research",status:"scheduled"},
          ].map(a => (
            <div key={a.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
              <div>
                <div style={{fontSize:"13px",fontWeight:500}}>{a.name}</div>
                <div style={{fontSize:"11px",color:"#888"}}>{a.role}</div>
              </div>
              <span className={`badge ${a.status==="active"?"badge-qualified":"badge-new"}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">📋 Recent Activity</div>
          {activity.length === 0 ? (
            <div style={{fontSize:"13px",color:"#888",padding:"20px",textAlign:"center"}}>
              No activity yet. Agents will log here as they run.
            </div>
          ) : (
            activity.slice(0,8).map((a,i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon">
                  {a.agent==="CEO Agent"?"👑":a.agent==="Scout Agent"?"🔍":a.agent==="Outreach Agent"?"📧":"🤖"}
                </div>
                <div>
                  <div className="activity-msg"><strong>{a.agent}</strong> — {a.action}</div>
                  <div className="activity-time">{new Date(a.time).toLocaleTimeString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">📅 Agent Schedule (Daily)</div>
        <table className="data-table">
          <thead><tr><th>Time</th><th>Agent</th><th>Task</th><th>Frequency</th></tr></thead>
          <tbody>
            <tr><td>8:00 AM</td><td>CEO Agent</td><td>Morning briefing & priorities</td><td>Daily</td></tr>
            <tr><td>9:00 AM</td><td>Scout Agent</td><td>Find new leads</td><td>Daily</td></tr>
            <tr><td>10:00 AM</td><td>Outreach Agent</td><td>Send cold emails</td><td>Daily</td></tr>
            <tr><td>11:00 AM</td><td>Qualifier Agent</td><td>Score contacted leads</td><td>Daily</td></tr>
            <tr><td>2:00 PM</td><td>Blog Writer</td><td>Write SEO blog post</td><td>Mon & Thu</td></tr>
            <tr><td>10:00 AM</td><td>R&D Agent</td><td>Competitor research</td><td>Sunday</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
