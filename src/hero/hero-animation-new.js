/**
 * Hero Cinematic Animation Module
 * 
 * Controls a 36-frame cinematic animation with auto-play intro and scroll-driven playback.
 * - 36 frames (0-35) - using hero_premium_frame_01_4k.jpg through hero_premium_frame_36_4k.jpg
 * - Auto-play cinematic intro (4-5 seconds) with scroll lock
 * - After intro: scroll-driven frame progression
 * - Smooth crossfade between frames using dual-layer technique
 * - Subtle Ken Burns effect (zoom/pan)
 * - Frame edges blend into background via gradient overlays
 * - Respects prefers-reduced-motion
 * - Responsive scroll distance based on viewport
 */

// Configuration
const HERO_CONFIG = {
  frameCount: 36,
  framePath: '/hero_frames/hero_premium_frame_',
  frameExtension: '_4k.jpg',
  framePadding: 2, // zero-padding (01, 02, etc.)
  
  // Intro animation (auto-play) - 1 second total for all 36 frames (faster)
  introDuration: 1000, // 1 second total
  introFrames: 36, // Play all frames during intro
  introHoldDuration: 0, // No hold, unlock immediately
  
  // Scroll-driven animation (after intro)
  // Total scroll distance for full 36-frame playback
  getScrollDistance() {
    const vh = window.innerHeight;
    // Use 3x viewport height for scroll distance after intro
    return Math.max(vh * 3, 1200);
  },
  
  // Crossfade duration as a percentage of scroll progress per frame
  crossfadeProgress: 0.035, // 3.5% of total scroll per crossfade
  
  // Ken Burns effect (subtle, only during intro)
  zoomRange: { min: 1.0, max: 1.02 }, // Very subtle zoom
  panRange: 0.01, // Minimal pan
  
  // Preloading
  preloadPriorityFrames: 18, // Load first 18 frames with high priority
};

/**
 * Generate frame URLs in correct numerical order
 * Using frames 01-20 (20 frames total)
 */
function generateFrameUrls(config) {
  const urls = [];
  for (let i = 0; i < config.frameCount; i++) {
    const frameNum = i + 1; // 1-indexed files (01-20)
    const padded = frameNum.toString().padStart(config.framePadding, '0');
    urls.push(`${config.framePath}${padded}${config.frameExtension}`);
  }
  return urls;
}

const FRAME_URLS = generateFrameUrls(HERO_CONFIG);

/**
 * Get the exact progress within a frame (for crossfade)
 * @param {number} scrollProgress - 0 to 1
 * @returns {object} { frameIndex, frameProgress }
 */
function getFrameProgress(scrollProgress) {
  const progressPerFrame = 1 / HERO_CONFIG.frameCount;
  const frameIndex = Math.floor(scrollProgress / progressPerFrame);
  const clampedFrameIndex = Math.max(0, Math.min(HERO_CONFIG.frameCount - 1, frameIndex));
  const frameStartProgress = clampedFrameIndex * progressPerFrame;
  const frameProgress = (scrollProgress - frameStartProgress) / progressPerFrame;
  return { frameIndex: clampedFrameIndex, frameProgress: Math.max(0, Math.min(1, frameProgress)) };
}

/**
 * Preload images with priority
 * @param {string[]} urls - Frame URLs
 * @param {number} priorityCount - Number of high-priority frames
 * @returns {Promise<HTMLImageElement[]>}
 */
