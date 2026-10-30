/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /* ------------------------------------------------------------------
         Typography
         ITC Serif Gothic (display) and Helvetica Neue (body) are licensed
         faces. They are named first, so a device that has them (or a
         self-hosted licensed copy, see globals.css) uses them, and every
         other device falls back to a clean system face instead of a blank.

         ITC Serif Gothic is a heavy, geometric gothic with flared terminals,
         not a bookish serif, so its fallback is a heavy sans (Avenir Next,
         Segoe UI, Roboto) and not Georgia. On Android that lands on Roboto
         at extra-bold, which keeps the weight and the width of the design.
         ------------------------------------------------------------------ */
      fontFamily: {
        display: [
          '"ITC Serif Gothic"',
          '"ITC Serif Gothic Std"',
          '"Serif Gothic"',
          '"Avenir Next"',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          '"Segoe UI"',
          'Roboto',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },

      /* Four display steps, far apart. A graded scale reads as mush. */
      fontSize: {
        'display-2xl': ['clamp(3.5rem, 13vw, 9rem)', { lineHeight: '0.9', letterSpacing: '-0.035em' }],
        'display-xl': ['clamp(2.25rem, 10vw, 5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.5rem, 3.2vw, 2.25rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        lead: ['clamp(1.125rem, 2.2vw, 1.375rem)', { lineHeight: '1.4' }],
      },

      /* ------------------------------------------------------------------
         Colour, sampled from the KitaKlaro mark and assigned by meaning.
         Colour lands on data and on a few fields; it never decorates chrome.
         ------------------------------------------------------------------ */
      colors: {
        ground: '#F2F1EE', // low-chroma stone, deliberately not cream
        paper: '#FFFFFF',
        sunk: '#E9E7E2',
        cream: '#FBF7EF', // text on the dark fields
        ink: {
          DEFAULT: '#191417',
          muted: '#5B554F', // 6.4:1 on ground
        },
        oxblood: {
          DEFAULT: '#5A1216', // the badge: the brand field and the lead number
          deep: '#3E0A0E',
          soft: '#F3E7E6',
        },
        gold: {
          DEFAULT: '#FDC33C', // the mark's gold: one loud field per screen
          ink: '#2A1D06',
        },
        periwinkle: {
          DEFAULT: '#574BA0', // utang and secondary data; holds 4.5:1 with white
          soft: '#ECEAF5',
        },
        leaf: '#0B764F', // money in
        vermilion: '#C23A17', // paubos only, never decoration
        amber: '#A86A05', // low stock; holds 4.5:1 on white
      },

      borderRadius: {
        card: '20px',
        panel: '28px',
      },

      keyframes: {
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'none' },
        },
        wave: {
          from: { transform: 'scaleY(0.25)' },
          to: { transform: 'scaleY(1)' },
        },
        ring: {
          '0%': { transform: 'scale(1)', opacity: '0.45' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        bar: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        caret: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },

      /* Continuous loops are CSS: transform and opacity only, off the main
         thread, which matters on a low-end phone. Framer Motion is kept for
         orchestrated sequences, gestures and scroll. */
      animation: {
        'rise-in': 'rise-in 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        wave: 'wave 0.9s ease-in-out infinite alternate',
        ring: 'ring 1.6s ease-out infinite',
        bar: 'bar 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        caret: 'caret 1s steps(1) infinite',
      },
    },
  },
  plugins: [],
};
