import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import * as XLSX from "xlsx";

// ── RESPONSIVE CONTEXT ────────────────────────────────────────────────────────
var ResponsiveContext=createContext({mob:false,w:1024});
function ResponsiveProvider({children}){
  var [w,setW]=useState(typeof window!=="undefined"?window.innerWidth:1024);
  useEffect(function(){
    function onResize(){setW(window.innerWidth);}
    window.addEventListener("resize",onResize);
    return function(){window.removeEventListener("resize",onResize);};
  },[]);
  return <ResponsiveContext.Provider value={{w:w,mob:w<640}}>{children}</ResponsiveContext.Provider>;
}
function useR(){return useContext(ResponsiveContext);}

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
var PLATFORMS=["Instagram","Facebook","TikTok","X (Twitter)","YouTube"];
var CONTENT_TYPES={Instagram:["Reel","Carousel","Story","Static Post"],Facebook:["Video","Post","Story","Reel"],TikTok:["Short Video","Duet","Stitch","Live"],"X (Twitter)":["Tweet","Thread","Poll","Space"],YouTube:["Short","Long-form Video","Community Post"]};
var VIDEO_TYPES=["Reel","Short Video","Duet","Stitch","Live","Short","Long-form Video","Video"];
var PILLARS=["Education","Promotion","Storytelling","Entertainment","Inspiration","Behind the Scenes","User Generated","Product"];
var TONES=["Professional","Casual & Friendly","Witty & Playful","Inspirational","Urgent & FOMO","Educational","Bold & Direct","Empathetic","Luxury & Premium","Gen Z Slang"];
var THAILAND_INDUSTRIES={"🌾 Agriculture & Food":{icon:"🌾",color:"#16a34a",bg:"#dcfce7",border:"#86efac",subs:["Rice & Grains","Rubber & Latex","Seafood & Aquaculture","Fruits & Vegetables","Processed Food","Organic Farming"]},"🚗 Automotive":{icon:"🚗",color:"#1d4ed8",bg:"#dbeafe",border:"#93c5fd",subs:["Car Manufacturing","Auto Parts","EV & Electric Vehicles","Motorcycles","Aftermarket Parts"]},"📱 Electronics & Tech":{icon:"📱",color:"#7c3aed",bg:"#f3e8ff",border:"#d8b4fe",subs:["Consumer Electronics","Software & Apps","E-commerce","Fintech","AI & Automation","Telecoms"]},"🏥 Healthcare & Medical":{icon:"🏥",color:"#dc2626",bg:"#fee2e2",border:"#fca5a5",subs:["Hospitals & Clinics","Medical Tourism","Pharmaceuticals","Wellness & Spa","Mental Health","Cosmetic Surgery"]},"✈️ Tourism & Hospitality":{icon:"✈️",color:"#0891b2",bg:"#cffafe",border:"#67e8f9",subs:["Hotels & Resorts","Travel Agencies","Airlines","Restaurants & F&B","MICE & Events","Eco-tourism"]},"🏗️ Real Estate":{icon:"🏗️",color:"#92400e",bg:"#fef3c7",border:"#fde68a",subs:["Residential Property","Commercial Property","Construction Materials","Interior Design","Co-working Spaces"]},"👗 Fashion & Retail":{icon:"👗",color:"#be185d",bg:"#fce7f3",border:"#f9a8d4",subs:["Apparel & Clothing","Luxury Goods","Online Retail","Beauty & Cosmetics","Sportswear"]},"💰 Finance & Banking":{icon:"💰",color:"#047857",bg:"#d1fae5",border:"#6ee7b7",subs:["Commercial Banks","Insurance","Investment","Digital Banking","Securities"]},"⚡ Energy":{icon:"⚡",color:"#d97706",bg:"#fef9c3",border:"#fde68a",subs:["Solar Energy","Wind Power","Petrochemicals","EV Charging","Waste Management"]},"📦 Logistics":{icon:"📦",color:"#0d9488",bg:"#e8f5f3",border:"#a7d9d4",subs:["Shipping & Freight","Last-mile Delivery","Warehousing","Supply Chain","Cold Chain"]},"🎓 Education":{icon:"🎓",color:"#4f46e5",bg:"#e0e7ff",border:"#a5b4fc",subs:["International Schools","Universities","EdTech","Language Learning","Online Courses"]},"🎬 Media & Entertainment":{icon:"🎬",color:"#c2410c",bg:"#ffedd5",border:"#fdba74",subs:["TV & Streaming","Music","Gaming","Advertising","Social Media","Film & Production"]}};
var TEAL="#0d9488",TL="#e8f5f3",TM="#14b8a6";
var PILLAR_COLORS={Education:"#0d9488",Promotion:"#dc2626",Storytelling:"#7c3aed",Entertainment:"#d97706",Inspiration:"#0891b2","Behind the Scenes":"#be185d","User Generated":"#16a34a",Product:"#f59e0b"};
var PRIORITY_COLORS={High:"#dc2626",Medium:"#d97706",Low:"#16a34a"};
var PLATFORM_ICONS={Instagram:"📸",Facebook:"📘",TikTok:"🎵","X (Twitter)":"🐦",YouTube:"▶️"};
var SENSITIVE_PATTERNS=[/email/i,/phone/i,/mobile/i,/tel/i,/\bname\b/i,/firstname/i,/lastname/i,/\bid\b/i,/passport/i,/national/i,/citizen/i,/address/i,/dob/i,/birth/i,/salary/i,/income/i,/credit/i,/card/i,/bank/i,/account/i,/password/i,/ssn/i,/tax/i];
function isSensitiveCol(col){return SENSITIVE_PATTERNS.some(function(p){return p.test(col);});}
function maskValue(val){if(!val)return "";var s=String(val);if(s.length<=2)return "••••";return s[0]+"••••"+s[s.length-1];}

