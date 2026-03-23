import { Injectable } from '@angular/core'
import { ApplicationSettings } from '@nativescript/core'

const USER_KEY = 'user'
const PUBLIC_KEYS_KEY = 'publicKeys'
const PENDING_EDIT_KEY = 'pendingEditReservation'

function getJson<T>(key: string, fallback: T): T {
  const raw = ApplicationSettings.getString(key, '')
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch (_) {
    return fallback
  }
}

function setJson<T>(key: string, value: T): void {
  ApplicationSettings.setString(key, JSON.stringify(value))
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  getUser<T = { id?: string | number; name?: string } | null>(): T {
    return getJson(USER_KEY, null) as T
  }

  setUser(user: unknown): void {
    setJson(USER_KEY, user)
  }

  clearUser(): void {
    ApplicationSettings.remove(USER_KEY)
  }

  getPublicKeys(): string[] {
    return getJson(PUBLIC_KEYS_KEY, [])
  }

  setPublicKeys(keys: string[]): void {
    setJson(PUBLIC_KEYS_KEY, keys)
  }

  clearPublicKeys(): void {
    ApplicationSettings.remove(PUBLIC_KEYS_KEY)
  }

  getPendingEditReservation<T = unknown>(): T | null {
    return getJson<T | null>(PENDING_EDIT_KEY, null)
  }

  setPendingEditReservation(reservation: unknown): void {
    setJson(PENDING_EDIT_KEY, reservation)
  }

  clearPendingEditReservation(): void {
    ApplicationSettings.remove(PENDING_EDIT_KEY)
  }

  clearSession(): void {
    this.clearUser()
    this.clearPublicKeys()
    this.clearPendingEditReservation()
  }
}
