// Advanced Performance Optimization Utilities

// Preload critical resources
export function preloadCriticalResources() {
  const criticalResources = [
    { href: '/manifest.json', as: 'manifest' },
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
    document.head.appendChild(link);
  });
}

// Prefetch next likely navigation
export function prefetchRoute(path: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
}

// Resource hints
export function addResourceHints() {
  const hints = [
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: true }
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.crossOrigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// Intersection Observer for lazy loading
export function createLazyLoader(callback: (entry: IntersectionObserverEntry) => void) {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) callback(entry);
      });
    },
    { rootMargin: '50px' }
  );
}

// Batch DOM updates
export function batchDOMUpdates(updates: (() => void)[]) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

// Optimize event listeners
export function optimizeEventListener(
  element: HTMLElement,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
) {
  const optimizedOptions = {
    passive: true,
    capture: false,
    ...options
  };
  element.addEventListener(event, handler, optimizedOptions);
  return () => element.removeEventListener(event, handler, optimizedOptions);
}

// Memory management
export function clearUnusedCaches() {
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('old') || name.includes('deprecated')) {
          caches.delete(name);
        }
      });
    });
  }
}

// Bundle size tracking
export interface BundleMetrics {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  cacheHitRate: number;
}

export async function getBundleMetrics(): Promise<BundleMetrics> {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  let jsSize = 0;
  let cssSize = 0;
  let imageSize = 0;
  let cached = 0;

  resources.forEach(resource => {
    const size = resource.transferSize || 0;
    if (resource.name.endsWith('.js')) jsSize += size;
    else if (resource.name.endsWith('.css')) cssSize += size;
    else if (resource.name.match(/\.(jpg|png|webp|svg)$/)) imageSize += size;
    if (resource.transferSize === 0 && resource.decodedBodySize > 0) cached++;
  });

  return {
    totalSize: jsSize + cssSize + imageSize,
    jsSize,
    cssSize,
    imageSize,
    cacheHitRate: resources.length > 0 ? (cached / resources.length) * 100 : 0
  };
}

// Initialize all optimizations
export function initializePerformanceOptimizations() {
  preloadCriticalResources();
  addResourceHints();
  
  // Clear old caches periodically
  setInterval(clearUnusedCaches, 3600000); // Every hour
}
