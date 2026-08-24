import"./styles-D2uAdso6.js";import{initializeApp as me}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";import{getAuth as ue}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";import{getFirestore as ge}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js";const pe={apiKey:"YOUR_API_KEY",authDomain:"YOUR_PROJECT_ID.firebaseapp.com",projectId:"YOUR_PROJECT_ID",storageBucket:"YOUR_PROJECT_ID.appspot.com",messagingSenderId:"YOUR_MESSAGING_SENDER_ID",appId:"YOUR_APP_ID"},x=me(pe),fe=ue(x),he=ge(x);window.firebaseApp=x;window.firebaseAuth=fe;window.firebaseDb=he;console.log("Firebase initialized successfully");const ye={structure:{title:"STRUCTURE PLAN (Essential Foundation & RCC Frame)",price:"₹849 / sq. ft.",color:"var(--accent-red)",workScope:["Excavation, Soil Compaction & Footing Concrete Work","RCC Column, Beam, & Slab Casting using Standard TMT Steel & Grade Cement","Fly-ash / Red Brick Masonry Outer & Inner Partition Walls","Internal Single Coat Plastering & External Waterproof Plastering","Basic Electrical Conduit Pipe Fitting inside Slab and Walls"],materials:"TATA Tiscon / Jindal Panther TMT, Ultratech / ACC Cement",timeline:"3 to 4 Months (for 1200 sq.ft. G+1)"},premium:{title:"PREMIUM PLAN (Complete Move-In Home)",price:"₹1,399 / sq. ft.",color:"var(--accent-blue)",workScope:["Complete Foundation, RCC Structure & Brickwork","Vitrified Tile Flooring (2x2 ft) in Living, Bedrooms & Dining","Ceramic Tiles in Bathroom up to Lintel Height","Complete Plumbing Fittings (Jaguar / Cera) & Concealed Wiring (Finolex / Havells)","Granite Kitchen Platform with Stainless Steel Sink","Teakwood Main Door Frame & Flush Doors for Bedrooms","Double Coat Outer Asian Paints Apex Paint Finish"],materials:"Vitrified Tiles, Finolex Wiring, Cera Bath Fittings",timeline:"5 to 6 Months"},royal:{title:"ROYAL PLAN (Luxury Architecture & Vastu Finish)",price:"₹1,500 / sq. ft.",color:"var(--accent-gold)",workScope:["Architectural 3D Elevation & Vastu Compliant Layout Included","Large Format Premium Vitrified Tiles (2x4 ft)","Modular False Ceiling in Living Room & Master Bedroom","Branded Wall-Hung Sanitary Ware & Diverter Fittings","Modular Kitchen Trolley & Overhead Storage Cabinets","UPVC / Anodized Aluminum Sliding Windows with Safety Grill","Royale Emulsion Interior Paint Finish"],materials:"Kajaria / Somany Tiles, Kohler / Jaquar CP Fittings, Asian Royale Paint",timeline:"6 to 7 Months"},luxury:{title:"LUXURY PLAN (Smart Mansion & Ultra Finish)",price:"₹1,599 / sq. ft.",color:"var(--accent-purple)",workScope:["Custom Interior Architectural Design & Smart Home Automation Wiring","Italian Marble or Premium GVT Glazed Tile Flooring","Complete Designer False Ceiling with LED Profiles in All Rooms","Full Modular Kitchen with Quartz / Nano-White Countertop","Glass Shower Partition & Thermostatic Shower Panels","Teak Wood Heavy Carved Main Door & Veneered Flush Doors","Exterior Texture Paint with Wood-Composite Panel Facade"],materials:"Italian Marble, Grohe / Kohler Fittings, Smart Switches",timeline:"7 to 9 Months"}},ve={chayan:{name:"Chayan Bagde",title:"Civil Engineer | Dealer Incharge",qualifications:["B.Tech in Civil Engineering","Master in AutoCAD Software","BBA Degree","Builder, Interior & Exterior Designer","3D Architecture & Layout Specialist"],phone:"9399330188",image:"assets/chayan.webp"},krishnakant:{name:"Krishnakant D.",title:"Civil Engineer | Construction Manager",qualifications:["BSC","8+ Years of Field Experience","Labour & Material Operations Incharge","On-Site Quality Assurance"],phone:"7725037456",image:"assets/krishnakant.webp"}};document.querySelectorAll(".view-details-btn").forEach(e=>{e.addEventListener("click",()=>{const n=e.dataset.plan;Ee(n)})});function Ee(e){const n=document.getElementById("plan-details-modal"),t=document.getElementById("plan-modal-content"),i=ye[e];if(!i)return;const a=i.workScope.map(o=>`<li>${o}</li>`).join("");t.innerHTML=`
    <div class="plan-detail-box">
      <h3 style="color:${i.color}">${i.title}</h3>
      <div class="modal-price">${i.price}</div>

      <div class="detail-section-title">🛠️ Detailed Scope of Construction Work:</div>
      <ul class="detail-list">${a}</ul>

      <div class="detail-section-title">🏗️ Key Brands & Materials Used:</div>
      <p style="font-size:0.9rem; color:var(--text-muted);">${i.materials}</p>

      <div class="detail-section-title">⏱️ Estimated Project Timeline:</div>
      <p style="font-size:0.9rem; color:var(--text-muted);">${i.timeline}</p>

      <div style="margin-top:2rem; display:flex; gap:1rem;">
        <a class="btn primary" href="https://wa.me/919399330188?text=I%20want%20to%20discuss%20the%20${encodeURIComponent(i.title)}" target="_blank">Book This Plan on WhatsApp</a>
        <a class="btn secondary" href="tel:9399330188">Call Engineer</a>
      </div>
    </div>
  `,n.setAttribute("aria-hidden","false")}document.getElementById("plan-modal-close").addEventListener("click",()=>{document.getElementById("plan-details-modal").setAttribute("aria-hidden","true")});document.querySelectorAll(".owner-badge").forEach(e=>{e.addEventListener("click",()=>{const n=e.dataset.owner;Ie(n)})});function Ie(e){const n=document.getElementById("owner-modal"),t=document.getElementById("owner-modal-content"),i=ve[e];if(!i)return;const a=i.qualifications.map(o=>`<li>${o}</li>`).join("");t.innerHTML=`
    <div style="display:flex; flex-direction:column; gap:1rem; align-items:center; text-align:center;">
      <img src="${i.image}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:3px solid var(--accent-gold);" alt="${i.name}" />
      <div>
        <h3 style="font-size:1.3rem; margin-bottom:0.2rem;">${i.name}</h3>
        <div style="color:var(--accent-gold); font-size:0.85rem; font-weight:700;">${i.title}</div>
        <ul style="list-style:none; padding:0; margin:1rem 0; text-align:left; font-size:0.85rem; color:var(--text-muted);">
          ${a}
        </ul>
        <div style="display:flex; gap:0.5rem; justify-content:center; margin-top:1rem;">
          <a class="btn primary" href="tel:${i.phone}">Call Direct</a>
          <a class="btn secondary" href="https://wa.me/91${i.phone}?text=Hello%20${encodeURIComponent(i.name)}" target="_blank">WhatsApp</a>
        </div>
      </div>
    </div>
  `,n.setAttribute("aria-hidden","false")}document.getElementById("owner-modal-close").addEventListener("click",()=>{document.getElementById("owner-modal").setAttribute("aria-hidden","true")});const S=document.getElementById("image-modal"),_=document.getElementById("modal-image"),J=document.getElementById("image-modal-close");document.querySelectorAll(".clickable-preview").forEach(e=>{e.addEventListener("click",()=>{_.src=e.src,_.alt=e.alt,S.setAttribute("aria-hidden","false")})});J&&J.addEventListener("click",()=>{S.setAttribute("aria-hidden","true")});S.addEventListener("click",e=>{e.target===S&&S.setAttribute("aria-hidden","true")});const m=document.getElementById("mobile-menu-btn"),h=document.querySelector(".main-nav");m&&h&&(m.addEventListener("click",()=>{const e=h.classList.toggle("open");m.classList.toggle("active"),m.setAttribute("aria-expanded",e)}),h.querySelectorAll(".nav-link").forEach(e=>{e.addEventListener("click",()=>{h.classList.remove("open"),m.classList.remove("active"),m.setAttribute("aria-expanded","false")})}),document.addEventListener("click",e=>{!h.contains(e.target)&&!m.contains(e.target)&&(h.classList.remove("open"),m.classList.remove("active"),m.setAttribute("aria-expanded","false"))}));const w=["hotel and resort/images.jpg","hotel and resort/images (1).jpg","hotel and resort/sunyata-eco-hotel-design-kacheri_4.jpg"];let y=0;const Z=document.getElementById("hotel-carousel-img"),U=document.getElementById("hotel-prev"),z=document.getElementById("hotel-next");U&&U.addEventListener("click",()=>{y=(y-1+w.length)%w.length,Z.src=w[y]});z&&z.addEventListener("click",()=>{y=(y+1)%w.length,Z.src=w[y]});const $=["kitchen plan/images.jpg","kitchen plan/images (1).jpg","kitchen plan/G-Shape-Modular-Kitchen-Design.jpg","kitchen plan/home-design.jpg","kitchen plan/IMG_1779-1.jpg","kitchen plan/17-1782107421-q1iCf.avif","kitchen plan/168-1777533654-ph241.avif","fall ceilings/images.jpg","fall ceilings/72-1780901136-tuKJ0.avif","fall ceilings/images"];let v=0;const ee=document.getElementById("residential-carousel-img"),G=document.getElementById("residential-prev"),K=document.getElementById("residential-next");G&&G.addEventListener("click",()=>{v=(v-1+$.length)%$.length,ee.src=$[v]});K&&K.addEventListener("click",()=>{v=(v+1)%$.length,ee.src=$[v]});const L=["cafe plans/images.jpg","cafe plans/images (1).jpg","cafe plans/images (2).jpg","cafe plans/Cafe-Floor-Plans.jpg","cafe plans/360_F_1522187751_Mc0GzTPkSlHuzqa0BFGgYOeft7KJVYCD.jpg","cafe plans/images"];let E=0;const te=document.getElementById("cafe-carousel-img"),W=document.getElementById("cafe-prev"),H=document.getElementById("cafe-next");W&&W.addEventListener("click",()=>{E=(E-1+L.length)%L.length,te.src=L[E]});H&&H.addEventListener("click",()=>{E=(E+1)%L.length,te.src=L[E]});const A=["3d designs/images.jpg","3d designs/images (1).jpg","3d designs/1a00d422c69710566b48f4ba268e7f12.jpg","3d designs/nadira-madhusanka-model-02-3d.jpg","3d designs/mceclip22_1660084136.png","3d designs/3DmodelofhouseplanisavailableinthisAutocaddrawingfileDownloadnowSatOct2020055716.png","3d designs/what-is-floor-plan-image-thumb-1172x660.avif"];let I=0;const ne=document.getElementById("exterior-carousel-img"),Y=document.getElementById("exterior-prev"),V=document.getElementById("exterior-next");Y&&Y.addEventListener("click",()=>{I=(I-1+A.length)%A.length,ne.src=A[I]});V&&V.addEventListener("click",()=>{I=(I+1)%A.length,ne.src=A[I]});document.querySelectorAll(".tab-btn").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(t=>t.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active")),e.classList.add("active");const n=e.dataset.tab;document.getElementById(`tab-${n}`).classList.add("active")})});const ie=document.getElementById("calc-area"),ae=document.getElementById("calc-plan"),oe=document.getElementById("calc-discount"),be=document.getElementById("calc-output");function k(){const e=Number(ie.value||0),n=Number(ae.value||0);let t=e*n;oe.checked&&(t*=.975),be.textContent=`₹${Math.round(t).toLocaleString("en-IN")}`}ie.addEventListener("input",k);ae.addEventListener("change",k);oe.addEventListener("change",k);k();document.getElementById("year").textContent=new Date().getFullYear();const B="smba_users",c="smba_inquiries";function Se(){if(JSON.parse(localStorage.getItem(B)||"[]").length===0){const n=[{id:1,name:"Demo User",email:"demo@test.com",password:"demo123",role:"user",createdAt:new Date().toISOString()}];localStorage.setItem(B,JSON.stringify(n))}}Se();function we(){if(JSON.parse(localStorage.getItem(c)||"[]").length===0){const n=[{id:1,fullName:"Rajesh Kumar",email:"rajesh@email.com",phone:"+91 98765 43210",location:"Rajnandgaon, Chhattisgarh",projectType:"residential",planChoice:"premium",plotSize:1200,floors:"2",style:["modern","fusion"],vastu:"basic",services:["interior","modular-kitchen","false-ceiling"],budgetRange:"40-60",timeline:"3-months",specialRequirements:"Need modern kitchen with island",status:"new",createdAt:new Date(Date.now()-864e5).toISOString()},{id:2,fullName:"Priya Sharma",email:"priya@email.com",phone:"+91 87654 32109",location:"Bhilai, Chhattisgarh",projectType:"commercial",planChoice:"royal",plotSize:2e3,floors:"3",style:["luxury"],vastu:"strict",services:["interior","smart-home","security","elevation"],budgetRange:"100+",timeline:"immediate",specialRequirements:"Luxury office with conference rooms",status:"contacted",createdAt:new Date().toISOString()}];localStorage.setItem(c,JSON.stringify(n))}}we();let s=JSON.parse(sessionStorage.getItem("smba_current_user")||"null");const g=document.getElementById("login-modal"),D=document.getElementById("requirements-modal"),P=document.getElementById("admin-panel-modal"),u=document.getElementById("login-btn"),$e=document.getElementById("call-btn");document.querySelectorAll(".login-tab").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".login-tab").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".login-tab-content").forEach(n=>n.classList.remove("active")),e.classList.add("active"),document.getElementById(e.dataset.tab).classList.add("active")})});document.querySelectorAll(".admin-tab").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".admin-tab").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".admin-tab-content").forEach(n=>n.classList.remove("active")),e.classList.add("active"),document.getElementById(e.dataset.tab).classList.add("active")})});function p(e="user-login"){g.setAttribute("aria-hidden","false"),document.querySelectorAll(".login-tab").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".login-tab-content").forEach(n=>n.classList.remove("active")),document.querySelector(`[data-tab="${e}"]`).classList.add("active"),document.getElementById(e).classList.add("active")}function N(){g.setAttribute("aria-hidden","true"),document.getElementById("user-login-form").reset(),document.getElementById("admin-login-form").reset()}function re(){if(!s){p("user-login");return}document.getElementById("full-name").value=s.name||"",document.getElementById("email").value=s.email||"",D.setAttribute("aria-hidden","false")}function se(){D.setAttribute("aria-hidden","true"),document.getElementById("requirements-form").reset()}function le(){if(!s||s.role!=="admin"){p("admin-login");return}P.setAttribute("aria-hidden","false"),Be()}function Le(){P.setAttribute("aria-hidden","true")}u.addEventListener("click",()=>p("user-login"));document.getElementById("login-modal-close").addEventListener("click",N);document.getElementById("requirements-modal-close").addEventListener("click",se);document.getElementById("admin-panel-close").addEventListener("click",Le);[g,D,P].forEach(e=>{e.addEventListener("click",n=>{n.target===e&&e.setAttribute("aria-hidden","true")})});document.getElementById("user-login-form").addEventListener("submit",e=>{e.preventDefault();const n=document.getElementById("user-email").value.trim().toLowerCase(),t=document.getElementById("user-password").value,a=JSON.parse(localStorage.getItem(B)||"[]").find(o=>o.email===n&&o.password===t);a?(s=a,sessionStorage.setItem("smba_current_user",JSON.stringify(a)),N(),T(),g.dataset.trigger==="requirements"&&(re(),delete g.dataset.trigger),d("Login successful! Welcome back, "+a.name)):d("Invalid email or password","error")});document.getElementById("admin-login-form").addEventListener("submit",e=>{e.preventDefault();const n=document.getElementById("admin-email").value.trim().toLowerCase(),t=document.getElementById("admin-password").value,a=JSON.parse(localStorage.getItem(B)||"[]").find(o=>o.email===n&&o.password===t&&o.role==="admin");a?(s=a,sessionStorage.setItem("smba_current_user",JSON.stringify(a)),N(),T(),le(),d("Admin access granted!")):d("Invalid admin credentials","error")});function T(){s?(u.textContent=s.name,u.classList.add("primary"),u.classList.remove("secondary"),u.onclick=()=>{s.role==="admin"?le():re()}):(u.textContent="Login",u.classList.add("secondary"),u.classList.remove("primary"),u.onclick=()=>p("user-login"))}T();document.getElementById("requirements-form").addEventListener("submit",async e=>{e.preventDefault();const n=new FormData(e.target),t=Object.fromEntries(n.entries());["style","services"].forEach(o=>{const l=document.querySelectorAll(`input[name="${o}"]:checked`);t[o]=Array.from(l).map(b=>b.value)}),["projectType","vastu"].forEach(o=>{const l=document.querySelector(`input[name="${o}"]:checked`);l&&(t[o]=l.value)}),t.userId=s.id,t.userEmail=s.email,t.userName=s.name,t.status="new",t.createdAt=new Date().toISOString(),t.id=Date.now();const a=JSON.parse(localStorage.getItem(c)||"[]");a.unshift(t),localStorage.setItem(c,JSON.stringify(a)),await Ae(t),se(),d("Requirements submitted successfully! Our team will contact you within 24 hours.")});document.getElementById("save-draft-btn").addEventListener("click",()=>{const e=new FormData(document.getElementById("requirements-form")),n=Object.fromEntries(e.entries());checkboxGroups.forEach(t=>{const i=document.querySelectorAll(`input[name="${t}"]:checked`);n[t]=Array.from(i).map(a=>a.value)}),["projectType","vastu"].forEach(t=>{const i=document.querySelector(`input[name="${t}"]:checked`);i&&(n[t]=i.value)}),n.isDraft=!0,n.savedAt=new Date().toISOString(),localStorage.setItem(`smba_draft_${s.id}`,JSON.stringify(n)),d("Draft saved successfully!")});async function Ae(e){try{const n=`New Inquiry: ${e.fullName} - ${e.planChoice} Plan`,t=`
