/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // Optional: if you still serve raw HTML (e.g. web/index.html) at repo root
    "../web/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2a7ae2",
        secondary: "#f5f5f5",
        accent: "#205caa",
        dark: "#111827",
        "neon-blue": "#2a7ae2",
        "neon-pink": "#205caa",
        "deep-space": "#ffffff",
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "ai-speaking": "ai-speaking 1s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        glow: {
          "0%": {
            boxShadow:
              "0 0 5px #2a7ae2, 0 0 10px #2a7ae2, 0 0 15px #2a7ae2",
          },
          "100%": {
            boxShadow:
              "0 0 10px #2a7ae2, 0 0 20px #2a7ae2, 0 0 30px #2a7ae2",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "ai-speaking": {
          "0%": { height: "4px", opacity: "0.6" },
          "50%": { height: "16px", opacity: "1" },
          "100%": { height: "6px", opacity: "0.7" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
