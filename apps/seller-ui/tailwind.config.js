/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}",
    "../seller-ui/src/**/*.{ts,tsx,js,jsx}",
    "../../packages/components/**/*.{ts,tsx,js,jsx}",
    "!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}",
    // ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      fontFamily: {
        Poppins: ["var(--font-poppins)"],
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