var CSS=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
@keyframes pop{0%{transform:scale(0.85);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes barGrow{from{width:0}to{width:var(--w)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
.fadeUp{animation:fadeUp .4s cubic-bezier(.22,1,.36,1) both}
.fadeIn{animation:fadeIn .35s ease both}
.pop{animation:pop .4s cubic-bezier(.22,1,.36,1) both}
.slideIn{animation:slideIn .35s cubic-bezier(.22,1,.36,1) both}
.slideDown{animation:slideDown .3s cubic-bezier(.22,1,.36,1) both}
.slideRight{animation:slideRight .35s cubic-bezier(.22,1,.36,1) both}
.shake{animation:shake .4s cubic-bezier(.22,1,.36,1)}
.card-hover{transition:transform .2s,box-shadow .2s}
.card-hover:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(13,148,136,.13)!important}
.pill-hover{transition:all .18s}.pill-hover:hover{filter:brightness(.95);transform:scale(1.03)}
.btn-hover{transition:all .18s}.btn-hover:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.06)}.btn-hover:active:not(:disabled){transform:scale(.97)}
.input-focus{transition:border-color .2s,box-shadow .2s}.input-focus:focus{border-color:#0d9488!important;box-shadow:0 0 0 3px rgba(13,148,136,.12)!important;outline:none}
.spin{animation:spin .8s linear infinite}
.float{animation:float 3s ease-in-out infinite}
`;

function useInject(){useEffect(function(){if(document.getElementById("pp-styles"))return;var s=document.createElement("style");s.id="pp-styles";s.textContent=CSS;document.head.appendChild(s);},[]);}

// ── CRYPTO ────────────────────────────────────────────────────────────────────
async function deriveKey(pin,saltHex){var enc=new TextEncoder();var km=await crypto.subtle.importKey("raw",enc.encode(pin),{name:"PBKDF2"},false,["deriveKey"]);var salt=hexToBytes(saltHex);return crypto.subtle.deriveKey({name:"PBKDF2",salt:salt,iterations:100000,hash:"SHA-256"},km,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);}
function bytesToHex(buf){return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,"0");}).join("");}
function hexToBytes(hex){var arr=new Uint8Array(hex.length/2);for(var i=0;i<hex.length;i+=2)arr[i/2]=parseInt(hex.substr(i,2),16);return arr;}
async function hashPin(pin){var enc=new TextEncoder();var buf=await crypto.subtle.digest("SHA-256",enc.encode(pin+"pp_salt_2025"));return bytesToHex(buf);}
async function encryptData(data,pin){try{var saltArr=crypto.getRandomValues(new Uint8Array(16));var saltHex=bytesToHex(saltArr);var key=await deriveKey(pin,saltHex);var iv=crypto.getRandomValues(new Uint8Array(12));var enc=new TextEncoder();var ct=await crypto.subtle.encrypt({name:"AES-GCM",iv:iv},key,enc.encode(JSON.stringify(data)));return JSON.stringify({salt:saltHex,iv:bytesToHex(iv),ct:bytesToHex(ct)});}catch(e){return JSON.stringify(data);}}
async function decryptData(stored,pin){try{var parsed=JSON.parse(stored);if(!parsed.salt)return parsed;var key=await deriveKey(pin,parsed.salt);var iv=hexToBytes(parsed.iv);var ct=hexToBytes(parsed.ct);var pt=await crypto.subtle.decrypt({name:"AES-GCM",iv:iv},key,ct);return JSON.parse(new TextDecoder().decode(pt));}catch(e){return null;}}

// ── SHARED UI ─────────────────────────────────────────────────────────────────
function Label({children}){return <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.7,marginBottom:7}}>{children}</div>;}
function Card({children,style,animate,delay}){
  var {mob}=useR();style=style||{};animate=animate||"fadeUp";delay=delay||0;
  return <div className={animate} style={Object.assign({background:"#fff",borderRadius:mob?14:18,border:"1px solid #d1ede9",padding:mob?"14px 12px":24,animationDelay:delay+"ms"},style)}>{children}</div>;
}
function Btn({children,onClick,disabled,outline,full,small,danger,style}){
  style=style||{};
  var bg=danger?"#fee2e2":outline?"#fff":disabled?"#a7d9d4":("linear-gradient(135deg,"+TEAL+","+TM+")");
  var color=danger?"#dc2626":outline?TEAL:"#fff";
  var border="2px solid "+(danger?"#fca5a5":outline?TEAL:disabled?"#a7d9d4":"transparent");
  var shadow=(outline||disabled||danger)?"none":"0 4px 16px rgba(13,148,136,.28)";
  return <button className="btn-hover" onClick={onClick} disabled={disabled} style={Object.assign({padding:small?"8px 16px":"12px 24px",borderRadius:12,fontSize:small?12:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",width:full?"100%":"auto",background:bg,color:color,border:border,boxShadow:shadow,WebkitTapHighlightColor:"transparent",fontFamily:"inherit"},style)}>{children}</button>;
}
function Bar({pct,color,delay}){
  delay=delay||0;
  return <div style={{background:TL,borderRadius:99,height:8,flex:1,overflow:"hidden"}}><div style={{"--w":Math.min(pct,100)+"%",width:Math.min(pct,100)+"%",background:color,borderRadius:99,height:8,animation:"barGrow .8s "+delay+"ms cubic-bezier(.22,1,.36,1) both"}}/></div>;
}
function Toggle({value,onChange}){return <div onClick={function(){onChange(!value);}} style={{width:40,height:22,borderRadius:99,background:value?TEAL:"#d1d5db",cursor:"pointer",position:"relative",transition:"background .25s",flexShrink:0}}><div style={{position:"absolute",top:3,left:value?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/></div>;}
function PillGroup({options,value,onChange,icons}){
  var {mob}=useR();icons=icons||{};
  return <div style={{display:"flex",flexWrap:"wrap",gap:mob?6:8}}>{options.map(function(o,i){return <div key={o} className="pill-hover slideIn" onClick={function(){onChange(o);}} style={{cursor:"pointer",padding:mob?"7px 11px":"8px 16px",borderRadius:99,fontSize:mob?12:13,fontWeight:600,userSelect:"none",background:value===o?TEAL:TL,color:value===o?"#fff":TEAL,border:"1.5px solid "+(value===o?TEAL:"#a7d9d4"),boxShadow:value===o?"0 2px 10px rgba(13,148,136,.25)":"none",animationDelay:(i*40)+"ms",WebkitTapHighlightColor:"transparent"}}>{icons[o]&&<span style={{marginRight:4}}>{icons[o]}</span>}{o}</div>;})}</div>;
}
function Spinner(){return <span className="spin" style={{display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%"}}/>;}
function ScoreRing({score,size,delay}){
  size=size||90;delay=delay||0;
  var [anim,setAnim]=useState(0);
  useEffect(function(){var t=setTimeout(function(){setAnim(score);},delay+100);return function(){clearTimeout(t);};},[score,delay]);
  var color=score>=7?"#0d9488":score>=5?"#f59e0b":"#ef4444";
  var r=size*.4,c=2*Math.PI*r,pct=(anim/10)*c;
  return <div className="pop" style={{position:"relative",width:size,height:size,flexShrink:0,animationDelay:delay+"ms"}}><svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={TL} strokeWidth={size*.09}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size*.09} strokeDasharray={pct+" "+c} strokeLinecap="round" style={{transition:"stroke-dasharray .9s cubic-bezier(.22,1,.36,1)"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:size*.24,fontWeight:900,color:color,lineHeight:1}}>{score}</span><span style={{fontSize:size*.12,color:"#aaa"}}>/10</span></div></div>;
}
function Steps({current,labels}){
  var {mob}=useR();
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:mob?18:28}}>{labels.map(function(s,i){var done=i<current,active=i===current;return <div key={i} style={{display:"flex",alignItems:"center"}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{width:mob?26:34,height:mob?26:34,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:mob?10:13,background:done?TEAL:active?TL:"#f0f0f0",color:done?"#fff":active?TEAL:"#bbb",border:"2.5px solid "+(done||active?TEAL:"#e0e0e0"),boxShadow:active?"0 0 0 4px rgba(13,148,136,.15)":"none"}}>{done?"✓":i+1}</div><div style={{fontSize:mob?9:10,fontWeight:active?700:500,color:active?TEAL:"#aaa",whiteSpace:"nowrap"}}>{s}</div></div>{i<labels.length-1&&<div style={{width:mob?28:48,height:2.5,margin:"0 3px",marginBottom:mob?16:20,background:done?TEAL:"#e0e0e0"}}/>}</div>;})} </div>;
}
function BgDots(){return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>{[[8,12],[85,25],[15,70],[90,80],[50,5],[40,90],[70,50]].map(function(xy,i){return <div key={i} style={{position:"absolute",left:xy[0]+"%",top:xy[1]+"%",width:i%2===0?200:120,height:i%2===0?200:120,borderRadius:"50%",background:"radial-gradient(circle,rgba(13,148,136,"+(i%3===0?.06:.04)+") 0%,transparent 70%)",animation:"float "+(3+i*.5)+"s ease-in-out infinite",animationDelay:(i*.4)+"s"}}/>;})} </div>;}
function Logo({size}){size=size||42;return <svg width={size} height={size} viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor:"#0d9488"}}/><stop offset="100%" style={{stopColor:"#14b8a6"}}/></linearGradient></defs><rect width="42" height="42" rx="10" fill="url(#hGrad)"/><rect x="6" y="28" width="5" height="10" rx="2" fill="rgba(255,255,255,.35)"/><rect x="13" y="22" width="5" height="16" rx="2" fill="rgba(255,255,255,.55)"/><rect x="20" y="16" width="5" height="22" rx="2" fill="rgba(255,255,255,.75)"/><rect x="27" y="11" width="5" height="27" rx="2" fill="#fff"/></svg>;}
function SensitiveBadge({cols}){if(!cols||cols.length===0)return null;return <div style={{background:"#fef9c3",border:"1px solid #fde68a",borderRadius:8,padding:"6px 10px",marginTop:8,display:"flex",alignItems:"flex-start",gap:6}}><span style={{fontSize:14,flexShrink:0}}>⚠️</span><div><div style={{fontSize:11,fontWeight:700,color:"#92400e",marginBottom:2}}>Sensitive columns detected & masked in UI</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{cols.map(function(c){return <span key={c} style={{background:"#fde68a",color:"#78350f",borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:700}}>{c}</span>;})}</div></div></div>;}
function verdictStyle(v){var map={Great:{bg:"#dcfce7",color:"#16a34a",emoji:"🌟"},Good:{bg:"#d1fae5",color:"#059669",emoji:"✅"},"Needs Work":{bg:"#fef9c3",color:"#ca8a04",emoji:"⚠️"},Poor:{bg:"#fee2e2",color:"#dc2626",emoji:"❌"}};return map[v]||{bg:TL,color:TEAL,emoji:"📊"};}

// ── ONBOARDING SLIDES ─────────────────────────────────────────────────────────
var ONBOARDING_SLIDES=[
  {icon:"👋",color:TEAL,bg:TL,title:"Welcome to PredictaPost",subtitle:"Know Before You Post.",body:"Your AI-powered content intelligence tool. Built for marketers, agencies, and brands who want to create smarter — not just faster.",tip:"💡 This tour covers all 6 features. Takes about 60 seconds."},
  {icon:"🔍",color:TEAL,bg:TL,title:"Evaluate",subtitle:"Score any content idea before it goes live.",body:"Paste a caption, pick your platform and content pillar, and get an instant AI score across Voice, Clarity, and Engagement — plus an improved version and hashtag recommendations.",tip:"💡 Upload your past post data in ⚙️ Data to benchmark against your own history."},
  {icon:"📅",color:"#0891b2",bg:"#cffafe",title:"Calendar Planner",subtitle:"Plan a full month in minutes.",body:"Set your brand, platform, goal, and posts-per-week. The AI generates a complete content calendar with caption drafts, hooks, visual direction, and best posting times for every day.",tip:"💡 Export as CSV and drop it straight into your project management tool."},
  {icon:"💡",color:"#7c3aed",bg:"#f3e8ff",title:"Brainstorm",subtitle:"Never stare at a blank page again.",body:"Give the AI a topic or theme and instantly get 3 fully-written content ideas — each with a caption, predicted score, and a hook for video content.",tip:"💡 Use Brainstorm at the start of a campaign brief to explore angles."},
  {icon:"⚔️",color:"#dc2626",bg:"#fee2e2",title:"Compare",subtitle:"A/B test your captions before posting.",body:"Write two caption versions and let the AI pick the winner — with a side-by-side score breakdown, strengths, weaknesses, and an improved version of the best one.",tip:"💡 Show clients data, not just opinions."},
  {icon:"✍️",color:"#be185d",bg:"#fce7f3",title:"Caption Rewriter",subtitle:"One caption. Multiple tones.",body:"Paste any existing caption and rewrite it in up to 3 tones — Professional, Gen Z, Witty, Urgent, Luxury, and more. Each version is scored and ready to copy.",tip:"💡 Set Brand Voice Notes to keep every rewrite on-brand."},
  {icon:"⚙️",color:"#92400e",bg:"#fef3c7",title:"Data & Security",subtitle:"Connect your data. Protect your clients.",body:"Upload CSV or Excel files, connect Google Sheets, or pull live web benchmarks. Set a PIN to encrypt all stored data with AES-256 — essential for client work.",tip:"💡 Sensitive columns like emails and phone numbers are auto-detected and masked."},
];

function OnboardingModal({onDone}){
  var {mob}=useR();
  var [idx,setIdx]=useState(0);
  var slide=ONBOARDING_SLIDES[idx];
  var total=ONBOARDING_SLIDES.length;
  var isLast=idx===total-1;
  return <div className="fadeIn" style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:mob?"flex-end":"center",justifyContent:"center",background:"rgba(0,0,0,.45)",backdropFilter:"blur(6px)",fontFamily:"'Inter',sans-serif",padding:mob?0:20}}>
    <div className="pop" style={{background:"#fff",borderRadius:mob?"22px 22px 0 0":"24px",width:"100%",maxWidth:mob?"100%":480,boxShadow:"0 32px 80px rgba(0,0,0,.2)",overflow:"hidden"}}>
      <div style={{height:4,background:"#f1f5f9"}}><div style={{height:4,background:"linear-gradient(90deg,"+TEAL+","+TM+")",width:((idx+1)/total*100)+"%",transition:"width .4s cubic-bezier(.22,1,.36,1)"}}/></div>
      <div style={{padding:mob?"22px 20px 14px":"36px 36px 24px"}}>
        <div style={{width:mob?48:64,height:mob?48:64,borderRadius:mob?14:20,background:slide.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:mob?24:30,marginBottom:mob?14:18,boxShadow:"0 4px 16px "+slide.color+"22"}}>{slide.icon}</div>
        <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{idx===0?"Getting Started":"Feature "+idx+" of "+(total-1)}</div>
        <div style={{fontWeight:900,fontSize:mob?18:22,color:"#1a1a1a",marginBottom:3,lineHeight:1.2}}>{slide.title}</div>
        <div style={{fontWeight:600,fontSize:mob?12:14,color:slide.color,marginBottom:10}}>{slide.subtitle}</div>
        <div style={{fontSize:mob?12:14,color:"#555",lineHeight:1.7,marginBottom:12}}>{slide.body}</div>
        <div style={{background:slide.bg,borderRadius:10,padding:"10px 13px",fontSize:mob?11:13,color:slide.color,lineHeight:1.6,fontWeight:500}}>{slide.tip}</div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:6,padding:"6px 0"}}>
        {ONBOARDING_SLIDES.map(function(_,i){return <div key={i} onClick={function(){setIdx(i);}} style={{width:i===idx?18:6,height:6,borderRadius:99,background:i===idx?TEAL:"#e2e8f0",transition:"all .3s",cursor:"pointer"}}/>;})}</div>
      <div style={{padding:mob?"10px 20px 28px":"16px 36px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
        <button onClick={onDone} style={{background:"none",border:"none",color:"#94a3b8",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Skip</button>
        <div style={{display:"flex",gap:8}}>
          {idx>0&&<Btn small outline onClick={function(){setIdx(function(i){return i-1;});}}>← Back</Btn>}
          {!isLast&&<Btn small onClick={function(){setIdx(function(i){return i+1;});}}>Next →</Btn>}
          {isLast&&<Btn small onClick={onDone}>🚀 Let's go!</Btn>}
        </div>
      </div>
    </div>
  </div>;
}

// ── HELP PANEL ────────────────────────────────────────────────────────────────
var HELP_ITEMS=[
  {icon:"🔍",title:"Evaluate",color:TEAL,bg:TL,desc:"Score a caption before posting. Get Voice/Clarity/Engagement scores, improved caption, and hashtags.",tip:"Upload past post data in ⚙️ Data to benchmark against your own history."},
  {icon:"📅",title:"Calendar Planner",color:"#0891b2",bg:"#cffafe",desc:"Generate a full month content plan with caption drafts, hooks, visual direction, and posting times.",tip:"Export as CSV and paste into Notion, Asana, or any planner."},
  {icon:"💡",title:"Brainstorm",color:"#7c3aed",bg:"#f3e8ff",desc:"Get 3 AI-generated content ideas from a topic. Each comes with a full caption, score, and video hook.",tip:"Great for kick-starting campaign briefs."},
  {icon:"⚔️",title:"Compare",color:"#dc2626",bg:"#fee2e2",desc:"Paste two captions and get a head-to-head AI verdict with scores, strengths, weaknesses, and an improved winner.",tip:"Use to show clients data-backed decisions, not just gut feel."},
  {icon:"✍️",title:"Caption Rewriter",color:"#be185d",bg:"#fce7f3",desc:"Rewrite any caption in up to 3 tones — Professional, Witty, Gen Z, Urgent, Luxury & more.",tip:"Add Brand Voice Notes to keep rewrites on-brand."},
  {icon:"📂",title:"Data Sources",color:"#92400e",bg:"#fef3c7",desc:"Connect CSV/Excel files, Google Sheets, or live web benchmarks in ⚙️ Data to improve scoring.",tip:"Sensitive columns (email, phone, ID etc.) are auto-detected and masked."},
  {icon:"🔐",title:"Security & PIN",color:"#047857",bg:"#d1fae5",desc:"Set a PIN in ⚙️ Data → Security. All stored data is encrypted with AES-256-GCM.",tip:"PIN is never stored in plain text. Without the correct PIN, stored data is unreadable."},
];
function HelpPanel({onClose,onReplayTutorial}){
  var {mob}=useR();
  return <div className="fadeIn" style={{position:"fixed",inset:0,zIndex:200,display:"flex"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.35)",backdropFilter:"blur(4px)"}}/>
    <div className="slideRight" style={{position:"relative",marginLeft:"auto",width:mob?"92%":500,maxWidth:"100vw",height:"100%",background:"#fff",boxShadow:"-8px 0 40px rgba(0,0,0,.12)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:mob?"14px 16px":"20px 24px",borderBottom:"1px solid #e8f5f3",background:"linear-gradient(135deg,"+TEAL+","+TM+")",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontWeight:900,fontSize:mob?16:18,color:"#fff"}}>❓ Help & Guide</div><div style={{fontSize:11,color:"rgba(255,255,255,.8)",marginTop:2}}>Quick reference for all features</div></div>
          <button onClick={onClose} className="btn-hover" style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:mob?14:24}}>
        <div style={{background:"linear-gradient(135deg,"+TEAL+","+TM+")",borderRadius:14,padding:"12px 16px",marginBottom:16}}><div style={{fontSize:11,color:"rgba(255,255,255,.8)",fontWeight:700,marginBottom:4}}>🚀 QUICK START</div><div style={{fontSize:12,color:"#fff",lineHeight:1.6}}>Pick a mode → fill in your content details → let the AI do the heavy lifting. Connect data in ⚙️ for smarter scores.</div></div>
        {HELP_ITEMS.map(function(item){return <div key={item.title} className="card-hover" style={{background:"#fff",border:"1.5px solid #e8f5f3",borderRadius:14,padding:mob?"12px":"16px 18px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{width:mob?36:42,height:mob?36:42,borderRadius:10,background:item.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:mob?17:20,flexShrink:0}}>{item.icon}</div>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:13,color:item.color,marginBottom:3}}>{item.title}</div><div style={{fontSize:11,color:"#555",lineHeight:1.6,marginBottom:7}}>{item.desc}</div><div style={{background:item.bg,borderRadius:7,padding:"5px 9px",fontSize:10,color:item.color,fontWeight:600,lineHeight:1.5}}>💡 {item.tip}</div></div>
          </div>
        </div>;})}
        <div style={{background:"#f8fafc",borderRadius:14,padding:"14px 16px",marginTop:8}}>
          <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:8}}>⚡ Pro Tips</div>
          {["Use 📋 Log to track content quality over time.","In Compare, screenshot the result to show clients data-backed decisions.","Add Campaign Notes in Calendar — mention key dates and restrictions.","Set a Character Limit in Rewriter to keep captions platform-ready.","Search web benchmarks in ⚙️ before you evaluate for better context."].map(function(t,i){return <div key={i} style={{display:"flex",gap:7,marginBottom:7,alignItems:"flex-start"}}><span style={{color:TEAL,fontWeight:700,flexShrink:0}}>→</span><div style={{fontSize:11,color:"#555",lineHeight:1.5}}>{t}</div></div>;})}
        </div>
      </div>
      <div style={{padding:mob?"12px 14px":"16px 24px",borderTop:"1px solid #e8f5f3",background:"#fafffe",flexShrink:0}}>
        <button onClick={onReplayTutorial} style={{width:"100%",padding:"11px 0",borderRadius:12,background:TL,border:"2px solid "+TEAL,color:TEAL,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>▶ Replay Welcome Tutorial</button>
      </div>
    </div>
  </div>;
}

// ── PIN LOCK ──────────────────────────────────────────────────────────────────
function PinLock({mode,onUnlock,onSkip,onSetPin}){
  var {mob}=useR();
  var [pin,setPin]=useState("");var [confirm,setConfirm]=useState("");var [error,setError]=useState("");var [shakeKey,setShakeKey]=useState(0);
  function handleDigit(d){if(pin.length>=6)return;var next=pin+d;setPin(next);setError("");if(next.length===6&&mode==="verify"){setTimeout(function(){submit(next);},80);}}
  function handleDelete(){setPin(function(p){return p.slice(0,-1);});}
  async function submit(p){
    var code=p||pin;if(code.length<4){setError("PIN must be at least 4 digits.");return;}
    if(mode==="setup"){if(!confirm){setConfirm(code);setPin("");return;}if(code!==confirm){setError("PINs don't match. Try again.");setPin("");setConfirm("");setShakeKey(function(k){return k+1;});return;}await onSetPin(code);}
    else{var ok=await onUnlock(code);if(!ok){setError("Incorrect PIN.");setPin("");setShakeKey(function(k){return k+1;});}}
  }
  var digits=["1","2","3","4","5","6","7","8","9","","0","⌫"];
  return <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0d9488 0%,#0e7490 100%)",fontFamily:"'Inter',sans-serif",padding:mob?16:24}}>
    <div className="pop" style={{background:"#fff",borderRadius:mob?20:24,padding:mob?"28px 20px":"40px 32px",width:"100%",maxWidth:mob?"100%":360,boxShadow:"0 24px 64px rgba(0,0,0,.18)",textAlign:"center"}}>
      <div className="float" style={{display:"inline-block",marginBottom:14}}><Logo size={mob?40:52}/></div>
      <div style={{fontWeight:900,fontSize:mob?20:22,color:"#1a1a1a",marginBottom:4}}>PredictaPost</div>
      <div style={{fontSize:12,color:"#64748b",marginBottom:22}}>{mode==="setup"?(confirm?"Confirm your PIN":"Set a PIN to protect your data"):"Enter your PIN to continue"}</div>
      <div key={shakeKey} className={shakeKey>0?"shake":""} style={{display:"flex",justifyContent:"center",gap:12,marginBottom:18}}>
        {[0,1,2,3,4,5].map(function(i){var filled=i<pin.length;return <div key={i} style={{width:mob?12:14,height:mob?12:14,borderRadius:"50%",background:filled?TEAL:"#e2e8f0",border:"2px solid "+(filled?TEAL:"#cbd5e1"),transition:"all .15s"}}/>;})}</div>
      {error&&<div className="fadeIn" style={{background:"#fee2e2",color:"#dc2626",borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:600,marginBottom:14}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:mob?8:10,marginBottom:16}}>
        {digits.map(function(d,i){if(d==="")return <div key={i}/>;var isDel=d==="⌫";return <button key={i} onClick={function(){isDel?handleDelete():handleDigit(d);}} style={{padding:mob?"14px 0":"16px 0",borderRadius:mob?12:14,fontSize:mob?18:20,fontWeight:700,border:"1.5px solid #e2e8f0",background:isDel?"#fee2e2":"#f8fafc",color:isDel?"#dc2626":"#1a1a1a",cursor:"pointer",fontFamily:"inherit",WebkitTapHighlightColor:"transparent"}}>{d}</button>;})}
      </div>
      {pin.length>=4&&mode==="setup"&&!confirm&&<Btn full onClick={function(){submit();}}>Set PIN →</Btn>}
      {pin.length>=4&&mode==="setup"&&confirm&&<Btn full onClick={function(){submit();}}>Confirm PIN →</Btn>}
      <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
        {mode==="setup"&&<button onClick={onSkip} style={{background:"none",border:"none",color:"#94a3b8",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Skip — use without PIN</button>}
        {mode==="verify"&&<button onClick={onSkip} style={{background:"none",border:"none",color:"#94a3b8",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Forgot PIN? Clear all data</button>}
      </div>
    </div>
    <div style={{marginTop:16,fontSize:11,color:"rgba(255,255,255,.6)",textAlign:"center"}}>🔐 AES-256-GCM · PIN never stored in plain text</div>
  </div>;
}

// ── SECURITY SETTINGS ─────────────────────────────────────────────────────────
function SecuritySettings({pinEnabled,onSetPin,onRemovePin}){
  var [step,setStep]=useState("menu");var [pin,setPin]=useState("");var [confirm,setConfirm]=useState("");var [currentPin,setCurrentPin]=useState("");var [error,setError]=useState("");var [success,setSuccess]=useState("");
  var inputStyle={width:"100%",padding:"11px 14px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:14,fontFamily:"inherit",color:"#333",background:"#fafffe",marginBottom:10,letterSpacing:4};
  async function doSetPin(){if(pin.length<4){setError("PIN must be at least 4 digits.");return;}if(pin!==confirm){setError("PINs don't match.");return;}await onSetPin(pin);setSuccess("✅ PIN set. All data is now encrypted.");setStep("menu");setPin("");setConfirm("");setError("");}
  async function doRemovePin(){var ok=await onRemovePin(currentPin);if(!ok){setError("Incorrect current PIN.");return;}setSuccess("🔓 PIN removed.");setStep("menu");setCurrentPin("");setError("");}
  return <div>
    {success&&<div className="fadeIn" style={{background:"#dcfce7",border:"1px solid #86efac",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#16a34a",fontWeight:600,marginBottom:16}}>{success}</div>}
    {step==="menu"&&<div>
      <div style={{background:pinEnabled?"#dcfce7":"#fef9c3",border:"1px solid "+(pinEnabled?"#86efac":"#fde68a"),borderRadius:14,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
        <div style={{fontSize:28}}>{pinEnabled?"🔐":"🔓"}</div>
        <div><div style={{fontWeight:700,fontSize:14,color:pinEnabled?"#16a34a":"#92400e"}}>{pinEnabled?"PIN Protection Active":"No PIN Set"}</div><div style={{fontSize:12,color:pinEnabled?"#166534":"#78350f",marginTop:2}}>{pinEnabled?"All stored data is AES-256 encrypted":"Data stored in plain text"}</div></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {!pinEnabled&&<Btn full onClick={function(){setStep("setup");setSuccess("");}}>🔐 Set PIN</Btn>}
        {pinEnabled&&<Btn full outline onClick={function(){setStep("setup");setSuccess("");}}>🔄 Change PIN</Btn>}
        {pinEnabled&&<Btn full danger onClick={function(){setStep("remove");setSuccess("");}}>🔓 Remove PIN</Btn>}
      </div>
      <div style={{marginTop:14,background:TL,borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:11,fontWeight:700,color:TEAL,marginBottom:6}}>🛡 What's protected</div>{["Evaluation log & scores","Uploaded CSV / Excel data","Google Sheets cache","Live web benchmark data"].map(function(item){return <div key={item} style={{fontSize:11,color:"#555",marginBottom:3,display:"flex",gap:6}}><span style={{color:TEAL}}>✓</span>{item}</div>;})}</div>
    </div>}
    {step==="setup"&&<div>
      <div style={{fontWeight:700,fontSize:14,color:TEAL,marginBottom:14}}>🔐 {pinEnabled?"Change PIN":"Set PIN"}</div>
      {pinEnabled&&<div style={{marginBottom:10}}><Label>Current PIN</Label><input className="input-focus" type="password" inputMode="numeric" maxLength={6} value={currentPin} onChange={function(e){setCurrentPin(e.target.value.replace(/\D/g,""));}} placeholder="••••••" style={inputStyle}/></div>}
      <Label>New PIN (4–6 digits)</Label><input className="input-focus" type="password" inputMode="numeric" maxLength={6} value={pin} onChange={function(e){setPin(e.target.value.replace(/\D/g,""));}} placeholder="••••" style={inputStyle}/>
      <Label>Confirm New PIN</Label><input className="input-focus" type="password" inputMode="numeric" maxLength={6} value={confirm} onChange={function(e){setConfirm(e.target.value.replace(/\D/g,""));}} placeholder="••••" style={inputStyle}/>
      {error&&<div style={{color:"#dc2626",fontSize:12,marginBottom:10,background:"#fee2e2",borderRadius:8,padding:"8px 12px"}}>{error}</div>}
      <div style={{display:"flex",gap:8,marginTop:4}}><Btn small outline onClick={function(){setStep("menu");setPin("");setConfirm("");setCurrentPin("");setError("");}}>Cancel</Btn><Btn small full onClick={doSetPin}>Set PIN →</Btn></div>
    </div>}
    {step==="remove"&&<div>
      <div style={{fontWeight:700,fontSize:14,color:"#dc2626",marginBottom:12}}>🔓 Remove PIN</div>
      <div style={{fontSize:13,color:"#555",lineHeight:1.6,marginBottom:12}}>Enter your current PIN to confirm. Data will be stored without protection.</div>
      <Label>Current PIN</Label><input className="input-focus" type="password" inputMode="numeric" maxLength={6} value={currentPin} onChange={function(e){setCurrentPin(e.target.value.replace(/\D/g,""));}} placeholder="••••" style={inputStyle}/>
      {error&&<div style={{color:"#dc2626",fontSize:12,marginBottom:10,background:"#fee2e2",borderRadius:8,padding:"8px 12px"}}>{error}</div>}
      <div style={{display:"flex",gap:8,marginTop:4}}><Btn small outline onClick={function(){setStep("menu");setCurrentPin("");setError("");}}>Cancel</Btn><Btn small danger onClick={doRemovePin}>Remove PIN</Btn></div>
    </div>}
  </div>;
}

// ── INDUSTRY SELECTOR ─────────────────────────────────────────────────────────
function IndustrySelector({industry,setIndustry,subIndustry,setSubIndustry}){
  var {mob}=useR();var [open,setOpen]=useState(false);var sel=industry?THAILAND_INDUSTRIES[industry]:null;
  return <div style={{marginBottom:20}} className="fadeUp">
    <Label>Industry <span style={{textTransform:"none",fontWeight:400,color:"#bbb"}}>(optional)</span></Label>
    <div onClick={function(){setOpen(function(o){return !o;});}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 13px",borderRadius:12,border:"1.5px solid "+(open||industry?TEAL:"#d1ede9"),background:industry&&sel?sel.bg:"#fafffe",cursor:"pointer"}}>
      <span style={{fontSize:13,fontWeight:industry?700:400,color:industry&&sel?sel.color:"#aaa"}}>{industry&&sel?(sel.icon+" "+industry):"Select your industry..."}</span>
      <span style={{fontSize:12,color:TEAL}}>{open?"▴":"▾"}</span>
    </div>
    {open&&<div className="slideDown" style={{marginTop:8,background:"#fff",border:"1.5px solid #d1ede9",borderRadius:14,padding:12,boxShadow:"0 8px 32px rgba(13,148,136,.12)",maxHeight:260,overflowY:"auto",position:"relative",zIndex:50}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>{Object.keys(THAILAND_INDUSTRIES).map(function(name){var ind=THAILAND_INDUSTRIES[name];return <div key={name} onClick={function(){setIndustry(name);setSubIndustry("");setOpen(false);}} className="pill-hover" style={{padding:"8px 10px",borderRadius:10,cursor:"pointer",background:industry===name?ind.bg:"#fafffe",border:"1.5px solid "+(industry===name?ind.color:"#e0e0e0"),display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:15}}>{ind.icon}</span><span style={{fontSize:mob?11:12,fontWeight:600,color:industry===name?ind.color:"#444",lineHeight:1.3}}>{name.replace(/^.\s/,"")}</span></div>;})}</div>
      {industry&&<div onClick={function(){setIndustry("");setSubIndustry("");setOpen(false);}} style={{textAlign:"center",marginTop:8,fontSize:12,color:"#ef4444",cursor:"pointer",fontWeight:600}}>✕ Clear</div>}
    </div>}
    {industry&&sel&&<div className="fadeUp" style={{marginTop:10}}><div style={{fontSize:11,fontWeight:700,color:sel.color,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Sub-category</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{sel.subs.map(function(s){return <div key={s} onClick={function(){setSubIndustry(subIndustry===s?"":s);}} className="pill-hover" style={{cursor:"pointer",padding:"5px 11px",borderRadius:99,fontSize:12,fontWeight:600,userSelect:"none",background:subIndustry===s?sel.color:sel.bg,color:subIndustry===s?"#fff":sel.color,border:"1.5px solid "+(subIndustry===s?sel.color:sel.border)}}>{s}</div>;})} </div></div>}
  </div>;
}
function PlatformInputs({platform,setPlatform,ctype,setCtype,pillar,setPillar,industry,setIndustry,subIndustry,setSubIndustry}){
  return <>
    <div style={{marginBottom:20}} className="fadeUp"><Label>Platform</Label><PillGroup options={PLATFORMS} value={platform} onChange={function(v){setPlatform(v);setCtype("");}} icons={PLATFORM_ICONS}/></div>
    {platform&&<div style={{marginBottom:20}} className="fadeUp"><Label>Content Type</Label><PillGroup options={CONTENT_TYPES[platform]} value={ctype} onChange={setCtype}/></div>}
    <IndustrySelector industry={industry} setIndustry={setIndustry} subIndustry={subIndustry} setSubIndustry={setSubIndustry}/>
    <div style={{marginBottom:20}} className="fadeUp"><Label>Content Pillar</Label><PillGroup options={PILLARS} value={pillar} onChange={setPillar}/></div>
  </>;
}

async function callClaude(prompt,imgBase64,useWebSearch){
  var content=imgBase64?[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:imgBase64}},{type:"text",text:prompt}]:prompt;
  var body={model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:content}]};
  if(useWebSearch){body.tools=[{type:"web_search_20250305",name:"web_search"}];}
  var res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  var data=await res.json();
  var text=data.content.map(function(b){return b.type==="text"?b.text:"";}).join("").replace(/```json|```/g,"").trim();
  return JSON.parse(text);
}

// ── FILE CARD ──────────────────────────────────────────────────────────────────
function FileCard({f,onToggle,onDelete,icon}){
  icon=icon||"📄";
  var sensitiveCols=f.rows&&f.rows.length>0?Object.keys(f.rows[0]).filter(isSensitiveCol):[];
  return <div className="fadeUp" style={{background:f.active?"#fff":"#f8f8f8",border:"1.5px solid "+(f.active?TEAL:"#e0e0e0"),borderRadius:14,padding:"13px 14px",marginBottom:10,transition:"all .25s"}}>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{fontSize:22,flexShrink:0}}>{icon}</div>
      <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:13,color:f.active?"#1a1a1a":"#aaa",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.name}</div><div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{f.rowCount} rows · {f.uploadedAt}</div></div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}><Toggle value={f.active} onChange={onToggle}/><button onClick={onDelete} className="btn-hover" style={{background:"#fee2e2",border:"none",color:"#ef4444",width:28,height:28,borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div>
    </div>
    {f.active&&f.rows&&f.rows.length>0&&<div style={{marginTop:9,paddingTop:9,borderTop:"1px solid #e8f5f3"}}>
      <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginBottom:5}}>COLUMNS</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{Object.keys(f.rows[0]).slice(0,7).map(function(col){var sens=isSensitiveCol(col);return <span key={col} style={{background:sens?"#fef9c3":TL,color:sens?"#92400e":TEAL,borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:600}}>{col}{sens?" 🔒":""}</span>;})} {Object.keys(f.rows[0]).length>7&&<span style={{fontSize:10,color:"#94a3b8"}}>+{Object.keys(f.rows[0]).length-7} more</span>}</div>
      <SensitiveBadge cols={sensitiveCols}/>
    </div>}
  </div>;
}

// ── DATA SOURCE MANAGER ───────────────────────────────────────────────────────
function DataSourceManager({files,onAddFiles,onToggleFile,onDeleteFile,onClearFiles,onClose,onAddWebData,pinEnabled,onSetPin,onRemovePin}){
  var {mob}=useR();
  var fileRef=useRef();
  var [dragging,setDragging]=useState(false);var [uploading,setUploading]=useState(false);
  var [gsheetUrl,setGsheetUrl]=useState("");var [gsheetLoading,setGsheetLoading]=useState(false);var [gsheetError,setGsheetError]=useState("");
  var [webQuery,setWebQuery]=useState("");var [webLoading,setWebLoading]=useState(false);var [webResult,setWebResult]=useState(null);
  var [activeTab,setActiveTab]=useState("files");
  function parseFile(f){return new Promise(function(res,rej){var reader=new FileReader();reader.onload=function(ev){try{var wb=XLSX.read(ev.target.result,{type:"binary"});var ws=wb.Sheets[wb.SheetNames[0]];var rows=XLSX.utils.sheet_to_json(ws);res({id:Date.now()+Math.random(),name:f.name,rows:rows.slice(0,100),rowCount:rows.length,uploadedAt:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),active:true,source:"upload"});}catch(e){rej(new Error("Failed to parse "+f.name));}};reader.readAsBinaryString(f);});}
  async function handleFiles(fileList){setUploading(true);var parsed=[];var arr=Array.from(fileList);for(var i=0;i<arr.length;i++){try{var p=await parseFile(arr[i]);parsed.push(p);}catch(e){}}if(parsed.length)onAddFiles(parsed);setUploading(false);}
  async function loadGoogleSheet(){if(!gsheetUrl.trim()){setGsheetError("Please enter a URL.");return;}setGsheetLoading(true);setGsheetError("");try{var match=gsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);if(!match){setGsheetError("Invalid URL.");setGsheetLoading(false);return;}var sheetId=match[1];var gidMatch=gsheetUrl.match(/gid=(\d+)/);var gid=gidMatch?gidMatch[1]:"0";var r=await fetch("https://docs.google.com/spreadsheets/d/"+sheetId+"/export?format=csv&gid="+gid);if(!r.ok)throw new Error("Could not fetch sheet. Make sure it's shared publicly.");var text=await r.text();var lines=text.split("\n").filter(function(l){return l.trim();});if(lines.length<2)throw new Error("Sheet appears to be empty.");var headers=lines[0].split(",").map(function(h){return h.replace(/"/g,"").trim();});var rows=lines.slice(1).map(function(line){var vals=line.split(",").map(function(v){return v.replace(/"/g,"").trim();});return headers.reduce(function(obj,h,i){obj[h]=vals[i]||"";return obj;},{});});onAddFiles([{id:Date.now(),name:"Google Sheet ("+sheetId.slice(0,8)+"...)",rows:rows.slice(0,100),rowCount:rows.length,uploadedAt:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),active:true,source:"gsheet",url:gsheetUrl}]);setGsheetUrl("");}catch(e){setGsheetError(e.message||"Failed to load.");}setGsheetLoading(false);}
  async function searchWeb(){if(!webQuery.trim())return;setWebLoading(true);setWebResult(null);try{var prompt='Search for current social media marketing benchmarks for: "'+webQuery+'". Thailand market if relevant. Return JSON: {"summary":"...","key_stats":[{"metric":"...","value":"..."}],"trends":["t1","t2","t3"]}. ONLY valid JSON no markdown.';var r=await callClaude(prompt,null,true);setWebResult(r);onAddWebData(r,webQuery);}catch(e){setWebResult({error:"Could not fetch live data."});}setWebLoading(false);}
  var totalRows=files.filter(function(f){return f.active;}).reduce(function(a,f){return a+f.rowCount;},0);
  var activeCount=files.filter(function(f){return f.active;}).length;
  var tabs=[{id:"files",label:"📂 Files"},{id:"gsheet",label:"📊 Sheets"},{id:"web",label:"🌐 Web"},{id:"security",label:"🔐 Security"}];
  return <div className="fadeIn" style={{position:"fixed",inset:0,zIndex:200,display:"flex"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.35)",backdropFilter:"blur(4px)"}}/>
    <div className="slideRight" style={{position:"relative",marginLeft:"auto",width:mob?"100%":520,maxWidth:"100vw",height:"100%",background:"#fff",boxShadow:"-8px 0 40px rgba(0,0,0,.12)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:mob?"14px 16px":"20px 24px",borderBottom:"1px solid #e8f5f3",background:"linear-gradient(135deg,"+TEAL+","+TM+")",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div><div style={{fontWeight:900,fontSize:mob?16:18,color:"#fff"}}>⚙️ Data Sources</div><div style={{fontSize:11,color:"rgba(255,255,255,.8)"}}>Files · Sheets · Web · Security</div></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{fontSize:10,color:"rgba(255,255,255,.85)",fontWeight:700,background:"rgba(255,255,255,.2)",borderRadius:99,padding:"3px 9px"}}>{pinEnabled?"🔐 Encrypted":"🔓 Open"}</div><button onClick={onClose} className="btn-hover" style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div>
        </div>
        {files.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12}}>{[{label:"Sources",val:files.length},{label:"Active",val:activeCount},{label:"Rows",val:totalRows}].map(function(item){return <div key={item.label} style={{background:"rgba(255,255,255,.15)",borderRadius:10,padding:"7px 12px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{item.val}</div><div style={{fontSize:10,color:"rgba(255,255,255,.75)",fontWeight:600}}>{item.label}</div></div>;})}</div>}
      </div>
      <div style={{display:"flex",borderBottom:"1px solid #e8f5f3",flexShrink:0}}>{tabs.map(function(t){return <div key={t.id} onClick={function(){setActiveTab(t.id);}} style={{flex:1,padding:"10px 4px",textAlign:"center",fontSize:mob?10:11,fontWeight:700,cursor:"pointer",color:activeTab===t.id?TEAL:"#94a3b8",borderBottom:"2.5px solid "+(activeTab===t.id?TEAL:"transparent"),background:activeTab===t.id?TL:"transparent",transition:"all .2s"}}>{t.label}</div>;})}</div>
      <div style={{flex:1,overflowY:"auto",padding:mob?14:22}}>
        {activeTab==="files"&&<div>
          <div onDragOver={function(e){e.preventDefault();setDragging(true);}} onDragLeave={function(){setDragging(false);}} onDrop={function(e){e.preventDefault();setDragging(false);handleFiles(e.dataTransfer.files);}} onClick={function(){fileRef.current.click();}} style={{border:"2.5px dashed "+(dragging?TEAL:"#a7d9d4"),borderRadius:14,padding:"24px 16px",textAlign:"center",cursor:"pointer",background:dragging?TL:"#fafffe",marginBottom:16}}>
            <div style={{fontSize:28,marginBottom:6}}>{uploading?"⏳":"📂"}</div>
            <div style={{fontWeight:700,fontSize:13,color:TEAL,marginBottom:3}}>{uploading?"Uploading...":"Drop files or tap to browse"}</div>
            <div style={{fontSize:11,color:"#94a3b8"}}>CSV or Excel · Sensitive columns auto-masked</div>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" multiple style={{display:"none"}} onChange={function(e){handleFiles(e.target.files);}}/>
          {files.filter(function(f){return f.source==="upload"||!f.source;}).map(function(f){return <FileCard key={f.id} f={f} onToggle={function(v){onToggleFile(f.id,v);}} onDelete={function(){onDeleteFile(f.id);}}/>;})}</div>}
        {activeTab==="gsheet"&&<div>
          <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"12px 14px",marginBottom:16}}><div style={{fontWeight:700,fontSize:12,color:"#92400e",marginBottom:6}}>📋 How to connect</div>{["Open your Google Sheet","File → Share → Publish to web → CSV","Or: Share → Anyone with link → Viewer","Paste the URL below"].map(function(s,i){return <div key={i} style={{fontSize:11,color:"#78350f",marginBottom:3,display:"flex",gap:6}}><span style={{background:"#f59e0b",color:"#fff",borderRadius:"50%",width:15,height:15,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,flexShrink:0}}>{i+1}</span>{s}</div>;})}</div>
          <Label>Google Sheets URL</Label>
          <div style={{display:"flex",gap:8,marginBottom:10}}><input className="input-focus" value={gsheetUrl} onChange={function(e){setGsheetUrl(e.target.value);}} placeholder="https://docs.google.com/spreadsheets/d/..." style={{flex:1,padding:"10px 13px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:12,fontFamily:"inherit",color:"#333",background:"#fafffe"}}/><Btn small disabled={gsheetLoading} onClick={loadGoogleSheet}>{gsheetLoading?"⏳":"Load"}</Btn></div>
          {gsheetError&&<div style={{color:"#dc2626",fontSize:12,marginBottom:10,background:"#fee2e2",borderRadius:8,padding:"8px 12px"}}>{gsheetError}</div>}
          {files.filter(function(f){return f.source==="gsheet";}).map(function(f){return <FileCard key={f.id} f={f} icon="📊" onToggle={function(v){onToggleFile(f.id,v);}} onDelete={function(){onDeleteFile(f.id);}}/>;})}</div>}
        {activeTab==="web"&&<div>
          <Label>Search live benchmarks & trends</Label>
          <div style={{display:"flex",gap:8,marginBottom:8}}><input className="input-focus" value={webQuery} onChange={function(e){setWebQuery(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")searchWeb();}} placeholder="e.g. TikTok Thailand engagement 2025..." style={{flex:1,padding:"10px 13px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:12,fontFamily:"inherit",color:"#333",background:"#fafffe"}}/><Btn small disabled={webLoading} onClick={searchWeb}>{webLoading?"⏳":"🌐"}</Btn></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>{["TikTok Thailand 2025","Instagram Reels rates","SEA social media benchmarks"].map(function(q){return <div key={q} onClick={function(){setWebQuery(q);}} className="pill-hover" style={{cursor:"pointer",fontSize:11,color:TEAL,background:TL,borderRadius:99,padding:"4px 10px",fontWeight:600}}>{q}</div>;})}</div>
          {webLoading&&<div style={{textAlign:"center",padding:"28px 0"}}><div className="spin" style={{width:30,height:30,border:"3px solid "+TL,borderTopColor:TEAL,borderRadius:"50%",margin:"0 auto 10px"}}/><div style={{fontSize:13,color:TEAL,fontWeight:600}}>Searching...</div></div>}
          {webResult&&!webResult.error&&<div className="fadeUp"><div style={{background:"linear-gradient(135deg,"+TEAL+","+TM+")",borderRadius:12,padding:"12px 14px",marginBottom:12}}><div style={{fontSize:11,color:"rgba(255,255,255,.75)",fontWeight:700,marginBottom:5}}>✅ LIVE DATA LOADED</div><div style={{fontSize:12,color:"#fff",lineHeight:1.6}}>{webResult.summary}</div></div>{webResult.key_stats&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>{webResult.key_stats.slice(0,4).map(function(s,i){return <div key={i} style={{background:TL,borderRadius:10,padding:"9px 11px"}}><div style={{fontSize:15,fontWeight:900,color:TEAL}}>{s.value}</div><div style={{fontSize:10,color:"#555",fontWeight:600,marginTop:2}}>{s.metric}</div></div>;})}</div>}{webResult.trends&&webResult.trends.map(function(t,i){return <div key={i} style={{display:"flex",gap:7,marginBottom:5,fontSize:12,color:"#444"}}><span style={{color:TEAL,fontWeight:700}}>→</span>{t}</div>;})}</div>}
          {webResult&&webResult.error&&<div style={{color:"#dc2626",fontSize:12,background:"#fee2e2",borderRadius:8,padding:"10px 12px"}}>{webResult.error}</div>}
          {!webResult&&!webLoading&&<div style={{textAlign:"center",padding:"24px 0",color:"#94a3b8"}}><div style={{fontSize:32,marginBottom:8}}>🌐</div><div style={{fontSize:13,fontWeight:600,color:"#64748b"}}>Search for live benchmarks</div></div>}</div>}
        {activeTab==="security"&&<SecuritySettings pinEnabled={pinEnabled} onSetPin={onSetPin} onRemovePin={onRemovePin}/>}
      </div>
      <div style={{padding:mob?"12px 14px":"14px 22px",borderTop:"1px solid #e8f5f3",background:"#fafffe",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:11,color:"#94a3b8"}}>{activeCount>0?(activeCount+" source"+(activeCount>1?"s":"")+" · "+totalRows+" rows"):"No active sources"}</div>
        {files.length>0&&<button onClick={onClearFiles} style={{fontSize:11,color:"#ef4444",fontWeight:700,background:"#fee2e2",border:"none",cursor:"pointer",borderRadius:8,padding:"5px 10px"}}>Clear All</button>}
      </div>
    </div>
  </div>;
}

// ── EVALUATE ──────────────────────────────────────────────────────────────────
function EvaluateMode({onHome,onLogEntry,activeData,webData}){
  var {mob}=useR();
  var [step,setStep]=useState(0);var [platform,setPlatform]=useState("");var [ctype,setCtype]=useState("");var [pillar,setPillar]=useState("");var [industry,setIndustry]=useState("");var [subIndustry,setSubIndustry]=useState("");var [caption,setCaption]=useState("");var [visual,setVisual]=useState("");var [hook,setHook]=useState("");var [thumbImg,setThumbImg]=useState(null);var [thumbName,setThumbName]=useState("");var [result,setResult]=useState(null);var [loading,setLoading]=useState(false);var [error,setError]=useState("");
  var thumbRef=useRef();var isVideo=VIDEO_TYPES.includes(ctype);
  function handleThumb(e){var f=e.target.files[0];if(!f)return;setThumbName(f.name);var r=new FileReader();r.onload=function(ev){setThumbImg(ev.target.result);};r.readAsDataURL(f);}
  async function analyze(){
    if(!platform||!ctype||!pillar||!caption.trim()){setError("Please fill in platform, content type, pillar & caption.");return;}
    setLoading(true);setError("");
    var industryCtx=industry?("Industry: "+industry+(subIndustry?" > "+subIndustry:"")):"";
    var hist=activeData.length>0?("Historical data ("+activeData.length+" rows):\n"+JSON.stringify(activeData.slice(0,20),null,2)):"No historical data.";
    var webCtx=webData.length>0?("Live data:\n"+JSON.stringify(webData.slice(0,2),null,2)):"";
    var prompt="You are PredictaPost. Analyze this content ONLY valid JSON no markdown:\nPlatform:"+platform+"|Type:"+ctype+"|Pillar:"+pillar+(industryCtx?"|"+industryCtx:"")+"\nCaption:"+caption+"|Visual:"+(visual||"N/A")+(isVideo?"|Hook:"+(hook||"N/A")+"|Thumb:"+(thumbImg?"yes":"no"):"")+"\n"+hist+"\n"+webCtx+'\n{"scores":{"voice":<1-10>,"clarity":<1-10>,"engagement":<1-10>'+(isVideo?',"hook":<1-10>':"")+'}, "overall":<1-10>,"verdict":"Great"|"Good"|"Needs Work"|"Poor","suggestions":["s1","s2","s3"],"improved_caption":"...","hashtags":{"broad":["#t"],"niche":["#t"],"branded":["#t"]},"best_time":"...","summary":{"pillar_fit":"...","engagement_vs_history":"...","best_format":"...","tone_consistency":"...","final_recommendation":"..."}}';
    try{var r=await callClaude(prompt,thumbImg?thumbImg.split(",")[1]:null);setResult(r);onLogEntry({id:Date.now(),platform:platform,ctype:ctype,pillar:pillar,caption:caption,overall:r.overall,verdict:r.verdict,scores:r.scores,suggestions:r.suggestions,improved_caption:r.improved_caption,best_time:r.best_time||null,date:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})});setStep(1);}catch(e){setError("Something went wrong. Try again.");}
    setLoading(false);
  }
  function gotoStep(s){window.scrollTo({top:0,behavior:"smooth"});setTimeout(function(){setStep(s);},100);}
  return <div>
    <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><button className="btn-hover" onClick={onHome} style={{background:TL,border:"none",cursor:"pointer",color:TEAL,fontSize:13,fontWeight:700,borderRadius:99,padding:"6px 12px"}}>← Home</button><div style={{fontWeight:800,fontSize:mob?16:18,color:TEAL}}>🔍 Evaluate</div><div style={{marginLeft:"auto",fontSize:10,color:activeData.length>0?"#16a34a":"#94a3b8",fontWeight:600,background:activeData.length>0?"#dcfce7":"#f1f5f9",borderRadius:99,padding:"3px 9px"}}>{activeData.length>0?"✅ "+activeData.length+" rows":"⚪ No data"}</div></div>
    <div className="fadeUp" style={{animationDelay:"60ms"}}><Steps current={step} labels={["Content","Scores","Summary"]}/></div>
    {step===0&&<Card animate="fadeUp" delay={80}>
      <div style={{fontWeight:800,fontSize:15,color:TEAL,marginBottom:18}}>Tell us about your content idea</div>
      <PlatformInputs platform={platform} setPlatform={setPlatform} ctype={ctype} setCtype={setCtype} pillar={pillar} setPillar={setPillar} industry={industry} setIndustry={setIndustry} subIndustry={subIndustry} setSubIndustry={setSubIndustry}/>
      <div className="fadeUp" style={{marginBottom:18}}><Label>Caption</Label><textarea className="input-focus" value={caption} onChange={function(e){setCaption(e.target.value);}} rows={4} placeholder="Write your caption..." style={{width:"100%",padding:"11px 13px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:13,fontFamily:"inherit",resize:"vertical",color:"#333",lineHeight:1.6,background:"#fafffe"}}/></div>
      <div className="fadeUp" style={{marginBottom:isVideo?18:22}}><Label>Visual Idea <span style={{textTransform:"none",fontWeight:400,color:"#bbb"}}>(optional)</span></Label><input className="input-focus" value={visual} onChange={function(e){setVisual(e.target.value);}} placeholder="e.g. Flat lay with earthy tones..." style={{width:"100%",padding:"10px 13px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:13,fontFamily:"inherit",color:"#333",background:"#fafffe"}}/></div>
      {isVideo&&<div className="fadeUp" style={{background:"#f8fffe",border:"1.5px solid #a7d9d4",borderRadius:14,padding:16,marginBottom:20}}>
        <div style={{fontWeight:700,fontSize:13,color:TEAL,marginBottom:12}}>🎬 Video Details</div>
        <div style={{marginBottom:12}}><Label>Hook — First 3 Seconds</Label><input className="input-focus" value={hook} onChange={function(e){setHook(e.target.value);}} placeholder="e.g. 'POV: you finally stop guessing…'" style={{width:"100%",padding:"10px 13px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:13,fontFamily:"inherit",color:"#333",background:"#fff"}}/></div>
        <div><Label>Thumbnail</Label><input ref={thumbRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleThumb}/>{thumbImg?<div className="fadeIn" style={{display:"flex",alignItems:"center",gap:12,marginTop:6}}><img src={thumbImg} alt="thumb" style={{width:72,height:50,objectFit:"cover",borderRadius:8,border:"1.5px solid #d1ede9"}}/><div><div style={{fontSize:12,color:"#555",fontWeight:600}}>{thumbName}</div><span onClick={function(){setThumbImg(null);setThumbName("");}} style={{fontSize:12,color:"#ef4444",cursor:"pointer",fontWeight:600}}>✕ Remove</span></div></div>:<div onClick={function(){thumbRef.current.click();}} style={{marginTop:6,border:"2px dashed #a7d9d4",borderRadius:12,padding:"16px 0",textAlign:"center",cursor:"pointer",color:TEAL,fontSize:13,fontWeight:600,background:"#fff"}}>📁 Upload thumbnail</div>}</div>
      </div>}
      {error&&<div className="fadeIn" style={{background:"#fff0f0",color:"#e53e3e",borderRadius:10,padding:"10px 13px",fontSize:13,marginBottom:14}}>{error}</div>}
      <Btn full disabled={loading} onClick={analyze}>{loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/> Analyzing...</span>:"⚡ Analyze & Score →"}</Btn>
    </Card>}
    {step===1&&result&&<div>
      <Card animate="fadeUp" delay={0} style={{marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><div><div style={{fontWeight:800,fontSize:15,color:TEAL}}>Score & Suggestions</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{PLATFORM_ICONS[platform]} {platform} · {ctype}</div></div><div style={{display:"flex",alignItems:"center",gap:10}}><ScoreRing score={result.overall} size={mob?72:88} delay={200}/><span className="pop" style={{padding:"5px 12px",borderRadius:99,fontSize:mob?11:13,fontWeight:800,background:verdictStyle(result.verdict).bg,color:verdictStyle(result.verdict).color,animationDelay:"300ms"}}>{verdictStyle(result.verdict).emoji} {result.verdict}</span></div></div>
        {[{l:"🎙 Voice",k:"voice",c:TEAL},{l:"📖 Clarity",k:"clarity",c:TM},{l:"🔥 Engagement",k:"engagement",c:"#f59e0b"}].concat(isVideo&&result.scores.hook?[{l:"🎣 Hook",k:"hook",c:"#8b5cf6"}]:[]).map(function(item,i){return <div key={item.k} className="fadeUp" style={{display:"flex",alignItems:"center",gap:8,marginBottom:9,animationDelay:(i*60)+"ms"}}><div style={{fontSize:12,width:mob?100:130,color:"#555",flexShrink:0}}>{item.l}</div><Bar pct={(result.scores[item.k]/10)*100} color={item.c} delay={i*80}/><div style={{fontSize:12,fontWeight:700,color:item.c,width:32,textAlign:"right"}}>{result.scores[item.k]}/10</div></div>;})}
        {result.best_time&&<div style={{marginTop:12,display:"inline-flex",alignItems:"center",gap:7,background:TL,borderRadius:99,padding:"6px 14px"}}><span>⏰</span><span style={{fontSize:12,fontWeight:700,color:TEAL}}>Best time: {result.best_time}</span></div>}
      </Card>
      <Card animate="fadeUp" delay={150} style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:13,color:TEAL,marginBottom:10}}>💡 Suggestions</div>{result.suggestions.map(function(s,i){return <div key={i} className="slideIn" style={{display:"flex",gap:9,marginBottom:9,alignItems:"flex-start",animationDelay:(i*70)+"ms"}}><div style={{width:22,height:22,borderRadius:"50%",background:TL,color:TEAL,fontWeight:800,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div><div style={{fontSize:12,color:"#444",lineHeight:1.6}}>{s}</div></div>;})}</Card>
      <Card animate="fadeUp" delay={200} style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:13,color:TEAL,marginBottom:9}}>✨ Improved Caption</div><div style={{background:"#f8fffe",border:"1px solid #a7d9d4",borderRadius:10,padding:"12px 13px",fontSize:12,color:"#333",lineHeight:1.7,whiteSpace:"pre-wrap",marginBottom:10}}>{result.improved_caption}</div><Btn small outline onClick={function(){navigator.clipboard.writeText(result.improved_caption);}}>📋 Copy</Btn></Card>
      {result.hashtags&&<Card animate="fadeUp" delay={250} style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:13,color:TEAL,marginBottom:10}}># Hashtags</div>{[{label:"🔵 Broad",key:"broad",bg:"#dbeafe",tc:"#1d4ed8"},{label:"🟢 Niche",key:"niche",bg:"#dcfce7",tc:"#16a34a"},{label:"🟡 Branded",key:"branded",bg:"#fef9c3",tc:"#ca8a04"}].map(function(h,i){return <div key={h.key} style={{marginBottom:9}}><div style={{fontSize:10,fontWeight:700,color:h.tc,marginBottom:5}}>{h.label}</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{(result.hashtags[h.key]||[]).map(function(tag){return <span key={tag} style={{background:h.bg,color:h.tc,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:600}}>{tag}</span>;})}</div></div>;})} <Btn small outline onClick={function(){navigator.clipboard.writeText([].concat(result.hashtags.broad||[],result.hashtags.niche||[],result.hashtags.branded||[]).join(" "));}}>📋 Copy All</Btn></Card>}
      <Btn full onClick={function(){gotoStep(2);}}>View Summary →</Btn>
    </div>}
    {step===2&&result&&<SummaryView result={result} platform={platform} ctype={ctype} pillar={pillar} isVideo={isVideo} onBack={function(){gotoStep(1);}} onHome={onHome}/>}
  </div>;
}

function SummaryView({result,platform,ctype,pillar,isVideo,onBack,onHome}){
  var {mob}=useR();var vs=verdictStyle(result.verdict);
  var metrics=[{icon:"🎯",title:"Pillar Fit",key:"pillar_fit",scoreKey:"voice",color:"#ede9fe",border:"#c4b5fd",tc:"#7c3aed"},{icon:"📈",title:"Engagement",key:"engagement_vs_history",scoreKey:"engagement",color:"#dcfce7",border:"#86efac",tc:"#16a34a"},{icon:"📐",title:"Best Format",key:"best_format",scoreKey:null,color:"#dbeafe",border:"#93c5fd",tc:"#1d4ed8"},{icon:"🗣",title:"Tone & Voice",key:"tone_consistency",scoreKey:"clarity",color:TL,border:"#a7d9d4",tc:TEAL}].concat(isVideo&&result.scores.hook?[{icon:"🎣",title:"Hook",key:null,scoreKey:"hook",color:"#f3e8ff",border:"#d8b4fe",tc:"#7c3aed"}]:[]);
  return <div>
    <Card animate="fadeUp" style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div><div style={{fontWeight:800,fontSize:15,color:TEAL}}>Summary</div><div style={{fontSize:11,color:"#888"}}>{PLATFORM_ICONS[platform]} {platform} · {ctype} · {pillar}</div></div><div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:900,color:result.overall>=7?TEAL:result.overall>=5?"#f59e0b":"#ef4444"}}>{result.overall}<span style={{fontSize:12,color:"#aaa"}}>/10</span></div><span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:800,background:vs.bg,color:vs.color}}>{vs.emoji} {result.verdict}</span></div></div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:8,marginBottom:12}}>{metrics.map(function(m,i){return <div key={m.title} className="fadeUp card-hover" style={{background:m.color,border:"1px solid "+m.border,borderRadius:11,padding:"10px 11px",animationDelay:(i*60)+"ms"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><div style={{fontWeight:700,fontSize:11,color:m.tc}}>{m.icon} {m.title}</div>{m.scoreKey&&<div style={{fontWeight:800,fontSize:11,color:m.tc}}>{result.scores[m.scoreKey]}/10</div>}</div>{m.key&&<div style={{fontSize:11,color:"#555",lineHeight:1.5}}>{result.summary[m.key]}</div>}</div>;})}</div>
      <div style={{background:"linear-gradient(135deg,"+TEAL+","+TM+")",borderRadius:12,padding:"11px 13px",marginBottom:12}}><div style={{fontSize:10,color:"rgba(255,255,255,.7)",fontWeight:600,marginBottom:3}}>🏁 RECOMMENDATION</div><div style={{fontSize:12,color:"#fff",fontWeight:600,lineHeight:1.5}}>{result.summary.final_recommendation}</div></div>
      <div style={{background:TL,borderRadius:12,padding:"11px 13px"}}><div style={{fontSize:10,color:TEAL,fontWeight:700,marginBottom:4}}>✨ IMPROVED CAPTION</div><div style={{fontSize:12,color:"#333",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{result.improved_caption}</div></div>
    </Card>
    <div className="fadeUp" style={{display:"flex",gap:8}}><Btn small outline onClick={onBack} style={{flex:1}}>← Back</Btn><Btn small outline onClick={function(){navigator.clipboard.writeText(result.improved_caption);}} style={{flex:1}}>📋 Copy</Btn><Btn small onClick={onHome} style={{flex:1}}>🏠 Home</Btn></div>
  </div>;
}

// ── BRAINSTORM ────────────────────────────────────────────────────────────────
function BrainstormMode({onHome,activeData,webData}){
  var {mob}=useR();
  var [platform,setPlatform]=useState("");var [ctype,setCtype]=useState("");var [pillar,setPillar]=useState("");var [industry,setIndustry]=useState("");var [subIndustry,setSubIndustry]=useState("");var [topic,setTopic]=useState("");var [ideas,setIdeas]=useState(null);var [loading,setLoading]=useState(false);var [error,setError]=useState("");
  async function generate(){
    if(!platform||!pillar||!topic.trim()){setError("Fill in platform, pillar and topic.");return;}
    setLoading(true);setError("");setIdeas(null);
    var webCtx=webData.length>0?("Live data:\n"+JSON.stringify(webData.slice(0,2),null,2)):"";
    var prompt='You are PredictaPost. 3 content ideas ONLY valid JSON array no markdown:\nPlatform:'+platform+'|Type:'+(ctype||"Any")+'|Pillar:'+pillar+'|Topic:'+topic+(industry?'|Industry:'+industry+(subIndustry?' > '+subIndustry:''):'')+'\n'+webCtx+'\n[{"title":"...","caption":"...","content_type":"...","hook":"...","scores":{"voice":<1-10>,"clarity":<1-10>,"engagement":<1-10>},"overall":<1-10>,"verdict":"Great"|"Good"|"Needs Work","why":"1 sentence"}]';
    try{var r=await callClaude(prompt);setIdeas(r);}catch(e){setError("Something went wrong.");}setLoading(false);
  }
  return <div>
    <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><button className="btn-hover" onClick={onHome} style={{background:TL,border:"none",cursor:"pointer",color:TEAL,fontSize:13,fontWeight:700,borderRadius:99,padding:"6px 12px"}}>← Home</button><div style={{fontWeight:800,fontSize:mob?16:18,color:TEAL}}>💡 Brainstorm</div></div>
    {!ideas?<Card animate="fadeUp" delay={60}>
      <div style={{fontWeight:700,fontSize:15,color:TEAL,marginBottom:18}}>What do you want to post about?</div>
      <PlatformInputs platform={platform} setPlatform={setPlatform} ctype={ctype} setCtype={setCtype} pillar={pillar} setPillar={setPillar} industry={industry} setIndustry={setIndustry} subIndustry={subIndustry} setSubIndustry={setSubIndustry}/>
      <div className="fadeUp" style={{marginBottom:22}}><Label>Topic or Theme</Label><input className="input-focus" value={topic} onChange={function(e){setTopic(e.target.value);}} placeholder="e.g. Summer launch, tips for beginners..." style={{width:"100%",padding:"10px 13px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:13,fontFamily:"inherit",color:"#333",background:"#fafffe"}}/></div>
      {error&&<div className="fadeIn" style={{background:"#fff0f0",color:"#e53e3e",borderRadius:10,padding:"10px 13px",fontSize:13,marginBottom:14}}>{error}</div>}
      <Btn full disabled={loading} onClick={generate}>{loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/> Generating...</span>:"💡 Generate 3 Ideas"}</Btn>
    </Card>:<div>
      <div className="fadeUp" style={{fontWeight:700,fontSize:14,color:TEAL,marginBottom:14}}>Ideas for "<span style={{color:"#333"}}>{topic}</span>"</div>
      {ideas.map(function(idea,i){var vc=verdictStyle(idea.verdict);return <Card key={i} animate="fadeUp" delay={i*100} style={{marginBottom:14,border:"1.5px solid "+(idea.overall>=7?"#a7d9d4":"#e0e0e0")}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div><div style={{fontWeight:800,fontSize:14,color:"#1a1a1a",marginBottom:5}}>Idea {i+1} — {idea.title}</div><span style={{fontSize:11,background:TL,color:TEAL,borderRadius:99,padding:"3px 9px",fontWeight:600,marginRight:5}}>{idea.content_type}</span><span style={{fontSize:11,background:vc.bg,color:vc.color,borderRadius:99,padding:"3px 9px",fontWeight:700}}>{vc.emoji} {idea.verdict}</span></div><ScoreRing score={idea.overall} size={mob?56:64} delay={i*120}/></div>
        <div style={{background:"#f8fffe",border:"1px solid #d1ede9",borderRadius:10,padding:"10px 12px",fontSize:12,color:"#333",lineHeight:1.65,marginBottom:9,whiteSpace:"pre-wrap"}}>{idea.caption}</div>
        {idea.hook&&<div style={{fontSize:11,color:"#7c3aed",marginBottom:9,background:"#f3e8ff",borderRadius:8,padding:"6px 10px"}}><span style={{fontWeight:700}}>🎣 Hook: </span>{idea.hook}</div>}
        <div style={{fontSize:11,color:"#666",marginBottom:10,fontStyle:"italic"}}>💬 {idea.why}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{[{l:"🎙 Voice",k:"voice",c:TEAL,bg:TL},{l:"📖 Clarity",k:"clarity",c:TM,bg:"#ccfbf1"},{l:"🔥 Engage",k:"engagement",c:"#d97706",bg:"#fef9c3"}].map(function(s){return <div key={s.k} style={{background:s.bg,borderRadius:8,padding:"4px 9px",fontSize:10,fontWeight:700,color:s.c}}>{s.l}: {idea.scores[s.k]}/10</div>;})}</div>
        <Btn small outline onClick={function(){navigator.clipboard.writeText(idea.caption);}}>📋 Copy</Btn>
      </Card>;})}
      <div className="fadeUp" style={{display:"flex",gap:8}}><Btn outline full onClick={function(){setIdeas(null);setTopic("");}}>🔄 New Ideas</Btn><Btn small full onClick={onHome}>🏠 Home</Btn></div>
    </div>}
  </div>;
}

// ── COMPARE ───────────────────────────────────────────────────────────────────
function CompareMode({onHome}){
  var {mob}=useR();
  var [platform,setPlatform]=useState("");var [ctype,setCtype]=useState("");var [pillar,setPillar]=useState("");var [industry,setIndustry]=useState("");var [subIndustry,setSubIndustry]=useState("");var [capA,setCapA]=useState("");var [capB,setCapB]=useState("");var [result,setResult]=useState(null);var [loading,setLoading]=useState(false);var [error,setError]=useState("");
  async function compare(){
    if(!platform||!pillar||!capA.trim()||!capB.trim()){setError("Fill in all fields and both captions.");return;}setLoading(true);setError("");setResult(null);
    var prompt='You are PredictaPost. Compare captions ONLY valid JSON no markdown:\nPlatform:'+platform+'|Type:'+(ctype||"Any")+'|Pillar:'+pillar+(industry?'|Industry:'+industry+(subIndustry?' > '+subIndustry:''):'')+'\nA:'+capA+'|B:'+capB+'\n{"a":{"scores":{"voice":<1-10>,"clarity":<1-10>,"engagement":<1-10>},"overall":<1-10>,"verdict":"...","strengths":"...","weaknesses":"..."},"b":{"scores":{"voice":<1-10>,"clarity":<1-10>,"engagement":<1-10>},"overall":<1-10>,"verdict":"...","strengths":"...","weaknesses":"..."},"winner":"A"|"B"|"Tie","reason":"...","improved_winner":"..."}';
    try{var r=await callClaude(prompt);setResult(r);}catch(e){setError("Something went wrong.");}setLoading(false);
  }
  return <div>
    <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><button className="btn-hover" onClick={onHome} style={{background:TL,border:"none",cursor:"pointer",color:TEAL,fontSize:13,fontWeight:700,borderRadius:99,padding:"6px 12px"}}>← Home</button><div style={{fontWeight:800,fontSize:mob?16:18,color:TEAL}}>⚔️ Compare</div></div>
    {!result?<Card animate="fadeUp" delay={60}>
      <div style={{fontWeight:700,fontSize:15,color:TEAL,marginBottom:18}}>Pit two captions against each other</div>
      <PlatformInputs platform={platform} setPlatform={setPlatform} ctype={ctype} setCtype={setCtype} pillar={pillar} setPillar={setPillar} industry={industry} setIndustry={setIndustry} subIndustry={subIndustry} setSubIndustry={setSubIndustry}/>
      <div className="fadeUp" style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12,marginBottom:22}}>{[{label:"Caption A",val:capA,set:setCapA,color:"#1d4ed8",bg:"#dbeafe",border:"#93c5fd"},{label:"Caption B",val:capB,set:setCapB,color:"#dc2626",bg:"#fee2e2",border:"#fca5a5"}].map(function(item){return <div key={item.label}><div style={{fontWeight:700,fontSize:12,color:item.color,marginBottom:7,background:item.bg,display:"inline-block",borderRadius:99,padding:"3px 12px"}}>{item.label}</div><textarea className="input-focus" value={item.val} onChange={function(e){item.set(e.target.value);}} rows={5} placeholder={"Write "+item.label+"..."} style={{width:"100%",padding:"10px 12px",borderRadius:12,border:"1.5px solid "+item.border,fontSize:12,fontFamily:"inherit",resize:"vertical",color:"#333",lineHeight:1.6,background:"#fafffe"}}/></div>;})} </div>
      {error&&<div className="fadeIn" style={{background:"#fff0f0",color:"#e53e3e",borderRadius:10,padding:"10px 13px",fontSize:13,marginBottom:14}}>{error}</div>}
      <Btn full disabled={loading} onClick={compare}>{loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/> Comparing...</span>:"⚔️ Compare Captions"}</Btn>
    </Card>:<div>
      <Card animate="pop" style={{marginBottom:12,background:result.winner==="Tie"?"#f8f8f8":"linear-gradient(135deg,"+TEAL+","+TM+")",border:"none",textAlign:"center"}}><div style={{fontSize:11,color:result.winner==="Tie"?"#888":"rgba(255,255,255,.75)",fontWeight:700,letterSpacing:1,marginBottom:4}}>🏆 WINNER</div><div style={{fontSize:mob?22:28,fontWeight:900,color:result.winner==="Tie"?"#555":"#fff",marginBottom:6}}>{result.winner==="Tie"?"It's a Tie! 🤝":"Caption "+result.winner+" wins!"}</div><div style={{fontSize:mob?11:13,color:result.winner==="Tie"?"#666":"rgba(255,255,255,.85)",lineHeight:1.5}}>{result.reason}</div></Card>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10,marginBottom:12}}>{[{label:"A",key:"a",cap:capA,color:"#1d4ed8",bg:"#dbeafe",border:"#93c5fd"},{label:"B",key:"b",cap:capB,color:"#dc2626",bg:"#fee2e2",border:"#fca5a5"}].map(function(item,i){var d=result[item.key];var isW=result.winner===item.label&&result.winner!=="Tie";return <Card key={item.key} animate="fadeUp" delay={i*100} style={{border:"2px solid "+(isW?item.color:item.border),position:"relative",padding:mob?12:16}}>{isW&&<div className="pop" style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:item.color,color:"#fff",borderRadius:99,padding:"2px 12px",fontSize:10,fontWeight:800,whiteSpace:"nowrap"}}>⭐ WINNER</div>}<div style={{fontWeight:800,fontSize:12,color:item.color,marginBottom:7,background:item.bg,display:"inline-block",borderRadius:99,padding:"3px 11px"}}>Caption {item.label}</div><div style={{fontSize:11,color:"#555",lineHeight:1.6,marginBottom:8,background:"#fafafa",borderRadius:8,padding:"8px 10px"}}>{item.cap}</div><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}><ScoreRing score={d.overall} size={mob?44:52} delay={i*150}/><div style={{flex:1}}>{[{l:"Voice",k:"voice",c:TEAL},{l:"Clarity",k:"clarity",c:TM},{l:"Engage",k:"engagement",c:"#f59e0b"}].map(function(s,j){return <div key={s.k} style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}><div style={{fontSize:9,width:36,color:"#888"}}>{s.l}</div><Bar pct={(d.scores[s.k]/10)*100} color={s.c} delay={j*60+i*100}/><div style={{fontSize:9,fontWeight:700,color:s.c,width:16}}>{d.scores[s.k]}</div></div>;})}</div></div><div style={{fontSize:10,color:"#16a34a",marginBottom:3}}>✅ {d.strengths}</div><div style={{fontSize:10,color:"#dc2626"}}>⚠️ {d.weaknesses}</div></Card>;})} </div>
      {result.improved_winner&&<Card animate="fadeUp" delay={250} style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:13,color:TEAL,marginBottom:9}}>✨ Improved Caption</div><div style={{background:TL,borderRadius:10,padding:"11px 13px",fontSize:12,color:"#333",lineHeight:1.7,marginBottom:10}}>{result.improved_winner}</div><Btn small outline onClick={function(){navigator.clipboard.writeText(result.improved_winner);}}>📋 Copy</Btn></Card>}
      <div className="fadeUp" style={{display:"flex",gap:8}}><Btn small outline full onClick={function(){setResult(null);setCapA("");setCapB("");}}>🔄 Again</Btn><Btn small full onClick={onHome}>🏠 Home</Btn></div>
    </div>}
  </div>;
}

// ── CAPTION REWRITER ──────────────────────────────────────────────────────────
function CaptionRewriterMode({onHome,activeData,webData}){
  var {mob}=useR();
  var [platform,setPlatform]=useState("");var [ctype,setCtype]=useState("");var [pillar,setPillar]=useState("");var [industry,setIndustry]=useState("");var [subIndustry,setSubIndustry]=useState("");var [caption,setCaption]=useState("");var [targetTones,setTargetTones]=useState([]);var [targetAudience,setTargetAudience]=useState("");var [brandVoice,setBrandVoice]=useState("");var [charLimit,setCharLimit]=useState("");var [result,setResult]=useState(null);var [loading,setLoading]=useState(false);var [error,setError]=useState("");var [copiedIdx,setCopiedIdx]=useState(null);
  function toggleTone(t){setTargetTones(function(prev){return prev.includes(t)?prev.filter(function(x){return x!==t;}):[].concat(prev,[t]).slice(0,3);});}
  async function rewrite(){
    if(!caption.trim()||!platform){setError("Please fill in platform and caption.");return;}setLoading(true);setError("");setResult(null);
    var webCtx=webData.length>0?("Live data:\n"+JSON.stringify(webData.slice(0,2),null,2)):"";
    var prompt='PredictaPost Caption Rewriter.\nPlatform:'+platform+'|Type:'+(ctype||"Any")+'|Pillar:'+(pillar||"Any")+'|Industry:'+(industry||"General")+(subIndustry?' > '+subIndustry:'')+'\nAudience:'+(targetAudience||"General")+'|Voice:'+(brandVoice||"None")+'|Limit:'+(charLimit?charLimit+" chars":"No limit")+'\nTones:'+(targetTones.length>0?targetTones.join(", "):"Professional, Casual & Friendly, Witty & Playful")+'\n'+webCtx+'\nOriginal:\n'+caption+'\nONLY valid JSON:\n{"analysis":{"original_tone":"...","original_score":<1-10>,"strengths":"...","weaknesses":"...","audience_fit":"..."},"rewrites":[{"tone":"...","caption":"...","why":"1 sentence","score":<1-10>,"char_count":<n>,"cta_strength":"weak|moderate|strong"}],"hashtags":["#t1","#t2","#t3","#t4","#t5"],"best_posting_time":"...","pro_tip":"..."}';
    try{var r=await callClaude(prompt);setResult(r);}catch(e){setError("Something went wrong.");}setLoading(false);
  }
  function copyCaption(text,idx){navigator.clipboard.writeText(text);setCopiedIdx(idx);setTimeout(function(){setCopiedIdx(null);},2000);}
  return <div>
    <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><button className="btn-hover" onClick={onHome} style={{background:TL,border:"none",cursor:"pointer",color:TEAL,fontSize:13,fontWeight:700,borderRadius:99,padding:"6px 12px"}}>← Home</button><div style={{fontWeight:800,fontSize:mob?16:18,color:TEAL}}>✍️ Caption Rewriter</div></div>
    {!result?<Card animate="fadeUp" delay={60}>
      <div style={{fontWeight:800,fontSize:15,color:TEAL,marginBottom:18}}>Rewrite your caption in any tone</div>
      <PlatformInputs platform={platform} setPlatform={setPlatform} ctype={ctype} setCtype={setCtype} pillar={pillar} setPillar={setPillar} industry={industry} setIndustry={setIndustry} subIndustry={subIndustry} setSubIndustry={setSubIndustry}/>
      <div className="fadeUp" style={{marginBottom:18}}><Label>Original Caption</Label><textarea className="input-focus" value={caption} onChange={function(e){setCaption(e.target.value);}} rows={5} placeholder="Paste your existing caption here..." style={{width:"100%",padding:"11px 13px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:13,fontFamily:"inherit",resize:"vertical",color:"#333",lineHeight:1.6,background:"#fafffe"}}/><div style={{textAlign:"right",fontSize:11,color:"#94a3b8",marginTop:3}}>{caption.length} chars</div></div>
      <div className="fadeUp" style={{marginBottom:18}}><Label>Target Tones <span style={{textTransform:"none",fontWeight:400,color:"#bbb"}}>(up to 3)</span></Label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{TONES.map(function(t){return <div key={t} onClick={function(){toggleTone(t);}} className="pill-hover" style={{cursor:"pointer",padding:"7px 12px",borderRadius:99,fontSize:mob?11:12,fontWeight:600,userSelect:"none",background:targetTones.includes(t)?TEAL:TL,color:targetTones.includes(t)?"#fff":TEAL,border:"1.5px solid "+(targetTones.includes(t)?TEAL:"#a7d9d4"),WebkitTapHighlightColor:"transparent"}}>{t}</div>;})} </div></div>
      <div className="fadeUp" style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12,marginBottom:18}}><div><Label>Audience</Label><input className="input-focus" value={targetAudience} onChange={function(e){setTargetAudience(e.target.value);}} placeholder="e.g. Thai millennials, 25–35" style={{width:"100%",padding:"10px 12px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:12,fontFamily:"inherit",color:"#333",background:"#fafffe"}}/></div><div><Label>Char Limit</Label><input className="input-focus" value={charLimit} onChange={function(e){setCharLimit(e.target.value.replace(/\D/g,""));}} placeholder="e.g. 150" style={{width:"100%",padding:"10px 12px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:12,fontFamily:"inherit",color:"#333",background:"#fafffe"}}/></div></div>
      <div className="fadeUp" style={{marginBottom:22}}><Label>Brand Voice Notes</Label><input className="input-focus" value={brandVoice} onChange={function(e){setBrandVoice(e.target.value);}} placeholder="e.g. We speak like a trusted friend, not a brand." style={{width:"100%",padding:"10px 12px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:12,fontFamily:"inherit",color:"#333",background:"#fafffe"}}/></div>
      {error&&<div className="fadeIn" style={{background:"#fff0f0",color:"#e53e3e",borderRadius:10,padding:"10px 13px",fontSize:13,marginBottom:14}}>{error}</div>}
      <Btn full disabled={loading} onClick={rewrite}>{loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/> Rewriting...</span>:"✍️ Rewrite Captions →"}</Btn>
    </Card>:<div>
      <Card animate="fadeUp" delay={0} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}><div><div style={{fontWeight:800,fontSize:14,color:TEAL,marginBottom:3}}>Original Analysis</div><div style={{fontSize:10,color:"#888"}}>Tone: {result.analysis.original_tone}</div></div><ScoreRing score={result.analysis.original_score} size={mob?56:64}/></div><div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:9,marginBottom:10}}><div style={{background:"#dcfce7",borderRadius:10,padding:"9px 12px"}}><div style={{fontSize:10,fontWeight:700,color:"#16a34a",marginBottom:3}}>✅ Strengths</div><div style={{fontSize:11,color:"#166534",lineHeight:1.5}}>{result.analysis.strengths}</div></div><div style={{background:"#fef9c3",borderRadius:10,padding:"9px 12px"}}><div style={{fontSize:10,fontWeight:700,color:"#ca8a04",marginBottom:3}}>⚠️ Weaknesses</div><div style={{fontSize:11,color:"#713f12",lineHeight:1.5}}>{result.analysis.weaknesses}</div></div></div><div style={{background:TL,borderRadius:9,padding:"9px 12px",fontSize:11,color:"#333",lineHeight:1.5}}><span style={{fontWeight:700,color:TEAL}}>Audience fit: </span>{result.analysis.audience_fit}</div></Card>
      <div style={{fontWeight:800,fontSize:14,color:"#1a1a1a",marginBottom:10}} className="fadeUp">✨ Rewritten Versions</div>
      {result.rewrites.map(function(rw,i){return <Card key={i} animate="fadeUp" delay={i*80} style={{marginBottom:10,border:"1.5px solid "+(rw.score>=7?"#a7d9d4":"#e0e0e0")}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{background:TEAL,color:"#fff",borderRadius:99,padding:"3px 11px",fontSize:11,fontWeight:700}}>{rw.tone}</span><span style={{fontSize:10,color:"#94a3b8"}}>{rw.char_count} chars</span>{rw.cta_strength==="strong"&&<span style={{fontSize:10,color:"#16a34a",fontWeight:600,background:"#dcfce7",borderRadius:99,padding:"2px 7px"}}>💪 Strong CTA</span>}</div><span style={{fontSize:12,fontWeight:800,color:rw.score>=7?TEAL:rw.score>=5?"#f59e0b":"#ef4444"}}>{rw.score}/10</span></div><div style={{background:"#fafffe",border:"1px solid #e8f5f3",borderRadius:9,padding:"10px 12px",fontSize:12,color:"#333",lineHeight:1.7,marginBottom:8,whiteSpace:"pre-wrap"}}>{rw.caption}</div><div style={{fontSize:10,color:"#64748b",fontStyle:"italic",marginBottom:8}}>💬 {rw.why}</div><Btn small outline onClick={function(){copyCaption(rw.caption,i);}}>{copiedIdx===i?"✅ Copied!":"📋 Copy"}</Btn></Card>;})}
      <Card animate="fadeUp" delay={400} style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:13,color:TEAL,marginBottom:10}}># Hashtags</div><div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{result.hashtags.map(function(h){return <span key={h} style={{background:TL,color:TEAL,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:600}}>{h}</span>;})}</div>{result.best_posting_time&&<div style={{display:"inline-flex",alignItems:"center",gap:7,background:TL,borderRadius:99,padding:"6px 13px",marginBottom:10}}><span>⏰</span><span style={{fontSize:11,fontWeight:700,color:TEAL}}>Best time: {result.best_posting_time}</span></div>}{result.pro_tip&&<div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:9,padding:"9px 12px",fontSize:11,color:"#78350f",lineHeight:1.6}}><span style={{fontWeight:700}}>💡 Pro tip: </span>{result.pro_tip}</div>}</Card>
      <div className="fadeUp" style={{display:"flex",gap:8}}><Btn small outline full onClick={function(){setResult(null);}}>✏️ Retry</Btn><Btn small full onClick={onHome}>🏠 Home</Btn></div>
    </div>}
  </div>;
}

// ── CALENDAR PLANNER ──────────────────────────────────────────────────────────
function CalendarPlannerMode({onHome,activeData,webData}){
  var {mob}=useR();
  var [step,setStep]=useState(0);var [platform,setPlatform]=useState("");var [industry,setIndustry]=useState("");var [subIndustry,setSubIndustry]=useState("");var [goal,setGoal]=useState("");var [brandName,setBrandName]=useState("");var [monthYear,setMonthYear]=useState("");var [postsPerWeek,setPostsPerWeek]=useState("3");var [selectedPillars,setSelectedPillars]=useState([]);var [campaignNotes,setCampaignNotes]=useState("");var [result,setResult]=useState(null);var [loading,setLoading]=useState(false);var [error,setError]=useState("");var [expandedDay,setExpandedDay]=useState(null);var [viewMode,setViewMode]=useState("calendar");
  var GOALS=["Brand Awareness","Lead Generation","Sales & Conversion","Community Building","Product Launch","Event Promotion","Engagement Growth"];
  function togglePillar(p){setSelectedPillars(function(prev){return prev.includes(p)?prev.filter(function(x){return x!==p;}):[].concat(prev,[p]);});}
  async function generate(){
    if(!platform||!goal||!monthYear){setError("Fill in platform, goal, and month.");return;}setLoading(true);setError("");
    var webCtx=webData.length>0?("Live benchmarks:\n"+JSON.stringify(webData.slice(0,2),null,2)):"";
    var histCtx=activeData.length>0?("Historical ("+activeData.length+" rows):\n"+JSON.stringify(activeData.slice(0,10),null,2)):"";
    var prompt='PredictaPost Calendar AI.\nBrand:'+(brandName||"The Brand")+'|Platform:'+platform+'|Industry:'+(industry||"General")+(subIndustry?' > '+subIndustry:'')+'\nGoal:'+goal+'|Month:'+monthYear+'|Posts/wk:'+postsPerWeek+'\nPillars:'+(selectedPillars.length>0?selectedPillars.join(", "):PILLARS.join(", "))+'\nNotes:'+(campaignNotes||"None")+'\n'+webCtx+'\n'+histCtx+'\nONLY valid JSON:\n{"month_overview":{"total_posts":<n>,"pillar_breakdown":{"Education":<pct>,"Promotion":<pct>,"Storytelling":<pct>,"Entertainment":<pct>},"strategy_summary":"...","key_themes":["t1","t2","t3"]},"weeks":[{"week_number":1,"theme":"...","posts":[{"day":"Mon Jan 6","day_short":"Mon","date_num":6,"platform":"'+platform+'","content_type":"...","pillar":"...","caption_idea":"...","visual_direction":"...","hook":"...","hashtags":["#t1","#t2"],"best_time":"...","predicted_score":<1-10>,"priority":"High"|"Medium"|"Low","notes":"..."}]}],"tips":["t1","t2","t3"]}';
    try{var r=await callClaude(prompt);setResult(r);setStep(1);}catch(e){setError("Something went wrong.");}setLoading(false);
  }
  var allPosts=result?result.weeks.reduce(function(acc,w){return acc.concat(w.posts);},[]):[];
  function exportCSV(){var rows=[["Day","Content Type","Pillar","Caption","Best Time","Score","Priority"]];allPosts.forEach(function(p){rows.push([p.day,p.content_type,p.pillar,'"'+p.caption_idea+'"',p.best_time,p.predicted_score,p.priority]);});var csv=rows.map(function(r){return r.join(",");}).join("\n");var blob=new Blob([csv],{type:"text/csv"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="calendar-"+monthYear.replace(" ","-")+".csv";a.click();}
  return <div>
    <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
      <button className="btn-hover" onClick={onHome} style={{background:TL,border:"none",cursor:"pointer",color:TEAL,fontSize:13,fontWeight:700,borderRadius:99,padding:"6px 12px"}}>← Home</button>
      <div style={{fontWeight:800,fontSize:mob?16:18,color:TEAL}}>📅 Calendar</div>
      {result&&<div style={{marginLeft:"auto",display:"flex",gap:6}}><div onClick={function(){setViewMode("calendar");}} style={{cursor:"pointer",padding:"5px 11px",borderRadius:99,fontSize:10,fontWeight:700,background:viewMode==="calendar"?TEAL:TL,color:viewMode==="calendar"?"#fff":TEAL,border:"1.5px solid "+TEAL}}>📅 Cal</div><div onClick={function(){setViewMode("list");}} style={{cursor:"pointer",padding:"5px 11px",borderRadius:99,fontSize:10,fontWeight:700,background:viewMode==="list"?TEAL:TL,color:viewMode==="list"?"#fff":TEAL,border:"1.5px solid "+TEAL}}>📋 List</div></div>}
    </div>
    {step===0&&<Card animate="fadeUp" delay={60}>
      <div style={{fontWeight:800,fontSize:15,color:TEAL,marginBottom:18}}>Plan your content month</div>
      <div className="fadeUp" style={{marginBottom:20}}><Label>Platform</Label><PillGroup options={PLATFORMS} value={platform} onChange={setPlatform} icons={PLATFORM_ICONS}/></div>
      <IndustrySelector industry={industry} setIndustry={setIndustry} subIndustry={subIndustry} setSubIndustry={setSubIndustry}/>
      <div className="fadeUp" style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12,marginBottom:18}}><div><Label>Brand / Client</Label><input className="input-focus" value={brandName} onChange={function(e){setBrandName(e.target.value);}} placeholder="e.g. Café de Bangkok" style={{width:"100%",padding:"10px 12px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:12,fontFamily:"inherit",color:"#333",background:"#fafffe"}}/></div><div><Label>Month & Year</Label><input className="input-focus" value={monthYear} onChange={function(e){setMonthYear(e.target.value);}} placeholder="e.g. April 2025" style={{width:"100%",padding:"10px 12px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:12,fontFamily:"inherit",color:"#333",background:"#fafffe"}}/></div></div>
      <div className="fadeUp" style={{marginBottom:18}}><Label>Goal</Label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{GOALS.map(function(g){return <div key={g} onClick={function(){setGoal(g);}} className="pill-hover" style={{cursor:"pointer",padding:"7px 12px",borderRadius:99,fontSize:mob?11:12,fontWeight:600,userSelect:"none",background:goal===g?TEAL:TL,color:goal===g?"#fff":TEAL,border:"1.5px solid "+(goal===g?TEAL:"#a7d9d4"),WebkitTapHighlightColor:"transparent"}}>{g}</div>;})} </div></div>
      <div className="fadeUp" style={{marginBottom:18}}><Label>Posts/Week</Label><div style={{display:"flex",gap:7}}>{["1","2","3","4","5","7"].map(function(n){return <div key={n} onClick={function(){setPostsPerWeek(n);}} className="pill-hover" style={{cursor:"pointer",padding:"8px 14px",borderRadius:12,fontSize:13,fontWeight:700,background:postsPerWeek===n?TEAL:TL,color:postsPerWeek===n?"#fff":TEAL,border:"1.5px solid "+(postsPerWeek===n?TEAL:"#a7d9d4"),WebkitTapHighlightColor:"transparent"}}>{n}×</div>;})} </div></div>
      <div className="fadeUp" style={{marginBottom:18}}><Label>Pillars <span style={{textTransform:"none",fontWeight:400,color:"#bbb"}}>(optional)</span></Label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{PILLARS.map(function(p){var pc=PILLAR_COLORS[p]||TEAL;return <div key={p} onClick={function(){togglePillar(p);}} className="pill-hover" style={{cursor:"pointer",padding:"7px 12px",borderRadius:99,fontSize:mob?11:12,fontWeight:600,userSelect:"none",background:selectedPillars.includes(p)?pc:TL,color:selectedPillars.includes(p)?"#fff":TEAL,border:"1.5px solid "+(selectedPillars.includes(p)?pc:"#a7d9d4"),WebkitTapHighlightColor:"transparent"}}>{p}</div>;})} </div></div>
      <div className="fadeUp" style={{marginBottom:22}}><Label>Campaign Notes</Label><textarea className="input-focus" value={campaignNotes} onChange={function(e){setCampaignNotes(e.target.value);}} rows={3} placeholder="e.g. Songkran campaign, new product launch..." style={{width:"100%",padding:"10px 12px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:12,fontFamily:"inherit",resize:"vertical",color:"#333",lineHeight:1.6,background:"#fafffe"}}/></div>
      {error&&<div className="fadeIn" style={{background:"#fff0f0",color:"#e53e3e",borderRadius:10,padding:"10px 13px",fontSize:13,marginBottom:14}}>{error}</div>}
      <Btn full disabled={loading} onClick={generate}>{loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/> Building...</span>:"📅 Generate Calendar →"}</Btn>
    </Card>}
    {step===1&&result&&<div>
      <Card animate="pop" style={{marginBottom:12,background:"linear-gradient(135deg,"+TEAL+","+TM+")",border:"none"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}><div><div style={{fontWeight:900,fontSize:mob?14:16,color:"#fff",marginBottom:2}}>{brandName||"Your Brand"} · {monthYear}</div><div style={{fontSize:11,color:"rgba(255,255,255,.75)"}}>{platform} · {goal}</div></div><div style={{textAlign:"center",background:"rgba(255,255,255,.15)",borderRadius:10,padding:"8px 14px"}}><div style={{fontSize:22,fontWeight:900,color:"#fff"}}>{result.month_overview.total_posts}</div><div style={{fontSize:9,color:"rgba(255,255,255,.75)",fontWeight:600}}>POSTS</div></div></div><div style={{fontSize:12,color:"rgba(255,255,255,.9)",lineHeight:1.6,marginBottom:10}}>{result.month_overview.strategy_summary}</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{result.month_overview.key_themes.map(function(t){return <span key={t} style={{background:"rgba(255,255,255,.2)",color:"#fff",borderRadius:99,padding:"2px 9px",fontSize:10,fontWeight:600}}>{t}</span>;})}</div></Card>
      <Card animate="fadeUp" delay={80} style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:13,color:TEAL,marginBottom:10}}>🎯 Pillar Mix</div>{Object.keys(result.month_overview.pillar_breakdown).filter(function(p){return result.month_overview.pillar_breakdown[p]>0;}).map(function(p,i){var pct=result.month_overview.pillar_breakdown[p];return <div key={p} className="fadeUp" style={{display:"flex",alignItems:"center",gap:9,marginBottom:7,animationDelay:(i*60)+"ms"}}><div style={{fontSize:11,width:mob?110:130,color:"#555",flexShrink:0}}>{p}</div><Bar pct={pct} color={PILLAR_COLORS[p]||TEAL} delay={i*60}/><div style={{fontSize:11,fontWeight:700,color:PILLAR_COLORS[p]||TEAL,width:32,textAlign:"right"}}>{pct}%</div></div>;})} </Card>
      {viewMode==="calendar"&&result.weeks.map(function(week,wi){return <div key={wi} className="fadeUp" style={{animationDelay:(wi*80)+"ms",marginBottom:14}}>
        <div style={{fontWeight:700,fontSize:12,color:TEAL,marginBottom:7,display:"flex",alignItems:"center",gap:7}}><span style={{background:TEAL,color:"#fff",borderRadius:7,padding:"2px 9px",fontSize:10}}>Week {week.week_number}</span><span style={{color:"#555"}}>{week.theme}</span></div>
        <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(auto-fill,minmax(130px,1fr))",gap:7}}>
          {week.posts.map(function(post,pi){var pid=wi+"-"+pi;var isOpen=expandedDay===pid;var pcolor=PILLAR_COLORS[post.pillar]||TEAL;return <div key={pi}>
            <div onClick={function(){setExpandedDay(isOpen?null:pid);}} className="card-hover" style={{background:"#fff",border:"2px solid "+(isOpen?pcolor:"#d1ede9"),borderRadius:12,padding:"10px",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><div style={{fontSize:11,fontWeight:800,color:"#555"}}>{post.day_short}</div><div style={{fontSize:9,background:PRIORITY_COLORS[post.priority]+"22",color:PRIORITY_COLORS[post.priority],borderRadius:99,padding:"1px 6px",fontWeight:700}}>{post.priority}</div></div>
              <div style={{background:pcolor+"18",color:pcolor,borderRadius:6,padding:"2px 7px",fontSize:9,fontWeight:700,marginBottom:5,display:"inline-block"}}>{post.pillar}</div>
              <div style={{fontSize:10,color:"#555",fontWeight:600,marginBottom:3,lineHeight:1.3}}>{post.content_type}</div>
              <div style={{fontSize:9,color:"#888",lineHeight:1.3,overflow:"hidden",maxHeight:28}}>{post.caption_idea}</div>
              <div style={{marginTop:5,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:9,color:"#94a3b8"}}>{post.best_time}</div><div style={{fontSize:10,fontWeight:800,color:post.predicted_score>=7?TEAL:post.predicted_score>=5?"#f59e0b":"#ef4444"}}>{post.predicted_score}/10</div></div>
            </div>
            {isOpen&&<div className="slideDown" style={{background:"#fff",border:"1.5px solid "+pcolor,borderRadius:11,padding:"12px",marginTop:5}}>
              <div style={{fontSize:11,fontWeight:700,color:pcolor,marginBottom:7}}>{post.day}</div>
              <div style={{marginBottom:7}}><div style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>Caption</div><div style={{fontSize:11,color:"#333",lineHeight:1.6,background:"#fafffe",borderRadius:8,padding:"9px 10px"}}>{post.caption_idea}</div></div>
              {post.hook&&<div style={{marginBottom:7}}><div style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>🎣 Hook</div><div style={{fontSize:11,color:"#7c3aed",background:"#f3e8ff",borderRadius:7,padding:"7px 9px"}}>{post.hook}</div></div>}
              {post.visual_direction&&<div style={{marginBottom:7}}><div style={{fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>📸 Visual</div><div style={{fontSize:11,color:"#333",background:TL,borderRadius:7,padding:"7px 9px"}}>{post.visual_direction}</div></div>}
              {post.hashtags&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:9}}>{post.hashtags.map(function(h){return <span key={h} style={{background:TL,color:TEAL,borderRadius:99,padding:"2px 7px",fontSize:9,fontWeight:600}}>{h}</span>;})}</div>}
              <Btn small outline onClick={function(){navigator.clipboard.writeText(post.caption_idea+"\n\n"+(post.hashtags||[]).join(" "));}}>📋 Copy</Btn>
            </div>}
          </div>;})}
        </div>
      </div>;})}
      {viewMode==="list"&&allPosts.map(function(post,i){var pcolor=PILLAR_COLORS[post.pillar]||TEAL;return <Card key={i} animate="fadeUp" delay={i*40} style={{marginBottom:8,padding:"12px 14px"}}><div style={{display:"flex",alignItems:"flex-start",gap:12}}><div style={{textAlign:"center",minWidth:40,flexShrink:0}}><div style={{fontSize:16,fontWeight:900,color:pcolor}}>{post.date_num}</div><div style={{fontSize:9,color:"#94a3b8",fontWeight:600}}>{post.day_short}</div></div><div style={{flex:1,minWidth:0}}><div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:5}}><span style={{background:pcolor+"18",color:pcolor,borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:700}}>{post.pillar}</span><span style={{background:"#f1f5f9",color:"#64748b",borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:600}}>{post.content_type}</span></div><div style={{fontSize:12,color:"#333",lineHeight:1.5,marginBottom:5}}>{post.caption_idea}</div><div style={{display:"flex",gap:10,fontSize:10,color:"#94a3b8"}}><span>⏰ {post.best_time}</span><span>📊 {post.predicted_score}/10</span></div></div><Btn small outline onClick={function(){navigator.clipboard.writeText(post.caption_idea+"\n\n"+(post.hashtags||[]).join(" "));}} style={{flexShrink:0}}>📋</Btn></div></Card>;})}
      {result.tips&&<Card animate="fadeUp" delay={400} style={{marginBottom:12,background:"#fffbeb",border:"1px solid #fde68a"}}><div style={{fontWeight:700,fontSize:12,color:"#92400e",marginBottom:9}}>💡 Strategy Tips</div>{result.tips.map(function(t,i){return <div key={i} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start"}}><span style={{color:"#f59e0b",fontWeight:700,flexShrink:0}}>→</span><div style={{fontSize:11,color:"#78350f",lineHeight:1.5}}>{t}</div></div>;})}</Card>}
      <div className="fadeUp" style={{display:"flex",gap:8}}><Btn small outline onClick={function(){setStep(0);setResult(null);}}>✏️ Redo</Btn><Btn small outline onClick={exportCSV}>⬇️ CSV</Btn><Btn small full onClick={onHome}>🏠 Home</Btn></div>
    </div>}
  </div>;
}

// ── EVAL LOG ──────────────────────────────────────────────────────────────────
function EvalLog({log,onDelete,onClear}){
  var {mob}=useR();
  var [filter,setFilter]=useState("All");var [expanded,setExpanded]=useState(null);
  var filtered=log.filter(function(e){return filter==="All"||e.verdict===filter;});
  var avg=log.length?Math.round((log.reduce(function(a,e){return a+e.overall;},0)/log.length)*10)/10:null;
  var topPlatform=null;if(log.length){var pm={};log.forEach(function(e){pm[e.platform]=(pm[e.platform]||0)+1;});var pe=Object.keys(pm).sort(function(a,b){return pm[b]-pm[a];});if(pe.length)topPlatform=pe[0];}
  var bestPillar=null;if(log.length){var bm={};log.forEach(function(e){if(!bm[e.pillar])bm[e.pillar]={sum:0,n:0};bm[e.pillar].sum+=e.overall;bm[e.pillar].n++;});var be=Object.keys(bm).sort(function(a,b){return (bm[b].sum/bm[b].n)-(bm[a].sum/bm[a].n);});if(be.length)bestPillar=be[0];}
  return <div>
    {log.length>0&&<Card animate="fadeUp" style={{marginBottom:14,background:"linear-gradient(135deg,"+TEAL+","+TM+")",border:"none"}}><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,textAlign:"center"}}>{[{label:"Evals",val:log.length},{label:"Avg Score",val:avg?(avg+"/10"):"—"},{label:"Top Platform",val:topPlatform?(PLATFORM_ICONS[topPlatform]+" "+topPlatform):"—"},{label:"Best Pillar",val:bestPillar||"—"}].map(function(item){return <div key={item.label}><div style={{fontSize:mob?14:18,fontWeight:900,color:"#fff",lineHeight:1.2}}>{item.val}</div><div style={{fontSize:9,color:"rgba(255,255,255,.7)",marginTop:3,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{item.label}</div></div>;})}</div></Card>}
    {log.length>0&&<div className="fadeUp" style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}><span style={{fontSize:10,fontWeight:700,color:"#888"}}>Filter:</span>{["All","Great","Good","Needs Work","Poor"].map(function(v){return <div key={v} className="pill-hover" onClick={function(){setFilter(v);}} style={{cursor:"pointer",padding:"4px 10px",borderRadius:99,fontSize:10,fontWeight:600,userSelect:"none",background:filter===v?TEAL:TL,color:filter===v?"#fff":TEAL,border:"1.5px solid "+(filter===v?TEAL:"#a7d9d4")}}>{v}</div>;})} <Btn small danger onClick={onClear} style={{marginLeft:"auto"}}>🗑</Btn></div>}
    {log.length===0&&<Card animate="fadeUp" style={{textAlign:"center",padding:"48px 24px"}}><div style={{fontSize:40,marginBottom:14}}>📋</div><div style={{fontWeight:800,fontSize:17,color:"#1a1a1a",marginBottom:7}}>No evaluations yet</div><div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6}}>Every evaluation is automatically saved here.</div></Card>}
    {filtered.map(function(entry,i){var vs=verdictStyle(entry.verdict);var isOpen=expanded===entry.id;return <div key={entry.id} className="fadeUp" style={{animationDelay:(i*60)+"ms",marginBottom:10}}>
      <div style={{background:"#fff",borderRadius:14,border:"1.5px solid "+(isOpen?TEAL:"#d1ede9"),overflow:"hidden"}}>
        <div onClick={function(){setExpanded(isOpen?null:entry.id);}} style={{padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:42,height:42,borderRadius:10,background:entry.overall>=7?"#dcfce7":entry.overall>=5?"#fef9c3":"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:16,fontWeight:900,color:entry.overall>=7?"#16a34a":entry.overall>=5?"#ca8a04":"#dc2626"}}>{entry.overall}</span></div>
          <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2,flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:700}}>{PLATFORM_ICONS[entry.platform]||""} {entry.platform}</span><span style={{fontSize:10,color:"#888"}}>{entry.ctype} · {entry.pillar}</span><span style={{padding:"2px 7px",borderRadius:99,fontSize:9,fontWeight:700,background:vs.bg,color:vs.color}}>{vs.emoji} {entry.verdict}</span></div><div style={{fontSize:11,color:"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{entry.caption}</div></div>
          <div style={{fontSize:9,color:"#aaa",whiteSpace:"nowrap",flexShrink:0}}>{entry.date}</div>
        </div>
        {isOpen&&<div className="fadeIn" style={{borderTop:"1px solid #e8f5f3",padding:"14px",background:"#fafffe"}}>
          <div style={{marginBottom:10}}>{[{l:"🎙 Voice",k:"voice",c:TEAL},{l:"📖 Clarity",k:"clarity",c:TM},{l:"🔥 Engagement",k:"engagement",c:"#f59e0b"}].map(function(s,j){return <div key={s.k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}><div style={{fontSize:11,width:mob?100:140,color:"#555"}}>{s.l}</div><Bar pct={(entry.scores[s.k]/10)*100} color={s.c} delay={j*60}/><div style={{fontSize:11,fontWeight:700,color:s.c,width:30,textAlign:"right"}}>{entry.scores[s.k]}/10</div></div>;})}</div>
          <div style={{marginBottom:9}}><div style={{fontSize:10,fontWeight:700,color:"#888",marginBottom:5}}>💡 Suggestions</div>{entry.suggestions.map(function(s,j){return <div key={j} style={{display:"flex",gap:7,marginBottom:5,alignItems:"flex-start"}}><div style={{width:17,height:17,borderRadius:"50%",background:TL,color:TEAL,fontWeight:800,fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{j+1}</div><div style={{fontSize:11,color:"#444",lineHeight:1.5}}>{s}</div></div>;})}</div>
          <div style={{background:TL,borderRadius:9,padding:"9px 11px",fontSize:11,color:"#333",lineHeight:1.6,marginBottom:10}}><span style={{fontWeight:700,color:TEAL,fontSize:10}}>✨ IMPROVED: </span>{entry.improved_caption}</div>
          <div style={{display:"flex",gap:7}}><Btn small outline onClick={function(){navigator.clipboard.writeText(entry.improved_caption);}}>📋 Copy</Btn><Btn small danger onClick={function(){onDelete(entry.id);setExpanded(null);}}>🗑</Btn></div>
        </div>}
      </div>
    </div>;})}
  </div>;
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function Home({onSelect}){
  var {mob}=useR();
  var modes=[{id:"evaluate",icon:"🔍",title:"Evaluate",desc:"Score your content idea before you post.",color:TEAL,bg:TL,border:"#a7d9d4",delay:0},{id:"calendar",icon:"📅",title:"Calendar Planner",desc:"Generate a full month content calendar.",color:"#0891b2",bg:"#cffafe",border:"#67e8f9",delay:60,badge:"NEW"},{id:"brainstorm",icon:"💡",title:"Brainstorm",desc:"Get 3 AI content ideas with predicted scores.",color:"#7c3aed",bg:"#f3e8ff",border:"#d8b4fe",delay:120},{id:"compare",icon:"⚔️",title:"Compare",desc:"Pit two captions against each other.",color:"#dc2626",bg:"#fee2e2",border:"#fca5a5",delay:180},{id:"rewriter",icon:"✍️",title:"Caption Rewriter",desc:"Rewrite any caption in multiple tones.",color:"#be185d",bg:"#fce7f3",border:"#f9a8d4",delay:240,badge:"NEW"}];
  return <div style={{maxWidth:680,margin:"0 auto"}}>
    <div className="fadeUp" style={{textAlign:"center",marginBottom:mob?24:36}}><div className="float" style={{display:"inline-block",marginBottom:10}}><Logo size={mob?44:56}/></div><div style={{fontSize:mob?20:26,fontWeight:900,color:"#1a1a1a",marginBottom:4}}>What would you like to do?</div><div style={{fontSize:mob?12:14,color:"#94a3b8"}}>Your AI-powered content team partner</div></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr",gap:10}}>
      {modes.map(function(m){return <div key={m.id} className="card-hover fadeUp" onClick={function(){onSelect(m.id);}} style={{background:"#fff",border:"2px solid "+m.border,borderRadius:mob?16:20,padding:mob?"14px":"20px 24px",cursor:"pointer",display:"flex",alignItems:"center",gap:mob?14:18,animationDelay:m.delay+"ms",position:"relative",WebkitTapHighlightColor:"transparent"}}>
        {m.badge&&<div style={{position:"absolute",top:-7,right:12,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",borderRadius:99,padding:"2px 9px",fontSize:9,fontWeight:800}}>{m.badge}</div>}
        <div style={{width:mob?44:54,height:mob?44:54,borderRadius:mob?13:16,background:m.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:mob?20:24,flexShrink:0,boxShadow:"0 4px 12px "+m.border+"88"}}>{m.icon}</div>
        <div style={{flex:1}}><div style={{fontWeight:800,fontSize:mob?14:16,color:m.color,marginBottom:2}}>{m.title}</div><div style={{fontSize:mob?11:13,color:"#64748b",lineHeight:1.4}}>{m.desc}</div></div>
        <div style={{fontSize:mob?16:20,color:m.border}}>→</div>
      </div>;})}
    </div>
    <div className="fadeUp" style={{marginTop:16,textAlign:"center",animationDelay:"320ms"}}>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8,background:"#fff",borderRadius:99,padding:"9px 18px",border:"1px solid #e0f2f0",boxShadow:"0 2px 12px rgba(13,148,136,.08)",display:"inline-flex"}}>
        {["Smart Scoring","AI Suggestions","Calendar","Tone Rewriting"].map(function(t,i){return <div key={t} style={{display:"flex",alignItems:"center",gap:4,fontSize:mob?10:11,color:TEAL,fontWeight:600}}>{i>0&&<span style={{color:"#d1ede9"}}>·</span>}<span style={{color:TM}}>✦</span>{t}</div>;})}</div>
    </div>
  </div>;
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
function App(){
  useInject();
  var {mob}=useR();
  var [appState,setAppState]=useState("loading");
  var [mode,setMode]=useState(null);var [showLog,setShowLog]=useState(false);var [showSettings,setShowSettings]=useState(false);
  var [showOnboarding,setShowOnboarding]=useState(false);var [showHelp,setShowHelp]=useState(false);
  var [log,setLog]=useState([]);var [files,setFiles]=useState([]);var [webDataCache,setWebDataCache]=useState([]);
  var [pinEnabled,setPinEnabled]=useState(false);var [sessionPin,setSessionPin]=useState(null);

  var loadData=useCallback(async function(pin){
    try{var r=await window.storage.get("pp_eval_log");if(r&&r.value){var d=pin?await decryptData(r.value,pin):JSON.parse(r.value);if(Array.isArray(d))setLog(d);}}catch(e){}
    try{var r2=await window.storage.get("pp_data_files");if(r2&&r2.value){var d2=pin?await decryptData(r2.value,pin):JSON.parse(r2.value);if(Array.isArray(d2))setFiles(d2);}}catch(e){}
    try{var r3=await window.storage.get("pp_web_data");if(r3&&r3.value){var d3=pin?await decryptData(r3.value,pin):JSON.parse(r3.value);if(Array.isArray(d3))setWebDataCache(d3);}}catch(e){}
  },[]);

  useEffect(function(){
    var boot=async function(){
      try{
        var meta=await window.storage.get("pp_meta");
        if(meta&&meta.value){var m=JSON.parse(meta.value);if(m&&m.pinHash){setPinEnabled(true);setAppState("pin_verify");return;}}
        await loadData(null);
        try{var ob=await window.storage.get("pp_onboarded");if(!ob||!ob.value)setShowOnboarding(true);}catch(e){setShowOnboarding(true);}
        setAppState("unlocked");
      }catch(e){setAppState("unlocked");}
    };
    boot();
  },[loadData]);

  async function handleUnlock(pin){
    try{var meta=await window.storage.get("pp_meta");if(!meta||!meta.value)return false;var m=JSON.parse(meta.value);var h=await hashPin(pin);if(h!==m.pinHash)return false;setSessionPin(pin);await loadData(pin);try{var ob=await window.storage.get("pp_onboarded");if(!ob||!ob.value)setShowOnboarding(true);}catch(e){setShowOnboarding(true);}setAppState("unlocked");return true;}catch(e){return false;}
  }
  async function handleSkip(){await loadData(null);setAppState("unlocked");}
  async function handleForgotPin(){if(window.storage){await window.storage.set("pp_eval_log","[]").catch(function(){});await window.storage.set("pp_data_files","[]").catch(function(){});await window.storage.set("pp_web_data","[]").catch(function(){});await window.storage.set("pp_meta","{}").catch(function(){});}setLog([]);setFiles([]);setWebDataCache([]);setSessionPin(null);setPinEnabled(false);setAppState("unlocked");}
  async function handleSetPin(pin){var h=await hashPin(pin);if(log.length>0){var e=await encryptData(log,pin);if(window.storage)await window.storage.set("pp_eval_log",e).catch(function(){});}if(files.length>0){var e2=await encryptData(files,pin);if(window.storage)await window.storage.set("pp_data_files",e2).catch(function(){});}if(webDataCache.length>0){var e3=await encryptData(webDataCache,pin);if(window.storage)await window.storage.set("pp_web_data",e3).catch(function(){});}if(window.storage)await window.storage.set("pp_meta",JSON.stringify({pinHash:h})).catch(function(){});setSessionPin(pin);setPinEnabled(true);}
  async function handleRemovePin(currentPin){var h=await hashPin(currentPin);try{var meta=await window.storage.get("pp_meta");if(!meta||!meta.value)return false;var m=JSON.parse(meta.value);if(h!==m.pinHash)return false;}catch(e){return false;}if(log.length>0&&window.storage)await window.storage.set("pp_eval_log",JSON.stringify(log)).catch(function(){});if(files.length>0&&window.storage)await window.storage.set("pp_data_files",JSON.stringify(files)).catch(function(){});if(webDataCache.length>0&&window.storage)await window.storage.set("pp_web_data",JSON.stringify(webDataCache)).catch(function(){});if(window.storage)await window.storage.set("pp_meta",JSON.stringify({})).catch(function(){});setSessionPin(null);setPinEnabled(false);return true;}
  async function saveLog(l){setLog(l);if(window.storage){var data=sessionPin?await encryptData(l,sessionPin):JSON.stringify(l);window.storage.set("pp_eval_log",data).catch(function(){});}}
  async function saveFiles(f){setFiles(f);if(window.storage){var data=sessionPin?await encryptData(f,sessionPin):JSON.stringify(f);window.storage.set("pp_data_files",data).catch(function(){});}}
  async function saveWebData(d){setWebDataCache(d);if(window.storage){var data=sessionPin?await encryptData(d,sessionPin):JSON.stringify(d);window.storage.set("pp_web_data",data).catch(function(){});}}
  function addLogEntry(entry){saveLog([entry].concat(log));}
  function delLogEntry(id){saveLog(log.filter(function(e){return e.id!==id;}));}
  function clearLog(){saveLog([]);}
  function addFiles(newFiles){var merged=[].concat(files,newFiles.filter(function(nf){return !files.find(function(f){return f.name===nf.name;});}));saveFiles(merged);}
  function toggleFile(id,val){saveFiles(files.map(function(f){return f.id===id?Object.assign({},f,{active:val}):f;}));}
  function deleteFile(id){saveFiles(files.filter(function(f){return f.id!==id;}));}
  function clearFiles(){saveFiles([]);}
  function addWebData(data,query){var entry={id:Date.now(),query:query,data:data,addedAt:new Date().toLocaleDateString()};saveWebData([entry].concat(webDataCache).slice(0,5));}
  async function handleOnboardingDone(){setShowOnboarding(false);if(window.storage)await window.storage.set("pp_onboarded","true").catch(function(){});}
  function handleReplayTutorial(){setShowHelp(false);setShowOnboarding(true);}

  var activeData=files.filter(function(f){return f.active;}).reduce(function(acc,f){var rows=(f.rows||[]).map(function(row){var masked={};Object.keys(row).forEach(function(col){masked[col]=isSensitiveCol(col)?maskValue(row[col]):row[col];});return masked;});return acc.concat(rows);},[]).slice(0,60);
  var webData=webDataCache.slice(0,3);
  var totalSources=files.length+webDataCache.length;
  var activeFileCount=files.filter(function(f){return f.active;}).length;
  function goHome(){setMode(null);setShowLog(false);}

  if(appState==="loading")return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0d9488,#0e7490)"}}><div style={{textAlign:"center"}}><Logo size={52}/><div style={{marginTop:14,fontSize:14,color:"rgba(255,255,255,.8)",fontFamily:"'Inter',sans-serif"}}>Loading...</div></div></div>;
  if(appState==="pin_verify")return <PinLock mode="verify" onUnlock={handleUnlock} onSkip={handleForgotPin}/>;

  return <div style={{fontFamily:"'Inter',sans-serif",background:"#f0faf8",minHeight:"100vh",paddingBottom:60,position:"relative"}}>
    <BgDots/>
    {showOnboarding&&<OnboardingModal onDone={handleOnboardingDone}/>}
    {showHelp&&<HelpPanel onClose={function(){setShowHelp(false);}} onReplayTutorial={handleReplayTutorial}/>}
    {showSettings&&<DataSourceManager files={files} onAddFiles={addFiles} onToggleFile={toggleFile} onDeleteFile={deleteFile} onClearFiles={clearFiles} onClose={function(){setShowSettings(false);}} onAddWebData={addWebData} pinEnabled={pinEnabled} onSetPin={handleSetPin} onRemovePin={handleRemovePin}/>}
    <div style={{position:"relative",zIndex:1}}>
      <div style={{background:"rgba(255,255,255,.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid #d1ede9",padding:mob?"10px 14px":"13px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div onClick={goHome} className="btn-hover" style={{display:"flex",alignItems:"center",gap:mob?8:10,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
          <Logo size={mob?34:42}/>
          <div><div style={{fontWeight:900,fontSize:mob?15:18,color:TEAL,letterSpacing:"-.3px"}}>PredictaPost</div>{!mob&&<div style={{fontSize:11,color:"#94a3b8",marginTop:-1}}>Know Before You Post.</div>}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:mob?5:8}}>
          {pinEnabled&&<div style={{fontSize:mob?9:11,color:"#16a34a",fontWeight:700,background:"#dcfce7",borderRadius:99,padding:mob?"3px 7px":"4px 10px"}}>🔐{!mob?" Encrypted":""}</div>}
          {totalSources>0&&!mob&&<div style={{fontSize:11,color:"#64748b",fontWeight:600,background:"#f1f5f9",borderRadius:99,padding:"4px 10px"}}>✅ {activeFileCount} file{activeFileCount!==1?"s":""}{webDataCache.length>0?" · "+webDataCache.length+" web":""}</div>}
          <button className="btn-hover" onClick={function(){setShowHelp(true);}} style={{padding:mob?"7px 10px":"8px 12px",borderRadius:12,fontSize:13,fontWeight:800,cursor:"pointer",background:TL,color:TEAL,border:"2px solid "+TEAL,WebkitTapHighlightColor:"transparent"}}>?</button>
          <button className="btn-hover" onClick={function(){setShowLog(true);setMode(null);}} style={{padding:mob?"7px 10px":"8px 14px",borderRadius:12,fontSize:12,fontWeight:700,cursor:"pointer",background:showLog?TEAL:TL,color:showLog?"#fff":TEAL,border:"2px solid "+TEAL,display:"flex",alignItems:"center",gap:5,WebkitTapHighlightColor:"transparent"}}>📋{!mob&&" Log"} {log.length>0&&<span style={{background:showLog?"rgba(255,255,255,.3)":TEAL,color:"#fff",borderRadius:99,padding:"1px 6px",fontSize:10,fontWeight:800}}>{log.length}</span>}</button>
          <button className="btn-hover" onClick={function(){setShowSettings(true);}} style={{padding:mob?"7px 10px":"8px 14px",borderRadius:12,fontSize:12,fontWeight:700,cursor:"pointer",background:TL,color:TEAL,border:"2px solid "+TEAL,display:"flex",alignItems:"center",gap:4,WebkitTapHighlightColor:"transparent"}}>⚙️{!mob&&" Data"} {totalSources>0&&<span style={{background:TEAL,color:"#fff",borderRadius:99,padding:"1px 6px",fontSize:10,fontWeight:800}}>{totalSources}</span>}</button>
        </div>
      </div>
      <div style={{maxWidth:760,margin:"0 auto",padding:mob?"16px 14px 32px":"32px 20px"}}>
        {showLog&&<div><div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><button className="btn-hover" onClick={goHome} style={{background:TL,border:"none",cursor:"pointer",color:TEAL,fontSize:13,fontWeight:700,borderRadius:99,padding:"6px 12px"}}>← Home</button><div style={{fontWeight:800,fontSize:mob?16:18,color:TEAL}}>📋 Eval Log</div><div style={{fontSize:11,color:"#94a3b8"}}>{log.length} eval{log.length!==1?"s":""}</div></div><EvalLog log={log} onDelete={delLogEntry} onClear={clearLog}/></div>}
        {!showLog&&!mode&&<Home onSelect={setMode}/>}
        {!showLog&&mode==="evaluate"&&<EvaluateMode onHome={goHome} onLogEntry={addLogEntry} activeData={activeData} webData={webData}/>}
        {!showLog&&mode==="brainstorm"&&<BrainstormMode onHome={goHome} activeData={activeData} webData={webData}/>}
        {!showLog&&mode==="compare"&&<CompareMode onHome={goHome}/>}
        {!showLog&&mode==="calendar"&&<CalendarPlannerMode onHome={goHome} activeData={activeData} webData={webData}/>}
        {!showLog&&mode==="rewriter"&&<CaptionRewriterMode onHome={goHome} activeData={activeData} webData={webData}/>}
      </div>
    </div>
  </div>;
}

export default function PredictaPost(){
  return <ResponsiveProvider><App/></ResponsiveProvider>;
}
