import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	FiAlertCircle,
	FiBell,
	FiCalendar,
	FiCheck,
	FiClock,
	FiDollarSign,
	FiGrid,
	FiInfo,
	FiLogOut,
	FiMenu,
	FiSearch,
	FiSettings,
	FiUser,
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession, loadSession } from '../../lib/session'
import EmployeeNotificationBell from '../shared/EmployeeNotificationBell'
import EmployeeProfileMenu from '../shared/EmployeeProfileMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

const fallbackPage = {
	employeeName: 'Employee',
	roleLabel: 'EMPLOYEE',
	totalCount: 0,
	unreadCount: 0,
	scheduleCount: 0,
	systemCount: 0,
	notifications: [],
}

function EmployeeSidebar() {
	return (
		<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
			<div className="flex w-full items-center justify-start gap-3">
				<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
			</div>

			<nav className="space-y-2 text-[14px] font-medium text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-dashboard"><FiGrid className="h-4 w-4" /> My Overview</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-schedule"><FiCalendar className="h-4 w-4" /> My Schedule</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-announcements"><FiBell className="h-4 w-4" /> Announcements</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-profile"><FiUser className="h-4 w-4" /> My Profile</Link>
				<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
			</nav>

			<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link>
			</div>
		</aside>
	)
}

function Toggle({ active }) {
	return (
		<span className={`relative inline-flex h-7 w-13 items-center rounded-full transition ${active ? 'bg-[#0f51ff]' : 'bg-slate-300'}`}>
			<span className={`inline-block h-5 w-5 rounded-full bg-white transition ${active ? 'translate-x-7' : 'translate-x-1'}`} />
		</span>
	)
}

function resolveNotificationStyle(kind, unread) {
	if (kind === 'schedule') {
		return {
			tone: unread ? 'border-l-[#1f56ea]' : 'border-l-[#9db5ff]',
			iconTone: unread ? 'bg-[#e9eeff] text-[#1f56ea]' : 'bg-slate-100 text-slate-500',
			icon: FiCalendar,
		}
	}
	if (kind === 'pay') {
		return {
			tone: unread ? 'border-l-[#0f766e]' : 'border-l-[#99d8d2]',
			iconTone: unread ? 'bg-[#e6fffb] text-[#0f766e]' : 'bg-slate-100 text-slate-500',
			icon: FiDollarSign,
		}
	}
	return {
		tone: unread ? 'border-l-[#d62e2e]' : 'border-l-[#d1d5db]',
		iconTone: unread ? 'bg-[#ffe9e7] text-[#d62e2e]' : 'bg-slate-100 text-slate-500',
		icon: unread ? FiAlertCircle : FiInfo,
	}
}

function resolveNotificationLabel(kind) {
	if (kind === 'schedule') {
		return 'Schedule'
	}
	if (kind === 'pay') {
		return 'Payroll'
	}
	return 'System'
}

function resolveNotificationContext(notification) {
	if (notification.kind === 'schedule') {
		return 'Shift roster update'
	}
	if (notification.kind === 'pay') {
		return 'Payroll and earnings notice'
	}
	return 'System-wide update'
}

function resolveNotificationPath(notification) {
	const text = [notification.title, notification.detail, notification.kind].join(' ').toLowerCase()
	if (text.includes('pay') || text.includes('payroll') || text.includes('earn')) {
		return '/employee-earnings'
	}
	if (text.includes('announcement') || text.includes('news') || text.includes('update')) {
		return '/employee-announcements'
	}
	if (text.includes('profile')) {
		return '/employee-profile'
	}
	if (text.includes('setting') || text.includes('password')) {
		return '/employee-settings'
	}
	if (text.includes('shift') || text.includes('schedule') || text.includes('swap') || notification.kind === 'schedule') {
		return '/employee-schedule'
	}
	return null
}

