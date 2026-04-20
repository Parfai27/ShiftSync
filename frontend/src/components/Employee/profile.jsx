import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiDollarSign,
	FiDownload,
	FiEdit2,
	FiFileText,
	FiFolder,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiSearch,
	FiSettings,
	FiShield,
	FiSliders,
	FiUpload,
	FiUser,
	FiUserCheck,
	FiX,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const skills = ['Full-stack Development', 'AWS Architecture', 'Product Strategy', 'Mentorship']

const documents = [
	{ name: 'W-4_Tax_Form.pdf', date: 'Added Jan 12', icon: FiFileText },
	{ name: 'Contract_Addendum.pdf', date: 'Added Feb 03', icon: FiFileText },
	{ name: 'Remote_Work_Policy.pdf', date: 'Signed Mar 15', icon: FiShield },
]

const availability = [
	{ day: 'Mondays', code: 'M', time: '09:00 AM - 05:00 PM', emphasis: false },
	{ day: 'Tuesdays', code: 'T', time: '09:00 AM - 05:00 PM', emphasis: false },
	{ day: 'Wednesdays', code: 'W', time: 'Remote Only (08:00 AM - 04:00 PM)', emphasis: true },
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
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-schedule"><FiCalendar className="h-4 w-4" /> My Schedule</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-announcements"><FiBell className="h-4 w-4" /> Announcements</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
				<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-profile"><FiUser className="h-4 w-4" /> My Profile</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
			</nav>

			<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login"><FiLogOut className="h-4 w-4" /> Logout</Link>
			</div>
		</aside>
	)
}

function Toggle({ active }) {
	return (
		<span className={`relative inline-flex h-7 w-13 items-center rounded-full transition ${active ? 'bg-[#0f51ff]' : 'bg-slate-300'}`}>
			<span className={`inline-block h-5 w-5 rounded-full bg-white transition ${active ? 'translate-x-7' : 'translate-x-1'}`} />
		</span>
	)
}

