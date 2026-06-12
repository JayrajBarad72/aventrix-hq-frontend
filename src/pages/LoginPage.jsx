import { useState } from "react";
import axios from "axios";
const API = "https://avebackend.onrender.com/api";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true); setError("");
    try {
      const r = await axios.post(`${API}/auth/login`, { username, password });
      localStorage.setItem("hq_token", r.data.token);
      localStorage.setItem("hq_user", r.data.username);
      onLogin(r.data.token);
    } catch(e) {
      setError("Invalid username or password");
    }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",background:"#0a1628",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"white",borderRadius:16,padding:"40px 36px",width:380,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:40,marginBottom:8}}>🛡️</div>
          <div style={{fontSize:22,fontWeight:700,color:"#0a1628"}}>Aventrix AI HQ</div>
          <div style={{fontSize:13,color:"#888",marginTop:4}}>Sign in to access your AI company</div>
        </div>
        {error && <div style={{background:"#FCEBEB",color:"#A32D2D",padding:"8px 12px",borderRadius:8,fontSize:13,marginBottom:16}}>{error}</div>}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:500,color:"#555",marginBottom:6}}>Username</div>
          <input value={username} onChange={e=>setUsername(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            placeholder="admin" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:500,color:"#555",marginBottom:6}}>Password</div>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            placeholder="••••••••" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <button onClick={handleLogin} disabled={loading}
          style={{width:"100%",padding:"11px",background:"#0a1628",color:"white",border:"none",borderRadius:8,fontSize:14,fontWeight:500,cursor:"pointer"}}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>
        <div style={{fontSize:11,color:"#aaa",textAlign:"center",marginTop:16}}>Default: admin / aventrix2024</div>
      </div>
    </div>
  );
}
