import { useEffect, useMemo, useState } from 'react'
import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiFilter,
	FiHome,
	FiLayers,
	FiMenu,
	FiLogOut,
	FiPlus,
	FiSearch,
	FiSettings,
	FiSliders,
	FiUsers,
	FiPieChart,
} from 'react-icons/fi'
import { RiGroupLine, RiRadarLine } from 'react-icons/ri'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { resolveProfileImage } from '../../lib/managerWorkspace'
import { clearSession, loadSession } from '../../lib/session'
import MobileManagerMenu from '../shared/MobileManagerMenu'
import ManagerProfileMenu from '../shared/ManagerProfileMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

const metricPresentation = {
	'Total Employees': { icon: RiGroupLine, accent: 'bg-blue-50 text-blue-600' },
	'Active Shifts': { icon: FiCalendar, accent: 'bg-indigo-50 text-indigo-600' },
	'Coverage %': { icon: RiRadarLine, accent: 'bg-orange-50 text-orange-600' },
	'Pending Adjustments': { icon: FiClock, accent: 'bg-rose-50 text-rose-600' },
}

const weekLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const fallbackOverview = {
	metrics: [
		{ title: 'Total Employees', value: '0', delta: '--' },
		{ title: 'Active Shifts', value: '0', delta: '--' },
		{ title: 'Coverage %', value: '--', delta: '--' },
		{ title: 'Pending Adjustments', value: '0', delta: '--' },
	],
	shiftStatuses: [],
	recentAdjustments: [],
	attendanceBars: [20, 20, 20, 20, 20, 20, 20],
	weekLabels: weekLabels,
	heatmap: Array.from({ length: 14 }, () => 'low'),
	alertTitle: 'Loading alert...',
	alertDescription: '',
	unreadNotifications: 0,
}

