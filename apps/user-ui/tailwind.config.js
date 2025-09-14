/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}",
    "!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}",
    // If you are in Nx/monorepo, uncomment this line:
    // ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {

      fontFamily:{
        Roboto:["var(--font-roboto)"],
        Poppins:["var(--font-poppins)"]
      }
    },
  },
  plugins: [],
};
