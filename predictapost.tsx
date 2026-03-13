import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

const PLATFORMS=["Instagram","Facebook","TikTok","X (Twitter)","YouTube"];
const CONTENT_TYPES={Instagram:["Reel","Carousel","Story","Static Post"],Facebook:["Video","Post","Story","Reel"],TikTok:["Short Video","Duet","Stitch","Live"],"X (Twitter)":["Tweet","Thread","Poll","Space"],YouTube:["Short","Long-form Video","Community Post"]};
const VIDEO_TYPES=["Reel","Short Video","Duet","Stitch","Live","Short","Long-form Video","Video"];
const PILLARS=["Education","Promotion","Storytelling","Entertainment","Inspiration","Behind the Scenes","User Generated","Product"];

const THAILAND_INDUSTRIES={
  "🌾 Agriculture & Food":{icon:"🌾",color:"#16a34a",bg:"#dcfce7",border:"#86efac",subs:["Rice & Grains","Rubber & Latex","Seafood & Aquaculture","Fruits & Vegetables","Sugar & Sugarcane","Processed Food","Organic Farming","Palm Oil"]},
  "🚗 Automotive":{icon:"🚗",color:"#1d4ed8",bg:"#dbeafe",border:"#93c5fd",subs:["Car Manufacturing","Auto Parts","EV & Electric Vehicles","Motorcycles","Logistics Vehicles","Aftermarket Parts"]},
  "📱 Electronics & Tech":{icon:"📱",color:"#7c3aed",bg:"#f3e8ff",border:"#d8b4fe",subs:["Consumer Electronics","Semiconductors","Software & Apps","E-commerce","Fintech","AI & Automation","Smart Devices","Telecoms"]},
  "🏥 Healthcare & Medical":{icon:"🏥",color:"#dc2626",bg:"#fee2e2",border:"#fca5a5",subs:["Hospitals & Clinics","Medical Tourism","Pharmaceuticals","Medical Devices","Wellness & Spa","Mental Health","Cosmetic Surgery","Traditional Medicine"]},
  "✈️ Tourism & Hospitality":{icon:"✈️",color:"#0891b2",bg:"#cffafe",border:"#67e8f9",subs:["Hotels & Resorts","Travel Agencies","Airlines","Restaurants & F&B","Entertainment Venues","MICE & Events","Eco-tourism","Luxury Travel"]},
  "🏗️ Real Estate & Construction":{icon:"🏗️",color:"#92400e",bg:"#fef3c7",border:"#fde68a",subs:["Residential Property","Commercial Property","Industrial Estates","Construction Materials","Interior Design","Smart Buildings","Co-working Spaces"]},
  "👗 Fashion & Retail":{icon:"👗",color:"#be185d",bg:"#fce7f3",border:"#f9a8d4",subs:["Apparel & Clothing","Gems & Jewelry","Luxury Goods","Department Stores","Online Retail","Beauty & Cosmetics","Sportswear","Fast Fashion"]},
  "💰 Finance & Banking":{icon:"💰",color:"#047857",bg:"#d1fae5",border:"#6ee7b7",subs:["Commercial Banks","Insurance","Investment","Cryptocurrency","Microfinance","Securities","Leasing","Digital Banking"]},
  "⚡ Energy & Environment":{icon:"⚡",color:"#d97706",bg:"#fef9c3",border:"#fde68a",subs:["Solar Energy","Wind Power","Biofuels","Petrochemicals","Natural Gas","EV Charging","Waste Management","Water Treatment"]},
  "📦 Logistics & Trade":{icon:"📦",color:"#0d9488",bg:"#e8f5f3",border:"#a7d9d4",subs:["Shipping & Freight","Last-mile Delivery","Warehousing","Supply Chain","Port & Airport","Cold Chain","Cross-border Trade"]},
  "🎓 Education":{icon:"🎓",color:"#4f46e5",bg:"#e0e7ff",border:"#a5b4fc",subs:["International Schools","Universities","EdTech","Language Learning","Vocational Training","Online Courses","Tutoring"]},
  "🎬 Media & Entertainment":{icon:"🎬",color:"#c2410c",bg:"#ffedd5",border:"#fdba74",subs:["TV & Streaming","Music","Gaming","Advertising","PR & Marketing","Social Media","Film & Production","Podcasting"]},
};

