/**
 * Epic Games Store Token-Driven Design Foundations
 * Strictly mapped to store.epicgames.com design specifications.
 * WCAG 2.2 AA compliant.
 */
export const EPIC_TOKENS = {
  typography: {
    fontFamily: {
      primary: 'Inter',
      stack: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    fontSize: {
      xs: '10.72px',
      sm: '13.33px',
      md: '14px',
      lg: '16px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      tight: '1.2',
      base: 'normal',
    },
  },
  colors: {
    surface: {
      base: '#000000',
      raised: '#101014',
      strong: '#14181e',
      hover: '#20252e',
      active: '#282e38',
      disabled: '#18181c',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.10)',
      strong: 'rgba(255, 255, 255, 0.25)',
      focus: 'rgba(255, 255, 255, 0.60)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.72)',
      muted: 'rgba(255, 255, 255, 0.50)',
      disabled: 'rgba(255, 255, 255, 0.30)',
    },
    brand: {
      accent: '#34363d',
      accentHover: '#42454e',
      discount: '#34363d',
      charcoalBlack: '#141416',
      charcoalRaised: '#1c1d22',
      error: '#f53838',
    },
  },
  spacing: {
    '1': '4px',
    '2': '5px',
    '3': '6px',
    '4': '10px',
    '5': '13.6px',
    '6': '16px',
    '7': '20px',
    '8': '21.44px',
  },
  radius: {
    xs: '8px',
    sm: '10px',
    md: '12px',
    lg: '9999px',
  },
  motion: {
    duration: {
      instant: '125ms',
      fast: '200ms',
    },
    timing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  shadow: {
    card: '0 4px 12px rgba(0, 0, 0, 0.4)',
    hover: '0 12px 32px rgba(0, 0, 0, 0.8)',
  },
} as const

export type EpicTokens = typeof EPIC_TOKENS
