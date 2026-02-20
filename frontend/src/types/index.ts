export interface HealthStatus {
  status: string
  elasticsearch: string
  cluster_name?: string
  slack_configured?: boolean
  jira_configured?: boolean
  indices?: Record<string, number>
  error?: string
}

export interface IntentData {
  intent: string
  entities: {
    project?: string | null
    description?: string | null
    priority?: string | null
    assignee?: string | null
    channel?: string | null
    ticket_id?: string | null
    new_status?: string | null
  }
}

export interface SimilarTicket {
  ticket_id: string
  project: string
  summary: string
  description: string
  priority: string
  assignee: string
  team: string
  status: string
  created_at: string
  labels: string[]
  relevance_score?: number
}

export interface ActionPlan {
  reasoning: string
  actions: PlannedAction[]
  explanation: string
  confidence: string
  duplicate_warning?: string | null
  clarification_needed?: string | null
}

export interface PlannedAction {
  step: number
  type: string
  description: string
  params: Record<string, unknown>
}

export interface PipelineData {
  step1_intent: IntentData
  step2_context: {
    similar_tickets: SimilarTicket[]
    target_ticket?: SimilarTicket | null
    past_commands_found: number
    past_actions_found: number
    stats?: Record<string, Record<string, number>>
  }
  step3_plan: ActionPlan
  // relevance_score?: number
}

export interface CommandResult {
  success: boolean
  command_id: string
  transcript: string
  duration_ms: number
  status:
    | 'pending_confirmation'
    | 'needs_clarification'
    | 'executed'
    | 'rejected'
  clarification?: string
  pipeline: PipelineData
  execution_results?: ExecutionResult[]
}

export interface ExecutionResult {
  step: number
  type: string
  description: string
  status: 'success' | 'failed' | 'error'
  result?: Record<string, unknown>
  error?: string
}

export interface ConfirmResponse {
  success: boolean
  command_id: string
  status: string
  execution_results?: ExecutionResult[]
  total_actions?: number
  successful_actions?: number
}

export interface AuditAction {
  action_id: string
  command_id: string
  action_type: string
  tool_used: string
  success: boolean
  reasoning: string
  explanation: string
  timestamp: string
  duration_ms: number
  user: string
}

export interface Ticket {
  ticket_id: string
  project: string
  summary: string
  description: string
  priority: string
  assignee: string
  team: string
  status: string
  created_at: string
  labels: string[]
  jira_url?: string
}

export interface AnalyticsData {
  tickets: {
    total: number
    by_project: Record<string, number>
    by_priority: Record<string, number>
    by_status: Record<string, number>
  }
  actions: {
    total: number
    by_type: Record<string, number>
    by_tool: Record<string, number>
    avg_duration_ms: number
  }
}

export interface CommandHistoryEntry {
  transcript: string
  result: CommandResult
  executionResult?: ConfirmResponse
  time: Date
}

export interface ImpactData {
  time_saved: {
    total_seconds_saved: number
    formatted: string
    action_counts: Record<string, number>
    total_actions: number
    avg_time_saved_per_action: number
  }
  automation_stats: {
    total_automated_actions: number
    actions_per_day: number
    success_rate: string
  }
  efficiency_gain: {
    manual_time_estimate: string
    actual_time: string
    efficiency_multiplier: string
  }
}

export interface ESQLResult {
  query: string
  columns: Array<{ name: string; type: string }>
  values: any[][]
  total?: number
  error?: string
}
