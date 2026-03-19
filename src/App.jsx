import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qyofbhcsstxexaudavdt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5b2ZiaGNzc3R4ZXhhdWRhdmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzQ5OTcsImV4cCI6MjA4OTQ1MDk5N30.zLejBWfdr6Q_7Sn3moC4sdt_8pIKbSKcdLSZBX-XYE8";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const WORKERS = ["Federico", "Ahmed", "Khaled", "Mai"];
const WORKER_COLORS = {
  Federico: { bg:"#EDE9FE", text:"#5B21B6", dot:"#7C3AED", btn:"#7C3AED" },
  Ahmed:    { bg:"#DBEAFE", text:"#1D4ED8", dot:"#2563EB", btn:"#2563EB" },
  Khaled:   { bg:"#D1FAE5", text:"#065F46", dot:"#059669", btn:"#059669" },
  Mai:      { bg:"#FCE7F3", text:"#9D174D", dot:"#DB2777", btn:"#DB2777" },
};
const FALLBACK = { bg:"#F3F4F6", text:"#374151", dot:"#9CA3AF", btn:"#6B7280" };
const wc = w => WORKER_COLORS[w] || FALLBACK;

const TASKS = [
  { id:"t1",  name:"Queue Check – Outside Clusters",    category:"turboSMTP" },
  { id:"t2",  name:"Bounce Check – Outside Clusters",   category:"turboSMTP" },
  { id:"t3",  name:"Queue Check – Inside Clusters",     category:"turboSMTP" },
  { id:"t4",  name:"Bounce Check – Inside Clusters",    category:"turboSMTP" },
  { id:"t6",  name:"Queue Check",                       category:"EmailChef" },
  { id:"t7",  name:"Bounce Check",                      category:"EmailChef" },
  { id:"t11", name:"System Sorting & Cleaning",         category:"Infrastructure" },
  { id:"t12", name:"Assign Basic Accounts to Cluster",  category:"Infrastructure" },
];
const CATEGORIES = [...new Set(TASKS.map(t => t.category))];
const CAT_ICONS = { turboSMTP:"📬", EmailChef:"📧", Infrastructure:"🔧" };
const STATUS_OPTS = ["—","OK"];
const STATUS_STYLE = {
  "OK": { bg:"#DCFCE7", text:"#166534", border:"#BBF7D0" },
  "—":  { bg:"#F9FAFB", text:"#9CA3AF", border:"#E5E7EB" },
};
const IP_CHANGE_TYPES = ["— None —","Added IPs","Removed IPs","Isolated Client","Changed Snooze Time","Added New Response Error to Snoozing","Other"];
const UPDATE_TYPES = ["Update","Change","Experiment","Fix","Observation"];
const UPDATE_TYPE_META = {
  "Update":      { bg:"#DBEAFE", text:"#1E40AF", icon:"↻" },
  "Change":      { bg:"#EDE9FE", text:"#5B21B6", icon:"✎" },
  "Experiment":  { bg:"#FEF3C7", text:"#92400E", icon:"⚗" },
  "Fix":         { bg:"#DCFCE7", text:"#166534", icon:"✓" },
  "Observation": { bg:"#F1F5F9", text:"#475569", icon:"◎" },
};
const UPDATE_STATUS = ["Ongoing","Completed","Pending Results"];
const UPDATE_STATUS_META = {
  "Ongoing":         { bg:"#EFF6FF", text:"#1D4ED8", dot:"#3B82F6" },
  "Completed":       { bg:"#F0FDF4", text:"#15803D", dot:"#22C55E" },
  "Reverted":        { bg:"#FEF2F2", text:"#B91C1C", dot:"#EF4444" },
  "Pending Results": { bg:"#FFFBEB", text:"#B45309", dot:"#F59E0B" },
};
const MONTHLY_TASKS = [
  { id:"m1", name:"Tracking Links Management",      desc:"Review and update all tracking links across platforms. Check for broken or blacklisted domains." },
  { id:"m2", name:"Bounce & Defer Errors Updating", desc:"Update bounce and deferral error rules. Review new error codes and adjust suppression logic." },
  { id:"m3", name:"Deliverability Monthly Report",  desc:"Compile the full monthly deliverability report including queue stats, bounce rates, and cluster health." },
];
const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtFull  = d => { const dt=new Date(d+"T00:00:00"); return `${DAYS[dt.getDay()]}, ${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`; };
const fmtShort = d => { const dt=new Date(d+"T00:00:00"); return `${DAYS[dt.getDay()].slice(0,3)} ${dt.getDate()} ${MONTHS[dt.getMonth()].slice(0,3)}`; };
const fmtTime  = ts => new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const fmtDT    = ts => { const d=new Date(ts); return `${fmtShort(d.toISOString().split("T")[0])} · ${fmtTime(ts)}`; };
const genId    = () => Math.random().toString(36).slice(2)+Date.now().toString(36);
const getDatesInRange = (from,to) => { const dates=[]; const cur=new Date(from+"T00:00:00"); const end=new Date(to+"T00:00:00"); while(cur<=end){dates.push(cur.toISOString().split("T")[0]);cur.setDate(cur.getDate()+1);} return dates; };
const downloadCSV = (filename,rows) => { const escape=v=>`"${String(v??'').replace(/"/g,'""')}"`;const csv=rows.map(r=>r.map(escape).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=filename;a.click(); };
const blankForm = () => Object.fromEntries(TASKS.map(t=>[t.id,{status:"—",changes:"",notes:""}]));
const blankUpdate = () => ({type:"Update",worker:WORKERS[0],title:"",description:"",result:"",status:"Ongoing",ipChangeType:"— None —",ipOther:"",ipDetail:"",ipRange:"",ipReason:"",ipResult:"",extraIPs:[]});

const Avatar = ({name,size=32}) => { const c=wc(name); return <div style={{width:size,height:size,borderRadius:"50%",background:c.bg,color:c.text,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:500,flexShrink:0}}>{name?name[0]:"A"}</div>; };
const Pill = ({label,bg,text,style={}}) => <span style={{display:"inline-flex",alignItems:"center",fontSize:11,fontWeight:500,padding:"2px 8px",borderRadius:20,background:bg,color:text,...style}}>{label}</span>;
const Btn = ({onClick,children,variant="ghost",disabled,style={}}) => {
  const base={padding:"6px 14px",borderRadius:8,fontSize:13,fontWeight:500,cursor:disabled?"not-allowed":"pointer",border:"1px solid",transition:"opacity 0.15s",opacity:disabled?0.4:1,...style};
  const variants={ghost:{background:"transparent",borderColor:"#E5E7EB",color:"#374151"},primary:{background:"#1E293B",borderColor:"#1E293B",color:"#fff"},danger:{background:"#FEF2F2",borderColor:"#FCA5A5",color:"#B91C1C"}};
  return <button onClick={onClick} disabled={disabled} style={{...base,...variants[variant]}}>{children}</button>;
};
const Card = ({children,style={}}) => <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:"16px 20px",...style}}>{children}</div>;
const SectionHeader = ({cat}) => (
  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,marginTop:6}}>
    <span style={{fontSize:13,color:"#94A3B8"}}>{CAT_ICONS[cat]}</span>
    <span style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",color:"#94A3B8"}}>{cat}</span>
    <div style={{flex:1,height:1,background:"#F1F5F9"}}/>
  </div>
);

// ── LOGIN PAGE ──
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { setError("Please enter username and password."); return; }
    setLoading(true); setError("");
    const { data, error: err } = await supabase.from("users").select("*").eq("username", username.trim().toLowerCase()).eq("password", password.trim()).single();
    setLoading(false);
    if (err || !data) { setError("Incorrect username or password."); return; }
    onLogin(data);
  };

  const inputStyle = {padding:"10px 14px",borderRadius:10,border:"1px solid #E5E7EB",fontSize:14,width:"100%",boxSizing:"border-box",outline:"none",color:"#1E293B"};

  return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:380,padding:"0 16px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:32,marginBottom:8}}>📬</div>
          <div style={{fontSize:22,fontWeight:600,color:"#1E293B"}}>Deliverability Tracker</div>
          <div style={{fontSize:13,color:"#94A3B8",marginTop:4}}>Sign in to continue</div>
        </div>
        <Card style={{padding:"28px 28px"}}>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,color:"#94A3B8",fontWeight:500,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.05em"}}>Username</label>
            <input type="text" placeholder="Enter your username" value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={inputStyle}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,color:"#94A3B8",fontWeight:500,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.05em"}}>Password</label>
            <input type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={inputStyle}/>
          </div>
          {error && <div style={{fontSize:12,color:"#B91C1C",background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:8,padding:"8px 12px",marginBottom:16}}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{width:"100%",padding:"11px",borderRadius:10,background:"#1B3A6B",border:"none",color:"#fff",fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1}}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </Card>
      </div>
    </div>
  );
}

