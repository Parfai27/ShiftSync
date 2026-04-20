import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiChevronLeft,
	FiChevronRight,
	FiClock,
	FiDownload,
	FiHelpCircle,
	FiHome,
	FiLayers,
	FiMenu,
	FiMoon,
	FiLogOut,
	FiPlus,
	FiPrinter,
	FiMoreVertical,
	FiSearch,
	FiSettings,
	FiSliders,
	FiUsers,
	FiPieChart,
	FiZap,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const stats = [
	{ label: 'Total Hours', value: '1,240', note: '+12% vs last week' },
	{ label: 'Open Shifts', value: '08', note: 'Urgent' },
	{ label: 'Coverage Score', value: '92%', note: '' },
	{ label: 'Labor Budget', value: '$42.8k', note: '84% of Cap' },
]

const days = [
	{ day: 'Mon', date: '23' },
	{ day: 'Tue', date: '24' },
	{ day: 'Wed', date: '25', alert: 'GAP' },
	{ day: 'Thu', date: '26' },
	{ day: 'Fri', date: '27' },
	{ day: 'Sat', date: '28' },
	{ day: 'Sun', date: '29' },
]

const employees = [
	{ name: 'Alex Morgan', role: 'Floor Manager', hours: '40h / 40h', avatar: 'AM' },
	{ name: 'Sara Lopez', role: 'QC Lead', hours: '32h / 40h', avatar: 'SL' },
	{ name: 'Jordan Kim', role: 'Overtime Risk', hours: '36h / 40h', avatar: 'JK' },
	{ name: 'Open Shifts', role: 'Needs Coverage', hours: '3 open', avatar: '+', open: true },
]

const legend = [
	{ label: 'Morning Shift', tone: 'bg-blue-600' },
	{ label: 'Evening Shift', tone: 'bg-indigo-500' },
	{ label: 'Time Off', tone: 'bg-orange-600' },
]

const timeBlocks = [
	{ label: '08:00 - 16:00', top: 0, left: '0.5rem', width: 'calc(100% - 1rem)', tone: 'bg-blue-100 border-blue-500 text-blue-700' },
	{ label: '14:00 - 22:00', top: '4.7rem', left: '0.5rem', width: 'calc(100% - 1rem)', tone: 'bg-indigo-100 border-indigo-500 text-indigo-700' },
	{ label: '06:00 - 14:00', top: '9.4rem', left: '0.5rem', width: 'calc(100% - 1rem)', tone: 'bg-blue-100 border-blue-500 text-blue-700' },
	{ label: 'Vacation', top: '9.4rem', left: '0.5rem', width: 'calc(100% - 1rem)', tone: 'bg-orange-100 border-orange-500 text-orange-700' },
	{ label: '08:00 - 16:00', top: '14.1rem', left: '33.5%', width: '31.5%', tone: 'bg-red-600 border-red-700 text-white' },
	{ label: '16:00 - 00:00', top: '14.1rem', left: '49.5%', width: '31.5%', tone: 'bg-red-500 border-red-600 text-white' },
]

