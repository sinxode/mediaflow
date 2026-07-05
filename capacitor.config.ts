import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zainussunna.mediaflow',
  appName: 'MediaFlow',
  webDir: 'dist',
  server: {
    url: 'https://mediaflow.zainussunnaacademy.com',
    cleartext: false
  }
};

export default config;