const TEAL="#0d9488",TEAL_LIGHT="#e8f5f3",TEAL_MID="#14b8a6";

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{0%{transform:scale(0.85);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes barGrow{from{width:0}to{width:var(--w)}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.fadeUp{animation:fadeUp .4s cubic-bezier(.22,1,.36,1) both}
.fadeIn{animation:fadeIn .35s ease both}
.pop{animation:pop .4s cubic-bezier(.22,1,.36,1) both}
.slideIn{animation:slideIn .35s cubic-bezier(.22,1,.36,1) both}
.slideDown{animation:slideDown .3s cubic-bezier(.22,1,.36,1) both}
.card-hover{transition:transform .2s,box-shadow .2s,background .2s}
.card-hover:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(13,148,136,.13)!important}
.pill-hover{transition:all .18s}.pill-hover:hover{filter:brightness(.95);transform:scale(1.03)}
.btn-hover{transition:all .18s}.btn-hover:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.06)}.btn-hover:active:not(:disabled){transform:scale(.97)}
.input-focus{transition:border-color .2s,box-shadow .2s}.input-focus:focus{border-color:${TEAL}!important;box-shadow:0 0 0 3px rgba(13,148,136,.12)!important;outline:none}
.spin{animation:spin .8s linear infinite}
.float{animation:float 3s ease-in-out infinite}
.shimmer{background:linear-gradient(90deg,#f0faf8 25%,#d4f1ed 50%,#f0faf8 75%);background-size:800px 100%;animation:shimmer 1.4s infinite}
`;
function useInject(){useEffect(()=>{if(document.getElementById("pp-styles"))return;const s=document.createElement("style");s.id="pp-styles";s.textContent=CSS;document.head.appendChild(s);},[]);}

// ── shared UI ──
const Label=({children})=>(<div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.7,marginBottom:7}}>{children}</div>);
const Card=({children,style={},animate="fadeUp",delay=0})=>(<div className={animate} style={{background:"#fff",borderRadius:18,border:"1px solid #d1ede9",padding:24,animationDelay:`${delay}ms`,...style}}>{children}</div>);
const Btn=({children,onClick,disabled,outline,full,small,danger,style={}})=>(
  <button className="btn-hover" onClick={onClick} disabled={disabled} style={{
    padding:small?"8px 18px":"12px 28px",borderRadius:12,fontSize:small?12:14,fontWeight:700,
    cursor:disabled?"not-allowed":"pointer",width:full?"100%":"auto",
    background:danger?"#fee2e2":outline?"#fff":disabled?"#a7d9d4":`linear-gradient(135deg,${TEAL},${TEAL_MID})`,
    color:danger?"#dc2626":outline?TEAL:"#fff",
    border:`2px solid ${danger?"#fca5a5":outline?TEAL:disabled?"#a7d9d4":"transparent"}`,
    boxShadow:outline||disabled||danger?"none":"0 4px 16px rgba(13,148,136,.28)",...style
  }}>{children}</button>
);
const Bar=({pct,color,delay=0})=>(
  <div style={{background:TEAL_LIGHT,borderRadius:99,height:8,flex:1,overflow:"hidden"}}>
    <div style={{"--w":`${Math.min(pct,100)}%`,width:`${Math.min(pct,100)}%`,background:color,borderRadius:99,height:8,animation:`barGrow .8s ${delay}ms cubic-bezier(.22,1,.36,1) both`}}/>
  </div>
);
const Toggle=({value,onChange})=>(
  <div onClick={()=>onChange(!value)} style={{width:40,height:22,borderRadius:99,background:value?TEAL:"#d1d5db",cursor:"pointer",position:"relative",transition:"background .25s",flexShrink:0}}>
    <div style={{position:"absolute",top:3,left:value?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
  </div>
);
const PillGroup=({options,value,onChange,icons={}})=>(
  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
    {options.map((o,i)=>(
      <div key={o} className="pill-hover slideIn" onClick={()=>onChange(o)} style={{cursor:"pointer",padding:"8px 16px",borderRadius:99,fontSize:13,fontWeight:600,userSelect:"none",background:value===o?TEAL:TEAL_LIGHT,color:value===o?"#fff":TEAL,border:`1.5px solid ${value===o?TEAL:"#a7d9d4"}`,boxShadow:value===o?"0 2px 10px rgba(13,148,136,.25)":"none",animationDelay:`${i*40}ms`}}>{icons[o]&&<span style={{marginRight:5}}>{icons[o]}</span>}{o}</div>
    ))}
  </div>
);
const ScoreRing=({score,size=90,delay=0})=>{
  const [anim,setAnim]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setAnim(score),delay+100);return()=>clearTimeout(t);},[score,delay]);
  const color=score>=7?"#0d9488":score>=5?"#f59e0b":"#ef4444";
  const r=size*.4,c=2*Math.PI*r,pct=(anim/10)*c;
  return(
    <div className="pop" style={{position:"relative",width:size,height:size,flexShrink:0,animationDelay:`${delay}ms`}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={TEAL_LIGHT} strokeWidth={size*.09}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size*.09} strokeDasharray={`${pct} ${c}`} strokeLinecap="round" style={{transition:"stroke-dasharray .9s cubic-bezier(.22,1,.36,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:size*.24,fontWeight:900,color,lineHeight:1}}>{score}</span>
        <span style={{fontSize:size*.12,color:"#aaa"}}>/10</span>
      </div>
    </div>
  );
};
const verdictStyle=v=>({
  "Great":{bg:"#dcfce7",color:"#16a34a",emoji:"🌟"},
  "Good":{bg:"#d1fae5",color:"#059669",emoji:"✅"},
  "Needs Work":{bg:"#fef9c3",color:"#ca8a04",emoji:"⚠️"},
  "Poor":{bg:"#fee2e2",color:"#dc2626",emoji:"❌"},
}[v]||{bg:TEAL_LIGHT,color:TEAL,emoji:"📊"});
function Steps({current,labels}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:28}}>
      {labels.map((s,i)=>{
        const done=i<current,active=i===current;
        return(<div key={i} style={{display:"flex",alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <div style={{width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,transition:"all .35s cubic-bezier(.22,1,.36,1)",background:done?TEAL:active?TEAL_LIGHT:"#f0f0f0",color:done?"#fff":active?TEAL:"#bbb",border:`2.5px solid ${done||active?TEAL:"#e0e0e0"}`,boxShadow:active?"0 0 0 4px rgba(13,148,136,.15)":"none"}}>{done?"✓":i+1}</div>
            <div style={{fontSize:10,fontWeight:active?700:500,color:active?TEAL:"#aaa",whiteSpace:"nowrap"}}>{s}</div>
          </div>
          {i<labels.length-1&&<div style={{width:48,height:2.5,margin:"0 4px",marginBottom:20,transition:"background .5s",background:done?TEAL:"#e0e0e0"}}/>}
        </div>);
      })}
    </div>
  );
}
function BgDots(){
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    {[[8,12],[85,25],[15,70],[90,80],[50,5],[40,90],[70,50]].map(([x,y],i)=>(
      <div key={i} style={{position:"absolute",left:`${x}%`,top:`${y}%`,width:i%2===0?200:120,height:i%2===0?200:120,borderRadius:"50%",background:`radial-gradient(circle,rgba(13,148,136,${i%3===0?.06:.04}) 0%,transparent 70%)`,animation:`float ${3+i*.5}s ease-in-out infinite`,animationDelay:`${i*.4}s`}}/>
    ))}
  </div>);
}
const Logo=({size=42})=>(
  <svg width={size} height={size} viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="hGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor:"#0d9488"}}/><stop offset="100%" style={{stopColor:"#14b8a6"}}/></linearGradient></defs>
    <rect width="42" height="42" rx="10" fill="url(#hGrad)"/>
    <rect x="6" y="28" width="5" height="10" rx="2" fill="rgba(255,255,255,.35)"/>
    <rect x="13" y="22" width="5" height="16" rx="2" fill="rgba(255,255,255,.55)"/>
    <rect x="20" y="16" width="5" height="22" rx="2" fill="rgba(255,255,255,.75)"/>
    <rect x="27" y="11" width="5" height="27" rx="2" fill="#fff"/>
    <polyline points="8,27 15,21 22,15 29,10" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeDasharray="3,2" fill="none" strokeLinecap="round"/>
    <circle cx="29.5" cy="7" r="5" fill="#fff" stroke="#0d9488" strokeWidth="1.2"/>
    <circle cx="27.5" cy="6.2" r=".9" fill="#0d9488"/>
    <path d="M31 5.8 Q32.5 4.8 34 5.8" stroke="#0d9488" strokeWidth="1" strokeLinecap="round" fill="none"/>
    <path d="M27.5 8.2 Q29.5 9.8 31.5 8.2" stroke="#0d9488" strokeWidth="1" strokeLinecap="round" fill="none"/>
  </svg>
);
function IndustrySelector({industry,setIndustry,subIndustry,setSubIndustry}){
  const [open,setOpen]=useState(false);
  const sel=industry?THAILAND_INDUSTRIES[industry]:null;
  return(
    <div style={{marginBottom:22}} className="fadeUp">
      <Label>Industry <span style={{textTransform:"none",fontWeight:400,color:"#bbb"}}>(optional — improves scoring accuracy)</span></Label>
      {/* trigger */}
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderRadius:12,border:`1.5px solid ${open||industry?TEAL:"#d1ede9"}`,background:industry?sel.bg:"#fafffe",cursor:"pointer",transition:"all .2s",boxShadow:industry?`0 2px 10px ${sel.border}88`:"none"}}>
        <span style={{fontSize:13,fontWeight:industry?700:400,color:industry?sel.color:"#aaa"}}>{industry?`${sel.icon} ${industry}`:"Select your industry..."}</span>
        <span style={{fontSize:12,color:TEAL,transition:"transform .25s",display:"inline-block",transform:open?"rotate(180deg)":"none"}}>▾</span>
      </div>
      {/* dropdown */}
      {open&&(
        <div className="slideDown" style={{marginTop:8,background:"#fff",border:"1.5px solid #d1ede9",borderRadius:14,padding:14,boxShadow:"0 8px 32px rgba(13,148,136,.12)",maxHeight:320,overflowY:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {Object.entries(THAILAND_INDUSTRIES).map(([name,{icon,color,bg,border}])=>(
              <div key={name} onClick={()=>{setIndustry(name);setSubIndustry("");setOpen(false);}} className="pill-hover" style={{padding:"9px 12px",borderRadius:10,cursor:"pointer",background:industry===name?bg:"#fafffe",border:`1.5px solid ${industry===name?color:"#e0e0e0"}`,display:"flex",alignItems:"center",gap:7,transition:"all .15s"}}>
                <span style={{fontSize:16}}>{icon}</span>
                <span style={{fontSize:12,fontWeight:600,color:industry===name?color:"#444",lineHeight:1.3}}>{name.replace(/^.\s/,"")}</span>
              </div>
            ))}
          </div>
          {industry&&<div onClick={()=>{setIndustry("");setSubIndustry("");setOpen(false);}} style={{textAlign:"center",marginTop:10,fontSize:12,color:"#ef4444",cursor:"pointer",fontWeight:600,padding:"6px 0"}}>✕ Clear selection</div>}
        </div>
      )}
      {/* sub-industry pills */}
      {industry&&sel&&(
        <div className="fadeUp" style={{marginTop:10}}>
          <div style={{fontSize:11,fontWeight:700,color:sel.color,marginBottom:7,textTransform:"uppercase",letterSpacing:.5}}>Sub-category</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {sel.subs.map(s=>(
              <div key={s} onClick={()=>setSubIndustry(subIndustry===s?"":s)} className="pill-hover" style={{cursor:"pointer",padding:"5px 12px",borderRadius:99,fontSize:12,fontWeight:600,userSelect:"none",background:subIndustry===s?sel.color:sel.bg,color:subIndustry===s?"#fff":sel.color,border:`1.5px solid ${subIndustry===s?sel.color:sel.border}`,transition:"all .18s"}}>{s}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformInputs({platform,setPlatform,ctype,setCtype,pillar,setPillar,industry,setIndustry,subIndustry,setSubIndustry}){
  const icons={Instagram:"📸",Facebook:"📘",TikTok:"🎵","X (Twitter)":"🐦",YouTube:"▶️"};
  return(<>
    <div style={{marginBottom:22}} className="fadeUp"><Label>Platform</Label><PillGroup options={PLATFORMS} value={platform} onChange={v=>{setPlatform(v);setCtype("");}} icons={icons}/></div>
    {platform&&<div style={{marginBottom:22}} className="fadeUp"><Label>Content Type</Label><PillGroup options={CONTENT_TYPES[platform]} value={ctype} onChange={setCtype}/></div>}
    <IndustrySelector industry={industry} setIndustry={setIndustry} subIndustry={subIndustry} setSubIndustry={setSubIndustry}/>
    <div style={{marginBottom:22}} className="fadeUp"><Label>Content Pillar</Label><PillGroup options={PILLARS} value={pillar} onChange={setPillar}/></div>
  </>);
}
async function callClaude(prompt,imgBase64=null){
  const content=imgBase64?[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:imgBase64}},{type:"text",text:prompt}]:prompt;
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content}]})});
  const data=await res.json();
  return JSON.parse(data.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim());
}

// ══ SETTINGS / DATA MANAGER ══════════════════════════════════════════════════
function SettingsPanel({files,onAddFiles,onToggleFile,onDeleteFile,onClearFiles,onClose}){
  const fileRef=useRef();
  const [dragging,setDragging]=useState(false);
  const [uploading,setUploading]=useState(false);

  const parseFile=f=>new Promise((res,rej)=>{
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const wb=XLSX.read(ev.target.result,{type:"binary"});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws);
        res({id:Date.now()+Math.random(),name:f.name,rows:rows.slice(0,100),rowCount:rows.length,uploadedAt:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),active:true});
      }catch{rej(new Error("Failed to parse "+f.name));}
    };
    reader.readAsBinaryString(f);
  });

  const handleFiles=async(fileList)=>{
    setUploading(true);
    const parsed=[];
    for(const f of Array.from(fileList)){
      try{const p=await parseFile(f);parsed.push(p);}catch{}
    }
    if(parsed.length)onAddFiles(parsed);
    setUploading(false);
  };

  const totalRows=files.filter(f=>f.active).reduce((a,f)=>a+f.rowCount,0);
  const activeCount=files.filter(f=>f.active).length;

  return(
    <div className="fadeIn" style={{position:"fixed",inset:0,zIndex:200,display:"flex"}}>
      {/* backdrop */}
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.35)",backdropFilter:"blur(4px)"}}/>
      {/* panel */}
      <div className="slideIn" style={{position:"relative",marginLeft:"auto",width:480,maxWidth:"100vw",height:"100%",background:"#fff",boxShadow:"-8px 0 40px rgba(0,0,0,.12)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* header */}
        <div style={{padding:"20px 24px",borderBottom:"1px solid #e8f5f3",background:`linear-gradient(135deg,${TEAL},${TEAL_MID})`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{fontWeight:900,fontSize:18,color:"#fff"}}>⚙️ Settings & Data</div>
            <button onClick={onClose} className="btn-hover" style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.8)"}}>Manage your historical data files</div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:24}}>
          {/* stats */}
          {files.length>0&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:24}}>
              {[{label:"Files",val:files.length},{label:"Active",val:activeCount},{label:"Total Rows",val:totalRows}].map(({label,val})=>(
                <div key={label} style={{background:TEAL_LIGHT,borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:900,color:TEAL}}>{val}</div>
                  <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginTop:2}}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* upload zone */}
          <div style={{marginBottom:24}}>
            <Label>Upload Data Files</Label>
            <div
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false);handleFiles(e.dataTransfer.files);}}
              onClick={()=>fileRef.current.click()}
              style={{border:`2.5px dashed ${dragging?TEAL:"#a7d9d4"}`,borderRadius:14,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:dragging?TEAL_LIGHT:"#fafffe",transition:"all .2s"}}
            >
              <div style={{fontSize:32,marginBottom:8}}>{uploading?"⏳":"📂"}</div>
              <div style={{fontWeight:700,fontSize:14,color:TEAL,marginBottom:4}}>{uploading?"Uploading...":"Drop files here or click to browse"}</div>
              <div style={{fontSize:12,color:"#94a3b8"}}>CSV or Excel (.csv, .xlsx, .xls) · Multiple files supported</div>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" multiple style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/>
          </div>

          {/* file list */}
          {files.length>0&&(
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <Label>Uploaded Files</Label>
                <button onClick={onClearFiles} className="btn-hover" style={{fontSize:11,color:"#ef4444",fontWeight:700,background:"#fee2e2",border:"none",cursor:"pointer",borderRadius:8,padding:"4px 10px"}}>Clear All</button>
              </div>
              {files.map((f,i)=>(
                <div key={f.id} className="fadeUp" style={{background:f.active?"#fff":"#f8f8f8",border:`1.5px solid ${f.active?TEAL:"#e0e0e0"}`,borderRadius:14,padding:"14px 16px",marginBottom:10,animationDelay:`${i*50}ms`,transition:"all .25s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:24,flexShrink:0}}>📊</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13,color:f.active?"#1a1a1a":"#aaa",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.name}</div>
                      <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{f.rowCount} rows · Added {f.uploadedAt}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:10,color:"#94a3b8",marginBottom:3}}>{f.active?"Active":"Off"}</div>
                        <Toggle value={f.active} onChange={v=>onToggleFile(f.id,v)}/>
                      </div>
                      <button onClick={()=>onDeleteFile(f.id)} className="btn-hover" style={{background:"#fee2e2",border:"none",color:"#ef4444",width:28,height:28,borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    </div>
                  </div>
                  {/* preview columns if available */}
                  {f.active&&f.rows.length>0&&(
                    <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #e8f5f3"}}>
                      <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginBottom:5}}>COLUMNS DETECTED</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {Object.keys(f.rows[0]).slice(0,8).map(col=>(
                          <span key={col} style={{background:TEAL_LIGHT,color:TEAL,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600}}>{col}</span>
                        ))}
                        {Object.keys(f.rows[0]).length>8&&<span style={{fontSize:10,color:"#94a3b8"}}>+{Object.keys(f.rows[0]).length-8} more</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {files.length===0&&(
            <div style={{textAlign:"center",padding:"32px 0",color:"#94a3b8"}}>
              <div style={{fontSize:40,marginBottom:12}}>🗄️</div>
              <div style={{fontWeight:700,fontSize:15,color:"#64748b",marginBottom:6}}>No data files yet</div>
              <div style={{fontSize:13,lineHeight:1.6}}>Upload CSV or Excel files with your historical content performance data. The AI will use them to give smarter, benchmarked scores.</div>
            </div>
          )}

          {/* tips */}
          <div style={{marginTop:24,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontWeight:700,fontSize:12,color:"#92400e",marginBottom:8}}>💡 Recommended columns for best results</div>
            {["platform — which platform the content was posted on","caption — the post caption text","pillar — content pillar (Education, Promo, etc.)","engagement_rate — e.g. 4.2 (as a percentage)","content_type — Reel, Post, Story, etc.","posted_date — when it was published"].map(tip=>(
              <div key={tip} style={{fontSize:11,color:"#78350f",marginBottom:4,display:"flex",gap:6}}>
                <span style={{color:"#f59e0b",fontWeight:700}}>·</span>{tip}
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{padding:"16px 24px",borderTop:"1px solid #e8f5f3",background:"#fafffe",flexShrink:0}}>
          <div style={{fontSize:12,color:"#94a3b8",textAlign:"center"}}>
            {files.filter(f=>f.active).length>0
              ?`✅ ${activeCount} file${activeCount>1?"s":""} active · ${totalRows} rows available to AI`
              :"No active files — AI will use general benchmarks"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══ EVAL LOG ════════════════════════════════════════════════════════════════
function EvalLog({log,onDelete,onClear}){
  const [filter,setFilter]=useState("All");
  const [platformFilter,setPlatformFilter]=useState("All");
  const [expanded,setExpanded]=useState(null);
  const icons={Instagram:"📸",Facebook:"📘",TikTok:"🎵","X (Twitter)":"🐦",YouTube:"▶️"};
  const filtered=log.filter(e=>(filter==="All"||e.verdict===filter)&&(platformFilter==="All"||e.platform===platformFilter));
  const avg=log.length?Math.round((log.reduce((a,e)=>a+e.overall,0)/log.length)*10)/10:null;
  const bestPillar=log.length?(()=>{const m={};log.forEach(e=>{if(!m[e.pillar])m[e.pillar]={sum:0,n:0};m[e.pillar].sum+=e.overall;m[e.pillar].n++;});return Object.entries(m).sort((a,b)=>b[1].sum/b[1].n-a[1].sum/a[1].n)[0]?.[0];})():null;
  const topPlatform=log.length?(()=>{const m={};log.forEach(e=>{m[e.platform]=(m[e.platform]||0)+1;});return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0];})():null;
  const trend=log.length>=2?log[0].overall-log[log.length-1].overall:null;
  return(
    <div>
      {log.length>0&&(
        <Card animate="fadeUp" style={{marginBottom:16,background:`linear-gradient(135deg,${TEAL},${TEAL_MID})`,border:"none"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,textAlign:"center"}}>
            {[{label:"Evaluations",val:log.length},{label:"Avg Score",val:avg?`${avg}/10`:"—",color:avg>=7?"#a7f3d0":avg>=5?"#fde68a":"#fca5a5"},{label:"Top Platform",val:topPlatform?`${icons[topPlatform]} ${topPlatform}`:"—"},{label:"Best Pillar",val:bestPillar||"—",small:true}].map(({label,val,color,small})=>(
              <div key={label}><div style={{fontSize:small?12:18,fontWeight:900,color:color||"#fff",lineHeight:1.2}}>{val}</div><div style={{fontSize:10,color:"rgba(255,255,255,.7)",marginTop:3,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{label}</div></div>
            ))}
          </div>
          {trend!==null&&<div style={{textAlign:"center",marginTop:10,fontSize:12,color:"rgba(255,255,255,.8)",fontWeight:600}}>{trend>0?`📈 Improved by +${trend} since first eval`:trend<0?`📉 Dropped by ${Math.abs(trend)} since first eval`:"➡️ Score holding steady"}</div>}
        </Card>
      )}
      {log.length>0&&(
        <div className="fadeUp" style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center",animationDelay:"60ms"}}>
          <span style={{fontSize:11,fontWeight:700,color:"#888"}}>Verdict:</span>
          {["All","Great","Good","Needs Work","Poor"].map(v=>(
            <div key={v} className="pill-hover" onClick={()=>setFilter(v)} style={{cursor:"pointer",padding:"4px 11px",borderRadius:99,fontSize:11,fontWeight:600,userSelect:"none",background:filter===v?TEAL:TEAL_LIGHT,color:filter===v?"#fff":TEAL,border:`1.5px solid ${filter===v?TEAL:"#a7d9d4"}`}}>{v}</div>
          ))}
          <span style={{fontSize:11,fontWeight:700,color:"#888",marginLeft:6}}>Platform:</span>
          {["All",...PLATFORMS].map(p=>(
            <div key={p} className="pill-hover" onClick={()=>setPlatformFilter(p)} style={{cursor:"pointer",padding:"4px 11px",borderRadius:99,fontSize:11,fontWeight:600,userSelect:"none",background:platformFilter===p?TEAL:TEAL_LIGHT,color:platformFilter===p?"#fff":TEAL,border:`1.5px solid ${platformFilter===p?TEAL:"#a7d9d4"}`}}>{p==="All"?p:`${icons[p]||""} ${p}`}</div>
          ))}
          <Btn small danger onClick={onClear} style={{marginLeft:"auto"}}>🗑 Clear All</Btn>
        </div>
      )}
      {log.length===0&&(<Card animate="fadeUp" style={{textAlign:"center",padding:"60px 24px"}}><div style={{fontSize:48,marginBottom:16}}>📋</div><div style={{fontWeight:800,fontSize:18,color:"#1a1a1a",marginBottom:8}}>No evaluations yet</div><div style={{fontSize:14,color:"#94a3b8",lineHeight:1.6}}>Every time you evaluate a content idea, it's automatically saved here.</div></Card>)}
      {filtered.length===0&&log.length>0&&(<Card animate="fadeUp" style={{textAlign:"center",padding:"40px 24px"}}><div style={{fontSize:14,color:"#94a3b8"}}>No entries match your filters.</div></Card>)}
      {filtered.map((entry,i)=>{
        const vs=verdictStyle(entry.verdict);const isOpen=expanded===entry.id;
        return(
          <div key={entry.id} className="fadeUp" style={{animationDelay:`${i*60}ms`,marginBottom:12}}>
            <div style={{background:"#fff",borderRadius:16,border:`1.5px solid ${isOpen?TEAL:"#d1ede9"}`,overflow:"hidden",boxShadow:isOpen?"0 8px 24px rgba(13,148,136,.1)":"none",transition:"box-shadow .25s,border-color .25s"}}>
              <div onClick={()=>setExpanded(isOpen?null:entry.id)} style={{padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:46,height:46,borderRadius:12,background:entry.overall>=7?"#dcfce7":entry.overall>=5?"#fef9c3":"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:18,fontWeight:900,color:entry.overall>=7?"#16a34a":entry.overall>=5?"#ca8a04":"#dc2626"}}>{entry.overall}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontSize:12,fontWeight:700,color:"#1a1a1a"}}>{icons[entry.platform]||""} {entry.platform}</span>
                    <span style={{fontSize:11,color:"#ccc"}}>·</span>
                    <span style={{fontSize:11,color:"#888"}}>{entry.ctype}</span>
                    <span style={{fontSize:11,color:"#ccc"}}>·</span>
                    <span style={{fontSize:11,color:"#888"}}>{entry.pillar}</span>
                    <span style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,background:vs.bg,color:vs.color}}>{vs.emoji} {entry.verdict}</span>
                  </div>
                  <div style={{fontSize:12,color:"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{entry.caption}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                  <div style={{display:"flex",gap:8}}>
                    {[{l:"V",v:entry.scores.voice,c:TEAL},{l:"C",v:entry.scores.clarity,c:TEAL_MID},{l:"E",v:entry.scores.engagement,c:"#f59e0b"}].map(({l,v,c})=>(
                      <div key={l} style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:9,color:"#aaa",fontWeight:600}}>{l}</div></div>
                    ))}
                  </div>
                  <div style={{fontSize:10,color:"#aaa",whiteSpace:"nowrap"}}>{entry.date}</div>
                  <div style={{color:TEAL,fontSize:13,transition:"transform .25s",transform:isOpen?"rotate(180deg)":"none"}}>▾</div>
                </div>
              </div>
              {isOpen&&(
                <div className="fadeIn" style={{borderTop:"1px solid #e8f5f3",padding:"16px 18px",background:"#fafffe"}}>
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Score Breakdown</div>
                    {[{l:"🎙 Voice",k:"voice",c:TEAL},{l:"📖 Clarity",k:"clarity",c:TEAL_MID},{l:"🔥 Engagement",k:"engagement",c:"#f59e0b"},...(entry.scores.hook?[{l:"🎣 Hook",k:"hook",c:"#8b5cf6"}]:[])].map(({l,k,c},j)=>(
                      <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <div style={{fontSize:12,width:140,color:"#555",flexShrink:0}}>{l}</div>
                        <Bar pct={(entry.scores[k]/10)*100} color={c} delay={j*60}/>
                        <div style={{fontSize:12,fontWeight:700,color:c,width:32,textAlign:"right"}}>{entry.scores[k]}/10</div>
                      </div>
                    ))}
                  </div>
                  {entry.best_time&&<div style={{marginBottom:12,display:"inline-flex",alignItems:"center",gap:8,background:TEAL_LIGHT,borderRadius:99,padding:"6px 14px"}}><span>⏰</span><span style={{fontSize:12,fontWeight:700,color:TEAL}}>Best time: {entry.best_time}</span></div>}
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>💡 AI Suggestions</div>
                    {entry.suggestions.map((s,j)=>(
                      <div key={j} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
                        <div style={{width:20,height:20,borderRadius:"50%",background:TEAL_LIGHT,color:TEAL,fontWeight:800,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{j+1}</div>
                        <div style={{fontSize:12,color:"#444",lineHeight:1.6}}>{s}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>✨ Improved Caption</div>
                    <div style={{background:TEAL_LIGHT,borderRadius:10,padding:"11px 13px",fontSize:12,color:"#333",lineHeight:1.65,whiteSpace:"pre-wrap"}}>{entry.improved_caption}</div>
                  </div>
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>📝 Original Caption</div>
                    <div style={{background:"#f8f8f8",borderRadius:10,padding:"11px 13px",fontSize:12,color:"#666",lineHeight:1.65,whiteSpace:"pre-wrap"}}>{entry.caption}</div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <Btn small outline onClick={()=>navigator.clipboard.writeText(entry.improved_caption)}>📋 Copy Improved</Btn>
                    <Btn small danger onClick={()=>{onDelete(entry.id);setExpanded(null);}}>🗑 Delete</Btn>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══ EVALUATE ════════════════════════════════════════════════════════════════
function EvaluateMode({activeData,onHome,onLogEntry}){
  const [step,setStep]=useState(0);
  const [platform,setPlatform]=useState("");
  const [ctype,setCtype]=useState("");
  const [pillar,setPillar]=useState("");
  const [industry,setIndustry]=useState("");
  const [subIndustry,setSubIndustry]=useState("");
  const [caption,setCaption]=useState("");
  const [visual,setVisual]=useState("");
  const [hook,setHook]=useState("");
  const [thumbImg,setThumbImg]=useState(null);
  const [thumbName,setThumbName]=useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const thumbRef=useRef();
  const isVideo=VIDEO_TYPES.includes(ctype);
  const icons={Instagram:"📸",Facebook:"📘",TikTok:"🎵","X (Twitter)":"🐦",YouTube:"▶️"};
  const handleThumb=e=>{const f=e.target.files[0];if(!f)return;setThumbName(f.name);const r=new FileReader();r.onload=ev=>setThumbImg(ev.target.result);r.readAsDataURL(f);};
  const analyze=async()=>{
    if(!platform||!ctype||!pillar||!caption.trim()){setError("Please fill in all required fields.");return;}
    setLoading(true);setError("");
    const hist=activeData.length>0?`Historical data (${activeData.length} rows):\n${JSON.stringify(activeData.slice(0,20),null,2)}`:"No historical data — use general benchmarks.";
    const industryCtx=industry?`Industry: ${industry}${subIndustry?` > ${subIndustry}`:""}`:"";
    const prompt=`You are PredictaPost. Analyze this content and respond ONLY valid JSON no markdown:
Platform:${platform}|Type:${ctype}|Pillar:${pillar}${industryCtx?`|${industryCtx}`:""}
Caption:${caption}|Visual:${visual||"N/A"}${isVideo?`|Hook:${hook||"N/A"}|Thumb:${thumbImg?"yes":"no"}`:""}
${hist}
{"scores":{"voice":<1-10>,"clarity":<1-10>,"engagement":<1-10>${isVideo?`,"hook":<1-10>`:""}},
"overall":<1-10>,"verdict":"Great"|"Good"|"Needs Work"|"Poor",
"suggestions":["s1","s2","s3"],"improved_caption":"...",
"hashtags":{"broad":["#t"],"niche":["#t"],"branded":["#t"]},
"best_time":"e.g. Tue–Thu · 7–9 PM",
${isVideo?`"script_outline":{"hook":"...","body":"...","cta":"..."},`:""}
"summary":{"pillar_fit":"...","engagement_vs_history":"...","best_format":"...","tone_consistency":"...","final_recommendation":"..."}}`;
    try{
      const r=await callClaude(prompt,thumbImg?thumbImg.split(",")[1]:null);
      setResult(r);
      onLogEntry({id:Date.now(),platform,ctype,pillar,industry:industry?(industry+(subIndustry?` › ${subIndustry}`:"")):null,caption,overall:r.overall,verdict:r.verdict,scores:r.scores,suggestions:r.suggestions,improved_caption:r.improved_caption,best_time:r.best_time||null,date:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})});
      setStep(1);
    }catch{setError("Something went wrong. Try again.");}
    setLoading(false);
  };
  const gotoStep=s=>{window.scrollTo({top:0,behavior:"smooth"});setTimeout(()=>setStep(s),100);};
  const slideText=result?`PredictaPost Evaluate\n${icons[platform]||""} ${platform} · ${ctype} · ${pillar}\nOverall:${result.overall}/10 (${result.verdict})\nBest Time:${result.best_time||"N/A"}\nVoice:${result.scores.voice} Clarity:${result.scores.clarity} Engage:${result.scores.engagement}\nPillar:${result.summary.pillar_fit}\nEngagement:${result.summary.engagement_vs_history}\nFormat:${result.summary.best_format}\nTone:${result.summary.tone_consistency}\nRec:${result.summary.final_recommendation}\nCaption:${result.improved_caption}\nHashtags:${result.hashtags?[...result.hashtags.broad,...result.hashtags.niche,...result.hashtags.branded].join(" "):""}`:"";
  return(
    <div>
      <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,marginBottom:22}}>
        <button className="btn-hover" onClick={onHome} style={{background:TEAL_LIGHT,border:"none",cursor:"pointer",color:TEAL,fontSize:14,fontWeight:700,borderRadius:99,padding:"7px 14px"}}>← Home</button>
        <div style={{fontWeight:800,fontSize:18,color:TEAL}}>🔍 Evaluate</div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,fontSize:11,color:activeData.length>0?"#16a34a":"#94a3b8",fontWeight:600,background:activeData.length>0?"#dcfce7":"#f1f5f9",borderRadius:99,padding:"4px 11px"}}>
          {activeData.length>0?`✅ ${activeData.length} rows loaded`:"⚪ No data — using benchmarks"}
        </div>
      </div>
      <div className="fadeUp" style={{animationDelay:"60ms"}}><Steps current={step} labels={["Content Idea","Score & Suggestions","Summary"]}/></div>
      {step===0&&(
        <Card animate="fadeUp" delay={80}>
          <div style={{fontWeight:800,fontSize:16,color:TEAL,marginBottom:20}}>Tell us about your content idea</div>
          <PlatformInputs platform={platform} setPlatform={setPlatform} ctype={ctype} setCtype={setCtype} pillar={pillar} setPillar={setPillar} industry={industry} setIndustry={setIndustry} subIndustry={subIndustry} setSubIndustry={setSubIndustry}/>
          <div className="fadeUp" style={{marginBottom:20,animationDelay:"120ms"}}>
            <Label>Caption</Label>
            <textarea className="input-focus" value={caption} onChange={e=>setCaption(e.target.value)} rows={4} placeholder="Write your caption..." style={{width:"100%",padding:"12px 14px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:14,fontFamily:"inherit",resize:"vertical",color:"#333",lineHeight:1.6,background:"#fafffe"}}/>
          </div>
          <div className="fadeUp" style={{marginBottom:isVideo?20:26,animationDelay:"150ms"}}>
            <Label>Visual Idea <span style={{textTransform:"none",fontWeight:400,color:"#bbb"}}>(optional)</span></Label>
            <input className="input-focus" value={visual} onChange={e=>setVisual(e.target.value)} placeholder="e.g. Flat lay with earthy tones..." style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:14,fontFamily:"inherit",color:"#333",background:"#fafffe"}}/>
          </div>
          {isVideo&&(
            <div className="fadeUp" style={{background:"#f8fffe",border:"1.5px solid #a7d9d4",borderRadius:14,padding:18,marginBottom:22,animationDelay:"180ms"}}>
              <div style={{fontWeight:700,fontSize:13,color:TEAL,marginBottom:14}}>🎬 Video Details</div>
              <div style={{marginBottom:14}}>
                <Label>Hook — First 3 Seconds</Label>
                <input className="input-focus" value={hook} onChange={e=>setHook(e.target.value)} placeholder="e.g. 'POV: you finally stop guessing…'" style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:14,fontFamily:"inherit",color:"#333",background:"#fff"}}/>
              </div>
              <div>
                <Label>Thumbnail / Storyboard</Label>
                <input ref={thumbRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleThumb}/>
                {thumbImg?<div className="fadeIn" style={{display:"flex",alignItems:"center",gap:12,marginTop:6}}><img src={thumbImg} alt="t" style={{width:80,height:56,objectFit:"cover",borderRadius:8,border:"1.5px solid #d1ede9"}}/><div><div style={{fontSize:13,color:"#555",fontWeight:600}}>{thumbName}</div><span onClick={()=>{setThumbImg(null);setThumbName("");}} style={{fontSize:12,color:"#ef4444",cursor:"pointer",fontWeight:600}}>✕ Remove</span></div></div>
                :<div onClick={()=>thumbRef.current.click()} style={{marginTop:6,border:"2px dashed #a7d9d4",borderRadius:12,padding:"20px 0",textAlign:"center",cursor:"pointer",color:TEAL,fontSize:13,fontWeight:600,background:"#fff",transition:"background .2s"}} onMouseEnter={e=>e.currentTarget.style.background=TEAL_LIGHT} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>📁 Click to upload</div>}
              </div>
            </div>
          )}
          {error&&<div className="fadeIn" style={{background:"#fff0f0",color:"#e53e3e",borderRadius:10,padding:"10px 14px",fontSize:13,marginBottom:14,border:"1px solid #fecaca"}}>{error}</div>}
          <Btn full disabled={loading} onClick={analyze}>{loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span className="spin" style={{display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%"}}/> Analyzing...</span>:"⚡ Analyze & Score →"}</Btn>
        </Card>
      )}
      {step===1&&result&&(
        <div>
          <Card animate="fadeUp" delay={0} style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <div><div style={{fontWeight:800,fontSize:16,color:TEAL}}>Score & Suggestions</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{icons[platform]} {platform} · {ctype}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:12}}><ScoreRing score={result.overall} delay={200}/><span className="pop" style={{padding:"6px 14px",borderRadius:99,fontSize:13,fontWeight:800,background:verdictStyle(result.verdict).bg,color:verdictStyle(result.verdict).color,animationDelay:"300ms"}}>{verdictStyle(result.verdict).emoji} {result.verdict}</span></div>
            </div>
            {[{l:"🎙 Voice",k:"voice",c:TEAL},{l:"📖 Clarity",k:"clarity",c:TEAL_MID},{l:"🔥 Engagement",k:"engagement",c:"#f59e0b"},...(isVideo&&result.scores.hook?[{l:"🎣 Hook",k:"hook",c:"#8b5cf6"}]:[])].map(({l,k,c},i)=>(
              <div key={k} className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,animationDelay:`${i*60}ms`}}>
                <div style={{fontSize:13,width:130,color:"#555",flexShrink:0}}>{l}</div>
                <Bar pct={(result.scores[k]/10)*100} color={c} delay={i*80}/>
                <div style={{fontSize:13,fontWeight:700,color:c,width:36,textAlign:"right"}}>{result.scores[k]}/10</div>
              </div>
            ))}
            {result.best_time&&<div className="pop" style={{marginTop:14,display:"inline-flex",alignItems:"center",gap:8,background:TEAL_LIGHT,borderRadius:99,padding:"7px 16px",animationDelay:"400ms"}}><span>⏰</span><span style={{fontSize:13,fontWeight:700,color:TEAL}}>Best time: {result.best_time}</span></div>}
          </Card>
          {isVideo&&result.script_outline&&(
            <Card animate="fadeUp" delay={100} style={{marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:14,color:TEAL,marginBottom:12}}>📋 Script Outline</div>
              {[{s:"Hook",icon:"🎣",v:result.script_outline.hook,bg:"#ede9fe",tc:"#7c3aed"},{s:"Body",icon:"📝",v:result.script_outline.body,bg:TEAL_LIGHT,tc:TEAL},{s:"CTA",icon:"🚀",v:result.script_outline.cta,bg:"#dcfce7",tc:"#16a34a"}].map(({s,icon,v,bg,tc},i)=>(
                <div key={s} className="slideIn" style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start",animationDelay:`${i*70}ms`}}>
                  <div style={{background:bg,color:tc,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,flexShrink:0}}>{icon} {s}</div>
                  <div style={{fontSize:13,color:"#444",lineHeight:1.6,paddingTop:3}}>{v}</div>
                </div>
              ))}
            </Card>
          )}
          <Card animate="fadeUp" delay={150} style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:TEAL,marginBottom:12}}>💡 Suggestions</div>
            {result.suggestions.map((s,i)=>(
              <div key={i} className="slideIn" style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start",animationDelay:`${i*70}ms`}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:TEAL_LIGHT,color:TEAL,fontWeight:800,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                <div style={{fontSize:13,color:"#444",lineHeight:1.6}}>{s}</div>
              </div>
            ))}
          </Card>
          <Card animate="fadeUp" delay={200} style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:TEAL,marginBottom:10}}>✨ Improved Caption</div>
            <div style={{background:"#f8fffe",border:"1px solid #a7d9d4",borderRadius:10,padding:"13px 15px",fontSize:13,color:"#333",lineHeight:1.7,whiteSpace:"pre-wrap",marginBottom:12}}>{result.improved_caption}</div>
            <Btn small outline onClick={()=>navigator.clipboard.writeText(result.improved_caption)}>📋 Copy Caption</Btn>
          </Card>
          {result.hashtags&&(
            <Card animate="fadeUp" delay={250} style={{marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:14,color:TEAL,marginBottom:12}}># Hashtag Recommender</div>
              {[{label:"🔵 Broad",key:"broad",bg:"#dbeafe",tc:"#1d4ed8"},{label:"🟢 Niche",key:"niche",bg:"#dcfce7",tc:"#16a34a"},{label:"🟡 Branded",key:"branded",bg:"#fef9c3",tc:"#ca8a04"}].map(({label,key,bg,tc},i)=>(
                <div key={key} className="fadeUp" style={{marginBottom:10,animationDelay:`${i*60}ms`}}>
                  <div style={{fontSize:11,fontWeight:700,color:tc,marginBottom:5}}>{label}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{(result.hashtags[key]||[]).map(h=><span key={h} className="pill-hover" style={{background:bg,color:tc,borderRadius:99,padding:"3px 11px",fontSize:12,fontWeight:600,cursor:"default"}}>{h}</span>)}</div>
                </div>
              ))}
              <div style={{marginTop:12}}><Btn small outline onClick={()=>navigator.clipboard.writeText([...result.hashtags.broad,...result.hashtags.niche,...result.hashtags.branded].join(" "))}>📋 Copy All Hashtags</Btn></div>
            </Card>
          )}
          <div className="fadeUp" style={{animationDelay:"300ms"}}><Btn full onClick={()=>gotoStep(2)}>View Summary →</Btn></div>
        </div>
      )}
      {step===2&&result&&(()=>{
        const metrics=[{icon:"🎯",title:"Pillar Fit",key:"pillar_fit",scoreKey:"voice",color:"#ede9fe",border:"#c4b5fd",tc:"#7c3aed"},{icon:"📈",title:"Engagement",key:"engagement_vs_history",scoreKey:"engagement",color:"#dcfce7",border:"#86efac",tc:"#16a34a"},{icon:"📐",title:"Best Format",key:"best_format",scoreKey:null,color:"#dbeafe",border:"#93c5fd",tc:"#1d4ed8"},{icon:"🗣",title:"Tone & Voice",key:"tone_consistency",scoreKey:"clarity",color:TEAL_LIGHT,border:"#a7d9d4",tc:TEAL},...(isVideo&&result.scores.hook?[{icon:"🎣",title:"Hook",key:null,scoreKey:"hook",color:"#f3e8ff",border:"#d8b4fe",tc:"#7c3aed"}]:[])];
        return(
          <div>
            <Card animate="fadeUp" style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div><div style={{fontWeight:800,fontSize:16,color:TEAL}}>Summary</div><div style={{fontSize:11,color:"#888"}}>{icons[platform]} {platform} · {ctype} · {pillar}</div></div>
                <div style={{textAlign:"center"}}><div style={{fontSize:26,fontWeight:900,color:result.overall>=7?TEAL:result.overall>=5?"#f59e0b":"#ef4444"}}>{result.overall}<span style={{fontSize:12,color:"#aaa"}}>/10</span></div><span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:800,background:verdictStyle(result.verdict).bg,color:verdictStyle(result.verdict).color}}>{verdictStyle(result.verdict).emoji} {result.verdict}</span></div>
              </div>
              {result.best_time&&<div className="pop" style={{marginBottom:14,display:"inline-flex",alignItems:"center",gap:8,background:TEAL_LIGHT,borderRadius:99,padding:"7px 16px",animationDelay:"200ms"}}><span>⏰</span><span style={{fontSize:13,fontWeight:700,color:TEAL}}>Best time: {result.best_time}</span></div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                {metrics.map(({icon,title,key,scoreKey,color,border,tc},i)=>(
                  <div key={title} className="fadeUp card-hover" style={{background:color,border:`1px solid ${border}`,borderRadius:12,padding:"11px 13px",animationDelay:`${i*60}ms`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontWeight:700,fontSize:12,color:tc}}>{icon} {title}</div>{scoreKey&&<div style={{fontWeight:800,fontSize:12,color:tc}}>{result.scores[scoreKey]}/10</div>}</div>
                    {key&&<div style={{fontSize:11,color:"#555",lineHeight:1.5}}>{result.summary[key]}</div>}
                    {!key&&scoreKey==="hook"&&result.script_outline&&<div style={{fontSize:11,color:"#555",lineHeight:1.5}}>{result.script_outline.hook}</div>}
                  </div>
                ))}
              </div>
              <div className="fadeUp" style={{background:`linear-gradient(135deg,${TEAL},${TEAL_MID})`,borderRadius:12,padding:"12px 15px",marginBottom:12,animationDelay:"360ms"}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,.7)",fontWeight:600,marginBottom:3}}>🏁 RECOMMENDATION</div>
                <div style={{fontSize:13,color:"#fff",fontWeight:600,lineHeight:1.5}}>{result.summary.final_recommendation}</div>
              </div>
              <div className="fadeUp" style={{background:TEAL_LIGHT,borderRadius:12,padding:"12px 15px",animationDelay:"400ms"}}>
                <div style={{fontSize:11,color:TEAL,fontWeight:700,marginBottom:4}}>✨ IMPROVED CAPTION</div>
                <div style={{fontSize:13,color:"#333",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{result.improved_caption}</div>
              </div>
            </Card>
            <div className="fadeUp" style={{display:"flex",gap:8,animationDelay:"450ms"}}>
              <Btn small outline onClick={()=>gotoStep(1)} style={{flex:1}}>← Back</Btn>
              <Btn small outline onClick={()=>navigator.clipboard.writeText(slideText)} style={{flex:1}}>📋 Copy for PPT</Btn>
              <Btn small onClick={onHome} style={{flex:1}}>🏠 Home</Btn>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ══ BRAINSTORM ════════════════════════════════════════════════════════════════
function BrainstormMode({onHome}){
  const [platform,setPlatform]=useState("");const [ctype,setCtype]=useState("");const [pillar,setPillar]=useState("");const [topic,setTopic]=useState("");const [ideas,setIdeas]=useState(null);const [loading,setLoading]=useState(false);const [error,setError]=useState("");
  const generate=async()=>{if(!platform||!pillar||!topic.trim()){setError("Fill in platform, pillar and topic.");return;}setLoading(true);setError("");setIdeas(null);const prompt=`You are PredictaPost. Generate 3 creative content ideas. Respond ONLY valid JSON array no markdown:\nPlatform:${platform}|Type:${ctype||"Any"}|Pillar:${pillar}|Topic:${topic}\n[{"title":"catchy title","caption":"full caption","content_type":"type","hook":"opening line if video","scores":{"voice":<1-10>,"clarity":<1-10>,"engagement":<1-10>},"overall":<1-10>,"verdict":"Great"|"Good"|"Needs Work","why":"1 sentence"}]`;try{const r=await callClaude(prompt);setIdeas(r);}catch{setError("Something went wrong.");}setLoading(false);};
  return(
    <div>
      <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,marginBottom:22}}><button className="btn-hover" onClick={onHome} style={{background:TEAL_LIGHT,border:"none",cursor:"pointer",color:TEAL,fontSize:14,fontWeight:700,borderRadius:99,padding:"7px 14px"}}>← Home</button><div style={{fontWeight:800,fontSize:18,color:TEAL}}>💡 Brainstorm</div></div>
      {!ideas?(<Card animate="fadeUp" delay={60}><div style={{fontWeight:700,fontSize:15,color:TEAL,marginBottom:20}}>What do you want to post about?</div><PlatformInputs platform={platform} setPlatform={setPlatform} ctype={ctype} setCtype={setCtype} pillar={pillar} setPillar={setPillar}/><div className="fadeUp" style={{marginBottom:24,animationDelay:"160ms"}}><Label>Topic or Theme</Label><input className="input-focus" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Summer launch, tips for beginners..." style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1.5px solid #d1ede9",fontSize:14,fontFamily:"inherit",color:"#333",background:"#fafffe"}}/></div>{error&&<div className="fadeIn" style={{background:"#fff0f0",color:"#e53e3e",borderRadius:10,padding:"10px 14px",fontSize:13,marginBottom:14}}>{error}</div>}<Btn full disabled={loading} onClick={generate}>{loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span className="spin" style={{display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%"}}/> Generating...</span>:"💡 Generate 3 Ideas"}</Btn></Card>)
      :(<div><div className="fadeUp" style={{fontWeight:700,fontSize:15,color:TEAL,marginBottom:16}}>Ideas for <span style={{color:"#333"}}>"{topic}"</span></div>{ideas.map((idea,i)=>{const vc=verdictStyle(idea.verdict);return(<Card key={i} animate="fadeUp" delay={i*100} style={{marginBottom:16,border:`1.5px solid ${idea.overall>=7?"#a7d9d4":"#e0e0e0"}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}><div><div style={{fontWeight:800,fontSize:15,color:"#1a1a1a",marginBottom:6}}>Idea {i+1} — {idea.title}</div><span style={{fontSize:11,background:TEAL_LIGHT,color:TEAL,borderRadius:99,padding:"3px 10px",fontWeight:600,marginRight:6}}>{idea.content_type}</span><span style={{fontSize:11,background:vc.bg,color:vc.color,borderRadius:99,padding:"3px 10px",fontWeight:700}}>{vc.emoji} {idea.verdict}</span></div><ScoreRing score={idea.overall} size={64} delay={i*120}/></div><div style={{background:"#f8fffe",border:"1px solid #d1ede9",borderRadius:10,padding:"11px 13px",fontSize:13,color:"#333",lineHeight:1.65,marginBottom:10,whiteSpace:"pre-wrap"}}>{idea.caption}</div>{idea.hook&&<div style={{fontSize:12,color:"#7c3aed",marginBottom:10,background:"#f3e8ff",borderRadius:8,padding:"6px 10px"}}><span style={{fontWeight:700}}>🎣 Hook: </span>{idea.hook}</div>}<div style={{fontSize:12,color:"#666",marginBottom:12,fontStyle:"italic",paddingLeft:4}}>💬 {idea.why}</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[{l:"🎙 Voice",k:"voice",c:TEAL,bg:TEAL_LIGHT},{l:"📖 Clarity",k:"clarity",c:TEAL_MID,bg:"#ccfbf1"},{l:"🔥 Engage",k:"engagement",c:"#d97706",bg:"#fef9c3"}].map(({l,k,c,bg})=>(<div key={k} style={{background:bg,borderRadius:8,padding:"5px 11px",fontSize:11,fontWeight:700,color:c}}>{l}: {idea.scores[k]}/10</div>))}</div></Card>);})}<div className="fadeUp" style={{animationDelay:"400ms"}}><Btn outline full onClick={()=>{setIdeas(null);setTopic("");}}>🔄 Generate New Ideas</Btn></div></div>)}
    </div>
  );
}

