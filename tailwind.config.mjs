/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#223e7c',
					dark: '#1a3369',
          light: '#93c5fd',
				},
				secondary: '#3f4040',
				whatsapp: '#25D366',
				telegram: '#0088CC',
				light: '#f8fafc',
				dark: '#1e293b',
				gray: '#64748b',
				'light-gray': '#e2e8f0',
			},
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      spacing: {
        '11.25': '2.8125rem', // 45px
      },
		},
	},
	plugins: [typography],
}