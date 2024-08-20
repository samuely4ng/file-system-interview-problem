/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      lg: '15.5px',
      xl: '18px',
      '2xl': '20px',
    },
  },
  plugins: [
    nextui({
      defaultTheme: "dark",
      layout: {
        radius: {
          small: "5px",
          large: "20px",
        },
      },
      themes: {
        dark: {
          colors: {
            primary: "#4465DB",
            dark: {
              300: "#9191B1",
              600: "#31313F",
              800: '#15151A',
              900: "#111115",
            },
            gray: {
              100: "#E3F7FF",
              300: "rgba(227, 247, 255,0.12)",
              500: "#202028",
              600: "#23212A"
            },
            red: {
              400: "#C9726B"
            },
            blue: {
              900: "#636384"
            },
            green: {
              400: "#8EFFBB"
            },
            neutral: {
              400: "#5B566D"
            }
          },
        },
      },
    }),
    require("@tailwindcss/typography"),
  ],
};
