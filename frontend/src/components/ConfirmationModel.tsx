import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react'
import type { CommandResult, ConfirmResponse, ExecutionResult } from '../types'
import { colors, radius, shadows } from '../styles/theme'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'

interface Props {
  result: CommandResult
  executionResult: ConfirmResponse | null
  isProcessing: boolean
  onConfirm: (commandId: string, approved: boolean) => void
  onClear: () => void
}

export function ConfirmationModal({
  result,
  executionResult,
  isProcessing,
  onConfirm,
  onClear,
}: Props) {
  // Needs clarification
  if (result.status === 'needs_clarification') {
    return (
      <div style={styles.overlay}>
        <div style={{ ...styles.modal, maxWidth: 480 }}>
          <button onClick={onClear} style={styles.closeBtn}>
            <X size={20} />
          </button>

          <div style={styles.iconContainer}>
            <AlertTriangle size={32} color={colors.warning} />
          </div>

          <h3 style={styles.title}>Clarification Needed</h3>
          <p style={styles.message}>{result.clarification}</p>

          <Button onClick={onClear} variant='secondary' fullWidth>
            Dismiss
          </Button>
        </div>
      </div>
    )
  }

  // Execution complete
  if (executionResult) {
    const isSuccess = executionResult.status === 'executed'

    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <button onClick={onClear} style={styles.closeBtn}>
            <X size={20} />
          </button>

          <div
            style={{
              ...styles.iconContainer,
              background: isSuccess ? colors.successBg : colors.errorBg,
            }}
          >
            {isSuccess ? (
              <CheckCircle2 size={32} color={colors.success} />
            ) : (
              <XCircle size={32} color={colors.error} />
            )}
          </div>

          <h3 style={styles.title}>
            {isSuccess
              ? `Executed ${executionResult.successful_actions}/${executionResult.total_actions} Actions`
              : 'Action Rejected'}
          </h3>

          {executionResult.execution_results && (
            <div style={styles.resultsList}>
              {executionResult.execution_results.map(
                (r: ExecutionResult, i: number) => {
                  const res = r.result as Record<string, unknown> | undefined
                  const jira = res?.jira as Record<string, unknown> | undefined
                  const jiraKey = jira?.jira_key as string | undefined
                  const jiraUrl = jira?.jira_url as string | undefined
                  const ticketId = res?.ticket_id as string | undefined

                  return (
                    <div key={i} style={styles.resultItem}>
                      <div style={styles.resultIcon}>
                        {r.status === 'success' ? (
                          <CheckCircle2 size={16} color={colors.success} />
                        ) : (
                          <XCircle size={16} color={colors.error} />
                        )}
                      </div>
                      <span style={styles.resultText}>{r.description}</span>
                      <div style={styles.resultBadges}>
                        {ticketId && (
                          <Badge variant='success'>{ticketId}</Badge>
                        )}
                        {jiraKey && jiraUrl && (
                          <a
                            href={jiraUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={styles.jiraLink}
                          >
                            {jiraKey}
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          )}

          <Button onClick={onClear} variant='primary' fullWidth>
            New Command
          </Button>
        </div>
      </div>
    )
  }

  // Pending confirmation
  if (result.status === 'pending_confirmation') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <button onClick={onClear} style={styles.closeBtn}>
            <X size={20} />
          </button>

          <div
            style={{ ...styles.iconContainer, background: colors.warningBg }}
          >
            <AlertTriangle size={32} color={colors.warning} />
          </div>

          <h3 style={styles.title}>Review & Confirm</h3>
          <p style={styles.message}>{result.pipeline.step3_plan.explanation}</p>

          <div style={styles.actionPreview}>
            <span style={styles.previewLabel}>Planned Actions</span>
            {result.pipeline.step3_plan.actions.map((action) => (
              <div key={action.step} style={styles.previewAction}>
                <Badge variant='info'>Step {action.step}</Badge>
                <span style={styles.actionType}>{action.type}</span>
                <span style={styles.actionDesc}>{action.description}</span>
              </div>
            ))}
          </div>

          <div style={styles.buttons}>
            <Button
              onClick={() => onConfirm(result.command_id, true)}
              disabled={isProcessing}
              variant='success'
              icon={
                isProcessing ? (
                  <Loader2
                    size={16}
                    style={{ animation: 'spin 1s linear infinite' }}
                  />
                ) : (
                  <CheckCircle2 size={16} />
                )
              }
            >
              {isProcessing ? 'Executing...' : 'Confirm'}
            </Button>
            <Button
              onClick={() => onConfirm(result.command_id, false)}
              disabled={isProcessing}
              variant='danger'
              icon={<XCircle size={16} />}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 24,
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: 520,
    background: colors.bgCard,
    borderRadius: radius.xl,
    border: `1px solid ${colors.borderSubtle}`,
    padding: 32,
    boxShadow: shadows.lg,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bgElevated,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: radius.md,
    color: colors.textMuted,
    cursor: 'pointer',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    background: colors.bgElevated,
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: colors.textPrimary,
    textAlign: 'center',
    margin: '0 0 12px',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 1.6,
    margin: '0 0 24px',
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 24,
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    background: colors.bgElevated,
    borderRadius: radius.md,
  },
  resultIcon: {
    flexShrink: 0,
  },
  resultText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  resultBadges: {
    display: 'flex',
    gap: 8,
  },
  jiraLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    background: colors.infoBg,
    borderRadius: radius.sm,
    color: colors.info,
    fontSize: 12,
    fontWeight: 500,
    textDecoration: 'none',
  },
  actionPreview: {
    background: colors.bgElevated,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 24,
  },
  previewLabel: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 12,
  },
  previewAction: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 0',
    borderBottom: `1px solid ${colors.borderSubtle}`,
  },
  actionType: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.primary,
  },
  actionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  buttons: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
}
