import { colors, radius, transitions } from '../../styles/theme'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontWeight: 600,
    borderRadius: radius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: transitions.default,
    border: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
  }

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: 13 },
    md: { padding: '10px 20px', fontSize: 14 },
    lg: { padding: '14px 28px', fontSize: 15 },
  }

  const variantStyles = {
    primary: { background: colors.primary, color: '#fff' },
    secondary: {
      background: colors.bgElevated,
      color: colors.textPrimary,
      border: `1px solid ${colors.borderDefault}`,
    },
    success: { background: colors.success, color: '#fff' },
    danger: { background: colors.error, color: '#fff' },
    ghost: { background: 'transparent', color: colors.textSecondary },
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyles, ...sizeStyles[size], ...variantStyles[variant] }}
    >
      {icon}
      {children}
    </button>
  )
}
