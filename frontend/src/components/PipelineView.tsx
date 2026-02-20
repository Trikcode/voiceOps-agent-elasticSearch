import { Target, Search, Brain, AlertTriangle, Ticket } from 'lucide-react'
import type { PipelineData } from '../types'
import { colors, radius, priorityColors } from '../styles/theme'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

interface Props {
  pipeline: PipelineData
  transcript: string
}

export function PipelineView({ pipeline, transcript }: Props) {
  const { step1_intent, step2_context, step3_plan } = pipeline

  return (
    <div style={styles.container}>
      {/* Transcript */}
      <Card padding='sm'>
        <div style={styles.stepIndicator}>
          <span style={styles.stepDot} />
          INPUT
        </div>
        <p style={styles.transcript}>"{transcript}"</p>
      </Card>

      {/* Step 1: Intent */}
      <Card padding='sm'>
        <div style={styles.stepHeader}>
          <div style={styles.stepIcon}>
            <Target size={16} color={colors.primary} />
          </div>
          <span style={styles.stepTitle}>Intent</span>
        </div>

        <div style={styles.entityGrid}>
          <EntityTag label='Intent' value={step1_intent.intent} highlight />
          {Object.entries(step1_intent.entities).map(([key, val]) =>
            val ? (
              <EntityTag key={key} label={key} value={String(val)} />
            ) : null,
          )}
        </div>
      </Card>

      {/* Step 2: Context */}
      <Card padding='sm'>
        <div style={styles.stepHeader}>
          <div style={styles.stepIcon}>
            <Search size={16} color={colors.info} />
          </div>
          <span style={styles.stepTitle}>Context</span>
        </div>

        <div style={styles.contextStats}>
          <Badge variant='info'>
            {step2_context.similar_tickets.length} similar
          </Badge>
          <Badge variant='default'>
            {step2_context.past_commands_found} commands
          </Badge>
        </div>

        {step2_context.similar_tickets.slice(0, 2).map((ticket) => (
          <div key={ticket.ticket_id} style={styles.ticketCard}>
            <div style={styles.ticketHeader}>
              <Ticket size={12} color={colors.textMuted} />
              <code style={styles.ticketId}>{ticket.ticket_id}</code>
              <PriorityBadge priority={ticket.priority} />
            </div>
            <p style={styles.ticketSummary}>{ticket.summary}</p>
          </div>
        ))}
      </Card>

      {/* Step 3: Reasoning */}
      <Card
        padding='sm'
        highlight={step3_plan.confidence === 'high' ? 'success' : 'warning'}
      >
        <div style={styles.stepHeader}>
          <div style={styles.stepIcon}>
            <Brain size={16} color={colors.primary} />
          </div>
          <span style={styles.stepTitle}>Reasoning</span>
          <Badge
            variant={step3_plan.confidence === 'high' ? 'success' : 'warning'}
            size='sm'
          >
            {step3_plan.confidence}
          </Badge>
        </div>

        <p style={styles.reasoning}>{step3_plan.reasoning}</p>

        {step3_plan.duplicate_warning && (
          <div style={styles.warning}>
            <AlertTriangle size={14} />
            <span>{step3_plan.duplicate_warning}</span>
          </div>
        )}

        <div style={styles.actions}>
          {step3_plan.actions.map((action) => (
            <div key={action.step} style={styles.actionRow}>
              <span style={styles.actionStep}>{action.step}</span>
              <span style={styles.actionDesc}>{action.description}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function EntityTag({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      style={{
        ...styles.entityTag,
        borderColor: highlight ? colors.primary : colors.borderSubtle,
        background: highlight ? `${colors.primary}11` : colors.bgElevated,
      }}
    >
      <span style={styles.entityLabel}>{label}</span>
      <span
        style={{
          ...styles.entityValue,
          color: highlight ? colors.primary : colors.textPrimary,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const style = priorityColors[priority] || priorityColors.medium
  return (
    <span
      style={{
        fontSize: 10,
        padding: '2px 6px',
        borderRadius: radius.sm,
        background: style.bg,
        color: style.text,
      }}
    >
      {priority}
    </span>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 10,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: colors.success,
  },
  transcript: {
    fontSize: 14,
    color: colors.textPrimary,
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  stepIcon: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bgElevated,
    borderRadius: radius.sm,
    flexShrink: 0,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.textPrimary,
    flex: 1,
  },
  entityGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  entityTag: {
    display: 'flex',
    flexDirection: 'column',
    padding: '6px 10px',
    background: colors.bgElevated,
    borderRadius: radius.sm,
    border: `1px solid ${colors.borderSubtle}`,
    minWidth: 80,
  },
  entityLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  entityValue: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.textPrimary,
    wordBreak: 'break-word',
  },
  contextStats: {
    display: 'flex',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  ticketCard: {
    padding: 10,
    background: colors.bgElevated,
    borderRadius: radius.sm,
    marginBottom: 6,
  },
  ticketHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  ticketId: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.primary,
  },
  ticketSummary: {
    fontSize: 12,
    color: colors.textSecondary,
    margin: 0,
    lineHeight: 1.3,
  },
  reasoning: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 1.5,
    margin: '0 0 12px',
    padding: 10,
    background: colors.bgElevated,
    borderRadius: radius.sm,
    borderLeft: `3px solid ${colors.primary}`,
    wordBreak: 'break-word',
  },
  warning: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    background: colors.warningBg,
    border: `1px solid ${colors.warning}`,
    borderRadius: radius.sm,
    color: colors.warning,
    fontSize: 12,
    marginBottom: 12,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  actionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '8px 0',
    borderBottom: `1px solid ${colors.borderSubtle}`,
  },
  actionStep: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.primary,
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: radius.sm,
    flexShrink: 0,
  },
  actionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },
}