// ══ COMPARE ══════════════════════════════════════════════════════════════════
function CompareMode({onHome}){
  const [platform,setPlatform]=useState("");const [ctype,setCtype]=useState("");const [pillar,setPillar]=useState("");const [capA,setCapA]=useState("");const [capB,setCapB]=useState("");const [result,setResult]=useState(null);const [loading,setLoading]=useState(false);const [error,setError]=useState("");
  const compare=async()=>{if(!platform||!pillar||!capA.trim()||!capB.trim()){setError("Fill in all fields and both captions.");return;}setLoading(true);setError("");setResult(null);const prompt=`You are PredictaPost. Compare two captions. Respond ONLY valid JSON no markdown:\nPlatform:${platform}|Type:${ctype||"Any"}|Pillar:${pillar}\nA:${capA}|B:${capB}\n{"a":{"scores":{"voice":<1-10>,"clarity":<1-10>,"engagement":<1-10>},"overall":<1-10>,"verdict":"...","strengths":"...","weaknesses":"..."},"b":{"scores":{"voice":<1-10>,"clarity":<1-10>,"engagement":<1-10>},"overall":<1-10>,"verdict":"...","strengths":"...","weaknesses":"..."},"winner":"A"|"B"|"Tie","reason":"1-2 sentences","improved_winner":"improved caption"}`;try{const r=await callClaude(prompt);setResult(r);}catch{setError("Something went wrong.");}setLoading(false);};
  return(
    <div>
      <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,marginBottom:22}}><button className="btn-hover" onClick={onHome} style={{background:TEAL_LIGHT,border:"none",cursor:"pointer",color:TEAL,fontSize:14,fontWeight:700,borderRadius:99,padding:"7px 14px"}}>← Home</button><div style={{fontWeight:800,fontSize:18,color:TEAL}}>⚔️ Compare</div></div>
      {!result?(<Card animate="fadeUp" delay={60}><div style={{fontWeight:700,fontSize:15,color:TEAL,marginBottom:20}}>Pit two captions against each other</div><PlatformInputs platform={platform} setPlatform={setPlatform} ctype={ctype} setCtype={setCtype} pillar={pillar} setPillar={setPillar}/><div className="fadeUp" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24,animationDelay:"160ms"}}>{[{label:"Caption A",val:capA,set:setCapA,color:"#1d4ed8",bg:"#dbeafe",border:"#93c5fd"},{label:"Caption B",val:capB,set:setCapB,color:"#dc2626",bg:"#fee2e2",border:"#fca5a5"}].map(({label,val,set,color,bg,border})=>(<div key={label}><div style={{fontWeight:700,fontSize:13,color,marginBottom:8,background:bg,display:"inline-block",borderRadius:99,padding:"4px 14px"}}>{label}</div><textarea className="input-focus" value={val} onChange={e=>set(e.target.value)} rows={5} placeholder={`Write ${label}...`} style={{width:"100%",padding:"11px 13px",borderRadius:12,border:`1.5px solid ${border}`,fontSize:13,fontFamily:"inherit",resize:"vertical",color:"#333",lineHeight:1.6,background:"#fafffe"}}/></div>))}</div>{error&&<div className="fadeIn" style={{background:"#fff0f0",color:"#e53e3e",borderRadius:10,padding:"10px 14px",fontSize:13,marginBottom:14}}>{error}</div>}<Btn full disabled={loading} onClick={compare}>{loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span className="spin" style={{display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%"}}/> Comparing...</span>:"⚔️ Compare Captions"}</Btn></Card>)
      :(<div><Card animate="pop" style={{marginBottom:14,background:result.winner==="Tie"?"#f8f8f8":`linear-gradient(135deg,${TEAL},${TEAL_MID})`,border:"none",textAlign:"center"}}><div style={{fontSize:12,color:result.winner==="Tie"?"#888":"rgba(255,255,255,.75)",fontWeight:700,letterSpacing:1,marginBottom:4}}>🏆 WINNER</div><div style={{fontSize:30,fontWeight:900,color:result.winner==="Tie"?"#555":"#fff",marginBottom:8}}>{result.winner==="Tie"?"It's a Tie! 🤝":`Caption ${result.winner} wins!`}</div><div style={{fontSize:13,color:result.winner==="Tie"?"#666":"rgba(255,255,255,.85)",lineHeight:1.5}}>{result.reason}</div></Card><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>{[{label:"A",key:"a",cap:capA,color:"#1d4ed8",bg:"#dbeafe",border:"#93c5fd"},{label:"B",key:"b",cap:capB,color:"#dc2626",bg:"#fee2e2",border:"#fca5a5"}].map(({label,key,cap,color,bg,border},i)=>{const d=result[key],isW=result.winner===label&&result.winner!=="Tie";return(<Card key={key} animate="fadeUp" delay={i*100} style={{border:`2px solid ${isW?color:border}`,position:"relative",padding:16}}>{isW&&<div className="pop" style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:color,color:"#fff",borderRadius:99,padding:"2px 14px",fontSize:11,fontWeight:800,whiteSpace:"nowrap"}}>⭐ WINNER</div>}<div style={{fontWeight:800,fontSize:13,color,marginBottom:8,background:bg,display:"inline-block",borderRadius:99,padding:"3px 12px"}}>Caption {label}</div><div style={{fontSize:12,color:"#555",lineHeight:1.6,marginBottom:10,background:"#fafafa",borderRadius:8,padding:"9px 11px"}}>{cap}</div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><ScoreRing score={d.overall} size={52} delay={i*150}/><div style={{flex:1}}>{[{l:"Voice",k:"voice",c:TEAL},{l:"Clarity",k:"clarity",c:TEAL_MID},{l:"Engage",k:"engagement",c:"#f59e0b"}].map(({l,k,c},j)=>(<div key={k} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}><div style={{fontSize:10,width:42,color:"#888"}}>{l}</div><Bar pct={(d.scores[k]/10)*100} color={c} delay={j*60+i*100}/><div style={{fontSize:10,fontWeight:700,color:c,width:20}}>{d.scores[k]}</div></div>))}</div></div><div className="slideIn" style={{fontSize:11,color:"#16a34a",marginBottom:4,animationDelay:"300ms"}}>✅ {d.strengths}</div><div className="slideIn" style={{fontSize:11,color:"#dc2626",animationDelay:"350ms"}}>⚠️ {d.weaknesses}</div></Card>);})}</div>{result.improved_winner&&(<Card animate="fadeUp" delay={250} style={{marginBottom:14}}><div style={{fontWeight:700,fontSize:14,color:TEAL,marginBottom:10}}>✨ Improved Winning Caption</div><div style={{background:TEAL_LIGHT,borderRadius:10,padding:"12px 14px",fontSize:13,color:"#333",lineHeight:1.7,marginBottom:12}}>{result.improved_winner}</div><Btn small outline onClick={()=>navigator.clipboard.writeText(result.improved_winner)}>📋 Copy</Btn></Card>)}<div className="fadeUp" style={{display:"flex",gap:8,animationDelay:"350ms"}}><Btn small outline full onClick={()=>{setResult(null);setCapA("");setCapB("");}} >🔄 Compare Again</Btn><Btn small full onClick={onHome}>🏠 Home</Btn></div></div>)}
    </div>
  );
}