function preloadFrames(urls, priorityCount = 8) {
  return new Promise((resolve) => {
    const images = [];
    
    // Load priority frames first
    const priorityUrls = urls.slice(0, Math.min(priorityCount, urls.length));
    const remainingUrls = urls.slice(priorityCount);
    
    function loadImage(url, index) {
      return new Promise((resolveImg) => {
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.onload = () => {
          resolveImg({ img, index, url });
        };
        img.onerror = () => {
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
        if (remainingUrls.length > 0) {
          const remainingPromises = remainingUrls.map((url, i) => 
            loadImage(url, i + priorityCount)
          );
          
          Promise.all(remainingPromises).then((moreResults) => {
            moreResults.forEach(({ img, index }) => {
              images[priorityCount + index] = img;
            });
            resolve(images);
          });
        } else {
          resolve(images);
        }
      });
  });
}

/**
 * Easing functions for smooth transitions
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Hero Animation Controller Class
 */
class HeroAnimationController {
  constructor(containerSelector = '#hero-animation') {
    this.container = document.querySelector(containerSelector);
    this.visual = null;
    this.frameImg1 = null; // Current frame layer
    this.frameImg2 = null; // Next frame layer (for crossfade)
    this.posterImg = null;
    this.overlay = null;
    this.spacer = null;
    this.loader = null;
    this.scrollIndicator = null;
    this.blendOverlay = null; // Gradient overlay for edge blending
    
    this.frameImages = [];
    this.currentFrameIndex = 0;
    this.nextFrameIndex = 1;
    this.isAnimating = false;
    this.isLoaded = false;
    this.scrollProgress = 0;
    this.rafId = null;
    this.resizeTimeout = null;
    this.hasScrolled = false;
    this.crossfadeProgress = 0;
    this.isCrossfading = false;
    this.lastScrollProgress = 0;
    
    // Ken Burns effect
    this.zoomPhase = 0;
    this.panPhaseX = 0;
    this.panPhaseY = 0;
    
    // Intro animation state
    this.introPlaying = false;
    this.introStartTime = 0;
    this.introComplete = false;
    this.scrollLocked = false;
    
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
      
      // Start cinematic intro immediately
      this.startCinematicIntro();
      
      // Initial frame
      this.updateFrame(0, 0);
      
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
    
    // Background blend overlay - softens edges to blend into page background
    this.blendOverlay = document.createElement('div');
    this.blendOverlay.className = 'hero-animation-blend-overlay';
    this.blendOverlay.setAttribute('aria-hidden', 'true');
    
    // Poster image (first frame as fallback)
    this.posterImg = document.createElement('img');
    this.posterImg.className = 'hero-animation-poster';
    this.posterImg.src = FRAME_URLS[0];
    this.posterImg.alt = 'Mahakal Building Associates - Architectural Animation';
    this.posterImg.loading = 'eager';
    this.posterImg.fetchPriority = 'high';
    
    // Frame image layer 1 (current frame)
    this.frameImg1 = document.createElement('img');
    this.frameImg1.className = 'hero-animation-frame hero-frame-layer';
    this.frameImg1.src = FRAME_URLS[0];
    this.frameImg1.alt = '';
    this.frameImg1.ariaHidden = 'true';
    this.frameImg1.style.opacity = '0';
    this.frameImg1.loading = 'lazy';
    
    // Frame image layer 2 (next frame for crossfade)
    this.frameImg2 = document.createElement('img');
    this.frameImg2.className = 'hero-animation-frame hero-frame-layer';
    this.frameImg2.src = FRAME_URLS[1];
    this.frameImg2.alt = '';
    this.frameImg2.ariaHidden = 'true';
    this.frameImg2.style.opacity = '0';
    this.frameImg2.loading = 'lazy';
    
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
    
    // Assemble visual - order matters for z-index
    // 1. Poster (bottom)
    // 2. Frame layers
    // 3. Blend overlay (edge blending)
    // 4. Scroll indicator
    // 5. Loader
    this.visual.appendChild(this.posterImg);
    this.visual.appendChild(this.frameImg1);
    this.visual.appendChild(this.frameImg2);
    this.visual.appendChild(this.blendOverlay);
    this.visual.appendChild(this.scrollIndicator);
    this.visual.appendChild(this.loader);
    
    // Spacer for scroll distance (used after intro)
    this.spacer = document.createElement('div');
    this.spacer.className = 'hero-animation-spacer';
    
    this.container.appendChild(this.visual);
    this.container.appendChild(this.spacer);
    
    // Initial spacer height
    this.updateSpacerHeight();
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
  
  updateSpacerHeight() {
    if (this.spacer) {
      const scrollDistance = HERO_CONFIG.getScrollDistance();
      this.spacer.style.height = `${scrollDistance}px`;
      // Also update CSS variable for any CSS-based calculations
      document.documentElement.style.setProperty('--hero-scroll-distance', `${scrollDistance}px`);
    }
  }
  
  /**
   * Start the cinematic intro animation with scroll lock
   */
  startCinematicIntro() {
    if (this.introPlaying) {return;}
    
    this.introPlaying = true;
    this.introStartTime = performance.now();
    this.introComplete = false;
    
    // Lock scroll during intro
    this.lockScroll();
    
    // Show first frame immediately
    this.updateFrame(0, 0);
    if (this.posterImg) {
      this.posterImg.classList.add('loaded');
    }
    
    const animateIntro = (timestamp) => {
      if (!this.introPlaying) {return;}
      
      const elapsed = timestamp - this.introStartTime;
      const progress = Math.min(elapsed / HERO_CONFIG.introDuration, 1);
      
      // Calculate frame index for intro (ease out for cinematic feel)
      const easedProgress = easeOutCubic(progress);
      const frameIndex = Math.min(Math.floor(easedProgress * HERO_CONFIG.introFrames), HERO_CONFIG.frameCount - 1);
      const frameProgress = (easedProgress * HERO_CONFIG.introFrames) % 1;
      
      this.currentFrameIndex = frameIndex;
      this.crossfadeProgress = frameProgress;
      this.renderFrame();
      
      // Update Ken Burns effect during intro
      this.updateKenBurns(timestamp);
      
      if (progress < 1) {
        this.rafId = requestAnimationFrame(animateIntro);
      } else {
        // Intro complete
        this.completeIntro();
      }
    };
    
    this.rafId = requestAnimationFrame(animateIntro);
  }
  
  completeIntro() {
    this.introPlaying = false;
    this.introComplete = true;
    
    // Stay on last frame (frame 35 = 36th frame)
    this.currentFrameIndex = HERO_CONFIG.frameCount - 1;
    this.crossfadeProgress = 0;
    this.renderFrame();
    
    // Unlock scroll immediately
    this.unlockScroll();
    
    // Animate hero title text
    this.animateHeroTitle();
    
    // Hide scroll indicator
    if (this.scrollIndicator) {
      this.scrollIndicator.style.opacity = '0';
    }
    
    // Update spacer height for scroll-driven mode
    this.updateSpacerHeight();
    
    // Start scroll-driven animation loop
    this.startScrollDrivenLoop();
  }
  
  lockScroll() {
    if (this.scrollLocked) {return;}
    this.scrollLocked = true;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
  }
  
  unlockScroll() {
    if (!this.scrollLocked) {return;}
    const scrollY = Math.abs(parseInt(document.body.style.top || '0', 10));
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
    this.scrollLocked = false;
  }
  
  startScrollDrivenLoop() {
    if (this.isAnimating) {return;}
    this.isAnimating = true;
    
    const animate = (timestamp) => {
      if (!this.isAnimating) {return;}
      
      // Update Ken Burns effect (subtle)
      this.updateKenBurns(timestamp);
      
      // Smooth frame transition based on scroll progress
      this.updateFrameFromScroll();
      
      this.rafId = requestAnimationFrame(animate);
    };
    
    this.rafId = requestAnimationFrame(animate);
  }
  
  updateKenBurns(timestamp) {
    // Subtle continuous zoom and pan (Ken Burns effect)
    // Uses time-based animation independent of scroll
    const time = timestamp * 0.00008; // Very slow animation
    
    // Zoom oscillates between min and max
    const zoomProgress = (Math.sin(time * 0.5) + 1) / 2; // 0 to 1
    const zoom = HERO_CONFIG.zoomRange.min + (HERO_CONFIG.zoomRange.max - HERO_CONFIG.zoomRange.min) * zoomProgress;
    
    // Pan in subtle figure-8 pattern
    const panX = Math.sin(time * 0.7) * HERO_CONFIG.panRange * 100; // percentage
    const panY = Math.cos(time * 0.5) * HERO_CONFIG.panRange * 100; // percentage
    
    // Apply to both frame layers
    const transform = `scale(${zoom}) translate(${panX}%, ${panY}%)`;
    
    if (this.frameImg1) {
      this.frameImg1.style.transform = transform;
    }
    if (this.frameImg2) {
      this.frameImg2.style.transform = transform;
    }
    if (this.posterImg) {
      this.posterImg.style.transform = transform;
    }
  }
  
  updateFrameFromScroll() {
    if (!this.introComplete) {return;}
    
    const { frameIndex, frameProgress } = getFrameProgress(this.scrollProgress);
    
    this.currentFrameIndex = frameIndex;
    this.crossfadeProgress = frameProgress;
    this.renderFrame();
  }
  
  animateHeroTitle() {
    const titleEl = document.querySelector('.hero-title');
    if (!titleEl) return;
    // Prevent re-running
    if (titleEl.dataset.animated === 'true') return;
    titleEl.dataset.animated = 'true';
    
    // Desired words in order with direction and highlight flag
    const words = [
      { text: 'Building', dir: 'left', highlight: false },
      { text: 'Dreams,', dir: 'top', highlight: false },
      { text: 'Crafting', dir: 'bottom', highlight: true },
      { text: 'Legacies', dir: 'right', highlight: true }
    ];
    
    // Build spans
    const spans = words.map((w, i) => {
      const span = document.createElement('span');
      span.className = 'hero-word';
      span.textContent = w.text + (i < words.length - 1 ? ' ' : '');
      span.style.opacity = '0';
      span.style.filter = 'blur(5px)';
      span.style.transition = 'opacity 0.9s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.9s cubic-bezier(0.25,0.46,0.45,0.94)';
      // Initial transforms
      let tx = 0, ty = 0;
      if (w.dir === 'left') tx = -40;
      else if (w.dir === 'right') tx = 40;
      else if (w.dir === 'top') ty = -30;
      else if (w.dir === 'bottom') ty = 30;
      span.style.transform = `translate(${tx}px, ${ty}px)`;
      if (w.highlight) span.classList.add('hero-highlight');
      return span;
    });
    
    // Replace title content with spans
    titleEl.innerHTML = '';
    spans.forEach(s => titleEl.appendChild(s));
    
    // Force reflow then animate
    requestAnimationFrame(() => {
      spans.forEach((span, i) => {
        const delay = 100 + i * 150; // 100ms pause then stagger ~150ms
        setTimeout(() => {
          span.style.opacity = '1';
          span.style.transform = 'translate(0,0)';
          span.style.filter = 'blur(0)';
        }, delay);
      });
    });
  }
  
  renderFrame() {
    if (!this.frameImg1 || !this.frameImg2 || !this.frameImages.length) {return;}
    
    const currentIdx = this.currentFrameIndex;
    const nextIdx = Math.min(currentIdx + 1, HERO_CONFIG.frameCount - 1);
    const crossfade = this.crossfadeProgress;
    
    // Apply smooth easing to crossfade
    const easedCrossfade = easeInOutCubic(crossfade);
    
    // Current frame (fading out during crossfade)
    if (this.frameImages[currentIdx] && !this.frameImages[currentIdx].error) {
      this.frameImg1.src = this.frameImages[currentIdx].src;
      this.frameImg1.style.opacity = (1 - easedCrossfade).toString();
    }
    
    // Next frame (fading in during crossfade)
    if (this.frameImages[nextIdx] && !this.frameImages[nextIdx].error) {
      this.frameImg2.src = this.frameImages[nextIdx].src;
      this.frameImg2.style.opacity = easedCrossfade.toString();
    }
    
    // Hide poster once we're past the first frame
    if (this.posterImg && !this.posterImg.classList.contains('loaded') && currentIdx > 0) {
      this.posterImg.classList.add('loaded');
    }
  }
  
  // For direct frame updates (used for initial load)
  updateFrame(frameIndex, crossfade = 0) {
    this.currentFrameIndex = frameIndex;
    this.crossfadeProgress = crossfade;
    this.renderFrame();
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
    if (this.frameImg1) {
      this.frameImg1.style.display = 'none';
    }
    if (this.frameImg2) {
      this.frameImg2.style.display = 'none';
    }
    if (this.blendOverlay) {
      this.blendOverlay.style.display = 'none';
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
    if (this.frameImg1) {
      this.frameImg1.style.display = 'none';
      this.frameImg1.classList.add('error');
    }
    if (this.frameImg2) {
      this.frameImg2.style.display = 'none';
      this.frameImg2.classList.add('error');
    }
    if (this.blendOverlay) {
      this.blendOverlay.style.display = 'none';
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
    // Unlock scroll if locked
    this.unlockScroll();
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.isAnimating = false;
    this.introPlaying = false;
    this.unlockScroll();
    window.removeEventListener('scroll', this.handleScroll);
  }
}

/**
 * Initialize hero animation when DOM is ready
 */
function initHeroAnimation(containerSelector = '#hero-animation') {
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

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHeroAnimation('#hero-animation');
  });
} else {
  initHeroAnimation('#hero-animation');
}

/*
  createElements() {
    // Create the animation visual container
    this.visual = document.createElement('div');
    this.visual.className = 'hero-animation-visual';
    this.visual.setAttribute('aria-hidden', 'true');
    
    // Background blend overlay - creates soft edges that blend into page background
    this.blendOverlay = document.createElement('div');
    this.blendOverlay.className = 'hero-animation-blend-overlay';
    this.blendOverlay.setAttribute('aria-hidden', 'true');
    
    // Poster image (first frame as fallback)
    this.posterImg = document.createElement('img');
    this.posterImg.className = 'hero-animation-poster';
    this.posterImg.src = FRAME_URLS[0];
    this.posterImg.alt = 'Mahakal Building Associates - Architectural Animation';
    this.posterImg.loading = 'eager';
    this.posterImg.fetchPriority = 'high';
    
    // Frame image layer 1 (current frame)
    this.frameImg1 = document.createElement('img');
    this.frameImg1.className = 'hero-animation-frame hero-frame-layer';
    this.frameImg1.src = FRAME_URLS[0];
    this.frameImg1.alt = '';
    this.frameImg1.ariaHidden = 'true';
    this.frameImg1.style.opacity = '0';
    this.frameImg1.loading = 'lazy';
    
    // Frame image layer 2 (next frame for crossfade)
    this.frameImg2 = document.createElement('img');
    this.frameImg2.className = 'hero-animation-frame hero-frame-layer';
    this.frameImg2.src = FRAME_URLS[1];
    this.frameImg2.alt = '';
    this.frameImg2.ariaHidden = 'true';
    this.frameImg2.style.opacity = '0';
    this.frameImg2.loading = 'lazy';
    
    // Content overlay - DISABLED: Using HTML .hero-content instead to avoid duplicate CTAs
    // this.overlay = document.createElement('div');
    // this.overlay.className = 'hero-animation-overlay';
    // this.overlay.innerHTML = `...`;
    
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
    
    // Assemble visual - order matters for z-index
    // 1. Poster (bottom)
    // 2. Frame layers
    // 3. Blend overlay (soft edges)
    // 4. Scroll indicator
    // 5. Loader
    // NOTE: Using HTML .hero-content instead of JS overlay to avoid duplicate CTAs
    this.visual.appendChild(this.posterImg);
    this.visual.appendChild(this.frameImg1);
    this.visual.appendChild(this.frameImg2);
    this.visual.appendChild(this.blendOverlay);
    this.visual.appendChild(this.scrollIndicator);
    this.visual.appendChild(this.loader);
    
    this.container.appendChild(this.visual);
    this.container.appendChild(this.spacer);
    
    // Initial spacer height
    this.updateSpacerHeight();
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
  
  
  
  updateKenBurns(timestamp) {
    // Subtle continuous zoom and pan (Ken Burns effect)
    // Uses time-based animation independent of scroll
    const time = timestamp * 0.0001; // Slow animation
    
    // Zoom oscillates between min and max
    const zoomProgress = (Math.sin(time * 0.5) + 1) / 2; // 0 to 1
    const zoom = HERO_CONFIG.zoomRange.min + (HERO_CONFIG.zoomRange.max - HERO_CONFIG.zoomRange.min) * zoomProgress;
    
    // Pan in subtle figure-8 pattern
    const panX = Math.sin(time * 0.7) * HERO_CONFIG.panRange * 100; // percentage
    const panY = Math.cos(time * 0.5) * HERO_CONFIG.panRange * 100; // percentage
    
    // Apply to both frame layers
    const transform = `scale(${zoom}) translate(${panX}%, ${panY}%)`;
    
    if (this.frameImg1) {
      this.frameImg1.style.transform = transform;
    }
    if (this.frameImg2) {
      this.frameImg2.style.transform = transform;
    }
    if (this.posterImg) {
      this.posterImg.style.transform = transform;
    }
  }
  
  updateFrameFromScroll() {
    // Calculate target frame and crossfade progress from scroll
    const { frameIndex, frameProgress } = getFrameProgress(this.scrollProgress);
    
    this.targetFrameIndex = frameIndex;
    this.crossfadeProgress = frameProgress;
    
    // Smooth interpolation for frame index
    if (this.currentFrameIndex !== this.targetFrameIndex) {
      // We're transitioning between frames
      this.currentFrameIndex = this.targetFrameIndex;
    }
    
    this.renderFrame();
  }
  
  renderFrame() {
    if (!this.frameImg1 || !this.frameImg2 || !this.frameImages.length) return;
    
    const currentIdx = this.currentFrameIndex;
    const nextIdx = Math.min(currentIdx + 1, HERO_CONFIG.frameCount - 1);
    const crossfade = this.crossfadeProgress;
    
    // Apply smooth easing to crossfade
    const easedCrossfade = easeInOutCubic(crossfade);
    
    // Current frame (fading out during crossfade)
    if (this.frameImages[currentIdx] && !this.frameImages[currentIdx].error) {
      this.frameImg1.src = this.frameImages[currentIdx].src;
      this.frameImg1.style.opacity = (1 - easedCrossfade).toString();
    }
    
    // Next frame (fading in during crossfade)
    if (this.frameImages[nextIdx] && !this.frameImages[nextIdx].error) {
      this.frameImg2.src = this.frameImages[nextIdx].src;
      this.frameImg2.style.opacity = easedCrossfade.toString();
    }
    
    // Hide poster once we're past the first frame
    if (this.posterImg && !this.posterImg.classList.contains('loaded') && currentIdx > 0) {
      this.posterImg.classList.add('loaded');
    }
  }
  
  // For direct frame updates (used for initial load)
  updateFrame(frameIndex, crossfade = 0) {
    this.currentFrameIndex = frameIndex;
    this.crossfadeProgress = crossfade;
    this.renderFrame();
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
    if (!this.visual || !this.spacer) return;
    
    const spacerRect = this.spacer.getBoundingClientRect();
    const scrollDistance = HERO_CONFIG.getScrollDistance();
    const viewportHeight = window.innerHeight;
    
    // Calculate scroll progress based on spacer position
    // When spacer top is at viewport bottom (initial position), progress = 0
    // When spacer top reaches viewport top, progress = 1
    // spacerTop goes from viewportHeight to 0 as user scrolls
    const spacerTop = spacerRect.top;
    const initialSpacerTop = viewportHeight; // Spacer starts below viewport
    const spacerTravel = initialSpacerTop - spacerTop; // How far spacer has moved up
    const scrollProgress = Math.max(0, Math.min(1, spacerTravel / scrollDistance));
    
    this.scrollProgress = scrollProgress;
    this.lastScrollProgress = scrollProgress;
    
    // Show/hide scroll indicator based on scroll progress
    if (this.scrollIndicator) {
      if (scrollProgress > 0.05 && scrollProgress < 0.95 && !this.hasScrolled) {
        this.scrollIndicator.style.opacity = '1';
        this.scrollIndicator.style.pointerEvents = 'none';
      } else {
        this.scrollIndicator.style.opacity = '0';
      }
      
      // Hide indicator once user has scrolled enough
      if (scrollProgress > 0.1) {
        this.hasScrolled = true;
        this.scrollIndicator.style.opacity = '0';
      }
    }
  }
  
  handleResize() {
    // Recalculate spacer height on resize
    this.updateSpacerHeight();
    // Recalculate scroll position
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
    if (this.frameImg1) {
      this.frameImg1.style.display = 'none';
    }
    if (this.frameImg2) {
      this.frameImg2.style.display = 'none';
    }
    if (this.blendOverlay) {
      this.blendOverlay.style.display = 'none';
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
    if (this.frameImg1) {
      this.frameImg1.style.display = 'none';
      this.frameImg1.classList.add('error');
    }
    if (this.frameImg2) {
      this.frameImg2.style.display = 'none';
      this.frameImg2.classList.add('error');
    }
    if (this.blendOverlay) {
      this.blendOverlay.style.display = 'none';
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
 * /
function initHeroAnimation(containerSelector = '#hero-animation') {
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

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHeroAnimation('#hero-animation');
  });
} else {
  initHeroAnimation('#hero-animation');
}

*/

// Header scroll behavior - hide on scroll down, show on scroll up
(function() {
  'use strict';
  
  const header = document.querySelector('.site-header');
  if (!header) {return;}
  
  let lastScrollY = window.scrollY;
  let ticking = false;
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
  
  // Initial state
  if (window.scrollY <= 0) {
    header.classList.add('at-top');
  }
})();