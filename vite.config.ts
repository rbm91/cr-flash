import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || 'https://skarlvpenwoasndirhqh.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXJsdnBlbndvYXNuZGlyaHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NjQ1ODAsImV4cCI6MjA4NDE0MDU4MH0.oIAx6xBlha5gPlnpQXz5U6qqd3lSh07shlBEMeT3Rlo'),
  },
});
