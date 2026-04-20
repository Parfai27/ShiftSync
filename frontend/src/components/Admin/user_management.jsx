import {
	FiActivity,
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
	FiPlus,
	FiSearch,
	FiSettings,
	FiUsers,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const summaryCards = [
	{ label: 'Total Users', value: '1,284', detail: '+12%', detailTone: 'text-[#0f51ff]' },
	{ label: 'Active Now', value: '942', detail: '●', detailTone: 'text-[#8fa0d4]' },
	{ label: 'Admin Roles', value: '24', detail: 'Stable', detailTone: 'text-slate-500' },
	{ label: 'Pending Sync', value: '3', detail: '△', detailTone: 'text-rose-500', valueTone: 'text-rose-600' },
]

const users = [
	{ name: 'Julian Vance', email: 'j.vian.v@atlasstream.io', role: 'Admin', active: true, avatar: 'JV' },
	{ name: 'Elena Rodriguez', email: 'e.rodriguez@atlasstream.io', role: 'Manager', active: true, avatar: 'ER' },
	{ name: 'Markus Theron', email: 'm.theron@atlasstream.io', role: 'Employee', active: false, avatar: 'MT' },
	{ name: 'Sarah Jenkins', email: 's.jenkins@atlasstream.io', role: 'Employee', active: true, avatar: 'SJ' },
]

export default function UserManagement() {
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
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/admin-user-management"><FiUsers className="h-4 w-4" /> UserManagement</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-auditlogs"><FiActivity className="h-4 w-4" /> AuditLogs</Link>
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
								<input type="search" placeholder="Search users, roles, and groups..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
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
									<div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2948b8]">System Governance</div>
									<h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">User Management</h1>
									<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">Oversee access controls, define organizational roles, and monitor account statuses across the global workforce directory.</p>
								</div>
								<div className="flex items-center gap-2">
									<button className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-[#eef2ff] px-4 text-xs font-bold text-[#1f3b9c] transition hover:bg-[#e3eafe]"><FiDownload className="h-4 w-4" /> Export Directory</button>
									<button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0f51ff] px-4 text-xs font-bold text-white transition hover:bg-[#0b44de]"><FiPlus className="h-4 w-4" /> Add New User</button>
								</div>
							</div>

							<div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
								{summaryCards.map((item) => (
									<article key={item.label} className="rounded-2xl border border-slate-200/80 bg-white p-4">
										<div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
										<div className={`mt-2 text-[38px] font-black leading-none tracking-[-0.06em] ${item.valueTone || 'text-slate-950'}`}>{item.value}</div>
										<div className={`mt-1 text-xs font-semibold ${item.detailTone}`}>{item.detail}</div>
									</article>
								))}
							</div>

							<article className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
								<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-[#f7f9ff] px-4 py-4 sm:px-5">
									<div className="flex flex-wrap items-center gap-2">
										<button className="rounded-full bg-[#0f51ff] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">All Roles</button>
										<button className="rounded-full bg-[#e8edff] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2847ad]">Admin</button>
										<button className="rounded-full bg-[#e8edff] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2847ad]">Manager</button>
										<button className="rounded-full bg-[#e8edff] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2847ad]">Employee</button>
									</div>
									<div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
										<span>Showing 1-10 of 1,284</span>
										<button className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600"><FiChevronLeft className="h-3.5 w-3.5" /></button>
										<button className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600"><FiChevronRight className="h-3.5 w-3.5" /></button>
									</div>
								</div>

								<div className="overflow-x-auto">
									<table className="min-w-full text-left">
										<thead className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
											<tr>
												<th className="px-5 py-4">User Identity</th>
												<th className="px-5 py-4">Privilege Level</th>
												<th className="px-5 py-4">Availability</th>
												<th className="px-5 py-4">Actions</th>
											</tr>
										</thead>
										<tbody className="text-sm text-slate-700">
											{users.map((user) => (
												<tr key={user.email} className="border-b border-slate-100 last:border-b-0">
													<td className="px-5 py-4">
														<div className="flex items-center gap-3">
															<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7ecff] text-xs font-extrabold text-[#2243ae]">{user.avatar}</div>
															<div>
																<div className="font-bold text-slate-900">{user.name}</div>
																<div className="text-xs text-slate-500">{user.email}</div>
															</div>
														</div>
													</td>
													<td className="px-5 py-4">
														<span className="rounded-full bg-[#e9efff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2645af]">{user.role}</span>
													</td>
													<td className="px-5 py-4">
														<span className={`inline-flex items-center gap-2 text-sm ${user.active ? 'text-[#1b49cb]' : 'text-slate-400'}`}>
															<span className={`h-2 w-2 rounded-full ${user.active ? 'bg-[#1b49cb]' : 'bg-slate-300'}`} />
															{user.active ? 'Active' : 'Inactive'}
														</span>
													</td>
													<td className="px-5 py-4">
														<button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#0f51ff] hover:text-[#0f51ff]">Manage</button>
													</td>
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
