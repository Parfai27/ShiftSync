const LOCAL_SESSION_KEY = 'shiftsync-session'
const SESSION_STORAGE_KEY = 'shiftsync-session-temporary'
const DEFAULT_SESSION_TIMEOUT_MINUTES = 30
const REMEMBERED_SESSION_TIMEOUT_MINUTES = 60 * 8
const REMEMBERED_SESSION_MAX_DAYS = 7
const ACTIVITY_TOUCH_INTERVAL_MS = 60 * 1000

function getStorage(remember) {
	return remember ? localStorage : sessionStorage
}

function normalizeSession(session) {
	if (!session) {
		return null
	}

	const remember = Boolean(session.remember)
	const timeoutMinutes = remember ? REMEMBERED_SESSION_TIMEOUT_MINUTES : DEFAULT_SESSION_TIMEOUT_MINUTES
	const loggedInAt = session.loggedInAt || new Date().toISOString()
	const lastActivityAt = session.lastActivityAt || loggedInAt
	const expiresAt = session.expiresAt || new Date(new Date(loggedInAt).getTime() + timeoutMinutes * 60 * 1000).toISOString()
	const maxExpiresAt = remember
		? session.maxExpiresAt || new Date(new Date(loggedInAt).getTime() + REMEMBERED_SESSION_MAX_DAYS * 24 * 60 * 60 * 1000).toISOString()
		: null

	return {
		...session,
		remember,
		loggedInAt,
		lastActivityAt,
		expiresAt,
		maxExpiresAt,
	}
}

function writeSession(session) {
	const normalized = normalizeSession(session)
	if (!normalized) {
		return
	}

	clearSession()
	const storage = getStorage(normalized.remember)
	const key = normalized.remember ? LOCAL_SESSION_KEY : SESSION_STORAGE_KEY
	storage.setItem(key, JSON.stringify(normalized))
}

export function saveSession(session) {
	writeSession(session)
}

export function loadSession() {
	const localRaw = localStorage.getItem(LOCAL_SESSION_KEY)
	const sessionRaw = sessionStorage.getItem(SESSION_STORAGE_KEY)
	const raw = localRaw || sessionRaw
	if (!raw) {
		return null
	}

	try {
		const parsed = JSON.parse(raw)
		const normalized = normalizeSession(parsed)
		if (!normalized || isSessionExpired(normalized)) {
			clearSession()
			return null
		}
		return normalized
	} catch {
		clearSession()
		return null
	}
}

export function clearSession() {
	localStorage.removeItem(LOCAL_SESSION_KEY)
	sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

export function isSessionExpired(session = loadSession()) {
	if (!session?.expiresAt) {
		return true
	}

	const now = Date.now()
	const expiresAt = new Date(session.expiresAt).getTime()
	const maxExpiresAt = session.maxExpiresAt ? new Date(session.maxExpiresAt).getTime() : null

	if (Number.isNaN(expiresAt) || now >= expiresAt) {
		return true
	}

	if (maxExpiresAt && (Number.isNaN(maxExpiresAt) || now >= maxExpiresAt)) {
		return true
	}

	return false
}

export function touchSession() {
	const session = loadSession()
	if (!session) {
		return null
	}

	const now = Date.now()
	const lastActivityAt = session.lastActivityAt ? new Date(session.lastActivityAt).getTime() : 0
	if (now - lastActivityAt < ACTIVITY_TOUCH_INTERVAL_MS) {
		return session
	}

	const timeoutMinutes = session.remember ? REMEMBERED_SESSION_TIMEOUT_MINUTES : DEFAULT_SESSION_TIMEOUT_MINUTES
	const updated = {
		...session,
		lastActivityAt: new Date(now).toISOString(),
		expiresAt: new Date(now + timeoutMinutes * 60 * 1000).toISOString(),
	}
	writeSession(updated)
	return updated
}

export function getSessionTimeoutMessage() {
	return 'Your session expired due to inactivity. Please sign in again.'
}
