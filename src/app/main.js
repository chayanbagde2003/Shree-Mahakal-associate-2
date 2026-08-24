/**
 * Main Application Entry Point
 * Initializes all services and sets up global event listeners.
 */

import { 
  onAuthStateChange, 
  getWhatsAppUrl, 
  getTelUrl,
  loginWithEmail,
  registerWithEmail,
  resetPassword
} from "../services/auth.js";
import { 
  createBooking
} from "../services/booking.js";
import { 
  validateForm, 
  bookingValidationRules, 
  validateFiles,
  sanitizeText,
  validateEmail,
  validateName,
  validatePhone
} from "../utils/validation.js";
import { BUSINESS_CONFIG } from "../config/business.js";

// Global state
let currentUser = null;
let currentUserProfile = null;

// Notification helper
function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) { existing.remove(); }
  
  const el = document.createElement('div');
  el.className = `notification ${type}`;
  el.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    padding: 1rem 1.5rem; border-radius: var(--radius-md);
    font-weight: 600; max-width: 350px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    animation: slideInRight 0.3s ease;
    ${type === 'success' ? 'background: linear-gradient(135deg, #22c55e, #16a34a); color: white;' : ''}
    ${type === 'error' ? 'background: linear-gradient(135deg, #ef4444, #dc2626); color: white;' : ''}
    ${type === 'info' ? 'background: linear-gradient(135deg, #3b82f6, #2563eb); color: white;' : ''}
  `;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => el.remove(), 300);
  }, 4000);
}
let isAdmin = false;

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const callBtn = document.getElementById('call-btn');
const loginModal = document.getElementById('login-modal');
const requirementsModal = document.getElementById('requirements-modal');
const adminPanelModal = document.getElementById('admin-panel-modal');
const planDetailsModal = document.getElementById('plan-details-modal');
const planModalContent = document.getElementById('plan-modal-content');
const planModalClose = document.getElementById('plan-modal-close');
const inquiryFormModal = document.getElementById('inquiry-form-modal');
const inquiryFormClose = document.getElementById('inquiry-form-modal-close');
const inquiryFormCancel = document.getElementById('inquiry-form-cancel');
const inquiryForm = document.getElementById('inquiry-form');
const inquiryPlanInput = document.getElementById('inquiry-plan');
const inquiryAddressInput = document.getElementById('inquiry-address');

// Admin WhatsApp Number
const ADMIN_WHATSAPP = '919399330188';

// Plan Details Data
const planDetails = {
  structure: {
    title: 'STRUCTURE PLAN (Essential Foundation & RCC Frame)',
    price: '₹849 / sq. ft.',
    color: 'var(--accent-red)',
    workScope: [
      'Excavation, Soil Compaction & Footing Concrete Work',
      'RCC Column, Beam, & Slab Casting using Standard TMT Steel & Grade Cement',
      'Fly-ash / Red Brick Masonry Outer & Inner Partition Walls',
      'Internal Single Coat Plastering & External Waterproof Plastering',
      'Basic Electrical Conduit Pipe Fitting inside Slab and Walls'
    ],
    materials: 'TATA Tiscon / Jindal Panther TMT, Ultratech / ACC Cement',
    timeline: '3 to 4 Months (for 1200 sq.ft. G+1)'
  },
  premium: {
    title: 'PREMIUM PLAN (Complete Move-In Home)',
    price: '₹1,399 / sq. ft.',
    color: 'var(--accent-blue)',
    workScope: [
      'Complete Foundation, RCC Structure & Brickwork',
      'Vitrified Tile Flooring (2x2 ft) in Living, Bedrooms & Dining',
      'Ceramic Tiles in Bathroom up to Lintel Height',
      'Complete Plumbing Fittings (Jaguar / Cera) & Concealed Wiring (Finolex / Havells)',
      'Granite Kitchen Platform with Stainless Steel Sink',
      'Teakwood Main Door Frame & Flush Doors for Bedrooms',
      'Double Coat Outer Asian Paints Apex Paint Finish'
    ],
    materials: 'Vitrified Tiles, Finolex Wiring, Cera Bath Fittings',
    timeline: '5 to 6 Months'
  },
  royal: {
    title: 'ROYAL PLAN (Luxury Architecture & Vastu Finish)',
    price: '₹1,500 / sq. ft.',
    color: 'var(--accent-gold)',
    workScope: [
      'Architectural 3D Elevation & Vastu Compliant Layout Included',
      'Large Format Premium Vitrified Tiles (2x4 ft)',
      'Modular False Ceiling in Living Room & Master Bedroom',
      'Branded Wall-Hung Sanitary Ware & Diverter Fittings',
      'Modular Kitchen Trolley & Overhead Storage Cabinets',
      'UPVC / Anodized Aluminum Sliding Windows with Safety Grill',
      'Royale Emulsion Interior Paint Finish'
    ],
    materials: 'Kajaria / Somany Tiles, Kohler / Jaquar CP Fittings, Asian Royale Paint',
    timeline: '6 to 7 Months'
  },
  luxury: {
    title: 'LUXURY PLAN (Smart Mansion & Ultra Finish)',
    price: '₹1,599 / sq. ft.',
    color: 'var(--accent-purple)',
    workScope: [
      'Custom Interior Architectural Design & Smart Home Automation Wiring',
      'Italian Marble or Premium GVT Glazed Tile Flooring',
      'Complete Designer False Ceiling with LED Profiles in All Rooms',
      'Full Modular Kitchen with Quartz / Nano-White Countertop',
      'Glass Shower Partition & Thermostatic Shower Panels',
      'Teak Wood Heavy Carved Main Door & Veneered Flush Doors',
      'Exterior Texture Paint with Wood-Composite Panel Facade'
    ],
    materials: 'Italian Marble, Grohe / Kohler Fittings, Smart Switches',
    timeline: '7 to 9 Months'
  }
};

// Initialize WhatsApp and Call buttons
function initContactButtons() {
  // WhatsApp buttons
  document.querySelectorAll('[data-whatsapp]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const message = btn.dataset.whatsapp || BUSINESS_CONFIG.whatsapp.defaultMessage;
      window.open(getWhatsAppUrl(message), '_blank');
    });
  });
  
  // Call buttons
  document.querySelectorAll('[data-call]').forEach(btn => {
    btn.href = getTelUrl();
  });
}

// Initialize auth state listener
function initAuthListener() {
  onAuthStateChange(({ user, profile, isAdmin: adminStatus }) => {
    currentUser = user;
    currentUserProfile = profile;
    isAdmin = adminStatus;
    updateAuthUI();
    
    // If login modal was open, close it
    if (loginModal?.getAttribute('aria-hidden') === 'false') {
      closeLoginModal();
    }
    
    // If requirements modal should open after login
    if (user && loginModal?.dataset.trigger === 'requirements') {
      openRequirementsModal();
      delete loginModal.dataset.trigger;
    }
  });
}

// Update UI based on auth state
function updateAuthUI() {
  if (currentUser) {
    const displayName = currentUserProfile?.name || currentUser.displayName || 'User';
    loginBtn.textContent = displayName;
    loginBtn.classList.add('primary');
    loginBtn.classList.remove('secondary');
    loginBtn.onclick = () => {
      if (isAdmin) {
        openAdminPanel();
      } else {
        openRequirementsModal();
      }
    };
  } else {
    loginBtn.textContent = 'Login';
    loginBtn.classList.add('secondary');
    loginBtn.classList.remove('primary');
    loginBtn.onclick = () => openLoginModal('user-login');
  }
}

// Login Modal Functions
function openLoginModal(defaultTab = 'user-login') {
  loginModal.setAttribute('aria-hidden', 'false');
  switchLoginTab(defaultTab);
}

function closeLoginModal() {
  loginModal.setAttribute('aria-hidden', 'true');
  document.getElementById('user-login-form').reset();
  document.getElementById('admin-login-form').reset();
  document.getElementById('signup-form').reset();
}

function switchLoginTab(tabId) {
  document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.login-tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// Requirements Modal
function openRequirementsModal() {
  if (!currentUser) {
    loginModal.dataset.trigger = 'requirements';
    openLoginModal('user-login');
    return;
  }
  
  // Pre-fill user data
  document.getElementById('full-name').value = currentUserProfile?.name || currentUser.displayName || '';
  document.getElementById('email').value = currentUser.email || '';
  document.getElementById('phone').value = currentUserProfile?.phone || '';
  document.getElementById('location').value = currentUserProfile?.city || '';
  document.getElementById('address').value = currentUserProfile?.address || '';
  
  requirementsModal.setAttribute('aria-hidden', 'false');
}

function closeRequirementsModal() {
  requirementsModal.setAttribute('aria-hidden', 'true');
  document.getElementById('requirements-form').reset();
}

// Inquiry Form Modal (for Discuss on WhatsApp buttons)
function openInquiryFormModal(planValue = '') {
  if (!inquiryFormModal) {return;}
  
  // Set the plan value if provided
  if (inquiryPlanInput && planValue) {
    inquiryPlanInput.value = planValue;
  }
  
  // Pre-fill user data if logged in
  if (currentUser) {
    document.getElementById('inquiry-full-name').value = currentUserProfile?.name || currentUser.displayName || '';
    document.getElementById('inquiry-email').value = currentUser.email || '';
    document.getElementById('inquiry-phone').value = currentUserProfile?.phone || '';
    document.getElementById('inquiry-location').value = currentUserProfile?.city || '';
    if (inquiryAddressInput) {inquiryAddressInput.value = currentUserProfile?.address || '';}
  }
  
  inquiryFormModal.setAttribute('aria-hidden', 'false');
}

function closeInquiryFormModal() {
  if (!inquiryFormModal) {return;}
  inquiryFormModal.setAttribute('aria-hidden', 'true');
  if (inquiryForm) {
    inquiryForm.reset();
  }
  if (inquiryPlanInput) {
    inquiryPlanInput.value = '';
  }
}

// Send inquiry to admin WhatsApp
async function sendInquiryToAdmin(formData) {
  const planNames = {
    structure: 'Structure Plan (₹849/sq.ft)',
    premium: 'Premium Plan (₹1,399/sq.ft)',
    royal: 'Royal Plan (₹1,500/sq.ft)',
    luxury: 'Luxury Plan (₹1,599/sq.ft)'
  };

  const planName = formData.plan ? planNames[formData.plan] : 'Custom Inquiry';
  const selectedPlan = formData.plan ? planDetails[formData.plan] : null;
  const planDetailsText = selectedPlan ? `

