import { vi } from 'vitest';

// Mock Capacitor plugins
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(),
    removeAllListeners: vi.fn(),
    getInfo: vi.fn(() => Promise.resolve({ version: '1.0.0', build: '1', id: 'test' })),
  },
}));

vi.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: vi.fn(() => Promise.resolve({ 
      dataUrl: 'data:image/png;base64,mock', 
      format: 'png',
      saved: false 
    })),
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: vi.fn(() => Promise.resolve({ uri: 'file://mock-uri' })),
    readFile: vi.fn(() => Promise.resolve({ data: 'mock-data' })),
    deleteFile: vi.fn(() => Promise.resolve()),
    mkdir: vi.fn(() => Promise.resolve()),
    readdir: vi.fn(() => Promise.resolve({ files: [] })),
  },
}));

vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(() => Promise.resolve()),
    notification: vi.fn(() => Promise.resolve()),
    vibrate: vi.fn(() => Promise.resolve()),
  },
}));
