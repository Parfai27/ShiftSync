import { clearSession, loadSession } from './session'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function apiRequest(path, options = {}) {
	const session = loadSession()
	const headers = {
		'Content-Type': 'application/json',
		...(options.headers || {}),
	}

	if (session?.token) {
		headers.Authorization = `Bearer ${session.token}`
	}

	const response = await fetch(`${API_BASE}${path}`, {
		headers,
		...options,
	})

	if (response.status === 401) {
		clearSession()
		throw new Error('Your session has expired. Please sign in again.')
	}

	if (!response.ok) {
		let message = 'Request failed'

		try {
			const data = await response.json()
			message = data.message || data.error || message
		} catch {
			message = response.statusText || message
		}

		throw new Error(message)
	}

	if (response.status === 204) {
		return null
	}

	const contentType = response.headers.get('content-type') || ''
	if (!contentType.includes('application/json')) {
		const text = await response.text()
		return text ? text : null
	}

	const text = await response.text()
	return text ? JSON.parse(text) : null
}