📋 *Selected Plan Details:*
Scope: ${selectedPlan.workScope.join('; ')}
Materials: ${selectedPlan.materials}
Timeline: ${selectedPlan.timeline}` : '';
  
  const message = `🏠 *NEW PROJECT INQUIRY*

👤 *Customer Details:*
Name: ${formData.fullName}
Phone: ${formData.phone}
Email: ${formData.email}
Location: ${formData.location}
Full Address: ${formData.address}

🏗️ *Project Details:*
Type: ${formData.projectType}
Plan: ${planName}
Floors: ${formData.floors}
Land Size: ${formData.plotSize} sq.ft
Budget: ${formData.budgetRange}

📝 *Additional Notes:*
${formData.specialRequirements || 'None'}
${planDetailsText}

---
Submitted: ${new Date().toLocaleString()}
User: ${currentUser ? currentUser.email : 'Guest'}`;

  // Open WhatsApp with the message
  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  
  // Also save to localStorage for admin dashboard
  saveInquiryToStorage(formData);
  
  return true;
}

function openPlanDetails(planKey) {
  const plan = planDetails[planKey];
  if (!plan || !planDetailsModal || !planModalContent) {return;}

  const scopeHTML = plan.workScope.map(item => `<li>${item}</li>`).join('');
  planModalContent.innerHTML = `
    <div class="plan-detail-box">
      <h3 style="color:${plan.color}">${plan.title}</h3>
      <div class="modal-price">${plan.price}</div>
      <div class="detail-section-title">Detailed Scope of Construction Work</div>
      <ul class="detail-list">${scopeHTML}</ul>
      <div class="detail-section-title">Key Brands & Materials Used</div>
      <p class="plan-detail-copy">${plan.materials}</p>
      <div class="detail-section-title">Estimated Project Timeline</div>
      <p class="plan-detail-copy">${plan.timeline}</p>
      <div class="plan-detail-actions">
        <button class="btn primary plan-inquiry-btn" type="button" data-plan="${planKey}" style="background:linear-gradient(135deg,#f8fafc,#aeb8c4 48%,#ffffff);color:#101820;box-shadow:0 0 12px rgba(226,232,240,.95),0 0 28px rgba(148,163,184,.75);border:1px solid #ffffff;text-shadow:0 0 8px rgba(255,255,255,.9);">Request This Plan on WhatsApp</button>
        <a class="btn secondary" href="tel:9399330188">Call Engineer</a>
      </div>
    </div>
  `;
  planModalContent.querySelector('.plan-inquiry-btn').addEventListener('click', () => {
    planDetailsModal.setAttribute('aria-hidden', 'true');
    openInquiryFormModal(planKey);
  });
  planDetailsModal.setAttribute('aria-hidden', 'false');
}

function initPlanDetailButtons() {
  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      openPlanDetails(btn.dataset.plan);
    });
  });
}

function initMobileNavigation() {
  const menuButton = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (!menuButton || !drawer || menuButton.dataset.mobileReady === 'true') {return;}
  menuButton.dataset.mobileReady = 'true';

  const heroOverlay = document.querySelector('.hero-animation-overlay');

  const closeMenu = () => {
    drawer.setAttribute('aria-hidden', 'true');
    overlay?.setAttribute('aria-hidden', 'true');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.classList.remove('active');
    document.body.style.overflow = '';
    if (heroOverlay) {heroOverlay.style.display = '';}
    
    // Close any open dropdowns
    drawer.querySelectorAll('.mobile-nav-dropdown[aria-expanded="true"]').forEach(dd => {
      dd.setAttribute('aria-expanded', 'false');
      const menu = dd.querySelector('.mobile-dropdown-menu');
      if (menu) {menu.classList.remove('active');}
    });
  };

  const openMenu = () => {
    drawer.setAttribute('aria-hidden', 'false');
    overlay?.setAttribute('aria-hidden', 'false');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (heroOverlay) {heroOverlay.style.display = 'none';}
  };

  menuButton.addEventListener('click', () => {
    const isOpen = drawer.getAttribute('aria-hidden') === 'false';
    if (isOpen) {
      closeMenu();
      return;
    }
    openMenu();
  });

  overlay?.addEventListener('click', closeMenu);
  drawer.querySelectorAll('a, button').forEach(link => {
    // Don't close menu when clicking dropdown toggle
    if (!link.classList.contains('mobile-dropdown-toggle')) {
      link.addEventListener('click', closeMenu);
    }
  });
}

// Desktop dropdown touch/click support
function initDesktopDropdown() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.nav-link');
    const menu = dropdown.querySelector('.nav-dropdown-menu');
    
    if (!toggle || !menu) return;
    
    // Click/touch handler for desktop
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth > 1024) {
        e.preventDefault();
        dropdown.classList.toggle('active');
      }
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('active');
      }
    });
  });
}

function saveInquiryToStorage(formData) {
  const inquiries = JSON.parse(localStorage.getItem('smba_inquiries') || '[]');
  const inquiry = {
    id: Date.now(),
    ...formData,
    userId: currentUser?.uid || 'guest',
    userEmail: currentUser?.email || 'guest',
    status: 'new',
    createdAt: new Date().toISOString()
  };
  inquiries.unshift(inquiry);
  localStorage.setItem('smba_inquiries', JSON.stringify(inquiries));
}

// All Plans Modal
function openAllPlansModal() {
  if (!planDetailsModal || !planModalContent) {return;}
  
  let allPlansHTML = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <h3 style="font-size: 1.5rem; color: var(--accent-gold); margin-bottom: 0.5rem;">All Construction Plans Overview</h3>
      <p style="color: var(--text-muted);">Compare all plans and choose the best fit for your dream home</p>
    </div>
  `;
  
  Object.entries(planDetails).forEach(([_key, plan]) => {
    const scopeHTML = plan.workScope.map(item => `<li>${item}</li>`).join('');
    allPlansHTML += `
      <div class="plan-detail-box" style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid var(--border-glass);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
          <h3 style="color: ${plan.color}; font-size: 1.25rem;">${plan.title}</h3>
          <div class="modal-price" style="font-size: 1.25rem; font-weight: 800; color: ${plan.color};">${plan.price}</div>
        </div>
        
        <div class="detail-section-title" style="font-weight: 700; color: var(--accent-gold); margin: 1rem 0 0.5rem;">🛠️ Scope of Work:</div>
        <ul class="detail-list" style="list-style-type: square; padding-left: 1.2rem; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
          ${scopeHTML}
        </ul>
        
        <div class="detail-section-title" style="font-weight: 700; color: var(--accent-gold); margin: 1rem 0 0.5rem;">🏗️ Key Materials:</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">${plan.materials}</p>
        
        <div class="detail-section-title" style="font-weight: 700; color: var(--accent-gold); margin: 1rem 0 0.5rem;">⏱️ Timeline:</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">${plan.timeline}</p>
        
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
          <a class="btn primary" href="https://wa.me/919399330188?text=I%20want%20to%20discuss%20the%20${encodeURIComponent(plan.title)}" target="_blank" style="font-size: 0.85rem; padding: 0.6rem 1.25rem;">Book on WhatsApp</a>
          <a class="btn secondary" href="tel:9399330188" style="font-size: 0.85rem; padding: 0.6rem 1.25rem;">Call Engineer</a>
        </div>
      </div>
    `;
  });
  
  allPlansHTML += `
    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-glass); text-align: center;">
      <p style="color: var(--text-muted); margin-bottom: 1rem;">Ready to start your project?</p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="https://wa.me/919399330188?text=Hello%20Shree%20Mahakal%20Associates%2C%20I%20want%20to%20discuss%20construction%20plans" target="_blank" class="btn primary glass-btn" style="padding: 0.85rem 2rem;">Discuss on WhatsApp</a>
        <a href="tel:+919399330188" class="btn secondary glass-btn" style="padding: 0.85rem 2rem;">Call Now</a>
      </div>
    </div>
  `;
  
  planModalContent.innerHTML = allPlansHTML;
  planDetailsModal.setAttribute('aria-hidden', 'false');
}

