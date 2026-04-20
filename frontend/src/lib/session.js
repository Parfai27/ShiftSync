const SESSION_KEY = 'shiftsync-session'

export function saveSession(session) {
	localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function loadSession() {
	const raw = localStorage.getItem(SESSION_KEY)
	if (!raw) {
		return null
	}

	try {
		return JSON.parse(raw)
	} catch {
		localStorage.removeItem(SESSION_KEY)
		return null
	}
}

export function clearSession() {
	localStorage.removeItem(SESSION_KEY)
}
