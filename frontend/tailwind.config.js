/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        appBg: '#FFFFFF',
        appSoft: '#F8F6F1',
        appText: '#0F172A',
        appMuted: '#64748B',
        appAccent: '#16A34A',
        appAccentAlt: '#2563EB',
        appBorder: '#E5E7EB',
        appWarn: '#F59E0B',
        appError: '#EF4444',
      },
      boxShadow: {
        app: '0 18px 44px rgba(15, 23, 42, 0.1)',
        soft: '0 10px 24px rgba(15, 23, 42, 0.07)',
      },
      borderRadius: {
        card: '1.5rem',
      },
      spacing: {
        safe: 'max(1rem, env(safe-area-inset-bottom))',
      },
      screens: {
        phone: '390px',
      },
    },
  },
  plugins: [],
}