New Project Inquiry Received

Personal Details:
- Name: ${e.fullName}
- Email: ${e.email}
- Phone: ${e.phone}
- Location: ${e.location}

Project Details:
- Type: ${e.projectType}
- Plan: ${e.planChoice}
- Plot Size: ${e.plotSize} sq.ft
- Floors: ${e.floors}
- Architectural Style: ${e.style.join(", ")}
- Vastu: ${e.vastu}
- Services: ${e.services.join(", ")}
- Flooring: ${e.flooring||"Not specified"}
- Kitchen Countertop: ${e.kitchenCountertop||"Not specified"}
- Budget Range: ${e.budgetRange}
- Timeline: ${e.timeline}

Special Requirements:
${e.specialRequirements||"None"}

---
Submitted: ${new Date(e.createdAt).toLocaleString()}
User ID: ${e.userId}
    `.trim();console.log("Inquiry Email Data:",e),console.log("Subject:",n),console.log("Body:",t)}catch(n){console.error("Email sending failed:",n)}}let ce=1;const q=10;function Be(){j(),de(),Ce()}function j(e=1){var C,O;ce=e;const n=JSON.parse(localStorage.getItem(c)||"[]"),t=((O=(C=document.getElementById("inquiry-search"))==null?void 0:C.value)==null?void 0:O.toLowerCase())||"";let i=n;t&&(i=n.filter(r=>{var f,R,M,F;return((f=r.fullName)==null?void 0:f.toLowerCase().includes(t))||((R=r.email)==null?void 0:R.toLowerCase().includes(t))||((M=r.phone)==null?void 0:M.includes(t))||((F=r.planChoice)==null?void 0:F.includes(t))})),i.sort((r,f)=>new Date(f.createdAt)-new Date(r.createdAt));const a=Math.ceil(i.length/q),o=i.slice((e-1)*q,e*q),l=document.querySelector("#inquiries-table tbody");l.innerHTML=o.map(r=>`
    <tr>
      <td>${new Date(r.createdAt).toLocaleDateString()}</td>
      <td>${r.fullName}</td>
      <td>${r.phone}<br><small>${r.email}</small></td>
      <td>${r.projectType}</td>
      <td><span class="status-badge status-${r.status}">${r.planChoice}</span></td>
      <td>${r.budgetRange||"Not specified"}</td>
      <td><span class="status-badge status-${r.status}">${r.status}</span></td>
      <td>
        <button class="action-btn view" onclick="viewInquiry(${r.id})">View</button>
        <button class="action-btn email" onclick="emailInquiry(${r.id})">Email</button>
        <button class="action-btn delete" onclick="deleteInquiry(${r.id})">Delete</button>
      </td>
    </tr>
  `).join("");const b=document.getElementById("inquiry-pagination");a>1?b.innerHTML=`
      <button class="pagination-btn" ${e===1?"disabled":""} onclick="loadInquiriesTable(${e-1})">Previous</button>
      ${Array.from({length:a},(r,f)=>f+1).map(r=>`<button class="pagination-btn ${r===e?"active":""}" onclick="loadInquiriesTable(${r})">${r}</button>`).join("")}
      <button class="pagination-btn" ${e===a?"disabled":""} onclick="loadInquiriesTable(${e+1})">Next</button>
    `:b.innerHTML=""}function de(){var o;const e=JSON.parse(localStorage.getItem(c)||"[]"),n=((o=document.getElementById("plan-filter"))==null?void 0:o.value)||"";let t=e;n&&(t=e.filter(l=>l.planChoice===n));const i={structure:849,premium:1399,royal:1500,luxury:1599},a=document.querySelector("#plans-table tbody");a.innerHTML=t.map(l=>{const C=((i[l.planChoice]||0)*(l.plotSize||0)/1e5).toFixed(2);return`
      <tr>
        <td>${new Date(l.createdAt).toLocaleDateString()}</td>
        <td>${l.fullName}</td>
        <td>${l.planChoice}</td>
        <td>${l.plotSize} sq.ft</td>
        <td>₹${C} Lakhs</td>
        <td><span class="status-badge status-${l.status}">${l.status}</span></td>
      </tr>
    `}).join("")}function Ce(){const e=JSON.parse(localStorage.getItem(B)||"[]"),n=JSON.parse(localStorage.getItem(c)||"[]"),t=document.querySelector("#users-table tbody");t.innerHTML=e.filter(i=>i.role!=="admin").map(i=>{const a=n.filter(o=>o.userId===i.id);return`
      <tr>
        <td>${i.name}</td>
        <td>${i.email}</td>
        <td>-</td>
        <td>${new Date(i.createdAt).toLocaleDateString()}</td>
        <td>${a.length}</td>
        <td><span class="status-badge status-${a.some(o=>o.status==="new")?"new":"contacted"}">${a.length>0?"Active":"New"}</span></td>
      </tr>
    `}).join("")}window.viewInquiry=function(e){const t=JSON.parse(localStorage.getItem(c)||"[]").find(i=>i.id===e);t&&alert(`Inquiry Details:

