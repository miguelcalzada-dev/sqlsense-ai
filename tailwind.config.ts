import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"DM Serif Display"', 'serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        'bg-soft': 'var(--bg-soft)',
        'bg-tertiary': 'var(--bg-tertiary)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        sub: 'var(--sub)',
        line: '#111111',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        'accent-3': 'var(--accent-3)',
        'accent-4': 'var(--accent-4)',
        'accent-5': 'var(--accent-5)',
      },
      borderRadius: {
        none: '0',
      },
      boxShadow: {
        brutal: '4px 4px 0px #111111',
        'brutal-sm': '2px 2px 0px #111111',
        'brutal-hover': '8px 8px 0px #111111',
      },
    },
  },
  plugins: [],
};

export default config;
