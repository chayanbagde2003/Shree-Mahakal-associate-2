import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate config
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key] || firebaseConfig[key].includes('your_'));
if (missingKeys.length > 0) {
  console.warn('Firebase config incomplete. Missing:', missingKeys.join(', '));
  console.warn('Copy .env.example to .env and fill in your values');
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

import { ownerProfiles } from '/src/config/ownerProfiles.js';

const toastEl = document.getElementById("toast");
function showToast(msg, timeout = 3000) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), timeout);
}

document.querySelectorAll(".owner-badge").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.owner;
    openOwnerModal(id);
  });
});

function openOwnerModal(id) {
  const modal = document.getElementById("owner-modal");
  const content = document.getElementById("owner-modal-content");
  const profile = ownerProfiles[id];
  if (!profile) return;

  const qualificationsList = profile.qualifications.map(q => `<li>${q}</li>`).join('');

  content.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1rem; align-items:center; text-align:center;">
      <img src="${profile.image}" style="width:110px; height:110px; border-radius:50%; object-fit:cover; border:3px solid var(--accent-gold);" alt="${profile.name}" />
      <div>
        <h3 style="font-size:1.3rem; margin-bottom:0.2rem;">${profile.name}</h3>
        <div style="color:var(--accent-gold); font-size:0.85rem; font-weight:700;">${profile.title}</div>
        <ul style="list-style:none; padding:0; margin:1rem 0; text-align:left; font-size:0.85rem; color:var(--text-muted);">
          ${qualificationsList}
        </ul>
        <div style="display:flex; gap:0.5rem; justify-content:center; margin-top:1rem;">
          <a class="btn primary" href="tel:${profile.phone}">Call Direct</a>
          <a class="btn whatsapp" href="https://wa.me/91${profile.phone}?text=Hello%20${encodeURIComponent(profile.name)}" target="_blank">WhatsApp</a>
        </div>
      </div>
    </div>
  `;
  modal.setAttribute("aria-hidden", "false");
}

document.getElementById("owner-modal-close").addEventListener("click", () => {
  document.getElementById("owner-modal").setAttribute("aria-hidden", "true");
});

/* Calculator Logic */
const calcArea = document.getElementById("calc-area");
const calcPlan = document.getElementById("calc-plan");
const calcDiscount = document.getElementById("calc-discount");
const calcOutput = document.getElementById("calc-output");
const calcRateDisplay = document.getElementById("calc-rate-display");
const calcAreaDisplay = document.getElementById("calc-area-display");
const calcBaseCost = document.getElementById("calc-base-cost");
const calcDiscountAmount = document.getElementById("calc-discount-amount");

function computeEstimate(area, rate, discountFlag) {
  let est = area * rate;
  if (discountFlag) est = est * (1 - 0.025);
  return est;
}

function updateCalcOutput() {
  const area = Number(calcArea.value || 0);
  const rate = Number(calcPlan.value || 0);
  const apply = calcDiscount.checked;
  const baseCost = area * rate;
  const discount = apply ? baseCost * 0.025 : 0;
  const est = baseCost - discount;
  
  calcOutput.textContent = `₹${Math.round(est).toLocaleString("en-IN")}`;
  calcRateDisplay.textContent = `₹${rate.toLocaleString("en-IN")}`;
  calcAreaDisplay.textContent = area.toLocaleString("en-IN");
  calcBaseCost.textContent = `₹${Math.round(baseCost).toLocaleString("en-IN")}`;
  calcDiscountAmount.textContent = `-₹${Math.round(discount).toLocaleString("en-IN")}`;
}

calcArea.addEventListener("input", updateCalcOutput);
calcPlan.addEventListener("change", updateCalcOutput);
calcDiscount.addEventListener("change", updateCalcOutput);
updateCalcOutput();

/* Set Current Year in Footer */
document.getElementById("year").textContent = new Date().getFullYear();