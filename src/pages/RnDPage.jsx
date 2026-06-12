import { useState } from "react";
import axios from "axios";
const API = "https://avebackend.onrender.com/api";

export default function RnDPage() {
  const [tab, setTab] = useState("competitors");
  const [competitors, setCompetitors] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [trends, setTrends] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load(type) {
    setLoading(true);
    try {
      if(type==="competitors") { const r=await axios.get(`${API}/rnd/competitors`); setCompetitors(r.data.competitors||[]); }
      if(type==="ideas") { const r=await axios.get(`${API}/rnd/ideas`); setIdeas(r.data.ideas||[]); }
      if(type==="trends") { const r=await axios.get(`${API}/rnd/trends`); setTrends(r.data); }
      if(type==="feedback") { const r=await axios.get(`${API}/rnd/feedback`); setFeedback(r.data); }
      if(type==="roadmap") { const r=await axios.get(`${API}/rnd/roadmap`); setRoadmap(r.data.roadmap||[]); }
    } catch(e) {} setLoading(false);
  }

  const priorityStyle = p => ({high:{bg:"#FCEBEB",fg:"#A32D2D"},medium:{bg:"#FAEEDA",fg:"#854F0B"},low:{bg:"#EAF3DE",fg:"#3B6D11"}}[p]||{bg:"#f5f5f5",fg:"#555"});

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:600}}>🔬 R&D Agent</div>
        <div style={{fontSize:13,color:"#666",marginTop:4}}>Competitor Intel · Product Ideas · Market Trends · Customer Feedback</div>
      </div>

      <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid #e5e5e5"}}>
        {[["competitors","🏢 Competitors"],["ideas","💡 Ideas"],["roadmap","🗺 Roadmap"],["trends","📈 Trends"],["feedback","💬 Feedback"]].map(([t,l])=>(
          <button key={t} onClick={()=>{setTab(t);}} style={{padding:"8px 14px",fontSize:13,cursor:"pointer",background:"none",border:"none",
            borderBottom:tab===t?"2px solid #378ADD":"2px solid transparent",
            color:tab===t?"#0a1628":"#888",fontWeight:tab===t?500:400,marginBottom:"-1px"}}>{l}</button>
        ))}
      </div>

      {/* COMPETITORS */}
      {tab==="competitors" && (
        <div>
          <button onClick={()=>load("competitors")} disabled={loading}
            style={{padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:16}}>
            {loading?"Researching...":"🔍 Research Competitors"}
          </button>
          {competitors.map((c,i)=>(
            <div key={i} style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5"}}>
              <div style={{fontSize:15,fontWeight:600,color:"#0a1628",marginBottom:10}}>{c.name}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                <div><div style={{fontSize:11,color:"#888",marginBottom:4}}>KEY FEATURES</div><div style={{fontSize:13,lineHeight:1.6}}>{c.features}</div></div>
                <div><div style={{fontSize:11,color:"#888",marginBottom:4}}>PRICING</div><div style={{fontSize:13,lineHeight:1.6}}>{c.pricing}</div></div>
                <div><div style={{fontSize:11,color:"#888",marginBottom:4}}>OUR ADVANTAGE</div><div style={{fontSize:13,lineHeight:1.6,color:"#0F6E56",fontWeight:500}}>{c.weakness}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRODUCT IDEAS */}
      {tab==="ideas" && (
        <div>
          <button onClick={()=>load("ideas")} disabled={loading}
            style={{padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:16}}>
            {loading?"Generating...":"💡 Generate Product Ideas"}
          </button>
          {ideas.map((idea,i)=>{const ps=priorityStyle(idea.priority); return (
            <div key={i} style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontSize:14,fontWeight:600,color:"#0a1628"}}>{idea.idea}</div>
                <div style={{display:"flex",gap:6}}>
                  <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:500,background:ps.bg,color:ps.fg}}>{idea.priority} priority</span>
                  <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,background:"#f5f5f5",color:"#555"}}>{idea.effort} effort</span>
                </div>
              </div>
              <div style={{fontSize:13,color:"#666",lineHeight:1.6}}>{idea.reason}</div>
            </div>
          );})}
        </div>
      )}

      {/* ROADMAP */}
      {tab==="roadmap" && (
        <div>
          <button onClick={()=>load("roadmap")} disabled={loading}
            style={{padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:16}}>
            {loading?"Building...":"🗺 Generate Product Roadmap"}
          </button>
          {roadmap.length>0 && (
            <div>
              {["high","medium","low"].map(priority=>{
                const items=roadmap.filter(r=>r.priority===priority);
                if(!items.length) return null;
                const ps=priorityStyle(priority);
                return (
                  <div key={priority} style={{marginBottom:16}}>
                    <div style={{padding:"6px 12px",background:ps.bg,color:ps.fg,borderRadius:8,fontSize:12,fontWeight:600,display:"inline-block",marginBottom:10,textTransform:"capitalize"}}>
                      {priority} Priority
                    </div>
                    {items.map((item,i)=>(
                      <div key={i} style={{background:"white",borderRadius:10,padding:16,marginBottom:8,border:"1px solid #e5e5e5",display:"flex",justifyContent:"space-between"}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:500,color:"#0a1628"}}>{item.idea}</div>
                          <div style={{fontSize:12,color:"#888",marginTop:4}}>{item.reason}</div>
                        </div>
                        <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,background:"#f5f5f5",color:"#555",height:"fit-content",marginLeft:12,flexShrink:0}}>{item.effort}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TRENDS */}
      {tab==="trends" && (
        <div>
          <button onClick={()=>load("trends")} disabled={loading}
            style={{padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:16}}>
            {loading?"Analyzing...":"📈 Generate Market Trend Report"}
          </button>
          {trends && (
            <div>
              <div style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5"}}>
                <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>{trends.title}</div>
                <div style={{fontSize:12,color:"#888",marginBottom:16}}>{trends.date}</div>
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:10}}>🔴 Key Incidents This Week</div>
                  {(trends.incidents||[]).map((inc,i)=>(
                    <div key={i} style={{padding:12,background:"#FCEBEB",borderRadius:8,marginBottom:8}}>
                      <div style={{fontSize:13,fontWeight:500,color:"#A32D2D"}}>{inc.title}</div>
                      <div style={{fontSize:13,marginTop:4,color:"#555"}}>{inc.summary}</div>
                      <div style={{fontSize:12,color:"#888",marginTop:4}}>Impact: {inc.impact}</div>
                    </div>
                  ))}
                </div>
                {[["Market Update",trends.market_update],["Regulatory Update",trends.regulatory_update],["Opportunity for Aventrix",trends.opportunity],["Recommended Action",trends.recommended_action]].map(([k,v])=>v&&(
                  <div key={k} style={{marginBottom:12}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:4}}>{k}</div>
                    <div style={{fontSize:13,color:"#333",lineHeight:1.7,padding:12,background:"#f8f9fa",borderRadius:8}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEEDBACK */}
      {tab==="feedback" && (
        <div>
          <button onClick={()=>load("feedback")} disabled={loading}
            style={{padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:16}}>
            {loading?"Analyzing...":"💬 Analyze Customer Feedback"}
          </button>
          {feedback && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[["Top Objections","top_objections","#FCEBEB","#A32D2D"],["Feature Requests","feature_requests","#E6F1FB","#185FA5"],
                ["Key Insights","insights","#EAF3DE","#3B6D11"]].map(([title,key,bg,fg])=>(
                <div key={key} style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:12}}>{title}</div>
                  {(feedback[key]||[]).map((item,i)=>(
                    <div key={i} style={{padding:"6px 10px",background:bg,color:fg,borderRadius:6,fontSize:13,marginBottom:6}}>{item}</div>
                  ))}
                </div>
              ))}
              <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
                <div style={{fontSize:14,fontWeight:500,marginBottom:12}}>Overall Sentiment</div>
                <div style={{fontSize:24,fontWeight:700,color:"#0a1628",textTransform:"capitalize",marginBottom:8}}>{feedback.sentiment}</div>
                <div style={{fontSize:13,color:"#666",lineHeight:1.7}}>{feedback.recommendation}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
