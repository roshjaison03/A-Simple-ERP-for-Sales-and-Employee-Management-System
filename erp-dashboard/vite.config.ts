import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Unocss from 'unocss/vite';

export default defineConfig({
  plugins: [react(), Unocss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: ['.trycloudflare.com'], // ✅ Add this line
  }
});



  // server: {
  //   host: '0.0.0.0',
  //   port: 5173, // optional
  //   allowedHosts: ['https://looks-matching-capitol-ricky.trycloudflare.com'],
  // },