import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        '@capacitor/core',
        'capacitor-native-biometric',
        '@capacitor/camera',
        '@capacitor/push-notifications',
        '@capacitor/share',
        '@capacitor/status-bar',
        '@capacitor/keyboard',
        '@capacitor/app',
        '@capacitor/network',
        '@capacitor/haptics',
        '@capacitor/background-task',
        '@capacitor-community/barcode-scanner'
      ]

    }
  }
}));

