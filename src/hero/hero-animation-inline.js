// Hero Animation Configuration - Cinematic Auto-Play with Crossfade
const HERO_CONFIG = {
  frameCount: 10,
  frameDuration: 6000, // ms per frame (6 seconds per frame for cinematic feel)
  crossfadeDuration: 1500, // ms crossfade transition
  zoomDuration: 20000, // ms for subtle zoom/pan cycle
  framePath: 'hero_frames_10_high_quality/hero_frame_',
  frameExtension: '.jpg',
  framePadding: 2, // 01, 02, etc.
};

function generateFrameUrls(config) {
  const urls = [];
  for (let i = 0; i < config.frameCount; i++) {
    const frameNum = i + 1;
    const padded = frameNum.toString().padStart(config.framePadding, '0');
    urls.push(`${config.framePath}${padded}${config.frameExtension}`);
  }
  return urls;
}

const FRAME_URLS = generateFrameUrls(HERO_CONFIG);

function preloadFrames(urls, priorityCount = 15) {
  return new Promise((resolve) => {
    const images = [];
    let loadedCount = 0;
    const priorityUrls = urls.slice(0, Math.min(priorityCount, urls.length));
    const remainingUrls = urls.slice(priorityCount);
    
    function loadImage(url, index) {
      return new Promise((resolveImg) => {
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.onload = () => { loadedCount++; resolveImg({ img, index, url }); };
        img.onerror = () => { loadedCount++; const placeholder = new Image(); placeholder.src = urls[0]; resolveImg({ img: placeholder, index, url, error: true }); };
        img.src = url;
        return img;
      });
    }
    
    Promise.all(priorityUrls.map((url, i) => loadImage(url, i)))
      .then((results) => {
        results.forEach(({ img, index }) => { images[index] = img; });
        if (remainingUrls.length > 0) {
          Promise.all(remainingUrls.map((url, i) => loadImage(url, i + priorityCount)))
            .then((moreResults) => {
              moreResults.forEach(({ img, index }) => { images[priorityCount + index] = img; });
              resolve(images);
            });
        } else {
          resolve(images);
        }
      });
  });
}

class HeroAnimationController {
  constructor(containerSelector = '#hero-animation') {
    this.container = document.querySelector(containerSelector);
    this.visual = null;
    this.frameImg1 = null; // Current frame
    this.frameImg2 = null; // Next frame (for crossfade)
    this.posterImg = null;
    this.overlay = null;
    this.spacer = null;
    this.loader = null;
    this.scrollIndicator = null;
    this.frameImages = [];
    this.currentFrameIndex = 0;
    this.nextFrameIndex = 1;
    this.isAnimating = false;
    this.isLoaded = false;
    this.scrollProgress = 0;
    this.rafId = null;
    this.resizeTimeout = null;
    this.hasScrolled = false;
    this.crossfadeProgress = 0; // 0 to 1 during crossfade
    this.isCrossfading = false;
    this.lastFrameChangeTime = 0;
    this.zoomPhase = 0; // For Ken Burns effect
    this.init();
  }
  