// Cafe Gallery Images
const CAFE_GALLERY_IMAGES = [
  'images/kitchen-image-1.webp',
  'assets/kitchen/g-shape-kitchen.webp',
  'assets/kitchen/kitchen-image-2.webp',
  'assets/kitchen/home-design.webp',
  'assets/kitchen/kitchen-img-1779.webp',
  'assets/kitchen/kitchen-17.avif'
];

console.log('Cafe Gallery Images:', CAFE_GALLERY_IMAGES);

// Cafe Gallery Modal
function openCafeGalleryModal() {
  const modal = document.getElementById('cafe-gallery-modal');
  if (modal) {
    populateCafeCarousel();
    initCafeGalleryCarousel(); // Re-initialize navigation after carousel rebuild
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function populateCafeCarousel() {
  const track = document.getElementById('cafe-carousel-track');
  const indicators = document.getElementById('cafe-carousel-indicators');
  const counter = document.getElementById('cafe-gallery-counter');
  
  if (!track || !indicators) {
    console.error('Missing carousel elements');
    return;
  }
  
  // Generate slides
  track.innerHTML = CAFE_GALLERY_IMAGES.map((src, index) => `
    <div class="carousel-slide" style="flex: 0 0 100%; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
      <img src="${src}" alt="Cafe Design ${index + 1}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="console.error('Failed to load:', this.src)" />
    </div>
  `).join('');

  // Generate indicators
  indicators.innerHTML = CAFE_GALLERY_IMAGES.map((_, index) => `
    <button class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}" style="width: 12px; height: 12px; border-radius: 50%; border: none; background: ${index === 0 ? 'var(--accent-gold)' : 'rgba(255,255,255,0.3)'}; cursor: pointer;"></button>
  `).join('');
  
  // Update counter
  if (counter) {
    counter.textContent = `1 / ${CAFE_GALLERY_IMAGES.length} Projects`;
  }
  
  // Re-attach indicator event listeners
  indicators.querySelectorAll('.carousel-indicator').forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      const carouselTrack = document.getElementById('cafe-carousel-track');
      if (carouselTrack) {
        carouselTrack.style.transform = `translateX(-${index * 100}%)`;
        updateCafeIndicators(index);
      }
    });
  });
}

