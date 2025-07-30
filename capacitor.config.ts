import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.100b9ed16a4946d08ebf3abd42bd4950',
  appName: 'infra-scan-ar',
  webDir: 'dist',
  server: {
    url: 'https://100b9ed1-6a49-46d0-8ebf-3abd42bd4950.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    }
  }
};

export default config;