import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiEdit2,
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
	FiMail,
	FiMapPin,
	FiClock,
	FiMoreVertical,
	FiCheck,
	FiChevronLeft,
	FiChevronRight,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const roster = [
	{ name: 'Sarah Chen', role: 'Senior Architect', department: 'Design & Planning', status: 'SCHEDULED', shift: '09:00 - 17:00', avatar: 'SC', tone: 'bg-blue-50 text-blue-700' },
	{ name: 'Marcus Thorne', role: 'Structural Lead', department: 'Engineering', status: 'ABSENT', shift: '08:30 - 16:30', avatar: 'MT', tone: 'bg-rose-50 text-rose-700' },
	{ name: 'Elena Rodriguez', role: 'Project Coordinator', department: 'Logistics', status: 'SCHEDULED', shift: '10:00 - 18:00', avatar: 'ER', tone: 'bg-blue-50 text-blue-700' },
	{ name: 'David Kim', role: 'BIM Specialist', department: 'Design & Planning', status: 'OFF-DUTY', shift: '---', avatar: 'DK', tone: 'bg-slate-100 text-slate-600' },
]

const expertise = ['Revit Master', 'Sustainable Design', 'Lead Planner', '+2 more']
const availability = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const dayDots = ['blue', 'blue', 'blue', 'gray', 'blue', 'gray', 'gray']

function Pill({ children, tone }) {
	return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] ${tone}`}>{children}</span>
}

export default function Profiles() {
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
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/overview"><FiHome className="h-4 w-4" /> Dashboard Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/profiles"><FiUsers className="h-4 w-4" /> Employee Profiles</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/scheduling"><FiCalendar className="h-4 w-4" /> Shift Scheduling</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
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

				<div className="dashboard-main-offset flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
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
								<input type="search" placeholder="Search employees, roles, departments..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
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
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Employee Roster</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Manage 142 team members across 4 departments.</p>
								</div>
								<div className="flex flex-wrap items-center gap-3">
									<button className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0f51ff]">Export CSV</button>
									<button className="rounded-xl bg-[#e8eeff] px-4 py-2 text-sm font-bold text-slate-700">Bulk Actions</button>
								</div>
							</div>

							<div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_360px]">
								<article className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white">
									<div className="overflow-x-auto">
										<table className="min-w-full text-left">
											<thead className="bg-[#f5f7ff] text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
												<tr>
													<th className="px-5 py-4 sm:px-6">Employee</th>
													<th className="px-5 py-4 sm:px-6">Department</th>
													<th className="px-5 py-4 sm:px-6">Status</th>
													<th className="px-5 py-4 sm:px-6">Shift</th>
													<th className="px-5 py-4 sm:px-6">Actions</th>
												</tr>
											</thead>
											<tbody>
												{roster.map((employee, index) => (
													<tr key={employee.name} className={`border-t border-slate-100 text-sm text-slate-700 ${index === 0 ? 'bg-[#eef2ff]' : 'bg-white'}`}>
														<td className="px-5 py-4 sm:px-6">
															<div className="flex items-center gap-3 font-semibold text-slate-900">
																<span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f51ff,#91b2ff)] text-[11px] font-black text-white">{employee.avatar}</span>
																<div>
																	<div>{employee.name}</div>
																	<div className="text-xs font-medium text-slate-500">{employee.role}</div>
																</div>
															</div>
														</td>
														<td className="px-5 py-4 sm:px-6">{employee.department}</td>
														<td className="px-5 py-4 sm:px-6"><Pill tone={employee.tone}>{employee.status}</Pill></td>
														<td className="px-5 py-4 sm:px-6 text-slate-500">{employee.shift}</td>
														<td className="px-5 py-4 sm:px-6"><button className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"><FiMoreVertical className="h-4 w-4" /></button></td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									<div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:px-6">
										<span>Showing 1-10 of 142 employees</span>
										<div className="flex items-center gap-2">
											<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"><FiChevronLeft className="h-4 w-4" /></button>
											<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0f51ff] text-white">1</button>
											<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">2</button>
											<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">3</button>
											<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"><FiChevronRight className="h-4 w-4" /></button>
										</div>
									</div>
								</article>

								<aside className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
									<div className="flex items-start justify-between gap-3">
										<div className="flex items-center gap-4">
											<div className="relative">
												<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1f2937] text-white">SC</div>
												<div className="absolute -right-1 bottom-0 h-5 w-5 rounded-full border-2 border-white bg-[#0f51ff] text-[10px] text-white flex items-center justify-center"><FiCheck className="h-3 w-3" /></div>
											</div>
											<div>
												<h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Sarah Chen</h2>
												<p className="text-sm font-semibold text-[#0f51ff]">Senior Architect • Staff ID #ARCH-0822</p>
											</div>
										</div>
										<div className="flex items-center gap-2 text-slate-500"><button className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"><FiEdit2 className="h-4 w-4" /></button><button className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"><FiMail className="h-4 w-4" /></button></div>
									</div>

									<div className="mt-6 space-y-6">
										<div>
											<div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Core Expertise</div>
											<div className="flex flex-wrap gap-2">
												{expertise.map((item) => (
													<span key={item} className="rounded-lg border border-slate-200 bg-[#eef3ff] px-3 py-2 text-xs font-semibold text-slate-700">{item}</span>
												))}
											</div>
										</div>

										<div className="grid gap-4 text-sm text-slate-600">
											<div className="flex items-start gap-3"><FiCalendar className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Hired Date</div><div className="font-semibold text-slate-900">October 14, 2021</div></div></div>
											<div className="flex items-start gap-3"><FiMapPin className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Location</div><div className="font-semibold text-slate-900">Seattle Studio (HQ)</div></div></div>
											<div className="flex items-start gap-3"><FiClock className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Current Workload</div><div className="font-semibold text-[#0f51ff]">38h / 40h weekly</div></div></div>
										</div>
									</div>

									<div className="mt-8 rounded-[22px] bg-[#f8faff] p-4">
										<div className="mb-3 flex items-center justify-between">
											<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Availability Preview</div>
											<a href="#" className="text-sm font-bold text-[#0f51ff]">View Full</a>
										</div>
										<div className="grid grid-cols-7 gap-2 text-center text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
											{availability.map((day, index) => (
												<div key={`${day}-${index}`} className="space-y-2">
													<div>{day}</div>
													<span className={`mx-auto block h-2 w-2 rounded-full ${dayDots[index] === 'blue' ? 'bg-[#0f51ff]' : 'bg-slate-300'}`} />
												</div>
											))}
										</div>
									</div>

									<div className="mt-5 flex items-center gap-3">
										<button className="flex-1 rounded-xl bg-[#e8eeff] px-4 py-3 text-sm font-bold text-slate-700">Archive</button>
										<button className="flex-1 rounded-xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white">Save Changes</button>
									</div>
								</aside>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}