  async init() {
    if (!this.container) { console.warn('Hero animation container not found'); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { this.handleReducedMotion(); return; }
    this.createElements();
    try {
      await this.preloadFrames();
      this.isLoaded = true;
      this.hideLoader();
      this.startCinematicLoop();
      this.bindScrollEvents();
      this.showInitialFrame();
      if (this.posterImg) { this.posterImg.classList.add('loaded'); }
    } catch (error) { console.error('Hero animation failed to load:', error); this.handleError(); }
  }
  
  createElements() {
    this.visual = document.createElement('div');
    this.visual.className = 'hero-animation-visual';
    this.visual.setAttribute('aria-hidden', 'true');
    
    // Poster image shown while frames load
    this.posterImg = document.createElement('img');
    this.posterImg.className = 'hero-animation-poster';
    this.posterImg.src = FRAME_URLS[0];
    this.posterImg.alt = 'Mahakal Building Associates - Architectural Animation';
    this.posterImg.loading = 'eager';
    this.posterImg.fetchPriority = 'high';
    
    // Two frame images for crossfade - both absolutely positioned
    this.frameImg1 = document.createElement('img');
    this.frameImg1.className = 'hero-animation-frame hero-frame-layer';
    this.frameImg1.src = FRAME_URLS[0];
    this.frameImg1.alt = '';
    this.frameImg1.ariaHidden = 'true';
    this.frameImg1.style.opacity = '0';
    this.frameImg1.loading = 'lazy';
    
    this.frameImg2 = document.createElement('img');
    this.frameImg2.className = 'hero-animation-frame hero-frame-layer';
    this.frameImg2.src = FRAME_URLS[1];
    this.frameImg2.alt = '';
    this.frameImg2.ariaHidden = 'true';
    this.frameImg2.style.opacity = '0';
    this.frameImg2.loading = 'lazy';
    
    // Create overlay with hero content
    this.overlay = document.createElement('div');
    this.overlay.className = 'hero-animation-overlay';
    this.overlay.innerHTML = `
      <div class="hero-content" style="max-width: 580px; width: 100%;">
        <div class="sub-badge">CIVIL ENGINEER • ARCHITECT • VASTU SPECIALIST</div>
        <h1 class="hero-title">BUILD YOUR<br>DREAM HOME<br>WITH UNMATCHED<br>QUALITY</h1>
        <p class="hero-supporting-text" style="font-size: 1.1rem; line-height: 1.6; color: rgba(240, 246, 252, 0.85); margin: 1.5rem 0; max-width: 480px;">From concept to creation — we design and build spaces that inspire generations.</p>
        <div class="offer-pill" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: linear-gradient(135deg, rgba(230, 57, 70, 0.2), rgba(230, 57, 70, 0.1)); border: 1px solid var(--accent-red); color: var(--accent-red); border-radius: 999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 2rem;">🏷️ <strong>2.5% DISCOUNT ON ANY PLAN</strong></div>
        <div class="hero-actions" style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
          <a class="btn primary" href="#packages" style="padding: 1rem 2rem; font-size: 1rem;">Explore Pricing Plans</a>
          <a class="btn whatsapp" href="https://wa.me/919399330188?text=Hello%20Shree%20Mahakal%20Associates%2C%20I%20want%20to%20avail%20the%202.5%25%20discount%20offer%20on%20construction%20plans" target="_blank" style="padding: 0.85rem 1.25rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); border-radius: 12px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); transition: var(--transition);" onmouseover="this.style.background='rgba(37, 211, 102, 0.15)'; this.style.borderColor='#25D366'; this.style.boxShadow='0 0 20px rgba(37, 211, 102, 0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='var(--border-glass)'; this.style.boxShadow='none'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z"/></svg>
            <span style="color: white; font-weight: 600; font-size: 0.95rem;">WhatsApp</span>
          </a>
        </div>
        <div class="hero-contact" style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
          <a class="btn contact-link" href="tel:+919399330188" style="display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.85rem 1.5rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); color: var(--text-main); border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: var(--transition);" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='var(--accent-gold)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='var(--border-glass)'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>Call: 9399330188</span>
          </a>
          <span class="location" style="display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.95rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>Rajnandgaon, Chhattisgarh</span>
          </span>
        </div>
      </div>
    `;
    
    this.spacer = document.createElement('div');
    this.spacer.className = 'hero-animation-spacer';
    
    this.scrollIndicator = document.createElement('div');
    this.scrollIndicator.className = 'hero-scroll-indicator';
    this.scrollIndicator.innerHTML = `
      <span class="scroll-text" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(240, 246, 252, 0.5); margin-bottom: 0.5rem; display: block;">Scroll to explore</span>
      <svg class="scroll-arrow" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(240, 246, 252, 0.6); animation: bounce 2s infinite;"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
    `;
    
    this.loader = document.createElement('div');
    this.loader.className = 'hero-animation-loader';
    this.loader.innerHTML = `
      <div class="spinner"></div>
      <span style="font-size: 0.9rem; font-weight: 600;">Loading Animation...</span>
    `;
    
    // Assemble visual: poster at bottom, then two frame layers, then overlay, then scroll indicator, then loader
    this.visual.appendChild(this.posterImg);
    this.visual.appendChild(this.frameImg1);
    this.visual.appendChild(this.frameImg2);
    this.visual.appendChild(this.overlay);
    this.visual.appendChild(this.scrollIndicator);
    this.visual.appendChild(this.loader);
    
    this.container.appendChild(this.visual);
    this.container.appendChild(this.spacer);
  }
  
  async preloadFrames() {
    this.frameImages = await preloadFrames(FRAME_URLS, Math.min(HERO_CONFIG.frameCount, 10));
  }
  
  hideLoader() {
    if (this.loader) {
      this.loader.style.opacity = '0';
      this.loader.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => { if (this.loader && this.loader.parentNode) {this.loader.parentNode.removeChild(this.loader);} }, 300);
    }
  }
  
