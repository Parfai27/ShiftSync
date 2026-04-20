import {
	FiAlertCircle,
	FiBell,
	FiCalendar,
	FiCheck,
	FiChevronDown,
	FiClock,
	FiDollarSign,
	FiGrid,
	FiInfo,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiSearch,
	FiSettings,
	FiUser,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const notices = [
	{
		title: 'Urgent: Shift Swap Request Denied',
		message: 'Your request to swap the night shift on Friday, Oct 27th with Jordan Lee has been declined by the system due to overtime limit restrictions.',
		time: '2 hours ago',
		tone: 'border-l-[#d62e2e]',
		iconTone: 'bg-[#ffe9e7] text-[#d62e2e]',
		icon: FiAlertCircle,
		action: true,
	},
	{
		title: 'New Schedule Published: Week 44',
		message: 'The new master schedule for the upcoming week has been finalized. You have 36 hours assigned across 5 shifts.',
		time: '4 hours ago',
		tone: 'border-l-[#1f56ea]',
		iconTone: 'bg-[#e9eeff] text-[#1f56ea]',
		icon: FiCalendar,
	},
	{
		title: 'System Maintenance Notice',
		message: 'Atlas Stream Portal will undergo scheduled maintenance this Sunday from 02:00 AM to 04:00 AM EST. Mobile features will be limited.',
		time: 'Yesterday',
		tone: 'border-l-[#c2c7db]',
		iconTone: 'bg-[#edf0ff] text-[#6b7280]',
		icon: FiInfo,
	},
	{
		title: 'Elena Vance approved your Time Off',
		message: '"Great work on the last project, Alex! Enjoy your well-deserved break next Tuesday."',
		time: '2 days ago',
		tone: 'border-l-[#4d6dda]',
		iconTone: 'bg-[#e8eeff] text-[#1f56ea]',
		icon: FiUser,
		avatar: true,
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
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-schedule"><FiCalendar className="h-4 w-4" /> My Schedule</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-announcements"><FiBell className="h-4 w-4" /> Announcements</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-profile"><FiUser className="h-4 w-4" /> My Profile</Link>
				<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
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

export default function EmployeeNotifications() {
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
								<input type="search" placeholder="Search notifications and updates..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
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
						<section>
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h1 className="text-5xl font-black tracking-[-0.05em] text-slate-900">Notifications</h1>
									<p className="mt-2 text-xl text-slate-500">Stay updated with your latest workspace activities and schedule changes.</p>
								</div>
								<button className="rounded-xl bg-[#dfe8ff] px-5 py-3 text-sm font-bold text-[#1f56ea]"><FiCheck className="mr-1 inline h-4 w-4" /> Mark all as read</button>
							</div>

							<div className="mt-5 inline-flex rounded-2xl bg-[#ebeff9] p-1 text-sm font-semibold text-slate-600">
								<button className="rounded-xl bg-white px-5 py-2 text-[#1f56ea]">All</button>
								<button className="rounded-xl px-5 py-2">Unread</button>
								<button className="rounded-xl px-5 py-2">Schedule</button>
								<button className="rounded-xl px-5 py-2">System</button>
							</div>

							<div className="mt-5 space-y-3">
								{notices.map((item) => {
									const Icon = item.icon

									return (
										<article key={item.title} className={`rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 ${item.tone} border-l-4`}>
											<div className="flex flex-wrap items-start gap-3 sm:gap-4">
												{item.avatar ? (
													<div className="h-12 w-12 overflow-hidden rounded-full"><img alt="Elena Vance" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" /></div>
												) : (
													<span className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${item.iconTone}`}><Icon className="h-5 w-5" /></span>
												)}
												<div className="min-w-0 flex-1">
													<div className="flex flex-wrap items-start justify-between gap-2">
														<h2 className="text-[30px] font-black tracking-[-0.04em] text-slate-900">{item.title}</h2>
														<span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500"><FiClock className="h-3.5 w-3.5" /> {item.time}</span>
													</div>
													<p className="mt-1 max-w-5xl text-lg leading-8 text-slate-600">{item.message}</p>
													{item.action ? (
														<div className="mt-3 flex items-center gap-2">
															<button className="rounded-xl bg-[#e9eeff] px-4 py-2 text-sm font-bold text-[#1f56ea]">View Details</button>
															<button className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">Dismiss</button>
														</div>
													) : null}
												</div>
											</div>
										</article>
									)
								})}
							</div>
						</section>

						<section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
							<article className="relative overflow-hidden rounded-3xl bg-[#0f51ff] p-6 text-white">
								<h3 className="text-[38px] font-black tracking-[-0.04em]">Notification Summary</h3>
								<div className="mt-4 grid grid-cols-3 gap-3">
									<div>
										<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-100">Unread</div>
										<div className="mt-1 text-5xl font-black tracking-[-0.04em]">12</div>
									</div>
									<div>
										<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-100">Requests</div>
										<div className="mt-1 text-5xl font-black tracking-[-0.04em]">4</div>
									</div>
									<div>
										<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-100">Mentions</div>
										<div className="mt-1 text-5xl font-black tracking-[-0.04em]">2</div>
									</div>
								</div>
								<FiBell className="pointer-events-none absolute -bottom-5 right-3 h-30 w-30 text-blue-300/25" />
							</article>

							<article className="rounded-3xl border border-slate-200/80 bg-[#e8edff] p-6">
								<h3 className="text-[36px] font-black tracking-[-0.04em] text-slate-900">Quiet Hours</h3>
								<p className="mt-2 text-lg leading-8 text-slate-600">Mute notifications during your off-work hours to maintain focus.</p>
								<div className="mt-5 flex items-center justify-between rounded-2xl bg-white px-4 py-3">
									<div className="inline-flex items-center gap-2 text-xl font-bold text-slate-700"><FiMoon className="h-4 w-4" /> Enabled</div>
									<Toggle active={true} />
								</div>
							</article>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
