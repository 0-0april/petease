export default {
  content: [
    './index.html',
    './**/*.html',
    './**/*.js',
    './**/*.jsx',
    './**/*.ts',
    './**/*.tsx',
    './**/*.css',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(135,95%,18%)',
          dark:    'hsl(140,100%,7%)',
          vivid:   'hsl(130,100%,30%)',
          light:   'hsl(130,100%,40%)',
          canvas:  'hsla(132,79%,89%,1)',
        },
      },
      backdropBlur: {
        glass: '25px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        glass:    '0 8px 48px 0 rgba(6,50,12,0.13), 0 1.5px 6px 0 rgba(6,50,12,0.07)',
        'glass-sm':'0 4px 24px 0 rgba(6,50,12,0.10)',
        'glow-green': '0 0 32px 8px hsla(130,100%,30%,0.28)',
        'pay-btn':    '0 4px 24px 0 hsla(130,100%,35%,0.45)',
      },
      backgroundImage: {
        'sphere-grad': 'radial-gradient(circle at 40% 40%, hsl(130,100%,40%), hsl(135,95%,22%) 60%, hsl(140,100%,7%) 100%)',
        'card-grad':   'linear-gradient(135deg, hsl(140,100%,9%) 0%, hsl(135,95%,18%) 55%, hsl(130,100%,30%) 100%)',
        'pay-grad':    'linear-gradient(135deg, hsl(130,100%,40%) 0%, hsl(135,95%,22%) 100%)',
      },
      keyframes: {
        'float-slow': {
          '0%,100%': { transform: 'translateY(0px) scale(1)' },
          '50%':      { transform: 'translateY(-28px) scale(1.03)' },
        },
        'float-mid': {
          '0%,100%': { transform: 'translateY(0px) scale(1)' },
          '50%':      { transform: 'translateY(22px) scale(0.97)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'float-mid':  'float-mid 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
