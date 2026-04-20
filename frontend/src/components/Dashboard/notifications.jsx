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
	FiMail,
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

const folders = [
	{ label: 'All Inbox', count: '12', active: true },
	{ label: 'Urgent Alerts', count: '3', tone: 'text-rose-600' },
	{ label: 'Reminders', count: '5' },
	{ label: 'System Updates', count: '8' },
]

const priorityFolders = [
	{ label: 'Compliance', tone: 'bg-blue-600' },
	{ label: 'Payroll Issues', tone: 'bg-rose-600' },
	{ label: 'Shift Swaps', tone: 'bg-orange-600' },
]

const notifications = [
	{
		kind: 'urgent',
		time: '2 min ago',
		title: 'Urgent: Compliance Violation Warning',
		description: 'Section 4A: Three employees in the "Night Shift B" cluster have exceeded their weekly overtime limits. Immediate schedule adjustment required to avoid policy penalties.',
		action: 'Resolve Now',
		secondaryAction: 'Dismiss',
	},
	{
		kind: 'swap',
		time: '1 hour ago',
		title: 'Shift Swap Request: Sarah J.',
		description: 'Sarah has requested to swap her "Morning Logistics" shift on Friday with Michael D.\'s "Evening Inventory" shift. Both parties have pre-approved.',
		original: 'Fri, 08:00 - 16:00',
		proposed: 'Fri, 16:00 - 00:00',
		action: 'Approve Swap',
	},
	{
		kind: 'info',
		time: 'Oct 23, 16:45',
		title: 'Payroll Finalization Reminder',
		description: 'Monthly payroll reconciliation for the Warehouse division is due tomorrow by 12:00 PM. Please review any outstanding shift adjustments.',
	},
	{
		kind: 'info',
		time: 'Oct 23, 09:12',
		title: 'Platform Update: Version 4.2.0',
		description: 'New features are live! Check out the improved shift visualization tool and the updated reporting dashboard in your settings.',
		link: 'View Release Notes',
	},
]

function NotificationCard({ item }) {
	if (item.kind === 'urgent') {
		return (
			<article className="overflow-hidden rounded-[26px] border border-rose-200/80 bg-white">
				<div className="grid gap-4 border-l-4 border-rose-600 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-start">
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
							<FiAlertTriangle className="h-5 w-5" />
						</div>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-3">
								<h3 className="text-lg font-black tracking-[-0.04em] text-slate-950 sm:text-xl">{item.title}</h3>
								<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{item.time}</span>
							</div>
							<p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
							<div className="mt-4 flex flex-wrap gap-3">
								<button className="rounded-xl bg-[#d92d20] px-4 py-2.5 text-sm font-extrabold text-white">{item.action}</button>
								<button className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">{item.secondaryAction}</button>
							</div>
						</div>
					</div>
				</div>
			</article>
		)
	}

	if (item.kind === 'swap') {
		return (
			<article className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white">
				<div className="p-5 sm:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex items-start gap-4">
							<div className="relative">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f51ff,#91b2ff)] text-sm font-black text-white">SJ</div>
								<div className="absolute -right-1 bottom-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#0f51ff] text-white">
									<FiCheckCircle className="h-3 w-3" />
								</div>
							</div>
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-3">
									<h3 className="text-lg font-black tracking-[-0.04em] text-slate-950 sm:text-xl">{item.title}</h3>
									<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{item.time}</span>
								</div>
								<p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
							</div>
						</div>
					</div>

					<div className="mt-5 grid gap-3 rounded-2xl bg-[#f5f7ff] p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
						<div>
							<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Original</div>
							<div className="mt-1 font-bold text-slate-900">{item.original}</div>
						</div>
						<div className="hidden justify-center sm:flex">
							<FiChevronDown className="h-4 w-4 -rotate-90 text-slate-400" />
						</div>
						<div>
							<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Proposed</div>
							<div className="mt-1 font-bold text-slate-900">{item.proposed}</div>
						</div>
					</div>

					<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
						<div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
							<FiCheckCircle className="h-4 w-4" /> Pre-approved by both parties
						</div>
						<button className="rounded-xl bg-[#0f51ff] px-4 py-2.5 text-sm font-extrabold text-white">{item.action}</button>
					</div>
				</div>
			</article>
		)
	}

	return (
		<article className="rounded-[26px] border border-slate-200/80 bg-[#eef3ff] p-5 sm:p-6">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500">
						<FiMail className="h-5 w-5" />
					</div>
					<div>
						<h3 className="text-lg font-black tracking-[-0.04em] text-slate-950">{item.title}</h3>
						<p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
						{item.link ? <button className="mt-3 text-sm font-bold text-[#0f51ff]">{item.link}</button> : null}
					</div>
				</div>
				<span className="text-xs font-semibold text-slate-500">{item.time}</span>
			</div>
		</article>
	)
}

