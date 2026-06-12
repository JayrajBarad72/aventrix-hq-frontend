import { useState, useEffect } from "react";
import axios from "axios";
const API = "https://avebackend.onrender.com/api";

const AGENTS = ["CEO Agent","Sales Manager","Marketing Manager","Finance Agent","R&D Agent"];
const PRIORITY_STYLE = {urgent:{bg:"#FCEBEB",fg:"#A32D2D"},high:{bg:"#FAEEDA",fg:"#854F0B"},normal:{bg:"#E6F1FB",fg:"#185FA5"},low:{bg:"#f5f5f5",fg:"#666"}};
const STATUS_STYLE = {pending:{bg:"#FAEEDA",fg:"#854F0B"},approved:{bg:"#EAF3DE",fg:"#3B6D11"},rejected:{bg:"#FCEBEB",fg:"#A32D2D"},answered:{bg:"#EEEDFE",fg:"#534AB7"}};

export default function AgentIntelPage() {
  const [tab, setTab] = useState("messages");
  const [messages, setMessages] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("CEO Agent");
  const [agentData, setAgentData] = useState(null);
  const [running, setRunning] = useState(false);
  const [testingWa, setTestingWa] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadMessages(); }, []);
  useEffect(() => { if(tab==="brain") loadAgentBrain(); }, [tab, selectedAgent]);

  async function loadMessages() {
    const r = await axios.get(`${API}/autonomous/messages`).catch(()=>({data:[]}));
    setMessages(r.data);
  }

  async function loadAgentBrain() {
    setLoading(true);
    const r = await axios.get(`${API}/autonomous/memories/${encodeURIComponent(selectedAgent)}`).catch(()=>({data:null}));
    setAgentData(r.data);
    setLoading(false);
  }

  async function runAutonomousCycle() {
    setRunning(true);
    try {
      await axios.post(`${API}/autonomous/run`);
      await loadMessages();
      alert("✅ Autonomous cycle complete! Check messages and activity.");
    } catch(e) { alert("Error running cycle"); }
    setRunning(false);
  }

  async function testWhatsApp() {
    setTestingWa(true);
    try {
      const r = await axios.post(`${API}/whatsapp/test`);
      alert(r.data.success ? "✅ WhatsApp sent to Jayraj!" : "❌ WhatsApp failed. Check Render logs and ensure Twilio sandbox is joined (send join mix-who to +14155238886)");
    } catch(e) { alert("Error"); }
    setTestingWa(false);
  }

  async function decide(id, decision) {
    await axios.post(`${API}/autonomous/decide/${id}`, {status: decision});
    loadMessages();
  }

  const pendingJayraj = messages.filter(m=>m.requires_jayraj && m.status==="pending");
  const pendingAlex = messages.filter(m=>!m.requires_jayraj && m.status==="pending");

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:600}}>🧠 Agent Intelligence</div>
        <div style={{fontSize:13,color:"#666",marginTop:4}}>Autonomous agents · Memory · Goals · Reflections · Escalations</div>
      </div>

      {/* Action Bar */}
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={runAutonomousCycle} disabled={running}
          style={{padding:"9px 18px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500}}>
          {running?"🔄 Running...":"🚀 Run Autonomous Cycle"}
        </button>
        <button onClick={async()=>{setRunning(true);try{await axios.post(`${API}/ceo/run-brain`);await loadMessages();alert("✅ CEO Brain cycle complete! Check messages.");}catch(e){alert("Error");}setRunning(false);}} disabled={running}
          style={{padding:"9px 18px",background:"#185FA5",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500}}>
          {running?"🧠 Thinking...":"🧠 Run CEO Full Brain"}
        </button>
        <button onClick={testWhatsApp} disabled={testingWa}
          style={{padding:"9px 18px",background:"#25D366",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>
          {testingWa?"Sending...":"📱 Test WhatsApp to Jayraj"}
        </button>
        {pendingJayraj.length > 0 && (
          <div style={{padding:"9px 14px",background:"#FCEBEB",color:"#A32D2D",borderRadius:8,fontSize:13,fontWeight:500}}>
            ⚠️ {pendingJayraj.length} item{pendingJayraj.length>1?"s":""} need your decision
          </div>
        )}
      </div>

      {/* Jayraj's Action Items — always visible if any */}
      {pendingJayraj.length > 0 && (
        <div style={{background:"#FFF8E1",border:"2px solid #EF9F27",borderRadius:12,padding:20,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:600,color:"#854F0B",marginBottom:14}}>
            ⚡ Your Decision Needed ({pendingJayraj.length})
          </div>
          {pendingJayraj.map(msg=>{
            let content = {};
            try { content = JSON.parse(msg.content); } catch{}
            return (
              <div key={msg.id} style={{background:"white",borderRadius:10,padding:16,marginBottom:10,border:"1px solid #e5e5e5"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontSize:14,fontWeight:600}}>{msg.subject}</div>
                  <span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:"#FCEBEB",color:"#A32D2D",fontWeight:500}}>Needs Your Decision</span>
                </div>
                <div style={{fontSize:13,color:"#555",marginBottom:6}}><strong>From:</strong> {msg.from} → Alex → You</div>
                <div style={{fontSize:13,color:"#555",marginBottom:6}}><strong>Situation:</strong> {content.situation||msg.content}</div>
                {content.question && <div style={{fontSize:13,color:"#185FA5",marginBottom:12,padding:"8px 12px",background:"#E6F1FB",borderRadius:6}}>❓ {content.question}</div>}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>decide(msg.id,"approved")} style={{padding:"6px 14px",background:"#EAF3DE",color:"#3B6D11",border:"none",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500}}>✅ Approve</button>
                  <button onClick={()=>decide(msg.id,"rejected")} style={{padding:"6px 14px",background:"#FCEBEB",color:"#A32D2D",border:"none",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500}}>❌ Reject</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid #e5e5e5"}}>
        {[["messages","💬 Agent Messages"],["brain","🧠 Agent Brain"],["flow","🔄 How It Works"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",fontSize:13,cursor:"pointer",background:"none",border:"none",
            borderBottom:tab===t?"2px solid #378ADD":"2px solid transparent",
            color:tab===t?"#0a1628":"#888",fontWeight:tab===t?500:400,marginBottom:"-1px"}}>{l}</button>
        ))}
      </div>

      {/* MESSAGES */}
      {tab==="messages" && (
        <div>
          {messages.length===0
            ? <div style={{background:"white",borderRadius:12,padding:40,textAlign:"center",border:"1px solid #e5e5e5"}}>
                <div style={{fontSize:40,marginBottom:12}}>🤖</div>
                <div style={{fontSize:14,fontWeight:500,color:"#0a1628",marginBottom:8}}>No agent messages yet</div>
                <div style={{fontSize:13,color:"#888"}}>Click "Run Autonomous Cycle" to start the agents</div>
              </div>
            : messages.map(msg=>{
              let content = {};
              try { content = JSON.parse(msg.content); } catch{}
              const ps = PRIORITY_STYLE[msg.priority]||PRIORITY_STYLE.normal;
              const ss = STATUS_STYLE[msg.status]||STATUS_STYLE.pending;
              return (
                <div key={msg.id} style={{background:"white",borderRadius:12,padding:20,marginBottom:10,border:"1px solid #e5e5e5"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:600,color:"#0a1628"}}>{msg.subject}</div>
                      <div style={{fontSize:12,color:"#888",marginTop:3}}>
                        {msg.from} → {msg.to} · {new Date(msg.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,marginLeft:12,flexShrink:0}}>
                      <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:500,background:ps.bg,color:ps.fg}}>{msg.priority}</span>
                      <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:500,background:ss.bg,color:ss.fg}}>{msg.status}</span>
                      {msg.requires_jayraj===1 && <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:500,background:"#FAEEDA",color:"#854F0B"}}>→ Jayraj</span>}
                    </div>
                  </div>
                  {content.situation && <div style={{fontSize:13,color:"#555",marginBottom:6,lineHeight:1.6}}><strong>Situation:</strong> {content.situation}</div>}
                  {content.question && <div style={{fontSize:13,color:"#185FA5",padding:"8px 12px",background:"#E6F1FB",borderRadius:6,marginBottom:8}}>❓ {content.question}</div>}
                  {msg.response && <div style={{fontSize:13,color:"#3B6D11",padding:"8px 12px",background:"#EAF3DE",borderRadius:6}}>✅ Response: {msg.response}</div>}
                  {msg.status==="pending" && !msg.requires_jayraj && (
                    <div style={{display:"flex",gap:6,marginTop:10}}>
                      <button onClick={()=>decide(msg.id,"approved")} style={{padding:"5px 12px",background:"#EAF3DE",color:"#3B6D11",border:"none",borderRadius:6,cursor:"pointer",fontSize:12}}>✅ Approve</button>
                      <button onClick={()=>decide(msg.id,"rejected")} style={{padding:"5px 12px",background:"#FCEBEB",color:"#A32D2D",border:"none",borderRadius:6,cursor:"pointer",fontSize:12}}>❌ Reject</button>
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      )}

      {/* AGENT BRAIN */}
      {tab==="brain" && (
        <div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {AGENTS.map(a=>(
              <button key={a} onClick={()=>setSelectedAgent(a)}
                style={{padding:"7px 14px",borderRadius:8,border:"1px solid #e5e5e5",cursor:"pointer",fontSize:13,
                  background:selectedAgent===a?"#0a1628":"white",color:selectedAgent===a?"white":"#555"}}>
                {a==="CEO Agent"?"👑":a==="Sales Manager"?"📈":a==="Marketing Manager"?"📣":a==="Finance Agent"?"💰":"🔬"} {a}
              </button>
            ))}
          </div>

          {loading
            ? <div style={{padding:40,textAlign:"center",fontSize:13,color:"#888"}}>Loading agent brain...</div>
            : agentData && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>

                {/* Goals */}
                <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>🎯 Active Goals</div>
                  {agentData.goals?.length===0
                    ? <div style={{fontSize:13,color:"#888"}}>No goals set yet</div>
                    : agentData.goals?.map((g,i)=>{
                      const pct = Math.min(Math.round((g.current/g.target)*100),100);
                      return (
                        <div key={i} style={{marginBottom:14}}>
                          <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{g.goal}</div>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#888",marginBottom:4}}>
                            <span>{g.current} / {g.target}</span>
                            <span>By {g.deadline}</span>
                          </div>
                          <div style={{height:6,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:pct>=100?"#1D9E75":"#378ADD",borderRadius:3}}/>
                          </div>
                          <div style={{fontSize:11,color:"#888",marginTop:2}}>{pct}% complete</div>
                        </div>
                      );
                    })
                  }
                </div>

                {/* Memories */}
                <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>🧠 Memory Bank</div>
                  {agentData.memories?.length===0
                    ? <div style={{fontSize:13,color:"#888"}}>No memories yet. Run a cycle first.</div>
                    : agentData.memories?.map((m,i)=>(
                      <div key={i} style={{padding:"8px 10px",borderRadius:8,marginBottom:8,
                        background:m.outcome==="success"?"#EAF3DE":m.outcome==="failure"?"#FCEBEB":"#f5f5f5",
                        borderLeft:`3px solid ${m.outcome==="success"?"#1D9E75":m.outcome==="failure"?"#A32D2D":"#888"}`}}>
                        <div style={{fontSize:11,color:"#888",marginBottom:3,textTransform:"uppercase"}}>{m.type} · {m.outcome}</div>
                        <div style={{fontSize:13,lineHeight:1.5}}>{m.content}</div>
                        <div style={{fontSize:11,color:"#aaa",marginTop:3}}>Confidence: {Math.round(m.confidence*100)}%</div>
                      </div>
                    ))
                  }
                </div>

                {/* Reflections */}
                <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>🪞 Recent Reflections</div>
                  {agentData.reflections?.length===0
                    ? <div style={{fontSize:13,color:"#888"}}>No reflections yet. Run a cycle first.</div>
                    : agentData.reflections?.map((r,i)=>(
                      <div key={i} style={{marginBottom:16,paddingBottom:16,borderBottom:i<agentData.reflections.length-1?"1px solid #f0f0f0":"none"}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#378ADD",marginBottom:8}}>{r.date}</div>
                        {[["✅ Worked",r.worked,"#EAF3DE"],["❌ Failed",r.failed,"#FCEBEB"],["💡 Learned",r.learned,"#E6F1FB"],["📅 Tomorrow",r.plan,"#FAEEDA"]].map(([label,val,bg])=>val&&(
                          <div key={label} style={{marginBottom:6}}>
                            <div style={{fontSize:11,fontWeight:500,marginBottom:2}}>{label}</div>
                            <div style={{fontSize:12,padding:"6px 8px",background:bg,borderRadius:6,lineHeight:1.5}}>{val}</div>
                          </div>
                        ))}
                        <div style={{fontSize:11,color:"#888",marginTop:6}}>Confidence: {Math.round((r.confidence||0)*100)}%</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )
          }
        </div>
      )}

      {/* HOW IT WORKS */}
      {tab==="flow" && (
        <div style={{background:"white",borderRadius:12,padding:24,border:"1px solid #e5e5e5"}}>
          <div style={{fontSize:16,fontWeight:600,marginBottom:20}}>🔄 How Autonomous Agents Work</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            <div>
              <div style={{fontSize:14,fontWeight:500,color:"#0a1628",marginBottom:12}}>Daily Autonomous Cycle</div>
              {[
                ["8:00 AM","CEO Alex wakes up, runs all department cycles"],
                ["8:05 AM","Each agent reviews goals & past memories"],
                ["8:10 AM","Agents decide what to do today (self-planned)"],
                ["8:15 AM","Agents execute actions (emails, leads, content)"],
                ["8:20 AM","Escalations sent to CEO Alex"],
                ["8:25 AM","Pricing/confusion → Alex WhatsApps Jayraj"],
                ["9:00 AM","Scout Agent finds new leads"],
                ["10:00 AM","Outreach Agent sends emails"],
                ["11:00 AM","Qualifier Agent scores leads"],
                ["6:00 PM","All agents self-reflect, store learnings"],
                ["6:05 PM","CEO Alex sends daily summary to Jayraj"],
              ].map(([time,action])=>(
                <div key={time} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#378ADD",width:70,flexShrink:0}}>{time}</div>
                  <div style={{fontSize:13,color:"#555"}}>{action}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:500,color:"#0a1628",marginBottom:12}}>Escalation Rules</div>
              {[
                ["Any agent","Confidence < 60%","→ Auto-escalate to CEO Alex"],
                ["Any agent","Stuck/confused","→ CEO Alex decides"],
                ["Sales Agent","High-value lead","→ CEO Alex approves approach"],
                ["Finance Agent","Pricing question","→ Alex WhatsApps Jayraj"],
                ["CEO Alex","Needs product knowledge","→ Alex WhatsApps Jayraj"],
                ["CEO Alex","Discount requested","→ Alex WhatsApps Jayraj"],
                ["CEO Alex","Custom enterprise deal","→ Alex WhatsApps Jayraj"],
              ].map(([who,when,action])=>(
                <div key={who+when} style={{padding:"10px 12px",borderRadius:8,marginBottom:8,background:"#f8f9fa",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,fontSize:12}}>
                  <div style={{fontWeight:500,color:"#0a1628"}}>{who}</div>
                  <div style={{color:"#854F0B"}}>{when}</div>
                  <div style={{color:"#3B6D11",fontWeight:500}}>{action}</div>
                </div>
              ))}
              <div style={{marginTop:20,padding:16,background:"#E6F1FB",borderRadius:10,borderLeft:"3px solid #378ADD"}}>
                <div style={{fontSize:13,fontWeight:500,color:"#185FA5",marginBottom:6}}>Your role as Owner:</div>
                <div style={{fontSize:13,color:"#555",lineHeight:1.7}}>
                  You only interact with Alex.<br/>
                  Alex manages everything else.<br/>
                  Alex WhatsApps you when it really needs you.<br/>
                  You check dashboard once a day.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