function updateCafeIndicators(activeIndex) {
  const indicators = document.querySelectorAll('#cafe-carousel-indicators .carousel-indicator');
  const counter = document.getElementById('cafe-gallery-counter');
  const prevBtn = document.getElementById('cafe-carousel-prev');
  const nextBtn = document.getElementById('cafe-carousel-next');
  
  indicators.forEach((indicator, index) => {
    indicator.style.background = index === activeIndex ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.3)';
    indicator.classList.toggle('active', index === activeIndex);
  });
  
  if (counter) {
    counter.textContent = `${activeIndex + 1} / ${CAFE_GALLERY_IMAGES.length} Projects`;
  }
  
  if (prevBtn) {
    prevBtn.style.opacity = activeIndex === 0 ? '0.5' : '1';
    prevBtn.style.pointerEvents = activeIndex === 0 ? 'none' : 'auto';
  }
  
  if (nextBtn) {
    nextBtn.style.opacity = activeIndex === CAFE_GALLERY_IMAGES.length - 1 ? '0.5' : '1';
    nextBtn.style.pointerEvents = activeIndex === CAFE_GALLERY_IMAGES.length - 1 ? 'none' : 'auto';
  }
}

// expose globally for inline onclick
if (typeof window !== 'undefined') {window.openCafeGalleryModal = openCafeGalleryModal;}

