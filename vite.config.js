import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom HTML replacement plugin to inject absolute OG URLs at build time
const htmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      // Always use the public production domain to bypass Vercel SSO preview URL restrictions
      const host = 'https://mediaflow.zainussunnaacademy.com';
      
      return html
        .replace(/%OG_IMAGE_URL%/g, `${host}/og-image.jpg`)
        .replace(/%OG_URL%/g, host);
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), htmlPlugin()],
})