// ── ADMIN PANEL ──
function AdminPanel({ currentUser }) {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm]             = useState({ username:"", password:"", role:"worker", worker_name:"" });
  const [msg, setMsg]               = useState("");

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("users").select("*").order("created_at");
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const saveUser = async () => {
    if (!form.username.trim() || !form.password.trim()) { setMsg("Username and password are required."); return; }
    if (form.role === "worker" && !form.worker_name) { setMsg("Please select a worker name."); return; }
    const row = { username: form.username.trim().toLowerCase(), password: form.password.trim(), role: form.role, worker_name: form.role === "admin" ? null : form.worker_name };
    if (editingUser) {
      await supabase.from("users").update(row).eq("id", editingUser.id);
      setMsg("User updated successfully!");
    } else {
      await supabase.from("users").insert({ ...row, id: genId() });
      setMsg("User created successfully!");
    }
    setForm({ username:"", password:"", role:"worker", worker_name:"" });
    setShowForm(false); setEditingUser(null);
    loadUsers();
    setTimeout(() => setMsg(""), 3000);
  };

  const deleteUser = async (id) => {
    if (id === currentUser.id) { setMsg("You can't delete your own account!"); setTimeout(()=>setMsg(""),3000); return; }
    if (!window.confirm("Delete this user?")) return;
    await supabase.from("users").delete().eq("id", id);
    loadUsers();
  };

  const inputStyle = {padding:"7px 11px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,background:"#fff",color:"#1E293B",width:"100%",boxSizing:"border-box"};
  const labelStyle = {fontSize:11,color:"#94A3B8",fontWeight:500,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:"0.05em"};

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:16,fontWeight:500,color:"#1E293B"}}>User Management</div>
          <div style={{fontSize:12,color:"#94A3B8",marginTop:2}}>Create and manage worker and admin accounts</div>
        </div>
        <Btn variant="primary" onClick={()=>{ setShowForm(true); setEditingUser(null); setForm({username:"",password:"",role:"worker",worker_name:""}); }}>+ New user</Btn>
      </div>

      {msg && <div style={{fontSize:12,color:"#166534",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:8,padding:"8px 12px",marginBottom:12}}>{msg}</div>}

      {showForm && (
        <Card style={{marginBottom:16,border:"1.5px solid #E0E7FF"}}>
          <div style={{fontSize:14,fontWeight:500,color:"#1E293B",marginBottom:14}}>{editingUser?"Edit user":"New user"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:12}}>
            <div><label style={labelStyle}>Username</label><input type="text" placeholder="e.g. ahmed" value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} style={inputStyle}/></div>
            <div><label style={labelStyle}>Password</label><input type="text" placeholder="Set a password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} style={inputStyle}/></div>
            <div><label style={labelStyle}>Role</label>
              <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value,worker_name:""}))} style={inputStyle}>
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {form.role==="worker" && <div><label style={labelStyle}>Worker name</label>
              <select value={form.worker_name} onChange={e=>setForm(f=>({...f,worker_name:e.target.value}))} style={inputStyle}>
                <option value="">Select worker…</option>
                {WORKERS.map(w=><option key={w}>{w}</option>)}
              </select>
            </div>}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>{setShowForm(false);setEditingUser(null);}}>Cancel</Btn>
            <Btn variant="primary" onClick={saveUser}>{editingUser?"Save changes":"Create user"}</Btn>
          </div>
        </Card>
      )}

      {loading ? <div style={{textAlign:"center",padding:40,color:"#94A3B8"}}>Loading…</div> : (
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",fontSize:13,borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#F8FAFC"}}>
              {["Username","Role","Worker","Password","Actions"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontWeight:500,color:"#94A3B8",fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id} style={{borderTop:"1px solid #F8FAFC"}}>
                  <td style={{padding:"10px 16px",fontWeight:500,color:"#1E293B"}}>{u.username}</td>
                  <td style={{padding:"10px 16px"}}><Pill label={u.role} bg={u.role==="admin"?"#EDE9FE":"#DBEAFE"} text={u.role==="admin"?"#5B21B6":"#1D4ED8"}/></td>
                  <td style={{padding:"10px 16px",color:"#64748B"}}>{u.worker_name||"—"}</td>
                  <td style={{padding:"10px 16px",color:"#94A3B8",fontFamily:"monospace"}}>{u.password}</td>
                  <td style={{padding:"10px 16px"}}>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>{ setEditingUser(u); setForm({username:u.username,password:u.password,role:u.role,worker_name:u.worker_name||""}); setShowForm(true); }} style={{fontSize:11,padding:"3px 10px",borderRadius:20,border:"1px solid #E5E7EB",background:"transparent",color:"#475569",cursor:"pointer"}}>✎ Edit</button>
                      <button onClick={()=>deleteUser(u.id)} style={{fontSize:11,padding:"3px 10px",borderRadius:20,border:"1px solid #FCA5A5",background:"#FEF2F2",color:"#B91C1C",cursor:"pointer"}}>✕ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ── MAIN APP ──
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [entries, setEntries]         = useState([]);
  const [updates, setUpdates]         = useState([]);
  const [monthlyLogs, setMonthlyLogs] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState(0);
  const [form, setForm]               = useState(blankForm);
  const [savedIds, setSavedIds]       = useState({});
  const [expandedTask, setExpandedTask] = useState(null);
  const [logDate, setLogDate]         = useState(todayStr());
  const [logDateTo, setLogDateTo]     = useState(todayStr());
  const [logRangeMode, setLogRangeMode] = useState(false);
  const [logWorker, setLogWorker]     = useState("All");
  const [logPage, setLogPage]         = useState(0);
  const [expandedLogEntry, setExpandedLogEntry] = useState(null);
  const [rFrom, setRFrom]             = useState(todayStr());
  const [rTo, setRTo]                 = useState(todayStr());
  const [rWorker, setRWorker]         = useState("All");
  const [rPreset, setRPreset]         = useState("today");
  const [rView, setRView]             = useState("summary");
  const [updateForm, setUpdateForm]   = useState(blankUpdate());
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [filterUW, setFilterUW]       = useState("All");
  const [filterUT, setFilterUT]       = useState("All");
  const [filterUS, setFilterUS]       = useState("All");
  const [filterUIP, setFilterUIP]     = useState("All");
  const [filterUClusterText, setFilterUClusterText] = useState("");
  const [filterUFrom, setFilterUFrom] = useState("");
  const [filterUTo, setFilterUTo]     = useState("");
  const [filterUPreset, setFilterUPreset] = useState("all");
  const [expandedUpdate, setExpandedUpdate] = useState(null);
  const [editingUpdate, setEditingUpdate]   = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const [replyWorkers, setReplyWorkers] = useState({});
  const [monthlyOpen, setMonthlyOpen] = useState({});
  const [monthlyFields, setMonthlyFields] = useState({});

  const isAdmin = currentUser?.role === "admin";
  const activeWorker = currentUser?.worker_name || null;
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Track online presence
  useEffect(() => {
    if (!currentUser || !activeWorker) return;
    const markOnline = async () => {
      await supabase.from("online_users").upsert({ worker_name: activeWorker, last_seen: new Date().toISOString() });
    };
    const fetchOnline = async () => {
      const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString(); // 2 min window
      const { data } = await supabase.from("online_users").select("*").gte("last_seen", cutoff);
      if (data) setOnlineUsers(data.map(r => r.worker_name));
    };
    markOnline();
    fetchOnline();
    const interval = setInterval(() => { markOnline(); fetchOnline(); }, 30000);
    const handleUnload = async () => {
      await supabase.from("online_users").delete().eq("worker_name", activeWorker);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => { clearInterval(interval); window.removeEventListener("beforeunload", handleUnload); };
  }, [currentUser, activeWorker]);

  const TABS = [
    { icon:"▦", label:"Task Board" },
    { icon:"⚗", label:"Cluster Updates" },
    { icon:"◷", label:"Past Logs" },
    { icon:"↗", label:"Reports" },
    { icon:"📅", label:"Monthly Tasks" },
    { icon:"🔍", label:"IP Finder" },
    { icon:"🎯", label:"Demo" },
    ...(isAdmin ? [{ icon:"👤", label:"Users" }] : []),
  ];

  useEffect(() => { if (currentUser) { loadAll(); setForm(blankForm()); setSavedIds({}); } }, [currentUser]);
  useEffect(() => { setLogPage(0); }, [logDate, logDateTo, logRangeMode, logWorker]);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: e }, { data: u }, { data: m }] = await Promise.all([
      supabase.from("entries").select("*").order("ts", { ascending: true }),
      supabase.from("updates").select("*").order("ts", { ascending: true }),
      supabase.from("monthly_logs").select("*"),
    ]);
    if (e) setEntries(e.map(r => ({ id:r.id, date:r.date, worker:r.worker, taskId:r.task_id, status:r.status, changes:r.changes||"", notes:r.notes||"", ts:r.ts })));
    if (u) setUpdates(u.map(r => ({ id:r.id, type:r.type, worker:r.worker, title:r.title, description:r.description||"", result:r.result||"", status:r.status, ipChangeType:r.ip_change_type||"— None —", ipOther:r.ip_other||"", ipDetail:r.ip_detail||"", ipRange:r.ip_range||"", ipReason:r.ip_reason||"", ipResult:r.ip_result||"", extraIPs:r.extra_ips||[], replies:r.replies||[], ts:r.ts, editedTs:r.edited_ts||null })));
    if (m) setMonthlyLogs(m);
    setLoading(false);
  };

  const todayEntries = entries.filter(e => e.date === todayStr());
  const latestToday = {};
  todayEntries.forEach(e => { latestToday[`${e.worker}|${e.taskId}`] = e; });

  const logFrom = logDate, logTo = logRangeMode ? logDateTo : logDate;

  const canEdit = (entryWorker) => isAdmin || entryWorker === activeWorker;

  const saveEntry = async taskId => {
    const f = form[taskId];
    const row = { id:genId(), date:todayStr(), worker:activeWorker, task_id:taskId, status:f.status, changes:f.changes, notes:f.notes, ts:new Date().toISOString() };
    await supabase.from("entries").insert(row);
    setSavedIds(s => ({ ...s, [taskId]: true }));
    loadAll();
  };
  const updateField = (taskId, field, val) => { setForm(f => ({ ...f, [taskId]: { ...f[taskId], [field]: val } })); setSavedIds(s => ({ ...s, [taskId]: false })); };

  const submitUpdate = async () => {
    if (!updateForm.title.trim()) return;
    if (editingUpdate) {
      await supabase.from("updates").update({ type:updateForm.type, worker:updateForm.worker, title:updateForm.title, description:updateForm.description, result:updateForm.result, status:updateForm.status, ip_change_type:updateForm.ipChangeType, ip_other:updateForm.ipOther, ip_detail:updateForm.ipDetail, ip_range:updateForm.ipRange, ip_reason:updateForm.ipReason, ip_result:updateForm.ipResult, extra_ips:updateForm.extraIPs, edited_ts:new Date().toISOString() }).eq("id", editingUpdate);
      setEditingUpdate(null);
    } else {
      const worker = isAdmin ? updateForm.worker : activeWorker;
      const row = { id:genId(), type:updateForm.type, worker, title:updateForm.title, description:updateForm.description, result:updateForm.result, status:updateForm.status, ip_change_type:updateForm.ipChangeType, ip_other:updateForm.ipOther, ip_detail:updateForm.ipDetail, ip_range:updateForm.ipRange, ip_reason:updateForm.ipReason, ip_result:updateForm.ipResult, extra_ips:updateForm.extraIPs, replies:[], ts:new Date().toISOString() };
      await supabase.from("updates").insert(row);
    }
    setUpdateForm(blankUpdate()); setShowUpdateForm(false); loadAll();
  };

  const addReply = async (uid, text, worker) => {
    if (!text.trim()) return;
    const u = updates.find(x => x.id === uid);
    const replyWorker = isAdmin ? worker : activeWorker;
    const newReplies = [...(u.replies || []), { id:genId(), worker:replyWorker, text, ts:new Date().toISOString() }];
    await supabase.from("updates").update({ replies: newReplies }).eq("id", uid);
    loadAll();
  };

  const changeUpdateStatus = async (uid, s) => {
    await supabase.from("updates").update({ status: s }).eq("id", uid);
    loadAll();
  };

  const saveMonthlyEntry = async (taskId, worker, fields) => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const existing = monthlyLogs.find(r => r.month === month && r.task_id === taskId && r.worker === worker);
    const row = { month, task_id:taskId, worker, status:fields.status, notes:fields.notes, ts:new Date().toISOString() };
    if (existing) { await supabase.from("monthly_logs").update(row).eq("id", existing.id); }
    else { await supabase.from("monthly_logs").insert({ ...row, id:genId() }); }
    loadAll();
  };

  const [ipSearch, setIpSearch] = useState("");
  const [ipResults, setIpResults] = useState(null);
  const [ipSearched, setIpSearched] = useState("");
  const [browseSearch, setBrowseSearch] = useState("");
  const [ipTab, setIpTab] = useState("search");

  const CLUSTERS = [
    { id:2,   name:"Test",                                    notes:"Test cluster.", ranges:[] },
    { id:3,   name:"Dedalus and Mediatech",                   notes:"Used for accounts antonio.fania@dedalus.eu and automail@mediatec.it to solve rate limit problems.", ranges:["185.228.36.6-15"] },
    { id:5,   name:"Legacy Cluster — Stop Using",             notes:"Used for Non-EU who purchased Smart Routing. No new accounts added. Will be deleted soon.", ranges:[] },
    { id:11,  name:"bbturbosmtp@pp-media.ch",                 notes:"1 Extra IP.", ranges:[] },
    { id:15,  name:"Non-EU Basic — Spam Report / Listing History", notes:"Account IP: 199.187.175.35-254 / Cluster IP: 199.187.175.160-180 / Extendable to: 199.187.175.35-254", ranges:["199.187.175.35-254","199.187.175.160-180"] },
    { id:17,  name:"EU PRO — Spam Report / Listing History",  notes:"Account IP: 5.83.159.1-254, 185.228.36.158-229 / Cluster IP: 185.228.36.92-156 / Extendable to: 185.228.36.215-239, 89.144.43.1-254", ranges:["5.83.159.1-254","185.228.36.158-229","185.228.36.92-156","185.228.36.215-239","89.144.43.1-254"] },
    { id:21,  name:"Extremely High Complaint Rate",           notes:"Account IP: 199.187.172.33-69, 199.187.172.86-254 / Cluster IP: same ranges", ranges:["199.187.172.33-69","199.187.172.86-254"] },
    { id:25,  name:"EU Basic Paid — Good Old",                notes:"Account IP: 185.228.36.17-22, 185.228.36.25-35 / Cluster IP: same / Extendable to: 185.228.36.36-69", ranges:["185.228.36.17-22","185.228.36.25-35","185.228.36.36-69"] },
    { id:27,  name:"Non-EU Good Old",                         notes:"Account IP: 199.187.174.1-40 / Cluster IP: 199.187.174.1-40", ranges:["199.187.174.1-40"] },
    { id:31,  name:"Non-EU Bad Old",                          notes:"Account IP: 199.187.174.41-127 / Cluster IP: 199.187.174.41-127", ranges:["199.187.174.41-127"] },
    { id:33,  name:"Extra IP — tataaia.smtp@gc-solutions.net",notes:"Dedicated extra IP.", ranges:[] },
    { id:35,  name:"Extra IP — info@artspr.gr",               notes:"Dedicated extra IP.", ranges:[] },
    { id:43,  name:"T-online.de EU",                          notes:"Account IP: 185.228.36.0/22 / 89.144.43.0/24 / 5.83.159.0/24", ranges:["185.228.36.0/22","89.144.43.0/24","5.83.159.0/24"] },
    { id:45,  name:"T-online.de 175 Range",                   notes:"Account IP: 199.187.175.0/24", ranges:["199.187.175.0/24"] },
    { id:47,  name:"T-online.de Non-EU",                      notes:"Account IP: 199.187.172.0/24 / 199.187.173.0/24 / 199.187.174.0/24 / 199.244.72.0/24", ranges:["199.187.172.0/24","199.187.173.0/24","199.187.174.0/24","199.244.72.0/24"] },
    { id:49,  name:"mkokash",                                 notes:"—", ranges:[] },
    { id:51,  name:"Extra IP — info@bytesystem.it",           notes:"Extra IP.", ranges:[] },
    { id:55,  name:"Extra IP — info@southwestfloridacopier.com", notes:"Extra IP.", ranges:[] },
    { id:59,  name:"domenico.osto@regione.veneto.it",         notes:"2 dedicated IPs.", ranges:[] },
    { id:74,  name:"EU Paid Bad Old",                         notes:"Account IP: 185.228.36.71-82 / Cluster IP: 185.228.36.71-99", ranges:["185.228.36.71-82","185.228.36.71-99"] },
    { id:76,  name:"saad test",                               notes:"Test.", ranges:[] },
    { id:78,  name:"jon@system-uk.com",                       notes:"1 Extra IP.", ranges:[] },
    { id:88,  name:"Non-EU PRO",                              notes:"Account IP: 199.244.75.1-254 / Cluster IP: 199.244.73.30-254 / Extendable to: 199.187.174.128-245", ranges:["199.244.75.1-254","199.244.73.30-254","199.187.174.128-245"] },
    { id:100, name:"Extra IP — h.haile@seocomplete.de",       notes:"Extra IP.", ranges:[] },
    { id:102, name:"Extra IP — info@veriseo.de",              notes:"Extra IP.", ranges:[] },
    { id:110, name:"Smart Routing V2.0 — Active",             notes:"Active smart routing pool.", ranges:[] },
    { id:112, name:"Smart Routing V2.0 — Inactive",           notes:"Inactive smart routing pool.", ranges:[] },
    { id:114, name:"Non-EU New and Free Accounts",            notes:"Account IP: 199.187.173.1-59 / Cluster IP: 199.187.173.1-59", ranges:["199.187.173.1-59"] },
    { id:116, name:"Non-EU PRO with History",                 notes:"Account IP: 199.244.74.1-254 / Cluster IP: 199.244.72.10-254", ranges:["199.244.74.1-254","199.244.72.10-254"] },
    { id:118, name:"EU PRO Accounts",                         notes:"Account IP: 185.228.38.1-254, 185.228.39.101-254 / Cluster IP: 185.228.37.91-254", ranges:["185.228.38.1-254","185.228.39.101-254","185.228.37.91-254"] },
    { id:120, name:"Justin Movemedia",                        notes:"Dedicated Smart Routing Pool — 10 IPs.", ranges:[] },
    { id:126, name:"TJ Marsé",                                notes:"15 dedicated IPs.", ranges:[] },
    { id:128, name:"EU Servesiclienti and Firma5",            notes:"—", ranges:[] },
    { id:132, name:"EU Abusers",                              notes:"Account IP: 185.228.36.215-230 / Cluster IP: 185.228.36.215-230", ranges:["185.228.36.215-230"] },
    { id:134, name:"New and Free EU",                         notes:"Account IP: 185.228.36.240-254 / Cluster IP: 185.228.36.240-254", ranges:["185.228.36.240-254"] },
    { id:136, name:"Dedicated IP — info@mesajio.com",         notes:"Dedicated IP cluster.", ranges:[] },
    { id:142, name:"Extra IP — smithhs831@gmail.com",         notes:"Extra IP.", ranges:[] },
  ];

  const ipToNum = ip => ip.split(".").reduce((acc,oct)=>(acc<<8)+parseInt(oct),0)>>>0;
  const parseIPRange = range => {
    range=range.trim();
    if(range.includes("/")){const[base,bits]=range.split("/");const mask=~((1<<(32-parseInt(bits)))-1)>>>0;const start=(ipToNum(base)&mask)>>>0;const end=(start|~mask)>>>0;return{start,end};}
    else if(range.includes("-")){const parts=range.split("-");const lastOctetEnd=parseInt(parts[1]);if(isNaN(lastOctetEnd))return null;const baseOctets=parts[0].split(".");const startNum=ipToNum(parts[0]);const endIP=[...baseOctets.slice(0,3),lastOctetEnd].join(".");return{start:startNum,end:ipToNum(endIP)};}
    return null;
  };
  const ipInRange=(ip,range)=>{try{const parsed=parseIPRange(range);if(!parsed)return false;const ipNum=ipToNum(ip);return ipNum>=parsed.start&&ipNum<=parsed.end;}catch{return false;}};
  const findClusters=ip=>{const results=[];for(const cluster of CLUSTERS){for(const range of cluster.ranges){if(ipInRange(ip,range)){results.push({cluster,matchedRange:range});break;}}}return results;};
  const isValidIP=ip=>{const parts=ip.split(".");if(parts.length!==4)return false;return parts.every(p=>!isNaN(p)&&parseInt(p)>=0&&parseInt(p)<=255);};
  const handleIPSearch=()=>{const ip=ipSearch.trim();setIpSearched(ip);setIpResults(isValidIP(ip)?findClusters(ip):[]);};
  const filteredClusters=CLUSTERS.filter(c=>!browseSearch||c.id.toString().includes(browseSearch)||c.name.toLowerCase().includes(browseSearch.toLowerCase())||c.notes.toLowerCase().includes(browseSearch.toLowerCase())||c.ranges.some(r=>r.includes(browseSearch)));
  const generateDemoData = async () => {
    const chg=["Rotated IPs","Cleared queue","Updated DNS","Restarted service","None"], nts=["All good","Monitoring","Escalated","Auto-resolved",""];
    const rows=[];
    for(let d=13;d>=0;d--){
      const date=new Date(); date.setDate(date.getDate()-d); const ds=date.toISOString().split("T")[0];
      WORKERS.forEach(worker=>{[...TASKS].sort(()=>Math.random()-.5).slice(0,6+Math.floor(Math.random()*3)).forEach(task=>{
        const ts=new Date(date); ts.setHours(8+Math.floor(Math.random()*9),Math.floor(Math.random()*60),0,0);
        rows.push({id:"DEMO_"+genId(),date:ds,worker,task_id:task.id,status:"OK",changes:chg[Math.floor(Math.random()*chg.length)],notes:nts[Math.floor(Math.random()*nts.length)],ts:ts.toISOString()});
      });});
    }
    await supabase.from("entries").insert(rows); loadAll();
  };

  const generateDemoUpdates = async () => {
    const samples=[
      {type:"Experiment",worker:"Federico",title:"Testing IP warm-up on Cluster 4",description:"Started a gradual warm-up plan on Cluster 4 increasing daily send volume by 10% each day.",result:"After 5 days, bounce rate dropped from 6.2% to 3.8%.",status:"Ongoing",ip_change_type:"Added IPs",ip_detail:"Cluster 4",ip_range:"185.228.38.1-20",ip_reason:"Warm-up plan",ip_result:"Bounce improving",extra_ips:[],replies:[]},
      {type:"Change",worker:"Ahmed",title:"Switched tracking domain for EmailChef",description:"Replaced old tracking domain with a clean domain.",result:"No blacklist issues after 3 days.",status:"Completed",ip_change_type:"— None —",ip_detail:"",ip_range:"",ip_reason:"",ip_result:"",extra_ips:[],replies:[]},
      {type:"Fix",worker:"Mai",title:"Resolved queue buildup on Outside Cluster 2",description:"Cluster 2 had stuck queue due to misconfigured retry interval.",result:"Queue cleared within 20 minutes.",status:"Completed",ip_change_type:"Removed IPs",ip_detail:"Cluster 2",ip_range:"185.228.36.70-75",ip_reason:"Stuck queue",ip_result:"Queue cleared",extra_ips:[],replies:[]},
      {type:"Observation",worker:"Khaled",title:"Spike in MS 550 5.7.1 errors Monday mornings",description:"Microsoft bounce errors spike every Monday 08:00–10:00 UTC.",result:"Still investigating.",status:"Ongoing",ip_change_type:"Changed Snooze Time",ip_detail:"Cluster 21",ip_range:"199.187.172.33-69",ip_reason:"High MS complaint rate",ip_result:"Snooze extended to 6h",extra_ips:[],replies:[]},
    ];
    const now=Date.now();
    const rows=samples.map((s,i)=>({...s,id:"DEMO_"+genId(),ts:new Date(now-(samples.length-i)*14*60*60*1000).toISOString()}));
    await supabase.from("updates").insert(rows); loadAll();
  };

  const generateDemoMonthly = async () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const statuses = ["Done","In Progress","Pending","Done"];
    const notes = ["Completed and verified","Currently working on it","","All links updated"];
    const rows=[];
    MONTHLY_TASKS.forEach((task,ti)=>{
      WORKERS.forEach((worker,wi)=>{
        const existing = monthlyLogs.find(r=>r.month===month&&r.task_id===task.id&&r.worker===worker);
        if(!existing){ rows.push({id:"DEMO_"+genId(),month,task_id:task.id,worker,status:statuses[(ti+wi)%statuses.length],notes:notes[(ti+wi)%notes.length],ts:new Date().toISOString()}); }
      });
    });
    if(rows.length) await supabase.from("monthly_logs").insert(rows); loadAll();
  };

  const clearDemoData = async () => {
    if(!window.confirm("Remove all demo data?")) return;
    await Promise.all([
      supabase.from("entries").delete().like("id","DEMO_%"),
      supabase.from("updates").delete().like("id","DEMO_%"),
      supabase.from("monthly_logs").delete().like("id","DEMO_%"),
    ]);
    loadAll();
  };

  const applyUPreset = preset => {
    const now=new Date(); const fmt=d=>d.toISOString().split("T")[0]; setFilterUPreset(preset);
    if(preset==="all"){setFilterUFrom("");setFilterUTo("");}
    if(preset==="today"){setFilterUFrom(fmt(now));setFilterUTo(fmt(now));}
    if(preset==="week"){const d=new Date(now);d.setDate(d.getDate()-6);setFilterUFrom(fmt(d));setFilterUTo(fmt(now));}
    if(preset==="month"){const d=new Date(now);d.setDate(1);setFilterUFrom(fmt(d));setFilterUTo(fmt(now));}
    if(preset==="last30"){const d=new Date(now);d.setDate(d.getDate()-29);setFilterUFrom(fmt(d));setFilterUTo(fmt(now));}
  };
  const applyRPreset = useCallback(preset => {
    const now=new Date(); const fmt=d=>d.toISOString().split("T")[0]; setRPreset(preset);
    if(preset==="today"){setRFrom(fmt(now));setRTo(fmt(now));}
    if(preset==="yesterday"){const d=new Date(now);d.setDate(d.getDate()-1);setRFrom(fmt(d));setRTo(fmt(d));}
    if(preset==="week"){const d=new Date(now);d.setDate(d.getDate()-6);setRFrom(fmt(d));setRTo(fmt(now));}
    if(preset==="month"){const d=new Date(now);d.setDate(1);setRFrom(fmt(d));setRTo(fmt(now));}
    if(preset==="last30"){const d=new Date(now);d.setDate(d.getDate()-29);setRFrom(fmt(d));setRTo(fmt(now));}
  },[]);

  const filteredUpdates = [...updates].filter(u => {
    const dateOk=(!filterUFrom&&!filterUTo)||(u.ts.slice(0,10)>=filterUFrom&&u.ts.slice(0,10)<=filterUTo);
    const clusterSearch=filterUClusterText.trim().toLowerCase();
    const clusterOk=!clusterSearch||(u.ipDetail&&u.ipDetail.toLowerCase().includes(clusterSearch));
    return dateOk&&clusterOk&&(filterUW==="All"||u.worker===filterUW)&&(filterUT==="All"||u.type===filterUT)&&(filterUS==="All"||u.status===filterUS)&&(filterUIP==="All"||u.ipChangeType===filterUIP);
  }).reverse();

  const logFilteredEntries = entries.filter(e=>e.date>=logFrom&&e.date<=logTo&&(logWorker==="All"||e.worker===logWorker));
  const logDays = getDatesInRange(logFrom,logTo).filter(d=>logFilteredEntries.some(e=>e.date===d)).reverse();
  const currentPageDay = logRangeMode?(logDays[logPage]||null):(logFilteredEntries.length>0?logDate:null);
  const currentDayEntries = currentPageDay?(logRangeMode?logFilteredEntries.filter(e=>e.date===currentPageDay):logFilteredEntries):[];

  const inputStyle = {padding:"7px 11px",borderRadius:8,border:"1px solid #E5E7EB",fontSize:13,background:"#fff",color:"#1E293B",width:"100%",boxSizing:"border-box"};
  const selectStyle = {...inputStyle};
  const labelStyle = {fontSize:11,color:"#94A3B8",fontWeight:500,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:"0.05em"};

  if (!currentUser) return <LoginPage onLogin={setCurrentUser}/>;

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:32,marginBottom:12}}>📬</div><div style={{fontSize:14,color:"#64748B"}}>Loading…</div></div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",fontFamily:"system-ui,sans-serif"}}>
      {/* Header */}
      <div style={{background:"#1B3A6B",padding:"0 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,paddingTop:16,paddingBottom:16}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18,fontWeight:500,color:"#F1F5F9"}}>Deliverability Tracker</span>
              <span style={{fontSize:11,background:"#16305A",color:"#93C5FD",padding:"2px 8px",borderRadius:20,fontWeight:500}}>Team</span>
            </div>
            <div style={{fontSize:12,color:"#93B4D8",marginTop:2,fontWeight:500}}>{fmtFull(todayStr())}</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {WORKERS.map(w=>{ const c=wc(w); const done=new Set(todayEntries.filter(e=>e.worker===w).map(e=>e.taskId)).size; const pct=Math.round((done/TASKS.length)*100); const isLoggedIn=w===activeWorker&&!isAdmin; const isOnline=onlineUsers.includes(w);
              return <div key={w} style={{display:"flex",alignItems:"center",gap:8,background:"#243F72",border:`1px solid ${isLoggedIn?"#60A5FA":"#2E5096"}`,borderRadius:10,padding:"6px 12px",position:"relative"}}>
                <div style={{position:"relative"}}>
                  <Avatar name={w} size={26}/>
                  {isOnline&&<span style={{position:"absolute",top:-3,right:-3,width:9,height:9,borderRadius:"50%",background:"#22C55E",border:"2px solid #1B3A6B"}}/>}
                </div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{fontSize:12,fontWeight:500,color:"#F1F5F9"}}>{w}</div>
                    {isLoggedIn&&<span style={{fontSize:9,background:"#22C55E",color:"#fff",padding:"1px 5px",borderRadius:20,fontWeight:600}}>YOU</span>}
                    {isOnline&&!isLoggedIn&&<span style={{fontSize:9,background:"#22C55E",color:"#fff",padding:"1px 5px",borderRadius:20,fontWeight:600}}>ON</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:48,height:3,borderRadius:2,background:"#334155"}}>
                      <div style={{width:`${pct}%`,height:3,borderRadius:2,background:c.dot,transition:"width 0.3s"}}/>
                    </div>
                    <span style={{fontSize:10,color:"#64748B"}}>{done}/{TASKS.length}</span>
                  </div>
                </div>
              </div>;
            })}
            <div style={{display:"flex",gap:6,alignItems:"center",background:"#243F72",border:"1px solid #2E5096",borderRadius:10,padding:"6px 12px"}}>
              <Avatar name={isAdmin?"Ad":activeWorker} size={26}/>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:"#F1F5F9"}}>{isAdmin?"Admin":activeWorker}</div>
                <div style={{fontSize:10,color:"#93C5FD"}}>{isAdmin?"Full access":"Worker"}</div>
              </div>
            </div>
            <button onClick={loadAll} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #2E5096",background:"#243F72",color:"#93C5FD",fontSize:12,cursor:"pointer",fontWeight:500}}>↻ Refresh</button>

            <button onClick={()=>setCurrentUser(null)} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #2E5096",background:"#243F72",color:"#F87171",fontSize:12,cursor:"pointer",fontWeight:500}}>⎋ Logout</button>
          </div>
        </div>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:2,flexWrap:"wrap"}}>
          {TABS.map((t,i)=><button key={i} onClick={()=>setTab(i)} style={{padding:"10px 20px",fontSize:14,fontWeight:500,color:tab===i?"#fff":"#93B4D8",background:tab===i?"rgba(255,255,255,0.12)":"transparent",border:"none",borderBottom:tab===i?"3px solid #60A5FA":"3px solid transparent",borderRadius:"6px 6px 0 0",cursor:"pointer",display:"flex",alignItems:"center",gap:7,transition:"all 0.15s"}}>
            <span style={{fontSize:15}}>{t.icon}</span>{t.label}
          </button>)}
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px"}}>

        {/* TASK BOARD */}
        {tab===0 && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px 6px 8px",borderRadius:20,border:`1.5px solid ${wc(activeWorker||"").dot||"#6366F1"}`,background:wc(activeWorker||"").bg||"#EEF2FF"}}>
                <Avatar name={isAdmin?"A":activeWorker} size={22}/>
                <span style={{fontSize:13,fontWeight:600,color:wc(activeWorker||"").text||"#4F46E5"}}>{isAdmin?"Admin (viewing)":activeWorker}</span>
              </div>
              <button onClick={()=>{ const rows=[["Date","Worker","Task","Category","Status","Changes","Notes","Time"],...todayEntries.map(e=>{const t=TASKS.find(x=>x.id===e.taskId);return[e.date,e.worker,t?.name,t?.category,e.status,e.changes,e.notes,fmtTime(e.ts)];})]; downloadCSV(`task-board-${todayStr()}.csv`,rows); }} style={{marginLeft:"auto",padding:"6px 12px",borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",color:"#6B7280",fontSize:12,cursor:"pointer",fontWeight:500}}>↓ Export</button>
            </div>
            {CATEGORIES.map(cat=>(
              <div key={cat} style={{marginBottom:24}}>
                <SectionHeader cat={cat}/>
                {TASKS.filter(t=>t.category===cat).map(task=>{
                  const isExp=expandedTask===task.id;
                  const myEntry=latestToday[`${activeWorker}|${task.id}`];
                  const isSaved=savedIds[task.id];
                  return (
                    <Card key={task.id} style={{marginBottom:8,border:isSaved?"1.5px solid #86EFAC":"1px solid #E5E7EB",padding:0,overflow:"hidden"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",flexWrap:"wrap"}}>
                        <div style={{flex:1,minWidth:140}}><div style={{fontSize:13,fontWeight:500,color:"#1E293B"}}>{task.name}</div></div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                          {WORKERS.map(w=>{ const e=latestToday[`${w}|${task.id}`]; const c=wc(w); const sm=STATUS_STYLE[e?.status||"—"];
                            return <div key={w} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:20,background:sm.bg,border:`1px solid ${sm.border}`,fontSize:11,fontWeight:500,color:sm.text}}>
                              <span style={{width:6,height:6,borderRadius:"50%",background:c.dot,flexShrink:0}}/>{w}: {e?e.status:"—"}
                            </div>;
                          })}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          {isSaved&&<span style={{fontSize:11,color:"#16A34A",fontWeight:500}}>✓ saved</span>}
                          {!isAdmin && <button onClick={()=>setExpandedTask(isExp?null:task.id)} style={{padding:"5px 12px",borderRadius:8,border:"1px solid #E5E7EB",background:"#F8FAFC",color:"#475569",fontSize:12,cursor:"pointer",fontWeight:500}}>{isExp?"▲ Close":"▼ Log"}</button>}
                          {isAdmin && <button onClick={()=>setExpandedTask(isExp?null:task.id)} style={{padding:"5px 12px",borderRadius:8,border:"1px solid #E5E7EB",background:"#F8FAFC",color:"#475569",fontSize:12,cursor:"pointer",fontWeight:500}}>{isExp?"▲ Close":"▼ View"}</button>}
                        </div>
                      </div>
                      {isExp && (
                        <div style={{borderTop:"1px solid #F1F5F9"}}>
                          {WORKERS.map(w=>{ const e=latestToday[`${w}|${task.id}`]; const c=wc(w); const isMe=w===activeWorker&&!isAdmin;
                            return (
                              <div key={w} style={{padding:"10px 16px",borderBottom:"1px solid #F8FAFC",background:isMe?c.bg+"33":"#FAFAFA",display:"flex",alignItems:"flex-start",gap:10}}>
                                <Avatar name={w} size={28}/>
                                <div style={{flex:1}}>
                                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                                    <span style={{fontSize:12,fontWeight:500,color:c.text}}>{w}{isMe&&" (you)"}</span>
                                    {e?<><Pill label={e.status} bg={STATUS_STYLE[e.status].bg} text={STATUS_STYLE[e.status].text}/><span style={{fontSize:11,color:"#94A3B8",marginLeft:"auto"}}>{fmtTime(e.ts)}</span></>:<span style={{fontSize:11,color:"#CBD5E1",fontStyle:"italic"}}>not logged yet</span>}
                                  </div>
                                  {e?.changes&&<div style={{fontSize:12,color:"#475569"}}><b>Changes:</b> {e.changes}</div>}
                                  {e?.notes&&<div style={{fontSize:12,color:"#64748B"}}><b>Notes:</b> {e.notes}</div>}
                                  {isMe && (
                                    <div style={{marginTop:10}}>
                                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
                                        <div><label style={labelStyle}>Status</label>
                                          <select value={form[task.id].status} onChange={e=>updateField(task.id,"status",e.target.value)} style={{...selectStyle,background:STATUS_STYLE[form[task.id].status].bg,color:STATUS_STYLE[form[task.id].status].text,fontWeight:500}}>
                                            {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
                                          </select>
                                        </div>
                                        <div><label style={labelStyle}>Changes</label><input type="text" placeholder="e.g. Rotated IPs" value={form[task.id].changes} onChange={e=>updateField(task.id,"changes",e.target.value)} style={inputStyle}/></div>
                                        <div><label style={labelStyle}>Notes</label><input type="text" placeholder="Any remarks…" value={form[task.id].notes} onChange={e=>updateField(task.id,"notes",e.target.value)} style={inputStyle}/></div>
                                      </div>
                                      <div style={{marginTop:10,display:"flex",justifyContent:"flex-end"}}>
                                        <button onClick={()=>saveEntry(task.id)} style={{padding:"7px 18px",borderRadius:8,background:c.btn,border:"none",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>Save Entry</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* CLUSTER UPDATES */}
        {tab===1 && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:16,fontWeight:500,color:"#1E293B"}}>Cluster Updates</div>
                <div style={{fontSize:12,color:"#94A3B8",marginTop:2}}>Share experiments, changes and observations with the team</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>{ setShowUpdateForm(true); setEditingUpdate(null); setUpdateForm(blankUpdate()); }} variant="primary">+ New post</Btn>
                <Btn onClick={()=>{ const rows=[["Date","Worker","Type","Status","Title","Description","Result","IP Change","Cluster","IP Range"],...filteredUpdates.map(u=>[u.ts.slice(0,10),u.worker,u.type,u.status,u.title,u.description,u.result,u.ipChangeType,u.ipDetail,u.ipRange])]; downloadCSV(`cluster-updates-${todayStr()}.csv`,rows); }}>↓ Export</Btn>
              </div>
            </div>
            {showUpdateForm && (
              <Card style={{marginBottom:16,border:"1.5px solid #E0E7FF"}}>
                <div style={{fontSize:14,fontWeight:500,color:"#1E293B",marginBottom:14}}>{editingUpdate?"Edit post":"New post"}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:12}}>
                  {isAdmin&&<div><label style={labelStyle}>Posted by</label><select value={updateForm.worker} onChange={e=>setUpdateForm(f=>({...f,worker:e.target.value}))} style={selectStyle}>{WORKERS.map(w=><option key={w}>{w}</option>)}</select></div>}
                  <div><label style={labelStyle}>Type</label><select value={updateForm.type} onChange={e=>setUpdateForm(f=>({...f,type:e.target.value}))} style={selectStyle}>{UPDATE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div><label style={labelStyle}>Status</label><select value={updateForm.status} onChange={e=>setUpdateForm(f=>({...f,status:e.target.value}))} style={selectStyle}>{UPDATE_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
                </div>
                <div style={{marginBottom:10}}><label style={labelStyle}>Title *</label><input type="text" placeholder="Brief title…" value={updateForm.title} onChange={e=>setUpdateForm(f=>({...f,title:e.target.value}))} style={inputStyle}/></div>
                <div style={{marginBottom:10}}><label style={labelStyle}>Description</label><textarea rows={3} value={updateForm.description} onChange={e=>setUpdateForm(f=>({...f,description:e.target.value}))} style={{...inputStyle,resize:"vertical"}}/></div>
                <div style={{marginBottom:12}}><label style={labelStyle}>Result / outcome</label><textarea rows={2} value={updateForm.result} onChange={e=>setUpdateForm(f=>({...f,result:e.target.value}))} style={{...inputStyle,resize:"vertical"}}/></div>
                <div style={{background:"#F8FAFC",border:"1px solid #E5E7EB",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:500,color:"#475569",marginBottom:10}}>IP cluster details</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:10}}>
                    <div><label style={labelStyle}>Change type</label><select value={updateForm.ipChangeType} onChange={e=>setUpdateForm(f=>({...f,ipChangeType:e.target.value}))} style={selectStyle}>{IP_CHANGE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                    <div><label style={labelStyle}>Cluster ID</label><input type="text" placeholder="e.g. Cluster 3" value={updateForm.ipDetail} onChange={e=>setUpdateForm(f=>({...f,ipDetail:e.target.value}))} style={inputStyle}/></div>
                    <div><label style={labelStyle}>IP range</label><input type="text" value={updateForm.ipRange} onChange={e=>setUpdateForm(f=>({...f,ipRange:e.target.value}))} style={{...inputStyle,fontFamily:"monospace"}}/></div>
                    <div><label style={labelStyle}>Reason</label><input type="text" value={updateForm.ipReason} onChange={e=>setUpdateForm(f=>({...f,ipReason:e.target.value}))} style={inputStyle}/></div>
                    <div><label style={labelStyle}>Result of change</label><input type="text" value={updateForm.ipResult} onChange={e=>setUpdateForm(f=>({...f,ipResult:e.target.value}))} style={inputStyle}/></div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <Btn onClick={()=>{setShowUpdateForm(false);setEditingUpdate(null);}}>Cancel</Btn>
                  <Btn onClick={submitUpdate} variant="primary" disabled={!updateForm.title.trim()}>{editingUpdate?"Save changes":"Post"}</Btn>
                </div>
              </Card>
            )}
            <Card style={{marginBottom:16,padding:"12px 16px"}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
                <select value={filterUW} onChange={e=>setFilterUW(e.target.value)} style={{...selectStyle,width:"auto",padding:"5px 10px"}}><option value="All">All workers</option>{WORKERS.map(w=><option key={w}>{w}</option>)}</select>
                <select value={filterUT} onChange={e=>setFilterUT(e.target.value)} style={{...selectStyle,width:"auto",padding:"5px 10px"}}><option value="All">All types</option>{UPDATE_TYPES.map(t=><option key={t}>{t}</option>)}</select>
                <select value={filterUS} onChange={e=>setFilterUS(e.target.value)} style={{...selectStyle,width:"auto",padding:"5px 10px"}}><option value="All">All statuses</option>{UPDATE_STATUS.map(s=><option key={s}>{s}</option>)}</select>
                <input type="text" placeholder="Search cluster…" value={filterUClusterText} onChange={e=>setFilterUClusterText(e.target.value)} style={{...inputStyle,width:130,padding:"5px 10px"}}/>
                <span style={{marginLeft:"auto",fontSize:12,color:"#94A3B8"}}>{filteredUpdates.length} posts</span>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[["all","All time"],["today","Today"],["week","7 days"],["month","This month"],["last30","30 days"],["custom","Custom"]].map(([k,l])=>(
                  <button key={k} onClick={()=>applyUPreset(k)} style={{padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:500,cursor:"pointer",border:`1px solid ${filterUPreset===k?"#6366F1":"#E5E7EB"}`,background:filterUPreset===k?"#6366F1":"transparent",color:filterUPreset===k?"#fff":"#64748B"}}>{l}</button>
                ))}
                {filterUPreset==="custom"&&<><input type="date" value={filterUFrom} onChange={e=>{setFilterUFrom(e.target.value);setFilterUPreset("custom");}} style={{...inputStyle,width:"auto",padding:"4px 8px"}}/><span style={{color:"#CBD5E1"}}>→</span><input type="date" value={filterUTo} onChange={e=>{setFilterUTo(e.target.value);setFilterUPreset("custom");}} style={{...inputStyle,width:"auto",padding:"4px 8px"}}/></>}
              </div>
            </Card>
            {filteredUpdates.length===0&&<div style={{textAlign:"center",padding:"64px 0",color:"#CBD5E1"}}><div style={{fontSize:32,marginBottom:8}}>⚗</div><div style={{fontSize:14}}>No posts yet</div></div>}
            {filteredUpdates.map(u=>{ const c=wc(u.worker); const tm=UPDATE_TYPE_META[u.type]; const sm=UPDATE_STATUS_META[u.status]||UPDATE_STATUS_META["Ongoing"]; const isExpU=expandedUpdate===u.id; const canEditUpdate=isAdmin||u.worker===activeWorker; return (
              <Card key={u.id} style={{marginBottom:10,padding:0,overflow:"hidden"}}>
                <div style={{padding:"14px 18px"}}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <Avatar name={u.worker} size={36}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
                        <span style={{fontSize:13,fontWeight:500,color:c.text}}>{u.worker}</span>
                        <Pill label={`${tm.icon} ${u.type}`} bg={tm.bg} text={tm.text}/>
                        <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,padding:"2px 8px",borderRadius:20,background:sm.bg,color:sm.text}}>
                          <span style={{width:6,height:6,borderRadius:"50%",background:sm.dot}}/>{u.status}
                        </span>
                        {u.editedTs&&<span style={{fontSize:10,color:"#CBD5E1"}}>edited</span>}
                        <span style={{fontSize:11,color:"#94A3B8",marginLeft:"auto"}}>{fmtDT(u.ts)}</span>
                      </div>
                      <div style={{fontSize:14,fontWeight:500,color:"#1E293B",marginBottom:4}}>{u.title}</div>
                      {u.description&&<div style={{fontSize:13,color:"#475569",lineHeight:1.6,marginBottom:6}}>{u.description}</div>}
                      {u.result&&<div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#92400E"}}><b>Result:</b> {u.result}</div>}
                      {u.ipChangeType&&u.ipChangeType!=="— None —"&&(
                        <div style={{background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,padding:"10px 12px",marginTop:8}}>
                          <div style={{fontSize:11,fontWeight:500,color:"#64748B",marginBottom:6}}>IP cluster change</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                            <Pill label={`⚙ ${u.ipChangeType}`} bg="#F1F5F9" text="#475569"/>
                            {u.ipDetail&&<Pill label={`⊙ ${u.ipDetail}`} bg="#EFF6FF" text="#1D4ED8"/>}
                            {u.ipRange&&<span style={{fontSize:11,fontFamily:"monospace",padding:"2px 8px",borderRadius:20,background:"#F0FDF4",color:"#15803D",border:"1px solid #BBF7D0"}}>{u.ipRange}</span>}
                          </div>
                          {u.ipReason&&<div style={{fontSize:12,color:"#64748B",marginTop:4}}><b>Reason:</b> {u.ipReason}</div>}
                          {u.ipResult&&<div style={{fontSize:12,color:"#64748B"}}><b>Result:</b> {u.ipResult}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12,paddingTop:10,borderTop:"1px solid #F8FAFC",flexWrap:"wrap"}}>
                    <button onClick={()=>setExpandedUpdate(isExpU?null:u.id)} style={{fontSize:12,color:"#64748B",background:"transparent",border:"1px solid #E5E7EB",borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>
                      ◎ {u.replies?.length||0} {(u.replies?.length||0)===1?"reply":"replies"}
                    </button>
                    {canEditUpdate&&<div style={{marginLeft:"auto",display:"flex",gap:6,flexWrap:"wrap"}}>
                      {UPDATE_STATUS.map(s=>{ const active=u.status===s; const m=UPDATE_STATUS_META[s]; return <button key={s} onClick={()=>changeUpdateStatus(u.id,s)} style={{fontSize:11,padding:"3px 8px",borderRadius:20,border:`1px solid ${active?m.dot:"#E5E7EB"}`,background:active?m.bg:"transparent",color:active?m.text:"#94A3B8",cursor:"pointer",fontWeight:active?500:400}}>{s}</button>;})}
                      <button onClick={()=>{setEditingUpdate(u.id);setUpdateForm({type:u.type,worker:u.worker,title:u.title,description:u.description,result:u.result,status:u.status,ipChangeType:u.ipChangeType||"— None —",ipOther:u.ipOther||"",ipDetail:u.ipDetail||"",ipRange:u.ipRange||"",ipReason:u.ipReason||"",ipResult:u.ipResult||"",extraIPs:u.extraIPs||[]});setShowUpdateForm(true);window.scrollTo({top:0,behavior:"smooth"});}} style={{fontSize:11,padding:"3px 10px",borderRadius:20,border:"1px solid #E5E7EB",background:"transparent",color:"#94A3B8",cursor:"pointer"}}>✎ Edit</button>
                    </div>}
                  </div>
                </div>
                {isExpU&&(
                  <div style={{borderTop:"1px solid #F1F5F9",background:"#FAFAFA"}}>
                    {(u.replies||[]).map(r=>{ const rc=wc(r.worker); return <div key={r.id} style={{padding:"10px 18px",borderBottom:"1px solid #F1F5F9",display:"flex",gap:10}}>
                      <Avatar name={r.worker} size={28}/>
                      <div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}><span style={{fontSize:12,fontWeight:500,color:rc.text}}>{r.worker}</span><span style={{fontSize:11,color:"#CBD5E1"}}>{fmtDT(r.ts)}</span></div><div style={{fontSize:13,color:"#374151"}}>{r.text}</div></div>
                    </div>;})}
                    <div style={{padding:"10px 18px",display:"flex",gap:8,alignItems:"center"}}>
                      <input type="text" placeholder="Write a reply…" value={replyInputs[u.id]||""} onChange={e=>setReplyInputs(p=>({...p,[u.id]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"){addReply(u.id,replyInputs[u.id]||"",activeWorker);setReplyInputs(p=>({...p,[u.id]:""}));}}} style={{...inputStyle,flex:1}}/>
                      <button onClick={()=>{addReply(u.id,replyInputs[u.id]||"",activeWorker);setReplyInputs(p=>({...p,[u.id]:""}));}} style={{padding:"6px 14px",borderRadius:8,background:"#1E293B",color:"#fff",border:"none",fontSize:13,cursor:"pointer",fontWeight:500}}>Reply</button>
                    </div>
                  </div>
                )}
              </Card>
            );})}
          </div>
        )}

        {/* PAST LOGS */}
        {tab===2 && (
          <div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <button onClick={()=>{ const filtered=entries.filter(e=>e.date>=logFrom&&e.date<=logTo&&(logWorker==="All"||e.worker===logWorker)); const rows=[["Date","Worker","Task","Category","Status","Changes","Notes","Time"],...filtered.map(e=>{const t=TASKS.find(x=>x.id===e.taskId);return[e.date,e.worker,t?.name,t?.category,e.status,e.changes,e.notes,fmtTime(e.ts)];})]; downloadCSV(`past-logs-${logFrom}.csv`,rows); }} style={{marginLeft:"auto",padding:"7px 12px",borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",color:"#64748B",fontSize:12,cursor:"pointer",fontWeight:500}}>↓ Export</button>
            </div>
            <Card style={{marginBottom:16,padding:"14px 18px"}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"flex-end"}}>
                <div style={{display:"flex",gap:4}}>
                  {[["Single day",false],["Date range",true]].map(([l,v])=><button key={l} onClick={()=>setLogRangeMode(v)} style={{padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:500,cursor:"pointer",border:"1px solid",borderColor:logRangeMode===v?"#6366F1":"#E5E7EB",background:logRangeMode===v?"#EEF2FF":"transparent",color:logRangeMode===v?"#4F46E5":"#64748B"}}>{l}</button>)}
                </div>
                <div><label style={labelStyle}>{logRangeMode?"From":"Date"}</label><input type="date" value={logDate} onChange={e=>setLogDate(e.target.value)} style={{...inputStyle,width:"auto"}}/></div>
                {logRangeMode&&<><span style={{color:"#CBD5E1",alignSelf:"flex-end",paddingBottom:8}}>→</span><div><label style={labelStyle}>To</label><input type="date" value={logDateTo} onChange={e=>setLogDateTo(e.target.value)} style={{...inputStyle,width:"auto"}}/></div></>}
                <div><label style={labelStyle}>Worker</label><select value={logWorker} onChange={e=>setLogWorker(e.target.value)} style={{...selectStyle,width:"auto"}}><option>All</option>{WORKERS.map(w=><option key={w}>{w}</option>)}</select></div>
              </div>
            </Card>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:16}}>
              {WORKERS.map(w=>{ const c=wc(w); const we=logFilteredEntries.filter(e=>e.worker===w); const tasks=new Set(we.map(e=>e.taskId)).size; return (
                <Card key={w} style={{padding:"12px 14px",opacity:logWorker!=="All"&&w!==logWorker?0.3:1,borderLeft:`3px solid ${c.dot}`,borderRadius:"8px 12px 12px 8px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><Avatar name={w} size={22}/><span style={{fontSize:12,fontWeight:500,color:c.text}}>{w}</span></div>
                  <div style={{fontSize:13,fontWeight:500,color:"#1E293B"}}>{tasks}</div>
                  <div style={{fontSize:11,color:"#94A3B8"}}>tasks · {we.length} entries</div>
                </Card>
              );})}
            </div>
            {logFilteredEntries.length===0&&<div style={{textAlign:"center",padding:"48px 0",color:"#CBD5E1"}}><div style={{fontSize:28,marginBottom:8}}>📂</div><div>No entries for this period</div></div>}
            {logRangeMode&&logDays.length>1&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:"10px 14px",flexWrap:"wrap",gap:8}}>
                <Btn onClick={()=>setLogPage(p=>Math.max(0,p-1))} disabled={logPage===0}>← Newer</Btn>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
                  {logDays.map((d,i)=><button key={d} onClick={()=>setLogPage(i)} style={{padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:logPage===i?500:400,cursor:"pointer",border:`1px solid ${logPage===i?"#6366F1":"#E5E7EB"}`,background:logPage===i?"#6366F1":"transparent",color:logPage===i?"#fff":"#64748B"}}>{fmtShort(d)}</button>)}
                </div>
                <Btn onClick={()=>setLogPage(p=>Math.min(logDays.length-1,p+1))} disabled={logPage===logDays.length-1}>Older →</Btn>
              </div>
            )}
            {currentPageDay&&(
              <div>
                {CATEGORIES.map(cat=>{
                  const catTasks=TASKS.filter(t=>t.category===cat);
                  const hasAny=catTasks.some(t=>currentDayEntries.some(e=>e.taskId===t.id));
                  if(!hasAny) return null;
                  return <div key={cat} style={{marginBottom:20}}>
                    <SectionHeader cat={cat}/>
                    {catTasks.map(task=>{
                      const taskEntries=currentDayEntries.filter(e=>e.taskId===task.id&&(logWorker==="All"||e.worker===logWorker));
                      if(!taskEntries.length) return null;
                      const isExpL=expandedLogEntry===`${currentPageDay}-${task.id}`;
                      const latestPW={};
                      taskEntries.forEach(e=>{if(!latestPW[e.worker]||e.ts>latestPW[e.worker].ts) latestPW[e.worker]=e;});
                      return (
                        <Card key={task.id} style={{marginBottom:8,padding:0,overflow:"hidden"}}>
                          <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",flexWrap:"wrap"}}>
                            <span style={{flex:1,fontSize:13,fontWeight:500,color:"#1E293B",minWidth:140}}>{task.name}</span>
                            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                              {WORKERS.map(w=>{ const e=latestPW[w]; const c=wc(w); const sm=STATUS_STYLE[e?.status||"—"]; if(logWorker!=="All"&&w!==logWorker) return null;
                                return <div key={w} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:20,background:sm.bg,border:`1px solid ${sm.border}`,fontSize:11,fontWeight:500,color:sm.text}}>
                                  <span style={{width:6,height:6,borderRadius:"50%",background:c.dot}}/>{w}: {e?e.status:"—"}
                                </div>;
                              })}
                            </div>
                            <button onClick={()=>setExpandedLogEntry(isExpL?null:`${currentPageDay}-${task.id}`)} style={{padding:"5px 12px",borderRadius:8,border:"1px solid #E5E7EB",background:"#F8FAFC",color:"#475569",fontSize:12,cursor:"pointer",fontWeight:500}}>{isExpL?"▲ Hide":"▼ Details"}</button>
                          </div>
                          {isExpL&&<div style={{borderTop:"1px solid #F8FAFC"}}>
                            {taskEntries.sort((a,b)=>a.ts.localeCompare(b.ts)).map(e=>{ const c=wc(e.worker); const sm=STATUS_STYLE[e.status]; return (
                              <div key={e.id} style={{padding:"10px 16px",borderBottom:"1px solid #F8FAFC",background:"#FAFAFA",display:"flex",gap:10,alignItems:"flex-start"}}>
                                <Avatar name={e.worker} size={28}/>
                                <div style={{flex:1}}>
                                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                                    <span style={{fontSize:12,fontWeight:500,color:c.text}}>{e.worker}</span>
                                    <Pill label={e.status} bg={sm.bg} text={sm.text}/>
                                    <span style={{fontSize:11,color:"#CBD5E1",marginLeft:"auto"}}>{fmtDT(e.ts)}</span>
                                  </div>
                                  {e.changes&&<div style={{fontSize:12,color:"#475569"}}><b>Changes:</b> {e.changes}</div>}
                                  {e.notes&&<div style={{fontSize:12,color:"#64748B"}}><b>Notes:</b> {e.notes}</div>}
                                </div>
                              </div>
                            );})}
                          </div>}
                        </Card>
                      );
                    })}
                  </div>;
                })}
              </div>
            )}
          </div>
        )}

        {/* REPORTS */}
        {tab===3 && (()=>{
          const rangeEntries=entries.filter(e=>e.date>=rFrom&&e.date<=rTo&&(rWorker==="All"||e.worker===rWorker));
          const uniqueDays=new Set(rangeEntries.map(e=>e.date)).size;
          const workerStats=WORKERS.map(w=>{ const we=rangeEntries.filter(e=>e.worker===w); return {w,total:we.length,ok:we.filter(e=>e.status==="OK").length,days:new Set(we.map(e=>e.date)).size}; });
          const taskStats=TASKS.map(t=>{ const te=rangeEntries.filter(e=>e.taskId===t.id); return {...t,total:te.length,ok:te.filter(e=>e.status==="OK").length}; });
          const VIEWS=[["summary","Summary"],["log","Full log"]];
          const PRESETS=[["today","Today"],["yesterday","Yesterday"],["week","7 days"],["month","This month"],["last30","30 days"]];
          return (
            <div>
              <Card style={{marginBottom:16,padding:"16px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:14}}>
                  <div><div style={{fontSize:16,fontWeight:500,color:"#1E293B"}}>Reports & trends</div></div>
                  <div style={{display:"flex",gap:8}}>
                    <select value={rWorker} onChange={e=>setRWorker(e.target.value)} style={{...selectStyle,width:"auto"}}><option>All</option>{WORKERS.map(w=><option key={w}>{w}</option>)}</select>
                    <button onClick={()=>{ const rows=[["Date","Worker","Task","Category","Status","Changes","Notes","Time"],...rangeEntries.map(e=>{const t=TASKS.find(x=>x.id===e.taskId);return[e.date,e.worker,t?.name,t?.category,e.status,e.changes,e.notes,fmtTime(e.ts)];})]; downloadCSV(`report-${rFrom}_to_${rTo}.csv`,rows); }} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",color:"#64748B",fontSize:12,cursor:"pointer",fontWeight:500}}>↓ Export</button>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                  {PRESETS.map(([k,l])=><button key={k} onClick={()=>applyRPreset(k)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:500,cursor:"pointer",border:`1px solid ${rPreset===k?"#6366F1":"#E5E7EB"}`,background:rPreset===k?"#6366F1":"transparent",color:rPreset===k?"#fff":"#64748B"}}>{l}</button>)}
                </div>
                <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
                  <div><label style={labelStyle}>From</label><input type="date" value={rFrom} onChange={e=>{setRFrom(e.target.value);setRPreset("custom");}} style={{...inputStyle,width:"auto"}}/></div>
                  <span style={{color:"#CBD5E1",paddingBottom:8}}>→</span>
                  <div><label style={labelStyle}>To</label><input type="date" value={rTo} onChange={e=>{setRTo(e.target.value);setRPreset("custom");}} style={{...inputStyle,width:"auto"}}/></div>
                  <div style={{marginLeft:"auto",textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:500,color:"#1E293B"}}>{rFrom===rTo?fmtFull(rFrom):`${fmtShort(rFrom)} → ${fmtShort(rTo)}`}</div>
                    <div style={{fontSize:11,color:"#94A3B8"}}>{uniqueDays} day{uniqueDays!==1?"s":""} · {rangeEntries.length} entries</div>
                  </div>
                </div>
              </Card>
              <div style={{display:"flex",gap:6,marginBottom:20}}>
                {VIEWS.map(([k,l])=><button key={k} onClick={()=>setRView(k)} style={{padding:"7px 16px",borderRadius:8,fontSize:13,fontWeight:rView===k?500:400,cursor:"pointer",border:`1px solid ${rView===k?"#1E293B":"#E5E7EB"}`,background:rView===k?"#1E293B":"transparent",color:rView===k?"#fff":"#64748B"}}>{l}</button>)}
              </div>
              {rView==="summary"&&(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:16}}>
                    {[{label:"Total entries",val:rangeEntries.length,color:"#1E293B"},{label:"OK",val:rangeEntries.filter(e=>e.status==="OK").length,color:"#16A34A"},{label:"Days with data",val:uniqueDays,color:"#6366F1"},{label:"Workers active",val:WORKERS.filter(w=>rangeEntries.some(e=>e.worker===w)).length,color:"#0891B2"}].map(k=>(
                      <Card key={k.label} style={{padding:"14px 16px",background:"#F8FAFC",border:"none"}}>
                        <div style={{fontSize:26,fontWeight:500,color:k.color}}>{k.val}</div>
                        <div style={{fontSize:12,color:"#94A3B8",marginTop:2}}>{k.label}</div>
                      </Card>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10,marginBottom:16}}>
                    {workerStats.map(({w,total,ok,days})=>{ const c=wc(w); const pct=total>0?Math.round((ok/total)*100):0; return (
                      <Card key={w} style={{padding:"14px 16px",borderLeft:`3px solid ${c.dot}`,borderRadius:"8px 12px 12px 8px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><Avatar name={w} size={30}/><span style={{fontSize:13,fontWeight:500,color:c.text}}>{w}</span></div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10,textAlign:"center"}}>
                          {[["Entries",total],["Days",days],["OK",ok]].map(([l,v])=><div key={l}><div style={{fontSize:16,fontWeight:500,color:"#1E293B"}}>{v}</div><div style={{fontSize:10,color:"#94A3B8"}}>{l}</div></div>)}
                        </div>
                        <div style={{height:4,borderRadius:4,background:"#F1F5F9",overflow:"hidden"}}><div style={{width:`${pct}%`,height:4,background:c.dot,borderRadius:4}}/></div>
                        <div style={{fontSize:11,color:"#94A3B8",marginTop:4}}>{pct}% OK rate</div>
                      </Card>
                    );})}
                  </div>
                  <Card style={{padding:0,overflow:"hidden"}}>
                    <div style={{padding:"12px 16px",borderBottom:"1px solid #F1F5F9",fontSize:13,fontWeight:500,color:"#1E293B"}}>Task health</div>
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
                        <thead><tr style={{background:"#F8FAFC"}}>{["Task","Category","Total","OK","OK rate","Health"].map(h=><th key={h} style={{padding:"8px 14px",textAlign:"left",fontWeight:500,color:"#94A3B8",fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                        <tbody>{taskStats.map(t=>{ const pct=t.total>0?Math.round((t.ok/t.total)*100):0; const health=t.total===0?"—":t.ok===t.total?"●":"◑"; const hcolor=t.total===0?"#CBD5E1":t.ok===t.total?"#16A34A":"#D97706"; return (
                          <tr key={t.id} style={{borderTop:"1px solid #F8FAFC"}}>
                            <td style={{padding:"9px 14px",color:"#374151",fontWeight:500}}>{t.name}</td>
                            <td style={{padding:"9px 14px",color:"#94A3B8"}}>{t.category}</td>
                            <td style={{padding:"9px 14px",color:"#6366F1",fontWeight:500}}>{t.total}</td>
                            <td style={{padding:"9px 14px",color:"#16A34A",fontWeight:500}}>{t.ok}</td>
                            <td style={{padding:"9px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:60,height:3,borderRadius:3,background:"#F1F5F9",overflow:"hidden"}}><div style={{width:`${pct}%`,height:3,background:"#22C55E",borderRadius:3}}/></div><span style={{fontSize:11,color:"#64748B"}}>{pct}%</span></div></td>
                            <td style={{padding:"9px 14px",color:hcolor,fontSize:14}}>{health}</td>
                          </tr>
                        );})}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
              {rView==="log"&&(
                <Card style={{padding:0,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid #F1F5F9",fontSize:13,fontWeight:500,color:"#1E293B",display:"flex",justifyContent:"space-between"}}>
                    <span>Full log</span><span style={{fontSize:12,color:"#94A3B8",fontWeight:400}}>{rangeEntries.length} entries</span>
                  </div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
                      <thead><tr style={{background:"#F8FAFC"}}>{["Date & time","Worker","Task","Status","Changes","Notes"].map(h=><th key={h} style={{padding:"8px 14px",textAlign:"left",fontWeight:500,color:"#94A3B8",fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                      <tbody>
                        {rangeEntries.length===0&&<tr><td colSpan={6} style={{padding:"40px",textAlign:"center",color:"#CBD5E1"}}>No entries for this period</td></tr>}
                        {[...rangeEntries].reverse().map(e=>{ const task=TASKS.find(t=>t.id===e.taskId); const c=wc(e.worker); const sm=STATUS_STYLE[e.status]; return (
                          <tr key={e.id} style={{borderTop:"1px solid #F8FAFC"}}>
                            <td style={{padding:"8px 14px",color:"#94A3B8",whiteSpace:"nowrap"}}>{fmtDT(e.ts)}</td>
                            <td style={{padding:"8px 14px"}}><span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:c.bg,color:c.text,fontWeight:500}}>{e.worker}</span></td>
                            <td style={{padding:"8px 14px",color:"#374151"}}>{task?.name}</td>
                            <td style={{padding:"8px 14px"}}><Pill label={e.status} bg={sm.bg} text={sm.text}/></td>
                            <td style={{padding:"8px 14px",color:"#64748B"}}>{e.changes||"—"}</td>
                            <td style={{padding:"8px 14px",color:"#64748B"}}>{e.notes||"—"}</td>
                          </tr>
                        );})}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          );
        })()}

        {/* MONTHLY TASKS */}
        {tab===4 && (()=>{
          const now = new Date();
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
          const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
          const getLog = (taskId, worker) => monthlyLogs.find(r => r.month===currentMonth && r.task_id===taskId && r.worker===worker) || null;
          return (
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontSize:16,fontWeight:500,color:"#1E293B"}}>Monthly Tasks</div>
                  <div style={{fontSize:12,color:"#94A3B8",marginTop:2}}>Recurring tasks · <span style={{fontWeight:500,color:"#6366F1"}}>{monthLabel}</span></div>
                </div>
              </div>
              {MONTHLY_TASKS.map(task=>{
                const workerLogs = WORKERS.map(w=>({ w, log: getLog(task.id, w) }));
                const doneCount = workerLogs.filter(x=>x.log?.status==="Done").length;
                const pct = Math.round((doneCount/WORKERS.length)*100);
                return (
                  <Card key={task.id} style={{marginBottom:16,padding:0,overflow:"hidden"}}>
                    <div style={{padding:"16px 20px",borderBottom:"1px solid #F1F5F9"}}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:500,color:"#1E293B",marginBottom:3}}>{task.name}</div>
                          <div style={{fontSize:12,color:"#94A3B8",lineHeight:1.5}}>{task.desc}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:13,fontWeight:500,color:"#6366F1"}}>{doneCount}/{WORKERS.length} done</div>
                          <div style={{width:80,height:4,borderRadius:4,background:"#EEF2FF",overflow:"hidden",marginTop:6,marginLeft:"auto"}}>
                            <div style={{width:`${pct}%`,height:4,background:pct===100?"#22C55E":"#6366F1",borderRadius:4}}/>
                          </div>
                        </div>
                      </div>
                    </div>
                    {WORKERS.map(w=>{
                      const c = wc(w);
                      const log = getLog(task.id, w);
                      const key = `${task.id}|${w}`;
                      const open = !!monthlyOpen[key];
                      const fields = monthlyFields[key] || { status: log?.status||"Pending", notes: log?.notes||"" };
                      const isMe = w === activeWorker;
                      const canEditThis = isAdmin || isMe;
                      const setOpen = val => setMonthlyOpen(p=>({...p,[key]:val}));
                      const setFields = fn => setMonthlyFields(p=>({...p,[key]:fn(p[key]||fields)}));
                      return (
                        <div key={w} style={{borderBottom:"1px solid #F8FAFC"}}>
                          <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 20px",flexWrap:"wrap"}}>
                            <Avatar name={w} size={28}/>
                            <span style={{fontSize:13,fontWeight:500,color:c.text,width:70}}>{w}{isMe&&!isAdmin&&" ✎"}</span>
                            <Pill label={log?.status||"Pending"} bg={log?.status==="Done"?"#DCFCE7":log?.status==="In Progress"?"#EFF6FF":"#F9FAFB"} text={log?.status==="Done"?"#166534":log?.status==="In Progress"?"#1D4ED8":"#94A3B8"}/>
                            {log?.notes&&<span style={{fontSize:12,color:"#64748B",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{log.notes}</span>}
                            {log?.ts&&<span style={{fontSize:11,color:"#CBD5E1",marginLeft:"auto",flexShrink:0}}>{fmtDT(log.ts)}</span>}
                            {canEditThis&&<button onClick={()=>setOpen(!open)} style={{padding:"4px 12px",borderRadius:8,border:"1px solid #E5E7EB",background:"#F8FAFC",color:"#475569",fontSize:12,cursor:"pointer",fontWeight:500,flexShrink:0}}>{open?"▲ Close":"✎ Log"}</button>}
                          </div>
                          {open&&canEditThis&&(
                            <div style={{padding:"12px 20px 16px",background:c.bg+"22",borderTop:"1px solid #F1F5F9"}}>
                              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10,marginBottom:12}}>
                                <div><label style={labelStyle}>Status</label>
                                  <select value={fields.status} onChange={e=>setFields(f=>({...f,status:e.target.value}))} style={{...selectStyle,background:fields.status==="Done"?"#DCFCE7":fields.status==="In Progress"?"#EFF6FF":"#F9FAFB",color:fields.status==="Done"?"#166534":fields.status==="In Progress"?"#1D4ED8":"#94A3B8",fontWeight:500}}>
                                    {["Pending","In Progress","Done"].map(s=><option key={s}>{s}</option>)}
                                  </select>
                                </div>
                                <div style={{gridColumn:"span 2"}}><label style={labelStyle}>Notes</label><input type="text" placeholder="Any remarks or details…" value={fields.notes} onChange={e=>setFields(f=>({...f,notes:e.target.value}))} style={inputStyle}/></div>
                              </div>
                              <div style={{display:"flex",justifyContent:"flex-end"}}>
                                <button onClick={()=>{saveMonthlyEntry(task.id,w,fields);setOpen(false);}} style={{padding:"7px 18px",borderRadius:8,background:c.btn,border:"none",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>Save</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </Card>
                );
              })}
            </div>
          );
        })()}

        {/* IP FINDER */}
        {tab===5 && (
          <div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:16,fontWeight:500,color:"#1E293B",marginBottom:2}}>🔍 IP Cluster Finder</div>
              <div style={{fontSize:12,color:"#94A3B8"}}>Enter an account IP to find its assigned cluster</div>
            </div>
            <div style={{display:"flex",gap:4,marginBottom:20,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:4}}>
              {[["search","🔍 IP Lookup"],["browse","📋 Browse All"]].map(([k,l])=>(
                <button key={k} onClick={()=>setIpTab(k)} style={{flex:1,padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",border:"none",background:ipTab===k?"#1B3A6B":"transparent",color:ipTab===k?"#fff":"#64748B",transition:"all 0.15s"}}>{l}</button>
              ))}
            </div>
            {ipTab==="search"&&(
              <div>
                <Card style={{marginBottom:20}}>
                  <label style={labelStyle}>Account IP Address</label>
                  <div style={{display:"flex",gap:10,marginTop:4}}>
                    <input type="text" placeholder="e.g. 185.228.36.10" value={ipSearch} onChange={e=>setIpSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleIPSearch()} style={{...inputStyle,flex:1}}/>
                    <button onClick={handleIPSearch} style={{padding:"7px 20px",borderRadius:8,background:"#1B3A6B",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",flexShrink:0}}>Find</button>
                  </div>
                  {ipSearched&&!isValidIP(ipSearched)&&<div style={{marginTop:8,fontSize:12,color:"#B91C1C"}}>⚠ Please enter a valid IP address (e.g. 185.228.36.10)</div>}
                </Card>
                {ipResults!==null&&(
                  <div>
                    {ipResults.length===0&&isValidIP(ipSearched)&&(
                      <Card style={{textAlign:"center",padding:"40px"}}>
                        <div style={{fontSize:28,marginBottom:8}}>🔎</div>
                        <div style={{fontSize:14,fontWeight:500,color:"#1E293B",marginBottom:4}}>No cluster found for {ipSearched}</div>
                        <div style={{fontSize:12,color:"#94A3B8"}}>This IP is not assigned to any known cluster range</div>
                      </Card>
                    )}
                    {ipResults.map(({cluster,matchedRange})=>(
                      <Card key={cluster.id} style={{marginBottom:12,border:"2px solid #6366F1",padding:"18px 20px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,flexWrap:"wrap"}}>
                          <div style={{background:"#EEF2FF",color:"#4F46E5",fontWeight:700,fontSize:16,borderRadius:10,padding:"6px 14px",flexShrink:0}}>#{cluster.id}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:14,fontWeight:600,color:"#1E293B"}}>{cluster.name}</div>
                            <div style={{fontSize:11,color:"#6366F1",marginTop:2}}>Matched: <span style={{fontFamily:"monospace",fontWeight:500}}>{matchedRange}</span></div>
                          </div>
                          <div style={{background:"#DCFCE7",color:"#166534",fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:20}}>✓ Match</div>
                        </div>
                        <div style={{background:"#F8FAFC",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#475569",lineHeight:1.6,marginBottom:10}}>{cluster.notes}</div>
                        {cluster.ranges.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                          {cluster.ranges.map((r,i)=><span key={i} style={{fontFamily:"monospace",fontSize:11,padding:"2px 8px",borderRadius:20,background:r===matchedRange?"#EEF2FF":"#F1F5F9",color:r===matchedRange?"#4F46E5":"#475569",border:`1px solid ${r===matchedRange?"#A5B4FC":"#E5E7EB"}`,fontWeight:r===matchedRange?600:400}}>{r}</span>)}
                        </div>}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
            {ipTab==="browse"&&(
              <div>
                <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{color:"#94A3B8"}}>🔍</span>
                  <input type="text" placeholder="Search by ID, name, notes or IP range…" value={browseSearch} onChange={e=>setBrowseSearch(e.target.value)} style={{flex:1,border:"none",outline:"none",fontSize:13,color:"#1E293B"}}/>
                  {browseSearch&&<button onClick={()=>setBrowseSearch("")} style={{border:"none",background:"none",color:"#94A3B8",cursor:"pointer",fontSize:16}}>×</button>}
                </div>
                <div style={{fontSize:11,color:"#94A3B8",marginBottom:12}}>{filteredClusters.length} clusters</div>
                {filteredClusters.map(cluster=>(
                  <Card key={cluster.id} style={{marginBottom:8,padding:"12px 16px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                      <div style={{background:"#F1F5F9",color:"#475569",fontWeight:700,fontSize:12,borderRadius:8,padding:"4px 10px",flexShrink:0,minWidth:36,textAlign:"center"}}>#{cluster.id}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500,color:"#1E293B",marginBottom:4}}>{cluster.name}</div>
                        <div style={{fontSize:12,color:"#64748B",lineHeight:1.5,marginBottom:cluster.ranges.length?8:0}}>{cluster.notes}</div>
                        {cluster.ranges.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                          {cluster.ranges.map((r,i)=><span key={i} style={{fontFamily:"monospace",fontSize:11,padding:"2px 8px",borderRadius:20,background:"#EFF6FF",color:"#1D4ED8",border:"1px solid #BFDBFE"}}>{r}</span>)}
                        </div>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DEMO */}
        {tab===6 && (
              <div style={{fontSize:13,color:"#64748B",marginBottom:20,lineHeight:1.6}}>Generate realistic sample data to show your team how the tracker looks when fully in use. All demo records can be removed in one click.</div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{background:"#F8FAFC",border:"1px solid #E5E7EB",borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div><div style={{fontSize:13,fontWeight:500,color:"#1E293B",marginBottom:2}}>📋 Task Board entries</div><div style={{fontSize:12,color:"#94A3B8"}}>2 weeks of daily task logs for all 4 workers</div></div>
                  <button onClick={generateDemoData} style={{padding:"8px 18px",borderRadius:8,background:"#6366F1",border:"none",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",flexShrink:0}}>Generate</button>
                </div>
                <div style={{background:"#F8FAFC",border:"1px solid #E5E7EB",borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div><div style={{fontSize:13,fontWeight:500,color:"#1E293B",marginBottom:2}}>⚗ Cluster Updates</div><div style={{fontSize:12,color:"#94A3B8"}}>4 sample posts — experiments, fixes, observations</div></div>
                  <button onClick={generateDemoUpdates} style={{padding:"8px 18px",borderRadius:8,background:"#F59E0B",border:"none",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",flexShrink:0}}>Generate</button>
                </div>
                <div style={{background:"#F8FAFC",border:"1px solid #E5E7EB",borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div><div style={{fontSize:13,fontWeight:500,color:"#1E293B",marginBottom:2}}>📅 Monthly Tasks</div><div style={{fontSize:12,color:"#94A3B8"}}>Sample progress for all workers this month</div></div>
                  <button onClick={generateDemoMonthly} style={{padding:"8px 18px",borderRadius:8,background:"#059669",border:"none",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",flexShrink:0}}>Generate</button>
                </div>
                <div style={{background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginTop:8}}>
                  <div><div style={{fontSize:13,fontWeight:500,color:"#B91C1C",marginBottom:2}}>🗑 Remove all demo data</div><div style={{fontSize:12,color:"#F87171"}}>Deletes only demo records — real data is kept safe</div></div>
                  <button onClick={clearDemoData} style={{padding:"8px 18px",borderRadius:8,background:"#B91C1C",border:"none",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",flexShrink:0}}>Remove</button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* USERS - Admin only */}
        {tab===7 && isAdmin && <AdminPanel currentUser={currentUser}/>}

      </div>
    </div>
  );
}