function closeCafeGalleryModal() {
  const modal = document.getElementById('cafe-gallery-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Close cafe gallery modal on backdrop click
function initCafeGalleryBackdropClose() {
  const modal = document.getElementById('cafe-gallery-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      // Close when clicking on the modal container itself (backdrop area)
      // but not when clicking on the modal-panel or its children
      if (e.target === modal) {
        closeCafeGalleryModal();
      }
    });
  }
}

// Cafe Gallery Carousel
function initCafeGalleryCarousel() {
  const track = document.getElementById('cafe-carousel-track');
  const prevBtn = document.getElementById('cafe-carousel-prev');
  const nextBtn = document.getElementById('cafe-carousel-next');
  const counter = document.getElementById('cafe-gallery-counter');
  
  if (!track || !prevBtn || !nextBtn) {return;}
  
  // Clone buttons to remove existing event listeners
  const newPrevBtn = prevBtn.cloneNode(true);
  const newNextBtn = nextBtn.cloneNode(true);
  prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
  nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
  
  let currentIndex = 0;
  const totalSlides = CAFE_GALLERY_IMAGES.length;
  let initialized = false;
  
  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateCafeIndicators(currentIndex);
  }
  
  function goToSlide(index) {
    currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
    updateCarousel();
  }
  
  function nextSlide() {
    if (currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    }
  }
  
  function prevSlide() {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }
  
  function resetCarousel() {
    currentIndex = 0;
    updateCarousel();
  }
  
  // Event listeners (use cloned buttons)
  newPrevBtn.addEventListener('click', prevSlide);
  newNextBtn.addEventListener('click', nextSlide);
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('cafe-gallery-modal');
    if (modal && modal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'ArrowLeft') {prevSlide();}
      if (e.key === 'ArrowRight') {nextSlide();}
      if (e.key === 'Escape') {closeCafeGalleryModal();}
    }
  });
  
  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }
  
  // Use MutationObserver to detect when modal opens
  const modal = document.getElementById('cafe-gallery-modal');
  if (modal) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
          if (modal.getAttribute('aria-hidden') === 'false' && !initialized) {
            resetCarousel();
            initialized = true;
          } else if (modal.getAttribute('aria-hidden') === 'true') {
            initialized = false;
          }
        }
      });
    });
    
    observer.observe(modal, { attributes: true, attributeFilter: ['aria-hidden'] });
    
    // Also check initial state
    if (modal.getAttribute('aria-hidden') === 'false') {
      resetCarousel();
      initialized = true;
    }
  }
  
  // Initialize
  updateCarousel();
}

// Hotel Gallery Modal
function openHotelGalleryModal() {
  const modal = document.getElementById('hotel-gallery-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeHotelGalleryModal() {
  const modal = document.getElementById('hotel-gallery-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Close hotel gallery modal on backdrop click
function initHotelGalleryBackdropClose() {
  const modal = document.getElementById('hotel-gallery-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeHotelGalleryModal();
      }
    });
  }
}

