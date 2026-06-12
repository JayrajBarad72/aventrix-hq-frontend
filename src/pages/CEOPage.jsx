// ── CEO Page ───────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import axios from "axios";
const API = "https://avebackend.onrender.com/api";

export function CEOPage() {
  const [tab, setTab] = useState("briefing");
  const [briefing, setBriefing] = useState("");
  const [priorities, setPriorities] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [chatHistory, setChatHistory] = useState([{role:"ceo",text:"Hello Jayraj! I'm Alex, your AI CEO. Ask me anything about strategy, priorities, or the business."}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadBriefing(); }, []);

  async function loadBriefing() {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/ceo/briefing`);
      setBriefing(r.data.briefing);
    } catch(e) { setBriefing("Could not connect to CEO Agent. Make sure the backend is running."); }
    setLoading(false);
  }

  async function loadPriorities() {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/ceo/priorities`);
      setPriorities(r.data.priorities);
    } catch(e) {}
    setLoading(false);
  }

  async function loadInstructions() {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/ceo/team-instructions`);
      setInstructions(r.data.instructions);
    } catch(e) {}
    setLoading(false);
  }

  async function sendChat(msg) {
    const m = msg || input;
    if (!m.trim()) return;
    setInput("");
    const apiHistory = chatHistory.filter(m=>m.role!=="ceo").map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
    setChatHistory(h=>[...h,{role:"user",text:m}]);
    setChatHistory(h=>[...h,{role:"loading",text:"..."}]);
    try {
      const r = await axios.post(`${API}/ceo/chat`,{message:m,history:apiHistory});
      setChatHistory(h=>[...h.filter(x=>x.role!=="loading"),{role:"ceo",text:r.data.reply}]);
    } catch(e) {
      setChatHistory(h=>[...h.filter(x=>x.role!=="loading"),{role:"ceo",text:"Connection error. Check backend."}]);
    }
  }

  const tabs = ["briefing","priorities","chat","teams"];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">👑 CEO Agent — Alex</div>
        <div className="page-sub">Chief Executive Officer · SecureAI Gateway</div>
      </div>
      <div style={{display:"flex",gap:"4px",marginBottom:"20px",borderBottom:"1px solid #e5e5e5"}}>
        {["Morning Briefing","Daily Priorities","Ask CEO","Team Instructions"].map((t,i)=>(
          <button key={i} onClick={()=>setTab(tabs[i])} style={{padding:"8px 16px",fontSize:"13px",cursor:"pointer",background:"none",border:"none",borderBottom:tab===tabs[i]?"2px solid #378ADD":"2px solid transparent",color:tab===tabs[i]?"#0a1628":"#888",fontWeight:tab===tabs[i]?500:400,marginBottom:"-1px"}}>
            {t}
          </button>
        ))}
      </div>

      {tab==="briefing" && (
        <div className="card">
          <div className="card-title">☀️ Daily Briefing — {new Date().toLocaleDateString()}</div>
          {loading ? <div className="loading"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div>
          : <p style={{fontSize:"14px",lineHeight:"1.8",color:"#333"}}>{briefing}</p>}
          <button className="btn btn-primary" style={{marginTop:"16px"}} onClick={loadBriefing} disabled={loading}>🔄 Regenerate</button>
        </div>
      )}

      {tab==="priorities" && (
        <div className="card">
          <div className="card-title">📋 Today's Priorities</div>
          <button className="btn btn-primary" style={{marginBottom:"16px"}} onClick={loadPriorities} disabled={loading}>
            {loading?"Generating...":"Generate Priorities"}
          </button>
          {priorities.map((p,i)=>(
            <div key={i} className="priority-item">
              <div className="priority-num">{p.priority}</div>
              <div>
                <div className="priority-text">{p.task}</div>
                <div className="priority-team">{p.team} — {p.reason}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="chat" && (
        <div className="card">
          <div className="quick-btns">
            {["Top priority today?","Which industry first?","Elevator pitch for SecureAI?","Who are our competitors?","Best cold email subject line?"].map(q=>(
              <button key={q} className="quick-btn" onClick={()=>sendChat(q)}>{q}</button>
            ))}
          </div>
          <div className="chat-box">
            <div className="chat-messages">
              {chatHistory.map((m,i)=>(
                <div key={i} className={`chat-msg ${m.role==="user"?"user":"ceo"}`}>
                  <div className={`chat-avatar ${m.role==="user"?"user-avatar-sm":"ceo-avatar-sm"}`}>
                    {m.role==="user"?"👤":"👑"}
                  </div>
                  {m.role==="loading"
                    ? <div className="chat-bubble"><div className="loading"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div></div>
                    : <div className="chat-bubble">{m.text}</div>}
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input className="chat-input" value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask your CEO anything..." />
              <button className="btn btn-primary" onClick={()=>sendChat()}>Send</button>
            </div>
          </div>
        </div>
      )}

      {tab==="teams" && (
        <div>
          <button className="btn btn-primary" style={{marginBottom:"16px"}} onClick={loadInstructions} disabled={loading}>
            {loading?"Generating...":"Generate Team Instructions"}
          </button>
          <div className="two-col">
            {instructions.map((t,i)=>(
              <div key={i} className="card">
                <div className="card-title">
                  <div style={{width:28,height:28,borderRadius:6,background:t.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
                    {t.team.includes("Sales")?"📈":t.team.includes("Market")?"📣":t.team.includes("Finance")?"💰":"🔬"}
                  </div>
                  {t.team}
                </div>
                <p style={{fontSize:"13px",color:"#555",fontStyle:"italic",lineHeight:1.7}}>"{t.instruction}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CEOPage;
