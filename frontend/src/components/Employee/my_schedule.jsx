import {
	FiArrowLeft,
	FiArrowRight,
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiDollarSign,
	FiEdit3,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiPlusCircle,
	FiRefreshCw,
	FiSearch,
	FiSettings,
	FiUser,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const calendarCells = [
	{ day: 26, muted: true },
	{ day: 27, muted: true },
	{ day: 28, muted: true },
	{ day: 29, muted: true },
	{ day: 30, muted: true },
	{ day: 1 },
	{
		day: 2,
		event: {
			time: '09:00 - 17:00',
			title: 'Downtown Hub',
			tone: 'border-l-[#2d5cf6] bg-[#eaf0ff] text-[#2346b7]',
		},
	},
	{ day: 3 },
	{
		day: 4,
		event: {
			time: '09:00 - 17:00',
			title: 'Downtown Hub',
			tone: 'border-l-[#2d5cf6] bg-[#eaf0ff] text-[#2346b7]',
		},
	},
	{
		day: 5,
		event: {
			time: '14:00 - 22:00',
			title: 'North Warehouse',
			tone: 'border-l-[#2d5cf6] bg-[#eaf0ff] text-[#2346b7]',
		},
	},
	{
		day: 6,
		selected: true,
		dot: true,
		event: {
			time: '08:00 - 16:00',
			title: 'Downtown Hub',
			tone: 'border-l-[#2d5cf6] bg-[#eaf0ff] text-[#2346b7]',
			note: 'TODAY',
		},
	},
	{
		day: 7,
		event: {
			title: 'Pending Swap\nAwaiting Approval',
			tone: 'border-l-[#9ca3af] bg-[#eef1f6] text-[#5f6a7d]',
		},
	},
	{
		day: 8,
		event: {
			time: '06:00 - 14:00',
			title: 'Emergency Cover',
			tone: 'border-l-[#e53935] bg-[#ffe6e5] text-[#bb2522]',
		},
	},
	{ day: 9 },
	{ day: 10 },
	{
		day: 11,
		openShift: true,
	},
	{ day: 12 },
	{ day: 13 },
	{ day: 14 },
	{ day: 15 },
	{ day: 16 },
]

const metricCards = [
	{
		title: 'Scheduled Hours',
		value: '142.5',
		suffix: 'hrs',
		note: '+12.0 from last month',
		icon: FiClock,
		tone: 'bg-blue-50 text-[#2d5cf6]',
	},
	{
		title: 'Estimated Pay',
		value: '$3,120',
		suffix: 'est',
		note: '',
		bar: 'w-[76%] bg-[#3f5fbf]',
		icon: FiDollarSign,
		tone: 'bg-indigo-50 text-[#4b5fcf]',
	},
	{
		title: 'Pending Requests',
		value: '02',
		suffix: 'active',
		note: '',
		bar: 'w-[52%] bg-[#a33c13]',
		icon: FiRefreshCw,
		tone: 'bg-rose-50 text-[#c4491f]',
	},
]

function EmployeeSidebar() {
	return (
		<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
			<div className="mb-10 flex items-center gap-3">
				<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f51ff] text-sm font-black text-white">A</span>
				<div>
					<div className="text-[19px] font-extrabold leading-5 tracking-[-0.04em] text-slate-900">ShiftSync</div>
					<div className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">Workforce Management</div>
				</div>
			</div>

			<nav className="space-y-2 text-[14px] font-medium text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-dashboard"><FiGrid className="h-4 w-4" /> My Overview</Link>
				<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-schedule"><FiCalendar className="h-4 w-4" /> My Schedule</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-announcements"><FiBell className="h-4 w-4" /> Announcements</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-profile"><FiUser className="h-4 w-4" /> My Profile</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
			</nav>

			<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login"><FiLogOut className="h-4 w-4" /> Logout</Link>
			</div>
		</aside>
	)
}

