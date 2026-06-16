import { useState, useEffect } from "react";
import axios from "axios";
const API = "https://avebackend.onrender.com/api";

const STATUSES = ["new","contacted","replied","qualified","demo_booked","closed","lost"];
const STATUS_LABELS = {new:"New",contacted:"Contacted",replied:"Replied",qualified:"Qualified",demo_booked:"Demo Booked",closed:"Closed ✅",lost:"Lost"};
const STATUS_COLORS = {new:"#E6F1FB",contacted:"#FAEEDA",replied:"#EAF3DE",qualified:"#EEEDFE",demo_booked:"#E1F5EE",closed:"#E1F5EE",lost:"#FCEBEB"};
const STATUS_TEXT = {new:"#185FA5",contacted:"#854F0B",replied:"#3B6D11",qualified:"#534AB7",demo_booked:"#0F6E56",closed:"#0F6E56",lost:"#A32D2D"};

export default function SalesPage() {
  const [tab, setTab] = useState("pipeline");
  const [leads, setLeads] = useState([]);
  const [emails, setEmails] = useState([]);
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState(null);
  const [searchIndustry, setSearchIndustry] = useState("IT");
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetail, setLeadDetail] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyResult, setReplyResult] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    axios.get(`${API}/scout/leads`).then(r=>setLeads(r.data)).catch(()=>{});
    axios.get(`${API}/outreach/emails`).then(r=>setEmails(r.data)).catch(()=>{});
    axios.get(`${API}/scout/pipeline`).then(r=>setPipeline(r.data)).catch(()=>{});
  }

  async function addManualLead() {
    if (!manualEmail.trim()) return;
    setManualLoading(true);
    setManualResult(null);
    try {
      const r = await axios.post(`${API}/leads/add-manual`, {
        email: manualEmail.trim(),
        note: manualNote.trim()
      });
      setManualResult(r.data);
      if (r.data.success) {
        setManualEmail("");
        setManualNote("");
        setTimeout(() => loadAll(), 2000);
      }
    } catch(e) {
      setManualResult({ success: false, error: "Failed to add lead" });
    }
    setManualLoading(false);
  }

  async function markDemoBooked(leadId, leadName) {
    if (!window.confirm(`Mark demo booked with ${leadName}?`)) return;
    try {
      await axios.post(`${API}/leads/${leadId}/mark-demo`);
      alert(`Demo marked! Check your WhatsApp for celebration message.`);
      loadAll();
    } catch(e) { alert("Failed to update lead"); }
  }

  async function markWon(leadId, leadName) {
    if (!window.confirm(`Mark ${leadName} as WON CUSTOMER? This is your first sale!`)) return;
    try {
      await axios.post(`${API}/leads/${leadId}/mark-won`);
      alert(`CONGRATULATIONS! First customer! Check your WhatsApp!`);
      loadAll();
    } catch(e) { alert("Failed to update lead"); }
  }

  async function searchLeads() {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/scout/run?industry=${searchIndustry}`);
      alert(`Scout started! Finding decision makers globally in ${searchIndustry}. New leads will appear in 2-3 minutes.`);
      // Reload leads after 3 seconds
      setTimeout(() => { loadAll(); }, 3000);
    } catch(e) {
      alert("Scout failed. Check backend logs.");
    }
    setLoading(false);
  }

  async function openLead(id) {
    setSelectedLead(id);
    const r = await axios.get(`${API}/scout/lead/${id}`);
    setLeadDetail(r.data);
    setTab("detail");
  }

  async function addNote() {
    if (!newNote.trim()) return;
    await axios.post(`${API}/scout/note`, {lead_id: selectedLead, note: newNote});
    setNewNote("");
    const r = await axios.get(`${API}/scout/lead/${selectedLead}`);
    setLeadDetail(r.data);
  }

  async function updateStatus(id, status) {
    await axios.patch(`${API}/scout/lead/${id}/status`, {status});
    loadAll();
    if (leadDetail) {
      const r = await axios.get(`${API}/scout/lead/${selectedLead}`);
      setLeadDetail(r.data);
    }
  }

  async function analyzeReply() {
    if (!replyText.trim()) return;
    const r = await axios.post(`${API}/reply/analyze`, {lead_id: selectedLead, reply_text: replyText});
    setReplyResult(r.data);
  }

  async function scheduleFollowups(id) {
    await axios.post(`${API}/followup/schedule/${id}`);
    alert("✅ Follow-up sequence scheduled: Day 3, Day 7, Day 14");
  }

  async function generateProposal(id) {
    setProposal({loading: true});
    const r = await axios.get(`${API}/proposal/${id}`);
    setProposal(r.data);
  }

  async function exportLeads() {
    const r = await axios.get(`${API}/scout/export`);
    const csv = [Object.keys(r.data[0]).join(","), ...r.data.map(row => Object.values(row).map(v=>(`"${v}"`)).join(","))].join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "aventrix_leads.csv"; a.click();
  }

  async function sendEmail(id) {
    if(!window.confirm("Send email to this lead now?")) return;
    const r = await axios.post(`${API}/outreach/send`, {lead_id: id});
    if(r.data.success) { alert("✅ Email sent!"); loadAll(); }
    else alert("❌ Failed. Check backend logs.");
  }

  async function previewEmail(id) {
    const r = await axios.get(`${API}/outreach/preview/${id}`);
    setPreview({...r.data, _leadId: id});
  }

  const statusBadge = (s) => (
    <span style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:500,
      background:STATUS_COLORS[s]||"#f5f5f5",color:STATUS_TEXT[s]||"#555"}}>{STATUS_LABELS[s]||s}</span>
  );

  return (
    <div>
      {/* Email Preview Modal */}
      {preview && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"white",borderRadius:12,padding:24,maxWidth:600,width:"90%",maxHeight:"80vh",overflow:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:600}}>📧 Email Preview</div>
              <button onClick={()=>setPreview(null)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:"#888",marginBottom:4}}>SUBJECT</div>
              <div style={{padding:"8px 12px",background:"#f5f5f5",borderRadius:6,fontSize:14,fontWeight:500}}>{preview.subject}</div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:"#888",marginBottom:4}}>BODY</div>
              <div style={{padding:12,background:"#f5f5f5",borderRadius:6,fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{preview.body}</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{sendEmail(preview._leadId);setPreview(null);}} style={{padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>📤 Send Now</button>
              <button onClick={()=>setPreview(null)} style={{padding:"8px 16px",background:"#f5f5f5",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:600}}>📈 Sales Team</div>
        <div style={{fontSize:13,color:"#666",marginTop:4}}>Scout · Outreach · Qualifier · Booking · Reply Monitor · Follow-ups</div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid #e5e5e5"}}>
        {[["pipeline","🗂 Pipeline"],["leads","👥 All Leads"],["emails","📧 Emails"],["detail","🔍 Lead Detail"],["reply","💬 Reply Monitor"],["linkedin","💼 LinkedIn"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",fontSize:13,cursor:"pointer",background:"none",border:"none",
            borderBottom:tab===t?"2px solid #378ADD":"2px solid transparent",
            color:tab===t?"#0a1628":"#888",fontWeight:tab===t?500:400,marginBottom:"-1px"}}>{l}</button>
        ))}
      </div>

      {/* PIPELINE KANBAN */}
      {tab==="pipeline" && (
        <div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <select value={searchIndustry} onChange={e=>setSearchIndustry(e.target.value)} style={{padding:"7px 10px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13}}>
              <option>IT</option><option>Healthcare</option><option>Finance</option><option>R&D</option>
            </select>
            <button onClick={searchLeads} disabled={loading} style={{padding:"7px 14px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>
              {loading?"Searching...":"🔍 Find Leads"}
            </button>
            <button onClick={exportLeads} style={{padding:"7px 14px",background:"white",border:"1px solid #e5e5e5",borderRadius:8,cursor:"pointer",fontSize:13}}>
              📥 Export CSV
            </button>
            <button onClick={()=>axios.post(`${API}/outreach/daily`).then(r=>alert(`Sent: ${r.data.sent}`))} style={{padding:"7px 14px",background:"white",border:"1px solid #e5e5e5",borderRadius:8,cursor:"pointer",fontSize:13}}>
              📧 Run Outreach
            </button>
            <button onClick={()=>axios.post(`${API}/inbox/check`).then(r=>alert(`Inbox: ${r.data.result?.processed||0} processed, ${r.data.result?.hot||0} hot leads!`))} style={{padding:"7px 14px",background:"#1D9E75",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>
              📬 Check Inbox
            </button>
          </div>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:10}}>
            {STATUSES.filter(s=>s!=="lost").map(status=>(
              <div key={status} style={{minWidth:190,background:"#f8f9fa",borderRadius:10,padding:12,flex:"0 0 190px"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:10,display:"flex",justifyContent:"space-between"}}>
                  <span>{STATUS_LABELS[status]}</span>
                  <span style={{background:STATUS_COLORS[status],color:STATUS_TEXT[status],padding:"1px 7px",borderRadius:10,fontSize:11}}>
                    {(pipeline[status]||[]).length}
                  </span>
                </div>
                {(pipeline[status]||[]).map(lead=>(
                  <div key={lead.id} onClick={()=>openLead(lead.id)}
                    style={{background:"white",borderRadius:8,padding:"10px 12px",marginBottom:8,cursor:"pointer",border:"1px solid #e5e5e5",transition:"box-shadow 0.15s"}}
                    onMouseOver={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.1)"}
                    onMouseOut={e=>e.currentTarget.style.boxShadow="none"}>
                    <div style={{fontSize:13,fontWeight:500,color:"#0a1628"}}>{lead.company}</div>
                    <div style={{fontSize:11,color:"#888",marginTop:2}}>{lead.contact}</div>
                    <div style={{fontSize:11,color:"#888"}}>{lead.industry}</div>
                    <div style={{marginTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontSize:11,fontWeight:500,color:"#378ADD"}}>Score: {lead.score}</div>
                      <div style={{height:3,width:60,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${lead.score}%`,background:"#378ADD",borderRadius:2}}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL LEADS TABLE */}
      {tab==="leads" && (
        <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
          <div style={{fontSize:14,fontWeight:500,marginBottom:16}}>All Leads ({leads.length})</div>
          {leads.length===0
            ? <div style={{fontSize:13,color:"#888",padding:20,textAlign:"center"}}>No leads yet.</div>
            : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>{["Company","Contact","Email","Industry","Score","Status","Actions"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:11,fontWeight:500,color:"#888",textTransform:"uppercase",borderBottom:"1px solid #e5e5e5"}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {leads.map(l=>(
                    <tr key={l.id} style={{borderBottom:"1px solid #f5f5f5"}}>
                      <td style={{padding:"10px 12px"}}><strong style={{cursor:"pointer",color:"#185FA5"}} onClick={()=>openLead(l.id)}>{l.company}</strong></td>
                      <td style={{padding:"10px 12px"}}>{l.contact}</td>
                      <td style={{padding:"10px 12px",fontSize:12,color:"#185FA5"}}>{l.email||"—"}</td>
                      <td style={{padding:"10px 12px"}}>{l.industry}</td>
                      <td style={{padding:"10px 12px"}}>
                        <div>{l.score}</div>
                        <div style={{height:3,width:60,background:"#f0f0f0",borderRadius:2,overflow:"hidden",marginTop:3}}>
                          <div style={{height:"100%",width:`${l.score}%`,background:"#378ADD"}}/>
                        </div>
                      </td>
                      <td style={{padding:"10px 12px"}}>{statusBadge(l.status)}</td>
                      <td style={{padding:"10px 12px"}}>
                        <div style={{display:"flex",gap:4}}>
                          {[["👁","Preview email",()=>previewEmail(l.id)],["📧","Send email",()=>sendEmail(l.id)],
                            ["🔍","View detail",()=>openLead(l.id)],["⭐","Qualify",()=>axios.post(`${API}/qualifier/qualify/${l.id}`).then(r=>alert(`Score:${r.data.score} Fit:${r.data.fit}`))],
                            ["📅","Book demo",()=>{axios.post(`${API}/booking/book/${l.id}`);alert("Demo booked!");}]
                          ].map(([icon,title,fn])=>(
                            <button key={icon} title={title} onClick={fn} style={{padding:"4px 8px",background:"white",border:"1px solid #e5e5e5",borderRadius:6,cursor:"pointer",fontSize:12}}>{icon}</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}

      {/* EMAILS */}
      {tab==="emails" && (
        <div>
          {emails.length===0
            ? <div style={{background:"white",borderRadius:12,padding:40,textAlign:"center",fontSize:13,color:"#888",border:"1px solid #e5e5e5"}}>No emails sent yet.</div>
            : emails.map(e=>(
              <div key={e.id} style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:"#0a1628"}}>{e.subject}</div>
                    <div style={{fontSize:12,color:"#888",marginTop:3}}>Lead #{e.lead_id} · {new Date(e.sent_at).toLocaleString()}</div>
                  </div>
                  <span style={{padding:"3px 10px",background:"#EAF3DE",color:"#3B6D11",borderRadius:20,fontSize:11,fontWeight:500,height:"fit-content"}}>{e.status}</span>
                </div>
                <div style={{background:"#f8f9fa",borderRadius:8,padding:14,borderLeft:"3px solid #378ADD"}}>
                  <div style={{fontSize:11,color:"#888",marginBottom:6,textTransform:"uppercase"}}>Email Body</div>
                  <div style={{fontSize:13,color:"#333",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{e.body||"Body not available"}</div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* LEAD DETAIL */}
      {tab==="detail" && (
        <div>
          {!leadDetail
            ? <div style={{background:"white",borderRadius:12,padding:40,textAlign:"center",fontSize:13,color:"#888",border:"1px solid #e5e5e5"}}>
                Click on any lead to view details
              </div>
            : <div>
                {/* Header */}
                <div style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:18,fontWeight:600,color:"#0a1628"}}>{leadDetail.lead.company}</div>
                      <div style={{fontSize:13,color:"#666",marginTop:3}}>{leadDetail.lead.contact} · {leadDetail.lead.industry} · {leadDetail.lead.country}</div>
                      <div style={{fontSize:13,color:"#185FA5",marginTop:2}}>{leadDetail.lead.email}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:24,fontWeight:700,color:"#378ADD"}}>{leadDetail.lead.score}</div>
                      <div style={{fontSize:11,color:"#888"}}>Lead Score</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
                    <select value={leadDetail.lead.status} onChange={e=>updateStatus(leadDetail.lead.id,e.target.value)}
                      style={{padding:"6px 10px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13,cursor:"pointer"}}>
                      {STATUSES.map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <button onClick={()=>sendEmail(leadDetail.lead.id)} style={{padding:"6px 12px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>📧 Send Email</button>
                    <button onClick={()=>scheduleFollowups(leadDetail.lead.id)} style={{padding:"6px 12px",background:"white",border:"1px solid #e5e5e5",borderRadius:8,cursor:"pointer",fontSize:13}}>⏰ Schedule Follow-ups</button>
                    <button onClick={()=>generateProposal(leadDetail.lead.id)} style={{padding:"6px 12px",background:"white",border:"1px solid #e5e5e5",borderRadius:8,cursor:"pointer",fontSize:13}}>📄 Generate Proposal</button>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {/* Activity Timeline */}
                  <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
                    <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>📋 Activity Timeline</div>
                    {leadDetail.activities.length===0
                      ? <div style={{fontSize:13,color:"#888"}}>No activity yet.</div>
                      : leadDetail.activities.map((a,i)=>(
                        <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:"#378ADD",marginTop:5,flexShrink:0}}/>
                          <div>
                            <div style={{fontSize:13,fontWeight:500}}>{a.activity}</div>
                            <div style={{fontSize:11,color:"#888"}}>{a.description}</div>
                            <div style={{fontSize:11,color:"#aaa"}}>{new Date(a.time).toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Notes */}
                  <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
                    <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>📝 Notes</div>
                    <div style={{display:"flex",gap:8,marginBottom:12}}>
                      <input value={newNote} onChange={e=>setNewNote(e.target.value)}
                        onKeyDown={e=>e.key==="Enter"&&addNote()}
                        placeholder="Add a note..." style={{flex:1,padding:"8px 10px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13,outline:"none"}}/>
                      <button onClick={addNote} style={{padding:"8px 12px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>Add</button>
                    </div>
                    {leadDetail.notes.map((n,i)=>(
                      <div key={i} style={{padding:"8px 12px",background:"#FFFDE7",borderRadius:8,marginBottom:8,fontSize:13,lineHeight:1.6}}>
                        <div>{n.note}</div>
                        <div style={{fontSize:11,color:"#888",marginTop:4}}>{n.created_by} · {new Date(n.time).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Follow-ups */}
                  <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
                    <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>⏰ Follow-up Sequence</div>
                    {leadDetail.followups.length===0
                      ? <div style={{fontSize:13,color:"#888"}}>No follow-ups scheduled.<br/><button onClick={()=>scheduleFollowups(leadDetail.lead.id)} style={{marginTop:8,padding:"6px 12px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:12}}>Schedule Now</button></div>
                      : leadDetail.followups.map((f,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f5f5f5",fontSize:13}}>
                          <span>Day {f.day} follow-up</span>
                          <span style={{fontSize:11,color:"#888"}}>{new Date(f.scheduled).toLocaleDateString()}</span>
                          <span style={{padding:"1px 8px",borderRadius:10,fontSize:11,background:f.status==="sent"?"#EAF3DE":"#FAEEDA",color:f.status==="sent"?"#3B6D11":"#854F0B"}}>{f.status}</span>
                        </div>
                      ))
                    }
                  </div>

                  {/* Emails sent */}
                  <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
                    <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>📧 Emails Sent ({leadDetail.emails.length})</div>
                    {leadDetail.emails.length===0
                      ? <div style={{fontSize:13,color:"#888"}}>No emails sent yet.</div>
                      : leadDetail.emails.map((e,i)=>(
                        <div key={i} style={{padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}>
                          <div style={{fontSize:13,fontWeight:500}}>{e.subject}</div>
                          <div style={{fontSize:11,color:"#888"}}>{e.sent_at}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Proposal */}
                {proposal && !proposal.loading && (
                  <div style={{background:"white",borderRadius:12,padding:20,marginTop:12,border:"1px solid #e5e5e5"}}>
                    <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>📄 Generated Proposal</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      {[["Executive Summary",proposal.executive_summary],["Problem Statement",proposal.problem],["Our Solution",proposal.solution],["ROI Estimate",proposal.roi_estimate]].map(([title,content])=>(
                        <div key={title}>
                          <div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:6}}>{title}</div>
                          <div style={{fontSize:13,color:"#333",lineHeight:1.7}}>{content}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:14,padding:14,background:"#E6F1FB",borderRadius:8}}>
                      <div style={{fontSize:13,fontWeight:600}}>Recommended Plan: {proposal.pricing_tier} — ${proposal.pricing_amount}/month</div>
                      <div style={{fontSize:13,marginTop:4,color:"#555"}}>Next Steps: {proposal.next_steps}</div>
                    </div>
                  </div>
                )}
              </div>
          }
        </div>
      )}

      {/* REPLY MONITOR */}
      {tab==="reply" && (
        <div>
          <div style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5"}}>
            <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>💬 Analyze Lead Reply</div>
            <div style={{marginBottom:10,fontSize:13,color:"#666"}}>Paste a reply you received from a lead. The AI will categorize it and suggest a response.</div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:12,fontWeight:500,color:"#555",display:"block",marginBottom:6}}>Select Lead</label>
              <select onChange={e=>setSelectedLead(parseInt(e.target.value))} style={{padding:"8px 10px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13,width:"100%"}}>
                <option value="">-- Select lead --</option>
                {leads.map(l=><option key={l.id} value={l.id}>{l.company} — {l.contact}</option>)}
              </select>
            </div>
            <textarea value={replyText} onChange={e=>setReplyText(e.target.value)}
              placeholder="Paste the reply email text here..."
              style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #e5e5e5",fontSize:13,lineHeight:1.7,minHeight:100,resize:"vertical",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            <button onClick={analyzeReply} disabled={!replyText.trim()||!selectedLead}
              style={{marginTop:10,padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>
              🤖 Analyze Reply
            </button>
          </div>

          {replyResult && (
            <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>Analysis Result</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
                {[["Category",replyResult.category],["Sentiment",replyResult.sentiment],["Next Action",replyResult.next_action]].map(([k,v])=>(
                  <div key={k} style={{padding:12,background:"#f8f9fa",borderRadius:8}}>
                    <div style={{fontSize:11,color:"#888",marginBottom:4}}>{k}</div>
                    <div style={{fontSize:14,fontWeight:600,color:"#0a1628",textTransform:"capitalize"}}>{v}</div>
                  </div>
                ))}
              </div>
              {replyResult.suggested_response && (
                <div>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>💡 Suggested Response:</div>
                  <div style={{padding:14,background:"#E6F1FB",borderRadius:8,fontSize:13,lineHeight:1.8,borderLeft:"3px solid #378ADD"}}>
                    {replyResult.suggested_response}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
