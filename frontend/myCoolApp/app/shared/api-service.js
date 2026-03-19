import { isAndroid } from '@nativescript/core'

const API_BASE_URLS = isAndroid
  ? ['http://10.0.2.2:8080']
  : ['http://localhost:8080', 'http://10.0.2.2:8080']

function toFormUrlEncoded(formBody) {
  return Object.keys(formBody)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(formBody[key] ?? '')}`)
    .join('&')
}

function buildUrl(baseUrl, path, query) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${baseUrl}${normalizedPath}`

  if (!query || typeof query !== 'object') {
    return url
  }

  const params = Object.keys(query)
    .filter((key) => query[key] !== undefined && query[key] !== null && query[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)

  if (params.length === 0) {
    return url
  }

  return `${url}?${params.join('&')}`
}

export async function request(path, options = {}) {
  const method = options.method || 'GET'
  const headers = options.headers || {}
  const baseRequestOptions = {
    method,
    headers: {
      ...headers,
    },
  }

  if (options.formBody) {
    baseRequestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    baseRequestOptions.body = toFormUrlEncoded(options.formBody)
  } else if (options.body !== undefined) {
    baseRequestOptions.headers['Content-Type'] =
      baseRequestOptions.headers['Content-Type'] || 'application/json'
    baseRequestOptions.body =
      typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
  }

  let lastError = null

  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(buildUrl(baseUrl, path, options.query), baseRequestOptions)
      const contentType = response.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')

      let data = null
      if (isJson) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      return {
        ok: response.ok,
        status: response.status,
        data,
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
