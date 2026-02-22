import { useState, useEffect, useRef, useMemo } from "react";
import { signInWithGoogle } from "./firebase";

/* ═══ KNOWYOURPAY V3 ═══
   A) Anti-gaming: all inputs controlled (dropdowns/typeahead/chips), gibberish blocked
   B) Plain language: no p25/p50/percentile jargon
   C) Pro UI restored: invite-to-unlock for tactics 2-4
   D) Share card: brand-premium, social-currency worthy
   E) Light theme with subtle gradient bg, system-aware toggle
   F) Logo = typeface only (no hex icon), footer = "Rinks" (witty)
   G) Prompt moved to /api/analyze route (Vercel)
   H) Meta/OG/favicon planned
   I) Landing hero: punchy copy
*/

/* ─── Config ─── */
const SK = "kyp_v3", UK = "kyp_u_v3";

/* ─── Structured Data (anti-gaming: all controlled inputs) ─── */
const ROLES = [
  /* Engineering */
  "Software Engineer", "Senior Software Engineer", "Staff Engineer", "Principal Engineer", "Distinguished Engineer",
  "Frontend Engineer", "Senior Frontend Engineer", "Backend Engineer", "Senior Backend Engineer",
  "Full Stack Engineer", "Senior Full Stack Engineer", "Mobile Engineer (iOS)", "Mobile Engineer (Android)",
  "DevOps Engineer", "Senior DevOps Engineer", "SRE", "Platform Engineer", "Cloud Engineer",
  "Security Engineer", "Embedded Engineer", "Firmware Engineer", "Systems Engineer",
  "QA Engineer", "Senior QA Engineer", "SDET", "Automation Engineer",
  "Engineering Manager", "Senior Engineering Manager", "Director of Engineering", "VP Engineering", "SVP Engineering", "CTO",
  /* Data & AI */
  "Data Scientist", "Senior Data Scientist", "Staff Data Scientist", "Principal Data Scientist",
  "Data Analyst", "Senior Data Analyst", "Business Intelligence Analyst",
  "Data Engineer", "Senior Data Engineer", "ML Engineer", "Senior ML Engineer", "MLOps Engineer",
  "AI Engineer", "AI Research Scientist", "NLP Engineer", "Computer Vision Engineer",
  "Analytics Manager", "Head of Data", "Director of Data Science", "VP Data", "Chief Data Officer",
  /* Product */
  "Product Manager", "Senior Product Manager", "Lead Product Manager", "Group PM", "Principal PM",
  "Associate Product Manager", "Technical Product Manager",
  "Director of Product", "VP Product", "SVP Product", "CPO", "Head of Product",
  "Product Analyst", "Product Operations Manager",
  /* Design */
  "UX Designer", "Senior UX Designer", "UI Designer", "Senior UI Designer",
  "Product Designer", "Senior Product Designer", "Staff Product Designer", "Principal Designer",
  "UX Researcher", "Senior UX Researcher", "Lead UX Researcher",
  "Visual Designer", "Brand Designer", "Motion Designer", "Interaction Designer",
  "Design Manager", "Senior Design Manager", "Director of Design", "VP Design", "Head of Design", "CDO",
  "Design System Lead", "Content Designer", "UX Writer",
  /* Marketing */
  "Marketing Manager", "Senior Marketing Manager", "Marketing Lead",
  "Digital Marketing Manager", "Performance Marketing Manager", "Growth Marketing Manager",
  "Content Marketing Manager", "Senior Content Marketer", "Content Strategist", "Content Lead",
  "SEO Manager", "Senior SEO Specialist", "SEM Manager",
  "Social Media Manager", "Community Manager", "Brand Manager", "Senior Brand Manager",
  "Product Marketing Manager", "Senior PMM", "Director of PMM", "Head of PMM",
  "Growth Manager", "Senior Growth Manager", "Head of Growth", "VP Growth",
  "Marketing Analyst", "Marketing Operations Manager",
  "Director of Marketing", "VP Marketing", "CMO", "Head of Marketing",
  /* Sales */
  "Sales Development Rep (SDR)", "Business Development Rep (BDR)",
  "Account Executive", "Senior Account Executive", "Enterprise Account Executive",
  "Inside Sales Manager", "Sales Manager", "Senior Sales Manager", "Regional Sales Manager",
  "Business Development Manager", "Senior BDM", "Partnership Manager", "Channel Sales Manager",
  "Sales Engineer", "Solutions Consultant", "Pre-Sales Consultant",
  "Account Manager", "Senior Account Manager", "Key Account Manager",
  "Customer Success Manager", "Senior CSM", "Director of CS", "VP Customer Success",
  "Director of Sales", "VP Sales", "SVP Sales", "Head of Sales", "CRO",
  /* HR / People */
  "HR Manager", "Senior HR Manager", "HR Business Partner", "Senior HRBP",
  "Talent Acquisition Manager", "Senior Recruiter", "Technical Recruiter", "Recruitment Lead", "Head of TA",
  "People Operations Manager", "HR Operations Specialist", "Compensation & Benefits Manager",
  "L&D Manager", "Training Manager", "Organizational Development Manager",
  "Employee Experience Manager", "Culture Manager", "DEI Manager",
  "Director of HR", "VP People", "VP HR", "Head of People", "CHRO",
  /* Finance */
  "Financial Analyst", "Senior Financial Analyst", "FP&A Analyst", "Senior FP&A Analyst", "FP&A Manager",
  "Finance Manager", "Senior Finance Manager", "Controller", "Assistant Controller",
  "Accounts Manager", "Tax Manager", "Treasury Manager", "Revenue Operations Manager",
  "Internal Auditor", "Risk Analyst", "Compliance Manager",
  "Director of Finance", "VP Finance", "Head of Finance", "CFO",
  /* Operations / Strategy */
  "Operations Manager", "Senior Operations Manager", "Business Operations Manager",
  "Program Manager", "Senior Program Manager", "Technical Program Manager", "TPM Lead",
  "Project Manager", "Senior Project Manager", "Delivery Manager", "Scrum Master", "Agile Coach",
  "Strategy Manager", "Chief of Staff", "Business Strategy Manager",
  "Supply Chain Manager", "Procurement Manager", "Vendor Manager",
  "Director of Operations", "VP Operations", "COO", "Head of Operations",
  /* Legal / Other */
  "Legal Counsel", "Senior Legal Counsel", "Head of Legal", "General Counsel",
  "Business Analyst", "Senior Business Analyst", "Management Consultant", "Strategy Consultant",
  "Solutions Architect", "Enterprise Architect", "Technical Architect",
  "Technical Writer", "Documentation Manager",
  "Customer Support Manager", "Support Lead", "Head of Support",
  "Founder / Co-Founder", "General Manager",
  "Other"
];

const LEVELS = [
  { v: "ic-junior", l: "Individual Contributor · Junior (0-2 yrs)" },
  { v: "ic-mid", l: "Individual Contributor · Mid (2-5 yrs)" },
  { v: "ic-senior", l: "Individual Contributor · Senior (5-8 yrs)" },
  { v: "ic-staff", l: "Individual Contributor · Staff/Principal (8+ yrs)" },
  { v: "mgr-first", l: "Manager · First-time (team of 3-8)" },
  { v: "mgr-senior", l: "Manager · Senior (team of 8-20)" },
  { v: "dir", l: "Director / Head of (20-50 people)" },
  { v: "vp", l: "VP / SVP" },
  { v: "c-suite", l: "C-Suite (CTO / CPO / CFO)" },
];

