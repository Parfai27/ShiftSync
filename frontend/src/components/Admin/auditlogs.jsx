import {
	FiActivity,
	FiAlertTriangle,
	FiBell,
	FiChevronDown,
	FiChevronLeft,
	FiChevronRight,
	FiCreditCard,
	FiDownload,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiSearch,
	FiSettings,
	FiUsers,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const filters = ['All Activity', 'Shift Approved', 'User Created', 'Setting Changed', 'Security Alert', 'Billing Export']

const logs = [
	{
		timestampDate: 'Oct 24, 2023',
		timestampTime: '14:23:05 EST',
		entity: 'Sarah Adams',
		entityRole: 'Admin Lead',
		entityBadge: 'SA',
		action: 'Shift Approved for Warehouse-D',
		ip: '192.168.1.104',
		status: 'Success',
		warn: false,
	},
	{
		timestampDate: 'Oct 24, 2023',
		timestampTime: '13:12:44 EST',
		entity: 'Marcus Knight',
		entityRole: 'System Architect',
		entityBadge: 'MK',
		action: 'Security Setting Changed: 2FA Mandatory',
		ip: '45.22.112.8',
		status: 'Success',
		warn: false,
	},
	{
		timestampDate: 'Oct 24, 2023',
		timestampTime: '11:05:12 EST',
		entity: 'Auto-Logic Bot',
		entityRole: 'Automation',
		entityBadge: 'AL',
		action: 'User Profile Created: @jdoe_staff',
		ip: '127.0.0.1',
		status: 'Success',
		warn: false,
	},
	{
		timestampDate: 'Oct 24, 2023',
		timestampTime: '09:30:11 EST',
		entity: 'Unknown Attempt',
		entityRole: 'Failed Login',
		entityBadge: '!',
		action: '3 consecutive failed login attempts on root account',
		ip: '88.19.42.10',
		status: 'Blocked',
		warn: true,
	},
	{
		timestampDate: 'Oct 23, 2023',
		timestampTime: '17:45:33 EST',
		entity: 'Emma Liang',
		entityRole: 'Finance Admin',
		entityBadge: 'EL',
		action: 'Billing Report Generated: Q3_Revenue.pdf',
		ip: '203.0.113.45',
		status: 'Success',
		warn: false,
	},
]

export default function AuditLogs() {
	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
					<div className="mb-10 flex items-center gap-3">
						<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f51ff] text-sm font-black text-white">A</span>
						<div>
							<div className="text-[19px] font-extrabold leading-5 tracking-[-0.04em] text-slate-900">ShiftSync</div>
							<div className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">Workforce Management</div>
						</div>
					</div>

					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-overview"><FiGrid className="h-4 w-4" /> SystemOverview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-user-management"><FiUsers className="h-4 w-4" /> UserManagement</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/admin-auditlogs"><FiActivity className="h-4 w-4" /> AuditLogs</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-api"><FiCreditCard className="h-4 w-4" /> Integrations & API</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
					</nav>

					<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login"><FiLogOut className="h-4 w-4" /> Logout</Link>
					</div>
				</aside>

				<div className="dashboard-main-offset flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden">
							<button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700"><FiMenu className="h-5 w-5" /></button>
							<div className="flex min-w-0 items-center gap-3">
								<span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f51ff] text-xs font-black text-white">A</span>
								<div className="min-w-0">
									<div className="truncate text-sm font-extrabold text-slate-900">ShiftSync</div>
									<div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Workforce Management</div>
								</div>
							</div>
						</div>

						<div className="mt-4 flex flex-col gap-4 xl:mt-0 xl:flex-row xl:items-center xl:justify-between">
							<label className="relative w-full max-w-3xl">
								<FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<input type="search" placeholder="Search events, users, or IP addresses..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiBell className="h-4 w-4" /></button>
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiMoon className="h-4 w-4" /></button>
								<div className="flex items-center gap-3 rounded-full bg-white px-3 py-2">
									<div className="text-right leading-tight">
										<div className="text-sm font-bold text-slate-900">Nina Patel</div>
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
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Audit Logs</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Track every administrative event across the platform with immutable timestamps and secure IP logging.</p>
								</div>
								<div className="flex items-center gap-2">
									<button className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-[#eef2ff] px-4 text-xs font-bold text-[#1f3b9c] transition hover:bg-[#e3eafe]"><FiDownload className="h-4 w-4" /> Export CSV</button>
									<button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0f51ff] px-4 text-xs font-bold text-white transition hover:bg-[#0b44de]">View Insights</button>
								</div>
							</div>

							<div className="mt-5 grid gap-4 xl:grid-cols-[minmax(220px,0.55fr)_minmax(0,1.45fr)]">
								<article className="rounded-2xl border border-slate-200/80 bg-white p-4">
									<div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Date Range</div>
									<div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-700">
										<button className="rounded-md border border-slate-200 bg-[#f6f8ff] px-3 py-2">Oct 12, 2023</button>
										<span>to</span>
										<button className="rounded-md border border-slate-200 bg-[#eef2ff] px-3 py-2">Today</button>
									</div>
								</article>

								<article className="rounded-2xl border border-slate-200/80 bg-white p-4">
									<div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Action Type Filter</div>
									<div className="mt-4 flex flex-wrap items-center gap-2">
										{filters.map((filter, index) => (
											<button key={filter} className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${index === 0 ? 'bg-[#0f51ff] text-white' : 'bg-[#e8edff] text-[#2746ad]'}`}>
												{filter}
											</button>
										))}
									</div>
								</article>
							</div>

							<article className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
								<div className="overflow-x-auto">
									<table className="min-w-full text-left">
										<thead className="border-b border-slate-100 bg-[#f7f9ff] text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
											<tr>
												<th className="px-5 py-4">Timestamp</th>
												<th className="px-5 py-4">User Entity</th>
												<th className="px-5 py-4">Action Description</th>
												<th className="px-5 py-4">IP Address</th>
												<th className="px-5 py-4">Status</th>
											</tr>
										</thead>
										<tbody className="text-sm text-slate-700">
											{logs.map((log) => (
												<tr key={`${log.entity}-${log.timestampTime}`} className="border-b border-slate-100 last:border-b-0">
													<td className="px-5 py-4 align-top">
														<div className="font-bold text-slate-900">{log.timestampDate}</div>
														<div className="text-xs text-slate-500">{log.timestampTime}</div>
													</td>
													<td className="px-5 py-4 align-top">
														<div className="flex items-center gap-3">
															<div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e8edff] text-[10px] font-extrabold text-[#2444ac]">{log.entityBadge}</div>
															<div>
																<div className="font-bold text-slate-900">{log.entity}</div>
																<div className="text-xs text-slate-500">{log.entityRole}</div>
															</div>
														</div>
													</td>
													<td className="px-5 py-4 align-top">
														<div className={`inline-flex items-start gap-2 ${log.warn ? 'text-rose-600' : 'text-slate-900'}`}>
															{log.warn ? <FiAlertTriangle className="mt-0.5 h-3.5 w-3.5" /> : <span className="mt-1.5 h-2 w-2 rounded-full bg-[#1f4dd1]" />}
															<span className="font-semibold">{log.action}</span>
														</div>
													</td>
													<td className="px-5 py-4 align-top">
														<span className="rounded-md bg-[#eef2ff] px-2 py-1 text-[10px] font-bold text-[#3b55b4]">{log.ip}</span>
													</td>
													<td className="px-5 py-4 align-top">
														<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${log.status === 'Blocked' ? 'bg-rose-100 text-rose-600' : 'bg-[#e8edff] text-[#2747b3]'}`}>
															{log.status}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-[#f7f9ff] px-5 py-4 text-xs text-slate-600">
									<div>Showing 1 - 25 of 1,482 logs</div>
									<div className="flex items-center gap-2">
										<button className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600"><FiChevronLeft className="h-3.5 w-3.5" /></button>
										<button className="rounded-md bg-[#0f51ff] px-3 py-1.5 font-bold text-white">1</button>
										<button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700">2</button>
										<button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700">3</button>
										<span className="px-1">...</span>
										<button className="rounded-md border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700">60</button>
										<button className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600"><FiChevronRight className="h-3.5 w-3.5" /></button>
									</div>
								</div>
							</article>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
