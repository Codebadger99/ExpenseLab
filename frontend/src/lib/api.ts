const API_URL = (import.meta.env.VITE_API_URL).replace(
  /\/$/,
  "",
)

export const ACCESS_TOKEN_KEY = "expense-lab-access-token"
export const USER_KEY = "expense-lab-user"
export const AUTH_REQUIRED_EVENT = "expense-lab:auth-required"

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  responseType?: "json" | "text"
}

export function apiRequest(
  path: string,
  options: RequestOptions & { responseType: "text" },
): Promise<string>
export function apiRequest<T>(
  path: string,
  options?: RequestOptions & { responseType?: "json" },
): Promise<T>
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T | string> {
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json")
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const responseText = await response.text()
  const contentType = response.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json") || contentType.includes("+json")
  let payload: unknown

  if (isJson && responseText) {
    try {
      payload = JSON.parse(responseText)
    } catch {
      throw new Error("We couldn’t understand the server response. Please try again shortly.")
    }
  } else {
    payload = responseText
  }

  if (!response.ok) {
    if (response.status === 401 && token && !path.startsWith("/auth/")) {
      window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT))
    }
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? payload.message
        : typeof payload === "string" && !payload.trimStart().startsWith("<")
          ? payload.trim()
          : null
    const detail = Array.isArray(message)
      ? message.join(", ")
      : typeof message === "string" && message
        ? message
        : "We couldn’t complete that request. Please try again shortly."
    throw new Error(detail)
  }

  if (response.status === 204) return undefined as T
  if (options.responseType === "text") return responseText
  if (!isJson && responseText) {
    throw new Error("We couldn’t understand the server response. Please try again shortly.")
  }
  return payload as T
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "We couldn’t reach the server. Check your connection and try again."
  }
  return error instanceof Error && error.message
    ? error.message
    : "Something went wrong. Please try again."
}
