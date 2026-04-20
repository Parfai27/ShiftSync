import {
	FiAlertTriangle,
	FiBell,
	FiCalendar,
	FiCheckCircle,
	FiChevronDown,
	FiClock,
	FiFilter,
	FiHelpCircle,
	FiHome,
	FiLayers,
	FiMenu,
	FiMoon,
	FiLogOut,
	FiPlus,
	FiPieChart,
	FiSearch,
	FiSettings,
	FiSliders,
	FiUsers,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const policyCards = [
	{
		title: 'Maximum Weekly Hours',
		description: 'Employees may not exceed 48 total hours within a rolling 7-day period without explicit override authorization.',
		tone: 'bg-blue-50 text-blue-600',
		badge: 'COMPLIANT',
		progressLabel: 'Fleet Average',
		progressValue: '38.2 hrs',
		progressTone: 'bg-[#0f51ff]',
		progressWidth: '78%',
	},
	{
		title: 'Mandatory Rest Period',
		description: 'Minimum 11 hours of continuous rest between consecutive shifts. Violations trigger automatic supervisor blocking.',
		tone: 'bg-indigo-50 text-indigo-600',
		badge: 'ACTIVE MONITORING',
		progressLabel: 'Violation Rate (MTD)',
		progressValue: '0.4%',
		progressTone: 'bg-indigo-600',
		progressWidth: '22%',
	},
	{
		title: 'Safety Gear Compliance',
		description: 'PPE certification must be verified for all floor supervisors. Checklists are required for machinery operation shifts.',
		tone: 'bg-orange-50 text-orange-600',
		badge: 'STATIC POLICY',
		checklist: ['Q3 Audits Complete', 'Renewal in 12 days'],
	},
]

const activity = [
	{ time: '08:42 AM', title: 'Automatic Block: Shift Overlap', detail: 'Worker Jameson, K. attempted dual-punch at West Hub.', tone: 'bg-rose-600', action: 'Review Event' },
	{ time: '07:15 AM', title: 'Policy Updated: PTO Carry-over', detail: 'New fiscal year thresholds applied to General Staff group.', tone: 'bg-slate-300', tag: 'Automated', action: 'View Change' },
	{ time: '06:00 AM', title: 'Manual Override: Emergency Coverage', detail: 'Supervisor Chen, L. authorized double-back for Medical Unit A.', tone: 'bg-orange-600', action: 'Review Event' },
]

function Metric({ label, value, subtext }) {
	return (
		<div className="rounded-2xl border border-white/80 bg-white p-4">
			<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{label}</div>
			<div className="mt-2 flex items-end gap-2">
				<div className="text-3xl font-black tracking-[-0.06em] text-slate-950">{value}</div>
				{subtext ? <div className="pb-1 text-xs font-semibold text-[#0f51ff]">{subtext}</div> : null}
			</div>
		</div>
	)
}

function PolicyCard({ item }) {
	return (
		<article className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
			<div className="flex items-start justify-between gap-3">
				<div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
					<FiClock className="h-5 w-5" />
				</div>
				<span className="rounded-full bg-[#eef3ff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0f51ff]">{item.badge}</span>
			</div>

			<h3 className="mt-4 text-xl font-black tracking-[-0.04em] text-slate-950">{item.title}</h3>
			<p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>

			{item.progressLabel ? (
				<div className="mt-6 space-y-3">
					<div className="flex items-center justify-between gap-3 text-sm text-slate-700">
						<span className="font-semibold">{item.progressLabel}</span>
						<span className="font-bold text-slate-900">{item.progressValue}</span>
					</div>
					<div className="h-2 rounded-full bg-slate-100">
						<div className={`h-2 rounded-full ${item.progressTone}`} style={{ width: item.progressWidth }} />
					</div>
				</div>
			) : null}

			{item.checklist ? (
				<div className="mt-6 space-y-3">
					{item.checklist.map((entry) => (
						<div key={entry} className="flex items-center gap-3 rounded-2xl bg-[#f8faff] px-3 py-2.5 text-sm text-slate-600">
							<FiCheckCircle className="h-4 w-4 text-emerald-500" />
							{entry}
						</div>
					))}
				</div>
			) : null}
		</article>
	)
}

function ActivityRow({ item }) {
	return (
		<div className="grid gap-3 rounded-2xl bg-white px-4 py-4 md:grid-cols-[auto_110px_1fr_auto_auto] md:items-center md:px-5">
			<div className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
			<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{item.time}</div>
			<div>
				<div className="font-bold text-slate-900">{item.title}</div>
				<div className="text-sm text-slate-500">{item.detail}</div>
			</div>
			{item.tag ? <span className="justify-self-start rounded-full bg-[#eef3ff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0f51ff] md:justify-self-end">{item.tag}</span> : <span className="hidden md:block" />}
			<button className="rounded-xl bg-[#f1f4ff] px-3 py-2 text-sm font-bold text-slate-700">{item.action}</button>
		</div>
	)
}

export default function Compliances() {
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
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>

					<div className="mt-auto space-y-3 pt-8">
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]"><FiPlus className="h-4 w-4" /> Create Policy</button>
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
								<input type="search" placeholder="Search policies, violations, or audit notes..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
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
						<section className="space-y-6">
							<div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Compliance & Policies</h1>
									<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">Monitor workforce regulations and institutional standards. Real-time tracking of labor laws, safety protocols, and internal shift mandates.</p>
								</div>
								<div className="flex flex-wrap gap-3">
									<button className="rounded-xl bg-[#e8edff] px-4 py-2.5 text-sm font-bold text-slate-700">Full Audit Log</button>
									<button className="rounded-xl bg-[#dce6ff] px-4 py-2.5 text-sm font-bold text-[#0f51ff]">Policy Settings</button>
								</div>
							</div>

							<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px_240px]">
								<article className="rounded-[26px] border border-rose-200/70 bg-[#fff1f2] p-5 sm:p-6 xl:col-span-1">
									<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
										<div className="flex items-start gap-4">
											<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d92d20] text-white">
												<FiAlertTriangle className="h-5 w-5" />
											</div>
											<div>
												<h2 className="text-xl font-black tracking-[-0.04em] text-[#d92d20] sm:text-2xl">Labor Regulation Alert: California AB5</h2>
												<p className="mt-2 max-w-2xl text-sm leading-6 text-[#b63a3f]">3 Shift schedules in 'Logistics North' exceed the updated 12-hour rest window requirement.</p>
											</div>
										</div>
										<span className="rounded-full bg-[#d92d20] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">Critical</span>
									</div>

									<div className="mt-5 flex flex-wrap gap-3">
										<button className="rounded-xl bg-[#d92d20] px-4 py-2.5 text-sm font-extrabold text-white">Address Now</button>
										<button className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#d92d20]">View Details</button>
									</div>
								</article>

								<Metric label="Active Policies" value="24" subtext="+2 New" />
								<Metric label="Compliance Rate" value="98.2%" subtext="Stable" />
							</div>

							<div className="flex items-center justify-between gap-3">
								<h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Standard Labor Rules</h2>
								<div className="flex items-center gap-3 text-slate-500">
									<FiFilter className="h-4 w-4" />
									<div className="grid h-6 w-6 grid-cols-2 gap-1">
										<span className="rounded-sm bg-slate-700" />
										<span className="rounded-sm bg-slate-700" />
										<span className="rounded-sm bg-slate-700" />
										<span className="rounded-sm bg-slate-700" />
									</div>
								</div>
							</div>

							<div className="grid gap-5 lg:grid-cols-3">
								{policyCards.map((item) => (
									<PolicyCard key={item.title} item={item} />
								))}
							</div>

							<article className="rounded-[26px] border border-slate-200/80 bg-[#eef3ff] p-5 sm:p-6">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
									<div>
										<h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Recent Compliance Activity</h2>
										<p className="mt-1 text-sm text-slate-500">Reviewing last 24 hours of system-flagged events.</p>
									</div>
									<a className="text-sm font-bold text-[#0f51ff]" href="#audit">Full Audit Log →</a>
								</div>

								<div className="mt-5 space-y-3">
									{activity.map((item) => (
										<ActivityRow key={item.title} item={item} />
									))}
								</div>
							</article>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}