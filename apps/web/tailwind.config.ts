import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        muted: "#5f6b7a",
        line: "#d8dee7",
        canvas: "#f5f7fa",
        brand: "#256f5f",
        danger: "#b42318"
      }
    }
  },
  plugins: []
};

export default config;
