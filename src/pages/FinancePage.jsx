import { useState, useEffect } from "react";
import axios from "axios";
const API = "https://avebackend.onrender.com/api";

export default function FinancePage() {
  const [tab, setTab] = useState("mrr");
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [mrr, setMrr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newInvoice, setNewInvoice] = useState({client_name:"",client_email:"",plan:"Business",amount:149});
  const [newExpense, setNewExpense] = useState({name:"",amount:"",category:"API"});

  useEffect(() => {
    axios.get(`${API}/finance/invoices`).then(r=>setInvoices(r.data)).catch(()=>{});
    axios.get(`${API}/finance/expenses`).then(r=>setExpenses(r.data)).catch(()=>{});
    axios.get(`${API}/finance/mrr`).then(r=>setMrr(r.data)).catch(()=>{});
  }, []);

  async function loadSummary() {
    setLoading(true);
    try { const r = await axios.get(`${API}/finance/summary`); setSummary(r.data); }
    catch(e) {} setLoading(false);
  }

  async function createInvoice() {
    if(!newInvoice.client_name||!newInvoice.client_email) return alert("Fill client name and email");
    const r = await axios.post(`${API}/finance/invoice`, {
      client_name: newInvoice.client_name,
      client_email: newInvoice.client_email,
      items: [{description: `SecureAI Gateway — ${newInvoice.plan} Plan`, amount: parseFloat(newInvoice.amount)}]
    });
    alert(`✅ Invoice ${r.data.invoice_no} created!`);
    const inv = await axios.get(`${API}/finance/invoices`); setInvoices(inv.data);
    setNewInvoice({client_name:"",client_email:"",plan:"Business",amount:149});
  }

  async function markPaid(id) {
    await axios.patch(`${API}/finance/invoice/${id}/status`, {status:"paid"});
    const r = await axios.get(`${API}/finance/invoices`); setInvoices(r.data);
    const m = await axios.get(`${API}/finance/mrr`); setMrr(m.data);
    alert("✅ Marked as paid! MRR updated.");
  }

  async function addExpense() {
    if(!newExpense.name||!newExpense.amount) return;
    await axios.post(`${API}/finance/expense`, {...newExpense, amount: parseFloat(newExpense.amount)});
    const r = await axios.get(`${API}/finance/expenses`); setExpenses(r.data);
    const m = await axios.get(`${API}/finance/mrr`); setMrr(m.data);
    setNewExpense({name:"",amount:"",category:"API"});
  }

  const statusColor = s => s==="paid"?{bg:"#EAF3DE",fg:"#3B6D11"}:s==="sent"?{bg:"#FAEEDA",fg:"#854F0B"}:{bg:"#f5f5f5",fg:"#666"};

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:600}}>💰 Finance</div>
        <div style={{fontSize:13,color:"#666",marginTop:4}}>MRR · Invoices · Expenses · Forecasting</div>
      </div>

      {/* MRR Cards */}
      {mrr && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[["MRR",`$${mrr.mrr.toFixed(0)}`,"Monthly recurring revenue"],
            ["Total Revenue",`$${mrr.total_revenue.toFixed(0)}`,"All time"],
            ["Expenses",`$${mrr.total_expenses.toFixed(0)}`,"Total spent"],
            ["Profit",`$${mrr.profit.toFixed(0)}`,mrr.profit>=0?"Positive ✅":"Negative ⚠️"]
          ].map(([label,val,note])=>(
            <div key={label} style={{background:"white",borderRadius:10,padding:16,border:"1px solid #e5e5e5"}}>
              <div style={{fontSize:11,color:"#888",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>{label}</div>
              <div style={{fontSize:24,fontWeight:600,color:"#0a1628"}}>{val}</div>
              <div style={{fontSize:11,color:"#aaa",marginTop:4}}>{note}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid #e5e5e5"}}>
        {[["mrr","📊 Summary"],["invoices","🧾 Invoices"],["expenses","💸 Expenses"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",fontSize:13,cursor:"pointer",background:"none",border:"none",
            borderBottom:tab===t?"2px solid #378ADD":"2px solid transparent",
            color:tab===t?"#0a1628":"#888",fontWeight:tab===t?500:400,marginBottom:"-1px"}}>{l}</button>
        ))}
      </div>

      {/* SUMMARY */}
      {tab==="mrr" && (
        <div>
          <button onClick={loadSummary} disabled={loading}
            style={{padding:"8px 16px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:16}}>
            {loading?"Analyzing...":"📊 Generate AI Financial Summary"}
          </button>
          {summary && (
            <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                {[["Conservative MRR",`$${summary.conservative_mrr}`],["Optimistic MRR",`$${summary.optimistic_mrr}`]].map(([k,v])=>(
                  <div key={k} style={{padding:14,background:"#f8f9fa",borderRadius:8}}>
                    <div style={{fontSize:11,color:"#888",marginBottom:4}}>{k}</div>
                    <div style={{fontSize:22,fontWeight:600,color:"#0a1628"}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:13,lineHeight:1.8,marginBottom:12}}>{summary.summary}</div>
              <div style={{padding:14,background:"#E6F1FB",borderRadius:8,fontSize:13,borderLeft:"3px solid #378ADD"}}>
                <strong>CEO Advice:</strong> {summary.advice}
              </div>
            </div>
          )}
        </div>
      )}

      {/* INVOICES */}
      {tab==="invoices" && (
        <div>
          <div style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5"}}>
            <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>Create New Invoice</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr auto",gap:10,alignItems:"end"}}>
              <div>
                <div style={{fontSize:12,color:"#555",marginBottom:4}}>Client Name</div>
                <input value={newInvoice.client_name} onChange={e=>setNewInvoice({...newInvoice,client_name:e.target.value})}
                  placeholder="Company name" style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:12,color:"#555",marginBottom:4}}>Client Email</div>
                <input value={newInvoice.client_email} onChange={e=>setNewInvoice({...newInvoice,client_email:e.target.value})}
                  placeholder="email@company.com" style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:12,color:"#555",marginBottom:4}}>Plan</div>
                <select value={newInvoice.plan} onChange={e=>{const amounts={Starter:49,Business:149,Enterprise:399};setNewInvoice({...newInvoice,plan:e.target.value,amount:amounts[e.target.value]||149})}}
                  style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13}}>
                  <option>Starter</option><option>Business</option><option>Enterprise</option>
                </select>
              </div>
              <div>
                <div style={{fontSize:12,color:"#555",marginBottom:4}}>Amount ($)</div>
                <input type="number" value={newInvoice.amount} onChange={e=>setNewInvoice({...newInvoice,amount:e.target.value})}
                  style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <button onClick={createInvoice} style={{padding:"8px 14px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>
                Create
              </button>
            </div>
          </div>
          <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
            <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>All Invoices ({invoices.length})</div>
            {invoices.length===0
              ? <div style={{fontSize:13,color:"#888",textAlign:"center",padding:20}}>No invoices yet.</div>
              : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr>{["Invoice #","Client","Amount","Status","Due Date","Action"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:11,fontWeight:500,color:"#888",textTransform:"uppercase",borderBottom:"1px solid #e5e5e5"}}>{h}</th>
                  ))}</tr></thead>
                  <tbody>
                    {invoices.map(inv=>{const c=statusColor(inv.status); return (
                      <tr key={inv.id} style={{borderBottom:"1px solid #f5f5f5"}}>
                        <td style={{padding:"10px 12px",fontWeight:500,color:"#185FA5"}}>{inv.invoice_no}</td>
                        <td style={{padding:"10px 12px"}}>{inv.client}</td>
                        <td style={{padding:"10px 12px",fontWeight:600}}>${inv.amount}</td>
                        <td style={{padding:"10px 12px"}}><span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:500,background:c.bg,color:c.fg}}>{inv.status}</span></td>
                        <td style={{padding:"10px 12px",fontSize:12,color:"#888"}}>{inv.due_date}</td>
                        <td style={{padding:"10px 12px"}}>
                          <div style={{display:"flex",gap:6}}>
                            {inv.status!=="paid"&&<button onClick={()=>markPaid(inv.id)} style={{padding:"4px 10px",background:"#EAF3DE",color:"#3B6D11",border:"none",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:500}}>Mark Paid ✓</button>}
                            <button onClick={()=>window.open(`https://avebackend.onrender.com/api/finance/invoice/${inv.id}/pdf`,'_blank')} style={{padding:"4px 10px",background:"#E6F1FB",color:"#185FA5",border:"none",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:500}}>📄 View PDF</button>
                          </div>
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
            }
          </div>
        </div>
      )}

      {/* EXPENSES */}
      {tab==="expenses" && (
        <div>
          <div style={{background:"white",borderRadius:12,padding:20,marginBottom:12,border:"1px solid #e5e5e5"}}>
            <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>Add Expense</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:10,alignItems:"end"}}>
              <div>
                <div style={{fontSize:12,color:"#555",marginBottom:4}}>Description</div>
                <input value={newExpense.name} onChange={e=>setNewExpense({...newExpense,name:e.target.value})}
                  placeholder="e.g. Anthropic API credits" style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:12,color:"#555",marginBottom:4}}>Amount ($)</div>
                <input type="number" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense,amount:e.target.value})}
                  placeholder="10.00" style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:12,color:"#555",marginBottom:4}}>Category</div>
                <select value={newExpense.category} onChange={e=>setNewExpense({...newExpense,category:e.target.value})}
                  style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e5e5e5",fontSize:13}}>
                  <option>API</option><option>Tools</option><option>Marketing</option><option>Infrastructure</option><option>Other</option>
                </select>
              </div>
              <button onClick={addExpense} style={{padding:"8px 14px",background:"#0a1628",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13}}>Add</button>
            </div>
          </div>
          <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e5e5"}}>
            <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>All Expenses</div>
            {expenses.length===0
              ? <div style={{fontSize:13,color:"#888",textAlign:"center",padding:20}}>No expenses tracked yet.</div>
              : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr>{["Description","Amount","Category","Date"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:11,fontWeight:500,color:"#888",textTransform:"uppercase",borderBottom:"1px solid #e5e5e5"}}>{h}</th>
                  ))}</tr></thead>
                  <tbody>
                    {expenses.map(e=>(
                      <tr key={e.id} style={{borderBottom:"1px solid #f5f5f5"}}>
                        <td style={{padding:"10px 12px"}}>{e.name}</td>
                        <td style={{padding:"10px 12px",fontWeight:600,color:"#A32D2D"}}>${e.amount}</td>
                        <td style={{padding:"10px 12px"}}><span style={{padding:"2px 8px",borderRadius:10,fontSize:11,background:"#f5f5f5",color:"#555"}}>{e.category}</span></td>
                        <td style={{padding:"10px 12px",fontSize:12,color:"#888"}}>{e.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </div>
      )}
    </div>
  );
}
