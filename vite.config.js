import { defineConfig, loadEnv } from 'vite';
import { cpSync, existsSync } from 'fs';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  const base = isProd ? '/Shree-Mahakal-associate-2/' : '/';
  
  return {
    base,
    root: '.',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        input: {
          main: 'index.html',
          login: 'login.html'
        }
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      }
    },
    server: {
      port: 3000,
      open: true,
      cors: true,
      headers: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://www.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.firebaseio.com https://firestore.googleapis.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com wss://*.firebaseio.com https://www.gstatic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    },
    resolve: {
      alias: {
        '@': '/src',
        '@services': '/src/services',
        '@utils': '/src/utils',
        '@config': '/src/config',
        '@app': '/src/app'
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID)
    },
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth', 'firebase/firestore']
    },
    plugins: [
      {
        name: 'copy-hero-frames',
        closeBundle() {
          const src = resolve(process.cwd(), 'hero_60_frames_4k');
          const dest = resolve(process.cwd(), 'dist/hero_60_frames_4k');
          if (existsSync(src)) cpSync(src, dest, { recursive: true, force: true });
          const heroSrc = resolve(process.cwd(), 'hero-animation.js');
          const heroDest = resolve(process.cwd(), 'dist/hero-animation.js');
          if (existsSync(heroSrc)) cpSync(heroSrc, heroDest, { force: true });
        }
      }
    ]
  };
});