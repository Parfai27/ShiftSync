const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function apiRequest(path, options = {}) {
	const response = await fetch(`${API_BASE}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
		...options,
	})

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

	return response.json()
}
