import {
  Ticket,
  User,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Database,
  ExternalLink,
} from 'lucide-react'
import type { Ticket as TicketType } from '../types'
import { colors, radius, priorityColors, statusColors } from '../styles/theme'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

interface Props {
  tickets: TicketType[]
}

export function TicketList({ tickets }: Props) {
  if (!tickets.length) {
    return (
      <Card padding='lg'>
        <div style={styles.empty}>
          <Database
            size={48}
            color={colors.textMuted}
            style={{ opacity: 0.5 }}
          />
          <h3 style={styles.emptyTitle}>No Tickets Found</h3>
          <p style={styles.emptyText}>
            Tickets will appear here as you create them with the agent
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card padding='md'>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconContainer}>
            <Ticket size={20} color={colors.primary} />
          </div>
          <div>
            <h2 style={styles.title}>Tickets</h2>
            <p style={styles.subtitle}>
              All tickets in Elasticsearch — including agent-created ones
            </p>
          </div>
        </div>
        <Badge variant='info'>{tickets.length} tickets</Badge>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Summary</th>
              <th style={styles.th}>Project</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Assignee</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, i) => (
              <tr key={i} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.idCell}>
                    <Ticket size={14} color={colors.textMuted} />
                    <code style={styles.ticketId}>{ticket.ticket_id}</code>
                  </div>
                </td>
                <td style={{ ...styles.td, maxWidth: 300 }}>
                  <span style={styles.summary}>{ticket.summary}</span>
                </td>
                <td style={styles.td}>
                  <div style={styles.projectCell}>
                    <FolderKanban size={14} color={colors.textMuted} />
                    <span>{ticket.project}</span>
                  </div>
                </td>
                <td style={styles.td}>
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td style={styles.td}>
                  <div style={styles.assigneeCell}>
                    <div style={styles.avatar}>
                      <User size={12} color={colors.textMuted} />
                    </div>
                    <span>{ticket.assignee || 'Unassigned'}</span>
                  </div>
                </td>
                <td style={styles.td}>
                  <StatusBadge status={ticket.status} />
                </td>
                <td style={styles.td}>
                  {ticket.jira_url ? (
                    <a
                      href={ticket.jira_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      style={styles.jiraLink}
                    >
                      <ExternalLink size={14} />
                      View in Jira
                    </a>
                  ) : (
                    <span style={styles.noLink}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const style = priorityColors[priority] || priorityColors.medium
  const Icon =
    priority === 'critical' || priority === 'high' ? AlertCircle : CheckCircle2

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        fontWeight: 500,
        padding: '4px 10px',
        borderRadius: radius.full,
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      <Icon size={12} />
      {priority}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const style = statusColors[status] || statusColors.open

  const getIcon = () => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle2 size={12} />
      case 'in-progress':
        return <Loader2 size={12} />
      default:
        return <Clock size={12} />
    }
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        fontWeight: 500,
        padding: '4px 10px',
        borderRadius: radius.full,
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {getIcon()}
      {status}
    </span>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.infoBg,
    borderRadius: radius.lg,
    border: `1px solid ${colors.info}33`,
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
    background: colors.bgElevated,
  },
  tr: {
    borderBottom: `1px solid ${colors.borderSubtle}`,
    transition: 'background 150ms ease',
  },
  td: {
    padding: '14px 16px',
    fontSize: 13,
    color: colors.textSecondary,
    verticalAlign: 'middle',
  },
  idCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  ticketId: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.primary,
    background: colors.bgElevated,
    padding: '2px 8px',
    borderRadius: radius.sm,
  },
  summary: {
    display: 'block',
    lineHeight: 1.4,
    color: colors.textPrimary,
  },
  projectCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: colors.textSecondary,
  },
  assigneeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bgElevated,
    borderRadius: radius.full,
    border: `1px solid ${colors.borderSubtle}`,
  },
  jiraLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: colors.infoBg,
    border: `1px solid ${colors.info}33`,
    borderRadius: radius.md,
    color: colors.info,
    fontSize: 12,
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 150ms ease',
  },
  noLink: {
    color: colors.textMuted,
  },
}
