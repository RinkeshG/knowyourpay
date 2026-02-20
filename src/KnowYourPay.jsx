import { useState, useEffect, useRef } from "react";
import { signInWithGoogle } from './firebase';


/* ─── Helpers ─── */
const numW = (n, c = "INR") => { if (!n || isNaN(n)) return ""; const v = Number(n); if (c === "INR") { if (v >= 10000000) return `₹ ${(v/10000000).toFixed(2)} Crore`; if (v >= 100000) return `₹ ${(v/100000).toFixed(2)} Lakhs`; return `₹ ${(v/1000).toFixed(1)}K`; } const s = c === "GBP" ? "£" : "$"; return v >= 1000000 ? `${s}${(v/1000000).toFixed(2)}M` : v >= 1000 ? `${s}${(v/1000).toFixed(1)}K` : `${s}${v}`; };
const fmt = (v, c = "INR") => { if (!v) return ""; const n = Number(v); if (c === "INR") { if (n >= 10000000) return `₹${(n/10000000).toFixed(1)}Cr`; if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`; return `₹${n.toLocaleString("en-IN")}`; } return c === "GBP" ? (n >= 1000 ? `£${(n/1000).toFixed(0)}K` : `£${n}`) : (n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`); };
const Bd = ({ t, c }) => { if (!t) return null; const p = t.split(/\*\*(.*?)\*\*/g); return <>{p.map((x,i) => i%2===1 ? <strong key={i} style={{color:c||"var(--ink)",fontWeight:700}}>{x}</strong> : <span key={i}>{x}</span>)}</>; };
const FI = ({ children, d = 0 }) => { const [v, setV] = useState(false); useEffect(() => { const t = setTimeout(() => setV(true), d); return () => clearTimeout(t); }, [d]); return <div style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(14px)",transition:"all 550ms cubic-bezier(0.23,1,0.32,1)"}}>{children}</div>; };

/* ─── Brand mark ─── */
const HexMark = ({ s = 20, dark }) => (
  <svg width={s} height={s} viewBox="0 0 56 56" fill="none">
    <path d="M28 4 L48 15.5 L48 40.5 L28 52 L8 40.5 L8 15.5 Z" fill={dark?"rgba(255,255,255,.06)":"#f8fafc"} stroke={dark?"rgba(255,255,255,.2)":"#0a0f1a"} strokeWidth="2"/>
    <line x1="28" y1="38" x2="28" y2="19" stroke={dark?"#60a5fa":"#1e56a0"} strokeWidth="3" strokeLinecap="round"/>
    <path d="M22 25 L28 18 L34 25" stroke={dark?"#60a5fa":"#1e56a0"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="28" cy="39" r="2.5" fill={dark?"#60a5fa":"#1e56a0"} opacity=".5"/>
  </svg>
);
const Logo = ({ s = 15, dark }) => (
  <div style={{display:"flex",alignItems:"center",gap:9}}>
    <HexMark s={s+7} dark={dark} />
    <span style={{fontFamily:"var(--fd)",fontSize:s}}>
      <span style={{fontWeight:200,color:dark?"rgba(255,255,255,.45)":"var(--muted)"}}>Know</span><span style={{fontWeight:600,fontStyle:"italic",color:dark?"#60a5fa":"var(--accent)"}}>Your</span><span style={{fontWeight:700,fontStyle:"italic",color:dark?"#fff":"var(--ink)"}}>Pay</span>
    </span>
  </div>
);
const Badge = ({ text, color, bg }) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",fontFamily:"var(--fb)",fontSize:11,fontWeight:700,color,background:bg,borderRadius:999}}>{text}</span>
);

/* ─── Form components ─── */
const LBL = ({children}) => <label style={{display:"block",fontFamily:"var(--fb)",fontSize:11,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--muted)",marginBottom:7}}>{children}</label>;
const INP = ({label, sub, value, onChange, ph, type="text", pre, suf, cur}) => (
  <div style={{marginBottom:20}}>
    <LBL>{label}{sub && <span style={{fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:5}}>{sub}</span>}</LBL>
    <div style={{position:"relative"}}>
      {pre && <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"var(--muted)",fontSize:14,fontWeight:600,pointerEvents:"none"}}>{pre}</span>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} style={{width:"100%",padding:`12px ${suf?48:14}px 12px ${pre?30:14}px`,fontFamily:"var(--fb)",fontSize:14,fontWeight:500,color:"var(--ink)",background:"#fff",border:"1.5px solid var(--border)",borderRadius:8,outline:"none",transition:"all 120ms ease",boxSizing:"border-box"}}
        onFocus={e=>{e.target.style.borderColor="var(--accent)";e.target.style.boxShadow="0 0 0 3px rgba(30,86,160,.08)";}}
        onBlur={e=>{e.target.style.borderColor="var(--border)";e.target.style.boxShadow="none";}}
      />
      {suf && <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:"var(--faint)",fontFamily:"var(--fb)",fontSize:11,fontWeight:600,pointerEvents:"none"}}>{suf}</span>}
    </div>
    {cur && value && Number(value)>0 && <div style={{marginTop:5,fontFamily:"var(--fm)",fontSize:11,color:"var(--you)",fontWeight:500}}>{numW(value,cur)} per year</div>}
  </div>
);
const SEL = ({label, value, onChange, options, ph}) => (
  <div style={{marginBottom:20}}>
    <LBL>{label}</LBL>
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"12px 14px",fontFamily:"var(--fb)",fontSize:14,fontWeight:500,color:value?"var(--ink)":"var(--faint)",background:"#fff",border:"1.5px solid var(--border)",borderRadius:8,outline:"none",cursor:"pointer",appearance:"none",boxSizing:"border-box",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center"}}>
      <option value="" disabled>{ph}</option>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  </div>
);
const CHIP = ({label,sel,onClick}) => (
  <button onClick={onClick} style={{padding:"7px 14px",fontFamily:"var(--fb)",fontSize:12,fontWeight:600,color:sel?"#fff":"var(--muted)",background:sel?"var(--accent)":"var(--surface)",border:sel?"1.5px solid var(--accent)":"1.5px solid var(--border)",borderRadius:6,cursor:"pointer",transition:"all 200ms cubic-bezier(0.23,1,0.32,1)"}}>{label}</button>
);

const facts = [
  "The average hike when switching jobs is 30–50% — most settle for 15%.",
  "Only 39% of people negotiate. The other 61% leave money on the table.",
  "Companies expect you to negotiate. Most offers have 10–20% room built in.",
  "The #1 reason people don't negotiate? Fear the offer gets pulled. It almost never does.",
  "Knowing the exact words to say matters more than knowing the right number.",
  "90-day notice periods give you leverage — the company already invested weeks hiring you.",
];