function StatusPill({ children, tone }) {
	return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] ${tone}`}>{children}</span>
}

function resolveMetricAccent(delta) {
	if (delta === 'LIVE') {
		return 'bg-emerald-50 text-emerald-600'
	}
	if (delta === 'Optimal') {
		return 'bg-orange-50 text-orange-600'
	}
	if (delta === 'Review') {
		return 'bg-rose-50 text-rose-600'
	}
	return 'bg-blue-50 text-blue-600'
}

function resolveShiftTone(status) {
	if (status === 'FULL') {
		return 'border-blue-400 text-blue-600 bg-blue-50'
	}
	if (status === 'PARTIALLY_STAFFED') {
		return 'border-amber-400 text-amber-600 bg-amber-50'
	}
	if (status === 'UNDERSTAFFED') {
		return 'border-rose-400 text-rose-600 bg-rose-50'
	}
	return 'border-emerald-400 text-emerald-600 bg-emerald-50'
}

function resolveShiftBar(index) {
	if (index === 1) {
		return 'bg-amber-400'
	}
	if (index === 2) {
		return 'bg-blue-500'
	}
	return 'bg-emerald-500'
}

function resolveAdjustmentTone(status) {
	if (status === 'APPROVED') {
		return 'bg-blue-50 text-blue-700'
	}
	if (status === 'PENDING') {
		return 'bg-slate-100 text-slate-600'
	}
	return 'bg-rose-50 text-rose-700'
}

function resolveHeatmapTone(level) {
	if (level === 'high') {
		return 'bg-emerald-500'
	}
	if (level === 'medium') {
		return 'bg-amber-400'
	}
	return 'bg-rose-300'
}

export default function Overview() {
	const navigate = useNavigate()
	const session = loadSession()
	const [overview, setOverview] = useState(fallbackOverview)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState('')
	const [actionError, setActionError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [rangeDays, setRangeDays] = useState(7)
	const [adjustmentFilter, setAdjustmentFilter] = useState('ALL')
	const [isCreatingShift, setIsCreatingShift] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	useEffect(() => {
		let cancelled = false

		async function loadOverview() {
			if (!session?.userId) {
				setError('No active manager session was found.')
				setIsLoading(false)
				return
			}

			try {
				setError('')
				const data = await apiRequest(`/api/dashboard/overview/${session.userId}?rangeDays=${rangeDays}`)
				if (!cancelled) {
					setOverview(data)
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load dashboard data.')
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		loadOverview()

		return () => {
			cancelled = true
		}
	}, [rangeDays, session?.userId])

	const displayName = session?.fullName || 'Shift Manager'
	const displayRole = session?.role ? session.role.replace('_', ' ') : 'MANAGER'
	const profileImage = resolveProfileImage(session?.profileImageUrl, displayName)
	const normalizedSearch = searchTerm.trim().toLowerCase()

	const visibleShiftStatuses = useMemo(() => {
		return overview.shiftStatuses.filter((shift) => {
			if (!normalizedSearch) {
				return true
			}
			return [shift.name, shift.time, shift.status, shift.fill, shift.dayLabel].join(' ').toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, overview.shiftStatuses])

	const visibleAdjustments = useMemo(() => {
		return overview.recentAdjustments.filter((item) => {
			const matchesSearch = !normalizedSearch || [item.employee, item.type, item.originalValue, item.revisedValue, item.status, item.requestedAt].join(' ').toLowerCase().includes(normalizedSearch)
			const matchesFilter = adjustmentFilter === 'ALL' || item.status === adjustmentFilter
			return matchesSearch && matchesFilter
		})
	}, [adjustmentFilter, normalizedSearch, overview.recentAdjustments])

	function cycleAdjustmentFilter() {
		setAdjustmentFilter((current) => {
			if (current === 'ALL') {
				return 'PENDING'
			}
			if (current === 'PENDING') {
				return 'APPROVED'
			}
			if (current === 'APPROVED') {
				return 'REJECTED'
			}
			return 'ALL'
		})
	}

	async function handleCreateShift() {
		if (!session?.userId) {
			setActionError('No active manager session was found.')
			return
		}

		try {
			setActionError('')
			setIsCreatingShift(true)
			await apiRequest('/api/scheduling/manager/create-shift', {
				method: 'POST',
				body: JSON.stringify({ managerId: session.userId }),
			})
			const refreshed = await apiRequest(`/api/dashboard/overview/${session.userId}?rangeDays=${rangeDays}`)
			setOverview(refreshed)
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to create weekly shifts.')
		} finally {
			setIsCreatingShift(false)
		}
	}

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<MobileManagerMenu
				activePath="/overview"
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				onPrimaryAction={handleCreateShift}
				primaryActionDisabled={isCreatingShift}
				primaryActionLabel={isCreatingShift ? 'Creating Weekly Shifts...' : 'Create Weekly Shifts'}
			/>
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
					<div className="flex w-full items-center justify-start gap-3">
						<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
					</div>

					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/overview"><FiHome className="h-4 w-4" /> Dashboard Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/profiles"><FiUsers className="h-4 w-4" /> Employee Profiles</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/scheduling"><FiCalendar className="h-4 w-4" /> Shift Scheduling</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>

					<div className="mt-auto space-y-3 pt-8">
						<button
							disabled={isCreatingShift}
							onClick={handleCreateShift}
							className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de] disabled:cursor-not-allowed disabled:opacity-60"
						>
							<FiPlus className="h-4 w-4" /> {isCreatingShift ? 'Creating Weekly Shifts...' : 'Create Weekly Shifts'}
						</button>
						<div className="space-y-1 text-sm text-slate-600">
							<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/manager-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
							<Link
								className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50"
								to="/login"
								onClick={clearSession}
							>
								<FiLogOut className="h-4 w-4" /> Logout
							</Link>
						</div>
					</div>
				</aside>

				<div className="dashboard-main-offset flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden">
							<button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700" onClick={() => setIsMobileMenuOpen(true)} type="button"><FiMenu className="h-5 w-5" /></button>
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
								<input
									type="search"
									value={searchTerm}
									onChange={(event) => setSearchTerm(event.target.value)}
									placeholder="Search resources, shifts, or members..."
									className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white"
								/>
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button
									onClick={() => navigate('/notifications')}
									className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"
									aria-label="Open notifications"
								>
									<FiBell className="h-4 w-4" />
									{overview.unreadNotifications > 0 ? <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{overview.unreadNotifications}</span> : null}
								</button>
								<ThemeToggleButton />
								<ManagerProfileMenu name={displayName} profileImageUrl={profileImage} role={displayRole} />
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section id="dashboard" className="space-y-5">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Dashboard Overview</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Real-time workforce metrics and performance visibility for the current operational cycle.</p>
								</div>
								<div className="inline-flex rounded-2xl bg-[#f3f6ff] p-1 text-sm font-semibold text-slate-500">
									<button onClick={() => setRangeDays(1)} className={`rounded-xl px-4 py-2 ${rangeDays === 1 ? 'bg-white text-[#0f51ff]' : ''}`}>Last 24 Hours</button>
									<button onClick={() => setRangeDays(7)} className={`rounded-xl px-4 py-2 ${rangeDays === 7 ? 'bg-white text-[#0f51ff]' : ''}`}>7 Days</button>
									<button onClick={() => setRangeDays(30)} className={`rounded-xl px-4 py-2 ${rangeDays === 30 ? 'bg-white text-[#0f51ff]' : ''}`}>30 Days</button>
								</div>
							</div>

							{error ? (
								<div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
									{error}
								</div>
							) : null}
							{actionError ? (
								<div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
									{actionError}
								</div>
							) : null}

							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
								{overview.metrics.map((metric) => {
									const presentation = metricPresentation[metric.title] || metricPresentation['Total Employees']
									const Icon = presentation.icon

									return (
										<article key={metric.title} className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5">
											<div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[42px] bg-[radial-gradient(circle,rgba(15,81,255,0.08),transparent_70%)]" />
											<div className="flex items-start justify-between gap-3">
												<span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${presentation.accent}`}><Icon className="h-5 w-5" /></span>
												<span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${resolveMetricAccent(metric.delta)}`}>{metric.delta}</span>
											</div>
											<div className="mt-5 text-sm font-medium text-slate-500">{metric.title}</div>
											<div className="mt-1 text-3xl font-black tracking-[-0.06em] text-slate-950">{metric.value}</div>
										</article>
									)
								})}
							</div>
						</section>

						<section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
							<article className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<h2 className="text-xl font-extrabold tracking-[-0.04em] text-slate-950">Attendance Overview</h2>
										<p className="mt-1 text-sm text-slate-500">Daily staffing coverage across the selected period, shown as a percentage of required staff filled.</p>
									</div>
									<div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
										<span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#0f51ff]" />Coverage</span>
										<span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-400" />Healthy Target</span>
									</div>
								</div>

								<div className="mt-5 rounded-3xl bg-[linear-gradient(180deg,#f6f8ff_0%,#ffffff_100%)] p-4 sm:p-6">
									<div className="grid grid-cols-[40px_minmax(0,1fr)] gap-4">
										<div className="flex h-72 flex-col justify-between pb-10 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
											<span>100</span>
											<span>75</span>
											<span>50</span>
											<span>25</span>
											<span>0</span>
										</div>
										<div className="relative">
											<div className="pointer-events-none absolute inset-0">
												<div className="absolute inset-x-0 top-[15%] border-t border-dashed border-emerald-300/80" />
												<div className="absolute inset-x-0 top-1/4 border-t border-slate-200" />
												<div className="absolute inset-x-0 top-1/2 border-t border-slate-200" />
												<div className="absolute inset-x-0 top-3/4 border-t border-slate-200" />
												<div className="absolute inset-x-0 bottom-10 border-t border-slate-200" />
											</div>
											<div className="grid h-72 grid-cols-7 items-end gap-3">
												{overview.attendanceBars.map((height, index) => (
													<div key={overview.weekLabels[index]} className="flex h-full flex-col items-center justify-end gap-2">
														<div className="text-[11px] font-extrabold text-slate-500">{height}%</div>
														<div className="relative flex h-full w-full items-end rounded-[18px] bg-white/70 px-2 pb-2 shadow-inner">
															<div
																className={`w-full rounded-2xl ${height >= 85 ? 'bg-[linear-gradient(180deg,#10b981_0%,#34d399_100%)]' : height >= 60 ? 'bg-[linear-gradient(180deg,#0f51ff_0%,#6a95ff_100%)]' : 'bg-[linear-gradient(180deg,#f59e0b_0%,#fbbf24_100%)]'}`}
																style={{ height: `${Math.max(height, 8)}%` }}
															/>
														</div>
														<span className="text-[11px] font-extrabold tracking-[0.18em] text-slate-500">{overview.weekLabels[index]}</span>
													</div>
												))}
											</div>
											<div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm">
												<div className="font-semibold text-slate-700">Average coverage this week</div>
												<div className="text-lg font-black text-slate-950">
													{overview.attendanceBars.length ? `${Math.round(overview.attendanceBars.reduce((sum, value) => sum + value, 0) / overview.attendanceBars.length)}%` : '--'}
												</div>
											</div>
										</div>
									</div>
								</div>
							</article>

							<article className="rounded-[26px] border border-slate-200/80 bg-[#eef3ff] p-5 sm:p-6">
								<div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold tracking-[-0.04em] text-slate-950">Shift Status</h2><Link className="text-sm font-bold text-[#0f51ff]" to="/scheduling">View All</Link></div>
								<div className="mt-5 space-y-3">
									{visibleShiftStatuses.length ? visibleShiftStatuses.map((shift, index) => (
										<div key={shift.name} className="rounded-[18px] border border-white/80 bg-white p-4">
											<div className={`mb-3 h-0.5 w-full rounded-full ${resolveShiftBar(index)}`} />
											<div className="flex items-start justify-between gap-3">
												<div><div className="text-[15px] font-extrabold text-slate-900">{shift.name}</div><div className="mt-1 text-xs font-medium text-slate-500">{shift.time} • {shift.dayLabel}</div></div>
												<div className="text-right text-sm font-bold text-slate-700"><div>{shift.fill}</div><div className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.12em] ${resolveShiftTone(shift.status)}`}>{shift.status}</div></div>
											</div>
										</div>
									)) : (
										<div className="rounded-[18px] border border-white/80 bg-white p-4 text-sm text-slate-500">
											{isLoading ? 'Loading shift status...' : normalizedSearch ? 'No shifts matched your search.' : 'No shift status records available yet.'}
										</div>
									)}
								</div>

								<div className="mt-5 overflow-hidden rounded-[22px] bg-[#10204a] text-white">
									<div className="relative min-h-50 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_40%),linear-gradient(160deg,#17294f_0%,#0f1730_100%)] p-5">
										<div className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-200/80">Upcoming Alert</div>
										<h3 className="mt-3 max-w-55 text-2xl font-black tracking-[-0.05em]">{overview.alertTitle}</h3>
										<div className="absolute bottom-4 right-4 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">Priority</div>
										<p className="mt-3 max-w-60 text-sm leading-6 text-blue-50/90">{overview.alertDescription}</p>
									</div>
								</div>
							</article>
						</section>

						<section id="adjustments" className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_320px]">
							<article className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white">
								<div className="flex items-center justify-between gap-3 px-5 py-5 sm:px-6">
									<h2 className="text-xl font-extrabold tracking-[-0.04em] text-slate-950">Recent Shift Adjustments</h2>
									<button onClick={cycleAdjustmentFilter} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600"><FiFilter className="h-3.5 w-3.5" /> {adjustmentFilter}</button>
								</div>
								<div className="overflow-x-auto">
									<table className="min-w-full text-left">
										<thead className="bg-[#f5f7ff] text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
											<tr><th className="px-5 py-4 sm:px-6">Employee</th><th className="px-5 py-4 sm:px-6">Adjustment Type</th><th className="px-5 py-4 sm:px-6">Original</th><th className="px-5 py-4 sm:px-6">Revised</th><th className="px-5 py-4 sm:px-6">Status</th></tr>
										</thead>
										<tbody>
											{visibleAdjustments.length ? visibleAdjustments.map((item) => (
												<tr key={`${item.employee}-${item.type}-${item.revisedValue}`} className="border-t border-slate-100 text-sm text-slate-700">
													<td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3 font-semibold text-slate-900"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f51ff,#91b2ff)] text-[11px] font-black text-white">{item.employee.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>{item.employee}</div></td>
													<td className="px-5 py-4 sm:px-6">{item.type}</td>
													<td className="px-5 py-4 sm:px-6 text-slate-500">{item.originalValue}</td>
													<td className="px-5 py-4 sm:px-6 font-semibold text-[#0f51ff]">{item.revisedValue}<div className="text-xs font-medium text-slate-500">{item.requestedAt}</div></td>
													<td className="px-5 py-4 sm:px-6"><StatusPill tone={resolveAdjustmentTone(item.status)}>{item.status}</StatusPill></td>
												</tr>
											)) : (
												<tr className="border-t border-slate-100 text-sm text-slate-500">
													<td className="px-5 py-4 sm:px-6" colSpan="5">
														{isLoading ? 'Loading adjustment records...' : normalizedSearch || adjustmentFilter !== 'ALL' ? 'No adjustments matched the current filters.' : 'No recent adjustment records available yet.'}
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</article>

							<div className="space-y-5">
								<article className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
									<div className="mb-4 text-[13px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Coverage Heatmap</div>
									<div className="space-y-3">
										<div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] gap-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
											<span />
											{weekLabels.map((label) => <span key={label}>{label}</span>)}
										</div>
										{[0, 1].map((row) => (
											<div key={row} className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] gap-2">
												<div className="flex items-center text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
													{row === 0 ? 'Week 1' : 'Week 2'}
												</div>
												{overview.heatmap.slice(row * 7, row * 7 + 7).map((level, index) => (
													<span key={`${row}-${index}`} className={`aspect-square rounded-lg ${resolveHeatmapTone(level)}`} />
												))}
											</div>
										))}
									</div>
									<div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
										<span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" />Fully covered</span>
										<span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-400" />Partial coverage</span>
										<span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-rose-300" />Gap risk</span>
									</div>
									<p className="mt-4 text-sm leading-6 text-slate-500">Use this view to spot weak coverage patterns quickly across the two-week schedule window.</p>
								</article>

								<article className="rounded-[26px] bg-[#0f51ff] p-5 text-white sm:p-6">
									<div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80"><FiChevronDown className="h-3.5 w-3.5 rotate-90" /> Efficiency Tip</div>
									<h3 className="mt-4 max-w-xs text-2xl font-black tracking-[-0.05em]">Optimize Night Coverage</h3>
									<p className="mt-3 text-sm leading-6 text-blue-50/90">Analysis shows a 15% increase in productivity when Night shifts overlap by 30 minutes with Morning arrivals.</p>
									<button onClick={() => navigate('/manager-settings')} className="mt-5 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#0f51ff] transition hover:-translate-y-0.5">Update Preferences</button>
								</article>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