// Residential Gallery Modal
function openResidentialGalleryModal() {
  const modal = document.getElementById('residential-gallery-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeResidentialGalleryModal() {
  const modal = document.getElementById('residential-gallery-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Close residential gallery modal on backdrop click
function initResidentialGalleryBackdropClose() {
  const modal = document.getElementById('residential-gallery-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeResidentialGalleryModal();
      }
    });
  }
}

// Exterior Gallery Modal
function openExteriorGalleryModal() {
  const modal = document.getElementById('exterior-gallery-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeExteriorGalleryModal() {
  const modal = document.getElementById('exterior-gallery-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Close exterior gallery modal on backdrop click
function initExteriorGalleryBackdropClose() {
  const modal = document.getElementById('exterior-gallery-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeExteriorGalleryModal();
      }
    });
  }
}

// Admin Panel
function openAdminPanel() {
  if (!currentUser || !isAdmin) {
    loginModal.dataset.trigger = 'admin';
    openLoginModal('admin-login');
    return;
  }
  
  adminPanelModal.setAttribute('aria-hidden', 'false');
  loadAdminDashboard();
}

function closeAdminPanel() {
  adminPanelModal.setAttribute('aria-hidden', 'true');
}
 
function loadAdminDashboard() {
  // Load admin dashboard data using dynamic imports
  Promise.all([
    import('../services/admin.js').then(m => m.adminGetAllBookings?.()),
    import('../services/admin.js').then(m => m.adminGetBookingsStats?.()),
    import('../services/admin.js').then(m => m.adminGetAllUsers?.())
  ]).then(([bookings, stats, users]) => {
  }).catch(err => console.error('Admin dashboard load error:', err));
}
 
// Close modals on outside click
[loginModal, requirementsModal, adminPanelModal, document.getElementById('cafe-gallery-modal')].forEach(modal => {
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.setAttribute('aria-hidden', 'true');
        if (modal.id === 'cafe-gallery-modal') {
          document.body.style.overflow = '';
        }
      }
    });
  }
});

// Login tab switching
document.querySelectorAll('.login-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    switchLoginTab(tab.dataset.tab);
  });
});

// Admin tab switching
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Form validation and submission
async function handleUserLogin(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('#user-email').value.trim().toLowerCase();
  const password = form.querySelector('#user-password').value;
  
  // Validate
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {return showNotification(emailValidation.message, 'error');}
  
  try {
    const { user, error } = await loginWithEmail(email, password);
    
    if (error) {
      showNotification(error, 'error');
    } else {
      showNotification(`Welcome back, ${user.displayName || 'User'}!`);
      closeLoginModal();
    }
  } catch (err) {
    showNotification('Login failed. Please try again.', 'error');
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('#admin-email').value.trim().toLowerCase();
  const password = form.querySelector('#admin-password').value;
  
  try {
    const { user: _user, error } = await loginWithEmail(email, password);
    
    if (error) {
      showNotification(error, 'error');
    } else {
      showNotification('Admin access granted!');
      closeLoginModal();
    }
  } catch (err) {
    showNotification('Admin login failed. Please try again.', 'error');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('#signup-name').value.trim();
  const email = form.querySelector('#signup-email').value.trim().toLowerCase();
  const phone = form.querySelector('#signup-phone').value.trim();
  const password = form.querySelector('#signup-password').value;
  const confirmPassword = form.querySelector('#signup-confirm-password').value;
  
  // Validate
  const nameValidation = validateName(name);
  if (!nameValidation.valid) {return showNotification(nameValidation.message, 'error');}
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {return showNotification(emailValidation.message, 'error');}
  
  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) {return showNotification(phoneValidation.message, 'error');}
  
  if (password.length < 6) {
    return showNotification('Password must be at least 6 characters', 'error');
  }
  
  if (password !== confirmPassword) {
    return showNotification('Passwords do not match', 'error');
  }
  
  try {
    const { user: _user, error } = await registerWithEmail(email, password, {
      name: nameValidation.cleaned,
      phone: phoneValidation.cleaned
    });
    
    if (error) {
      showNotification(error, 'error');
    } else {
      showNotification('Account created! Please check your email for verification.');
      closeLoginModal();
    }
  } catch (err) {
    showNotification('Registration failed. Please try again.', 'error');
  }
}

// Requirements form submission
async function handleRequirementsSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Handle checkboxes
  const checkboxGroups = ['style', 'services'];
  checkboxGroups.forEach(group => {
    const checkboxes = form.querySelectorAll(`input[name="${group}"]:checked`);
    data[group] = Array.from(checkboxes).map(cb => cb.value);
  });
  
  // Handle radio buttons
  ['projectType', 'vastu'].forEach(group => {
    const radio = form.querySelector(`input[name="${group}"]:checked`);
    if (radio) {data[group] = radio.value;}
  });
  
  // Validate form
  const validation = validateForm(data, bookingValidationRules);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    return showNotification(firstError, 'error');
  }
  
  // Validate files
  const files = form.querySelector('#reference-files')?.files;
  if (files && files.length > 0) {
    const fileValidation = validateFiles(files, { maxFiles: 5, maxSizeMB: 5 });
    if (!fileValidation.valid) {
      return showNotification(fileValidation.message, 'error');
    }
  }
  
  // Sanitize text inputs
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      data[key] = sanitizeText(data[key]);
    }
  });
  
  try {
    const { id, error } = await createBooking(data, currentUser.uid);
    
    if (error) {
      showNotification(error, 'error');
    } else {
      showNotification(`Booking submitted successfully! Your Booking ID: ${id}`);
      closeRequirementsModal();
    }
  } catch (err) {
    showNotification('Failed to submit booking. Please try again.', 'error');
  }
}

