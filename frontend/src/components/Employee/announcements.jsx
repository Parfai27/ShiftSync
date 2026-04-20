import {
	FiArrowRight,
	FiBell,
	FiBookOpen,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiDollarSign,
	FiExternalLink,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiSearch,
	FiSettings,
	FiShield,
	FiTrendingUp,
	FiUser,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const trainingCards = [
	{
		title: 'Safety Standards 2024',
		progress: '75% Complete',
		bar: 'w-[75%] bg-[#2d5cf6]',
		icon: FiShield,
	},
	{
		title: 'Internal Ethics & Privacy',
		progress: '24/45 Modules',
		bar: 'w-[52%] bg-[#7c8ec7]',
		icon: FiShield,
	},
]

const highlightStats = [
	{ label: 'CERTS EARNED', value: '12', icon: FiShield },
	{ label: 'HOURS TRACKED', value: '48.5', icon: FiClock },
	{ label: 'SKILL LEVEL', value: 'Lvl 4', icon: FiTrendingUp },
]

const internalNews = [
	{
		date: 'TODAY',
		title: 'New Office Entry System Implementation',
		text: 'Starting Monday, all badge readers will be upgraded to the new NFC system. Please pick up your new keycard.',
	},
	{
		date: 'YESTERDAY',
		title: 'Quarterly Bonus Structure Update',
		text: 'The H2 performance bonus tiers have been adjusted based on global logistics targets.',
	},
	{
		date: 'OCT 12',
		title: 'Voluntary Paid Time Off Donations',
		text: 'Join our annual PTO share program to support colleagues in medical need.',
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
				<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-announcements"><FiBell className="h-4 w-4" /> Announcements</Link>
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

export default function Announcements() {
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
								<input type="search" placeholder="Search announcements, training modules, and documents..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
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
						<section className="overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#0f51ff_0%,#1e56d6_50%,#4472da_100%)] p-7 text-white sm:p-8">
							<div className="max-w-140">
								<span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-100">Featured Training</span>
								<h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-[52px]">Mastering Logistics 2.0: Efficiency Protocols</h1>
								<p className="mt-4 text-base leading-7 text-blue-100">Upgrade your workflow with our newest operational standard guidelines. Mandatory for all senior leads by the end of Q3.</p>
								<div className="mt-6 flex flex-wrap gap-2.5">
									<button className="rounded-xl bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[#0f51ff]">Start Module</button>
									<button className="rounded-xl border border-white/40 bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-white/10">Save For Later</button>
								</div>
							</div>
						</section>

						<section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.7fr)]">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="text-[36px] font-black tracking-[-0.05em] text-slate-900">Training Progress</h2>
										<p className="text-sm text-slate-500">Your learning journey at a glance</p>
									</div>
									<button className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0f51ff]">View History <FiArrowRight className="h-4 w-4" /></button>
								</div>

								<div className="grid gap-3 sm:grid-cols-2">
									{trainingCards.map((card) => {
										const Icon = card.icon

										return (
											<article key={card.title} className="rounded-2xl border border-slate-200/80 bg-white p-4">
												<div className="flex items-center justify-between gap-3">
													<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ff] text-[#2d5cf6]"><Icon className="h-4 w-4" /></span>
													<span className="text-xs font-bold text-slate-500">{card.progress}</span>
												</div>
												<h3 className="mt-7 text-[26px] font-black tracking-[-0.04em] text-slate-900">{card.title}</h3>
												<div className="mt-3 h-1.5 w-full rounded-full bg-slate-200">
													<div className={`h-full rounded-full ${card.bar}`} />
												</div>
											</article>
										)
									})}
								</div>

								<div className="grid gap-3 sm:grid-cols-3">
									{highlightStats.map((item) => {
										const Icon = item.icon

										return (
											<article key={item.label} className="rounded-2xl border border-slate-200/80 bg-white p-4">
												<div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500"><Icon className="h-4 w-4 text-[#2d5cf6]" /> {item.label}</div>
												<div className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-900">{item.value}</div>
											</article>
										)
									})}
								</div>

								<div>
									<h2 className="text-[36px] font-black tracking-[-0.05em] text-slate-900">Resource Library</h2>
									<div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)]">
										<article className="relative overflow-hidden rounded-3xl bg-[#dce4ff] p-5">
											<div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#c8d3fb]" />
											<span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#2d5cf6]"><FiBookOpen className="h-5 w-5" /></span>
											<h3 className="relative mt-4 text-[38px] leading-[1.02] font-black tracking-[-0.04em] text-slate-900">Employee Handbook</h3>
											<p className="relative mt-4 max-w-80 text-base leading-7 text-slate-600">The essential guide to our culture, policies, and operational excellence at Atlas Stream.</p>
											<button className="relative mt-6 rounded-xl bg-[#111d3a] px-5 py-3 text-sm font-extrabold text-white">Open Handbook</button>
										</article>

										<div className="space-y-3">
											<article className="rounded-3xl border border-slate-200/80 bg-white p-5">
												<div className="flex items-center gap-3">
													<span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffe8e6] text-[#cf3b2c]"><FiShield className="h-5 w-5" /></span>
													<div>
														<div className="text-xl font-black tracking-[-0.03em] text-slate-900">Safety Protocols</div>
														<div className="text-sm text-slate-500">Compliance & emergency procedures</div>
													</div>
												</div>
											</article>

											<article className="rounded-3xl border border-slate-200/80 bg-white p-5">
												<div className="flex items-center gap-3">
													<span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8edff] text-[#2d5cf6]"><FiBookOpen className="h-5 w-5" /></span>
													<div>
														<div className="text-xl font-black tracking-[-0.03em] text-slate-900">Benefit Guides</div>
														<div className="text-sm text-slate-500">Health, dental, and 401K information</div>
													</div>
												</div>
											</article>
										</div>
									</div>
								</div>
							</div>

							<aside className="rounded-3xl border border-slate-200/80 bg-white p-5">
								<div className="flex items-center justify-between gap-2">
									<h2 className="text-[34px] font-black tracking-[-0.04em] text-slate-900">Internal News</h2>
									<span className="h-2 w-2 rounded-full bg-[#0f51ff]" />
								</div>
								<div className="mt-4 space-y-5">
									{internalNews.map((item) => (
										<article key={item.title} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
											<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{item.date}</div>
											<h3 className="mt-1 text-[22px] leading-7 font-black tracking-[-0.03em] text-slate-900">{item.title}</h3>
											<p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
										</article>
									))}
								</div>

								<div className="mt-6 rounded-2xl bg-[#eef2ff] p-4">
									<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Helpful Quicklinks</div>
									<div className="mt-3 space-y-2 text-sm font-bold text-[#2d5cf6]">
										<a className="flex items-center gap-1.5 hover:underline" href="#hr">HR Portal <FiExternalLink className="h-3.5 w-3.5" /></a>
										<a className="flex items-center gap-1.5 hover:underline" href="#it">IT Support Ticket <FiExternalLink className="h-3.5 w-3.5" /></a>
										<a className="flex items-center gap-1.5 hover:underline" href="#leave">Leave Request Form <FiExternalLink className="h-3.5 w-3.5" /></a>
									</div>
								</div>
							</aside>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