/* ═══ SAMPLE REPORT DATA ═══ */
const sampleReport = {
  situation:{standing:"underpaid",headline:"You're earning **₹22L** while market pays **₹28–38L** for Senior PMs in Bangalore",summary:"You're sitting at the **35th percentile** for your role — meaning 65% of Senior PMs in Bangalore earn more than you. Given your 7 years of experience and SaaS background, you should be closer to **₹32–35L**.",marketRange:{p25:1800000,p50:2800000,p75:3800000,p90:5200000},percentile:35,percentileText:"You're at P35 — 65% of Senior PMs in Bangalore earn more than you."},
  opportunity:{quality:"good",jumpPct:68,avgJump:30,targetRange:{p25:3000000,p50:4500000,p75:6500000,p90:8500000},askFeedback:"Your ask of ₹50L is within the P50–P75 band — well placed.",askLevel:"right",insight:"This is a **strong move**. Growth-stage fintech companies in Bangalore are paying **₹45–65L** for Head of Product roles with your profile."},
  gameplan:{askFor:6500000,settleAt:5500000,dontGoBelow:4500000,whyThisNumber:"₹65L anchors you at the P75 for Head of Product at growth-stage fintech, leaving room to settle at ₹55L which is still a **50%+ jump**.",
    tactics:[
      {title:"Anchor with Total Comp Framework",when:"First compensation discussion",script:"I'm currently at ₹22L base plus bonus, and based on my research for Head of Product roles at growth-stage fintech in Bangalore, I'm targeting ₹60–65L total comp. Given the scope expansion and my track record scaling products from 0-1, I believe this is fair. How does that fit with your budget?",why:"Opens high with data backing, frames as a question not a demand."},
      {title:"The Competing Interest Play",when:"After initial offer",script:"I appreciate the offer. I'm genuinely excited about this role. I should mention I'm in late stages with another company — I'd prefer to join you but want to make sure the numbers work. Can we revisit the base?",why:"Creates urgency without being aggressive. Most companies will improve by 10–15%."},
      {title:"The Silence Strategy",when:"After they counter",script:"Thank you for the revised offer. Let me take 48 hours to review the full package with my family.",why:"Silence after a counter almost always triggers a sweetener — signing bonus, faster review, or equity bump."},
      {title:"Lock the Review Cycle",when:"Before signing",script:"One last thing — can we add a 6-month compensation review clause? If I hit [specific metrics], we revisit the number. That way there's no risk for either side.",why:"Companies agree to this easily and it gives you a built-in renegotiation window."}
    ],
    watchOut:["High variable pay (40%+) that inflates total comp on paper — push for higher fixed","ESOP cliff vesting with no acceleration clause — ask about vesting schedule upfront"],
    bonusLevers:[{what:"Joining Bonus",ask:"₹3–4L one-time, framed as notice-period compensation"},{what:"ESOP acceleration",ask:"Request 1-year cliff instead of 2-year, or ask for acceleration on acquisition"},{what:"Learning Budget",ask:"₹1.5–2L annual for conferences, courses, coaching"}],
    hypeAdjusted:{low:4800000,high:6200000},
    emailDraft:"Hi [Recruiter], Thank you for the offer — I'm excited about the opportunity. After reviewing the full package and considering my current compensation plus market data for this role, I'd like to discuss targeting ₹62L total comp. I'm confident I can deliver outsized impact given my experience scaling products from 0-1. Happy to discuss on a call this week.",
    timeline:[{day:"Week 1",action:"Get verbal offer, express excitement, ask for written details"},{day:"Week 2",action:"Review package, send counter email, negotiate base + bonus"},{day:"Week 3–4",action:"Final negotiation, lock review clause, sign"}]
  },
  confidence:{score:78,note:"Based on 2024–25 market data for Bangalore fintech. Confidence is moderate-high — actual offers may vary by ±10% based on company funding stage."}
};