export default function EmployeeNotifications() {
	const navigate = useNavigate()
	const session = loadSession()
	const [page, setPage] = useState(fallbackPage)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [filterMode, setFilterMode] = useState('ALL')
	const [selectedNotification, setSelectedNotification] = useState(null)
	const [quietHoursEnabled, setQuietHoursEnabled] = useState(true)
	const [isLoading, setIsLoading] = useState(true)
	const [actionMessage, setActionMessage] = useState('')

	useEffect(() => {
		let cancelled = false

		async function loadNotifications() {
			if (!session?.userId) {
				setError('No employee session found. Please log in again.')
				setIsLoading(false)
				return
			}

			try {
				setError('')
				const data = await apiRequest(`/api/employee/notifications/${session.userId}`)
				if (!cancelled) {
					setPage(data)
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load employee notifications.')
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		loadNotifications()

		return () => {
			cancelled = true
		}
	}, [session?.userId])

	const reloadNotifications = useCallback(async () => {
		if (!session?.userId) {
			setError('No employee session found. Please log in again.')
			return
		}
		try {
			setError('')
			const data = await apiRequest(`/api/employee/notifications/${session.userId}`)
			setPage(data)
		} catch (loadError) {
			setError(loadError.message || 'Unable to refresh notifications.')
		}
	}, [session?.userId])

	useEffect(() => {
		if (!session?.userId) {
			return undefined
		}

		const intervalId = window.setInterval(() => {
			void reloadNotifications()
		}, 3000)

		return () => window.clearInterval(intervalId)
	}, [session?.userId, reloadNotifications])

	async function updateNotification(notificationId, read) {
		if (!session?.userId) {
			setError('No employee session found. Please log in again.')
			return
		}
		try {
			setError('')
			setActionMessage('')
			await apiRequest(`/api/employee/notifications/${session.userId}/${notificationId}`, {
				method: 'PATCH',
				body: JSON.stringify({ read }),
			})
			await reloadNotifications()
			setActionMessage(read ? 'Notification marked as read.' : 'Notification marked as unread.')
		} catch (requestError) {
			setError(requestError.message || 'Unable to update this notification.')
		}
	}

	async function markAllAsRead() {
		if (!session?.userId) {
			setError('No employee session found. Please log in again.')
			return
		}
		try {
			setError('')
			setActionMessage('')
			await apiRequest(`/api/employee/notifications/${session.userId}/mark-all-read`, {
				method: 'POST',
			})
			await reloadNotifications()
			setActionMessage('All notifications marked as read.')
		} catch (requestError) {
			setError(requestError.message || 'Unable to mark all notifications as read.')
		}
	}

	const normalizedSearch = searchTerm.trim().toLowerCase()
	const visibleNotifications = useMemo(() => {
		return page.notifications.filter((item) => {
			const matchesSearch = !normalizedSearch || [item.title, item.detail, item.when, item.kind].join(' ').toLowerCase().includes(normalizedSearch)
			const matchesFilter =
				filterMode === 'ALL' ||
				(filterMode === 'UNREAD' && item.unread) ||
				(filterMode === 'SCHEDULE' && item.kind === 'schedule') ||
				(filterMode === 'SYSTEM' && item.kind === 'system')
			return matchesSearch && matchesFilter
		})
	}, [filterMode, normalizedSearch, page.notifications])

	function openNotificationDetails(item) {
		setSelectedNotification(item)
	}

	async function openNotificationRoute(item) {
		const path = resolveNotificationPath(item)
		if (!path) {
			openNotificationDetails(item)
			return
		}
		if (item.unread) {
			await updateNotification(item.id, true)
		}
		navigate(path)
	}

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<EmployeeSidebar />

				<div className="dashboard-main-offset flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden">
							<button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700" onClick={() => navigate('/employee-dashboard')} type="button"><FiMenu className="h-5 w-5" /></button>
							<div className="flex min-w-0 items-center gap-3">
								<span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f51ff] text-xs font-black text-white">S</span>
								<div className="min-w-0">
									<div className="truncate text-sm font-extrabold text-slate-900">ShiftSync</div>
									<div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Workforce Management</div>
								</div>
							</div>
						</div>

						<div className="mt-4 flex flex-col gap-4 xl:mt-0 xl:flex-row xl:items-center xl:justify-between">
							<label className="relative w-full max-w-3xl">
								<FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search notifications and updates..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<EmployeeNotificationBell unreadCount={page.unreadCount} userId={session?.userId} />
								<ThemeToggleButton />
								<EmployeeProfileMenu name={page.employeeName} profileImageUrl={session?.profileImageUrl} role={page.roleLabel} />
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section>
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h1 className="text-4xl font-black tracking-[-0.05em] text-slate-900 sm:text-5xl">Notifications</h1>
									<p className="mt-2 max-w-3xl text-base leading-7 text-slate-500 sm:text-lg">
										Stay updated with your latest schedule changes, payroll notices, and pharmacy system updates.
									</p>
								</div>
								<button className="rounded-xl bg-[#dfe8ff] px-5 py-3 text-sm font-bold text-[#1f56ea]" onClick={markAllAsRead} type="button"><FiCheck className="mr-1 inline h-4 w-4" /> Mark all as read</button>
							</div>

							{error ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
							{actionMessage ? <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div> : null}

							<div className="mt-5 inline-flex rounded-2xl bg-[#ebeff9] p-1 text-sm font-semibold text-slate-600">
								<button className={`rounded-xl px-5 py-2 ${filterMode === 'ALL' ? 'bg-white text-[#1f56ea]' : ''}`} onClick={() => setFilterMode('ALL')} type="button">All</button>
								<button className={`rounded-xl px-5 py-2 ${filterMode === 'UNREAD' ? 'bg-white text-[#1f56ea]' : ''}`} onClick={() => setFilterMode('UNREAD')} type="button">Unread</button>
								<button className={`rounded-xl px-5 py-2 ${filterMode === 'SCHEDULE' ? 'bg-white text-[#1f56ea]' : ''}`} onClick={() => setFilterMode('SCHEDULE')} type="button">Schedule</button>
								<button className={`rounded-xl px-5 py-2 ${filterMode === 'SYSTEM' ? 'bg-white text-[#1f56ea]' : ''}`} onClick={() => setFilterMode('SYSTEM')} type="button">System</button>
							</div>

							<div className="mt-5 grid gap-3 sm:grid-cols-3">
								<div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
									<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Unread</div>
									<div className="mt-2 flex items-end gap-2">
										<div className="text-4xl font-black tracking-[-0.05em] text-slate-950">{page.unreadCount}</div>
										<div className="pb-1 text-sm font-semibold text-slate-500">waiting</div>
									</div>
									<p className="mt-2 text-sm leading-6 text-slate-500">Items needing your attention right now.</p>
								</div>
								<div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
									<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Schedule</div>
									<div className="mt-2 flex items-end gap-2">
										<div className="text-4xl font-black tracking-[-0.05em] text-slate-950">{page.scheduleCount}</div>
										<div className="pb-1 text-sm font-semibold text-slate-500">updates</div>
									</div>
									<p className="mt-2 text-sm leading-6 text-slate-500">Roster and shift changes from the manager side.</p>
								</div>
								<div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
									<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">System</div>
									<div className="mt-2 flex items-end gap-2">
										<div className="text-4xl font-black tracking-[-0.05em] text-slate-950">{page.systemCount}</div>
										<div className="pb-1 text-sm font-semibold text-slate-500">notices</div>
									</div>
									<p className="mt-2 text-sm leading-6 text-slate-500">Platform reminders, policy updates, and alerts.</p>
								</div>
							</div>

							<div className="mt-5 space-y-3">
								{visibleNotifications.length ? visibleNotifications.map((item) => {
									const style = resolveNotificationStyle(item.kind, item.unread)
									const Icon = style.icon
									const kindLabel = resolveNotificationLabel(item.kind)
									const contextLabel = resolveNotificationContext(item)

									return (
										<article key={item.id} className={`relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(15,23,42,0.08)] ${style.tone} border-l-4`}>
											<div className={`absolute left-0 top-0 h-full w-1.5 ${item.unread ? 'bg-[#1f56ea]' : 'bg-slate-200'}`} />
											<div className="px-5 py-5 sm:px-6">
												<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
													<div className="flex items-start gap-4">
														<button
															className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 ${style.iconTone} shadow-sm`}
															onClick={() => openNotificationDetails(item)}
															type="button"
														>
															<Icon className="h-5 w-5" />
														</button>

														<div className="min-w-0">
															<div className="flex flex-wrap items-center gap-2">
																<span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${item.unread ? 'bg-[#eef3ff] text-[#1f56ea]' : 'bg-slate-100 text-slate-500'}`}>
																	{kindLabel}
																</span>
																<span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${item.unread ? 'bg-[#fff1f1] text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
																	{item.unread ? 'Unread' : 'Read'}
																</span>
																<span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
																	{contextLabel}
																</span>
															</div>
															<button className="mt-3 block text-left" onClick={() => openNotificationRoute(item)} type="button">
																<h2 className="text-[19px] font-black tracking-[-0.04em] text-slate-950 sm:text-[21px]">
																	{item.title}
																</h2>
															</button>
															<button
																className="mt-2 block max-w-4xl text-left text-sm leading-6 text-slate-600 sm:text-[15px]"
																onClick={() => openNotificationRoute(item)}
																style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}
																type="button"
															>
																{item.detail}
															</button>
														</div>
													</div>

													<div className="flex shrink-0 items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
														<FiClock className="h-3.5 w-3.5" />
														{item.when}
													</div>
												</div>

												<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
													<div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
														<span>{item.kind === 'schedule' ? 'Related to your rota' : item.kind === 'pay' ? 'Payroll update' : 'System update'}</span>
													</div>
													<div className="flex flex-wrap items-center gap-2">
														<button
															className="rounded-full bg-[#eef3ff] px-4 py-2 text-sm font-bold text-[#1f56ea] transition hover:bg-[#e1e9ff]"
															onClick={() => openNotificationDetails(item)}
															type="button"
														>
															View details
														</button>
														<button
															className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
															onClick={() => updateNotification(item.id, !item.unread)}
															type="button"
														>
															{item.unread ? 'Mark as read' : 'Mark as unread'}
														</button>
													</div>
												</div>
											</div>
										</article>
									)
								}) : (
									<div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-sm text-slate-500">{isLoading ? 'Loading employee notifications...' : 'No notifications matched the current filters.'}</div>
								)}
							</div>
						</section>

						<section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
							<article className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-[#0f51ff] p-6 text-white shadow-[0_16px_34px_rgba(15,23,42,0.07)]">
								<div className="flex items-start justify-between gap-4">
									<div>
										<div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-100/90">Notification summary</div>
										<h3 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-[34px]">Live inbox snapshot</h3>
										<p className="mt-2 max-w-xl text-sm leading-7 text-blue-100/85">A quick view of what is waiting for you, what changed in your rota, and which system notices still need attention.</p>
									</div>
									<div className="rounded-2xl bg-white/12 px-4 py-3 text-right">
										<div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-100/80">Total</div>
										<div className="mt-1 text-3xl font-black tracking-[-0.04em]">{page.totalCount}</div>
									</div>
								</div>

								<div className="mt-5 grid grid-cols-3 gap-3">
									<div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
										<div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-100/75">Unread</div>
										<div className="mt-2 text-3xl font-black tracking-[-0.05em]">{page.unreadCount}</div>
									</div>
									<div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
										<div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-100/75">Schedule</div>
										<div className="mt-2 text-3xl font-black tracking-[-0.05em]">{page.scheduleCount}</div>
									</div>
									<div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
										<div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-100/75">System</div>
										<div className="mt-2 text-3xl font-black tracking-[-0.05em]">{page.systemCount}</div>
									</div>
								</div>
								<FiBell className="pointer-events-none absolute -bottom-5 right-3 h-30 w-30 text-blue-300/25" />
							</article>

							<article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
								<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Focus mode</div>
								<h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-900">Quiet Hours</h3>
								<p className="mt-2 text-sm leading-7 text-slate-600">Mute notifications during your off-work hours to keep your attention on the job and reduce distraction.</p>
								<div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
									<div className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"><FiInfo className="h-4 w-4" /> Quiet hours {quietHoursEnabled ? 'enabled' : 'paused'}</div>
									<button onClick={() => setQuietHoursEnabled((current) => !current)} type="button"><Toggle active={quietHoursEnabled} /></button>
								</div>
							</article>
						</section>
					</div>
				</div>
			</div>

			{selectedNotification ? (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-xl rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">{selectedNotification.title}</h2>
								<div className="mt-2 text-sm font-semibold text-slate-500">{selectedNotification.when}</div>
							</div>
							<button className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" onClick={() => setSelectedNotification(null)} type="button">Close</button>
						</div>
						<p className="mt-5 rounded-2xl bg-[#f8faff] p-5 text-sm leading-7 text-slate-700">{selectedNotification.detail}</p>
						<div className="mt-5 flex flex-wrap justify-end gap-3">
							{resolveNotificationPath(selectedNotification) ? (
								<button className="rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-bold text-[#0f51ff]" onClick={() => openNotificationRoute(selectedNotification)} type="button">
									Open Related Page
								</button>
							) : null}
							<button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700" onClick={() => updateNotification(selectedNotification.id, !selectedNotification.unread)} type="button">
								{selectedNotification.unread ? 'Mark as Read' : 'Mark as Unread'}
							</button>
							<button className="rounded-full bg-[#0f51ff] px-4 py-2 text-sm font-bold text-white" onClick={() => setSelectedNotification(null)} type="button">Done</button>
						</div>
					</div>
				</div>
			) : null}
		</main>
	)
}
