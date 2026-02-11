import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12263A",
        aqua: "#2EC4B6",
        sand: "#FFF6E9"
      }
    }
  },
  plugins: []
};

export default config;
