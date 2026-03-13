import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,tsx,jsx}',
    './src/components/**/*.{js,ts,tsx,jsx}',
    './src/lib/**/*.{js,ts,tsx,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}

export default config
