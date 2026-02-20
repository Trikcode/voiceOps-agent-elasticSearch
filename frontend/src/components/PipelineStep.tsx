import { colors } from '../styles/theme'

interface Props {
  icon: string
  title: string
  children: React.ReactNode
}

export function PipelineStep({ icon, title, children }: Props) {
  return (
    <div style={styles.step}>
      <div style={styles.header}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={styles.title}>{title}</span>
        <span style={styles.check}>✓</span>
      </div>
      <div style={styles.content}>{children}</div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  step: {
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: colors.bgHeader,
    borderBottom: `1px solid ${colors.border}`,
  },
  title: { fontSize: 14, fontWeight: 600, color: colors.textPrimary, flex: 1 },
  check: { fontSize: 14, color: colors.green, fontWeight: 700 },
  content: { padding: 16 },
}
