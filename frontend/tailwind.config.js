/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./common/**/*.{js,ts,jsx,tsx,mdx}",
    "./job-seeker/**/*.{js,ts,jsx,tsx,mdx}",
    "./recruiter/**/*.{js,ts,jsx,tsx,mdx}",
    "./admin/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans-serif'],
        helvetica: ['Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        torbit: {
          green: "#94C322",
          greenHover: "#82ad1b",
          dark: "#111827",
          darker: "#0B0F19",
          ink: "#080809"
        }
      }
    },
  },
  plugins: [],
}