// Event Listeners Setup
function setupEventListeners() {
  initPlanDetailButtons();
  initMobileNavigation();
  initDesktopDropdown();

  // Login button
  loginBtn?.addEventListener('click', () => openLoginModal('user-login'));
  
  // Close modal buttons
  document.getElementById('login-modal-close')?.addEventListener('click', closeLoginModal);
  document.getElementById('requirements-modal-close')?.addEventListener('click', closeRequirementsModal);
  document.getElementById('admin-panel-close')?.addEventListener('click', closeAdminPanel);
  document.getElementById('cafe-gallery-close')?.addEventListener('click', closeCafeGalleryModal);
  document.getElementById('hotel-gallery-close')?.addEventListener('click', closeHotelGalleryModal);
  document.getElementById('residential-gallery-close')?.addEventListener('click', closeResidentialGalleryModal);
  document.getElementById('exterior-gallery-close')?.addEventListener('click', closeExteriorGalleryModal);
  
  // Cafe Design Card click
  document.getElementById('cafe-design')?.addEventListener('click', openCafeGalleryModal);
  // Cafe Gallery backdrop close
  initCafeGalleryBackdropClose();
  // Cafe Gallery carousel
  initCafeGalleryCarousel();
  
  // Hotel Design Card click
  const hotelCard = document.getElementById('hotel-resort');
  hotelCard?.addEventListener('click', () => {
    openHotelGalleryModal();
  });
  // Hotel Gallery backdrop close
  initHotelGalleryBackdropClose();
  
  // Residential Design Card click
  document.getElementById('residential-interiors')?.addEventListener('click', openResidentialGalleryModal);
  // Residential Gallery backdrop close
  initResidentialGalleryBackdropClose();
  
  // Exterior Design Card click
  document.getElementById('3d-exterior')?.addEventListener('click', openExteriorGalleryModal);
  // Exterior Gallery backdrop close
  initExteriorGalleryBackdropClose();
  
  // Inquiry Form Modal - Close buttons
  inquiryFormClose?.addEventListener('click', closeInquiryFormModal);
  inquiryFormCancel?.addEventListener('click', closeInquiryFormModal);
  
  // Close inquiry form modal on backdrop click
  if (inquiryFormModal) {
    inquiryFormModal.addEventListener('click', (e) => {
      if (e.target === inquiryFormModal) {
        closeInquiryFormModal();
      }
    });
  }
  
  // Inquiry Form submission
  inquiryForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(inquiryForm);
    const data = Object.fromEntries(formData.entries());
    
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'email', 'location', 'address', 'projectType', 'plotSize', 'budgetRange'];
    for (const field of requiredFields) {
      if (!data[field]) {
        showNotification(`Please fill in all required fields`, 'error');
        return;
      }
    }
    
    // Send to admin WhatsApp
    await sendInquiryToAdmin(data);
    
    showNotification('Inquiry sent successfully! We\'ll contact you soon.');
    closeInquiryFormModal();
  });
  
  // Login tab switching
  document.querySelectorAll('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => switchLoginTab(tab.dataset.tab));
  });
  
  // Admin tab switching
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
  
  // Form submissions
  document.getElementById('user-login-form')?.addEventListener('submit', handleUserLogin);
  document.getElementById('admin-login-form')?.addEventListener('submit', handleAdminLogin);
  document.getElementById('signup-form')?.addEventListener('submit', handleSignup);
  document.getElementById('requirements-form')?.addEventListener('submit', handleRequirementsSubmit);
  
  // Signup link
  document.getElementById('show-signup')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchLoginTab('signup');
  });
  
  // Forgot password
  document.getElementById('forgot-password')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt('Enter your email for password reset:');
    if (email) {
      try {
        const { error } = await resetPassword(email.trim());
        if (error) {showNotification(error, 'error');}
        else {showNotification('Password reset email sent!');}
      } catch {
        showNotification('Failed to send reset email', 'error');
      }
    }
  });
  
  // Close modals on outside click
  [loginModal, requirementsModal, adminPanelModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.setAttribute('aria-hidden', 'true');
        }
      });
    }
  });
  
  // Protected buttons
  callBtn?.addEventListener('click', (e) => {
    if (!currentUser) {
      e.preventDefault();
      loginModal.dataset.trigger = 'requirements';
      openLoginModal('user-login');
      showNotification('Please login to access contact details', 'info');
    }
  });
  
  // Explore Plans buttons
  document.querySelectorAll('a[href="#packages"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (!currentUser) {
        e.preventDefault();
        loginModal.dataset.trigger = 'requirements';
        openLoginModal('user-login');
        showNotification('Please login to view detailed plans', 'info');
      }
    });
  });
  
  planModalClose?.addEventListener('click', () => {
    planDetailsModal?.setAttribute('aria-hidden', 'true');
  });

  planDetailsModal?.addEventListener('click', (e) => {
    if (e.target === planDetailsModal) {
      planDetailsModal.setAttribute('aria-hidden', 'true');
    }
  });

  // Explore Our Plans button - scroll to packages section
  document.getElementById('explore-plans-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const packagesSection = document.getElementById('packages');
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Header scroll effect
function initHeaderScrollEffect() {
  const header = document.getElementById('site-header');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
}

// Hero stats counter animation
function initHeroStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  
  statNumbers.forEach(el => observer.observe(el));
}

