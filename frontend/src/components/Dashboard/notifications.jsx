import {
	FiAlertTriangle,
	FiBell,
	FiCalendar,
	FiCheckCircle,
	FiChevronLeft,
	FiChevronDown,
	FiClock,
	FiHome,
	FiLayers,
	FiMail,
	FiLogOut,
	FiMenu,
	FiPieChart,
	FiPlus,
	FiSearch,
	FiSettings,
	FiSliders,
	FiUsers,
} from 'react-icons/fi'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession } from '../../lib/session'
import { resolveProfileImage, useManagerWorkspace } from '../../lib/managerWorkspace'
import ManagerProfileMenu from '../shared/ManagerProfileMenu'
import MobileManagerMenu from '../shared/MobileManagerMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

function NotificationCard({ item, onNavigate, onOpen, onPrimaryAction, onSecondaryAction, pendingNotificationId }) {
	if (item.kind === 'urgent') {
		return (
			<article className={`cursor-pointer overflow-hidden rounded-[26px] border bg-white transition ${item.read ? 'border-slate-200/80 opacity-80' : 'border-rose-300 shadow-[0_18px_45px_rgba(217,45,32,0.12)]'}`} onClick={() => onNavigate(item)} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onNavigate(item)}>
				<div className="grid gap-4 border-l-4 border-rose-600 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-start">
					<div className="flex items-start gap-4">
						<button
							className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600"
							onClick={(event) => {
								event.stopPropagation()
								onOpen(item)
							}}
							type="button"
						>
							<FiAlertTriangle className="h-5 w-5" />
						</button>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-3">
								<h3 className="text-lg font-black tracking-[-0.04em] text-slate-950 sm:text-xl">{item.title}</h3>
								{!item.read ? <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">Unread</span> : null}
								<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{item.time}</span>
							</div>
							<p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
							<div className="mt-4 flex flex-wrap gap-3">
								<button
									disabled={pendingNotificationId === item.id || item.read}
									onClick={(event) => {
										event.stopPropagation()
										onPrimaryAction(item.id)
									}}
									className="rounded-xl bg-[#d92d20] px-4 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
									type="button"
								>
									{pendingNotificationId === item.id ? 'Updating...' : item.read ? 'Resolved' : item.action}
								</button>
								{item.secondaryAction ? (
									<button
										disabled={pendingNotificationId === item.id || item.read}
										onClick={(event) => {
											event.stopPropagation()
											onSecondaryAction(item.id)
										}}
										className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
										type="button"
									>
										{item.secondaryAction}
									</button>
								) : null}
							</div>
						</div>
					</div>
				</div>
			</article>
		)
	}

	return (
		<article className={`cursor-pointer rounded-[26px] border p-5 transition sm:p-6 ${item.read ? 'border-slate-200/80 bg-white opacity-80' : item.kind === 'info' ? 'border-blue-200 bg-[#eef3ff] shadow-[0_18px_45px_rgba(15,81,255,0.08)]' : 'border-slate-300 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]'}`} onClick={() => onNavigate(item)} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onNavigate(item)}>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					<button
						className={`flex h-12 w-12 items-center justify-center rounded-full ${item.read ? 'bg-white text-slate-400' : 'bg-white text-[#0f51ff]'}`}
						onClick={(event) => {
							event.stopPropagation()
							onOpen(item)
						}}
						type="button"
					>
						{item.kind === 'swap' ? <FiCheckCircle className="h-5 w-5" /> : <FiMail className="h-5 w-5" />}
					</button>
					<div>
						<div className="flex flex-wrap items-center gap-3">
							<h3 className="text-lg font-black tracking-[-0.04em] text-slate-950">{item.title}</h3>
							{!item.read ? <span className="rounded-full bg-[#0f51ff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">Unread</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Read</span>}
						</div>
						<p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
						{item.link ? (
							<button
								disabled={pendingNotificationId === item.id || item.read}
								onClick={(event) => {
									event.stopPropagation()
									onPrimaryAction(item.id)
								}}
								className="mt-3 text-sm font-bold text-[#0f51ff] disabled:cursor-not-allowed disabled:opacity-60"
								type="button"
							>
								{item.read ? 'Read' : item.link}
							</button>
						) : null}
						{item.original || item.proposed ? (
							<div className={`mt-4 grid gap-3 rounded-2xl p-4 sm:grid-cols-2 ${item.read ? 'bg-slate-50' : 'bg-[#f5f7ff]'}`}>
								<div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Original</div><div className="mt-1 font-bold text-slate-900">{item.original}</div></div>
								<div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Proposed</div><div className="mt-1 font-bold text-slate-900">{item.proposed}</div></div>
							</div>
						) : null}
					</div>
				</div>
				<div className="text-right">
					<span className={`text-xs font-semibold ${item.read ? 'text-slate-400' : 'text-slate-500'}`}>{item.time}</span>
					{!item.link && !item.read ? (
						<button
							disabled={pendingNotificationId === item.id}
							onClick={(event) => {
								event.stopPropagation()
								onPrimaryAction(item.id)
							}}
							className="mt-3 block text-xs font-bold text-[#0f51ff] disabled:cursor-not-allowed disabled:opacity-60"
							type="button"
						>
							{pendingNotificationId === item.id ? 'Updating...' : item.action || 'Mark as read'}
						</button>
					) : null}
				</div>
			</div>
		</article>
	)
}

