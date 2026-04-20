import { useEffect, useState } from 'react'
import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiDollarSign,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiSearch,
	FiSettings,
	FiUser,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession, loadSession } from '../../lib/session'

const weekDays = [
	{ day: 'MON', date: '14', active: false },
	{ day: 'TUE', date: '15', active: true },
	{ day: 'WED', date: '16', active: false },
	{ day: 'THU', date: '17', active: true },
	{ day: 'FRI', date: '18', active: true },
	{ day: 'SAT', date: '19', active: false },
	{ day: 'SUN', date: '20', active: false },
]

const fallbackOverview = {
	employeeName: 'Employee',
	roleLabel: 'EMPLOYEE',
	stats: [],
	schedule: [],
	notifications: [],
	resources: [],
}

export default function EmployeeOverview() {
	const session = loadSession()
	const [overview, setOverview] = useState(fallbackOverview)
	const [error, setError] = useState('')

	useEffect(() => {
		let cancelled = false

		async function loadOverview() {
			if (!session?.userId) {
				setError('No employee session found. Please log in again.')
				return
			}

			try {
				const data = await apiRequest(`/api/employee/overview/${session.userId}`)
				if (!cancelled) {
					setOverview(data)
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load employee overview.')
				}
			}
		}

		loadOverview()

		return () => {
			cancelled = true
		}
	}, [session?.userId])

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
					<div className="flex w-full items-center justify-start gap-3">
						<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
					</div>

					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-dashboard"><FiGrid className="h-4 w-4" /> My Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-schedule"><FiCalendar className="h-4 w-4" /> My Schedule</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-announcements"><FiBell className="h-4 w-4" /> Announcements</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-profile"><FiUser className="h-4 w-4" /> My Profile</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
					</nav>

					<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
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
								<input type="search" placeholder="Search resources, shifts, or members..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiBell className="h-4 w-4" /></button>
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiMoon className="h-4 w-4" /></button>
								<div className="flex items-center gap-3 rounded-full bg-white px-3 py-2">
									<div className="text-right leading-tight">
										<div className="text-sm font-bold text-slate-900">{overview.employeeName}</div>
										<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{overview.roleLabel}</div>
									</div>
									<div className="h-10 w-10 overflow-hidden rounded-full bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] ring-2 ring-[#eef3ff]" />
									<FiChevronDown className="h-4 w-4 text-slate-400" />
								</div>
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="space-y-5">
							<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Good Morning, {overview.employeeName}</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Your dashboard is now loading real assignments, payroll, and notifications from the ShiftSync backend.</p>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<button className="rounded-xl bg-[#e8eeff] px-5 py-2.5 text-xs font-bold text-[#2542ad] transition hover:bg-[#dbe6ff]">View Full History</button>
									<button className="rounded-xl bg-[#0f51ff] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#0b44de]">Request Time Off</button>
								</div>
							</div>

							{error ? (
								<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>
							) : null}

							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
								{overview.stats.map((stat, index) => (
									<article key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white p-4">
										<div className="flex items-center justify-between gap-3">
											<span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] ${index === 0 ? 'bg-blue-50 text-blue-600' : index === 1 ? 'bg-indigo-50 text-indigo-600' : index === 2 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'}`}>{stat.tag}</span>
											{index === 0 ? <FiClock className="h-4 w-4 text-slate-400" /> : index === 1 ? <FiCalendar className="h-4 w-4 text-slate-400" /> : index === 2 ? <FiDollarSign className="h-4 w-4 text-slate-400" /> : <FiGrid className="h-4 w-4 text-slate-400" />}
										</div>
										<div className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">{stat.label}</div>
										<div className="mt-2 flex items-end gap-1"><span className="text-3xl font-black tracking-[-0.05em] text-slate-950">{stat.value}</span><span className="pb-1 text-xs font-semibold text-slate-400">{stat.sub}</span></div>
										<div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
											<div className={`h-full rounded-full ${index === 0 ? 'w-[81%] bg-[#0f51ff]' : index === 1 ? 'w-[60%] bg-indigo-500' : index === 2 ? 'w-[74%] bg-rose-500' : 'w-[94%] bg-slate-600'}`} />
										</div>
									</article>
								))}
							</div>
						</section>

						<section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
							<article className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<h2 className="text-[28px] font-black tracking-[-0.05em] text-slate-950">My Schedule</h2>
									<div className="inline-flex rounded-xl bg-[#eef2ff] p-1 text-xs font-semibold text-slate-500">
										<button className="rounded-lg bg-white px-3 py-1.5 text-[#0f51ff]">Week</button>
										<button className="rounded-lg px-3 py-1.5">Month</button>
									</div>
								</div>

								<div className="mt-4 rounded-2xl bg-[#f3f6ff] p-3">
									<div className="grid grid-cols-7 gap-2 text-center">
										{weekDays.map((day) => (
											<div key={day.day} className="rounded-xl px-1 py-2">
												<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{day.day}</div>
												<div className="mt-1 text-lg font-extrabold text-slate-700">{day.date}</div>
												<div className={`mx-auto mt-1 h-1.5 w-1.5 rounded-full ${day.active ? 'bg-[#0f51ff]' : 'bg-transparent'}`} />
											</div>
										))}
									</div>

									<div className="mt-3 space-y-2.5">
										{overview.schedule.map((item, index) => (
											<div key={`${item.title}-${item.date}-${index}`} className={`flex flex-wrap items-center gap-3 rounded-2xl border bg-white px-4 py-3 ${index === 0 ? 'border-[#c7d6ff]' : 'border-slate-200/80'}`}>
												<div className="min-w-15">
													<div className="text-[30px] leading-none font-black tracking-[-0.05em] text-slate-900">{item.time}</div>
													<div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{item.slot}</div>
												</div>
												<div className="min-w-0 flex-1">
													<div className="truncate text-sm font-extrabold text-slate-900 sm:text-[15px]">{item.title}</div>
													<div className="mt-1 truncate text-xs text-slate-500">{item.subtitle}</div>
												</div>
												<div className="ml-auto text-right">
													<div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0f51ff]">{item.meta}</div>
													<div className="mt-1 text-[11px] text-slate-400">{item.date}</div>
												</div>
											</div>
										))}

										<button className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-[#0f51ff] hover:text-[#0f51ff]">+ Find Open Shifts</button>
									</div>
								</div>
							</article>

							<div className="space-y-5">
								<article className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5">
									<div className="mb-3 flex items-center justify-between gap-3">
										<h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">Notifications</h2>
										<button className="text-xs font-bold text-[#0f51ff]">Mark all read</button>
									</div>
									<div className="space-y-2.5">
										{overview.notifications.map((item) => (
											<div key={`${item.title}-${item.when}`} className="rounded-xl bg-[#f8faff] p-3">
												<div className="flex items-start gap-3">
													<span className={`mt-2 h-2 w-2 rounded-full ${item.active ? 'bg-[#0f51ff]' : 'bg-slate-300'}`} />
													<div>
														<div className="text-sm font-extrabold text-slate-900">{item.title}</div>
														<div className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</div>
														<div className="mt-2 text-[11px] text-slate-400">{item.when}</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</article>

								<article className="overflow-hidden rounded-[20px] bg-[#0f51ff] p-4 text-white sm:p-5">
									<div className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-100">Manager On Duty</div>
									<div className="mt-4 flex items-center gap-3">
										<div className="h-11 w-11 overflow-hidden rounded-full border border-white/30" />
										<div>
											<div className="text-lg font-extrabold">Aline Uwimana</div>
											<div className="text-xs text-blue-100">Pharmacy Operations Manager</div>
										</div>
									</div>
									<div className="mt-4 space-y-2">
										<button className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0f51ff] transition hover:bg-blue-50">Instant Message</button>
										<button className="w-full rounded-xl bg-[#235ff7] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1b4ad1]">Direct Call</button>
									</div>
								</article>

								<article className="rounded-[20px] bg-[#eef2ff] p-4 sm:p-5">
									<h3 className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-slate-600">Resources</h3>
									<div className="mt-3 grid grid-cols-2 gap-2.5">
										{overview.resources.map((resource) => (
											<button key={resource.name} className="rounded-xl border border-white/70 bg-white px-3 py-3 text-center text-xs font-bold text-slate-700 transition hover:border-[#0f51ff] hover:text-[#0f51ff]">{resource.name}</button>
										))}
									</div>
								</article>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
