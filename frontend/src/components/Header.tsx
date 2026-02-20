import { Mic, MessageSquare, CheckCircle2, XCircle, Ticket } from 'lucide-react'
import type { HealthStatus } from '../types'
import { colors, radius } from '../styles/theme'
import { Badge } from './ui/Badge'

interface Props {
  health: HealthStatus | null
}

export function Header({ health }: Props) {
  const isHealthy = health?.status === 'healthy'

  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <div style={styles.logoContainer}>
          <Mic size={20} color={colors.primary} />
        </div>
        <div>
          <h1 style={styles.title}>VoiceOps</h1>
          <p style={styles.tagline}>Voice-powered agent</p>
        </div>
      </div>

      <div style={styles.status}>
        <div style={styles.statusItem}>
          {isHealthy ? (
            <CheckCircle2 size={14} color={colors.success} />
          ) : (
            <XCircle size={14} color={colors.error} />
          )}
          <span
            style={{
              color: isHealthy ? colors.success : colors.error,
              fontSize: 12,
              display: 'none',
            }}
            className='status-text'
          >
            {isHealthy ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {health?.jira_configured && (
          <Badge variant='success'>
            <Ticket size={10} />
            <span style={styles.badgeText}>Jira</span>
          </Badge>
        )}

        {health?.slack_configured && (
          <Badge variant='info'>
            <MessageSquare size={10} />
            <span style={styles.badgeText}>Slack</span>
          </Badge>
        )}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .status-text {
            display: inline !important;
          }
        }
      `}</style>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: colors.bgSecondary,
    borderBottom: `1px solid ${colors.borderSubtle}`,
    gap: 12,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${colors.primary}22, ${colors.primary}44)`,
    borderRadius: radius.md,
    border: `1px solid ${colors.primary}44`,
    flexShrink: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.textPrimary,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  tagline: {
    fontSize: 11,
    color: colors.textMuted,
    margin: 0,
    display: 'none',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    display: 'none',
  },
}