export default function Profile() {
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
								<input type="search" placeholder="Search profile data, documents, and preferences..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
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

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
								<div className="flex items-center gap-4 sm:gap-6">
									<div className="relative h-31 w-31 overflow-hidden rounded-3xl border-2 border-white shadow-lg">
										<img alt="Marcus Sterling" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=360&q=80" />
										<button className="absolute bottom-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0f51ff] text-white shadow-md"><FiEdit2 className="h-3.5 w-3.5" /></button>
									</div>

									<div>
										<h1 className="text-5xl font-black tracking-[-0.05em] text-slate-900">Marcus Sterling</h1>
										<div className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-slate-500"><FiUserCheck className="h-4 w-4 text-[#0f51ff]" /> Senior Systems Architect • Engineering Team</div>
										<div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold uppercase tracking-[0.12em]">
											<span className="rounded-full bg-[#e9eeff] px-3 py-1.5 text-[#0f51ff]">Active Shift</span>
											<span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">Employee ID: AS-9942</span>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<button className="rounded-xl bg-[#e8edff] px-4 py-3 text-sm font-bold text-slate-600">Discard</button>
									<button className="rounded-xl bg-[#0f51ff] px-5 py-3 text-sm font-bold text-white">Save Changes</button>
								</div>
							</div>
						</section>

						<section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
							<div className="space-y-5">
								<article className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
									<h2 className="inline-flex items-center gap-2 text-[32px] font-black tracking-[-0.04em] text-slate-900"><FiUser className="h-5 w-5 text-[#0f51ff]" /> Contact Information</h2>

									<div className="mt-5 grid gap-6 sm:grid-cols-2">
										<div>
											<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Work Email</div>
											<div className="mt-2 border-b border-slate-300 pb-2 text-2xl font-bold text-slate-800">m.sterling@atlasstream.io</div>
										</div>
										<div>
											<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Mobile Phone</div>
											<div className="mt-2 border-b border-slate-300 pb-2 text-2xl font-bold text-slate-800">+1 (555) 012-3456</div>
										</div>
									</div>

									<div className="mt-5">
										<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Office Location</div>
										<div className="mt-2 border-b border-slate-300 pb-2 text-2xl font-bold text-slate-800">Building 4, Floor 12, Desk 42A</div>
									</div>

									<div className="mt-7 border-t border-slate-200 pt-6">
										<h3 className="inline-flex items-center gap-2 text-[30px] font-black tracking-[-0.04em] text-slate-900"><FiSliders className="h-5 w-5 text-[#0f51ff]" /> Skills & Tags</h3>
										<div className="mt-4 flex flex-wrap gap-2.5">
											{skills.map((skill) => (
												<button key={skill} className="inline-flex items-center gap-2 rounded-full border border-[#c8d5ff] bg-[#eef3ff] px-3 py-2 text-sm font-bold text-[#2550c2]">{skill} <FiX className="h-3.5 w-3.5" /></button>
											))}
											<button className="rounded-full border-2 border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-500">+ Add Skill</button>
										</div>
									</div>
								</article>

								<article className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
									<div className="flex items-center justify-between gap-3">
										<h2 className="inline-flex items-center gap-2 text-[32px] font-black tracking-[-0.04em] text-slate-900"><FiCalendar className="h-5 w-5 text-[#0f51ff]" /> Recurring Availability</h2>
										<button className="text-sm font-bold text-[#0f51ff]">Clear All</button>
									</div>

									<div className="mt-4 space-y-3">
										{availability.map((item) => (
											<div key={item.day} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${item.emphasis ? 'border-[#b8c8ff] bg-[#ecf2ff]' : 'border-slate-200 bg-[#f8faff]'}`}>
												<span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold ${item.emphasis ? 'bg-[#0f51ff] text-white' : 'bg-[#0f51ff] text-white'}`}>{item.code}</span>
												<div className="min-w-0 flex-1">
													<div className="text-2xl font-black tracking-[-0.03em] text-slate-900">{item.day}</div>
												</div>
												<div className={`text-sm font-bold ${item.emphasis ? 'text-[#1f4fc3]' : 'text-slate-600'}`}>{item.time}</div>
												<button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white"><FiSettings className="h-4 w-4" /></button>
											</div>
										))}
									</div>
								</article>
							</div>

							<div className="space-y-5">
								<article className="rounded-2xl border border-slate-200/80 bg-[#eef2ff] p-5">
									<h2 className="inline-flex items-center gap-2 text-[30px] font-black tracking-[-0.04em] text-slate-900"><FiFolder className="h-5 w-5 text-[#0f51ff]" /> Linked Documents</h2>
									<div className="mt-4 space-y-2.5">
										{documents.map((doc) => {
											const Icon = doc.icon

											return (
												<div key={doc.name} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5">
													<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ff] text-[#0f51ff]"><Icon className="h-4 w-4" /></span>
													<div className="min-w-0 flex-1">
														<div className="truncate text-sm font-bold text-slate-800">{doc.name}</div>
														<div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{doc.date}</div>
													</div>
													<button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><FiDownload className="h-4 w-4" /></button>
												</div>
											)
										})}
										<button className="mt-1 w-full rounded-xl border-2 border-dashed border-[#c8d1eb] px-3 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-slate-500"><FiUpload className="mr-2 inline h-4 w-4" /> Upload Document</button>
									</div>
								</article>

								<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
									<h2 className="inline-flex items-center gap-2 text-[30px] font-black tracking-[-0.04em] text-slate-900"><FiSliders className="h-5 w-5 text-[#0f51ff]" /> Work Preferences</h2>
									<div className="mt-4 space-y-4">
										<div className="flex items-center justify-between gap-3">
											<div>
												<div className="text-xl font-black text-slate-900">Night Shift Eligible</div>
												<div className="text-sm text-slate-500">Available for 10PM - 6AM windows</div>
											</div>
											<Toggle active={false} />
										</div>
										<div className="flex items-center justify-between gap-3">
											<div>
												<div className="text-xl font-black text-slate-900">Emergency On-Call</div>
												<div className="text-sm text-slate-500">Available for priority call-ins</div>
											</div>
											<Toggle active={true} />
										</div>
										<div className="flex items-center justify-between gap-3">
											<div>
												<div className="text-xl font-black text-slate-900">Project Lead Interest</div>
												<div className="text-sm text-slate-500">Open to leading team squads</div>
											</div>
											<Toggle active={true} />
										</div>
									</div>

									<div className="mt-6 border-t border-slate-200 pt-5">
										<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Preferred Tooling</div>
										<button className="mt-3 inline-flex w-full items-center justify-between rounded-xl border border-slate-200 bg-[#f7f9ff] px-3 py-3 text-left text-sm font-bold text-slate-700">
											JetBrains Ecosystem
											<FiChevronDown className="h-4 w-4 text-slate-400" />
										</button>
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
