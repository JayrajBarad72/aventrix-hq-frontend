import { useState, useEffect } from "react";
import axios from "axios";
const API = "https://avebackend.onrender.com/api";

export default function MarketingPage() {
  const [tab, setTab] = useState("blog");
  const [posts, setPosts] = useState([]);
  const [social, setSocial] = useState([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [landingHtml, setLandingHtml] = useState("");
  const [newsletter, setNewsletter] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    axios.get(`${API}/blog/posts`).then(r=>setPosts(r.data)).catch(()=>{});
    axios.get(`${API}/social/posts`).then(r=>setSocial(r.data.posts||[])).catch(()=>{});
  }, []);

  async function writeBlog() {
    setLoading(true);
    try {
      await axios.post(`${API}/blog/write`, {topic: topic||null});
      const r = await axios.get(`${API}/blog/posts`);
      setPosts(r.data); setTopic("");
    } catch(e) {}
    setLoading(false);
  }

  async function generateCalendar() {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/social/calendar`);
      setSocial(r.data.posts||[]);
    } catch(e) {}
    setLoading(false);
  }

  async function generateLanding() {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/landing-page?industry=enterprise`);
      setLandingHtml(r.data.html);
    } catch(e) {}
    setLoading(false);
  }

  async function generateNewsletter() {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/newsletter`);
      setNewsletter(r.data);
    } catch(e) {}
    setLoading(false);
  }

  function downloadLanding() {
    const blob = new Blob([landingHtml], {type:"text/html"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="secureai-landing.html"; a.click();
  }

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:600}}>📣 Marketing Team</div>
        <div style={{fontSize:13,color:"#666",marginTop:4}}>Blog · Social Media · Newsletter · Landing Page</div>
      </div>

      <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid #e5e5e5"}}>
        {[["blog","✍️ Blog"],["social","📱 Social"],["landing","🌐 Landing Page"],["newsletter","📰 Newsletter"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",fontSize:13,cursor:"pointer",background:"none",border:"none",
            borderBottom:tab===t?"2px solid #378ADD":"2px solid transparent",
            color:tab===t?"#0a1628":"#888",fontWeight:tab===t?500:400,marginBottom:"-1px"}}>{l}</button>
        ))}
      </div>

      {/* BLOG */}
      {tab==="blog" && (
        <div>
          <div style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5"}}>
            <div style={{display:"flex",gap:10}}>
              <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Blog topic (optional — agent picks one)"
                style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13,outline:"none"}}/>
              <button onClick={writeBlog} disabled={loading}
                style={{padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>
                {loading?"Writing...":"✍️ Write Blog Post"}
              </button>
            </div>
          </div>
          {posts.length===0
            ? <div style={{background:"white",borderRadius:12,padding:40,textAlign:"center",fontSize:13,color:"#888",border:"1px solid #e5e5e5"}}>No posts yet.</div>
            : posts.map(p=>(
              <div key={p.id} style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5",cursor:"pointer"}}
                onClick={()=>setSelectedPost(selectedPost?.id===p.id?null:p)}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontSize:15,fontWeight:600,color:"#0a1628"}}>{p.title}</div>
                  <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,background:"#f5f5f5",color:"#666"}}>{p.status}</span>
                </div>
                <div style={{fontSize:12,color:"#888",marginBottom:8}}>{p.keywords}</div>
                {selectedPost?.id===p.id && (
                  <div style={{marginTop:12,padding:14,background:"#f8f9fa",borderRadius:8,fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap"}}>
                    {p.content}
                  </div>
                )}
                <div style={{fontSize:11,color:"#aaa",marginTop:4}}>{new Date(p.created_at).toLocaleDateString()}</div>
              </div>
            ))
          }
        </div>
      )}

      {/* SOCIAL */}
      {tab==="social" && (
        <div>
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <button onClick={generateCalendar} disabled={loading}
              style={{padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>
              {loading?"Generating...":"📅 Generate 30-Day Calendar"}
            </button>
          </div>
          {social.length===0
            ? <div style={{background:"white",borderRadius:12,padding:40,textAlign:"center",fontSize:13,color:"#888",border:"1px solid #e5e5e5"}}>Click to generate 30 days of LinkedIn content.</div>
            : <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                {social.slice(0,20).map((p,i)=>(
                  <div key={i} style={{background:"white",borderRadius:12,padding:16,border:"1px solid #e5e5e5"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                      <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,background:"#E6F1FB",color:"#185FA5"}}>{p.type||"post"}</span>
                      <span style={{fontSize:11,color:"#888"}}>{p.scheduled_at||p.date||""}</span>
                    </div>
                    <div style={{fontSize:13,color:"#333",lineHeight:1.7,marginBottom:8}}>{p.content}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {(p.hashtags||[]).slice(0,4).map((h,j)=>(
                        <span key={j} style={{fontSize:11,color:"#185FA5"}}>#{typeof h==="string"?h:h}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* LANDING PAGE */}
      {tab==="landing" && (
        <div>
          <div style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5"}}>
            <div style={{fontSize:14,fontWeight:500,marginBottom:10}}>🌐 Landing Page Generator</div>
            <div style={{fontSize:13,color:"#666",marginBottom:14}}>Generate a complete HTML landing page for SecureAI Gateway. Download and upload to your website.</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={generateLanding} disabled={loading}
                style={{padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>
                {loading?"Generating...":"🚀 Generate Landing Page"}
              </button>
              {landingHtml && (
                <button onClick={downloadLanding}
                  style={{padding:"8px 16px",background:"white",border:"1px solid #e5e5e5",borderRadius:8,cursor:"pointer",fontSize:13}}>
                  📥 Download HTML
                </button>
              )}
            </div>
          </div>
          {landingHtml && (
            <div style={{background:"white",borderRadius:12,border:"1px solid #e5e5e5",overflow:"hidden"}}>
              <div style={{padding:"10px 16px",borderBottom:"1px solid #e5e5e5",fontSize:12,color:"#888"}}>Preview</div>
              <iframe srcDoc={landingHtml} style={{width:"100%",height:600,border:"none"}} title="Landing Page Preview"/>
            </div>
          )}
        </div>
      )}

      {/* NEWSLETTER */}
      {tab==="newsletter" && (
        <div>
          <div style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5"}}>
            <div style={{fontSize:14,fontWeight:500,marginBottom:10}}>📰 Weekly Newsletter</div>
            <div style={{fontSize:13,color:"#666",marginBottom:14}}>Generate this week's AI security newsletter to send to your lead database.</div>
            <button onClick={generateNewsletter} disabled={loading}
              style={{padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>
              {loading?"Generating...":"📰 Generate Newsletter"}
            </button>
          </div>
          {newsletter && (
            <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
              <div style={{padding:"8px 14px",background:"#f5f5f5",borderRadius:8,fontSize:14,fontWeight:500,marginBottom:14}}>
                Subject: {newsletter.subject}
              </div>
              <div style={{fontSize:13,lineHeight:1.8,color:"#333"}}>
                {newsletter.body.split("\n").map((line,i)=>{
                  if(line.startsWith("## ")) return <div key={i} style={{fontSize:15,fontWeight:600,color:"#0a1628",marginTop:16,marginBottom:6}}>{line.replace("## ","")}</div>;
                  if(line.startsWith("# ")) return <div key={i} style={{fontSize:17,fontWeight:700,color:"#0a1628",marginBottom:8}}>{line.replace("# ","")}</div>;
                  if(line.startsWith("**") && line.endsWith("**")) return <div key={i} style={{fontWeight:600,marginTop:4}}>{line.replace(/\*\*/g,"")}</div>;
                  if(line.startsWith("- ")) return <div key={i} style={{paddingLeft:16,marginTop:2}}>• {line.slice(2)}</div>;
                  if(line==="---") return <hr key={i} style={{border:"none",borderTop:"1px solid #e5e5e5",margin:"12px 0"}}/>;
                  if(!line.trim()) return <div key={i} style={{height:8}}/>;
                  return <div key={i} style={{marginTop:4}}>{line.replace(/\*\*(.*?)\*\*/g,"$1")}</div>;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