/* ═══ BAR CHART ═══ */
const BAR_PX = 200;
const Bars = ({range, youVal, label, cur, standing}) => {
  const [hov,setHov] = useState(null);
  const isUnder = standing === "underpaid";
  const all = [
    {k:"p25",l:"P25",tip:"Bottom quartile",v:range.p25},
    {k:"p50",l:"P50",tip:"Median salary",v:range.p50},
    {k:"p75",l:"P75",tip:"Top quartile",v:range.p75},
    {k:"p90",l:"P90",tip:"Top 10%",v:range.p90},
  ];
  if(youVal>0) all.push({k:"you",l:"YOU",tip:"Your salary",v:youVal,isYou:true});
  all.sort((a,b)=>a.v-b.v);
  const mx = Math.max(...all.map(b=>b.v));
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontFamily:"var(--fb)",fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--faint)",marginBottom:14}}>{label}</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:10,padding:"0 4px"}}>
        {all.map((b,i) => {
          const hPx = Math.max(Math.round((b.v/mx)*BAR_PX),36);
          const isH = hov===i;
          const youGrad = isUnder ? "linear-gradient(180deg,#fca5a5,#dc2626)" : "linear-gradient(180deg,#dbeafe,#3b82f6)";
          return (
            <div key={b.k} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",position:"relative"}}
              onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
              {isH && <div style={{position:"absolute",bottom:hPx+32,left:"50%",transform:"translateX(-50%)",background:"var(--ink)",color:"#fff",padding:"8px 12px",borderRadius:8,fontSize:12,whiteSpace:"nowrap",zIndex:10,boxShadow:"0 8px 28px rgba(10,15,26,.12)"}}>
                <div style={{fontFamily:"var(--fm)",fontWeight:700}}>{fmt(b.v,cur)}</div>
                <div style={{fontSize:10,opacity:.55,marginTop:2}}>{b.tip}</div>
                <div style={{position:"absolute",bottom:-4,left:"50%",transform:"translateX(-50%) rotate(45deg)",width:8,height:8,background:"var(--ink)"}} />
              </div>}
              {b.isYou && <div style={{fontFamily:"var(--fb)",fontSize:9,fontWeight:800,color:"var(--ink)",letterSpacing:".08em",position:"absolute",top:-18}}>YOU</div>}
              <span style={{fontFamily:"var(--fm)",fontSize:9,fontWeight:b.isYou?700:600,color:b.isYou?"var(--ink)":"var(--faint)"}}>{fmt(b.v,cur)}</span>
              <div style={{width:"100%",height:hPx,background:b.isYou?youGrad:"linear-gradient(180deg,#dbeafe,#93c5fd)",borderRadius:"4px 4px 2px 2px",animation:`barGrow 600ms ${b.isYou?all.length*100+200:i*100}ms cubic-bezier(0.23,1,0.32,1) both`,transformOrigin:"bottom",transition:"transform 120ms",transform:isH?"scaleY(1.03)":"scaleY(1)"}} />
              <span style={{fontFamily:"var(--fb)",fontSize:9,fontWeight:b.isYou?800:600,color:b.isYou?"var(--ink)":"var(--ghost)",letterSpacing:".04em"}}>{b.l}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══ SHARE CARD — generates branded product promo PNG (not personal report) ═══ */
const generateShareCard = (data, role, city) => {
  const W = 1200, H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a0f1a"; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,.03)"; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const grd = ctx.createRadialGradient(900, 300, 0, 900, 300, 400);
  grd.addColorStop(0, "rgba(30,86,160,.15)"); grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

  /* Logo area */
  ctx.font = "200 18px 'Fraunces', Georgia, serif";
  ctx.fillStyle = "rgba(255,255,255,.4)";
  ctx.fillText("Know", 60, 55);
  ctx.font = "600 italic 18px 'Fraunces', Georgia, serif";
  ctx.fillStyle = "#60a5fa";
  ctx.fillText("Your", 60 + ctx.measureText("Know").width + 2, 55);
  ctx.font = "700 italic 18px 'Fraunces', Georgia, serif";
  ctx.fillStyle = "#fff";
  const yw = ctx.measureText("Know").width + ctx.measureText("Your").width + 4;
  ctx.fillText("Pay", 60 + yw + 2, 55);

  /* Main headline — product-focused, not personal */
  ctx.font = "200 48px 'Fraunces', Georgia, serif";
  ctx.fillStyle = "#fff";
  ctx.fillText("I just found out what I should", 60, 150);
  ctx.font = "700 italic 48px 'Fraunces', Georgia, serif";
  ctx.fillStyle = "#60a5fa";
  ctx.fillText("actually be earning.", 60, 210);

  /* Subline */
  ctx.font = "400 20px 'Outfit', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.45)";
  ctx.fillText("AI-powered salary analysis in 3 minutes. Free, anonymous, no signup.", 60, 265);

  /* Feature blocks */
  const features = [
    { icon: "📊", title: "Market salary data", desc: "P25 to P90 benchmarks" },
    { icon: "🎯", title: "Negotiation scripts", desc: "Exact words to say" },
    { icon: "⚡", title: "Personalized strategy", desc: "Built for your specific role" },
  ];
  features.forEach((f, i) => {
    const x = 60 + i * 370, y = 320;
    ctx.fillStyle = "rgba(255,255,255,.04)";
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.beginPath(); ctx.roundRect(x, y, 340, 100, 12); ctx.fill(); ctx.stroke();
    ctx.font = "24px serif"; ctx.fillStyle = "#fff";
    ctx.fillText(f.icon, x + 20, y + 42);
    ctx.font = "600 16px 'Outfit', sans-serif"; ctx.fillStyle = "#fff";
    ctx.fillText(f.title, x + 56, y + 38);
    ctx.font = "400 14px 'Outfit', sans-serif"; ctx.fillStyle = "rgba(255,255,255,.4)";
    ctx.fillText(f.desc, x + 56, y + 62);
  });

  /* Bar chart mini preview */
  const barY = 460, barH = 80, barW = 40, barGap = 12;
  const bars = [{h:.35,c:"#93c5fd"},{h:.55,c:"#93c5fd"},{h:.42,c:"#dc2626"},{h:.75,c:"#93c5fd"},{h:1,c:"#93c5fd"}];
  bars.forEach((b, i) => {
    const x = 900 + i * (barW + barGap), h = b.h * barH;
    const g = ctx.createLinearGradient(x, barY + barH - h, x, barY + barH);
    g.addColorStop(0, b.c === "#dc2626" ? "#fca5a5" : "#dbeafe");
    g.addColorStop(1, b.c);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(x, barY + barH - h, barW, h, [3,3,1,1]); ctx.fill();
  });

  /* CTA */
  ctx.fillStyle = "#1e56a0";
  ctx.beginPath(); ctx.roundRect(60, H - 90, 300, 50, 10); ctx.fill();
  ctx.font = "700 16px 'Outfit', sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
  ctx.fillText("Check yours free → knowyourpay.in", 210, H - 59);
  ctx.textAlign = "left";

  ctx.fillStyle = "#1e56a0"; ctx.fillRect(0, H - 4, W, 4);
  return canvas.toDataURL("image/png");
};

/* ═══ GOOGLE AUTH COMPONENT ═══ */
const AuthGate = ({ onAuth }) => {
  const handleGoogleAuth = async () => {
    try {
      const userData = await signInWithGoogle();
      onAuth(userData);
    } catch (e) {
      console.error('Auth failed:', e);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(10,15,26,.6)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <FI>
        <div style={{background:"#fff",borderRadius:16,padding:36,maxWidth:420,width:"100%",textAlign:"center",boxShadow:"0 24px 80px rgba(10,15,26,.15)"}}>
          <HexMark s={44} />
          <div style={{fontFamily:"var(--fd)",fontSize:26,fontWeight:200,marginTop:16,marginBottom:4}}>
            One quick step <span style={{fontWeight:700,fontStyle:"italic"}}>before your report</span>
          </div>
          <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.65,marginBottom:24}}>
            Sign in to see your analysis. We only use your email to save your report — <strong style={{color:"var(--ink)"}}>nothing you enter is stored or shared. Ever.</strong>
          </p>

          {/* Google button */}
          <button onClick={handleGoogleAuth} style={{width:"100%",padding:"13px 20px",fontFamily:"var(--fb)",fontSize:14,fontWeight:600,color:"var(--ink)",background:"#fff",border:"1.5px solid var(--border)",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all 120ms",boxShadow:"0 1px 3px rgba(10,15,26,.08)"}}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>

          {/* Trust signals */}
          <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:8}}>
            {[
              {icon:"🔒",text:"Your salary data is never stored on our servers"},
              {icon:"🚫",text:"We don't sell or share your information with anyone"},
              {icon:"🗑️",text:"Analysis runs in real-time and isn't saved after you leave"},
            ].map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
                <span style={{fontSize:13,flexShrink:0}}>{t.icon}</span>
                <span style={{fontSize:12,color:"var(--muted)",lineHeight:1.4}}>{t.text}</span>
              </div>
            ))}
          </div>

          <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid var(--border)"}}>
            <div style={{fontSize:11,color:"var(--faint)",lineHeight:1.5}}>By continuing, you agree to our <span style={{color:"var(--accent)",cursor:"pointer"}}>Privacy Policy</span>. We use Google only for authentication — zero access to your contacts, drive, or any other data.</div>
          </div>
        </div>
      </FI>
    </div>
  );
};

/* ═══ SAMPLE REPORT MODAL ═══ */
const SampleReportModal = ({ show, onClose, cur }) => {
  if (!show) return null;
  const s = sampleReport;
  const sm = {underpaid:{c:"#b91c1c",bg:"#fef2f2",i:"↓",t:"Underpaid"}};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(10,15,26,.5)",backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"40px 24px",overflowY:"auto"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,maxWidth:620,width:"100%",boxShadow:"0 24px 80px rgba(10,15,26,.15)",overflow:"hidden"}}>
        {/* Header */}
        <div style={{background:"var(--ink)",padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"var(--fm)",fontSize:9,fontWeight:600,color:"rgba(255,255,255,.3)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:3}}>SAMPLE REPORT</div>
            <div style={{fontFamily:"var(--fd)",fontSize:16,fontWeight:300,color:"rgba(255,255,255,.7)"}}>Senior PM → Head of Product · Bangalore</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,.08)",border:"none",color:"rgba(255,255,255,.5)",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:24,maxHeight:"70vh",overflowY:"auto"}}>
          {/* Verdict */}
          <div style={{background:"var(--ink)",borderRadius:12,padding:"16px 20px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:300,color:"rgba(255,255,255,.85)",lineHeight:1.3}}>
                <Bd t={s.situation.headline} c="#fff" />
              </div>
              <Badge text="↓ Underpaid" color="#b91c1c" bg="#fef2f2" />
            </div>
          </div>

          <div style={{fontSize:14,color:"var(--slate)",lineHeight:1.7,marginBottom:20}}><Bd t={s.situation.summary} /></div>
          <Bars range={s.situation.marketRange} youVal={2200000} label="Market range · Senior PM · Bangalore" cur="INR" standing="underpaid" />

          {/* Game plan preview */}
          <div style={{background:"var(--ink)",borderRadius:12,padding:"18px 20px",marginTop:16}}>
            <div style={{fontFamily:"var(--fm)",fontSize:9,fontWeight:600,color:"rgba(255,255,255,.3)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>Your game plan</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              {[{l:"Ask for",v:6500000,c:"#60a5fa"},{l:"Aim to land",v:5500000,c:"#34d399"},{l:"Don't go below",v:4500000,c:"#f87171"}].map(x=>(
                <div key={x.l} style={{textAlign:"center",padding:"12px 6px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.07)"}}>
                  <div style={{fontFamily:"var(--fm)",fontSize:15,fontWeight:700,color:x.c}}>{fmt(x.v,"INR")}</div>
                  <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".06em",marginTop:2}}>{x.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Blurred tactics teaser */}
          <div style={{position:"relative",marginTop:16}}>
            <div style={{filter:"blur(4px)",pointerEvents:"none",opacity:.6}}>
              <div style={{background:"var(--surface)",borderRadius:10,padding:14,marginBottom:8,border:"1px solid var(--border)"}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--ink)"}}>1. Anchor with Total Comp Framework</div>
                <div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>"I'm currently at ₹22L base plus bonus, and based on my research..."</div>
              </div>
              <div style={{background:"var(--surface)",borderRadius:10,padding:14,border:"1px solid var(--border)"}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--ink)"}}>2. The Competing Interest Play</div>
                <div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>"I appreciate the offer. I'm genuinely excited about..."</div>
              </div>
            </div>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <button onClick={onClose} style={{padding:"12px 28px",fontFamily:"var(--fb)",fontSize:14,fontWeight:700,color:"#fff",background:"var(--ink)",border:"none",borderRadius:9,cursor:"pointer",boxShadow:"0 8px 24px rgba(10,15,26,.25)"}}>
                Get your free report →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════ MAIN ═══════════ */
export default function KnowYourPay() {
  const [step,setStep] = useState(-1);
  const [loading,setLoading] = useState(false);
  const [analysis,setAnalysis] = useState(null);
  const [error,setError] = useState(null);
  const [mounted,setMounted] = useState(false);
  const [factIdx,setFactIdx] = useState(0);
  const [elapsed,setElapsed] = useState(0);
  const [openTac,setOpenTac] = useState(0);
  const [showAuth,setShowAuth] = useState(false);
  const [user,setUser] = useState(null);
  const [shareImg,setShareImg] = useState(null);
  const [showSample,setShowSample] = useState(false);
  const [unlockedPro,setUnlockedPro] = useState(0); /* 0-4 features unlocked via referrals */
  const [showInvite,setShowInvite] = useState(false);
  const [inviteCopied,setInviteCopied] = useState(false);

  useEffect(()=>{setTimeout(()=>setMounted(true),50)},[]);

  const [f,setF] = useState({currentRole:"",targetRole:"",yearsExp:"",industry:"",companyStage:"",targetCompany:"",country:"India",city:"",currentSalary:"",currentBonus:"",currentEsops:"",expectedLow:"",expectedHigh:"",hasCompeting:"no",noticePeriod:""});
  const u = k=>v=>setF(p=>({...p,[k]:v}));

  const industries = ["SaaS / B2B Tech","Consumer Tech","Fintech","Healthtech","Edtech","E-commerce","AI / ML","Gaming","D2C / Retail","Consulting","BFSI","Other"];
  const stages = [{value:"seed",label:"Seed / Pre-Series A"},{value:"early",label:"Series A–B"},{value:"growth",label:"Series C–D"},{value:"late",label:"Late / Pre-IPO"},{value:"public",label:"Public"},{value:"mnc",label:"MNC"},{value:"bootstrap",label:"Bootstrapped"}];
  const countries = ["India","United States","United Kingdom","Canada","Germany","Singapore","UAE"];
  const cur = f.country==="India"?"INR":f.country==="United Kingdom"?"GBP":"USD";
  const sym = cur==="INR"?"₹":cur==="GBP"?"£":"$";

  const ok=()=>{if(step===0)return f.currentRole&&f.targetRole&&f.yearsExp&&f.industry;if(step===1)return f.currentSalary;if(step===2)return f.expectedLow&&f.targetCompany;return false;};
  const next=()=>{if(step<2)setStep(step+1);else{if(!user){setShowAuth(true);}else{run();}}};
  const back=()=>{if(step>0)setStep(step-1);};
  const reset=()=>{setStep(-1);setAnalysis(null);setError(null);setOpenTac(0);setShowInvite(false);setShareImg(null);};

  const handleAuth = (userData) => { setUser(userData); setShowAuth(false); run(); };

  useEffect(()=>{if(!loading)return;setFactIdx(0);setElapsed(0);const a=setInterval(()=>setFactIdx(p=>(p+1)%facts.length),4500);const b=setInterval(()=>setElapsed(p=>p+1),1000);return()=>{clearInterval(a);clearInterval(b);};},[loading]);
  useEffect(()=>{if(analysis){try{setShareImg(generateShareCard(analysis,f.targetRole,f.city||f.country));}catch(e){console.error(e);}}},[analysis]);

  const run = async () => {
    setStep(3);setLoading(true);setError(null);window.scrollTo(0,0);
    const prompt = `You are an expert salary negotiation advisor. Return ONLY a valid JSON object. No markdown, no backticks, no explanation.

CANDIDATE: Current role: ${f.currentRole}, Target: ${f.targetRole}, Exp: ${f.yearsExp}y, Industry: ${f.industry}, Company: ${f.targetCompany} (${f.companyStage||"unknown"} stage), Location: ${f.city?f.city+", ":""}${f.country}, Current: ${sym}${f.currentSalary}/yr${f.currentBonus?` + ${sym}${f.currentBonus} bonus`:""}${f.currentEsops?` + ${sym}${f.currentEsops} equity`:""}, Expected: ${sym}${f.expectedLow}${f.expectedHigh?`-${sym}${f.expectedHigh}`:""}, Competing: ${f.hasCompeting}, Notice: ${f.noticePeriod||"standard"}

Return JSON: {"situation":{"standing":"underpaid","headline":"text with **bold**","summary":"2 sentences **bold**","marketRange":{"p25":0,"p50":0,"p75":0,"p90":0},"percentile":35,"percentileText":"sentence"},"opportunity":{"quality":"good","jumpPct":40,"avgJump":25,"targetRange":{"p25":0,"p50":0,"p75":0,"p90":0},"askFeedback":"sentence","askLevel":"right","insight":"2 sentences **bold**"},"gameplan":{"askFor":0,"settleAt":0,"dontGoBelow":0,"whyThisNumber":"sentence","tactics":[{"title":"name","when":"timing","script":"exact words 2-3 sentences","why":"why"},{"title":"name","when":"timing","script":"words","why":"why"},{"title":"name","when":"timing","script":"words","why":"why"},{"title":"name","when":"timing","script":"words","why":"why"}],"watchOut":["flag","flag"],"bonusLevers":[{"what":"lever","ask":"ask"},{"what":"lever","ask":"ask"},{"what":"lever","ask":"ask"}],"hypeAdjusted":{"low":0,"high":0},"emailDraft":"3 sentence email","timeline":[{"day":"Week 1","action":"action"},{"day":"Week 2-3","action":"action"},{"day":"Week 4","action":"action"}]},"confidence":{"score":72,"note":"caveat"}}
standing: underpaid|fair|well-paid|overpaid. quality: poor|decent|good|excellent. askLevel: low|right|high. All salary numbers as raw integers.`;

    try {
      const res = await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2800,messages:[{role:"user",content:prompt}]})});
      if(!res.ok) throw new Error("API " + res.status);
      const d = await res.json();
      const raw = (d.content||[]).map(c=>c.text||"").join("");
      let clean = raw.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if(!match) throw new Error("No JSON");
      const parsed = JSON.parse(match[0]);
      if(!parsed.situation||!parsed.gameplan) throw new Error("Incomplete");
      setAnalysis(parsed);
    } catch(e) {
      console.error("KYP:", e);
      setError("Analysis failed — please try again.");
    } finally { setLoading(false); }
  };

  const handleShare = async (platform) => {
    const text = `I just found out what I should actually be earning.\nAI-powered salary analysis in 3 minutes — free, anonymous.\n\nCheck yours → knowyourpay.in`;
    if (shareImg && navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(shareImg)).blob();
        const file = new File([blob], "knowyourpay.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) { await navigator.share({ text, files: [file] }); return; }
      } catch(e) {}
    }
    if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    else if (platform === "linkedin") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://knowyourpay.in")}`, "_blank");
    else if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText("https://knowyourpay.in?ref=invite");
    setInviteCopied(true);
    setTimeout(()=>setInviteCopied(false),2000);
  };

  const downloadShareCard = () => { if(!shareImg)return; const a=document.createElement("a"); a.href=shareImg; a.download="knowyourpay.png"; a.click(); };

  const a = analysis;
  const sMap = {underpaid:{c:"#b91c1c",bg:"#fef2f2",i:"↓",t:"Underpaid"},fair:{c:"#a16207",bg:"#fefce8",i:"→",t:"Fair"},"well-paid":{c:"#15803d",bg:"#f0fdf4",i:"↑",t:"Well Paid"},overpaid:{c:"#7c3aed",bg:"#f5f3ff",i:"↑↑",t:"Above Market"}};
  const qMap = {poor:{c:"#b91c1c",bg:"#fef2f2"},decent:{c:"#a16207",bg:"#fefce8"},good:{c:"#15803d",bg:"#f0fdf4"},excellent:{c:"#1e56a0",bg:"#eff6ff"}};

  /* Pro features that can be unlocked via referrals */
  const proFeatures = [
    {id:"scripts",icon:"🎯",title:"3 extra negotiation scripts",desc:"Competing offer, silence strategy, deadline"},
    {id:"email",icon:"📧",title:"Ready-to-send email template",desc:"Copy-paste negotiation email"},
    {id:"levers",icon:"💰",title:"Bonus lever strategies",desc:"Non-salary items to negotiate"},
    {id:"timeline",icon:"📅",title:"Week-by-week timeline",desc:"When to make each move"},
  ];

  return (
    <div style={{"--fd":"'Fraunces',Georgia,serif","--fb":"'Outfit','Helvetica Neue',sans-serif","--fm":"'JetBrains Mono',monospace","--ink":"#0a0f1a","--ink2":"#1e293b","--slate":"#475569","--muted":"#64748b","--faint":"#94a3b8","--ghost":"#cbd5e1","--surface":"#f8fafc","--border":"#e2e8f0","--accent":"#1e56a0","--accent-l":"#dbeafe","--you":"#d97706","--up":"#16a34a","--down":"#dc2626",minHeight:"100vh",fontFamily:"var(--fb)",color:"var(--ink)",background:"#fff"}}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`*{margin:0;padding:0;box-sizing:border-box}::selection{background:#dbeafe;color:#1e56a0}@keyframes spin{to{transform:rotate(360deg)}}@keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}@keyframes factCycle{0%{opacity:0;transform:translateY(8px)}10%{opacity:1;transform:translateY(0)}85%{opacity:1}100%{opacity:0;transform:translateY(-8px)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}input::placeholder{font-family:'Outfit',sans-serif;color:#94a3b8}input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}select option{background:#fff;color:#0a0f1a}`}</style>

      {/* Auth modal */}
      {showAuth && <AuthGate onAuth={handleAuth} />}
      {/* Sample report modal */}
      <SampleReportModal show={showSample} onClose={()=>setShowSample(false)} cur="INR" />

      {/* ═══ LANDING ═══ */}
      {step===-1 && (
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"18px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--border)",opacity:mounted?1:0,transition:"opacity 400ms 100ms"}}>
            <Logo s={14} />
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>setShowSample(true)} style={{fontFamily:"var(--fb)",fontSize:12,fontWeight:600,padding:"8px 16px",color:"var(--muted)",background:"transparent",border:"1.5px solid var(--border)",borderRadius:8,cursor:"pointer",transition:"all 120ms"}}>See sample report</button>
              <button onClick={()=>setStep(0)} style={{fontFamily:"var(--fb)",fontSize:12,fontWeight:700,padding:"8px 20px",color:"#fff",background:"var(--ink)",border:"none",borderRadius:9,cursor:"pointer"}}>Get Started →</button>
            </div>
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 32px"}}>
            <div style={{display:"flex",alignItems:"center",gap:64,maxWidth:1060,width:"100%",flexWrap:"wrap"}}>
              <div style={{flex:"1 1 420px",maxWidth:480,opacity:mounted?1:0,transform:mounted?"none":"translateY(24px)",transition:"all 700ms 150ms cubic-bezier(0.23,1,0.32,1)"}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--accent-l)",borderRadius:999,padding:"5px 12px",marginBottom:24}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)"}} />
                  <span style={{fontFamily:"var(--fm)",fontSize:10,fontWeight:600,color:"var(--accent)",letterSpacing:".04em"}}>AI-POWERED SALARY INTELLIGENCE</span>
                </div>
                <h1 style={{fontFamily:"var(--fd)",fontSize:"clamp(36px,5.5vw,54px)",fontWeight:200,lineHeight:1.08,letterSpacing:"-.03em",marginBottom:20}}>
                  You got the offer.<br/><span style={{fontWeight:700,fontStyle:"italic"}}>Is it actually good?</span>
                </h1>
                <p style={{fontSize:16,lineHeight:1.7,color:"var(--slate)",marginBottom:36,maxWidth:420}}>
                  Find out if you're underpaid, what the market really pays, and get <span style={{fontFamily:"var(--fd)",fontStyle:"italic",fontWeight:500,color:"var(--ink)"}}>the exact words</span> to negotiate better.
                </p>
                <button onClick={()=>setStep(0)} style={{fontFamily:"var(--fb)",fontSize:15,fontWeight:700,padding:"14px 32px",color:"#fff",background:"var(--ink)",border:"none",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                  Check my salary <span style={{fontSize:18}}>→</span>
                </button>
                <div style={{display:"flex",gap:20,marginTop:20,fontSize:13,flexWrap:"wrap"}}>
                  {["Free, no signup","3 minutes","100% private"].map((t,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:5,color:"var(--muted)"}}><span style={{color:"var(--up)"}}>✓</span>{t}</span>)}
                </div>
                {/* Subtle sample report link — visible but not intrusive */}
                <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid var(--border)"}}>
                  <button onClick={()=>setShowSample(true)} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",padding:0}}>
                    <div style={{width:36,height:36,borderRadius:8,background:"var(--surface)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>📊</div>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>Curious what you'll get?</div>
                      <div style={{fontSize:12,color:"var(--accent)",fontWeight:500}}>See a sample report →</div>
                    </div>
                  </button>
                </div>
              </div>
              {/* Preview card */}
              <div style={{flex:"1 1 340px",display:"flex",justifyContent:"center",opacity:mounted?1:0,transform:mounted?"none":"translateY(28px)",transition:"all 800ms 300ms cubic-bezier(0.23,1,0.32,1)"}}>
                <div style={{width:360,background:"var(--ink)",borderRadius:14,overflow:"hidden",boxShadow:"0 24px 80px rgba(10,15,26,.12),0 4px 20px rgba(10,15,26,.06)",animation:"float 6s ease infinite"}}>
                  <div style={{padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div><div style={{fontFamily:"var(--fb)",fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:5}}>Your verdict</div>
                        <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:300,color:"#fff",lineHeight:1.25}}>You're underpaid by <span style={{fontWeight:700,fontStyle:"italic",color:"#f87171"}}>₹6L/yr</span></div>
                      </div>
                      <span style={{padding:"4px 10px",fontFamily:"var(--fb)",fontSize:9,fontWeight:700,color:"#b91c1c",background:"#fef2f2",borderRadius:5}}>UNDERPAID</span>
                    </div>
                  </div>
                  <div style={{padding:"16px 22px 12px"}}>
                    <div style={{fontFamily:"var(--fb)",fontSize:9,fontWeight:700,color:"rgba(255,255,255,.25)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:12}}>Market range · Sr. PM · Bengaluru</div>
                    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:100}}>
                      {[{h:32,v:"₹18L",l:"P25"},{h:55,v:"₹28L",l:"P50"},{h:42,v:"₹22L",l:"YOU",red:true},{h:75,v:"₹38L",l:"P75"},{h:100,v:"₹52L",l:"P90"}].map((b,i)=>(
                        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                          <span style={{fontFamily:"var(--fm)",fontSize:8,fontWeight:b.red?700:600,color:b.red?"#fff":"rgba(255,255,255,.3)"}}>{b.v}</span>
                          <div style={{width:"100%",height:`${b.h}%`,background:b.red?"linear-gradient(180deg,#fca5a5,#dc2626)":"linear-gradient(180deg,#dbeafe88,#93c5fd)",borderRadius:"4px 4px 2px 2px",animation:`barGrow 600ms ${i*80}ms cubic-bezier(0.23,1,0.32,1) both`,transformOrigin:"bottom"}} />
                          <span style={{fontFamily:"var(--fb)",fontSize:8,fontWeight:b.red?800:600,color:b.red?"#fff":"rgba(255,255,255,.25)"}}>{b.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{padding:"4px 22px 14px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
                      {[{v:"₹34L",l:"Ask for",c:"#60a5fa"},{v:"₹30L",l:"Aim to land",c:"#34d399"},{v:"₹26L",l:"Walk away",c:"#f87171"}].map((x,i)=>(
                        <div key={i} style={{textAlign:"center",padding:"9px 4px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.07)"}}>
                          <div style={{fontFamily:"var(--fm)",fontSize:12,fontWeight:700,color:x.c}}>{x.v}</div>
                          <div style={{fontSize:8,fontWeight:700,color:"rgba(255,255,255,.25)",textTransform:"uppercase",letterSpacing:".06em",marginTop:2}}>{x.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Privacy footer */}
          <div style={{padding:"16px 32px",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
            {[{i:"🔒",t:"Your data stays on your device"},{i:"🚫",t:"Nothing stored, ever"},{i:"🛡️",t:"No tracking, no ads"}].map((x,i)=>(
              <span key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"var(--faint)"}}><span>{x.i}</span>{x.t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ═══ FORM + RESULTS ═══ */}
      {step>=0 && (
        <div style={{minHeight:"100vh"}}>
          <div style={{maxWidth:620,margin:"0 auto",padding:"28px 32px 48px"}}>
            <FI><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:step<3?0:24}}>
              <Logo s={13} />
              {step===3&&a&&<button onClick={reset} style={{padding:"6px 14px",fontFamily:"var(--fb)",fontSize:11,fontWeight:700,color:"var(--muted)",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:6,cursor:"pointer"}}>New analysis</button>}
            </div></FI>

            {step<3&&<FI d={80}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"24px 0"}}>
              <div style={{display:"flex",gap:5,flex:1}}>{[0,1,2].map(i=><div key={i} style={{flex:i===step?3:1,height:3,borderRadius:2,background:i<=step?"var(--accent)":"var(--border)",transition:"all 400ms cubic-bezier(0.23,1,0.32,1)"}} />)}</div>
              <span style={{fontFamily:"var(--fb)",fontSize:11,color:"var(--faint)",fontWeight:600,marginLeft:16,letterSpacing:".04em",textTransform:"uppercase"}}>{["Profile","Comp","Target"][step]}</span>
            </div></FI>}

            {step===0&&<FI key="s0">
              <div style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:200,letterSpacing:"-.02em",marginBottom:4}}>Who you are & <span style={{fontWeight:700,fontStyle:"italic"}}>where you're headed</span></div>
              <div style={{fontFamily:"var(--fd)",fontSize:16,fontWeight:300,fontStyle:"italic",color:"var(--muted)",marginBottom:28}}>Tell us about your current and target role.</div>
              <INP label="Current Role" value={f.currentRole} onChange={u("currentRole")} ph="e.g. Senior Product Manager" />
              <INP label="Target Role" value={f.targetRole} onChange={u("targetRole")} ph="e.g. Head of Product" />
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <INP label="Years of Exp" value={f.yearsExp} onChange={u("yearsExp")} ph="7" type="number" />
                <SEL label="Industry" value={f.industry} onChange={u("industry")} options={industries} ph="Select..." />
              </div>
              <SEL label="Company Stage" value={f.companyStage} onChange={u("companyStage")} options={stages} ph="Select..." />
            </FI>}
            {step===1&&<FI key="s1">
              <div style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:200,letterSpacing:"-.02em",marginBottom:4}}>What you <span style={{fontWeight:700,fontStyle:"italic"}}>earn today</span></div>
              <div style={{fontSize:14,color:"var(--muted)",marginBottom:28}}>Better input → sharper advice.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <SEL label="Country" value={f.country} onChange={u("country")} options={countries} ph="Select..." />
                <INP label="City" value={f.city} onChange={u("city")} ph="e.g. Bangalore" />
              </div>
              <INP label="Annual Base Salary" value={f.currentSalary} onChange={u("currentSalary")} ph="e.g. 3500000" pre={sym} suf="/yr" type="number" cur={cur} />
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <INP label="Bonus" sub="(if any)" value={f.currentBonus} onChange={u("currentBonus")} ph="0" pre={sym} type="number" cur={cur} />
                <INP label="ESOPs" sub="(annual est.)" value={f.currentEsops} onChange={u("currentEsops")} ph="0" pre={sym} type="number" cur={cur} />
              </div>
            </FI>}
            {step===2&&<FI key="s2">
              <div style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:200,letterSpacing:"-.02em",marginBottom:4}}>Where you're <span style={{fontWeight:700,fontStyle:"italic"}}>aiming</span></div>
              <div style={{fontSize:14,color:"var(--muted)",marginBottom:28}}>Target company and expected range.</div>
              <INP label="Target Company" value={f.targetCompany} onChange={u("targetCompany")} ph="e.g. Razorpay, Swiggy, Google" />
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <INP label="Expected" sub="(low)" value={f.expectedLow} onChange={u("expectedLow")} ph="5000000" pre={sym} type="number" cur={cur} />
                <INP label="Expected" sub="(high)" value={f.expectedHigh} onChange={u("expectedHigh")} ph="6500000" pre={sym} type="number" cur={cur} />
              </div>
              <div style={{marginBottom:20}}><LBL>Competing offers?</LBL>
                <div style={{display:"flex",gap:8}}>{[["no","No"],["yes","Yes"],["expecting soon","Soon"]].map(([v,l])=><CHIP key={v} label={l} sel={f.hasCompeting===v} onClick={()=>u("hasCompeting")(v)} />)}</div>
              </div>
              <SEL label="Notice Period" value={f.noticePeriod} onChange={u("noticePeriod")} options={[{value:"immediate",label:"Immediate"},{value:"15",label:"15 days"},{value:"30",label:"30 days"},{value:"60",label:"60 days"},{value:"90",label:"90 days"}]} ph="Select..." />
            </FI>}

            {step<3&&<FI d={180}><div style={{display:"flex",gap:10}}>
              {step>0&&<button onClick={back} style={{padding:"13px 22px",fontFamily:"var(--fb)",fontSize:14,fontWeight:600,color:"var(--ink)",background:"transparent",border:"1.5px solid var(--border)",borderRadius:9,cursor:"pointer"}}>Back</button>}
              <button onClick={next} disabled={!ok()} style={{flex:1,padding:"13px 22px",fontFamily:"var(--fb)",fontSize:14,fontWeight:700,color:ok()?"#fff":"var(--ghost)",background:ok()?"var(--ink)":"var(--surface)",border:ok()?"none":"1.5px solid var(--border)",borderRadius:9,cursor:ok()?"pointer":"not-allowed",transition:"all 200ms"}}>{step===2?"Analyze my salary →":"Continue →"}</button>
            </div></FI>}

            {step===3&&loading&&<FI><div style={{textAlign:"center",padding:"60px 0"}}>
              <div style={{width:40,height:40,margin:"0 auto 24px",border:"3px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin .7s linear infinite"}} />
              <div style={{fontFamily:"var(--fd)",fontSize:24,fontWeight:200,marginBottom:6}}>Analyzing <span style={{fontWeight:700,fontStyle:"italic"}}>your numbers</span>...</div>
              <div style={{fontSize:14,color:"var(--muted)",marginBottom:36}}>Building your plan for <span style={{fontWeight:600,color:"var(--ink)"}}>{f.targetRole}</span></div>
              <div style={{maxWidth:420,margin:"0 auto",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"16px 20px",textAlign:"left"}}>
                <div style={{fontFamily:"var(--fm)",fontSize:10,fontWeight:600,color:"var(--accent)",letterSpacing:".06em",textTransform:"uppercase",marginBottom:8}}>DID YOU KNOW</div>
                <div key={factIdx} style={{fontSize:14,color:"var(--slate)",lineHeight:1.65,animation:"factCycle 4.5s ease infinite"}}>{facts[factIdx]}</div>
              </div>
              <div style={{marginTop:24,fontFamily:"var(--fm)",fontSize:11,color:"var(--faint)"}}>{elapsed}s</div>
            </div></FI>}
            {error&&<FI><div style={{textAlign:"center",padding:"60px 0"}}>
              <div style={{fontSize:14,color:"var(--muted)",marginBottom:20}}>{error}</div>
              <button onClick={()=>{setStep(2);setError(null);}} style={{padding:"13px 22px",fontFamily:"var(--fb)",fontSize:14,fontWeight:700,color:"#fff",background:"var(--ink)",border:"none",borderRadius:9,cursor:"pointer"}}>Go back & retry</button>
            </div></FI>}

            {/* ═══ RESULTS ═══ */}
            {step===3&&a&&<div>
              {/* CARD 1: Verdict */}
              <FI d={0}><div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden",marginBottom:12,boxShadow:"0 4px 24px rgba(10,15,26,.06)"}}>
                <div style={{background:"var(--ink)",padding:"20px 24px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"var(--fb)",fontSize:9,fontWeight:700,color:"rgba(255,255,255,.35)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>Your verdict</div>
                      <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:300,color:"rgba(255,255,255,.85)",lineHeight:1.3}}>
                        <Bd t={a.situation.headline} c="#fff" />
                      </div>
                    </div>
                    <Badge text={`${sMap[a.situation.standing]?.i||"→"} ${sMap[a.situation.standing]?.t||"Fair"}`} color={sMap[a.situation.standing]?.c} bg={sMap[a.situation.standing]?.bg} />
                  </div>
                </div>
                <div style={{padding:24}}>
                  <div style={{fontSize:15,color:"var(--slate)",lineHeight:1.7,marginBottom:24}}><Bd t={a.situation.summary} /></div>
                  <Bars range={a.situation.marketRange} youVal={Number(f.currentSalary)} label={`Market range · ${f.currentRole} · ${f.city||f.country}`} cur={cur} standing={a.situation.standing} />
                  <div style={{padding:16,background:"var(--surface)",borderRadius:12,border:"1px solid var(--border)",marginTop:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
                      <div style={{width:48,height:48,borderRadius:12,background:"var(--accent-l)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontFamily:"var(--fm)",fontSize:20,fontWeight:700,color:"var(--accent)"}}>{a.situation.percentile}</span>
                      </div>
                      <div style={{fontSize:14,color:"var(--slate)",lineHeight:1.5}}><Bd t={a.situation.percentileText} /></div>
                    </div>
                    <div style={{position:"relative",height:6,background:"var(--border)",borderRadius:3}}>
                      <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${Math.min(a.situation.percentile,100)}%`,background:"linear-gradient(90deg,#dc2626,#d97706 50%,#16a34a)",borderRadius:3}} />
                      <div style={{position:"absolute",left:`${Math.min(a.situation.percentile,100)}%`,top:-5,width:16,height:16,borderRadius:"50%",background:"var(--ink)",border:"3px solid #fff",transform:"translateX(-50%)",boxShadow:"0 2px 8px rgba(10,15,26,.2)"}} />
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,fontFamily:"var(--fm)",color:"var(--faint)",fontWeight:600}}><span>Lowest</span><span>Top earners</span></div>
                  </div>
                </div>
              </div></FI>

              {/* CARD 2: Opportunity */}
              <FI d={200}><div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:24,marginBottom:12,boxShadow:"0 4px 24px rgba(10,15,26,.06)"}}>
                <div style={{fontFamily:"var(--fm)",fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--accent)",marginBottom:14}}>The opportunity</div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
                  <Badge text={`${a.opportunity.quality||"good"} move`} color={qMap[a.opportunity.quality]?.c||"#15803d"} bg={qMap[a.opportunity.quality]?.bg||"#f0fdf4"} />
                  <span style={{fontFamily:"var(--fm)",fontSize:18,fontWeight:700,color:a.opportunity.jumpPct>0?"var(--up)":"var(--down)"}}>{a.opportunity.jumpPct>0?"+":""}{a.opportunity.jumpPct}%</span>
                  <span style={{fontSize:12,color:"var(--faint)"}}>typical: {a.opportunity.avgJump}%</span>
                </div>
                <div style={{padding:"12px 16px",borderRadius:10,marginBottom:18,background:a.opportunity.askLevel==="low"?"#fef2f2":a.opportunity.askLevel==="high"?"#fefce8":"#f0fdf4",borderLeft:`3px solid ${a.opportunity.askLevel==="low"?"#dc2626":a.opportunity.askLevel==="high"?"#d97706":"#16a34a"}`}}>
                  <div style={{fontSize:14,fontWeight:600,color:a.opportunity.askLevel==="low"?"#b91c1c":a.opportunity.askLevel==="high"?"#a16207":"#15803d",lineHeight:1.5}}>{a.opportunity.askLevel==="low"?"↓ ":a.opportunity.askLevel==="high"?"⚠ ":"✓ "}{a.opportunity.askFeedback}</div>
                </div>
                <Bars range={a.opportunity.targetRange} youVal={Number(f.expectedLow)} label={`Target range · ${f.targetRole} · ${f.targetCompany}`} cur={cur} standing={a.opportunity.askLevel==="low"?"underpaid":"fair"} />
                <div style={{fontSize:15,color:"var(--slate)",lineHeight:1.7,marginTop:4}}><Bd t={a.opportunity.insight} /></div>
              </div></FI>

              {/* Reality check */}
              <FI d={300}><div style={{background:"var(--surface)",border:"1px solid var(--border)",borderLeft:"3px solid var(--you)",borderRadius:"0 10px 10px 0",padding:"14px 18px",marginBottom:12}}>
                <div style={{fontSize:14,color:"var(--slate)",lineHeight:1.55}}>
                  <strong style={{color:"var(--ink)"}}>⚡ Reality check:</strong> Adjusted for inflated data, realistic range is <span style={{fontFamily:"var(--fm)",fontWeight:700,color:"var(--you)"}}>{fmt(a.gameplan.hypeAdjusted?.low,cur)} – {fmt(a.gameplan.hypeAdjusted?.high,cur)}</span>
                </div>
              </div></FI>

              {/* CARD 3: GAME PLAN — dark, bigger fonts, Pro via invite */}
              <FI d={400}><div style={{background:"var(--ink)",borderRadius:14,padding:28,marginBottom:12,color:"#fff"}}>
                <div style={{fontFamily:"var(--fm)",fontSize:10,fontWeight:600,color:"rgba(255,255,255,.3)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:20}}>Your game plan</div>

                {/* 3-number grid */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
                  {[{l:"Ask for",v:a.gameplan.askFor,c:"#60a5fa"},{l:"Aim to land",v:a.gameplan.settleAt,c:"#34d399"},{l:"Don't go below",v:a.gameplan.dontGoBelow,c:"#f87171"}].map(x=>(
                    <div key={x.l} style={{textAlign:"center",padding:"16px 8px",borderRadius:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.07)"}}>
                      <div style={{fontFamily:"var(--fm)",fontSize:18,fontWeight:700,color:x.c,marginBottom:4}}>{fmt(x.v,cur)}</div>
                      <div style={{fontFamily:"var(--fb)",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".06em"}}>{x.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:15,color:"rgba(255,255,255,.5)",lineHeight:1.65,marginBottom:24}}><Bd t={a.gameplan.whyThisNumber} c="rgba(255,255,255,.85)" /></div>

                {/* Tactics — #1 free, rest locked */}
                <div style={{fontFamily:"var(--fb)",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:12}}>Your moves</div>
                {(a.gameplan.tactics||[]).map((tac,i)=>{
                  const isUnlocked = i === 0 || unlockedPro >= 1; /* tac 1 free, rest need 1+ invites OR unlocked scripts */
                  const isLocked = !isUnlocked;
                  return (
                  <div key={i} style={{marginBottom:8}}>
                    <div onClick={()=>isLocked?setShowInvite(true):setOpenTac(openTac===i?-1:i)} style={{background:openTac===i&&!isLocked?"rgba(255,255,255,.09)":"rgba(255,255,255,.04)",border:`1px solid ${openTac===i&&!isLocked?"rgba(255,255,255,.12)":"rgba(255,255,255,.07)"}`,borderRadius:openTac===i&&!isLocked?"10px 10px 0 0":"10px",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",transition:"all 200ms cubic-bezier(0.23,1,0.32,1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontFamily:"var(--fm)",fontSize:12,fontWeight:700,color:isLocked?"rgba(96,165,250,.5)":"#60a5fa",background:isLocked?"rgba(96,165,250,.08)":"rgba(96,165,250,.15)",padding:"3px 8px",borderRadius:4}}>{i+1}</span>
                        <span style={{fontSize:15,fontWeight:600,color:isLocked?"rgba(255,255,255,.4)":"#fff"}}>{tac.title}</span>
                      </div>
                      {isLocked ? <span style={{fontFamily:"var(--fm)",fontSize:9,fontWeight:700,color:"#60a5fa",background:"rgba(96,165,250,.1)",padding:"3px 10px",borderRadius:999,display:"flex",alignItems:"center",gap:4}}>🔒 INVITE TO UNLOCK</span>
                       : <span style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>{openTac===i?"▴":"▾"}</span>}
                    </div>
                    {openTac===i&&!isLocked && (
                      <div style={{background:"rgba(255,255,255,.09)",border:"1px solid rgba(255,255,255,.12)",borderTop:"none",borderRadius:"0 0 10px 10px",padding:"14px 16px"}}>
                        <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:10}}>⏰ {tac.when}</div>
                        <div style={{background:"rgba(255,255,255,.06)",borderLeft:"2.5px solid #60a5fa",borderRadius:"0 6px 6px 0",padding:"12px 16px",marginBottom:10}}>
                          <div style={{fontFamily:"var(--fd)",fontSize:15,fontStyle:"italic",color:"rgba(255,255,255,.85)",lineHeight:1.65}}>"{tac.script}"</div>
                        </div>
                        <div style={{fontSize:14,color:"rgba(255,255,255,.45)",lineHeight:1.55}}><strong style={{color:"rgba(255,255,255,.75)"}}>Why:</strong> {tac.why}</div>
                      </div>
                    )}
                  </div>);
                })}

                {/* Watch out — always free */}
                {a.gameplan.watchOut&&a.gameplan.watchOut.length>0 && (
                  <div style={{marginTop:20}}>
                    <div style={{fontFamily:"var(--fb)",fontSize:10,fontWeight:700,color:"#f87171",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Watch out for</div>
                    {a.gameplan.watchOut.map((w,i)=>(
                      <div key={i} style={{display:"flex",gap:8,fontSize:14,color:"rgba(255,255,255,.55)",marginBottom:6}}>
                        <span style={{color:"#f87171",fontSize:9,marginTop:5,flexShrink:0}}>●</span>
                        <span style={{lineHeight:1.55}}>{w}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── PRO: Unlock via invites ─── */}
                <div style={{marginTop:24,background:"linear-gradient(135deg,rgba(96,165,250,.08),rgba(52,211,153,.05))",border:"1px solid rgba(96,165,250,.15)",borderRadius:12,padding:"20px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#60a5fa,#34d399,transparent)",backgroundSize:"200% 100%",animation:"shimmer 3s linear infinite"}} />

                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontFamily:"var(--fm)",fontSize:10,fontWeight:700,color:"#60a5fa",letterSpacing:".08em"}}>PRO PLAYBOOK</span>
                  </div>
                  <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:300,color:"rgba(255,255,255,.85)",lineHeight:1.35,marginBottom:4}}>
                    Invite friends. <span style={{fontWeight:700,fontStyle:"italic"}}>Unlock everything.</span>
                  </div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,.4)",lineHeight:1.55,marginBottom:16}}>
                    Each friend who checks their salary unlocks a Pro feature for you. 4 invites = full playbook.
                  </div>

                  {/* Progress */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:16}}>
                    {proFeatures.map((pf,i)=>(
                      <div key={pf.id} style={{padding:"10px 8px",borderRadius:8,background:i<unlockedPro?"rgba(52,211,153,.12)":"rgba(255,255,255,.04)",border:`1px solid ${i<unlockedPro?"rgba(52,211,153,.2)":"rgba(255,255,255,.06)"}`,textAlign:"center",transition:"all 300ms"}}>
                        <div style={{fontSize:18,marginBottom:4,filter:i<unlockedPro?"none":"grayscale(1) opacity(.4)"}}>{pf.icon}</div>
                        <div style={{fontSize:10,fontWeight:600,color:i<unlockedPro?"#34d399":"rgba(255,255,255,.3)",lineHeight:1.3}}>{i<unlockedPro?"Unlocked":pf.title}</div>
                      </div>
                    ))}
                  </div>

                  {/* Invite progress bar */}
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                    <div style={{flex:1,height:6,background:"rgba(255,255,255,.06)",borderRadius:3}}>
                      <div style={{width:`${(unlockedPro/4)*100}%`,height:"100%",background:"linear-gradient(90deg,#60a5fa,#34d399)",borderRadius:3,transition:"width 500ms cubic-bezier(0.23,1,0.32,1)"}} />
                    </div>
                    <span style={{fontFamily:"var(--fm)",fontSize:11,fontWeight:700,color:"rgba(255,255,255,.4)"}}>{unlockedPro}/4</span>
                  </div>

                  {/* CTA Button — NOT waitlist, action-oriented */}
                  <button onClick={()=>setShowInvite(true)} style={{width:"100%",padding:"14px",fontFamily:"var(--fb)",fontSize:15,fontWeight:700,color:"#0a0f1a",background:"linear-gradient(135deg,#60a5fa,#34d399)",border:"none",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    🚀 Invite a friend & unlock next feature
                  </button>
                </div>

                {/* Confidence */}
                {a.confidence && (
                  <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid rgba(255,255,255,.06)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{fontFamily:"var(--fm)",fontSize:14,fontWeight:700,color:"#60a5fa"}}>{a.confidence.score}%</div>
                      <div style={{flex:1,height:4,background:"rgba(255,255,255,.08)",borderRadius:2}}>
                        <div style={{width:`${a.confidence.score}%`,height:"100%",background:"linear-gradient(90deg,#60a5fa,#93c5fd)",borderRadius:2}} />
                      </div>
                    </div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginTop:6,lineHeight:1.5}}>{a.confidence.note}</div>
                  </div>
                )}
              </div></FI>

              {/* ═══ INVITE MODAL ═══ */}
              {showInvite && (
                <div style={{position:"fixed",inset:0,background:"rgba(10,15,26,.6)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setShowInvite(false)}>
                  <FI><div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:32,maxWidth:440,width:"100%",textAlign:"center",boxShadow:"0 24px 80px rgba(10,15,26,.15)"}}>
                    <div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#dbeafe,#d1fae5)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24}}>🎁</div>
                    <div style={{fontFamily:"var(--fd)",fontSize:24,fontWeight:200,marginBottom:4}}>
                      Share the love, <span style={{fontWeight:700,fontStyle:"italic"}}>unlock the power</span>
                    </div>
                    <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.65,marginBottom:24}}>
                      When a friend checks their salary using your link, you both win — they get smart insights, you unlock Pro features.
                    </p>

                    {/* What they unlock */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20,textAlign:"left"}}>
                      {proFeatures.map((pf,i)=>(
                        <div key={pf.id} style={{padding:"10px 12px",borderRadius:8,background:i<unlockedPro?"#f0fdf4":"var(--surface)",border:`1px solid ${i<unlockedPro?"#bbf7d0":"var(--border)"}`,display:"flex",gap:8,alignItems:"flex-start"}}>
                          <span style={{fontSize:15,flexShrink:0,marginTop:1}}>{i<unlockedPro?"✅":pf.icon}</span>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:i<unlockedPro?"var(--up)":"var(--ink)"}}>{pf.title}</div>
                            <div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{i<unlockedPro?"Unlocked!":pf.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Invite link + copy */}
                    <div style={{display:"flex",gap:8,marginBottom:12}}>
                      <div style={{flex:1,padding:"11px 14px",fontFamily:"var(--fm)",fontSize:12,color:"var(--slate)",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,textAlign:"left",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>knowyourpay.in?ref=invite</div>
                      <button onClick={copyInviteLink} style={{padding:"11px 18px",fontFamily:"var(--fb)",fontSize:13,fontWeight:700,color:"#fff",background:inviteCopied?"var(--up)":"var(--ink)",border:"none",borderRadius:8,cursor:"pointer",transition:"all 200ms",whiteSpace:"nowrap"}}>{inviteCopied?"Copied! ✓":"Copy link"}</button>
                    </div>

                    {/* Quick share buttons */}
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>handleShare("whatsapp")} style={{flex:1,padding:"10px",fontSize:12,fontWeight:600,color:"#fff",background:"#25D366",border:"none",borderRadius:8,cursor:"pointer"}}>WhatsApp</button>
                      <button onClick={()=>handleShare("twitter")} style={{flex:1,padding:"10px",fontSize:12,fontWeight:600,color:"#fff",background:"#0a0f1a",border:"none",borderRadius:8,cursor:"pointer"}}>𝕏 / Twitter</button>
                      <button onClick={()=>handleShare("linkedin")} style={{flex:1,padding:"10px",fontSize:12,fontWeight:600,color:"#fff",background:"#0a66c2",border:"none",borderRadius:8,cursor:"pointer"}}>LinkedIn</button>
                    </div>

                    <div style={{marginTop:16,fontSize:11,color:"var(--faint)",lineHeight:1.5}}>
                      Your invite link is unique. Each friend who completes an analysis unlocks one Pro feature for you.
                    </div>
                  </div></FI>
                </div>
              )}

              {/* ═══ SHARE SECTION — Product promo, not personal data ═══ */}
              <FI d={500}><div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:24,marginBottom:12,boxShadow:"0 4px 24px rgba(10,15,26,.06)"}}>
                <div style={{fontFamily:"var(--fm)",fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--accent)",marginBottom:6}}>Spread the word</div>
                <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:200,marginBottom:4}}>
                  Know someone switching jobs? <span style={{fontWeight:700,fontStyle:"italic"}}>They need this.</span>
                </div>
                <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.55,marginBottom:16}}>Share the tool (not your report) and unlock Pro features when friends use it.</div>

                {shareImg && <div style={{marginBottom:16}}>
                  <img src={shareImg} alt="Share card" style={{width:"100%",borderRadius:10,border:"1px solid var(--border)"}} />
                </div>}

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                  <button onClick={()=>handleShare("whatsapp")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px",fontFamily:"var(--fb)",fontSize:13,fontWeight:700,color:"#fff",background:"#25D366",border:"none",borderRadius:8,cursor:"pointer"}}>WhatsApp</button>
                  <button onClick={()=>handleShare("twitter")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px",fontFamily:"var(--fb)",fontSize:13,fontWeight:700,color:"#fff",background:"#0a0f1a",border:"none",borderRadius:8,cursor:"pointer"}}>𝕏</button>
                  <button onClick={()=>handleShare("linkedin")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px",fontFamily:"var(--fb)",fontSize:13,fontWeight:700,color:"#fff",background:"#0a66c2",border:"none",borderRadius:8,cursor:"pointer"}}>LinkedIn</button>
                </div>
                <button onClick={downloadShareCard} style={{width:"100%",padding:"11px",fontFamily:"var(--fb)",fontSize:12,fontWeight:600,color:"var(--muted)",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  ⬇ Download image to share anywhere
                </button>

                {/* Invite nudge */}
                <div style={{marginTop:14,padding:"12px 16px",background:"linear-gradient(135deg,#eff6ff,#f0fdf4)",border:"1px solid #dbeafe",borderRadius:10,display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:20}}>🎁</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>Each invite = 1 Pro feature unlocked</div>
                    <div style={{fontSize:12,color:"var(--muted)"}}>4 friends → full playbook with email templates, scripts & timeline</div>
                  </div>
                  <button onClick={()=>setShowInvite(true)} style={{padding:"8px 14px",fontFamily:"var(--fb)",fontSize:12,fontWeight:700,color:"var(--accent)",background:"#fff",border:"1.5px solid var(--accent)",borderRadius:7,cursor:"pointer",whiteSpace:"nowrap"}}>Invite</button>
                </div>
              </div></FI>

              {/* Start over */}
              <FI d={600}><div style={{textAlign:"center",paddingBottom:20}}>
                <button onClick={reset} style={{fontFamily:"var(--fb)",fontSize:14,fontWeight:600,color:"var(--ink)",background:"transparent",border:"1.5px solid var(--border)",borderRadius:9,padding:"13px 32px",cursor:"pointer"}}>Run another analysis</button>
                <div style={{marginTop:12,fontSize:11,color:"var(--faint)"}}>🔒 Your data wasn't saved. Run as many times as you like.</div>
              </div></FI>
            </div>}
          </div>
        </div>
      )}
    </div>
  );
}