// ══ HOME ═════════════════════════════════════════════════════════════════════
function Home({onSelect}){
  const modes=[{id:"evaluate",icon:"🔍",title:"Evaluate",desc:"Score your content idea across voice, clarity & engagement before you post.",color:TEAL,bg:TEAL_LIGHT,border:"#a7d9d4",delay:0},{id:"brainstorm",icon:"💡",title:"Brainstorm",desc:"Give a topic and get 3 AI-generated content ideas with predicted scores.",color:"#7c3aed",bg:"#f3e8ff",border:"#d8b4fe",delay:80},{id:"compare",icon:"⚔️",title:"Compare",desc:"Pit two captions against each other and find out which one wins.",color:"#dc2626",bg:"#fee2e2",border:"#fca5a5",delay:160}];
  return(
    <div style={{maxWidth:680,margin:"0 auto"}}>
      <div className="fadeUp" style={{textAlign:"center",marginBottom:36}}><div className="float" style={{display:"inline-block",marginBottom:12}}><Logo size={56}/></div><div style={{fontSize:26,fontWeight:900,color:"#1a1a1a",marginBottom:6}}>What would you like to do?</div><div style={{fontSize:14,color:"#94a3b8"}}>Pick a mode to get started</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:14}}>
        {modes.map(m=>(<div key={m.id} className="card-hover fadeUp" onClick={()=>onSelect(m.id)} style={{background:"#fff",border:`2px solid ${m.border}`,borderRadius:20,padding:"22px 26px",cursor:"pointer",display:"flex",alignItems:"center",gap:20,animationDelay:`${m.delay}ms`}}><div style={{width:58,height:58,borderRadius:16,background:m.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,boxShadow:`0 4px 12px ${m.border}88`}}>{m.icon}</div><div style={{flex:1}}><div style={{fontWeight:800,fontSize:17,color:m.color,marginBottom:4}}>{m.title}</div><div style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>{m.desc}</div></div><div style={{fontSize:20,color:m.border}}>→</div></div>))}
      </div>
      <div className="fadeUp" style={{marginTop:24,textAlign:"center",animationDelay:"280ms"}}><div style={{display:"inline-flex",alignItems:"center",gap:16,background:"#fff",borderRadius:99,padding:"10px 24px",border:"1px solid #e0f2f0",boxShadow:"0 2px 12px rgba(13,148,136,.08)"}}>{["Smart Scoring","AI Suggestions","Brand Aligned","Export Ready"].map((t,i)=>(<div key={t} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:TEAL,fontWeight:600}}>{i>0&&<span style={{color:"#d1ede9"}}>·</span>}<span style={{color:TEAL_MID}}>✦</span>{t}</div>))}</div></div>
    </div>
  );
}

