/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ground: v('ground'),
        card: v('card'),
        sunken: v('card-sunken'),
        line: v('line'),
        'line-strong': v('line-strong'),
        ink: v('ink'),
        'ink-2': v('ink-secondary'),
        'ink-3': v('ink-subtle'),
        muted: v('ink-muted'),
        lime: v('lime'),
        mint: v('mint'),
        'on-accent': v('on-accent'),
        'mint-ink': v('mint-ink'),
        recovery: { DEFAULT: v('recovery'), soft: v('recovery-soft'), ink: v('recovery-ink') },
        sleep: { DEFAULT: v('sleep'), deep: v('sleep-deep'), light: v('sleep-light'), soft: v('sleep-soft'), ink: v('sleep-ink') },
        activity: { DEFAULT: v('activity'), light: v('activity-light'), soft: v('activity-soft'), ink: v('activity-ink') },
        danger: { DEFAULT: v('danger'), soft: v('danger-soft') },
      },
      fontFamily: {
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sm: '10px', md: '16px', lg: '24px', xl: '32px' },
    },
  },
  plugins: [],
};
