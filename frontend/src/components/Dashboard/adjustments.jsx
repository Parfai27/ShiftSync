import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiHelpCircle,
	FiHome,
	FiLayers,
	FiMenu,
	FiMoon,
	FiLogOut,
	FiPlus,
	FiSearch,
	FiSettings,
	FiSliders,
	FiUsers,
	FiPieChart,
	FiCheckCircle,
	FiAlertTriangle,
	FiXCircle,
	FiFilter,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const swapRequests = [
	{
		id: '#842',
		name: 'Swap Request',
		requested: 'Requested 2 hours ago',
		from: 'Sarah Chen',
		fromShift: 'Mon, Oct 14 • 08:00 - 16:00',
		to: 'Marcus Wright',
		toShift: 'Tue, Oct 15 • 16:00 - 00:00',
		reason: 'Childcare conflict',
		status: 'Agreed',
	},
	{
		id: '#841',
		name: 'Open Shift Pickup',
		requested: 'Requested 5 hours ago',
		from: 'Open Shift',
		fromShift: 'Wed, Oct 16 • 09:00 - 17:00',
		to: 'Julian Reed',
		toShift: 'Qualified',
		reason: 'Floor Supervisor',
		status: 'Pending',
	},
]

const activity = [
	{ label: 'Shift Approved', detail: 'David M. swap with Lisa K. finalized by Auto-Pilot.', tone: 'bg-blue-600' },
	{ label: 'Request Rejected', detail: 'Admin rejected pickup for Shift #772 due to qualification gap.', tone: 'bg-slate-300' },
]

function MetricCard({ label, value }) {
	return (
		<div className="rounded-2xl bg-white p-4">
			<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">{label}</div>
			<div className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#0f51ff]">{value}</div>
		</div>
	)
}