// ══ ROOT ═════════════════════════════════════════════════════════════════════
export default function PredictaPost(){
  useInject();
  const [mode,setMode]=useState(null);
  const [showLog,setShowLog]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [log,setLog]=useState([]);
  const [files,setFiles]=useState([]);

  // load persisted data on mount
  useEffect(()=>{
    const load=async()=>{
      try{const r=await window.storage.get("pp_eval_log");if(r?.value)setLog(JSON.parse(r.value));}catch{}
      try{const r=await window.storage.get("pp_data_files");if(r?.value)setFiles(JSON.parse(r.value));}catch{}
    };
    load();
  },[]);

  const saveLog=l=>{setLog(l);window.storage?.set("pp_eval_log",JSON.stringify(l)).catch(()=>{});};
  const saveFiles=f=>{setFiles(f);window.storage?.set("pp_data_files",JSON.stringify(f)).catch(()=>{});};

  const addLogEntry=entry=>saveLog([entry,...log]);
  const delLogEntry=id=>saveLog(log.filter(e=>e.id!==id));
  const clearLog=()=>saveLog([]);

  const addFiles=newFiles=>{
    const merged=[...files,...newFiles.filter(nf=>!files.find(f=>f.name===nf.name))];
    saveFiles(merged);
  };
  const toggleFile=(id,val)=>saveFiles(files.map(f=>f.id===id?{...f,active:val}:f));
  const deleteFile=id=>saveFiles(files.filter(f=>f.id!==id));
  const clearFiles=()=>saveFiles([]);

  // merge all active file rows for AI
  const activeData=files.filter(f=>f.active).flatMap(f=>f.rows).slice(0,60);

  const goHome=()=>{setMode(null);setShowLog(false);};

  return(
    <div style={{fontFamily:"'Inter',sans-serif",background:"#f0faf8",minHeight:"100vh",paddingBottom:60,position:"relative"}}>
      <BgDots/>
      {showSettings&&<SettingsPanel files={files} onAddFiles={addFiles} onToggleFile={toggleFile} onDeleteFile={deleteFile} onClearFiles={clearFiles} onClose={()=>setShowSettings(false)}/>}
      <div style={{position:"relative",zIndex:1}}>
        {/* header */}
        <div style={{background:"rgba(255,255,255,.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid #d1ede9",padding:"13px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
          <div onClick={goHome} className="btn-hover" style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
            <Logo/>
            <div><div style={{fontWeight:900,fontSize:18,color:TEAL,letterSpacing:"-0.5px"}}>PredictaPost</div><div style={{fontSize:11,color:"#94a3b8",marginTop:-1}}>Know Before You Post.</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* data status pill */}
            {files.filter(f=>f.active).length>0&&(
              <div style={{fontSize:11,color:"#16a34a",fontWeight:600,background:"#dcfce7",borderRadius:99,padding:"5px 11px",display:"flex",alignItems:"center",gap:4}}>
                <span>✅</span>{files.filter(f=>f.active).length} file{files.filter(f=>f.active).length>1?"s":""} · {activeData.length} rows
              </div>
            )}
            {/* eval log */}
            <button className="btn-hover" onClick={()=>{setShowLog(true);setMode(null);}} style={{padding:"8px 14px",borderRadius:12,fontSize:12,fontWeight:700,cursor:"pointer",background:showLog?TEAL:TEAL_LIGHT,color:showLog?"#fff":TEAL,border:`2px solid ${TEAL}`,display:"flex",alignItems:"center",gap:6}}>
              📋 Log {log.length>0&&<span style={{background:showLog?"rgba(255,255,255,.3)":TEAL,color:"#fff",borderRadius:99,padding:"1px 7px",fontSize:10,fontWeight:800}}>{log.length}</span>}
            </button>
            {/* settings */}
            <button className="btn-hover" onClick={()=>setShowSettings(true)} style={{padding:"8px 14px",borderRadius:12,fontSize:12,fontWeight:700,cursor:"pointer",background:TEAL_LIGHT,color:TEAL,border:`2px solid ${TEAL}`,display:"flex",alignItems:"center",gap:5}}>
              ⚙️ Settings {files.length>0&&<span style={{background:TEAL,color:"#fff",borderRadius:99,padding:"1px 7px",fontSize:10,fontWeight:800}}>{files.length}</span>}
            </button>
          </div>
        </div>

        <div style={{maxWidth:760,margin:"0 auto",padding:"32px 20px"}}>
          {showLog&&(
            <div>
              <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,marginBottom:22}}>
                <button className="btn-hover" onClick={goHome} style={{background:TEAL_LIGHT,border:"none",cursor:"pointer",color:TEAL,fontSize:14,fontWeight:700,borderRadius:99,padding:"7px 14px"}}>← Home</button>
                <div style={{fontWeight:800,fontSize:18,color:TEAL}}>📋 Evaluation Log</div>
                <div style={{fontSize:12,color:"#94a3b8"}}>{log.length} evaluation{log.length!==1?"s":""}</div>
              </div>
              <EvalLog log={log} onDelete={delLogEntry} onClear={clearLog}/>
            </div>
          )}
          {!showLog&&!mode&&<Home onSelect={setMode}/>}
          {!showLog&&mode==="evaluate"&&<EvaluateMode activeData={activeData} onHome={goHome} onLogEntry={addLogEntry}/>}
          {!showLog&&mode==="brainstorm"&&<BrainstormMode onHome={goHome}/>}
          {!showLog&&mode==="compare"&&<CompareMode onHome={goHome}/>}
        </div>
      </div>
    </div>
  );
}
