import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearSession, getSessionTimeoutMessage, isSessionExpired, loadSession, touchSession } from '../../lib/session'

const ACTIVITY_EVENTS = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart']

export default function SessionManager() {
	const location = useLocation()
	const navigate = useNavigate()

	useEffect(() => {
		const session = loadSession()
		if (!session) {
			return
		}

		if (isSessionExpired(session)) {
			clearSession()
			if (location.pathname !== '/login') {
				navigate('/login', {
					replace: true,
					state: { message: getSessionTimeoutMessage() },
				})
			}
			return
		}

		const interval = window.setInterval(() => {
			const currentSession = loadSession()
			if (!currentSession) {
				return
			}

			if (isSessionExpired(currentSession)) {
				clearSession()
				navigate('/login', {
					replace: true,
					state: { message: getSessionTimeoutMessage() },
				})
			}
		}, 30 * 1000)

		function handleActivity() {
			touchSession()
		}

		ACTIVITY_EVENTS.forEach((eventName) => {
			window.addEventListener(eventName, handleActivity, { passive: true })
		})

		return () => {
			window.clearInterval(interval)
			ACTIVITY_EVENTS.forEach((eventName) => {
				window.removeEventListener(eventName, handleActivity)
			})
		}
	}, [location.pathname, navigate])

	return null
}