function animateCounter(element, target) {
  const duration = 2000;
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.floor(eased * target);
    
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString();
    }
  }
  
  requestAnimationFrame(update);
}

// Cost Calculator
function initCostCalculator() {
  const calcArea = document.getElementById('calc-area');
  const calcPlan = document.getElementById('calc-plan');
  const calcDiscount = document.getElementById('calc-discount');
  const calcOutput = document.getElementById('calc-output');
  const calcRateDisplay = document.getElementById('calc-rate-display');
  const calcAreaDisplay = document.getElementById('calc-area-display');
  const calcBaseCost = document.getElementById('calc-base-cost');
  const calcDiscountAmount = document.getElementById('calc-discount-amount');

  if (!calcArea || !calcPlan || !calcDiscount || !calcOutput) {return;}

  function updateCalcOutput() {
    const area = Number(calcArea.value || 0);
    const rate = Number(calcPlan.value || 0);
    const apply = calcDiscount.checked;
    const baseCost = area * rate;
    const discount = apply ? baseCost * 0.025 : 0;
    const est = baseCost - discount;

    calcOutput.textContent = `₹${Math.round(est).toLocaleString('en-IN')}`;
    if (calcRateDisplay) {calcRateDisplay.textContent = `₹${rate.toLocaleString('en-IN')}`;}
    if (calcAreaDisplay) {calcAreaDisplay.textContent = area.toLocaleString('en-IN');}
    if (calcBaseCost) {calcBaseCost.textContent = `₹${Math.round(baseCost).toLocaleString('en-IN')}`;}
    if (calcDiscountAmount) {calcDiscountAmount.textContent = `-₹${Math.round(discount).toLocaleString('en-IN')}`;}
  }

  calcArea.addEventListener('input', updateCalcOutput);
  calcPlan.addEventListener('change', updateCalcOutput);
  calcDiscount.addEventListener('change', updateCalcOutput);
  updateCalcOutput();
}

// Scroll progress indicator
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollTop / docHeight;
    progressBar.style.transform = `scaleX(${scrollPercent})`;
  }, { passive: true });
}

// Expose initCostCalculator to global scope for testing
window.initCostCalculator = initCostCalculator;

// Initialize Cost Calculator (module loads after DOM, so call directly)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCostCalculator);
} else {
  initCostCalculator();
}

// Mobile dropdown toggle
function initMobileDropdown() {
  const dropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const dropdown = toggle.closest('.mobile-nav-dropdown');
      const menu = dropdown.querySelector('.mobile-dropdown-menu');
      const isOpen = dropdown.getAttribute('aria-expanded') === 'true';
      
      dropdown.setAttribute('aria-expanded', !isOpen);
      if (isOpen) {
        menu.classList.remove('active');
      } else {
        menu.classList.add('active');
      }
    });
  });
}

// Active section highlighting
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"], .mobile-nav-link[href^="#"]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { 
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0.1
  });
  
  sections.forEach(section => observer.observe(section));
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initContactButtons();
  initAuthListener();
  setupEventListeners();
  updateAuthUI();
  
  // Expose openInquiryFormModal to global scope for onclick handlers
  window.openInquiryFormModal = openInquiryFormModal;
  window.openCafeGalleryModal = openCafeGalleryModal;
  
  // Header scroll effect
  initHeaderScrollEffect();
  
  // Hero stats counter animation
  initHeroStatsCounter();
  
  // Scroll progress indicator
  initScrollProgress();
  
  // Initialize Cost Calculator
  initCostCalculator();
  
  // Mobile dropdown
  initMobileDropdown();
  
  // Active nav highlight
  initActiveNavHighlight();
  
  // Load saved draft if exists
  if (currentUser) {
    const draftKey = `smba_draft_${currentUser.uid}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      // Could auto-fill form here
    }
  }
});

export { openLoginModal, openRequirementsModal, openAdminPanel, openInquiryFormModal };