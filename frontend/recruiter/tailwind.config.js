/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./*.{js,ts,jsx,tsx,mdx}",
    "../common/**/*.{js,ts,jsx,tsx,mdx}",
    "../job-seeker/**/*.{js,ts,jsx,tsx,mdx}",
    "../recruiter/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        torbit: {
          green: "#b2c359",
          greenHover: "#9eb047",
          dark: "#111827",
          darker: "#0B0F19",
          ink: "#080809"
        },
        brand: {
          primary: '#b2c359',
          hover: '#9eb047',
          dark: '#080809',
          slate: '#0F172A',
        }
      }
    },
  },
  plugins: [],
};