function NotificationReader({ item, onClose, onToggleRead, onOpenRelated, pendingNotificationId }) {
	if (!item) {
		return null
	}

	const busy = pendingNotificationId === item.id

	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
			<div className="w-full max-w-2xl rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl">
				<div className="flex items-start justify-between gap-4">
					<div>
						<div className="inline-flex items-center gap-2 rounded-full bg-[#eef3ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f51ff]">
							{item.kind}
						</div>
						<h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950">{item.title}</h2>
						<div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
							<span>{item.time}</span>
							<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${item.read ? 'bg-slate-100 text-slate-500' : 'bg-[#0f51ff] text-white'}`}>
								{item.read ? 'Read' : 'Unread'}
							</span>
						</div>
					</div>
					<button className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" onClick={onClose} type="button">Close</button>
				</div>

				<div className="mt-6 rounded-2xl bg-[#f8faff] p-5 text-sm leading-7 text-slate-700">
					{item.description}
				</div>

				{item.original || item.proposed ? (
					<div className="mt-5 grid gap-3 rounded-2xl bg-[#f5f7ff] p-4 sm:grid-cols-2">
						<div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Original</div><div className="mt-1 font-bold text-slate-900">{item.original}</div></div>
						<div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Proposed</div><div className="mt-1 font-bold text-slate-900">{item.proposed}</div></div>
					</div>
				) : null}

				<div className="mt-6 flex flex-wrap items-center gap-3">
					{resolveNotificationPath(item) ? (
						<button className="rounded-xl bg-[#eef2ff] px-4 py-3 text-sm font-bold text-[#0f51ff]" onClick={() => onOpenRelated(item)} type="button">
							Open Related Page
						</button>
					) : null}
					<button
						className="rounded-xl bg-[#0f51ff] px-4 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
						onClick={() => onToggleRead(item.id, !item.read)}
						disabled={busy}
						type="button"
					>
						{busy ? 'Updating...' : item.read ? 'Mark as unread' : 'Mark as read'}
					</button>
					<button className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700" onClick={onClose} type="button">
						Back to inbox
					</button>
				</div>
			</div>
		</div>
	)
}

function resolveNotificationPath(item) {
	const text = [item.title, item.description, item.kind, item.original || '', item.proposed || ''].join(' ').toLowerCase()
	if (text.includes('policy') || text.includes('compliance')) {
		return '/compliances'
	}
	if (text.includes('profile') || text.includes('employee')) {
		return '/profiles'
	}
	if (text.includes('report') || text.includes('attendance')) {
		return '/reports'
	}
	if (text.includes('swap') || text.includes('adjustment') || text.includes('request')) {
		return '/adjustments'
	}
	if (text.includes('shift') || text.includes('schedule') || text.includes('coverage')) {
		return '/scheduling'
	}
	if (text.includes('setting')) {
		return '/manager-settings'
	}
	return null
}

function isEmailSystemNotification(item) {
	const text = [item.title, item.description, item.kind].join(' ').toLowerCase()
	return (
		text.includes('emailed') ||
		text.includes('email was sent') ||
		text.includes('email sent') ||
		text.includes('weekly shift summary sent') ||
		text.includes('shift reminder email sent') ||
		text.includes('temporary password instructions emailed') ||
		text.includes('shift changes emailed')
	)
}

export default function Notifications() {
	const navigate = useNavigate()
	const { manager, workspace, isLoading, error, reloadWorkspace } = useManagerWorkspace()
	const profileImage = resolveProfileImage(manager?.profileImageUrl, manager?.fullName)
	const notifications = workspace.notifications
	const [actionError, setActionError] = useState('')
	const [actionMessage, setActionMessage] = useState('')
	const [pendingNotificationId, setPendingNotificationId] = useState(null)
	const [markingAllRead, setMarkingAllRead] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [activeFolder, setActiveFolder] = useState('All Inbox')
	const [showArchive, setShowArchive] = useState(false)
	const [selectedNotification, setSelectedNotification] = useState(null)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const allItems = useMemo(
		() => [...notifications.todayItems, ...notifications.earlierItems].filter((item) => !isEmailSystemNotification(item)),
		[notifications.earlierItems, notifications.todayItems],
	)
	const normalizedSearch = searchTerm.trim().toLowerCase()

	const filteredItems = useMemo(() => {
		return allItems.filter((item) => {
			const matchesSearch = !normalizedSearch || [
				item.title,
				item.description,
				item.kind,
				item.time,
				item.action || '',
				item.link || '',
			].join(' ').toLowerCase().includes(normalizedSearch)

			let matchesFolder = true
			if (activeFolder === 'Urgent Alerts') {
				matchesFolder = item.kind === 'urgent'
			} else if (activeFolder === 'Reminders') {
				matchesFolder = item.kind === 'info'
			} else if (activeFolder === 'System Updates') {
				matchesFolder = item.kind === 'swap' || item.kind === 'info'
			}

			const matchesArchive = showArchive ? item.read : true
			return matchesSearch && matchesFolder && matchesArchive
		})
	}, [activeFolder, allItems, normalizedSearch, showArchive])

	const todayItems = filteredItems.slice(0, 2)
	const earlierItems = filteredItems.slice(2)
	const folderCounts = useMemo(() => {
		const urgent = allItems.filter((item) => item.kind === 'urgent').length
		const reminders = allItems.filter((item) => item.kind === 'info').length
		const systemUpdates = allItems.filter((item) => item.kind === 'swap' || item.kind === 'info').length
		return {
			'All Inbox': allItems.length,
			'Urgent Alerts': urgent,
			'Reminders': reminders,
			'System Updates': systemUpdates,
		}
	}, [allItems])

	function openNotificationDetails(item) {
		setSelectedNotification(item)
	}

	function openNotificationRoute(item) {
		const path = resolveNotificationPath(item)
		if (!path) {
			openNotificationDetails(item)
			return
		}
		if (!item.read) {
			void updateNotification(item.id, true)
		}
		navigate(path)
	}

	async function updateNotification(notificationId, read = true) {
		try {
			setActionError('')
			setActionMessage('')
			setPendingNotificationId(notificationId)
			await apiRequest(`/api/manager/notifications/${manager.userId}/${notificationId}`, {
				method: 'PATCH',
				body: JSON.stringify({ read }),
			})
			await reloadWorkspace()
			setSelectedNotification((current) => (current && current.id === notificationId ? { ...current, read } : current))
			setActionMessage(read ? 'Notification updated successfully.' : 'Notification marked as unread successfully.')
		} catch (notificationError) {
			setActionError(notificationError.message || 'Unable to update this notification.')
		} finally {
			setPendingNotificationId(null)
		}
	}

	async function markAllRead() {
		try {
			setActionError('')
			setActionMessage('')
			setMarkingAllRead(true)
			await apiRequest(`/api/manager/notifications/${manager.userId}/mark-all-read`, {
				method: 'POST',
			})
			await reloadWorkspace()
			setActionMessage('All manager notifications were marked as read.')
		} catch (notificationError) {
			setActionError(notificationError.message || 'Unable to mark all notifications as read.')
		} finally {
			setMarkingAllRead(false)
		}
	}

	async function handleCreateShift() {
		try {
			setActionError('')
			setActionMessage('')
			await apiRequest('/api/scheduling/manager/create-shift', {
				method: 'POST',
				body: JSON.stringify({ managerId: manager.userId }),
			})
			setActionMessage('A weekly shift schedule was created successfully.')
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to create weekly shifts.')
		}
	}

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<MobileManagerMenu
				activePath="/notifications"
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				onPrimaryAction={() => navigate('/manager-settings')}
				primaryActionLabel="Create Notification Rule"
			/>
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="flex w-full shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:fixed xl:left-0 xl:top-0 xl:h-screen" style={{ width: '264px', maxWidth: '264px' }}>
					<div className="flex w-full items-center justify-start gap-3"><img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" /></div>
					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/overview"><FiHome className="h-4 w-4" /> Dashboard Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/profiles"><FiUsers className="h-4 w-4" /> Employee Profiles</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/scheduling"><FiCalendar className="h-4 w-4" /> Shift Scheduling</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>
					<div className="mt-auto space-y-3 pt-8">
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]" onClick={() => navigate('/manager-settings')} type="button"><FiPlus className="h-4 w-4" /> Create Notification Rule</button>
						<div className="space-y-1 text-sm text-slate-600">
							<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/manager-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
							<Link className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link>
						</div>
					</div>
				</aside>

				<div className="dashboard-main-offset flex min-h-0 flex-1 flex-col h-screen overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden"><button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700" onClick={() => setIsMobileMenuOpen(true)} type="button"><FiMenu className="h-5 w-5" /></button><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f51ff] text-xs font-black text-white">S</span><div className="min-w-0"><div className="truncate text-sm font-extrabold text-slate-900">ShiftSync</div><div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Workforce Management</div></div></div></div>
						<div className="mt-4 flex flex-col gap-4 xl:mt-0 xl:flex-row xl:items-center xl:justify-between">
							<label className="relative w-full max-w-3xl"><FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search notifications, employees, or policy notes..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" /></label>
							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500" onClick={() => navigate('/notifications')} type="button"><FiBell className="h-4 w-4" /></button>
								<ThemeToggleButton />
								<ManagerProfileMenu name={manager.fullName} profileImageUrl={profileImage} role={manager.roleLabel} />
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="space-y-5">
							<div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Notification Center</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{notifications.summary || 'Loading notifications...'}</p>
								</div>
								<div className="flex flex-wrap gap-3">
									<button
										disabled={markingAllRead || notifications.summaryCards.unread === 0}
										onClick={markAllRead}
										className="rounded-xl bg-[#e8edff] px-4 py-2.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
										type="button"
									>
										{markingAllRead ? 'Updating...' : 'Mark all as read'}
									</button>
									<button className="rounded-xl bg-[#dce6ff] px-4 py-2.5 text-sm font-bold text-[#0f51ff]" onClick={() => navigate('/manager-settings')} type="button">Notification settings</button>
								</div>
							</div>
							{error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
							{actionError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div> : null}
							{actionMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div> : null}
							<div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
								<aside className="rounded-[26px] border border-slate-200/80 bg-white p-4 sm:p-5">
									<div className="space-y-2">
										{notifications.folders.map((folder) => {
											const isActive = activeFolder === folder.label
											return (
												<button key={folder.label} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${isActive ? 'bg-[#eef3ff] text-[#0f51ff]' : 'text-slate-700 hover:bg-slate-50'}`} onClick={() => setActiveFolder(folder.label)} type="button">
													<span className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-[#0f51ff]' : folder.tone ?? 'bg-slate-300'}`} />{folder.label}</span>
													<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${isActive ? 'bg-white text-[#0f51ff]' : 'bg-slate-100 text-slate-500'}`}>{folderCounts[folder.label] ?? folder.count}</span>
												</button>
											)
										})}
									</div>
									<div className="mt-6 border-t border-slate-100 pt-5">
										<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Priority Folders</div>
										<div className="mt-3 space-y-3">
											{notifications.priorityFolders.map((folder) => (
												<button key={folder.label} className="flex items-center gap-3 text-sm font-semibold text-slate-700" onClick={() => setActiveFolder(folder.label === 'Shift Swaps' ? 'System Updates' : folder.label)} type="button"><span className={`h-2.5 w-2.5 rounded-full ${folder.tone}`} />{folder.label}</button>
											))}
										</div>
									</div>
								</aside>

								<div className="space-y-5">
									<div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">{notifications.todayLabel}</div>
									<div className="space-y-4">
										{todayItems.map((item) => (
											<NotificationCard
												key={item.id}
												item={item}
												onNavigate={openNotificationRoute}
												onOpen={openNotificationDetails}
												pendingNotificationId={pendingNotificationId}
												onPrimaryAction={(notificationId) => updateNotification(notificationId, true)}
												onSecondaryAction={(notificationId) => updateNotification(notificationId, false)}
											/>
										))}
									</div>
									<div className="pt-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">{notifications.earlierLabel}</div>
									<div className="space-y-4">
										{earlierItems.map((item) => (
											<NotificationCard
												key={item.id}
												item={item}
												onNavigate={openNotificationRoute}
												onOpen={openNotificationDetails}
												pendingNotificationId={pendingNotificationId}
												onPrimaryAction={(notificationId) => updateNotification(notificationId, true)}
												onSecondaryAction={(notificationId) => updateNotification(notificationId, false)}
											/>
										))}
									</div>
									{!todayItems.length && !earlierItems.length && !isLoading ? <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-500">{normalizedSearch || showArchive ? 'No notifications matched the current filters.' : 'No manager notifications are available yet.'}</div> : null}
									<div className="flex flex-col items-center gap-3 py-8 text-center text-slate-500"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef3ff] text-[#0f51ff]"><FiClock className="h-6 w-6" /></div><div><div className="text-sm font-semibold text-slate-700">Looking for older notifications?</div><button className="mt-2 text-sm font-bold text-[#0f51ff]" onClick={() => setShowArchive((current) => !current)} type="button">{showArchive ? 'Hide Archive' : 'Load Archive'}</button></div></div>
								</div>

								<aside className="space-y-5">
									<article className="rounded-[26px] border border-slate-200/80 bg-[#eef3ff] p-5 sm:p-6">
										<div className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-950"><FiCheckCircle className="h-5 w-5 text-[#0f51ff]" /> Notification Summary</div>
										<div className="mt-4 grid gap-3 sm:grid-cols-2">
											<div className="rounded-2xl bg-white p-4"><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Unread</div><div className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-950">{notifications.summaryCards.unread}</div></div>
											<div className="rounded-2xl bg-white p-4"><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Urgent</div><div className="mt-1 text-2xl font-black tracking-[-0.05em] text-rose-600">{notifications.summaryCards.urgent}</div></div>
										</div>
									</article>
									<article className="rounded-[26px] bg-[#0f51ff] p-5 text-white sm:p-6">
										<div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80"><FiBell className="h-3.5 w-3.5" /> Live Feed</div>
										<h3 className="mt-4 text-2xl font-black tracking-[-0.05em]">{notifications.liveFeedTitle}</h3>
										<p className="mt-3 text-sm leading-6 text-blue-50/90">{notifications.liveFeedDescription}</p>
										<button className="mt-5 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#0f51ff] transition hover:-translate-y-0.5" onClick={() => setActiveFolder('Urgent Alerts')} type="button">Review Queue</button>
									</article>
									<article className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
										<h3 className="text-lg font-black tracking-[-0.04em] text-slate-950">Quick Actions</h3>
										<div className="mt-4 space-y-3">
											<button className="w-full rounded-2xl bg-[#eef3ff] px-4 py-3 text-left text-sm font-bold text-[#0f51ff]" onClick={handleCreateShift} type="button">Create shift from alert</button>
											<button className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-left text-sm font-bold text-slate-700" onClick={reloadWorkspace} type="button">Refresh notifications</button>
										</div>
									</article>
								</aside>
							</div>
						</section>
					</div>
				</div>
			</div>
			<NotificationReader
				item={selectedNotification}
				onClose={() => setSelectedNotification(null)}
				onToggleRead={updateNotification}
				onOpenRelated={openNotificationRoute}
				pendingNotificationId={pendingNotificationId}
			/>
		</main>
	)
}
