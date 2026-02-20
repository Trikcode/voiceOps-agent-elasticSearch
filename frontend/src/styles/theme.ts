export const colors = {
  // Backgrounds
  bgPrimary: '#0a0a0f',
  bgSecondary: '#12121a',
  bgCard: '#16161f',
  bgElevated: '#1c1c28',
  bgInput: '#1e1e2a',
  bgHover: '#252532',

  // Borders
  borderSubtle: '#2a2a3a',
  borderDefault: '#3a3a4a',
  borderFocus: '#5b5bd6',

  // Text
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  textDisabled: '#52525b',

  // Brand
  primary: '#6366f1',
  primaryHover: '#818cf8',
  primaryMuted: '#4f46e5',

  // Semantic
  success: '#22c55e',
  successMuted: '#16a34a',
  successBg: 'rgba(34, 197, 94, 0.1)',

  warning: '#f59e0b',
  warningMuted: '#d97706',
  warningBg: 'rgba(245, 158, 11, 0.1)',

  error: '#ef4444',
  errorMuted: '#dc2626',
  errorBg: 'rgba(239, 68, 68, 0.1)',

  info: '#3b82f6',
  infoMuted: '#2563eb',
  infoBg: 'rgba(59, 130, 246, 0.1)',

  border: '#3a3a4a',
  bgHeader: '#1a1f2e',
  green: '#22c55e',
}

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.4)',
  glow: (color: string) => `0 0 20px ${color}33`,
}

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
}

export const transitions = {
  fast: '150ms ease',
  default: '200ms ease',
  slow: '300ms ease',
}

export const priorityColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  critical: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#fca5a5',
    border: '#ef4444',
  },
  high: { bg: 'rgba(249, 115, 22, 0.15)', text: '#fdba74', border: '#f97316' },
  medium: { bg: 'rgba(234, 179, 8, 0.15)', text: '#fde047', border: '#eab308' },
  low: { bg: 'rgba(34, 197, 94, 0.15)', text: '#86efac', border: '#22c55e' },
}

export const statusColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  open: { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd', border: '#3b82f6' },
  'in-progress': {
    bg: 'rgba(168, 85, 247, 0.15)',
    text: '#d8b4fe',
    border: '#a855f7',
  },
  resolved: {
    bg: 'rgba(34, 197, 94, 0.15)',
    text: '#86efac',
    border: '#22c55e',
  },
  closed: {
    bg: 'rgba(113, 113, 122, 0.15)',
    text: '#a1a1aa',
    border: '#71717a',
  },
}
