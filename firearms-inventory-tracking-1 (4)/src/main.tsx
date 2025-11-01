import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializePerformanceOptimizations } from './lib/performanceOptimization';
import { coreWebVitals } from './lib/coreWebVitals';
import { PWAAnalyticsService } from './services/analytics/PWAAnalyticsService';


// Initialize performance optimizations
initializePerformanceOptimizations();

// Log Core Web Vitals in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    const metrics = coreWebVitals.getMetrics();
    console.log('📊 Core Web Vitals:', metrics);
  }, 3000);
}

// Initialize PWA analytics tracking
PWAAnalyticsService.trackPageView();
window.addEventListener('online', () => PWAAnalyticsService.stopOfflineTracking());
window.addEventListener('offline', () => PWAAnalyticsService.startOfflineTracking());
setInterval(() => PWAAnalyticsService.trackEngagement(), 60000); // Track every minute

// Register service worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw-enhanced.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
