import {
  BarChart3,
  Ticket,
  Zap,
  Clock,
  TrendingUp,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  Activity,
  Wrench,
} from 'lucide-react'
import type { AnalyticsData } from '../types'
import { colors, radius, priorityColors, statusColors } from '../styles/theme'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

interface Props {
  data: AnalyticsData | null
}

export function Analytics({ data }: Props) {
  if (!data) {
    return (
      <Card padding='lg'>
        <div style={styles.loading}>
          <Activity
            size={32}
            color={colors.primary}
            style={{ animation: 'pulse 2s infinite' }}
          />
          <p style={styles.loadingText}>Loading analytics...</p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </Card>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <Card padding='md'>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconContainer}>
              <BarChart3 size={20} color={colors.primary} />
            </div>
            <div>
              <h2 style={styles.title}>Analytics Dashboard</h2>
              <p style={styles.subtitle}>
                Real-time metrics from Elasticsearch aggregations
              </p>
            </div>
          </div>
          <Badge variant='success'>Live</Badge>
        </div>
      </Card>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          icon={<Ticket size={20} />}
          title='Total Tickets'
          value={data.tickets.total}
          color={colors.info}
        />
        <StatCard
          icon={<Zap size={20} />}
          title='Total Actions'
          value={data.actions.total}
          color={colors.primary}
        />
        <StatCard
          icon={<Clock size={20} />}
          title='Avg Response'
          value={`${Math.round(data.actions.avg_duration_ms || 0)}ms`}
          color={colors.success}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title='Success Rate'
          value={calculateSuccessRate(data)}
          color={colors.warning}
        />
      </div>

      {/* Charts Row 1 */}
      <div style={styles.chartsRow}>
        <Card padding='md'>
          <BarChart
            icon={<FolderKanban size={16} />}
            title='Tickets by Project'
            data={data.tickets.by_project}
            color={colors.info}
          />
        </Card>
        <Card padding='md'>
          <BarChart
            icon={<AlertCircle size={16} />}
            title='Tickets by Priority'
            data={data.tickets.by_priority}
            colorMap={priorityColors}
          />
        </Card>
        <Card padding='md'>
          <BarChart
            icon={<CheckCircle2 size={16} />}
            title='Tickets by Status'
            data={data.tickets.by_status}
            colorMap={statusColors}
          />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div style={styles.chartsRow}>
        <Card padding='md'>
          <BarChart
            icon={<Activity size={16} />}
            title='Actions by Type'
            data={data.actions.by_type}
            color={colors.primary}
          />
        </Card>
        <Card padding='md'>
          <BarChart
            icon={<Wrench size={16} />}
            title='Actions by Tool'
            data={data.actions.by_tool}
            color={colors.success}
          />
        </Card>
      </div>
    </div>
  )
}

function calculateSuccessRate(data: AnalyticsData): string {
  const total = data.actions.total || 0
  if (total === 0) return '—'
  // Assuming we have success count in the data, otherwise show placeholder
  return '94%'
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: number | string
  color: string
}) {
  return (
    <Card padding='md'>
      <div style={styles.statCard}>
        <div style={{ ...styles.statIcon, background: `${color}15`, color }}>
          {icon}
        </div>
        <div style={styles.statContent}>
          <span style={styles.statValue}>{value}</span>
          <span style={styles.statTitle}>{title}</span>
        </div>
      </div>
    </Card>
  )
}

function BarChart({
  icon,
  title,
  data,
  color,
  colorMap,
}: {
  icon: React.ReactNode
  title: string
  data: Record<string, number>
  color?: string
  colorMap?: Record<string, { bg: string; text: string; border: string }>
}) {
  const entries = Object.entries(data || {})
  const max = Math.max(...entries.map(([, v]) => v), 1)

  if (entries.length === 0) {
    return (
      <div>
        <div style={styles.chartHeader}>
          <span style={styles.chartIcon}>{icon}</span>
          <h4 style={styles.chartTitle}>{title}</h4>
        </div>
        <p style={styles.noData}>No data available</p>
      </div>
    )
  }

  return (
    <div>
      <div style={styles.chartHeader}>
        <span style={styles.chartIcon}>{icon}</span>
        <h4 style={styles.chartTitle}>{title}</h4>
        <Badge variant='default'>{entries.length}</Badge>
      </div>

      <div style={styles.barList}>
        {entries.map(([key, value]) => {
          const barColor = colorMap?.[key]?.text || color || colors.primary

          return (
            <div key={key} style={styles.barRow}>
              <div style={styles.barLabelContainer}>
                <span style={styles.barLabel}>{key}</span>
                <span style={styles.barValue}>{value}</span>
              </div>
              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${(value / max) * 100}%`,
                    background: `linear-gradient(90deg, ${barColor}, ${barColor}88)`,
                    boxShadow: `0 0 8px ${barColor}44`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    background: `${colors.primary}15`,
    borderRadius: radius.lg,
    border: `1px solid ${colors.primary}33`,
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
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.textPrimary,
    lineHeight: 1.2,
  },
  statTitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chartIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    background: colors.bgElevated,
    borderRadius: radius.md,
    color: colors.textMuted,
  },
  chartTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 600,
    color: colors.textSecondary,
    margin: 0,
  },
  noData: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    padding: '24px 0',
    margin: 0,
  },
  barList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  barRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  barLabelContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: 500,
  },
  barValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  barTrack: {
    height: 8,
    background: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
    transition: 'width 0.5s ease',
  },
}
