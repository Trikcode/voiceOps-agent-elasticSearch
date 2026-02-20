import { Clock, Zap, TrendingUp, Award } from 'lucide-react'
import type { ImpactData } from '../types'
import { colors, radius } from '../styles/theme'
import { Card } from './ui/Card'

interface Props {
  data: ImpactData | null
}

export function ImpactCard({ data }: Props) {
  if (!data) return null

  return (
    <Card padding='md' highlight='success'>
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <Award size={24} color={colors.success} />
        </div>
        <div>
          <h3 style={styles.title}>Impact Summary</h3>
          <p style={styles.subtitle}>Time saved by using VoiceOps</p>
        </div>
      </div>

      <div style={styles.mainStat}>
        <Clock size={32} color={colors.success} />
        <div>
          <span style={styles.bigNumber}>{data.time_saved.formatted}</span>
          <span style={styles.bigLabel}>Total Time Saved</span>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <Zap size={18} color={colors.primary} />
          <div>
            <span style={styles.statValue}>
              {data.automation_stats.total_automated_actions}
            </span>
            <span style={styles.statLabel}>Actions Automated</span>
          </div>
        </div>

        <div style={styles.stat}>
          <TrendingUp size={18} color={colors.warning} />
          <div>
            <span style={styles.statValue}>
              {data.efficiency_gain.efficiency_multiplier}
            </span>
            <span style={styles.statLabel}>Faster</span>
          </div>
        </div>

        <div style={styles.stat}>
          <Award size={18} color={colors.success} />
          <div>
            <span style={styles.statValue}>
              {data.automation_stats.success_rate}
            </span>
            <span style={styles.statLabel}>Success Rate</span>
          </div>
        </div>
      </div>

      <div style={styles.comparison}>
        <div style={styles.comparisonItem}>
          <span style={styles.comparisonLabel}>Manual Estimate</span>
          <span style={styles.comparisonValue}>
            {data.efficiency_gain.manual_time_estimate}
          </span>
        </div>
        <div style={styles.comparisonArrow}>→</div>
        <div style={styles.comparisonItem}>
          <span style={styles.comparisonLabel}>With VoiceOps</span>
          <span style={{ ...styles.comparisonValue, color: colors.success }}>
            {data.efficiency_gain.actual_time}
          </span>
        </div>
      </div>
    </Card>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.successBg,
    borderRadius: radius.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.textPrimary,
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    margin: 0,
  },
  mainStat: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    background: colors.successBg,
    borderRadius: radius.lg,
    marginBottom: 20,
  },
  bigNumber: {
    display: 'block',
    fontSize: 36,
    fontWeight: 700,
    color: colors.success,
    lineHeight: 1,
  },
  bigLabel: {
    display: 'block',
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    background: colors.bgElevated,
    borderRadius: radius.md,
  },
  statValue: {
    display: 'block',
    fontSize: 18,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  statLabel: {
    display: 'block',
    fontSize: 11,
    color: colors.textMuted,
  },
  comparison: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
    background: colors.bgElevated,
    borderRadius: radius.md,
  },
  comparisonItem: {
    textAlign: 'center',
  },
  comparisonLabel: {
    display: 'block',
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  comparisonArrow: {
    fontSize: 20,
    color: colors.textMuted,
  },
}
