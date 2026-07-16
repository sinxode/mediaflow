import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom HTML replacement plugin to inject absolute OG URLs at build time
const htmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      // VERCEL_URL is provided by Vercel deployments automatically
      const host = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : '';
      
      return html
        .replace(/%OG_IMAGE_URL%/g, host ? `${host}/og-image.jpg` : '/og-image.jpg')
        .replace(/%OG_URL%/g, host ? `${host}` : '/');
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), htmlPlugin()],
})
