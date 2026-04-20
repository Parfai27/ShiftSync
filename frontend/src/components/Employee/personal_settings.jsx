import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiDollarSign,
	FiGrid,
	FiLock,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiSearch,
	FiSettings,
	FiShield,
	FiUser,
	FiX,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const availability = [
	{ day: 'MON', time: '09:00 - 17:00', active: true },
	{ day: 'TUE', time: '09:00 - 17:00', active: true },
	{ day: 'WED', time: '09:00 - 17:00', active: false },
	{ day: 'THU', time: '09:00 - 17:00', active: true },
	{ day: 'FRI', time: '09:00 - 17:00', active: true },
	{ day: 'SAT', time: 'Off', active: false },
	{ day: 'SUN', time: 'Off', active: false },
]

const notificationRules = [
	{ title: 'Schedule Changes', detail: 'Alerts when your shifts are modified', email: true, push: true },
	{ title: 'Company News', detail: 'General announcements and updates', email: true, push: false },
	{ title: 'Team Messages', detail: 'Direct messages from colleagues', email: false, push: true },
]

export default function PersonalSettings() {
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
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-dashboard"><FiGrid className="h-4 w-4" /> My Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-schedule"><FiCalendar className="h-4 w-4" /> My Schedule</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-announcements"><FiBell className="h-4 w-4" /> Announcements</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-profile"><FiUser className="h-4 w-4" /> My Profile</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
					</nav>

					<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
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
								<input type="search" placeholder="Search your settings..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiBell className="h-4 w-4" /></button>
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiMoon className="h-4 w-4" /></button>
								<div className="flex items-center gap-3 rounded-full bg-white px-3 py-2">
									<div className="text-right leading-tight">
										<div className="text-sm font-bold text-slate-900">Alexander Thompson</div>
										<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Team Member</div>
									</div>
									<div className="h-10 w-10 overflow-hidden rounded-full bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] ring-2 ring-[#eef3ff]" />
									<FiChevronDown className="h-4 w-4 text-slate-400" />
								</div>
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section>
							<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Personal Settings</h1>
							<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">Manage your digital identity, notification rules, and availability schedule.</p>

							<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
								<article className="rounded-2xl border border-slate-200/80 bg-white p-4">
									<div className="mb-4 flex items-center justify-between gap-3">
										<div className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiUser className="h-4 w-4 text-[#2444ac]" /> Profile Information</div>
										<button className="rounded-xl bg-[#0f51ff] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white">Save Changes</button>
									</div>
									<div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)]">
										<div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#ff4f7b,#ffb46b)]">
											<img alt="Alexander Thompson" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" />
											<button className="absolute bottom-1 right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#0f51ff] shadow"><FiSettings className="h-3.5 w-3.5" /></button>
										</div>
										<div className="space-y-3">
											<div>
												<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Display Name</div>
												<input value="Alexander Thompson" readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-[#f6f8ff] px-3 text-sm text-slate-700" />
											</div>
											<div>
												<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Contact Email</div>
												<input value="a.thompson@atlasstream.io" readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-[#f6f8ff] px-3 text-sm text-slate-700" />
											</div>
										</div>
									</div>
								</article>

								<article className="rounded-2xl border border-slate-200/80 bg-[#eef2ff] p-4">
									<div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiBell className="h-4 w-4 text-[#2444ac]" /> Notifications</div>
									<div className="space-y-3">
										{notificationRules.map((rule) => (
											<div key={rule.title} className="rounded-xl bg-white px-3 py-3">
												<div className="text-sm font-bold text-slate-900">{rule.title}</div>
												<div className="text-xs text-slate-500">{rule.detail}</div>
												<div className="mt-2 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
													<span>Email</span>
													<button className={`relative h-5 w-9 rounded-full ${rule.email ? 'bg-[#0f51ff]' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${rule.email ? 'left-4.5' : 'left-0.5'}`} /></button>
													<span>Push</span>
													<button className={`relative h-5 w-9 rounded-full ${rule.push ? 'bg-[#0f51ff]' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${rule.push ? 'left-4.5' : 'left-0.5'}`} /></button>
												</div>
											</div>
										))}
									</div>
								</article>
							</div>

							<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
								<article className="rounded-2xl border border-slate-200/80 bg-[#eef2ff] p-4">
									<div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiCalendar className="h-4 w-4 text-[#2444ac]" /> Weekly Availability</div>
									<p className="text-sm text-slate-500">Define your preferred working windows to help us match you with the best shifts.</p>
									<div className="mt-4 grid grid-cols-7 gap-2">
										{availability.map((slot) => (
											<div key={slot.day} className={`rounded-xl border px-2 py-3 text-center ${slot.active ? 'border-[#b8caff] bg-white' : 'border-slate-200 bg-[#e9eefc]'}`}>
												<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">{slot.day}</div>
												<div className={`mt-2 text-[11px] font-bold ${slot.active ? 'text-[#0f51ff]' : 'text-slate-400'}`}>{slot.time}</div>
											</div>
										))}
									</div>
									<button className="mt-4 text-sm font-bold text-[#0f51ff]">+ Edit Availability</button>
								</article>

								<div className="space-y-5">
									<article className="rounded-2xl border border-slate-200/80 bg-[#eef2ff] p-4">
										<div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiShield className="h-4 w-4 text-[#2444ac]" /> Privacy & Visibility</div>
										<div className="rounded-xl bg-white px-3 py-3">
											<div className="flex items-center justify-between gap-3">
												<div>
													<div className="text-sm font-bold text-slate-900">Hide Profile</div>
													<div className="text-xs text-slate-500">When enabled, other employees cannot find you in the directory.</div>
												</div>
												<button className="relative h-6 w-11 rounded-full bg-slate-300"><span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white" /></button>
											</div>
										</div>
									</article>

									<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
										<button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-[#eef2ff] px-4 py-3 text-sm font-bold text-[#2444ac]"><FiLock className="h-4 w-4" /> Change Password</button>
										<button className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600"><FiX className="h-4 w-4" /> Logout Everywhere</button>
									</div>
								</div>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
