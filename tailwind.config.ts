import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#102A3D",
        paper: "#F7F3EA",
        teal: "#2F7A6F",
        coral: "#D14B3D",
        amber: "#D69A2D",
        slate: "#8C97A1",
      },
      fontFamily: {
        heading: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        scanline: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        develop: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        arrive: {
          "0%": { backgroundColor: "rgba(47,122,111,0.18)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      animation: {
        scanline: "scanline 1.8s linear infinite",
        develop: "develop 0.5s ease-out both",
        arrive: "arrive 2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
