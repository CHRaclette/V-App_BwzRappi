import { Injectable } from '@angular/core'
import { isAndroid } from '@nativescript/core'

const API_BASE_URLS = isAndroid
  ? ['http://localhost:8080', 'http://10.0.2.2:8080']
  : ['http://localhost:8080', 'http://10.0.2.2:8080']

function toFormUrlEncoded(formBody: Record<string, unknown>): string {
  return Object.keys(formBody)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(formBody[key] ?? ''))}`)
    .join('&')
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, unknown>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${baseUrl}${normalizedPath}`

  if (!query || typeof query !== 'object') {
    return url
  }

  const params = Object.keys(query)
    .filter((key) => query[key] !== undefined && query[key] !== null && query[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(query[key]))}`)

  if (params.length === 0) {
    return url
  }

  return `${url}?${params.join('&')}`
}

export interface ApiResponse<T = unknown> {
  ok: boolean
  status: number
  data: T | null
  error?: unknown
}

interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: unknown
  formBody?: Record<string, unknown>
  query?: Record<string, unknown>
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  async request<T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const method = options.method || 'GET'
    const headers = options.headers || {}
    const baseRequestOptions: RequestInit = {
      method,
      headers: {
        ...headers,
      },
    }

    if (options.formBody) {
      ;(baseRequestOptions.headers as Record<string, string>)['Content-Type'] =
        'application/x-www-form-urlencoded'
      baseRequestOptions.body = toFormUrlEncoded(options.formBody)
    } else if (options.body !== undefined) {
      ;(baseRequestOptions.headers as Record<string, string>)['Content-Type'] =
        (baseRequestOptions.headers as Record<string, string>)['Content-Type'] || 'application/json'
      baseRequestOptions.body =
        typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
    }

    let lastError: unknown = null

    for (const baseUrl of API_BASE_URLS) {
      try {
        const response = await fetch(buildUrl(baseUrl, path, options.query), baseRequestOptions)
        const contentType = response.headers.get('content-type') || ''
        const isJson = contentType.includes('application/json')

        // Parse response defensively to avoid classifying parse errors as connectivity failures.
        const rawBody = await response.text()
        let data: unknown = rawBody

        if (isJson) {
          if (!rawBody || rawBody.trim() === '') {
            data = null
          } else {
            try {
              data = JSON.parse(rawBody)
            } catch {
              data = rawBody
            }
          }
        }

        return {
          ok: response.ok,
          status: response.status,
          data: data as T,
        }
      } catch (error) {
        lastError = error
      }
    }

    return {
      ok: false,
      status: 0,
      data: null,
      error: lastError,
    }
  }
}