  showInitialFrame() {
    // Show first frame immediately (frameImg1)
    if (this.frameImages[0] && !this.frameImages[0].error) {
      this.frameImg1.src = this.frameImages[0].src;
      this.frameImg1.style.opacity = '1';
      this.frameImg1.style.transition = 'opacity 0.3s ease-out';
    }
    // Pre-load second frame in frameImg2 (hidden)
    if (this.frameImages[1] && !this.frameImages[1].error) {
      this.frameImg2.src = this.frameImages[1].src;
      this.frameImg2.style.opacity = '0';
    }
    this.currentFrameIndex = 0;
    this.nextFrameIndex = 1;
    this.lastFrameChangeTime = performance.now();
  }
  
  startCinematicLoop() {
    if (this.isAnimating) {return;}
    this.isAnimating = true;
    
    const animate = (timestamp) => {
      if (!this.isAnimating) {return;}
      
      const elapsed = timestamp - this.lastFrameChangeTime;
      const frameDuration = HERO_CONFIG.frameDuration;
      const crossfadeDuration = HERO_CONFIG.crossfadeDuration;
      
      // Check if we're in crossfade phase
      if (elapsed >= frameDuration - crossfadeDuration && !this.isCrossfading) {
        // Start crossfade to next frame
        this.isCrossfading = true;
        this.crossfadeStartTime = timestamp;
        this.prepareNextFrame();
      }
      
      if (this.isCrossfading) {
        const crossfadeElapsed = timestamp - this.crossfadeStartTime;
        this.crossfadeProgress = Math.min(1, crossfadeElapsed / crossfadeDuration);
        
        // Apply crossfade
        this.applyCrossfade(this.crossfadeProgress);
        
        if (this.crossfadeProgress >= 1) {
          // Crossfade complete - swap frames
          this.completeCrossfade();
        }
      }
      
      // Update Ken Burns zoom/pan effect
      this.updateKenBurnsEffect(timestamp);
      
      this.rafId = requestAnimationFrame(animate);
    };
    
    this.rafId = requestAnimationFrame(animate);
  }
  
  prepareNextFrame() {
    // Load the next frame into frameImg2 (the hidden one)
    const frameCount = this.frameImages.length;
    this.nextFrameIndex = (this.currentFrameIndex + 1) % frameCount;
    
    if (this.frameImages[this.nextFrameIndex] && !this.frameImages[this.nextFrameIndex].error) {
      this.frameImg2.src = this.frameImages[this.nextFrameIndex].src;
      // frameImg2 starts at opacity 0, will fade in during crossfade
      this.frameImg2.style.opacity = '0';
    }
  }
  
  applyCrossfade(progress) {
    // Smooth easing for crossfade
    const easedProgress = this.easeInOutCubic(progress);
    
    // Fade out current frame (frameImg1), fade in next frame (frameImg2)
    this.frameImg1.style.opacity = (1 - easedProgress).toString();
    this.frameImg2.style.opacity = easedProgress.toString();
  }
  
  completeCrossfade() {
    // Swap the image elements: frameImg2 becomes the new frameImg1
    const temp = this.frameImg1;
    this.frameImg1 = this.frameImg2;
    this.frameImg2 = temp;
    
    // Update indices
    this.currentFrameIndex = this.nextFrameIndex;
    this.nextFrameIndex = (this.currentFrameIndex + 1) % this.frameImages.length;
    
    // Reset crossfade state
    this.isCrossfading = false;
    this.crossfadeProgress = 0;
    this.lastFrameChangeTime = performance.now();
    
    // Pre-load the next frame into the now-hidden frameImg2
    if (this.frameImages[this.nextFrameIndex] && !this.frameImages[this.nextFrameIndex].error) {
      this.frameImg2.src = this.frameImages[this.nextFrameIndex].src;
      this.frameImg2.style.opacity = '0';
    }
  }
  
