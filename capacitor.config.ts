import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zainussunna.mediaflow',
  appName: 'MediaFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
