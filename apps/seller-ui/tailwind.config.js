/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}",
    "../seller-ui/src/**/*.{ts,tsx,js,jsx}",
    "../../packages/components/**/*.{ts,tsx,js,jsx}",
    "!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}",
    // ...createGlobPatternsForDependencies(__dirname)
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        Poppins: ["var(--font-poppins)"],
      },
      colors: {
        // helpful mid-gray used in codebase
        gray: {
          750: '#2a2f3a',
        },
      },
    },
  },
  plugins: [],
};
