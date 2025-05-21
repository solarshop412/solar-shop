/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      boxShadow: {
        'custom': '0 1px 2px 0 rgba(0, 0, 0, 0.5)', // Customize as needed
      },
      transitionProperty: {
        width: "width",
      },
      colors: {
        "main-bg": "#ffffff",
        "second-bg": "#f4f4f4",
        "main-fg": "#0a2541",
        "second-fg": "#5D65FF",
        "success": "#4BCF4B",
        "warning": "#ffcc00",
        "error": "#F8546A",
        "info": "#5D65FF",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },      
    },
  },
  variants: {
    extend: {
      backgroundColor: ["hover"],
      textColor: ["hover"],
    },
  },
  plugins: [],
};