const CITIES = ["Bangalore", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Gurgaon", "Noida", "Indore", "Jaipur", "Kochi", "Chandigarh", "Lucknow", "Nagpur", "Coimbatore", "Thiruvananthapuram", "Vadodara", "Visakhapatnam", "Bhubaneswar", "Mysore", "Mangalore", "Surat", "Bhopal", "Dehradun", "Goa", "Remote (India)"];
const INDS = ["SaaS / B2B Tech", "Consumer Tech", "Fintech", "Healthtech", "Edtech", "E-commerce", "AI / ML", "Gaming", "D2C / Retail", "Consulting", "BFSI / Banking", "Manufacturing", "Media & Entertainment", "Logistics", "Pharma / Biotech", "Telecom", "Other"];
const STGS = [{ v: "seed", l: "Seed / Pre-Series A" }, { v: "early", l: "Series A–B" }, { v: "growth", l: "Series C–D" }, { v: "late", l: "Late / Pre-IPO" }, { v: "public", l: "Public / Listed" }, { v: "mnc", l: "MNC / Enterprise" }, { v: "bootstrap", l: "Bootstrapped" }];
const CTRY = ["India", "United States", "United Kingdom", "Canada", "Germany", "Singapore", "UAE", "Australia"];
const LOAD_STAGES = [
  { icon: "\ud83d\udd0d", title: "Scanning market data", sub: "Comparing your profile against thousands of similar roles", dur: 6 },
  { icon: "\ud83d\udcca", title: "Building salary range", sub: "Mapping compensation across company stages & cities", dur: 7 },
  { icon: "\ud83c\udfaf", title: "Analyzing your position", sub: "Where you stand vs. the market for your experience", dur: 6 },
  { icon: "\ud83d\udca1", title: "Crafting negotiation scripts", sub: "Building word-for-word scripts for your situation", dur: 8 },
  { icon: "\ud83d\udccb", title: "Finalizing game plan", sub: "Your ask, settle, and walk-away numbers", dur: 6 },
];
const NEG_TIPS = [
  { q: "Never say your number first.", a: "Let them anchor. Ask: \"What\u2019s the budgeted range for this role?\" \u2014 forces them to show cards." },
  { q: "Silence is a weapon.", a: "After they name a number, pause for 5 seconds. They\u2019ll often improve the offer to fill the silence." },
  { q: "Always negotiate on email first.", a: "It removes pressure and gives you time to craft the perfect response. Never negotiate live unprepared." },
  { q: "Competing offers change everything.", a: "Even if you prefer Company A, mentioning Company B\u2019s offer shifts the power dynamic entirely." },
  { q: "The first offer is never the best.", a: "Companies budget 10-20% above their initial offer. Accepting immediately = leaving money on the table." },
  { q: "Don\u2019t just negotiate salary.", a: "Title bumps, ESOP refreshes, signing bonuses, remote flexibility \u2014 sometimes easier wins than base pay." },
]
const SALARY_RANGES = { INR: [{ v: "under-5", l: "Under ₹5 Lakhs" }, { v: "5-10", l: "₹5–10 Lakhs" }, { v: "10-20", l: "₹10–20 Lakhs" }, { v: "20-35", l: "₹20–35 Lakhs" }, { v: "35-50", l: "₹35–50 Lakhs" }, { v: "50-75", l: "₹50–75 Lakhs" }, { v: "75-100", l: "₹75L–1 Crore" }, { v: "100-plus", l: "₹1 Crore+" }], USD: [{ v: "under-50", l: "Under $50K" }, { v: "50-80", l: "$50–80K" }, { v: "80-120", l: "$80–120K" }, { v: "120-180", l: "$120–180K" }, { v: "180-250", l: "$180–250K" }, { v: "250-plus", l: "$250K+" }], GBP: [{ v: "under-40", l: "Under £40K" }, { v: "40-60", l: "£40–60K" }, { v: "60-90", l: "£60–90K" }, { v: "90-130", l: "£90–130K" }, { v: "130-plus", l: "£130K+" }] };
const EXP_RANGES = [{ v: "0-1", l: "0–1 years" }, { v: "1-3", l: "1–3 years" }, { v: "3-5", l: "3–5 years" }, { v: "5-8", l: "5–8 years" }, { v: "8-12", l: "8–12 years" }, { v: "12-15", l: "12–15 years" }, { v: "15-plus", l: "15+ years" }];
const COMPANIES = [
  /* ── Global Big Tech ── */
  "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Alphabet", "X (Twitter)", "Tesla", "OpenAI", "Anthropic", "DeepMind", "xAI",
  "Nvidia", "Intel", "AMD", "Qualcomm", "Broadcom", "ARM", "IBM", "Samsung", "TSMC", "Sony", "LG",
  "Salesforce", "Adobe", "Intuit", "ServiceNow", "Workday", "Veeva", "Zendesk", "HubSpot", "Twilio",
  "Databricks", "Snowflake", "Datadog", "Cloudflare", "Confluent", "HashiCorp", "PagerDuty", "Splunk",
  "Atlassian", "GitLab", "GitHub", "Figma", "Notion", "Canva", "Miro", "Linear", "Loom", "Airtable",
  "Monday.com", "Asana", "Slack", "Zoom", "Webex", "Dropbox", "Box", "DocuSign",
  "Shopify", "Squarespace", "Wix", "Webflow", "BigCommerce", "WooCommerce",
  "Stripe", "Square", "Plaid", "Brex", "Rippling", "Deel", "Gusto", "Carta", "Ramp",
  "Elastic", "MongoDB", "Redis", "CockroachDB", "PlanetScale", "Supabase", "Neon",
  "Vercel", "Netlify", "Heroku", "DigitalOcean", "Fastly", "Akamai", "Zscaler",
  "CrowdStrike", "Palo Alto Networks", "SentinelOne", "Okta", "Ping Identity",
  "UiPath", "Automation Anywhere", "Scale AI", "Palantir", "C3.ai", "Cohere",
  "Spotify", "Pinterest", "Snap", "Reddit", "Discord", "Roblox", "Epic Games", "Unity",
  "Uber", "Lyft", "Grab", "Gojek", "DoorDash", "Instacart", "Airbnb", "Booking.com", "Expedia",
  "Coinbase", "Binance", "Revolut", "Wise", "PayPal", "Adyen", "Klarna", "Chime",
  "ByteDance", "TikTok", "Baidu", "Alibaba", "Tencent", "Meituan", "JD.com",
  "Oracle", "SAP", "Cisco", "VMware", "Dell", "HP", "Lenovo", "Ericsson", "Nokia",
  "Siemens", "Bosch", "Honeywell", "GE", "Philips", "ABB",
  "McKinsey", "BCG", "Bain", "Oliver Wyman", "Kearney", "Strategy&", "AT Kearney",
  "Goldman Sachs", "JP Morgan", "Morgan Stanley", "Deutsche Bank", "Barclays", "Citi", "HSBC", "UBS", "Credit Suisse",
  /* ── Indian Unicorns & Top Startups ── */
  "Flipkart", "Meesho", "Nykaa", "Mamaearth", "Myntra", "AJIO",
  "Swiggy", "Zomato", "Dunzo", "BlinkIt", "Zepto", "BigBasket", "JioMart",
  "Delhivery", "Shiprocket", "Shadowfax", "XpressBees", "Ecom Express", "Blue Dart",
  "Razorpay", "PhonePe", "Paytm", "CRED", "BharatPe", "Pine Labs", "Juspay",
  "Cashfree", "Decentro", "Setu", "M2P Fintech", "Simpl", "LazyPay", "Slice",
  "Zerodha", "Groww", "upstox", "Angel One", "Dhan", "INDmoney", "Smallcase",
  "ET Money", "Kuvera", "Fisdom", "Scripbox", "Motilal Oswal", "Sharekhan",
  "Navi", "KreditBee", "MoneyView", "PaySense", "Early Salary", "Fibe",
  "Jupiter", "Fi Money", "Open", "RazorpayX",
  "Dream11", "MPL", "Games24x7", "Winzo", "Nazara",
  "Unacademy", "upGrad", "Byju's", "Vedantu", "Physics Wallah", "Scaler", "Coding Ninjas",
  "Toppr", "Simplilearn", "Great Learning", "Coursera India",
  "OYO", "MakeMyTrip", "Cleartrip", "ixigo", "EaseMyTrip", "Yatra", "Airbnb India",
  "Ola", "Rapido", "Porter", "Urban Company", "Apna", "Housejoy",
  "Cars24", "CarDekho", "Spinny", "OLX Autos", "Park+", "Tata Motors EV",
  "Ather Energy", "Ola Electric", "Simple Energy", "River EV", "Bounce",
  "Cure.fit (Cult)", "Practo", "PharmEasy", "Tata 1mg", "Innovaccer", "Pristyn Care",
  "Healthifyme", "MFine", "Portea", "Niramai", "Sigtuple", "Redcliffe Labs",
  "ShareChat", "Dailyhunt", "InShorts", "Lokal", "Josh", "Moj", "Stage",
  "Lenskart", "boAt", "Noise", "Boat Lifestyle", "Purplle", "Sugar Cosmetics", "Pilgrim",
  "FirstCry", "Hopscotch", "Limeroad", "Pepperfry", "Urban Ladder", "Livspace", "Furlenco",
  "PolicyBazaar", "Acko", "Digit Insurance", "Toffee Insurance", "Riskcovry",
  "Khatabook", "Vyapar", "OkCredit", "Hisaab",
  /* ── Indian B2B / SaaS / Dev Tools ── */
  "Zoho", "Freshworks", "Chargebee", "Postman", "BrowserStack", "Hasura", "Druva",
  "Icertis", "MoEngage", "CleverTap", "WebEngage", "Netcore", "Haptik", "Yellow.ai",
  "Whatfix", "Leena AI", "Darwinbox", "Keka HR", "greytHR", "HROne", "Zimyo",
  "Saasfin", "Vyapar", "ClearTax", "TaxBuddy", "Quicko",
  "Capillary Technologies", "Manthan", "Fractal Analytics", "LatentView Analytics",
  "Mu Sigma", "Absolutdata", "Tiger Analytics", "ThoughtWorks India",
  "Mindtickle", "Browserstack", "Wingify", "Contus", "Ozonetel", "Exotel",
  "Agora", "100ms", "Dyte", "Vonage India", "Plivo",
  "Polygon", "CoinDCX", "CoinSwitch", "WazirX", "Mudrex", "BitBns",
  /* ── Indian IT Services ── */
  "Infosys", "TCS", "Wipro", "HCL Technologies", "Tech Mahindra", "LTIMindtree",
  "Mphasis", "Persistent Systems", "Hexaware", "Sonata Software", "Cyient", "NIIT Technologies",
  "L&T Technology Services", "Tata Elxsi", "Kyndryl India", "Concentrix India",
  /* ── Global IT / Consulting (India offices) ── */
  "Cognizant", "Capgemini", "Accenture", "Deloitte", "EY", "PwC", "KPMG",
  "EPAM", "GlobalLogic", "Publicis Sapient", "Sapient", "ThoughtWorks", "Xoriant",
  /* ── Indian Conglomerates & MNCs ── */
  "Reliance Industries", "Jio Platforms", "JioSaavn", "JioCinema", "Jio Financial",
  "Tata Group", "Tata Digital", "Tata Play", "Tata Neu", "Tata Capital",
  "Aditya Birla Group", "Paytm Money", "Mahindra Group", "Godrej", "ITC", "Hindustan Unilever",
  "HDFC Bank", "HDFC Ltd", "ICICI Bank", "Kotak Mahindra", "Axis Bank", "SBI", "PNB",
  "Bajaj Finserv", "Bajaj Finance", "Zerodha", "IDFC First Bank", "Yes Bank",
  "Maruti Suzuki", "Tata Motors", "Mahindra Electric",
  "Swiggy Instamart", "Reliance Retail", "DMart", "Westside", "Zudio",
  /* ── Emerging & Niche ── */
  "Postman", "Setu", "Nua", "The Good Glamm Group", "Mamaearth", "Plum",
  "Bombay Shaving Company", "WOW Skin Science", "Minimalist", "Dot & Key",
  "Mensa Brands", "GlobalBees", "Mensa Retail",
  "EduFi", "Krazybee", "Freo", "SmartCoin",
  "Medfin", "Clinikk", "Medi Assist", "Care Health Insurance",
  "Nobroker", "Housing.com", "99acres", "MagicBricks", "PropTiger",
  "ClimateChange.ai", "GreenBrilliance", "Cleantech Solar", "SolarSquare",
  "Other"
];

const PRO_FEATS = [{ id: "scripts", icon: "🎯", title: "3 extra negotiation scripts", desc: "Competing offer, silence, deadline" }, { id: "email", icon: "📧", title: "Counter-offer email template", desc: "Copy-paste negotiation email" }, { id: "levers", icon: "💰", title: "Bonus lever strategies", desc: "Non-salary items to negotiate" }, { id: "timeline", icon: "📅", title: "Week-by-week timeline", desc: "When to make each move" }];

/* ─── Helpers ─── */
const numW = (n, c = "INR") => { if (!n || isNaN(n)) return ""; const v = +n; if (c === "INR") { if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`; if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)} L`; return `₹${(v / 1000).toFixed(1)}K` } const s = c === "GBP" ? "£" : "$"; return v >= 1e6 ? `${s}${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${s}${(v / 1000).toFixed(0)}K` : `${s}${v}` };
const fmt = (v, c = "INR") => { if (!v) return ""; const n = +v; if (c === "INR") { if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`; if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`; return `₹${n.toLocaleString("en-IN")}` } return c === "GBP" ? (n >= 1000 ? `£${(n / 1000).toFixed(0)}K` : `£${n}`) : (n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`) };
const Bd = ({ t, c }) => { if (!t) return null; const p = t.split(/\*\*(.*?)\*\*/g); return <>{p.map((x, i) => i % 2 === 1 ? <strong key={i} style={{ color: c || "var(--ink)", fontWeight: 700 }}>{x}</strong> : <span key={i}>{x}</span>)}</> };
const FI = ({ children, d = 0 }) => { const [v, setV] = useState(false); useEffect(() => { const t = setTimeout(() => setV(true), d); return () => clearTimeout(t) }, [d]); return <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(14px)", transition: "all 550ms cubic-bezier(.23,1,.32,1)" }}>{children}</div> };
const useM = () => { const [m, s] = useState(false); useEffect(() => { const c = () => s(window.innerWidth < 640); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c) }, []); return m };
/* Smart share: uses Web Share API with image on mobile, falls back to URL */
const doShare = async (platform, shareImgDataUrl) => {
  const text = "I just found out if I'm being paid what I'm worth. Took 3 min. Free. Anonymous.";
  const url = "https://knowyourpay.in";
  /* Try native Web Share API first (works on mobile for WhatsApp, etc.) */
  if (platform === "native" && navigator.share) {
    try {
      const shareData = { title: "KnowYourPay", text, url };
      /* Attach image as a file if available + browser supports sharing files */
      if (shareImgDataUrl && navigator.canShare) {
        const res = await fetch(shareImgDataUrl);
        const blob = await res.blob();
        const file = new File([blob], "knowyourpay.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) { shareData.files = [file]; }
      }
      await navigator.share(shareData);
      return;
    } catch (e) { /* user cancelled or not supported — fall through */ }
  }
  const m = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + "\n\n" + url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  };
  if (m[platform]) window.open(m[platform], "_blank", "noopener,noreferrer");
};


/* ─── Brand (F: typeface-only logo, no hex icon) ─── */
const Logo = ({ s = 16, dk }) => <span style={{ fontFamily: "var(--fd)", fontSize: s, letterSpacing: "-.01em" }}>
  <span style={{ fontWeight: 200, color: dk ? "rgba(255,255,255,.5)" : "var(--muted)" }}>Know</span>
  <span style={{ fontWeight: 600, fontStyle: "italic", color: dk ? "#60a5fa" : "var(--accent)" }}>Your</span>
  <span style={{ fontWeight: 700, fontStyle: "italic", color: dk ? "#fff" : "var(--ink)" }}>Pay</span>
</span>;

const Pill = ({ text, color, bg }) => <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontFamily: "var(--fb)", fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>{text}</span>;

/* (F: witty footer, correct name "Rinks") */
const Ft = () => <div style={{ textAlign: "center", padding: "32px 20px 24px", borderTop: "1px solid var(--border)" }}>
  <div style={{ fontSize: 12, color: "var(--faint)", fontFamily: "var(--fb)", lineHeight: 1.6 }}>
    <span>brewed on caffeine & Claude by </span><span style={{ fontWeight: 600, color: "var(--muted)" }}>Rinks</span>
    <span style={{ margin: "0 6px", opacity: .3 }}>·</span>
    <span style={{ fontStyle: "italic", opacity: .6 }}>because you deserve to know</span>
  </div>
</div>;


/* ─── Form Controls ─── */
const LBL = ({ children }) => <label style={{ display: "block", fontFamily: "var(--fb)", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 7 }}>{children}</label>;

const SEL = ({ label, value, onChange, options, ph, sub }) => <div style={{ marginBottom: 20 }}>
  <LBL>{label}{sub && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 5, opacity: .7 }}>{sub}</span>}</LBL>
  <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "13px 14px", fontFamily: "var(--fb)", fontSize: 16, fontWeight: 500, color: value ? "var(--ink)" : "var(--faint)", background: "var(--input-bg)", border: "1.5px solid var(--border)", borderRadius: 10, outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none", boxSizing: "border-box", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
    <option value="" disabled>{ph || "Select..."}</option>
    {options.map(o => <option key={o.v || o.value || o} value={o.v || o.value || o}>{o.l || o.label || o}</option>)}
  </select>
</div>;

/* (A) Typeahead — strict allow-list, no free text leaks */
const TypeSel = ({ label, value, onChange, options, ph }) => {
  const [open, setOpen] = useState(false), [q, setQ] = useState(""), [custom, setCustom] = useState("");
  const ref = useRef(null);
  const fl = useMemo(() => !q ? options.slice(0, 15) : options.filter(o => o.toLowerCase().includes(q.toLowerCase())).slice(0, 12), [q, options]);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }; document.addEventListener("mousedown", h); document.addEventListener("touchstart", h); return () => { document.removeEventListener("mousedown", h); document.removeEventListener("touchstart", h) } }, []);
  const pick = (v) => { onChange(v); setQ(""); setOpen(false); setCustom("") };
  const isOther = value === "Other";
  return <div style={{ marginBottom: 20, position: "relative" }} ref={ref}>
    <LBL>{label}</LBL>
    {!value ? <>
      <input type="text" value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder={ph || "Search..."}
        style={{ width: "100%", padding: "13px 14px", fontFamily: "var(--fb)", fontSize: 16, fontWeight: 500, color: "var(--ink)", background: "var(--input-bg)", border: "1.5px solid var(--border)", borderRadius: 10, outline: "none", boxSizing: "border-box" }} />
      {open && fl.length > 0 && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, marginTop: 4, background: "var(--card-bg)", border: "1.5px solid var(--border)", borderRadius: 12, boxShadow: "0 12px 40px rgba(10,15,26,.12)", maxHeight: 240, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {fl.map(o => <div key={o} onClick={() => pick(o)} style={{ padding: "12px 16px", fontSize: 15, fontWeight: 500, color: "var(--ink)", cursor: "pointer", borderBottom: "1px solid var(--border)" }}
          onMouseEnter={e => e.target.style.background = "var(--surface)"} onMouseLeave={e => e.target.style.background = "transparent"}>{o}</div>)}
      </div>}
    </> : <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{ flex: 1, padding: "12px 14px", fontFamily: "var(--fb)", fontSize: 15, fontWeight: 600, color: "var(--ink)", background: "var(--accent-l)", border: "1.5px solid var(--accent)", borderRadius: 10 }}>
        {isOther && custom ? custom : value} <span style={{ opacity: .5 }}>✓</span>
      </div>
      <button onClick={() => { onChange(""); setCustom("") }} type="button" style={{ padding: "12px 16px", fontFamily: "var(--fb)", fontSize: 13, fontWeight: 600, color: "var(--muted)", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10, cursor: "pointer" }}>Change</button>
    </div>}
    {isOther && !custom && <div style={{ marginTop: 8 }}>
      <input type="text" value={custom} onChange={e => setCustom(e.target.value)} placeholder="Specify your role..." maxLength={60}
        style={{ width: "100%", padding: "12px 14px", fontFamily: "var(--fb)", fontSize: 15, color: "var(--ink)", background: "var(--input-bg)", border: "1.5px solid var(--border)", borderRadius: 10, outline: "none", boxSizing: "border-box" }} />
    </div>}
  </div>
};

const MC = ({ label, options, sel, onChange, max = 5 }) => <div style={{ marginBottom: 20 }}>
  <LBL>{label} <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, opacity: .7 }}>({sel.length}/{max})</span></LBL>
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {options.map(o => {
      const val = o.v || o.value || o, lab = o.l || o.label || o, on = sel.includes(val);
      return <button key={val} type="button" onClick={() => on ? onChange(sel.filter(s => s !== val)) : sel.length < max && onChange([...sel, val])}
        style={{ padding: "8px 14px", fontFamily: "var(--fb)", fontSize: 13, fontWeight: on ? 700 : 500, color: on ? "#fff" : "var(--slate)", background: on ? "var(--accent)" : "var(--card-bg)", border: on ? "1.5px solid var(--accent)" : "1.5px solid var(--border)", borderRadius: 8, cursor: "pointer", transition: "all 180ms" }}>{on ? "✓ " : ""}{lab}</button>
    })}
  </div>
</div>;

const CityIn = ({ label, value, onChange, country }) => {
  const [open, setOpen] = useState(false), [q, setQ] = useState(value || ""), ref = useRef(null);
  const cs = country === "India" ? CITIES : [], fl = useMemo(() => !q ? cs.slice(0, 12) : cs.filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 10), [q, cs]);
  useEffect(() => setQ(value || ""), [value]);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false) } }; document.addEventListener("mousedown", h); document.addEventListener("touchstart", h); return () => { document.removeEventListener("mousedown", h); document.removeEventListener("touchstart", h) } }, []);
  return <div style={{ marginBottom: 20, position: "relative" }} ref={ref}>
    <LBL>{label}</LBL>
    <input type="text" value={q} onChange={e => { setQ(e.target.value); onChange(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder={country === "India" ? "Search city..." : "e.g. San Francisco"}
      style={{ width: "100%", padding: "13px 14px", fontFamily: "var(--fb)", fontSize: 16, fontWeight: 500, color: "var(--ink)", background: "var(--input-bg)", border: "1.5px solid var(--border)", borderRadius: 10, outline: "none", boxSizing: "border-box" }} />
    {open && fl.length > 0 && country === "India" && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, marginTop: 4, background: "var(--card-bg)", border: "1.5px solid var(--border)", borderRadius: 12, boxShadow: "0 12px 40px rgba(10,15,26,.12)", maxHeight: 220, overflowY: "auto" }}>
      {fl.map(c => <div key={c} onClick={() => { onChange(c); setQ(c); setOpen(false) }} style={{ padding: "12px 16px", fontSize: 15, fontWeight: 500, color: "var(--ink)", cursor: "pointer", borderBottom: "1px solid var(--border)" }}>{c}</div>)}
    </div>}
  </div>
};

const Chip = ({ label, sel, onClick }) => <button onClick={onClick} type="button" style={{ padding: "8px 16px", fontFamily: "var(--fb)", fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? "#fff" : "var(--muted)", background: sel ? "var(--accent)" : "var(--card-bg)", border: sel ? "1.5px solid var(--accent)" : "1.5px solid var(--border)", borderRadius: 8, cursor: "pointer", transition: "all 200ms" }}>{label}</button>;

/* Multi-company: typeahead + free-text for unknowns + multi-select up to max */
const MultiCompany = ({ label, values, onChange, options, max = 3, ph }) => {
  const [open, setOpen] = useState(false), [q, setQ] = useState(""), ref = useRef(null);
  const fl = useMemo(() => {
    if (!q || q.length < 1) return options.filter(o => !values.includes(o)).slice(0, 10);
    const lq = q.toLowerCase();
    return options.filter(o => o.toLowerCase().includes(lq) && !values.includes(o)).slice(0, 10);
  }, [q, options, values]);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }; document.addEventListener("mousedown", h); document.addEventListener("touchstart", h); return () => { document.removeEventListener("mousedown", h); document.removeEventListener("touchstart", h) } }, []);
  const add = (v) => { if (values.length < max && !values.includes(v)) { onChange([...values, v]) } setQ(""); setOpen(false) };
  const remove = (v) => onChange(values.filter(x => x !== v));
  const addCustom = () => { const v = q.trim(); if (v.length >= 2 && values.length < max && !values.includes(v)) { onChange([...values, v]); setQ(""); setOpen(false) } };
  return <div style={{ marginBottom: 20, position: "relative" }} ref={ref}>
    <LBL>{label} <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, opacity: .7 }}>({values.length}/{max})</span></LBL>
    {values.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
      {values.map(v => <span key={v} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontFamily: "var(--fb)", fontSize: 13, fontWeight: 600, color: "var(--accent)", background: "var(--accent-l)", border: "1.5px solid var(--accent)", borderRadius: 8 }}>
        {v}<button type="button" onClick={() => remove(v)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
      </span>)}
    </div>}
    {values.length < max && <>
      <input type="text" value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder={ph || "Search..."} onKeyDown={e => { if (e.key === "Enter" && q.trim().length >= 2) { e.preventDefault(); if (fl.length > 0) add(fl[0]); else addCustom() } }}
        style={{ width: "100%", padding: "13px 14px", fontFamily: "var(--fb)", fontSize: 16, fontWeight: 500, color: "var(--ink)", background: "var(--input-bg)", border: "1.5px solid var(--border)", borderRadius: 10, outline: "none", boxSizing: "border-box" }} />
      {open && q.trim().length >= 1 && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, marginTop: 4, background: "var(--card-bg)", border: "1.5px solid var(--border)", borderRadius: 12, boxShadow: "0 12px 40px rgba(10,15,26,.12)", maxHeight: 240, overflowY: "auto" }}>
        {fl.map(o => <div key={o} onClick={() => add(o)} style={{ padding: "12px 16px", fontSize: 15, fontWeight: 500, color: "var(--ink)", cursor: "pointer", borderBottom: "1px solid var(--border)" }}
          onMouseEnter={e => e.target.style.background = "var(--surface)"} onMouseLeave={e => e.target.style.background = "transparent"}>{o}</div>)}
        {fl.length === 0 && q.trim().length >= 2 && <div onClick={addCustom} style={{ padding: "12px 16px", fontSize: 14, color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>+ Add “{q.trim()}” as custom company</div>}
        {fl.length > 0 && q.trim().length >= 2 && !fl.some(o => o.toLowerCase() === q.trim().toLowerCase()) && <div onClick={addCustom} style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)", cursor: "pointer", borderTop: "1px solid var(--border)" }}>Don’t see it? <span style={{ color: "var(--accent)", fontWeight: 600 }}>Add “{q.trim()}”</span></div>}
      </div>}
    </>}
  </div>
};


/* ═══ BARS (B: plain language, YOU bar visually prominent) ═══ */
const Bars = ({ range, youVal, label, cur, standing, mob, userName }) => {
  const [hov, setHov] = useState(null);
  const all = [
    { k: "low", l: "Low end", tip: "Bottom 25% earn this or less", v: range.p25 },
    { k: "mid", l: "Average", tip: "What most people earn", v: range.p50 },
    { k: "high", l: "Strong", tip: "Top 25% earners", v: range.p75 },
    { k: "top", l: "Top tier", tip: "Top 10%", v: range.p90 }
  ];
  if (youVal > 0) all.push({ k: "you", l: userName || "YOU", tip: "Your salary", v: youVal, isYou: true });
  all.sort((a, b) => a.v - b.v); const mx = Math.max(...all.map(b => b.v)), BH = mob ? 140 : 210;
  return <div style={{ marginBottom: 12 }}>
    <div style={{ fontFamily: "var(--fb)", fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 14 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "flex-end", gap: mob ? 5 : 10, padding: "0 4px" }}>
      {all.map((b, i) => {
        const h = Math.max(Math.round((b.v / mx) * BH), 28), isH = hov === i;
        const yg = standing === "underpaid" ? "linear-gradient(180deg,#fca5a5,#dc2626)" : "linear-gradient(180deg,#93c5fd,#3b82f6)";
        return <div key={b.k} style={{ flex: b.isYou ? 1.3 : 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", position: "relative", minWidth: 0 }}
          onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} onTouchStart={() => setHov(i)} onTouchEnd={() => setTimeout(() => setHov(null), 1500)}>
          {b.isYou && <div style={{ position: "absolute", bottom: h + 30, left: "50%", transform: "translateX(-50%)", background: "var(--you)", color: "#fff", padding: "5px 12px", borderRadius: 8, fontSize: 11, whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 16px rgba(217,119,6,.3)" }}>
            <div style={{ fontFamily: "var(--fm)", fontWeight: 700 }}>{fmt(b.v, cur)}</div>
            <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 8, height: 8, background: "var(--you)" }} /></div>}
          {isH && !b.isYou && <div style={{ position: "absolute", bottom: h + 30, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#fff", padding: "6px 12px", borderRadius: 8, fontSize: 11, whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 16px rgba(10,15,26,.12)" }}>
            <div style={{ fontFamily: "var(--fm)", fontWeight: 700 }}>{fmt(b.v, cur)}</div><div style={{ fontSize: 10, opacity: .55, marginTop: 1 }}>{b.tip}</div>
            <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 8, height: 8, background: "var(--ink)" }} /></div>}
          {!b.isYou && <span style={{ fontFamily: "var(--fm)", fontSize: mob ? 7 : 9, fontWeight: 600, color: "var(--faint)" }}>{fmt(b.v, cur)}</span>}
          {b.isYou && <span style={{ height: mob ? 9 : 11 }} />}
          <div style={{ width: "100%", height: h, background: b.isYou ? yg : "linear-gradient(180deg,rgba(219,234,254,.7),#93c5fd)", borderRadius: "4px 4px 2px 2px", animation: `barGrow 600ms ${b.isYou ? all.length * 100 + 200 : i * 100}ms cubic-bezier(.23,1,.32,1) both`, transformOrigin: "bottom", transition: "transform 120ms", transform: isH ? "scaleY(1.03)" : "scaleY(1)", boxShadow: b.isYou ? "0 0 16px rgba(217,119,6,.35)" : "none", border: b.isYou ? "2px solid var(--you)" : "none", position: "relative" }} />
          <span style={{ fontFamily: "var(--fb)", fontSize: mob ? 8 : 10, fontWeight: b.isYou ? 800 : 600, color: b.isYou ? "var(--you)" : "var(--ghost)", letterSpacing: b.isYou ? ".06em" : ".04em" }}>{b.isYou ? "\u25c6 " : ""}{b.l}</span>
        </div>
      })}
    </div>
  </div>
};


/* ═══ SHARE CARD — mirrors the OG image brand design ═══ */
const makeShareCard = (analysis) => {
  try {
    const W = 1200, H = 630, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const x = cv.getContext("2d");
    /* Background */
    x.fillStyle = "#080d18"; x.fillRect(0, 0, W, H);
    /* Vignette */
    const vig = x.createRadialGradient(W / 2, H / 2, 180, W / 2, H / 2, 900);
    vig.addColorStop(0, "rgba(12,22,44,0)"); vig.addColorStop(1, "rgba(4,8,16,0.55)");
    x.fillStyle = vig; x.fillRect(0, 0, W, H);
    /* Left accent bar */
    const bar = x.createLinearGradient(0, 0, 0, H);
    bar.addColorStop(0, "#3b82f6"); bar.addColorStop(1, "#1e3a6e");
    x.fillStyle = bar; x.fillRect(0, 0, 5, H);
    /* ── Left side ── */
    const LX = 64;
    /* Logo wordmark */
    x.font = "300 17px Georgia,serif"; x.fillStyle = "rgba(255,255,255,0.28)"; x.fillText("Know", LX, 58);
    const w1 = x.measureText("Know").width;
    x.font = "italic 600 17px Georgia,serif"; x.fillStyle = "#3b82f6"; x.fillText("Your", LX + w1 + 1, 58);
    const w2 = x.measureText("Your").width;
    x.font = "italic 700 17px Georgia,serif"; x.fillStyle = "rgba(255,255,255,0.82)"; x.fillText("Pay", LX + w1 + w2 + 2, 58);
    /* Eyebrow */
    x.font = "600 11px monospace"; x.fillStyle = "rgba(96,165,250,0.55)";
    x.fillText("SALARY ANALYSIS", LX, 128);
    /* Headline line 1 — ultra-thin */
    x.font = "300 72px Georgia,serif"; x.fillStyle = "rgba(255,255,255,0.88)"; x.fillText("Find out what", LX, 218);
    /* Headline line 2 — bold italic accent */
    x.font = "italic bold 72px Georgia,serif"; x.fillStyle = "#60a5fa"; x.fillText("you're worth.", LX, 308);
    /* Divider */
    x.strokeStyle = "rgba(59,130,246,0.3)"; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(LX, 340); x.lineTo(LX + 360, 340); x.stroke();
    /* Sub-copy */
    x.font = "400 16px Arial,sans-serif"; x.fillStyle = "rgba(255,255,255,0.36)";
    x.fillText("free  ·  3 minutes  ·  100% anonymous", LX, 373);
    /* CTA button */
    const RR = (ctx, rx, ry, rw, rh, r) => { ctx.beginPath(); ctx.moveTo(rx + r, ry); ctx.lineTo(rx + rw - r, ry); ctx.arcTo(rx + rw, ry, rx + rw, ry + r, r); ctx.lineTo(rx + rw, ry + rh - r); ctx.arcTo(rx + rw, ry + rh, rx + rw - r, ry + rh, r); ctx.lineTo(rx + r, ry + rh); ctx.arcTo(rx, ry + rh, rx, ry + rh - r, r); ctx.lineTo(rx, ry + r); ctx.arcTo(rx, ry, rx + r, ry, r); ctx.closePath() };
    RR(x, LX, 400, 270, 48, 8); x.fillStyle = "#1e56a0"; x.fill();
    x.font = "bold 15px Arial,sans-serif"; x.fillStyle = "#fff"; x.fillText("Check what I'm worth  \u2192", LX + 20, 429);
    /* Trust badges */
    x.font = "400 12px Arial,sans-serif"; x.fillStyle = "rgba(255,255,255,0.30)";
    ["\u2713 Free forever", "\u2713 Anonymous", "\u2713 No spam"].forEach((t, i) => x.fillText(t, LX + i * 140, 476));
    /* URL */
    x.font = "500 13px monospace"; x.fillStyle = "rgba(255,255,255,0.16)"; x.fillText("knowyourpay.in", LX, 598);
    /* ── Right side card ── */
    const CX = 690, CY = 55, CW = 455, CH = 520;
    x.shadowColor = "rgba(0,0,0,0.55)"; x.shadowBlur = 56; x.shadowOffsetY = 18;
    RR(x, CX, CY, CW, CH, 14); x.fillStyle = "#0d1525"; x.fill();
    x.shadowBlur = 0; x.shadowOffsetY = 0;
    RR(x, CX, CY, CW, CH, 14); x.strokeStyle = "rgba(255,255,255,0.09)"; x.lineWidth = 1; x.stroke();
    /* Card verdict header */
    x.font = "700 8px monospace"; x.fillStyle = "rgba(255,255,255,0.22)"; x.fillText("YOUR VERDICT", CX + 22, CY + 30);
    x.font = "300 19px Georgia,serif"; x.fillStyle = "rgba(255,255,255,0.78)"; x.fillText("You're underpaid by", CX + 22, CY + 60);
    x.font = "italic bold 19px Georgia,serif"; x.fillStyle = "#f87171"; x.fillText("\u20b96\u20138L this year.", CX + 22, CY + 86);
    /* UNDERPAID badge */
    RR(x, CX + 342, CY + 20, 88, 22, 4); x.fillStyle = "#450a0a"; x.fill();
    x.font = "bold 9px Arial,sans-serif"; x.fillStyle = "#f87171"; x.fillText("UNDERPAID", CX + 357, CY + 35);
    /* Divider */
    x.strokeStyle = "rgba(255,255,255,0.07)"; x.lineWidth = 1;
    x.beginPath(); x.moveTo(CX, CY + 104); x.lineTo(CX + CW, CY + 104); x.stroke();
    /* Bar chart */
    x.font = "700 8px monospace"; x.fillStyle = "rgba(255,255,255,0.18)";
    x.fillText("MARKET RANGE  \u00b7  SR. PM  \u00b7  BENGALURU", CX + 22, CY + 122);
    const barsD = [{ pct: 32, val: "\u20b918L", lbl: "Low", isYou: false }, { pct: 55, val: "\u20b928L", lbl: "Avg", isYou: false }, { pct: 42, val: "\u20b922L", lbl: "YOU", isYou: true }, { pct: 75, val: "\u20b938L", lbl: "Strong", isYou: false }, { pct: 100, val: "\u20b952L", lbl: "Top", isYou: false }];
    const bAT = CY + 138, bAH = 143, bW = 64, bG = 18, tot = barsD.length * bW + (barsD.length - 1) * bG, b0 = CX + (CW - tot) / 2;
    barsD.forEach((b, i) => {
      const bx = b0 + i * (bW + bG), bh = Math.round(b.pct / 100 * bAH), by = bAT + bAH - bh;
      const g = x.createLinearGradient(0, by, 0, by + bh);
      if (b.isYou) { g.addColorStop(0, "#fca5a5"); g.addColorStop(1, "#dc2626"); } else { g.addColorStop(0, "rgba(147,197,253,0.52)"); g.addColorStop(1, "rgba(147,197,253,0.14)"); }
      RR(x, bx, by, bW, bh, 4); x.fillStyle = g; x.fill();
      x.font = `${b.isYou ? "700" : "600"} 10px monospace`; x.fillStyle = b.isYou ? "#fff" : "rgba(255,255,255,0.35)"; x.textAlign = "center";
      x.fillText(b.val, bx + bW / 2, by - 5);
      x.font = `${b.isYou ? "800" : "600"} 9px Arial,sans-serif`; x.fillStyle = b.isYou ? "#fff" : "rgba(255,255,255,0.20)";
      x.fillText(b.lbl, bx + bW / 2, bAT + bAH + 16); x.textAlign = "left";
    });
    /* Divider */
    x.strokeStyle = "rgba(255,255,255,0.07)"; x.lineWidth = 1;
    x.beginPath(); x.moveTo(CX, bAT + bAH + 32); x.lineTo(CX + CW, bAT + bAH + 32); x.stroke();
    /* Gameplan boxes */
    const gT = bAT + bAH + 44, gW = 120, gH = 64, gG = 16, gD = [{ val: "\u20b934L", lbl: "ASK FOR", col: "#60a5fa" }, { val: "\u20b930L", lbl: "AIM FOR", col: "#34d399" }, { val: "\u20b926L", lbl: "WALK AWAY", col: "#f87171" }];
    const gX0 = CX + (CW - (3 * gW + 2 * gG)) / 2;
    gD.forEach((g, i) => {
      const gx = gX0 + i * (gW + gG); RR(x, gx, gT, gW, gH, 8); x.fillStyle = "rgba(255,255,255,0.04)"; x.fill(); x.strokeStyle = "rgba(255,255,255,0.08)"; x.lineWidth = 1; x.stroke();
      x.font = "700 20px monospace"; x.fillStyle = g.col; x.textAlign = "center"; x.fillText(g.val, gx + gW / 2, gT + 30);
      x.font = "700 8px Arial,sans-serif"; x.fillStyle = "rgba(255,255,255,0.22)"; x.fillText(g.lbl, gx + gW / 2, gT + 50); x.textAlign = "left";
    });
    return cv.toDataURL("image/png");
  } catch (e) { return null }
};


/* ═══ MAIN APP ═══ */
export default function KnowYourPay() {
  const [step, setStep] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [analysis, setA] = useState(null);
  const [error, setErr] = useState(null);
  const [mounted, setMnt] = useState(false);
  const [elapsed, setEl] = useState(0);
  const [openTac, setOT] = useState(0);
  const [user, setUser] = useState(null);
  const [showAuth, setSA] = useState(false);
  const [shareImg, setSI] = useState(null);
  const [hasUsed, setHU] = useState(false);
  const [showInvite, setInv] = useState(false);
  const [invCopied, setIC] = useState(false);
  const [unlocked, setUL] = useState(0);
  const mob = useM();

  /* (A) All controlled form state — no free-text for critical fields */
  const [f, setF] = useState({ cr: "", tr: "", lv: "", ye: "", ind: [], stg: [], tc: [], co: "India", ci: "", salRange: "", cb: "", ce: "", expRange: "", hc: "no", np: "" });
  const u = k => v => setF(p => ({ ...p, [k]: v }));
  const cur = f.co === "India" ? "INR" : f.co === "United Kingdom" ? "GBP" : "USD";
  const sym = cur === "INR" ? "₹" : cur === "GBP" ? "£" : "$";

  /* Init */
  useEffect(() => {
    setTimeout(() => setMnt(true), 50);
    try { const s = localStorage.getItem(UK); if (s) { const u = JSON.parse(s); setUser(u); const a = localStorage.getItem(SK + "_" + u.id); if (a) { setHU(true); setA(JSON.parse(a)); const ul = localStorage.getItem(SK + "_ul_" + u.id); if (ul) setUL(+ul) } } } catch (e) { }
  }, []);

  const [loadStage, setLS] = useState(0), [tipIdx, setTI] = useState(0);
  useEffect(() => {
    if (!loading) return; setLS(0); setEl(0); setTI(Math.floor(Math.random() * NEG_TIPS.length));
    let stage = 0, acc = 0; const dur = LOAD_STAGES.map(s => s.dur);
    const si = setInterval(() => { setEl(p => p + 1); acc++; if (acc >= dur[stage] && stage < dur.length - 1) { stage++; setLS(stage); acc = 0 } }, 1000);
    const ti = setInterval(() => setTI(p => (p + 1) % NEG_TIPS.length), 7000);
    return () => { clearInterval(si); clearInterval(ti) }
  }, [loading]);
  useEffect(() => { if (analysis) setSI(makeShareCard()) }, [analysis]);

  const ok = () => { if (step === 0) return f.cr && f.tr && f.ye && f.ind.length > 0; if (step === 1) return f.salRange && f.ci; if (step === 2) return f.expRange && f.tc.length > 0; return false };
  const next = () => { if (!ok()) return; if (step < 2) { setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }) } else run() };
  const back = () => { if (step > 0) { setStep(step - 1) } };

  const handleAuth = (ud) => { setUser(ud); setSA(false); try { const s = localStorage.getItem(SK + "_" + ud.id); if (s) { setHU(true); setA(JSON.parse(s)); setStep(3); return } } catch (e) { } setStep(0) };
  const getStarted = () => { if (user) { if (hasUsed) { setStep(3); return } setStep(0) } else setSA(true) };
  const copyInvite = () => { navigator.clipboard.writeText("https://knowyourpay.in?ref=invite"); setIC(true); setTimeout(() => setIC(false), 2000) };
  const signOut = () => { try { if (user) { localStorage.removeItem(UK); localStorage.removeItem(SK + "_" + user.id); localStorage.removeItem(SK + "_ul_" + user.id); } } catch (e) { } setUser(null); setA(null); setHU(false); setUL(0); setStep(-1); setSA(false); setF({ cr: "", tr: "", lv: "", ye: "", ind: [], stg: [], tc: [], co: "India", ci: "", salRange: "", cb: "", ce: "", expRange: "", hc: "no", np: "" }); };

  /* (G) API call — in production this goes to /api/analyze, prompt never client-side */
  const run = async () => {
    setStep(3);
    setLoading(true);
    setErr(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // These are for display only — backend can take raw values too
    const lvStr = f.lv ? (LEVELS.find(l => l.v === f.lv)?.l || f.lv) : "not specified";

    const payload = {
      currentRole: f.cr,
      targetRole: f.tr,
      level: lvStr,                // or send f.lv if you prefer
      experience: f.ye,
      industries: f.ind,            // array
      stages: f.stg,                // array
      targetCompany: f.tc,
      country: f.co,
      city: f.ci,
      salaryRange: f.salRange,
      bonus: f.cb || "none",
      esops: f.ce || "none",
      expectedRange: f.expRange,
      competing: f.hc || "no",
      notice: f.np || "standard",
      currency: cur                 // INR / USD / GBP
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `API ${res.status}`);
      }

      // Backend returns the final parsed analysis JSON already
      if (!data?.situation || !data?.gameplan) {
        throw new Error("Incomplete analysis");
      }

      setA(data);

      if (user) {
        try {
          localStorage.setItem(SK + "_" + user.id, JSON.stringify(data));
          setHU(true);
        } catch { }
      }
    } catch (e) {
      console.error("KYP:", e);
      setErr("Analysis failed — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const a = analysis;
  const firstName = user?.name && user.name !== "User" ? user.name.split(" ")[0] : "";

  /* Derive numeric midpoint from the user-selected salary range band for the YOU bar */
  const salaryMidpoint = useMemo(() => {
    if (!f.salRange) return 0;
    const v = f.salRange;
    if (cur === "INR") {
      const map = { "under-5": 4e5, "5-10": 7.5e5, "10-20": 15e5, "20-35": 27.5e5, "35-50": 42.5e5, "50-75": 62.5e5, "75-100": 87.5e5, "100-plus": 120e5 };
      return map[v] || 0;
    } else if (cur === "USD") {
      const map = { "under-50": 40000, "50-80": 65000, "80-120": 100000, "120-180": 150000, "180-250": 215000, "250-plus": 300000 };
      return map[v] || 0;
    } else {
      const map = { "under-40": 32000, "40-60": 50000, "60-90": 75000, "90-130": 110000, "130-plus": 155000 };
      return map[v] || 0;
    }
  }, [f.salRange, cur]);

  const sM = { underpaid: { c: "#b91c1c", bg: "#fef2f2", i: "↓", t: "Underpaid" }, fair: { c: "#a16207", bg: "#fefce8", i: "→", t: "Fair" }, "well-paid": { c: "#15803d", bg: "#f0fdf4", i: "↑", t: "Well Paid" }, overpaid: { c: "#7c3aed", bg: "#f5f3ff", i: "↑↑", t: "Above Market" } };
  const qM = { poor: { c: "#b91c1c", bg: "#fef2f2" }, decent: { c: "#a16207", bg: "#fefce8" }, good: { c: "#15803d", bg: "#f0fdf4" }, excellent: { c: "#1e56a0", bg: "#eff6ff" } };
  const px = "clamp(16px,4vw,32px)";

  /* (E) Light theme styles + subtle gradient bg */
  const RS = { "--fd": "'Fraunces',Georgia,serif", "--fb": "'Outfit','Helvetica Neue',sans-serif", "--fm": "'JetBrains Mono',monospace", "--ink": "#0a0f1a", "--ink2": "#1e293b", "--slate": "#475569", "--muted": "#64748b", "--faint": "#94a3b8", "--ghost": "#cbd5e1", "--surface": "#f8fafc", "--border": "#e2e8f0", "--accent": "#1e56a0", "--accent-l": "#dbeafe", "--you": "#d97706", "--up": "#16a34a", "--down": "#dc2626", "--card-bg": "#fff", "--input-bg": "#fff", minHeight: "100vh", fontFamily: "var(--fb)", color: "var(--ink)", background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 40%, #e8ecf4 100%)", WebkitFontSmoothing: "antialiased" };
  const GS = `*{margin:0;padding:0;box-sizing:border-box}::selection{background:#dbeafe;color:#1e56a0}html{-webkit-text-size-adjust:100%}body{overflow-x:hidden}@keyframes spin{to{transform:rotate(360deg)}}@keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}@keyframes factCycle{0%{opacity:0;transform:translateY(8px)}10%{opacity:1;transform:translateY(0)}85%{opacity:1}100%{opacity:0;transform:translateY(-8px)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}input::placeholder{font-family:'Outfit',sans-serif;color:#94a3b8;font-size:15px}input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield;-webkit-appearance:none}select option{background:#fff;color:#0a0f1a}button{-webkit-tap-highlight-color:transparent}`;


  /* ═══ AUTH ═══ */
  if (showAuth) return <div style={RS}><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" /><style>{GS}</style>
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,26,.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <FI><div style={{ background: "#fff", borderRadius: 20, padding: mob ? "28px 22px" : "36px 28px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(10,15,26,.18)" }}>
        <Logo s={24} />
        <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(20px,5vw,24px)", fontWeight: 200, marginTop: 20, marginBottom: 4, lineHeight: 1.2 }}>Let's find out what <span style={{ fontWeight: 700, fontStyle: "italic" }}>you're worth</span></div>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65, marginBottom: 24 }}>Quick sign-in to save your report. We only need your email — <strong style={{ color: "var(--ink)" }}>zero data stored.</strong></p>
        <button onClick={async () => { try { const gUser = await signInWithGoogle(); const nm = (gUser.name || "").trim(); const id = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8); const ud = { id, name: nm || "User", email: gUser.email || "user@example.com", photo: gUser.photo || "", t: Date.now() }; try { localStorage.setItem(UK, JSON.stringify(ud)) } catch (e) { } handleAuth(ud); } catch (e) { console.error("Google sign-in failed", e); } }} style={{ width: "100%", padding: "14px 20px", fontFamily: "var(--fb)", fontSize: 16, fontWeight: 600, color: "var(--ink)", background: "#fff", border: "1.5px solid var(--border)", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 1px 3px rgba(10,15,26,.08)" }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
          Continue with Google
        </button>
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ i: "🔒", t: "Salary data never leaves your device" }, { i: "🚫", t: "We never sell or share your info" }, { i: "🗑️", t: "Real-time analysis, nothing saved" }].map((x, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}><span style={{ fontSize: 13, flexShrink: 0 }}>{x.i}</span><span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{x.t}</span></div>)}
        </div>
      </div></FI>
    </div>
  </div>;

  /* ═══ ALREADY USED ═══ */
  if (user && hasUsed && step === -1) return <div style={RS}><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" /><style>{GS}</style>
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: `18px ${px}`, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo s={mob ? 14 : 16} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setStep(3)} style={{ fontFamily: "var(--fb)", fontSize: 12, fontWeight: 700, padding: "8px 16px", color: "#fff", background: "var(--ink)", border: "none", borderRadius: 9, cursor: "pointer" }}>View my report</button>
          <button onClick={signOut} style={{ fontFamily: "var(--fb)", fontSize: 12, fontWeight: 600, padding: "8px 14px", color: "var(--muted)", background: "transparent", border: "1.5px solid var(--border)", borderRadius: 9, cursor: "pointer" }}>Sign out</button>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <FI><div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🎯</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(24px,5vw,32px)", fontWeight: 200, marginBottom: 8, lineHeight: 1.15 }}>You’ve already got <span style={{ fontWeight: 700, fontStyle: "italic" }}>your report</span></div>
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, marginBottom: 28 }}>Each user gets one free analysis. Want more?</p>
          <div style={{ background: "var(--card-bg)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: 10, fontWeight: 700, color: "var(--accent)", letterSpacing: ".08em", marginBottom: 6 }}>PRO · COMING SOON</div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 300, marginBottom: 4 }}>Unlimited analyses, <span style={{ fontWeight: 700, fontStyle: "italic" }}>side-by-side</span> offer comparisons</div>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>Compare multiple offers, track market trends, get real-time salary alerts.</p>
          </div>
        </div></FI>
      </div>
      <Ft />
    </div>
  </div>;


  /* ═══ LANDING (I: punchy hero) ═══ */
  if (step === -1 && !a) return <div style={RS}><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" /><style>{GS}</style>
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: `18px ${px}`, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", opacity: mounted ? 1 : 0, transition: "opacity 400ms 100ms" }}>
        <Logo s={mob ? 14 : 16} />
        <button onClick={getStarted} style={{ fontFamily: "var(--fb)", fontSize: mob ? 12 : 13, fontWeight: 700, padding: mob ? "8px 16px" : "10px 22px", color: "#fff", background: "var(--ink)", border: "none", borderRadius: 9, cursor: "pointer" }}>Get Started →</button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: `40px ${px}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: mob ? 32 : 64, maxWidth: 1100, width: "100%", flexDirection: mob ? "column" : "row" }}>
          <div style={{ flex: "1 1 420px", maxWidth: 540, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(24px)", transition: "all 700ms 150ms cubic-bezier(.23,1,.32,1)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--accent-l)", borderRadius: 999, padding: "5px 12px", marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
              <span style={{ fontFamily: "var(--fm)", fontSize: 10, fontWeight: 600, color: "var(--accent)", letterSpacing: ".04em" }}>AI-POWERED SALARY INTELLIGENCE</span>
            </div>
            {/* (I) Hero: Option 1 selected — "Switching jobs? Know your number before they name theirs." */}
            <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(32px,6vw,56px)", fontWeight: 200, lineHeight: 1.06, letterSpacing: "-.03em", marginBottom: 20 }}>
              Switching jobs?<br /><span style={{ fontWeight: 700, fontStyle: "italic" }}>Know your number before they name theirs.</span>
            </h1>
            <p style={{ fontSize: mob ? 15 : 17, lineHeight: 1.7, color: "var(--slate)", marginBottom: 36, maxWidth: 460 }}>
              Get your market salary range, a brutally honest verdict, and <span style={{ fontFamily: "var(--fd)", fontStyle: "italic", fontWeight: 500, color: "var(--ink)" }}>word-for-word negotiation scripts</span> — in 3 minutes flat.
            </p>
            <button onClick={getStarted} style={{ fontFamily: "var(--fb)", fontSize: mob ? 15 : 16, fontWeight: 700, padding: "15px 36px", color: "#fff", background: "var(--ink)", border: "none", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, width: mob ? "100%" : "auto", justifyContent: "center" }}>Check what I'm worth <span style={{ fontSize: 18 }}>→</span></button>
            <div style={{ display: "flex", gap: mob ? 14 : 20, marginTop: 20, fontSize: 13, flexWrap: "wrap" }}>{["Free forever", "3 minutes", "100% anonymous"].map((t, i) => <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--muted)" }}><span style={{ color: "var(--up)" }}>✓</span>{t}</span>)}</div>
          </div>
          {/* Preview card */}
          <div style={{ flex: "1 1 320px", display: "flex", justifyContent: "center", opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(28px)", transition: "all 800ms 300ms cubic-bezier(.23,1,.32,1)", width: mob ? "100%" : "auto" }}>
            <div style={{ width: mob ? "100%" : 380, maxWidth: 420, background: "var(--ink)", borderRadius: 14, overflow: "hidden", boxShadow: "0 24px 80px rgba(10,15,26,.15)", animation: "float 6s ease infinite" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div><div style={{ fontFamily: "var(--fb)", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.3)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 5 }}>{firstName ? firstName + ", here\u2019s your verdict" : "Your verdict"}</div><div style={{ fontFamily: "var(--fd)", fontSize: mob ? 16 : 18, fontWeight: 300, color: "#fff", lineHeight: 1.25 }}>You're underpaid by <span style={{ fontWeight: 700, fontStyle: "italic", color: "#f87171" }}>₹6L/yr</span></div></div>
                  <span style={{ padding: "4px 10px", fontFamily: "var(--fb)", fontSize: 9, fontWeight: 700, color: "#b91c1c", background: "#fef2f2", borderRadius: 5, flexShrink: 0 }}>UNDERPAID</span>
                </div>
              </div>
              <div style={{ padding: "16px 22px 12px" }}>
                <div style={{ fontFamily: "var(--fb)", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>Market range · Sr. PM · Bengaluru</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: mob ? 80 : 100 }}>
                  {[{ h: 32, v: "₹18L", l: "Low" }, { h: 55, v: "₹28L", l: "Avg" }, { h: 42, v: "₹22L", l: "YOU", r: 1 }, { h: 75, v: "₹38L", l: "Strong" }, { h: 100, v: "₹52L", l: "Top" }].map((b, i) => <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <span style={{ fontFamily: "var(--fm)", fontSize: 8, fontWeight: b.r ? 700 : 600, color: b.r ? "#fff" : "rgba(255,255,255,.3)" }}>{b.v}</span>
                    <div style={{ width: "100%", height: `${b.h}%`, background: b.r ? "linear-gradient(180deg,#fca5a5,#dc2626)" : "linear-gradient(180deg,#dbeafe88,#93c5fd)", borderRadius: "4px 4px 2px 2px", animation: `barGrow 600ms ${i * 80}ms cubic-bezier(.23,1,.32,1) both`, transformOrigin: "bottom" }} />
                    <span style={{ fontFamily: "var(--fb)", fontSize: 8, fontWeight: b.r ? 800 : 600, color: b.r ? "#fff" : "rgba(255,255,255,.25)" }}>{b.l}</span>
                  </div>)}
                </div>
              </div>
              <div style={{ padding: "4px 22px 14px" }}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                {[{ v: "₹34L", l: "Ask for", c: "#60a5fa" }, { v: "₹30L", l: "Aim for", c: "#34d399" }, { v: "₹26L", l: "Walk away", c: "#f87171" }].map((x, i) => <div key={i} style={{ textAlign: "center", padding: "9px 4px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.07)" }}><div style={{ fontFamily: "var(--fm)", fontSize: 12, fontWeight: 700, color: x.c }}>{x.v}</div><div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 2 }}>{x.l}</div></div>)}
              </div></div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: `16px ${px}`, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", gap: mob ? 12 : 24, flexWrap: "wrap" }}>
        {[{ i: "🔒", t: "Data stays on your device" }, { i: "🚫", t: "Nothing stored, ever" }, { i: "🛡️", t: "No tracking, no ads" }].map((x, i) => <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: mob ? 11 : 12, color: "var(--faint)" }}><span>{x.i}</span>{x.t}</span>)}
      </div>
      <Ft />
    </div>
  </div>;


  /* ═══ FORM + RESULTS ═══ */
  return <div style={RS}><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" /><style>{GS}</style>
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 660, margin: "0 auto", padding: `28px ${px} 20px`, width: "100%" }}>
        <FI><div style={{ marginBottom: step < 3 ? 0 : 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo s={mob ? 14 : 15} />
          {user && <button onClick={signOut} style={{ fontFamily: "var(--fb)", fontSize: 11, fontWeight: 600, padding: "6px 12px", color: "var(--muted)", background: "transparent", border: "1.5px solid var(--border)", borderRadius: 8, cursor: "pointer" }}>Sign out</button>}
        </div></FI>

        {step < 3 && <FI d={80}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "24px 0" }}>
          <div style={{ display: "flex", gap: 5, flex: 1 }}>{[0, 1, 2].map(i => <div key={i} style={{ flex: i === step ? 3 : 1, height: 3, borderRadius: 2, background: i <= step ? "var(--accent)" : "var(--border)", transition: "all 400ms" }} />)}</div>
          <span style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--faint)", fontWeight: 600, marginLeft: 16, letterSpacing: ".04em", textTransform: "uppercase" }}>{["Role", "Pay", "Target"][step]}</span>
        </div></FI>}

        {/* STEP 0: Role (A: all typeahead/dropdown) */}
        {step === 0 && <FI key="s0">
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(24px,5vw,28px)", fontWeight: 200, letterSpacing: "-.02em", marginBottom: 4 }}>Who you are & <span style={{ fontWeight: 700, fontStyle: "italic" }}>where you're headed</span></div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28 }}>All fields use pre-set options — so your report is always accurate.</div>
          <TypeSel label="Current Role" value={f.cr} onChange={u("cr")} options={ROLES} ph="Search roles..." />
          <TypeSel label="Target Role" value={f.tr} onChange={u("tr")} options={ROLES} ph="Search target role..." />
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12 }}>
            <SEL label="Experience" value={f.ye} onChange={u("ye")} options={EXP_RANGES} ph="Select range..." />
            <SEL label="Level" value={f.lv} onChange={u("lv")} options={LEVELS} ph="Select level..." sub="(optional)" />
          </div>
          <MC label="Industry" options={INDS} sel={f.ind} onChange={v => setF(p => ({ ...p, ind: v }))} max={3} />
          <MC label="Target Company Stage" options={STGS.map(s => ({ value: s.v, label: s.l }))} sel={f.stg} onChange={v => setF(p => ({ ...p, stg: v }))} max={4} />
        </FI>}

        {/* STEP 1: Compensation (A: salary ranges instead of free number) */}
        {step === 1 && <FI key="s1">
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(24px,5vw,28px)", fontWeight: 200, letterSpacing: "-.02em", marginBottom: 4 }}>What you <span style={{ fontWeight: 700, fontStyle: "italic" }}>earn today</span></div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28 }}>Pick the range closest to your current package.</div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12 }}>
            <SEL label="Country" value={f.co} onChange={u("co")} options={CTRY} ph="Select..." />
            <CityIn label="City" value={f.ci} onChange={u("ci")} country={f.co} />
          </div>
          <SEL label="Annual Base Salary" value={f.salRange} onChange={u("salRange")} options={SALARY_RANGES[cur] || SALARY_RANGES.INR} ph="Select range..." />
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12 }}>
            <SEL label="Annual Bonus" value={f.cb} onChange={u("cb")} options={[{ v: "none", l: "No bonus" }, { v: "1-2m", l: "1–2 months" }, { v: "2-4m", l: "2–4 months" }, { v: "4-plus", l: "4+ months" }, { v: "variable", l: "Variable / Performance" }]} ph="Select..." sub="(optional)" />
            <SEL label="ESOPs / RSUs" value={f.ce} onChange={u("ce")} options={[{ v: "none", l: "None" }, { v: "small", l: "Small (<5% of comp)" }, { v: "moderate", l: "Moderate (5-15%)" }, { v: "significant", l: "Significant (15%+)" }]} ph="Select..." sub="(optional)" />
          </div>
        </FI>}

        {/* STEP 2: Target (A: company typeahead) */}
        {step === 2 && <FI key="s2">
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(24px,5vw,28px)", fontWeight: 200, letterSpacing: "-.02em", marginBottom: 4 }}>Where you're <span style={{ fontWeight: 700, fontStyle: "italic" }}>aiming</span></div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28 }}>Target company and expected compensation.</div>
          <MultiCompany label="Target Companies" values={f.tc} onChange={v => setF(p => ({ ...p, tc: v }))} options={COMPANIES} max={3} ph="Search companies... (up to 3)" />
          <SEL label="Expected Salary Range" value={f.expRange} onChange={u("expRange")} options={SALARY_RANGES[cur] || SALARY_RANGES.INR} ph="Select expected range..." />
          <div style={{ marginBottom: 20 }}><LBL>Competing offers?</LBL>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{[["no", "No"], ["yes", "Yes"], ["expecting soon", "Expecting soon"]].map(([v, l]) => <Chip key={v} label={l} sel={f.hc === v} onClick={() => u("hc")(v)} />)}</div>
          </div>
          <SEL label="Notice Period" value={f.np} onChange={u("np")} options={[{ value: "immediate", label: "Immediate" }, { value: "15", label: "15 days" }, { value: "30", label: "30 days" }, { value: "60", label: "60 days" }, { value: "90", label: "90 days" }]} ph="Select..." />
        </FI>}

        {step < 3 && <FI d={180}><div style={{ display: "flex", gap: 10 }}>
          {step > 0 && <button onClick={back} style={{ padding: "14px 22px", fontFamily: "var(--fb)", fontSize: 15, fontWeight: 600, color: "var(--ink)", background: "transparent", border: "1.5px solid var(--border)", borderRadius: 10, cursor: "pointer" }}>Back</button>}
          <button onClick={next} disabled={!ok()} style={{ flex: 1, padding: "14px 22px", fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700, color: ok() ? "#fff" : "var(--ghost)", background: ok() ? "var(--ink)" : "var(--surface)", border: ok() ? "none" : "1.5px solid var(--border)", borderRadius: 10, cursor: ok() ? "pointer" : "not-allowed", transition: "all 200ms" }}>{step === 2 ? "Analyze my salary →" : "Continue →"}</button>
        </div></FI>}


        {/* LOADING */}
        {step === 3 && loading && <FI><div style={{ padding: mob ? "32px 0" : "48px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: mob ? 20 : 26, fontWeight: 200, marginBottom: 6 }}>
              Hang tight{firstName ? `, ${firstName}` : ""} — <span style={{ fontWeight: 700, fontStyle: "italic" }}>building your playbook</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>Analyzing <span style={{ fontWeight: 600, color: "var(--ink)" }}>{f.cr}</span> → <span style={{ fontWeight: 600, color: "var(--accent)" }}>{f.tr}</span>{f.tc.length > 0 ? ` at ${f.tc[0]}` : ""}</div>
          </div>
          <div style={{ maxWidth: 440, margin: "0 auto 28px" }}>
            {LOAD_STAGES.map((s, i) => {
              const done = i < loadStage, active = i === loadStage;
              return <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < LOAD_STAGES.length - 1 ? 12 : 0, opacity: done ? .4 : active ? 1 : .25, transition: "all 400ms" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: done ? "var(--up)" : active ? "var(--accent)" : "var(--surface)", border: done || active ? "none" : "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 400ms" }}>
                  {done ? <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✓</span> : active ? <div style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> : <span style={{ fontSize: 14 }}>{s.icon}</span>}
                </div>
                <div><div style={{ fontSize: 14, fontWeight: active ? 700 : done ? 500 : 400, color: active ? "var(--ink)" : done ? "var(--muted)" : "var(--ghost)" }}>{s.title}</div>
                  {active && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>{s.sub}</div>}
                </div>
              </div>
            })}
          </div>
          <div style={{ maxWidth: 440, margin: "0 auto 28px" }}>
            <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(((loadStage + 1) / LOAD_STAGES.length) * 100, 95)}%`, background: "linear-gradient(90deg,var(--accent),#60a5fa)", borderRadius: 2, transition: "width 1s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--faint)" }}>{elapsed}s</span>
              <span style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--faint)" }}>~30s</span>
            </div>
          </div>
          <div style={{ maxWidth: 440, margin: "0 auto", background: "var(--ink)", borderRadius: 14, padding: mob ? "18px" : "22px", color: "#fff" }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: 9, fontWeight: 700, color: "#60a5fa", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>NEGOTIATION TIP</div>
            <div key={tipIdx} style={{ animation: "factCycle 7s ease infinite" }}>
              <div style={{ fontFamily: "var(--fd)", fontSize: mob ? 16 : 18, fontWeight: 600, fontStyle: "italic", color: "rgba(255,255,255,.9)", lineHeight: 1.35, marginBottom: 8 }}>“{NEG_TIPS[tipIdx].q}”</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", lineHeight: 1.6 }}>{NEG_TIPS[tipIdx].a}</div>
            </div>
          </div>
        </div></FI>}

        {error && <FI><div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 15, color: "var(--slate)", marginBottom: 20, lineHeight: 1.6, maxWidth: 400, margin: "0 auto 20px" }}>{error}</div>
          <button onClick={() => { setStep(2); setErr(null) }} style={{ padding: "14px 28px", fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700, color: "#fff", background: "var(--ink)", border: "none", borderRadius: 10, cursor: "pointer" }}>Go back & fix</button>
        </div></FI>}

        {/* ═══ RESULTS ═══ */}
        {step === 3 && a && <div>
          {/* Verdict */}
          <FI d={0}><div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 12, boxShadow: "0 4px 24px rgba(10,15,26,.06)" }}>
            <div style={{ background: "var(--ink)", padding: mob ? "16px 18px" : "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180 }}><div style={{ fontFamily: "var(--fb)", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.35)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>{firstName ? firstName + ", here’s your verdict" : "Your verdict"}</div><div style={{ fontFamily: "var(--fd)", fontSize: mob ? 18 : 22, fontWeight: 300, color: "rgba(255,255,255,.85)", lineHeight: 1.3 }}><Bd t={a.situation.headline} c="#fff" /></div></div>
                <Pill text={`${sM[a.situation.standing]?.i || "→"} ${sM[a.situation.standing]?.t || "Fair"}`} color={sM[a.situation.standing]?.c} bg={sM[a.situation.standing]?.bg} />
              </div>
            </div>
            <div style={{ padding: mob ? "18px" : "24px" }}>
              <div style={{ fontSize: mob ? 14 : 15, color: "var(--slate)", lineHeight: 1.7, marginBottom: 24 }}><Bd t={a.situation.summary} /></div>
              <Bars range={a.situation.marketRange} youVal={salaryMidpoint} label={`Market range · ${f.cr} · ${f.ci || f.co}`} cur={cur} standing={a.situation.standing} mob={mob} userName={firstName || "YOU"} />
              {/* (B) Plain language percentile display */}
              <div style={{ padding: mob ? "14px" : "16px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: mob ? 10 : 14, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent-l)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--accent)" }}>{a.situation.percentile}<span style={{ fontSize: 11, fontWeight: 400 }}>th</span></span>
                  </div>
                  <div style={{ fontSize: mob ? 13 : 14, color: "var(--slate)", lineHeight: 1.5 }}><Bd t={a.situation.percentileText} /></div>
                </div>
                <div style={{ position: "relative", height: 6, background: "var(--border)", borderRadius: 3 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${Math.min(a.situation.percentile, 100)}%`, background: "linear-gradient(90deg,#dc2626,#d97706 50%,#16a34a)", borderRadius: 3 }} />
                  <div style={{ position: "absolute", left: `${Math.min(a.situation.percentile, 100)}%`, top: -5, width: 16, height: 16, borderRadius: "50%", background: "var(--ink)", border: "3px solid #fff", transform: "translateX(-50%)", boxShadow: "0 2px 8px rgba(10,15,26,.2)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, fontFamily: "var(--fb)", color: "var(--faint)", fontWeight: 600 }}><span>Lowest paid</span><span>Highest paid</span></div>
              </div>
            </div>
          </div></FI>

          {/* Opportunity */}
          <FI d={200}><div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 14, padding: mob ? "18px" : "24px", marginBottom: 12, boxShadow: "0 4px 24px rgba(10,15,26,.06)" }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 14 }}>{firstName ? firstName + "’s opportunity" : "The opportunity"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <Pill text={`${a.opportunity.quality || "good"} move`} color={qM[a.opportunity.quality]?.c || "#15803d"} bg={qM[a.opportunity.quality]?.bg || "#f0fdf4"} />
              <span style={{ fontFamily: "var(--fm)", fontSize: 18, fontWeight: 700, color: a.opportunity.jumpPct > 0 ? "var(--up)" : "var(--down)" }}>{a.opportunity.jumpPct > 0 ? "+" : ""}{a.opportunity.jumpPct}%</span>
              <span style={{ fontSize: 12, color: "var(--faint)" }}>avg jump: {a.opportunity.avgJump}%</span>
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 18, background: a.opportunity.askLevel === "low" ? "#fef2f2" : a.opportunity.askLevel === "high" ? "#fefce8" : "#f0fdf4", borderLeft: `3px solid ${a.opportunity.askLevel === "low" ? "#dc2626" : a.opportunity.askLevel === "high" ? "#d97706" : "#16a34a"}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: a.opportunity.askLevel === "low" ? "#b91c1c" : a.opportunity.askLevel === "high" ? "#a16207" : "#15803d", lineHeight: 1.5 }}>{a.opportunity.askLevel === "low" ? "↓ " : a.opportunity.askLevel === "high" ? "⚠ " : "✓ "}{a.opportunity.askFeedback}</div>
            </div>
            <Bars range={a.opportunity.targetRange} youVal={salaryMidpoint} label={`Target range · ${f.tr} · ${f.tc[0] || ""}`} cur={cur} standing={a.opportunity.askLevel === "low" ? "underpaid" : "fair"} mob={mob} userName={firstName || "YOU"} />
            <div style={{ fontSize: mob ? 14 : 15, color: "var(--slate)", lineHeight: 1.7, marginTop: 4 }}><Bd t={a.opportunity.insight} /></div>
          </div></FI>

          {/* Reality check */}
          <FI d={300}><div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderLeft: "3px solid var(--you)", borderRadius: "0 10px 10px 0", padding: "14px 18px", marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: "var(--slate)", lineHeight: 1.55 }}><strong style={{ color: "var(--ink)" }}>⚡ Reality check:</strong> Accounting for market hype, a realistic range is <span style={{ fontFamily: "var(--fm)", fontWeight: 700, color: "var(--you)" }}>{fmt(a.gameplan.hypeAdjusted?.low, cur)} – {fmt(a.gameplan.hypeAdjusted?.high, cur)}</span></div>
          </div></FI>


          {/* GAME PLAN (C: Pro UI restored — tactic 1 free, 2-4 locked behind invite) */}
          <FI d={400}><div style={{ background: "var(--ink)", borderRadius: 14, padding: mob ? "20px" : "28px", marginBottom: 12, color: "#fff" }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 20 }}>{firstName ? firstName + "’s game plan" : "Your game plan"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: mob ? 6 : 8, marginBottom: 20 }}>
              {[{ l: "Ask for", v: a.gameplan.askFor, c: "#60a5fa" }, { l: "Aim to land", v: a.gameplan.settleAt, c: "#34d399" }, { l: "Don't go below", v: a.gameplan.dontGoBelow, c: "#f87171" }].map(x => <div key={x.l} style={{ textAlign: "center", padding: mob ? "12px 6px" : "16px 8px", borderRadius: 10, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.07)" }}><div style={{ fontFamily: "var(--fm)", fontSize: mob ? 14 : 18, fontWeight: 700, color: x.c, marginBottom: 4 }}>{fmt(x.v, cur)}</div><div style={{ fontFamily: "var(--fb)", fontSize: mob ? 8 : 10, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".06em" }}>{x.l}</div></div>)}
            </div>
            <div style={{ fontSize: mob ? 14 : 15, color: "rgba(255,255,255,.5)", lineHeight: 1.65, marginBottom: 24 }}><Bd t={a.gameplan.whyThisNumber} c="rgba(255,255,255,.85)" /></div>

            <div style={{ fontFamily: "var(--fb)", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>Your moves</div>
            {(a.gameplan.tactics || []).map((t, i) => {
              const free = i === 0 || unlocked >= 1;
              return <div key={i} style={{ marginBottom: 8 }}>
                <div onClick={() => !free ? setInv(true) : setOT(openTac === i ? -1 : i)} style={{ background: openTac === i && free ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.04)", border: `1px solid ${openTac === i && free ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.07)"}`, borderRadius: openTac === i && free ? "10px 10px 0 0" : "10px", padding: mob ? "12px 14px" : "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all 200ms", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--fm)", fontSize: 12, fontWeight: 700, color: free ? "#60a5fa" : "rgba(96,165,250,.5)", background: free ? "rgba(96,165,250,.15)" : "rgba(96,165,250,.08)", padding: "3px 8px", borderRadius: 4, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: mob ? 13 : 15, fontWeight: 600, color: free ? "#fff" : "rgba(255,255,255,.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                  </div>
                  {!free ? <span style={{ fontFamily: "var(--fm)", fontSize: 9, fontWeight: 700, color: "#60a5fa", background: "rgba(96,165,250,.1)", padding: "3px 10px", borderRadius: 999 }}>🔒 INVITE</span>
                    : <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)", flexShrink: 0 }}>{openTac === i ? "▴" : "▾"}</span>}
                </div>
                {openTac === i && free && <div style={{ background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.12)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: mob ? "12px 14px" : "14px 16px" }}>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 10 }}>⏰ {t.when}</div>
                  <div style={{ background: "rgba(255,255,255,.06)", borderLeft: "2.5px solid #60a5fa", borderRadius: "0 6px 6px 0", padding: "12px 16px", marginBottom: 10 }}>
                    <div style={{ fontFamily: "var(--fd)", fontSize: mob ? 14 : 15, fontStyle: "italic", color: "rgba(255,255,255,.85)", lineHeight: 1.65 }}>"{t.script}"</div>
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,.45)", lineHeight: 1.55 }}><strong style={{ color: "rgba(255,255,255,.75)" }}>Why:</strong> {t.why}</div>
                </div>}
              </div>
            })}

            {a.gameplan.watchOut?.length > 0 && <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: "var(--fb)", fontSize: 10, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>Watch out for</div>
              {a.gameplan.watchOut.map((w, i) => <div key={i} style={{ display: "flex", gap: 8, fontSize: 14, color: "rgba(255,255,255,.55)", marginBottom: 6 }}><span style={{ color: "#f87171", fontSize: 9, marginTop: 5, flexShrink: 0 }}>●</span><span style={{ lineHeight: 1.55 }}>{w}</span></div>)}
            </div>}

            {/* (C) PRO PLAYBOOK — invite-to-unlock section */}
            <div style={{ marginTop: 24, background: "linear-gradient(135deg,rgba(96,165,250,.08),rgba(52,211,153,.05))", border: "1px solid rgba(96,165,250,.15)", borderRadius: 12, padding: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#60a5fa,#34d399,transparent)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
              <div style={{ fontFamily: "var(--fm)", fontSize: 10, fontWeight: 700, color: "#60a5fa", letterSpacing: ".08em", marginBottom: 6 }}>PRO PLAYBOOK</div>
              <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,.85)", lineHeight: 1.35, marginBottom: 4 }}>Invite friends. <span style={{ fontWeight: 700, fontStyle: "italic" }}>Unlock everything.</span></div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.55, marginBottom: 16 }}>Each friend who checks their salary unlocks a Pro feature for you. 4 invites = full playbook.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 16 }}>
                {PRO_FEATS.map((pf, i) => <div key={pf.id} style={{ padding: "10px 8px", borderRadius: 8, background: i < unlocked ? "rgba(52,211,153,.12)" : "rgba(255,255,255,.04)", border: `1px solid ${i < unlocked ? "rgba(52,211,153,.2)" : "rgba(255,255,255,.06)"}`, textAlign: "center" }}>
                  <div style={{ fontSize: 16, marginBottom: 4, filter: i < unlocked ? "none" : "grayscale(1) opacity(.4)" }}>{pf.icon}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: i < unlocked ? "#34d399" : "rgba(255,255,255,.3)", lineHeight: 1.3 }}>{i < unlocked ? "Unlocked" : pf.title}</div>
                </div>)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,.06)", borderRadius: 3 }}><div style={{ width: `${(unlocked / 4) * 100}%`, height: "100%", background: "linear-gradient(90deg,#60a5fa,#34d399)", borderRadius: 3, transition: "width 500ms" }} /></div>
                <span style={{ fontFamily: "var(--fm)", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)" }}>{unlocked}/4</span>
              </div>
              <button onClick={() => setInv(true)} style={{ width: "100%", padding: 14, fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700, color: "#0a0f1a", background: "linear-gradient(135deg,#60a5fa,#34d399)", border: "none", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>🚀 Invite a friend & unlock</button>
            </div>

            {a.confidence && <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ fontFamily: "var(--fm)", fontSize: 14, fontWeight: 700, color: "#60a5fa" }}>{a.confidence.score}%</div><div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.08)", borderRadius: 2 }}><div style={{ width: `${a.confidence.score}%`, height: "100%", background: "linear-gradient(90deg,#60a5fa,#93c5fd)", borderRadius: 2 }} /></div></div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 6, lineHeight: 1.5 }}>Confidence score — {a.confidence.note}</div>
            </div>}
          </div></FI>


          {/* INVITE MODAL */}
          {showInvite && <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,26,.6)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setInv(false)}>
            <FI><div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: mob ? "24px 20px" : "32px", maxWidth: 440, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(10,15,26,.15)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎁</div>
              <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 200, marginBottom: 4 }}>Share the love, <span style={{ fontWeight: 700, fontStyle: "italic" }}>unlock the power</span></div>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65, marginBottom: 20 }}>When a friend checks their salary, you both win — they get insights, you unlock Pro features.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16, textAlign: "left" }}>
                {PRO_FEATS.map((pf, i) => <div key={pf.id} style={{ padding: "10px 12px", borderRadius: 8, background: i < unlocked ? "#f0fdf4" : "var(--surface)", border: `1px solid ${i < unlocked ? "#bbf7d0" : "var(--border)"}`, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{i < unlocked ? "✅" : pf.icon}</span>
                  <div><div style={{ fontSize: 12, fontWeight: 600, color: i < unlocked ? "var(--up)" : "var(--ink)" }}>{pf.title}</div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{i < unlocked ? "Unlocked!" : pf.desc}</div></div>
                </div>)}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, padding: "11px 14px", fontFamily: "var(--fm)", fontSize: 12, color: "var(--slate)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>knowyourpay.in?ref=invite</div>
                <button onClick={copyInvite} style={{ padding: "11px 18px", fontFamily: "var(--fb)", fontSize: 13, fontWeight: 700, color: "#fff", background: invCopied ? "var(--up)" : "var(--ink)", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" }}>{invCopied ? "Copied! ✓" : "Copy link"}</button>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => doShare("whatsapp", shareImg)} style={{ flex: 1, padding: 10, fontSize: 12, fontWeight: 600, color: "#fff", background: "#25D366", border: "none", borderRadius: 8, cursor: "pointer" }}>WhatsApp</button>
                <button onClick={() => doShare("twitter", shareImg)} style={{ flex: 1, padding: 10, fontSize: 12, fontWeight: 600, color: "#fff", background: "#0a0f1a", border: "none", borderRadius: 8, cursor: "pointer" }}>𝕏</button>
                <button onClick={() => doShare("linkedin", shareImg)} style={{ flex: 1, padding: 10, fontSize: 12, fontWeight: 600, color: "#fff", background: "#0a66c2", border: "none", borderRadius: 8, cursor: "pointer" }}>LinkedIn</button>
              </div>
            </div></FI>
          </div>}

          {/* Share */}
          <FI d={500}><div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 14, padding: mob ? "18px" : "24px", marginBottom: 12, boxShadow: "0 4px 24px rgba(10,15,26,.06)" }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>Spread the word</div>
            <div style={{ fontFamily: "var(--fd)", fontSize: mob ? 16 : 18, fontWeight: 200, marginBottom: 4 }}>Know someone switching jobs? <span style={{ fontWeight: 700, fontStyle: "italic" }}>They need this.</span></div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, marginBottom: 16 }}>Share the tool (not your report) — and unlock Pro features.</div>
            {/* Native share (mobile) — includes image */}
            {navigator.share && <button onClick={() => doShare("native", shareImg)} style={{ width: "100%", padding: "13px 0", fontFamily: "var(--fb)", fontSize: mob ? 13 : 14, fontWeight: 700, color: "#fff", background: "var(--ink)", border: "none", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              📤 Share (with image)
            </button>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <button onClick={() => doShare("whatsapp", shareImg)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 8px", fontFamily: "var(--fb)", fontSize: mob ? 12 : 13, fontWeight: 700, color: "#fff", background: "#25D366", border: "none", borderRadius: 10, cursor: "pointer" }}>WhatsApp</button>
              <button onClick={() => doShare("twitter", shareImg)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 8px", fontFamily: "var(--fb)", fontSize: mob ? 12 : 13, fontWeight: 700, color: "#fff", background: "#0a0f1a", border: "none", borderRadius: 10, cursor: "pointer" }}>𝕏</button>
              <button onClick={() => doShare("linkedin", shareImg)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 8px", fontFamily: "var(--fb)", fontSize: mob ? 12 : 13, fontWeight: 700, color: "#fff", background: "#0a66c2", border: "none", borderRadius: 10, cursor: "pointer" }}>LinkedIn</button>
            </div>
            <button onClick={() => { if (!shareImg) return; const a = document.createElement("a"); a.href = shareImg; a.download = "knowyourpay.png"; a.click() }} style={{ width: "100%", padding: 11, fontFamily: "var(--fb)", fontSize: 12, fontWeight: 600, color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>⬇ Download share image</button>
          </div></FI>

          <Ft />
        </div>}
      </div>
      {step < 3 && <div style={{ marginTop: "auto" }}><Ft /></div>}
    </div>
  </div>;
}
