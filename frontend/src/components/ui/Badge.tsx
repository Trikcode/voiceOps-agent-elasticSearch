import { colors, radius } from '../../styles/theme'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
}

const variantStyles = {
  default: {
    bg: colors.bgElevated,
    text: colors.textSecondary,
    border: colors.borderSubtle,
  },
  success: {
    bg: colors.successBg,
    text: colors.success,
    border: colors.success,
  },
  warning: {
    bg: colors.warningBg,
    text: colors.warning,
    border: colors.warning,
  },
  error: { bg: colors.errorBg, text: colors.error, border: colors.error },
  info: { bg: colors.infoBg, text: colors.info, border: colors.info },
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
}: BadgeProps) {
  const style = variantStyles[variant]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 500,
        borderRadius: radius.full,
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {children}
    </span>
  )
}
