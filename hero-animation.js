class HeroAnimationController {
  constructor() {
    this.container = document.getElementById('hero-animation');
    this.totalFrames = 55;
    this.framePath = 'hero_60_frames_4k/hero_frame_';
    this.frameExt = '.jpg';
    this.targetDuration = 500;
    this.frameDuration = this.targetDuration / this.totalFrames;
    this.currentFrame = 1;
    this.isPlaying = false;
    this.animationId = null;
    this.lastFrameTime = 0;
    this.header = document.querySelector('.site-header');
    this.heroContent = document.querySelector('.hero-content');
    this.img = null;
    this.loadedFrames = new Map();
    this.init();
  }

  async init() {
    if (!this.container) {
      console.error('Hero animation container not found');
      return;
    }

    this.hideHeaderAndContent();
    this.createSingleImageElement();
    this.startLoadingAndPlay();
  }

  async startLoadingAndPlay() {
    // Load frame 1 first, then start animation immediately
    const frame1Loaded = this.loadFrame(1);
    await frame1Loaded;
    this.img.src = this.loadedFrames.get(1);
    this.showFrames();
    this.playAnimation();

    // Load remaining frames in background (non-blocking)
    this.loadRemainingFrames();
  }

  loadFrame(i) {
    const frameNum = i.toString().padStart(2, '0');
    const src = `${this.framePath}${frameNum}${this.frameExt}`;
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.loading = 'eager';
      img.fetchPriority = i <= 5 ? 'high' : 'low';
      img.onload = () => {
        this.loadedFrames.set(i, src);
        resolve({ index: i, src });
      };
      img.onerror = () => {
        console.warn(`Failed to load frame: ${src}`);
        resolve({ index: i, src: null });
      };
    });
  }

  async loadRemainingFrames() {
    const batchSize = 5;
    for (let i = 2; i <= this.totalFrames; i += batchSize) {
      const batch = [];
      for (let j = i; j < i + batchSize && j <= this.totalFrames; j++) {
        batch.push(this.loadFrame(j));
      }
      await Promise.all(batch);
    }
    console.log(`Preloaded ${this.loadedFrames.size} frames`);
  }

  hideHeaderAndContent() {
    if (this.header) {
      this.header.style.opacity = '0';
      this.header.style.pointerEvents = 'none';
      this.header.style.transition = 'opacity 0ms';
    }
    if (this.heroContent) {
      this.heroContent.style.opacity = '0';
      this.heroContent.style.pointerEvents = 'none';
      this.heroContent.style.transition = 'opacity 0ms';
    }
  }

  showHeaderAndContent() {
    if (this.header) {
      this.header.style.opacity = '1';
      this.header.style.pointerEvents = 'auto';
      this.header.style.transition = 'opacity 0ms';
    }
    if (this.heroContent) {
      this.heroContent.style.opacity = '1';
      this.heroContent.style.pointerEvents = 'auto';
      this.heroContent.style.transition = 'opacity 0ms';
    }
  }

  createSingleImageElement() {
    this.container.innerHTML = '';

    this.img = document.createElement('img');
    this.img.className = 'hero-animation-frame';
    this.img.style.position = 'absolute';
    this.img.style.inset = '0';
    this.img.style.width = '100%';
    this.img.style.height = '100%';
    this.img.style.objectFit = 'cover';
    this.img.style.objectPosition = 'center';
    this.img.style.willChange = 'opacity';
    this.container.appendChild(this.img);

    const blendOverlay = document.createElement('div');
    blendOverlay.className = 'hero-animation-blend-overlay';
    this.container.appendChild(blendOverlay);

    const loader = document.createElement('div');
    loader.className = 'hero-animation-loader';
    loader.innerHTML = `
      <div class="spinner"></div>
      <span>Loading animation...</span>
    `;
    this.container.appendChild(loader);

    const spacer = document.createElement('div');
    spacer.className = 'hero-animation-spacer';
    this.container.appendChild(spacer);

    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'hero-scroll-indicator';
    scrollIndicator.innerHTML = `
      <span class="scroll-text">Scroll to explore</span>
      <svg class="scroll-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M19 12l-7 7-7-7"/>
      </svg>
    `;
    this.container.appendChild(scrollIndicator);
  }

  

  showFrames() {
    const loader = this.container.querySelector('.hero-animation-loader');
    if (loader) loader.style.opacity = '0';
  }

  playAnimation() {
    this.isPlaying = true;
    this.currentFrame = 1;
    this.lastFrameTime = performance.now();
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    this.animate(performance.now());
  }

  animate(currentTime) {
    if (!this.isPlaying) return;

    const elapsed = currentTime - this.lastFrameTime;

    if (elapsed >= this.frameDuration) {
      this.advanceFrame();
      this.lastFrameTime = currentTime;
    }

    if (this.currentFrame < this.totalFrames) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
    } else {
      this.onAnimationComplete();
    }
  }

  advanceFrame() {
    if (!this.img) return;

    this.currentFrame++;
    const src = this.loadedFrames.get(this.currentFrame);
    if (src) {
      this.img.src = src;
    }
  }

  onAnimationComplete() {
    this.isPlaying = false;

    const scrollIndicator = this.container.querySelector('.hero-scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.style.opacity = '1';
      scrollIndicator.style.pointerEvents = 'auto';
    }

    const spacer = this.container.querySelector('.hero-animation-spacer');
    if (spacer) {
      spacer.style.display = 'block';
    }

    document.body.style.overflow = '';
    document.body.style.touchAction = '';

    this.showHeaderAndContent();

    console.log('Hero animation completed');
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.isPlaying = false;
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    this.showHeaderAndContent();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('hero-animation')) {
    window.heroAnimation = new HeroAnimationController();
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeroAnimationController;
}