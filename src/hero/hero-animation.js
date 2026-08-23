/**
 * Hero Scroll-Driven Animation Module
 * 
 * Controls a 112-frame cinematic animation driven by scroll position.
 * - 112 frames (0-111) - using frames 001-112 from the asset folder
 * - 600ms animation timeline
 * - 700px scroll distance
 * - Frame 0 at scroll 0, Frame 111 at scroll 700px
 * - Smooth bidirectional scrubbing
 * - Respects prefers-reduced-motion
 */

// Configuration
const HERO_CONFIG = {
  frameCount: 112,
  frameRange: { start: 0, end: 111 },
  animationDuration: 600, // ms
  scrollDistance: 700, // px
  framePath: 'assets/ezgif-7e4280c12405a3e2-jpg/ezgif-frame-',
  frameExtension: '.jpg',
  framePadding: 3, // zero-padding (001, 002, etc.)
  preloadBatchSize: 10, // frames to preload initially
  preloadPriorityFrames: 15, // high priority frames to load first
};

/**
 * Generate frame URLs in correct numerical order
 * Using frames 001-112 (112 frames total) from the 144 available
 */
function generateFrameUrls(config) {
  const urls = [];
  for (let i = 0; i < config.frameCount; i++) {
    const frameNum = i + 1; // 1-indexed files (001-112)
    const padded = frameNum.toString().padStart(config.framePadding, '0');
    urls.push(`${config.framePath}${padded}${config.frameExtension}`);
  }
  return urls;
}

const FRAME_URLS = generateFrameUrls(HERO_CONFIG);

/**
 * Calculate frame index from scroll progress
 * @param {number} scrollProgress - 0 to 1
 * @returns {number} frame index (0-111)
 */
function getFrameFromProgress(scrollProgress) {
  const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
  const frameIndex = Math.round(clampedProgress * (HERO_CONFIG.frameCount - 1));
  return Math.max(0, Math.min(HERO_CONFIG.frameCount - 1, frameIndex));
}

/**
 * Calculate scroll progress from frame index
 * @param {number} frameIndex - 0-111
 * @returns {number} scroll progress 0-1
 */
function getProgressFromFrame(frameIndex) {
  return frameIndex / (HERO_CONFIG.frameCount - 1);
}

/**
 * Preload images with priority
 * @param {string[]} urls - Frame URLs
 * @param {number} priorityCount - Number of high-priority frames
 * @returns {Promise<HTMLImageElement[]>}
 */
function preloadFrames(urls, priorityCount = 15) {
  return new Promise((resolve) => {
    const images = [];
    let loadedCount = 0;
    const totalFrames = urls.length;
    
    // Load priority frames first
    const priorityUrls = urls.slice(0, priorityCount);
    const remainingUrls = urls.slice(priorityCount);
    
    function loadImage(url, index) {
      return new Promise((resolveImg) => {
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.onload = () => {
          loadedCount++;
          resolveImg({ img, index, url });
        };
        img.onerror = () => {
          loadedCount++;
          // Create a placeholder on error
          const placeholder = new Image();
          placeholder.src = urls[0]; // fallback to first frame
          resolveImg({ img: placeholder, index, url, error: true });
        };
        img.src = url;
        return img;
      });
    }
    
    // Load priority frames
    Promise.all(priorityUrls.map((url, i) => loadImage(url, i)))
      .then((results) => {
        results.forEach(({ img, index }) => {
          images[index] = img;
        });
        
        // Load remaining frames in background
        const remainingPromises = remainingUrls.map((url, i) => 
          loadImage(url, i + priorityCount)
        );
        
        Promise.all(remainingPromises).then((moreResults) => {
          moreResults.forEach(({ img, index }) => {
            images[priorityCount + index] = img;
          });
          resolve(images);
        });
      });
  });
}

/**
 * Hero Animation Controller Class
 */
export class HeroAnimationController {
  constructor(containerSelector = '#hero-animation') {
    this.container = document.querySelector(containerSelector);
    this.visual = null;
    this.frameImg = null;
    this.posterImg = null;
    this.overlay = null;
    this.spacer = null;
    this.loader = null;
    this.scrollIndicator = null;
    this.frameImages = [];
    this.currentFrame = -1;
    this.targetFrame = 0;
    this.isAnimating = false;
    this.isLoaded = false;
    this.scrollProgress = 0;
    this.rafId = null;
    this.resizeTimeout = null;
    this.hasScrolled = false;
    
    this.init();
  }
  
  async init() {
    if (!this.container) {
      console.warn('Hero animation container not found');
      return;
    }
    
    // Check for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.handleReducedMotion();
      return;
    }
    