export default function Adjustments() {
	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="flex w-full shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:fixed xl:left-0 xl:top-0 xl:h-screen" style={{ width: '264px', maxWidth: '264px' }}>
					<div className="mb-10 flex items-center gap-3">
						<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f51ff] text-sm font-black text-white">A</span>
						<div>
							<div className="text-[19px] font-extrabold leading-5 tracking-[-0.04em] text-slate-900">ShiftSync</div>
							<div className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">Workforce Management</div>
						</div>
					</div>

					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/overview"><FiHome className="h-4 w-4" /> Dashboard Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/profiles"><FiUsers className="h-4 w-4" /> Employee Profiles</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/scheduling"><FiCalendar className="h-4 w-4" /> Shift Scheduling</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>

					<div className="mt-auto space-y-3 pt-8">
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]"><FiPlus className="h-4 w-4" /> Create New Shift</button>
						<div className="space-y-1 text-sm text-slate-600">
							<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/manager-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
							<Link className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50" to="/login"><FiLogOut className="h-4 w-4" /> Logout</Link>
						</div>
					</div>
				</aside>

				<div className="dashboard-main-offset flex min-h-0 flex-1 flex-col h-screen overflow-hidden">
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
								<input type="search" placeholder="Search requests, employees, or notes..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiBell className="h-4 w-4" /></button>
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiMoon className="h-4 w-4" /></button>
								<div className="flex items-center gap-3 rounded-full bg-white px-3 py-2">
									<div className="text-right leading-tight">
										<div className="text-sm font-bold text-slate-900">Alex Thompson</div>
										<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Shift Manager</div>
									</div>
									<div className="h-10 w-10 overflow-hidden rounded-full bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] ring-2 ring-[#eef3ff]"><img alt="Alex Thompson" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80" /></div>
									<FiChevronDown className="h-4 w-4 text-slate-400" />
								</div>
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="space-y-5">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Shift Adjustments</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Review and manage pending shift swap requests. Ensure workforce balance while maintaining flexibility for your team.</p>
								</div>
								<button className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0f51ff]">Bulk Approve</button>
							</div>

							<div className="grid gap-5 xl:grid-cols-[1fr_320px]">
								<div className="space-y-5">
									{swapRequests.map((request, index) => (
										<article key={request.id} className={`rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6 ${index === 0 ? 'ring-1 ring-[#0f51ff]/20' : ''}`}>
											<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
												<div className="min-w-0 flex-1">
													<div className="flex flex-wrap items-center gap-3">
														<div className="flex items-center -space-x-2">
															<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#0f51ff] text-sm font-black text-white">SC</div>
															<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-sm font-black text-white">↔</div>
															<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#1f2937] text-sm font-black text-white">MW</div>
														</div>
														<div>
															<div className="text-xl font-black tracking-[-0.04em] text-slate-950">{request.name} {request.id}</div>
															<div className="text-sm text-slate-500">{request.requested}</div>
														</div>
													</div>

													<div className="mt-5 grid gap-4 rounded-2xl bg-[#f7f8ff] p-4 sm:grid-cols-2">
														<div className="rounded-2xl border-l-4 border-[#0f51ff] bg-white p-4">
															<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">From</div>
															<div className="mt-2 font-bold text-slate-900">{request.from}</div>
															<div className="mt-1 text-sm text-slate-600">{request.fromShift}</div>
															<div className="mt-2 text-sm text-slate-500"><span className="font-semibold text-slate-700">Reason:</span> {request.reason}</div>
														</div>
														<div className="rounded-2xl border-l-4 border-[#d2dbff] bg-white p-4">
															<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">To</div>
															<div className="mt-2 font-bold text-slate-900">{request.to}</div>
															<div className="mt-1 text-sm text-slate-600">{request.toShift}</div>
															<div className="mt-2 text-sm text-slate-500"><span className="font-semibold text-slate-700">Status:</span> {request.status}</div>
														</div>
													</div>

													<div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
														<label className="block">
															<div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Adjustment Reason (Optional)</div>
															<input type="text" placeholder="Add a note for the internal log..." className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-[#0f51ff]" />
														</label>
														<div className="flex gap-3 sm:flex-col">
															<button className="rounded-xl bg-[#0f51ff] px-6 py-3 text-sm font-extrabold text-white hover:bg-[#0b44de]">Approve</button>
															<button className="rounded-xl bg-[#ffd7d3] px-6 py-3 text-sm font-extrabold text-[#c72d2d] hover:bg-[#ffc7c2]">Reject</button>
														</div>
													</div>
													</div>
												</div>
											</article>
									))}
								</div>

								<aside className="space-y-5">
									<article className="rounded-[26px] border border-slate-200/80 bg-[#eef3ff] p-5 sm:p-6">
										<div className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-950"><FiCheckCircle className="h-5 w-5 text-[#0f51ff]" /> Compliance Check</div>
										<div className="mt-4 space-y-4 text-sm text-slate-600">
											<div className="flex items-start gap-3"><FiCheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" /><div><div className="font-bold text-slate-900">Rest Periods</div><div className="text-sm text-slate-500">All proposed changes maintain required 11-hour rest intervals.</div></div></div>
											<div className="flex items-start gap-3"><FiAlertTriangle className="mt-0.5 h-4 w-4 text-rose-500" /><div><div className="font-bold text-rose-600">Overtime Alert</div><div className="text-sm text-slate-500">Julian Reed will exceed 40 hours this week if pickup is approved.</div></div></div>
										</div>
									</article>

									<article className="rounded-[26px] bg-[#eef3ff] p-5 sm:p-6">
										<h3 className="text-xl font-black tracking-[-0.04em] text-slate-950">Adjustment Metrics</h3>
										<div className="mt-4 grid gap-3 sm:grid-cols-2">
											<MetricCard label="Wait Time" value="2.4h" />
											<MetricCard label="Approval Rate" value="88%" />
										</div>
									</article>

									<article className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
										<h3 className="text-xl font-black tracking-[-0.04em] text-slate-950">Recent Activity</h3>
										<div className="mt-5 space-y-5">
											{activity.map((item) => (
												<div key={item.label} className="flex gap-3">
													<span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.tone}`} />
													<div>
														<div className="font-bold text-slate-900">{item.label}</div>
														<div className="text-sm text-slate-500">{item.detail}</div>
													</div>
												</div>
											))}
										</div>
									</article>
								</aside>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}