  updateKenBurnsEffect(timestamp) {
    // Subtle zoom/pan cycle (Ken Burns effect)
    const zoomDuration = HERO_CONFIG.zoomDuration;
    const cycleProgress = (timestamp % zoomDuration) / zoomDuration;
    
    // Calculate zoom scale (1.0 to 1.08 - subtle zoom)
    const zoomScale = 1 + 0.08 * Math.sin(cycleProgress * Math.PI * 2);
    
    // Calculate pan offset (subtle movement)
    const panX = 2 * Math.sin(cycleProgress * Math.PI * 2 + Math.PI / 3); // -2% to 2%
    const panY = 1.5 * Math.cos(cycleProgress * Math.PI * 2 + Math.PI / 4); // -1.5% to 1.5%
    
    // Apply to both frame layers (they need to move together)
    const transform = `scale(${zoomScale}) translate(${panX}%, ${panY}%)`;
    
    this.frameImg1.style.transform = transform;
    this.frameImg2.style.transform = transform;
    this.posterImg.style.transform = transform;
  }
  
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  bindScrollEvents() {
    let ticking = false;
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { this.handleScroll(); ticking = false; }); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { clearTimeout(this.resizeTimeout); this.resizeTimeout = setTimeout(() => this.handleResize(), 150); }, { passive: true });
    this.handleScroll();
  }
  
  handleScroll() {
    if (!this.visual || !this.spacer) {return;}
    const spacerRect = this.spacer.getBoundingClientRect();
    const spacerTop = spacerRect.top;
    const scrollProgress = Math.max(0, Math.min(1, 1 - spacerTop / 700));
    this.scrollProgress = scrollProgress;
    
    if (this.scrollIndicator) {
      if (scrollProgress > 0.1 && scrollProgress < 0.95 && !this.hasScrolled) {
        this.scrollIndicator.style.opacity = '1';
      } else {
        this.scrollIndicator.style.opacity = '0';
      }
      if (scrollProgress > 0.15) { this.hasScrolled = true; this.scrollIndicator.style.opacity = '0'; }
    }
  }
  
  handleResize() { this.handleScroll(); }
  
  handleReducedMotion() {
    if (this.visual) { this.visual.style.position = 'relative'; this.visual.style.minHeight = '70vh'; }
    if (this.spacer) {this.spacer.style.display = 'none';}
    if (this.frameImg1) {this.frameImg1.style.display = 'none';}
    if (this.frameImg2) {this.frameImg2.style.display = 'none';}
    if (this.posterImg) { this.posterImg.style.opacity = '1'; this.posterImg.classList.remove('loaded'); }
    if (this.loader) {this.loader.style.display = 'none';}
    if (this.scrollIndicator) {this.scrollIndicator.style.display = 'none';}
  }
  
  handleError() {
    console.warn('Hero animation error - falling back to static poster');
    if (this.frameImg1) { this.frameImg1.style.display = 'none'; this.frameImg1.classList.add('error'); }
    if (this.frameImg2) { this.frameImg2.style.display = 'none'; this.frameImg2.classList.add('error'); }
    if (this.posterImg) { this.posterImg.style.opacity = '1'; this.posterImg.classList.add('error'); this.posterImg.classList.remove('loaded'); }
    if (this.loader) {this.loader.style.display = 'none';}
    if (this.spacer) {this.spacer.style.display = 'none';}
    if (this.scrollIndicator) {this.scrollIndicator.style.display = 'none';}
    if (this.visual) { this.visual.style.position = 'relative'; this.visual.style.minHeight = '70vh'; }
  }
  
  destroy() { 
    if (this.rafId) {cancelAnimationFrame(this.rafId);} 
    this.isAnimating = false; 
    window.removeEventListener('scroll', this.handleScroll); 
  }
}

function initHeroAnimation(containerSelector = '#hero-animation') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new HeroAnimationController(containerSelector));
  } else { new HeroAnimationController(containerSelector); }
}

window.HeroAnimationController = HeroAnimationController;
window.initHeroAnimation = initHeroAnimation;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initHeroAnimation('#hero-animation'));
} else { initHeroAnimation('#hero-animation'); }

// =============================================
// HEADER SCROLL BEHAVIOR
// =============================================

(function() {
  'use strict';
  
  const header = document.querySelector('.site-header');
  if (!header) {return;}
  
  let lastScrollY = window.scrollY;
  let ticking = false;
  const headerHeight = 80; // px
  const threshold = 50; // pixels to scroll before hiding
  const scrollThreshold = 10; // minimum scroll to trigger
  
  function updateHeader() {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    
    // At top of page - always show
    if (currentScrollY <= 0) {
      header.classList.remove('scrolled-down', 'scrolled-up');
      header.classList.add('at-top');
      lastScrollY = currentScrollY;
      return;
    }
    
    // Remove at-top class when scrolled
    header.classList.remove('at-top');
    
    // Check if scroll amount exceeds threshold
    if (Math.abs(delta) < scrollThreshold) {
      lastScrollY = currentScrollY;
      return;
    }
    
    // Scrolling down - hide header
    if (delta > 0 && currentScrollY > threshold) {
      header.classList.add('scrolled-down');
      header.classList.remove('scrolled-up');
    } 
    // Scrolling up - show header
    else if (delta < 0) {
      header.classList.add('scrolled-up');
      header.classList.remove('scrolled-down');
    }
    
    lastScrollY = currentScrollY;
  }
  
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  }
  
  // Add passive listener for performance
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Handle resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Re-evaluate on resize
      if (window.scrollY <= 0) {
        header.classList.remove('scrolled-down', 'scrolled-up');
        header.classList.add('at-top');
      }
    }, 150);
  }, { passive: true });
  
  // Initial check
  if (window.scrollY > 0) {
    header.classList.remove('at-top');
  } else {
    header.classList.add('at-top');
  }
})();