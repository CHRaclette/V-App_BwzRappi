import { ApplicationSettings } from '@nativescript/core'

const USER_KEY = 'user'
const PUBLIC_KEYS_KEY = 'publicKeys'
const PENDING_EDIT_KEY = 'pendingEditReservation'

function getJson(key, fallback) {
  const raw = ApplicationSettings.getString(key, '')
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw)
  } catch (_) {
    return fallback
  }
}

function setJson(key, value) {
  ApplicationSettings.setString(key, JSON.stringify(value))
}

export function getUser() {
  return getJson(USER_KEY, null)
}

export function setUser(user) {
  setJson(USER_KEY, user)
}

export function clearUser() {
  ApplicationSettings.remove(USER_KEY)
}

export function getPublicKeys() {
  return getJson(PUBLIC_KEYS_KEY, [])
}

export function setPublicKeys(keys) {
  setJson(PUBLIC_KEYS_KEY, keys)
}

export function clearPublicKeys() {
  ApplicationSettings.remove(PUBLIC_KEYS_KEY)
}

export function clearSession() {
  clearUser()
  clearPublicKeys()
  clearPendingEditReservation()
}

export function getPendingEditReservation() {
  return getJson(PENDING_EDIT_KEY, null)
}

export function setPendingEditReservation(reservation) {
  setJson(PENDING_EDIT_KEY, reservation)
}

export function clearPendingEditReservation() {
  ApplicationSettings.remove(PENDING_EDIT_KEY)
}
