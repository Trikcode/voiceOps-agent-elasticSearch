import { useState, useRef, useCallback } from 'react'

interface UseVoiceRecorderReturn {
  isRecording: boolean
  isSupported: boolean
  startRecording: () => void
  stopRecording: () => Promise<Blob | null>
  error: string | null
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const resolveRef = useRef<((blob: Blob | null) => void) | null>(null)

  const isSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording not supported in this browser')
      return
    }

    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        resolveRef.current?.(blob)
        resolveRef.current = null
      }

      recorder.onerror = () => {
        setError('Recording error occurred')
        setIsRecording(false)
        resolveRef.current?.(null)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permissions.')
      setIsRecording(false)
    }
  }, [isSupported])

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state === 'inactive'
      ) {
        resolve(null)
        return
      }
      resolveRef.current = resolve
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    })
  }, [])

  return { isRecording, isSupported, startRecording, stopRecording, error }
}