export default function MySchedule() {
	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<EmployeeSidebar />

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
								<input type="search" placeholder="Search shifts, swaps, and pay details..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiBell className="h-4 w-4" /></button>
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiMoon className="h-4 w-4" /></button>
								<div className="flex items-center gap-3 rounded-full bg-white px-3 py-2">
									<div className="text-right leading-tight">
										<div className="text-sm font-bold text-slate-900">Alex Thompson</div>
										<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Team Member</div>
									</div>
									<div className="h-10 w-10 overflow-hidden rounded-full bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] ring-2 ring-[#eef3ff]"><img alt="Alex Thompson" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1542204625-de293a2f03f6?auto=format&fit=crop&w=160&q=80" /></div>
									<FiChevronDown className="h-4 w-4 text-slate-400" />
								</div>
							</div>
						</div>
					</header>

					<div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
								<div>
									<div className="flex items-center gap-2">
										<h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950">October 2023</h1>
										<button className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><FiArrowLeft className="h-4 w-4" /></button>
										<button className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><FiArrowRight className="h-4 w-4" /></button>
									</div>
									<p className="mt-2 text-lg text-slate-500">You have 18 shifts scheduled this month.</p>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<button className="inline-flex items-center gap-2 rounded-xl bg-[#e9eeff] px-5 py-3 text-sm font-bold text-[#334daf] transition hover:bg-[#dde6ff]"><FiRefreshCw className="h-4 w-4" /> Request Swap</button>
									<button className="inline-flex items-center gap-2 rounded-xl bg-[#0f51ff] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0b44de]"><FiPlusCircle className="h-4 w-4" /> Pick up Open Shift</button>
								</div>
							</div>

							<div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-[#f9fbff]">
								<div className="min-w-230">
									<div className="grid grid-cols-7 border-b border-slate-200/80 bg-[#f4f7ff]">
										{days.map((day) => (
											<div key={day} className="px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">{day}</div>
										))}
									</div>

									<div className="grid grid-cols-7">
										{calendarCells.map((cell, idx) => (
											<div key={`${cell.day}-${idx}`} className={`relative min-h-28 border-r border-b border-slate-200/80 p-2.5 ${idx % 7 === 6 ? 'border-r-0' : ''} ${cell.selected ? 'bg-[#f0f5ff] ring-2 ring-inset ring-[#2d5cf6]' : cell.muted ? 'bg-[#f2f5fc]' : 'bg-white'}`}>
												<div className={`text-lg font-extrabold ${cell.muted ? 'text-slate-300' : 'text-slate-700'}`}>{cell.day}</div>
												{cell.dot ? <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#2d5cf6]" /> : null}

												{cell.event ? (
													<div className={`mt-2 rounded-lg border-l-4 p-2 text-[12px] font-semibold leading-4 ${cell.event.tone}`}>
														{cell.event.time ? <div className="font-extrabold">{cell.event.time}</div> : null}
														<div className="mt-0.5 whitespace-pre-line">{cell.event.title}</div>
														{cell.event.note ? <div className="mt-1 text-[10px] font-extrabold tracking-[0.16em] text-[#2d5cf6]">{cell.event.note}</div> : null}
													</div>
												) : null}

												{cell.openShift ? (
													<button className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-lg border-2 border-dashed border-[#b7c8ff] bg-[#f7faff] text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#2d5cf6]">+ Open Shift</button>
												) : null}
											</div>
										))}
									</div>
								</div>
							</div>
						</section>

						<section className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
							{metricCards.map((card) => {
								const Icon = card.icon

								return (
									<article key={card.title} className="rounded-3xl border border-slate-200/80 bg-white p-5">
										<div className="flex items-center gap-3">
											<span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}><Icon className="h-5 w-5" /></span>
											<div className="text-xl font-bold tracking-[-0.02em] text-slate-700">{card.title}</div>
										</div>

										<div className="mt-4 flex items-end gap-1">
											<span className="text-5xl leading-none font-black tracking-[-0.06em] text-slate-900">{card.value}</span>
											<span className="pb-1 text-2xl font-semibold text-slate-400">{card.suffix}</span>
										</div>

										{card.note ? <p className="mt-3 text-sm font-semibold text-slate-500">{card.note}</p> : null}
										{card.bar ? (
											<div className="mt-4 h-1.5 w-full rounded-full bg-slate-200">
												<div className={`h-full rounded-full ${card.bar}`} />
											</div>
										) : null}
									</article>
								)
							})}

							<article className="relative overflow-hidden rounded-3xl bg-[#0f51ff] p-5 text-white">
								<div className="text-lg font-semibold text-blue-100">Quick Action</div>
								<h3 className="mt-1 max-w-55 text-4xl leading-10 font-black tracking-[-0.04em]">Pickup overtime shift?</h3>
								<button className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#0f51ff] transition hover:bg-blue-50">View Available</button>
								<div className="pointer-events-none absolute -bottom-10 -right-8 h-36 w-36 rounded-full border-8 border-blue-300/30" />
							</article>
						</section>

						<button className="fixed bottom-8 right-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0f51ff] text-white shadow-[0_18px_35px_rgba(15,81,255,0.38)] transition hover:-translate-y-0.5 hover:bg-[#0b44de]">
							<FiEdit3 className="h-5 w-5" />
						</button>
					</div>
				</div>
			</div>
		</main>
	)
}
