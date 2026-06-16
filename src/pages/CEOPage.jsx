import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "https://avebackend.onrender.com/api";

function formatMessage(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');
  text = text.replace(/^#{1,3}\s+/gm, '');
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  return paragraphs.map((para, i) => {
    const lines = para.split('\n').filter(l => l.trim());
    const isList = lines.length > 1 && lines.every(l => l.trim().match(/^[-•]\s/) || l.trim().match(/^\d+[\.\)]\s/));
    if (isList) return (
      <ul key={i} style={{margin:'8px 0 8px 18px',padding:0}}>
        {lines.map((line,j) => <li key={j} style={{marginBottom:5,color:'#CBD5E0',lineHeight:1.65,fontSize:14}}>{line.replace(/^[-•]\s+/,'').replace(/^\d+[\.\)]\s+/,'').trim()}</li>)}
      </ul>
    );
    return <p key={i} style={{margin:'0 0 10px 0',color:'#CBD5E0',lineHeight:1.7,fontSize:14}}>{para.trim()}</p>;
  });
}

export default function CEOPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("chat");
  const [briefing, setBriefing] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [priorities, setPriorities] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef(null);

  const QUICK = ["Top priority today?","Which industry first?","Elevator pitch for SecureAI?","Who are our competitors?","Best cold email subject line?","How do we get first 10 customers?","30-day plan to book demos?"];

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages, loading]);
  useEffect(() => {
    if (tab === "briefing" && !briefing) loadBriefing();
    if (tab === "priorities" && priorities.length === 0) loadPriorities();
    if (tab === "instructions" && instructions.length === 0) loadInstructions();
  }, [tab]);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const r = await axios.get(`${API}/ceo/chat/history`);
      const msgs = r.data.messages || [];
      setMessages(msgs.length === 0 ? [{role:"assistant",content:"Hello Jayraj.\n\nI have full context on where we stand. 65 leads in pipeline, outreach running daily, Calendly live for demo booking, all agents operational.\n\nWhat do you want to work on?",timestamp:new Date().toISOString()}] : msgs);
    } catch { setMessages([{role:"assistant",content:"Hello Jayraj. Ask me anything about the business.",timestamp:new Date().toISOString()}]); }
    setHistoryLoading(false);
  }

  async function loadBriefing() {
    setBriefingLoading(true);
    try { const r = await axios.get(`${API}/ceo/briefing`); setBriefing(r.data.briefing || ""); } catch { setBriefing("Could not connect."); }
    setBriefingLoading(false);
  }

  async function loadPriorities() { try { const r = await axios.get(`${API}/ceo/priorities`); setPriorities(r.data.priorities||[]); } catch {} }
  async function loadInstructions() { try { const r = await axios.get(`${API}/ceo/team-instructions`); setInstructions(r.data.instructions||[]); } catch {} }

  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput(""); setLoading(true);
    setMessages(prev => [...prev, {role:"user",content:msg,timestamp:new Date().toISOString()}]);
    try {
      const r = await axios.post(`${API}/ceo/chat`, {message:msg, history:[]});
      setMessages(prev => [...prev, {role:"assistant",content:r.data.reply||"No response.",timestamp:new Date().toISOString()}]);
    } catch { setMessages(prev => [...prev, {role:"assistant",content:"Connection error. Try again in 30 seconds.",timestamp:new Date().toISOString()}]); }
    setLoading(false);
  }

  async function clearChat() {
    if (!window.confirm("Clear all chat history with Alex?")) return;
    await axios.delete(`${API}/ceo/chat/clear`).catch(()=>{});
    setMessages([{role:"assistant",content:"Chat cleared. Fresh start.",timestamp:new Date().toISOString()}]);
  }

  function fmtTime(ts) { try { return new Date(ts).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}); } catch { return ""; } }

  const TABS = [{id:"chat",label:"Ask Alex"},{id:"briefing",label:"Morning Briefing"},{id:"priorities",label:"Daily Priorities"},{id:"instructions",label:"Team Instructions"}];

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#0A1220",fontFamily:"Inter,sans-serif"}}>

      <div style={{padding:"20px 28px 0",borderBottom:"1px solid rgba(255,255,255,0.07)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#378ADD,#00D4FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>👑</div>
            <div>
              <div style={{fontSize:18,fontWeight:700,color:"#fff"}}>CEO Agent — Alex</div>
              <div style={{fontSize:12,color:"#718096"}}>Chief Executive Officer · SecureAI Gateway</div>
            </div>
          </div>
          {tab==="chat" && <button onClick={clearChat} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",color:"#718096",fontSize:12,padding:"6px 12px",borderRadius:6,cursor:"pointer"}}>Clear Chat</button>}
        </div>
        <div style={{display:"flex"}}>
          {TABS.map(t => <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 18px",fontSize:13,fontWeight:500,background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid #378ADD":"2px solid transparent",color:tab===t.id?"#63B3ED":"#718096",cursor:"pointer"}}>{t.label}</button>)}
        </div>
      </div>

      {tab==="chat" && <>
        <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>
          {historyLoading
            ? <div style={{textAlign:"center",color:"#718096",padding:48,fontSize:14}}>Loading conversation history...</div>
            : <>
              {messages.map((msg,i) => (
                <div key={i} style={{display:"flex",flexDirection:msg.role==="user"?"row-reverse":"row",gap:10,marginBottom:22,alignItems:"flex-start"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:msg.role==="user"?"rgba(113,128,150,0.3)":"linear-gradient(135deg,#378ADD,#00D4FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                    {msg.role==="user"?"👤":"👑"}
                  </div>
                  <div style={{maxWidth:"74%"}}>
                    <div style={{background:msg.role==="user"?"rgba(55,138,221,0.12)":"rgba(255,255,255,0.04)",border:msg.role==="user"?"1px solid rgba(55,138,221,0.25)":"1px solid rgba(255,255,255,0.07)",borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"13px 16px"}}>
                      {msg.role==="user"
                        ? <p style={{margin:0,color:"#E2E8F0",fontSize:14,lineHeight:1.65}}>{msg.content}</p>
                        : <div style={{paddingBottom:2}}>{formatMessage(msg.content)}</div>
                      }
                    </div>
                    <div style={{fontSize:11,color:"#4A5568",marginTop:4,textAlign:msg.role==="user"?"right":"left"}}>
                      {msg.role==="user"?"You":"Alex"} · {fmtTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:22}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#378ADD,#00D4FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>👑</div>
                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"18px 18px 18px 4px",padding:"14px 18px",display:"flex",gap:5,alignItems:"center"}}>
                    {[0,1,2].map(j=><div key={j} style={{width:7,height:7,borderRadius:"50%",background:"#378ADD",animation:"bounce 1.2s infinite",animationDelay:`${j*0.2}s`}}/>)}
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </>
          }
        </div>

        <div style={{padding:"0 28px 12px",display:"flex",gap:8,flexWrap:"wrap",flexShrink:0}}>
          {QUICK.map((q,i) => <button key={i} onClick={()=>send(q)} disabled={loading} style={{background:"rgba(55,138,221,0.07)",border:"1px solid rgba(55,138,221,0.18)",color:"#63B3ED",fontSize:12,padding:"6px 13px",borderRadius:20,cursor:"pointer"}}>{q}</button>)}
        </div>

        <div style={{padding:"12px 28px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
          <div style={{display:"flex",gap:10}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask Alex anything about strategy, the business, or priorities..." style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,padding:"12px 16px",color:"#E2E8F0",fontSize:14,outline:"none",fontFamily:"Inter,sans-serif"}}/>
            <button onClick={()=>send()} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?"rgba(55,138,221,0.25)":"linear-gradient(135deg,#378ADD,#00D4FF)",border:"none",borderRadius:12,padding:"12px 22px",color:"#fff",fontWeight:600,fontSize:14,cursor:loading||!input.trim()?"not-allowed":"pointer"}}>
              {loading?"...":"Send →"}
            </button>
          </div>
        </div>
      </>}

      {tab==="briefing" && (
        <div style={{flex:1,overflowY:"auto",padding:28}}>
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:28,maxWidth:760}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <span style={{fontSize:22}}>🌅</span>
              <div style={{fontSize:16,fontWeight:600,color:"#fff"}}>Daily Briefing — {new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
            </div>
            {briefingLoading ? <div style={{color:"#718096",fontSize:14}}>Generating briefing...</div> : briefing ? <div>{formatMessage(briefing)}</div> : <div style={{color:"#718096"}}>Click Regenerate to get today's briefing.</div>}
            <button onClick={loadBriefing} style={{marginTop:20,background:"linear-gradient(135deg,#378ADD,#00D4FF)",border:"none",borderRadius:8,padding:"10px 20px",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer"}}>Regenerate</button>
          </div>
        </div>
      )}

      {tab==="priorities" && (
        <div style={{flex:1,overflowY:"auto",padding:28}}>
          {priorities.length===0 ? <div style={{color:"#718096"}}>Loading priorities...</div> : priorities.map((p,i) => (
            <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"18px 22px",marginBottom:12,display:"flex",gap:16,alignItems:"flex-start"}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#378ADD,#00D4FF)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff",fontSize:14,flexShrink:0}}>{p.priority||i+1}</div>
              <div>
                <div style={{fontSize:15,fontWeight:600,color:"#fff",marginBottom:5}}>{p.task}</div>
                <div style={{fontSize:13,color:"#718096",marginBottom:8,lineHeight:1.5}}>{p.reason}</div>
                <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:10,background:"rgba(55,138,221,0.15)",color:"#63B3ED"}}>{p.team}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="instructions" && (
        <div style={{flex:1,overflowY:"auto",padding:28}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {instructions.length===0 ? <div style={{color:"#718096",gridColumn:"span 2"}}>Loading team instructions...</div> : instructions.map((inst,i) => (
              <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:22}}>
                <div style={{fontSize:12,fontWeight:700,color:"#63B3ED",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>{inst.team}</div>
                <div style={{fontSize:14,color:"#CBD5E0",lineHeight:1.7}}>{inst.instruction}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}input::placeholder{color:#4A5568}`}</style>
    </div>
  );
}