export default function Notifications() {
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
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>

					<div className="mt-auto space-y-3 pt-8">
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]"><FiPlus className="h-4 w-4" /> Create Notification Rule</button>
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
								<input type="search" placeholder="Search notifications, employees, or policy notes..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
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
							<div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Notification Center</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Stay informed with real-time updates on scheduling, compliance, and team performance.</p>
								</div>
								<div className="flex flex-wrap gap-3">
									<button className="rounded-xl bg-[#e8edff] px-4 py-2.5 text-sm font-bold text-slate-700">Mark all as read</button>
									<button className="rounded-xl bg-[#dce6ff] px-4 py-2.5 text-sm font-bold text-[#0f51ff]">Notification settings</button>
								</div>
							</div>

							<div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
								<aside className="rounded-[26px] border border-slate-200/80 bg-white p-4 sm:p-5">
									<div className="space-y-2">
										{folders.map((folder) => (
											<button key={folder.label} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${folder.active ? 'bg-[#eef3ff] text-[#0f51ff]' : 'text-slate-700 hover:bg-slate-50'}`}>
												<span className="flex items-center gap-3">
													<span className={`h-2.5 w-2.5 rounded-full ${folder.active ? 'bg-[#0f51ff]' : folder.tone ?? 'bg-slate-300'}`} />
													{folder.label}
												</span>
												<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${folder.active ? 'bg-white text-[#0f51ff]' : 'bg-slate-100 text-slate-500'}`}>{folder.count}</span>
											</button>
										))}
									</div>

									<div className="mt-6 border-t border-slate-100 pt-5">
										<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Priority Folders</div>
										<div className="mt-3 space-y-3">
											{priorityFolders.map((folder) => (
												<div key={folder.label} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
													<span className={`h-2.5 w-2.5 rounded-full ${folder.tone}`} />
													{folder.label}
												</div>
											))}
										</div>
									</div>
								</aside>

								<div className="space-y-5">
									<div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Today, October 24</div>
									<div className="space-y-4">
										{notifications.slice(0, 2).map((item) => (
											<NotificationCard key={item.title} item={item} />
										))}
									</div>

									<div className="pt-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Yesterday</div>
									<div className="space-y-4">
										{notifications.slice(2).map((item) => (
											<NotificationCard key={item.title} item={item} />
										))}
									</div>

									<div className="flex flex-col items-center gap-3 py-8 text-center text-slate-500">
										<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef3ff] text-[#0f51ff]"><FiClock className="h-6 w-6" /></div>
										<div>
											<div className="text-sm font-semibold text-slate-700">Looking for older notifications?</div>
											<button className="mt-2 text-sm font-bold text-[#0f51ff]">Load Archive</button>
										</div>
									</div>
								</div>

								<aside className="space-y-5">
									<article className="rounded-[26px] border border-slate-200/80 bg-[#eef3ff] p-5 sm:p-6">
										<div className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-950"><FiCheckCircle className="h-5 w-5 text-[#0f51ff]" /> Notification Summary</div>
										<div className="mt-4 grid gap-3 sm:grid-cols-2">
											<div className="rounded-2xl bg-white p-4">
												<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Unread</div>
												<div className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-950">12</div>
											</div>
											<div className="rounded-2xl bg-white p-4">
												<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Urgent</div>
												<div className="mt-1 text-2xl font-black tracking-[-0.05em] text-rose-600">3</div>
											</div>
										</div>
									</article>

									<article className="rounded-[26px] bg-[#0f51ff] p-5 text-white sm:p-6">
										<div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80"><FiBell className="h-3.5 w-3.5" /> Live Feed</div>
										<h3 className="mt-4 text-2xl font-black tracking-[-0.05em]">Keep shift changes under control.</h3>
										<p className="mt-3 text-sm leading-6 text-blue-50/90">Review urgent items first, then clear reminders and policy updates before the end of day.</p>
								<button className="mt-5 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#0f51ff] transition hover:-translate-y-0.5">Review Queue</button>
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