    // Create DOM elements
    this.createElements();
    
    // Preload frames
    try {
      await this.preloadFrames();
      this.isLoaded = true;
      this.hideLoader();
      this.startAnimationLoop();
      this.bindScrollEvents();
      
      // Initial frame
      this.updateFrame(0);
      
      // Mark poster as loaded
      if (this.posterImg) {
        this.posterImg.classList.add('loaded');
      }
    } catch (error) {
      console.error('Hero animation failed to load:', error);
      this.handleError();
    }
  }
  
  createElements() {
    // Create the animation visual container
    this.visual = document.createElement('div');
    this.visual.className = 'hero-animation-visual';
    this.visual.setAttribute('aria-hidden', 'true');
    
    // Poster image (first frame as fallback)
    this.posterImg = document.createElement('img');
    this.posterImg.className = 'hero-animation-poster';
    this.posterImg.src = FRAME_URLS[0];
    this.posterImg.alt = 'Mahakal Building Associates - Architectural Animation';
    this.posterImg.loading = 'eager';
    this.posterImg.fetchPriority = 'high';
    
    // Frame image (will be swapped during scroll)
    this.frameImg = document.createElement('img');
    this.frameImg.className = 'hero-animation-frame';
    this.frameImg.src = FRAME_URLS[0];
    this.frameImg.alt = '';
    this.frameImg.ariaHidden = 'true';
    this.frameImg.style.opacity = '0';
    this.frameImg.loading = 'lazy';
    
    // Content overlay - Hero content with proper layout
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
          <a class="btn whatsapp" href="https://wa.me/919399330188?text=Hello%20Shree%20Mahakal%20Associates%2C%20I%20want%20to%20avail%20the%202.5%25%20discount%20offer%20on%20construction%20plans" target="_blank" style="padding: 1rem 2rem; font-size: 1rem; display: inline-flex; align-items: center; gap: 0.5rem;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z"/></svg>
            WhatsApp
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
    
    // Spacer for scroll distance
    this.spacer = document.createElement('div');
    this.spacer.className = 'hero-animation-spacer';
    
    // Loader
    this.loader = document.createElement('div');
    this.loader.className = 'hero-animation-loader';
    this.loader.innerHTML = `
      <div class="spinner"></div>
      <span style="font-size: 0.9rem; font-weight: 600;">Loading Animation...</span>
    `;
    
    // Scroll indicator
    this.scrollIndicator = document.createElement('div');
    this.scrollIndicator.className = 'hero-scroll-indicator';
    this.scrollIndicator.innerHTML = `
      <span class="scroll-text" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(240,246,252,0.6); margin-bottom: 0.5rem; display: block;">Scroll to explore</span>
      <svg class="scroll-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(240,246,252,0.6); animation: bounce 2s infinite;"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
    `;
    
    // Loader
    this.loader = document.createElement('div');
    this.loader.className = 'hero-animation-loader';
    this.loader.innerHTML = `
      <div class="spinner"></div>
      <span style="font-size: 0.9rem; font-weight: 600;">Loading Animation...</span>
    `;
    
    // Assemble
    this.visual = document.createElement('div');
    this.visual.className = 'hero-animation-visual';
    this.visual.setAttribute('aria-hidden', 'true');
    
    // Poster image (first frame as fallback)
    this.posterImg = document.createElement('img');
    this.posterImg.className = 'hero-animation-poster';
    this.posterImg.src = FRAME_URLS[0];
    this.posterImg.alt = 'Mahakal Building Associates - Architectural Animation';
    this.posterImg.loading = 'eager';
    this.posterImg.fetchPriority = 'high';
    
    // Frame image (will be swapped during scroll)
    this.frameImg = document.createElement('img');
    this.frameImg.className = 'hero-animation-frame';
    this.frameImg.src = FRAME_URLS[0];
    this.frameImg.alt = '';
    this.frameImg.ariaHidden = 'true';
    this.frameImg.style.opacity = '0';
    this.frameImg.loading = 'lazy';
    
    // Spacer for scroll distance
    this.spacer = document.createElement('div');
    this.spacer.className = 'hero-animation-spacer';
    
    // Assemble visual
    this.visual.appendChild(this.posterImg);
    this.visual.appendChild(this.frameImg);
    this.visual.appendChild(this.overlay);
    this.visual.appendChild(this.scrollIndicator);
    this.visual.appendChild(this.loader);
    
    this.container.appendChild(this.visual);
    this.container.appendChild(this.spacer);
  }
  
  async preloadFrames() {
    this.frameImages = await preloadFrames(FRAME_URLS, HERO_CONFIG.preloadPriorityFrames);
  }
  
  hideLoader() {
    if (this.loader) {
      this.loader.style.opacity = '0';
      this.loader.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        if (this.loader && this.loader.parentNode) {
          this.loader.parentNode.removeChild(this.loader);
        }
      }, 300);
    }
  }
  
  startAnimationLoop() {
    if (this.isAnimating) { return; }
    this.isAnimating = true;
    
    const animate = () => {
      // Smooth frame transition
      if (this.currentFrame !== this.targetFrame) {
        const diff = this.targetFrame - this.currentFrame;
        // Smooth interpolation
        this.currentFrame += diff * 0.15;
        
        // Snap to target when close
        if (Math.abs(this.targetFrame - this.currentFrame) < 0.5) {
          this.currentFrame = this.targetFrame;
        }
        
        this.updateFrame(this.currentFrame);
      }
      
      this.rafId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  updateFrame(frameIndex) {
    if (!this.frameImg || !this.frameImages.length) { return; }
    
    const clampedIndex = Math.max(0, Math.min(this.frameImages.length - 1, Math.round(frameIndex)));
    
    if (this.frameImages[clampedIndex] && !this.frameImages[clampedIndex].error) {
      this.frameImg.src = this.frameImages[clampedIndex].src;
      this.frameImg.style.opacity = '1';
      
      // Hide poster once first frame is shown
      if (this.posterImg && !this.posterImg.classList.contains('loaded') && clampedIndex > 0) {
        this.posterImg.classList.add('loaded');
      }
    }
  }
  
  bindScrollEvents() {
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Handle resize
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 150);
    }, { passive: true });
    
    // Initial calculation
    this.handleScroll();
  }
  
  handleScroll() {
    if (!this.visual || !this.spacer) { return; }
    
    const spacerRect = this.spacer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calculate scroll progress based on spacer position relative to viewport
    const spacerTop = spacerRect.top;
    const scrollProgress = Math.max(0, Math.min(1, 1 - spacerTop / HERO_CONFIG.scrollDistance));
    
    this.scrollProgress = scrollProgress;
    this.targetFrame = getFrameFromProgress(scrollProgress);
    
    // Show/hide scroll indicator based on scroll progress
    if (this.scrollIndicator) {
      if (scrollProgress > 0.1 && scrollProgress < 0.95) {
        this.scrollIndicator.style.opacity = '1';
        this.scrollIndicator.style.pointerEvents = 'none';
      } else {
        this.scrollIndicator.style.opacity = '0';
      }
      
      // Hide indicator once user has scrolled
      if (scrollProgress > 0.15) {
        this.hasScrolled = true;
        this.scrollIndicator.style.opacity = '0';
      }
    }
  }
  
  handleResize() {
    // Recalculate on resize
    this.handleScroll();
  }
  
  handleReducedMotion() {
    // Show static poster, hide animation elements
    if (this.visual) {
      this.visual.style.position = 'relative';
      this.visual.style.minHeight = '70vh';
    }
    if (this.spacer) {
      this.spacer.style.display = 'none';
    }
    if (this.frameImg) {
      this.frameImg.style.display = 'none';
    }
    if (this.posterImg) {
      this.posterImg.style.opacity = '1';
      this.posterImg.classList.remove('loaded');
    }
    if (this.loader) {
      this.loader.style.display = 'none';
    }
    if (this.scrollIndicator) {
      this.scrollIndicator.style.display = 'none';
    }
  }
  
  handleError() {
    console.warn('Hero animation error - falling back to static poster');
    if (this.frameImg) {
      this.frameImg.style.display = 'none';
      this.frameImg.classList.add('error');
    }
    if (this.posterImg) {
      this.posterImg.style.opacity = '1';
      this.posterImg.classList.add('error');
      this.posterImg.classList.remove('loaded');
    }
    if (this.loader) {
      this.loader.style.display = 'none';
    }
    if (this.spacer) {
      this.spacer.style.display = 'none';
    }
    if (this.scrollIndicator) {
      this.scrollIndicator.style.display = 'none';
    }
    if (this.visual) {
      this.visual.style.position = 'relative';
      this.visual.style.minHeight = '70vh';
    }
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.isAnimating = false;
    window.removeEventListener('scroll', this.handleScroll);
  }
}

/**
 * Initialize hero animation when DOM is ready
 */
export function initHeroAnimation(containerSelector = '#hero-animation') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      return new HeroAnimationController(containerSelector);
    });
  } else {
    return new HeroAnimationController(containerSelector);
  }
}

// Export for global access
window.HeroAnimationController = HeroAnimationController;
window.initHeroAnimation = initHeroAnimation;

export default HeroAnimationController;