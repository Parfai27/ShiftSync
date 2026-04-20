import { useEffect, useState } from 'react'
import {
	FiActivity,
	FiBell,
	FiChevronDown,
	FiCreditCard,
	FiGlobe,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiSearch,
	FiSettings,
	FiUsers,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession, loadSession } from '../../lib/session'

const fallbackOverview = {
	systemHealth: '0%',
	activeSessions: 0,
	totalUsers: 0,
	activeBranches: 0,
	healthBars: [38, 56, 44, 72, 81, 69, 48, 51, 63, 76, 53],
	userDistribution: [],
	regionalNodes: [],
	auditLogs: [],
}

export default function SystemOverview() {
	const session = loadSession()
	const [overview, setOverview] = useState(fallbackOverview)
	const [error, setError] = useState('')

	useEffect(() => {
		let cancelled = false

		async function loadOverview() {
			try {
				const data = await apiRequest('/api/admin/overview')
				if (!cancelled) {
					setOverview(data)
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load admin overview.')
				}
			}
		}

		loadOverview()

		return () => {
			cancelled = true
		}
	}, [])

	const adminName = session?.fullName || 'System Administrator'

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
					<div className="flex w-full items-center justify-start gap-3">
						<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
					</div>

					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/admin-overview"><FiGrid className="h-4 w-4" /> SystemOverview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-user-management"><FiUsers className="h-4 w-4" /> UserManagement</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-auditlogs"><FiActivity className="h-4 w-4" /> AuditLogs</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-api"><FiCreditCard className="h-4 w-4" /> Integrations & API</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
					</nav>

					<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link>
					</div>
				</aside>

				<div className="dashboard-main-offset flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden">
							<button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700"><FiMenu className="h-5 w-5" /></button>
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
								<input type="search" placeholder="Search metrics, users, or services..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiBell className="h-4 w-4" /></button>
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiMoon className="h-4 w-4" /></button>
								<div className="flex items-center gap-3 rounded-full bg-white px-3 py-2">
									<div className="text-right leading-tight">
										<div className="text-sm font-bold text-slate-900">{adminName}</div>
										<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">System Admin</div>
									</div>
									<div className="h-10 w-10 overflow-hidden rounded-full bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] ring-2 ring-[#eef3ff]" />
									<FiChevronDown className="h-4 w-4 text-slate-400" />
								</div>
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section>
							<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">System Overview</h1>
							<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">Live operational health and platform oversight for ShiftSync deployments supporting Ngabo Pharmacy workforce coordination.</p>

							{error ? (
								<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>
							) : null}

							<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
								<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
									<div className="mb-4 flex items-center justify-between">
										<span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#2644ac]">Live Status</span>
										<span className="text-[#0f51ff]">•••</span>
									</div>
									<h2 className="text-[40px] font-black leading-none tracking-[-0.06em] text-slate-950">System Health: {overview.systemHealth}</h2>
									<p className="mt-2 text-sm text-slate-500">Current data comes directly from the Spring Boot backend and PostgreSQL records.</p>
									<div className="mt-7 flex items-end gap-1.5">
										{overview.healthBars.map((height, index) => (
											<div key={`${height}-${index}`} className={`h-20 flex-1 rounded-sm ${index >= 3 && index <= 5 ? 'bg-[#0f51ff]' : 'bg-[#dde3f6]'}`} style={{ height: `${height + 20}px` }} />
										))}
									</div>
								</article>

								<article className="rounded-2xl bg-[#0f51ff] p-5 text-white">
									<div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
										<FiGlobe className="h-4 w-4" />
									</div>
									<div className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-100">Active Sessions</div>
									<div className="mt-2 text-[60px] font-black tracking-[-0.08em] leading-none">{overview.activeSessions}</div>
									<div className="mt-3 text-sm font-semibold text-blue-100">Users tracked in the latest notification and platform activity flow</div>
									<button className="mt-7 w-full rounded-xl bg-white/12 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-white/20">Real-time Map</button>
								</article>
							</div>

							<div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
									<h3 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">User Distribution</h3>
									<div className="mt-4 space-y-3">
										{overview.userDistribution.map((item, index) => (
											<div key={item.role} className="flex items-center justify-between gap-2">
												<div className="flex items-center gap-2 text-sm text-slate-700">
													<span className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-[#0f51ff]' : index === 1 ? 'bg-[#5a79e8]' : 'bg-[#8ca2ea]'}`} />
													{item.role}
												</div>
												<div className="text-sm font-semibold text-slate-900">{item.count.toLocaleString()}</div>
											</div>
										))}
									</div>
									<div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#edf2ff]">
										<div className="h-full w-[28%] rounded-full bg-[#0f51ff]" />
									</div>
								</article>

								<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
									<div className="flex items-center justify-between gap-2">
										<h3 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Platform Scope</h3>
										<span className="rounded-md bg-[#eef2ff] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#2747b3]">Live</span>
									</div>
									<div className="mt-4 text-[48px] font-black leading-none tracking-[-0.06em] text-slate-950">{overview.totalUsers}</div>
									<p className="mt-2 text-xs text-slate-500">Total users available in the connected backend repository.</p>
									<div className="mt-5 flex items-center justify-between rounded-xl bg-[#f5f8ff] px-4 py-3">
										<div className="text-xs font-bold text-slate-700">Active branches</div>
										<button className="text-xs font-bold text-[#0f51ff]">{overview.activeBranches}</button>
									</div>
								</article>

								<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
									<h3 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Regional Nodes</h3>
									<div className="mt-4 grid grid-cols-4 gap-2">
										{overview.regionalNodes.map((region) => (
											<div key={region.label} className={`rounded-md px-1 py-2 text-center text-[10px] font-extrabold uppercase tracking-[0.12em] ${region.healthy ? 'bg-[#0f51ff] text-white' : 'bg-[#e9efff] text-[#3150ba]'}`}>
												{region.label}
											</div>
										))}
									</div>
									<p className="mt-4 text-center text-xs text-slate-500">{overview.regionalNodes.filter((item) => item.healthy).length}/{overview.regionalNodes.length || 1} nodes healthy</p>
								</article>
							</div>

							<article className="mt-5 rounded-2xl border border-slate-200/80 bg-white">
								<div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
									<h3 className="text-lg font-bold text-slate-900">Recent Critical Audit Logs</h3>
									<button className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#0f51ff]">View All Records</button>
								</div>
								<div className="overflow-x-auto">
									<table className="min-w-full text-left">
										<thead className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
											<tr>
												<th className="px-5 py-3">Timestamp</th>
												<th className="px-5 py-3">Event</th>
												<th className="px-5 py-3">Origin</th>
												<th className="px-5 py-3">Actor</th>
												<th className="px-5 py-3">Status</th>
											</tr>
										</thead>
										<tbody className="text-sm text-slate-700">
											{overview.auditLogs.map((log) => (
												<tr key={`${log.timestamp}-${log.event}`} className="border-t border-slate-100">
													<td className="px-5 py-3">{log.timestamp}</td>
													<td className="px-5 py-3 font-semibold text-slate-900">{log.event}</td>
													<td className="px-5 py-3">{log.origin}</td>
													<td className="px-5 py-3">{log.actor}</td>
													<td className="px-5 py-3"><span className="rounded-full bg-[#edf2ff] px-2.5 py-1 text-xs font-bold text-[#2444af]">{log.status}</span></td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</article>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
