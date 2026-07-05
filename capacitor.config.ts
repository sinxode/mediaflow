import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zainussunna.mediaflow',
  appName: 'MediaFlow',
  webDir: 'dist',
  server: {
    url: 'https://workflow.zainussunnaacademy.com',
    cleartext: true
  }
};

export default config;
