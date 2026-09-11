/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#16a34a',
          dark: '#15803d',
          light: '#eafaf0',
          soft: '#f0fdf4',
        },
        ink: {
          DEFAULT: '#1f2937',
          muted: '#6b7280',
          subtle: '#9ca3af',
        },
        surface: {
          bg: '#f5f6f8',
          panel: '#ffffff',
          border: '#e7e9ec',
        },
        accent: {
          blue: '#2563eb',
          blueTint: '#dbeafe',
          amber: '#ea580c',
          amberTint: '#ffedd5',
          red: '#dc2626',
          redTint: '#fee2e2',
          purple: '#7c3aed',
          purpleTint: '#ede9fe',
          grayTint: '#f3f4f6',
        },
        cop: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        'panel': '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'modal': '0 20px 50px rgba(0, 0, 0, 0.18)',
      },
      borderRadius: {
        'panel': '10px',
      }
    },
  },
  plugins: [],
}