Name: ${t.fullName}
Email: ${t.email}
Phone: ${t.phone}
Location: ${t.location}
Project: ${t.projectType}
Plan: ${t.planChoice}
Plot: ${t.plotSize} sq.ft
Budget: ${t.budgetRange}
Services: ${t.services.join(", ")}
Status: ${t.status}

Requirements:
${t.specialRequirements}`)};window.emailInquiry=function(e){const t=JSON.parse(localStorage.getItem(c)||"[]").find(i=>i.id===e);if(t){const i=`Follow up: ${t.fullName} - ${t.planChoice} Plan`,a=`Dear ${t.fullName},

Thank you for your inquiry about our ${t.planChoice} plan...

Best regards,
Shree Mahakal Building Associates`;window.location.href=`mailto:${t.email}?subject=${encodeURIComponent(i)}&body=${encodeURIComponent(a)}`}};window.deleteInquiry=function(e){if(confirm("Are you sure you want to delete this inquiry?")){let n=JSON.parse(localStorage.getItem(c)||"[]");n=n.filter(t=>t.id!==e),localStorage.setItem(c,JSON.stringify(n)),j(ce),d("Inquiry deleted")}};var Q;(Q=document.getElementById("inquiry-search"))==null||Q.addEventListener("input",e=>{clearTimeout(window.searchDebounce),window.searchDebounce=setTimeout(()=>j(1),300)});var X;(X=document.getElementById("plan-filter"))==null||X.addEventListener("change",de);$e.addEventListener("click",e=>{s||(e.preventDefault(),g.dataset.trigger="requirements",p("user-login"),d("Please login to access contact details"))});document.querySelectorAll('a[href="#packages"]').forEach(e=>{e.addEventListener("click",n=>{s||(n.preventDefault(),g.dataset.trigger="requirements",p("user-login"),d("Please login to view detailed plans"))})});document.querySelectorAll(".view-details-btn").forEach(e=>{e.addEventListener("click",n=>{s||(n.preventDefault(),g.dataset.trigger="requirements",p("user-login"),d("Please login to view plan details"))})});function d(e,n="success"){document.querySelectorAll(".notification").forEach(i=>i.remove());const t=document.createElement("div");t.className=`notification ${n}`,t.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    max-width: 350px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    ${n==="success"?"background: linear-gradient(135deg, #22c55e, #16a34a); color: white;":""}
    ${n==="error"?"background: linear-gradient(135deg, #ef4444, #dc2626); color: white;":""}
    ${n==="info"?"background: linear-gradient(135deg, #3b82f6, #2563eb); color: white;":""}
  `,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideInRight 0.3s ease reverse",setTimeout(()=>t.remove(),300)},4e3)}if(!document.querySelector("#notification-styles")){const e=document.createElement("style");e.id="notification-styles",e.textContent=`
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(100px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `,document.head.appendChild(e)}window.addEventListener("load",()=>{if(s){const e=localStorage.getItem(`smba_draft_${s.id}`);if(e){const n=JSON.parse(e);Object.keys(n).forEach(t=>{const i=document.querySelector(`[name="${t}"]`);if(i)if(i.type==="checkbox"||i.type==="radio")if(Array.isArray(n[t]))n[t].forEach(a=>{const o=document.querySelector(`[name="${t}"][value="${a}"]`);o&&(o.checked=!0)});else{const a=document.querySelector(`[name="${t}"][value="${n[t]}"]`);a&&(a.checked=!0)}else i.value=n[t]})}}});
//# sourceMappingURL=main-Cbo8sH-p.js.map
