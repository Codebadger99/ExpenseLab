import { useEffect, useState } from "react"
import { apiRequest, getErrorMessage } from "../lib/api"

export function useResource<T>(path: string, refreshKey: number) {
  const [result, setResult] = useState<{
    key: string
    data: T | null
    error: string | null
  } | null>(null)
  const key = `${path}:${refreshKey}`

  useEffect(() => {
    let active = true
    apiRequest<T>(path)
      .then((result) => {
        if (active) setResult({ key, data: result, error: null })
      })
      .catch((reason: unknown) => {
        if (active) setResult({ key, data: null, error: getErrorMessage(reason) })
      })
    return () => {
      active = false
    }
  }, [key, path])

  const current = result?.key === key ? result : null
  return {
    data: current?.data ?? null,
    loading: current === null,
    error: current?.error ?? null,
  }
}
