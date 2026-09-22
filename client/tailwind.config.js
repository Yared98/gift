/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-container": "var(--color-surface-container)",
        "surface-low": "var(--color-surface-low)",
        "on-surface": "var(--color-on-surface)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        border: "var(--color-border)",
        "border-subtle": "var(--color-border-subtle)",
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          container: "var(--color-primary-container)",
          "on-container": "var(--color-on-primary-container)",
        },
        accent: {
          amber: "var(--color-accent-amber)",
          "amber-subtle": "var(--color-accent-amber-subtle)",
        },
        favorite: {
          DEFAULT: "var(--color-favorite)",
          subtle: "var(--color-favorite-subtle)",
          border: "var(--color-favorite-border)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          subtle: "var(--color-danger-subtle)",
        },
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        cursive: ["'Caveat'", "cursive"],
        script: ["'Alex Brush'", "cursive"],
      },
      boxShadow: {
        paper: "0 2px 8px -2px rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)",
        "paper-hover": "0 10px 25px -4px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)",
      }
    },
  },
  plugins: [],
}
