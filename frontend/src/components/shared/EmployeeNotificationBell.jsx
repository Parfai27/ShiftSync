import { useEffect, useState } from 'react'
import { FiBell } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function EmployeeNotificationBell({ unreadCount, userId, to = '/employee-notifications' }) {
	const navigate = useNavigate()
	const [fetchedUnreadCount, setFetchedUnreadCount] = useState(0)

	useEffect(() => {
		if (Number.isFinite(unreadCount) || !userId) {
			return
		}

		let cancelled = false

		async function loadUnreadCount() {
			try {
				const data = await apiRequest(`/api/employee/notifications/${userId}`)
				if (!cancelled) {
					setFetchedUnreadCount(data.unreadCount || 0)
				}
			} catch {
				if (!cancelled) {
					setFetchedUnreadCount(0)
				}
			}
		}

		loadUnreadCount()

		return () => {
			cancelled = true
		}
	}, [unreadCount, userId])

	const liveUnreadCount = Number.isFinite(unreadCount) ? unreadCount : fetchedUnreadCount

	return (
		<button
			className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"
			onClick={() => navigate(to)}
			type="button"
			aria-label="Open notifications"
		>
			<FiBell className="h-4 w-4" />
			{liveUnreadCount > 0 ? (
				<span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
					{liveUnreadCount > 9 ? '9+' : liveUnreadCount}
				</span>
			) : null}
		</button>
	)
}
