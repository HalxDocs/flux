import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0F1117",
        surface: "#161B22",
        card: "#161B22",
        cardHover: "#1E2430",
        border: "#21262D",
        blue: {
          DEFAULT: "#7C3AED",
          hover: "#8B5CF6",
        },
        accent: "#06B6D4",
        teal: "#06B6D4",
        danger: "#EF4444",
        warn: "#F59E0B",
        success: "#10B981",
        text: "#F0F6FC",
        subtext: "#6B7280",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '11': ['11px', '16px'],
        '12': ['12px', '18px'],
        '13': ['13px', '20px'],
        '14': ['14px', '20px'],
        '15': ['15px', '22px'],
        '16': ['16px', '24px'],
        '18': ['18px', '26px'],
        '20': ['20px', '28px'],
        '22': ['22px', '30px'],
        '28': ['28px', '34px'],
        '36': ['36px', '42px'],
        '48': ['48px', '54px'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      ringColor: {
        DEFAULT: '#7C3AED',
      },
    },
  },
  plugins: [],
};

export default config;
