import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import type {
  HealthStatus,
  CommandResult,
  ConfirmResponse,
  AuditAction,
  Ticket,
  AnalyticsData,
  CommandHistoryEntry,
  ImpactData,
} from '../types'

export function useAgent() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<CommandResult | null>(null)
  const [executionResult, setExecutionResult] =
    useState<ConfirmResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [auditLog, setAuditLog] = useState<AuditAction[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [history, setHistory] = useState<CommandHistoryEntry[]>([])
  const [impact, setImpact] = useState<ImpactData | null>(null)

  const refreshData = useCallback(async () => {
    try {
      const [auditData, ticketData, analyticsData, impactData] =
        await Promise.all([
          api.getAuditLog(),
          api.getTickets(),
          api.getAnalytics(),
          api.getImpact().catch(() => null),
        ])
      setAuditLog(auditData.actions)
      setTickets(ticketData.tickets)
      setAnalytics(analyticsData)
      if (impactData) setImpact(impactData)
    } catch {
      // Silently fail on background refresh
    }
  }, [])

  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch(() =>
        setHealth({ status: 'unhealthy', elasticsearch: 'disconnected' }),
      )
    refreshData()
  }, [refreshData])

  const processCommand = useCallback(async (transcript: string) => {
    setIsProcessing(true)
    setError(null)
    setResult(null)
    setExecutionResult(null)

    try {
      const data = await api.processCommand(transcript)
      setResult(data)
      setHistory((prev) => [
        { transcript, result: data, time: new Date() },
        ...prev,
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const confirmAction = useCallback(
    async (commandId: string, approved: boolean) => {
      setIsProcessing(true)
      setError(null)

      try {
        const data = await api.confirmAction(commandId, approved)
        setExecutionResult(data)

        setHistory((prev) =>
          prev.map((entry) =>
            entry.result.command_id === commandId
              ? { ...entry, executionResult: data }
              : entry,
          ),
        )

        await refreshData()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setIsProcessing(false)
      }
    },
    [refreshData],
  )

  const clearResult = useCallback(() => {
    setResult(null)
    setExecutionResult(null)
    setError(null)
  }, [])

  return {
    health,
    isProcessing,
    result,
    executionResult,
    error,
    auditLog,
    tickets,
    analytics,
    history,
    impact,
    processCommand,
    confirmAction,
    clearResult,
    refreshData,
  }
}
