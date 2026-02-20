import { useState } from 'react'
import {
  Database,
  Code,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import type { ESQLResult } from '../types'
import { api } from '../api/client'
import { colors, radius } from '../styles/theme'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

const PRESET_QUERIES = [
  { id: 'recent-actions', name: 'Recent Actions', endpoint: 'recent-actions' },
  { id: 'action-stats', name: 'Action Stats', endpoint: 'action-stats' },
  {
    id: 'tickets-by-priority',
    name: 'By Priority',
    endpoint: 'tickets-by-priority',
  },
  { id: 'slow-actions', name: 'Slow Actions', endpoint: 'slow-actions' },
]

export function ESQLExplorer() {
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const [result, setResult] = useState<ESQLResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedQuery, setExpandedQuery] = useState(false)

  async function runQuery(endpoint: string) {
    setIsLoading(true)
    setSelectedQuery(endpoint)
    try {
      const data = await api.runESQLQuery(endpoint)
      setResult(data)
    } catch (error) {
      setResult({ query: '', columns: [], values: [], error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card padding='sm'>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconContainer}>
            <Database size={18} color={colors.primary} />
          </div>
          <div>
            <h3 style={styles.title}>ES|QL Explorer</h3>
            <p style={styles.subtitle}>Run live queries</p>
          </div>
        </div>
        <Badge variant='info'>Live</Badge>
      </div>

      <div style={styles.queryGrid}>
        {PRESET_QUERIES.map((query) => (
          <button
            key={query.id}
            onClick={() => runQuery(query.endpoint)}
            disabled={isLoading}
            style={{
              ...styles.queryCard,
              ...(selectedQuery === query.endpoint
                ? styles.queryCardActive
                : {}),
            }}
          >
            <Code size={14} color={colors.primary} />
            <span style={styles.queryName}>{query.name}</span>
            {isLoading && selectedQuery === query.endpoint && (
              <Loader2
                size={12}
                style={{ animation: 'spin 1s linear infinite' }}
              />
            )}
          </button>
        ))}
      </div>

      {result && (
        <div style={styles.resultContainer}>
          <button
            onClick={() => setExpandedQuery(!expandedQuery)}
            style={styles.queryToggle}
          >
            {expandedQuery ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            <span>View Query</span>
          </button>

          {expandedQuery && result.query && (
            <pre style={styles.queryCode}>{result.query}</pre>
          )}

          {result.error ? (
            <div style={styles.error}>Error: {result.error}</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {result.columns.map((col, i) => (
                      <th key={i} style={styles.th}>
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.values.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} style={styles.td}>
                          {formatCell(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.values.length > 5 && (
                <p style={styles.moreRows}>
                  +{result.values.length - 5} more rows
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  )
}

function formatCell(value: any): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? '✓' : '✗'
  if (typeof value === 'number') return value.toLocaleString()
  const str = String(value)
  if (str.length > 30) return str.substring(0, 30) + '...'
  return str
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `${colors.primary}15`,
    borderRadius: radius.md,
    flexShrink: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.textPrimary,
    margin: 0,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    margin: 0,
  },
  queryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8,
    marginBottom: 16,
  },
  queryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 12px',
    background: colors.bgElevated,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: radius.md,
    cursor: 'pointer',
    fontSize: 12,
    color: colors.textSecondary,
  },
  queryCardActive: {
    borderColor: colors.primary,
    background: `${colors.primary}11`,
  },
  queryName: {
    flex: 1,
    fontWeight: 500,
  },
  resultContainer: {
    borderTop: `1px solid ${colors.borderSubtle}`,
    paddingTop: 16,
  },
  queryToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 10px',
    background: colors.bgElevated,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: radius.sm,
    color: colors.textSecondary,
    fontSize: 12,
    cursor: 'pointer',
    marginBottom: 10,
  },
  queryCode: {
    padding: 12,
    background: '#0d1117',
    borderRadius: radius.sm,
    color: '#7ee787',
    fontSize: 11,
    fontFamily: 'monospace',
    overflow: 'auto',
    marginBottom: 12,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  error: {
    padding: 12,
    background: colors.errorBg,
    border: `1px solid ${colors.error}`,
    borderRadius: radius.sm,
    color: colors.error,
    fontSize: 12,
    wordBreak: 'break-word',
  },
  tableWrapper: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
  },
  th: {
    textAlign: 'left',
    padding: '8px 10px',
    fontSize: 10,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    borderBottom: `1px solid ${colors.borderSubtle}`,
    background: colors.bgElevated,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '8px 10px',
    fontSize: 11,
    color: colors.textSecondary,
    borderBottom: `1px solid ${colors.borderSubtle}`,
    whiteSpace: 'nowrap',
  },
  moreRows: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    padding: '10px 0',
    margin: 0,
  },
}