function Badge({ children, tone }) {
	return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${tone}`}>{children}</span>
}

export default function Scheduling() {
	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full flex-col overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl xl:flex-row">
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
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/scheduling"><FiCalendar className="h-4 w-4" /> Shift Scheduling</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>

					<div className="mt-auto space-y-3 pt-8">
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]"><FiPlus className="h-4 w-4" /> Auto Schedule</button>
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
								<input type="search" placeholder="Search shifts, employees, or days..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
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
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Shift Scheduling</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Managing North Region Logistics Hub • Oct 23 - Oct 29, 2023</p>
								</div>
								<div className="flex items-center gap-3">
									<div className="inline-flex rounded-2xl bg-[#f3f6ff] p-1 text-sm font-semibold text-slate-500">
										<button className="rounded-xl bg-white px-4 py-2 text-[#0f51ff]">WEEK</button>
										<button className="rounded-xl px-4 py-2">MONTH</button>
									</div>
									<button className="inline-flex items-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white"><FiZap className="h-4 w-4" /> Auto Schedule</button>
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
								{stats.map((stat, index) => (
									<article key={stat.label} className={`rounded-3xl border border-slate-200/80 p-5 ${index === 3 ? 'bg-[#e8edff]' : 'bg-white'}`}>
										<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">{stat.label}</div>
										<div className="mt-2 flex items-end gap-3">
											<div className="text-3xl font-black tracking-[-0.06em] text-slate-950">{stat.value}</div>
											{stat.note && <div className="text-xs font-semibold text-slate-500">{stat.note}</div>}
										</div>
									</article>
								))}
							</div>

							<div className="grid gap-5 xl:grid-cols-[1fr_280px]">
								<article className="rounded-[26px] border border-slate-200/80 bg-white p-4 sm:p-6">
									<div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] gap-3 text-center text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500 sm:grid-cols-[140px_repeat(7,minmax(0,1fr))]">
										<div className="rounded-2xl bg-[#f1f4ff] p-4 text-left">Employees</div>
										{days.map((day) => (
											<div key={day.date} className={`rounded-2xl p-4 ${day.alert ? 'bg-[#fff0f0] text-rose-600' : 'bg-white'}`}>
												<div>{day.day}</div>
												<div className="mt-1 text-xl font-black tracking-[-0.05em] text-slate-900">{day.date}</div>
												{day.alert && <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-500">Gap</div>}
											</div>
										))}
									</div>

									<div className="mt-4 space-y-3">
										{employees.map((employee, rowIndex) => (
											<div key={employee.name} className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] gap-3 rounded-2xl border border-slate-100 p-3 sm:grid-cols-[140px_repeat(7,minmax(0,1fr))]">
												<div className="flex items-center gap-3 text-left">
													<div className={`flex h-11 w-11 items-center justify-center rounded-full ${employee.open ? 'bg-[#fff2f2] text-rose-600' : 'bg-[#0f51ff] text-white'}`}>{employee.avatar}</div>
													<div>
														<div className="font-semibold text-slate-900">{employee.name}</div>
														<div className="text-xs text-slate-500">{employee.hours}</div>
													</div>
												</div>

												{days.map((day, dayIndex) => {
													const block =
														rowIndex === 0
															? dayIndex === 0 || dayIndex === 1 || dayIndex === 3 || dayIndex === 4
																? [timeBlocks[0], timeBlocks[1]]
																: [timeBlocks[0]]
															: rowIndex === 1
																? dayIndex === 1 || dayIndex === 3 || dayIndex === 4 || dayIndex === 5
																	? [timeBlocks[1], timeBlocks[3]]
																	: [timeBlocks[1]]
															: rowIndex === 2
																	? dayIndex === 0 || dayIndex === 1 || dayIndex === 3 || dayIndex === 4
																		? [timeBlocks[2]]
																		: []
																: []

													return (
														<div key={`${employee.name}-${day.date}`} className="relative min-h-16 rounded-xl bg-[#f7f8ff]">
															{block.slice(0, 1).map((entry, index) => (
																<div key={index} className={`absolute inset-0 rounded-xl border-l-4 p-2 text-[11px] font-semibold ${entry.tone}`} style={{ top: entry.top, left: entry.left, width: entry.width }}>
																	{entry.label}
																</div>
															))}
														</div>
													)
												})}
											</div>
										))}
									</div>

									<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
										<div className="flex items-center gap-4">
											{legend.map((item) => (
												<div key={item.label} className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />{item.label}</div>
											))}
										</div>
										<div className="flex items-center gap-3">
											<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"><FiPrinter className="h-4 w-4" /></button>
											<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"><FiDownload className="h-4 w-4" /></button>
										</div>
									</div>
								</article>

								<aside className="space-y-5">
									<article className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
										<div className="flex items-start justify-between gap-3">
											<div className="flex items-center gap-3">
												<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1f2937] text-white">SC</div>
												<div>
													<h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Schedule Overview</h2>
													<p className="text-sm font-semibold text-[#0f51ff]">This week&apos;s staffing snapshot</p>
												</div>
											</div>
											<FiMoreVertical className="h-4 w-4 text-slate-400" />
										</div>

										<div className="mt-6 space-y-4 text-sm text-slate-600">
											<div className="flex items-start gap-3"><FiClock className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Peak Coverage</div><div className="font-semibold text-slate-900">09:00 - 17:00</div></div></div>
											<div className="flex items-start gap-3"><FiUsers className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Teams Active</div><div className="font-semibold text-slate-900">4 departments live</div></div></div>
											<div className="flex items-start gap-3"><FiBell className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Alerts</div><div className="font-semibold text-rose-600">2 staffing gaps today</div></div></div>
										</div>
									</article>

									<article className="rounded-[26px] bg-[#0f51ff] p-5 text-white sm:p-6">
										<div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80"><FiZap className="h-3.5 w-3.5" /> Auto Suggest</div>
										<h3 className="mt-4 max-w-xs text-2xl font-black tracking-[-0.05em]">Optimize Weekday Rotation</h3>
										<p className="mt-3 text-sm leading-6 text-blue-50/90">Move one evening slot to Thursday to reduce Wednesday pressure and keep the coverage score above 90%.</p>
										<button className="mt-5 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#0f51ff] transition hover:-translate-y-0.5">Apply Suggestion</button>
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