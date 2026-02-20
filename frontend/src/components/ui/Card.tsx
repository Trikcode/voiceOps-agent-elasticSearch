import { colors, radius, shadows } from '../../styles/theme'

interface CardProps {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  highlight?: 'none' | 'success' | 'warning' | 'error' | 'primary'
}

const paddingMap = { none: 0, sm: 12, md: 16, lg: 24 }
const highlightMap = {
  none: colors.borderSubtle,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  primary: colors.primary,
}

export function Card({
  children,
  padding = 'md',
  highlight = 'none',
}: CardProps) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${highlight === 'none' ? colors.borderSubtle : highlightMap[highlight]}`,
        borderRadius: radius.lg,
        padding: paddingMap[padding],
        boxShadow:
          highlight !== 'none' ? shadows.glow(highlightMap[highlight]) : 'none',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  )
}
