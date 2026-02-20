import type {
  CommandResult,
  ConfirmResponse,
  HealthStatus,
  AuditAction,
  Ticket,
  AnalyticsData,
  ImpactData,
  ESQLResult,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  health: () => request<HealthStatus>('/api/health'),

  processCommand: (transcript: string) =>
    request<CommandResult>('/api/process-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    }),

  confirmAction: (commandId: string, approved: boolean) =>
    request<ConfirmResponse>('/api/confirm-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command_id: commandId, approved }),
    }),

  quickExecute: (transcript: string) =>
    request<CommandResult>('/api/quick-execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    }),

  transcribeAudio: async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    const res = await fetch(`${API_URL}/api/transcribe`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) throw new Error('Transcription failed')
    const data = await res.json()
    return data.transcript
  },

  getAuditLog: () =>
    request<{ actions: AuditAction[]; total: number }>('/api/audit-log'),

  getTickets: () =>
    request<{ tickets: Ticket[]; total: number }>('/api/tickets'),

  getAnalytics: () => request<AnalyticsData>('/api/analytics'),

  getImpact: () => request<ImpactData>('/api/impact'),

  getAgentInfo: () => request<any>('/api/agent-info'),

  runESQLQuery: (endpoint: string) =>
    request<ESQLResult>(`/api/esql/${endpoint}`),

  runCustomESQL: (query: string) =>
    request<ESQLResult>('/api/esql/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }),
}
