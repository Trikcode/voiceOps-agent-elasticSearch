import { Clock, CheckCircle2, XCircle, Zap, Database } from 'lucide-react'
import type { AuditAction } from '../types'
import { colors, radius } from '../styles/theme'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

interface Props {
  actions: AuditAction[]
}

export function AuditLog({ actions }: Props) {
  if (!actions.length) {
    return (
      <Card padding='lg'>
        <div style={styles.empty}>
          <Database
            size={48}
            color={colors.textMuted}
            style={{ opacity: 0.5 }}
          />
          <h3 style={styles.emptyTitle}>No Actions Yet</h3>
          <p style={styles.emptyText}>
            Actions will appear here as you use the agent
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card padding='md'>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Audit Log</h2>
          <p style={styles.subtitle}>
            Every agent action logged to Elasticsearch
          </p>
        </div>
        <Badge variant='default'>{actions.length} actions</Badge>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Action</th>
              <th style={styles.th}>Tool</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>Reasoning</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action, i) => (
              <tr key={i} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.timeCell}>
                    <Clock size={14} color={colors.textMuted} />
                    {new Date(action.timestamp).toLocaleString()}
                  </div>
                </td>
                <td style={styles.td}>
                  <Badge variant='info'>{action.action_type}</Badge>
                </td>
                <td style={styles.td}>
                  <code style={styles.code}>{action.tool_used}</code>
                </td>
                <td style={styles.td}>
                  {action.success ? (
                    <CheckCircle2 size={18} color={colors.success} />
                  ) : (
                    <XCircle size={18} color={colors.error} />
                  )}
                </td>
                <td style={styles.td}>
                  <div style={styles.durationCell}>
                    <Zap size={14} color={colors.warning} />
                    {action.duration_ms}ms
                  </div>
                </td>
                <td style={{ ...styles.td, maxWidth: 300 }}>
                  <span style={styles.reasoning}>
                    {action.reasoning?.substring(0, 80)}...
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.textPrimary,
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    margin: 0,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.textSecondary,
    margin: '16px 0 8px',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    margin: 0,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: 11,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: `1px solid ${colors.borderSubtle}`,
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: `1px solid ${colors.borderSubtle}08`,
  },
  td: {
    padding: '14px 16px',
    fontSize: 13,
    color: colors.textSecondary,
    verticalAlign: 'middle',
  },
  timeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    whiteSpace: 'nowrap',
  },
  durationCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'monospace',
  },
  code: {
    fontSize: 12,
    padding: '2px 8px',
    background: colors.bgElevated,
    borderRadius: radius.sm,
    color: colors.textSecondary,
  },
  reasoning: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 1.4,
  },
}
