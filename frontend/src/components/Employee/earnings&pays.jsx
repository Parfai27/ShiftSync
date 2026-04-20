import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiDownload,
	FiDollarSign,
	FiEye,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiSearch,
	FiSettings,
	FiTrendingUp,
	FiUser,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const summaryCards = [
	{
		label: 'Current Period',
		value: '$2,450.00',
		note: 'Oct 01 - Oct 15, 2023',
		accent: 'bg-white',
	},
	{
		label: 'Next Pay Day',
		value: 'Oct 20, 2023',
		note: 'Payroll Processed',
		accent: 'bg-[#0f51ff] text-white',
		pill: true,
	},
	{
		label: 'Year-to-Date Gross',
		value: '$48,920.00',
		note: '+12.4% from 2022',
		accent: 'bg-white',
	},
]

const monthLabels = ['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const payslips = [
	{ period: 'Pay Period ending Sep 30, 2023', bank: 'Deposited to Chase Bank (*** 4291)', amount: '$2,037.70' },
	{ period: 'Pay Period ending Sep 15, 2023', bank: 'Deposited to Chase Bank (*** 4291)', amount: '$2,088.15' },
	{ period: 'Pay Period ending Aug 31, 2023', bank: 'Deposited to Chase Bank (*** 4291)', amount: '$1,992.40' },
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
				<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
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

export default function EarningsAndPays() {
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
								<input type="search" placeholder="Search payslips, periods, and payroll data..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
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
						<section className="grid gap-4 lg:grid-cols-3">
							{summaryCards.map((card) => (
								<article key={card.label} className={`rounded-2xl border border-slate-200/80 p-5 ${card.accent}`}>
									<div className={`text-[11px] font-extrabold uppercase tracking-[0.16em] ${card.accent.includes('text-white') ? 'text-blue-100' : 'text-slate-500'}`}>{card.label}</div>
									<div className={`mt-2 text-5xl leading-none font-black tracking-[-0.05em] ${card.accent.includes('text-white') ? 'text-white' : 'text-slate-900'}`}>{card.value}</div>
									{card.pill ? (
										<span className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100">{card.note}</span>
									) : (
										<div className="mt-4 text-sm font-semibold text-[#2d5cf6]">{card.note}</div>
									)}
								</article>
							))}
						</section>

						<section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]">
							<article className="rounded-2xl border border-slate-200/80 bg-[#f5f7ff] p-5">
								<div className="flex items-center justify-between gap-3">
									<div>
										<h2 className="text-3xl font-black tracking-[-0.04em] text-slate-900">Earnings History</h2>
										<p className="text-sm text-slate-500">Gross pay per period (Last 6 Months)</p>
									</div>
									<div className="inline-flex rounded-full bg-white p-1 text-xs font-semibold text-slate-500">
										<button className="rounded-full px-3 py-1.5">Monthly</button>
										<button className="rounded-full bg-[#0f51ff] px-3 py-1.5 text-white">Bi-Weekly</button>
									</div>
								</div>

								<div className="mt-7 flex h-56 items-end justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 pb-4 pt-6">
									{monthLabels.map((month, index) => (
										<div key={month} className="flex flex-1 flex-col items-center justify-end gap-2">
											<div className={`w-full rounded-t-lg ${index % 2 === 0 ? 'bg-[#9ab0ff]/55' : 'bg-[#2d5cf6]'} ${index === 3 ? 'h-33' : index === 2 ? 'h-26' : index === 5 ? 'h-29' : index === 4 ? 'h-20' : index === 1 ? 'h-22' : 'h-17'}`} />
											<span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{month}</span>
										</div>
									))}
								</div>
							</article>

							<article className="rounded-2xl border border-slate-200/80 bg-[#e9efff] p-5">
								<h2 className="text-3xl font-black tracking-[-0.04em] text-slate-900">Hours Breakdown</h2>
								<div className="mt-5 space-y-5">
									<div>
										<div className="flex items-center justify-between text-sm font-semibold text-slate-700"><span>Regular Hours</span><span>80.00 hrs</span></div>
										<div className="mt-2 h-2 rounded-full bg-[#c9d7ff]"><div className="h-full w-full rounded-full bg-[#2d5cf6]" /></div>
										<div className="mt-1 flex items-center justify-between text-[12px] text-slate-500"><span>$30.00/hr</span><span className="font-bold text-slate-700">$2,400.00</span></div>
									</div>
									<div>
										<div className="flex items-center justify-between text-sm font-semibold text-slate-700"><span>Overtime (1.5x)</span><span>1.25 hrs</span></div>
										<div className="mt-2 h-2 rounded-full bg-[#d8dfef]"><div className="h-full w-[24%] rounded-full bg-[#bc410d]" /></div>
										<div className="mt-1 flex items-center justify-between text-[12px] text-slate-500"><span>$45.00/hr</span><span className="font-bold text-slate-700">$56.25</span></div>
									</div>
									<div className="border-t border-slate-300 pt-3">
										<div className="flex items-center justify-between text-sm"><span className="text-slate-500">Tax Deductions (Est.)</span><span className="font-bold text-rose-600">-$412.30</span></div>
									</div>
								</div>
							</article>
						</section>

						<section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div>
									<h2 className="text-3xl font-black tracking-[-0.04em] text-slate-900">Recent Paystubs</h2>
									<p className="text-sm text-slate-500">View and download your payment documents</p>
								</div>
								<button className="text-sm font-bold text-[#2d5cf6]">View All History</button>
							</div>

							<div className="mt-5 divide-y divide-slate-100">
								{payslips.map((item) => (
									<div key={item.period} className="flex flex-wrap items-center gap-3 py-4">
										<span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#2d5cf6]"><FiCalendar className="h-5 w-5" /></span>
										<div className="min-w-0 flex-1">
											<div className="truncate text-lg font-black tracking-[-0.03em] text-slate-900">{item.period}</div>
											<div className="truncate text-sm text-slate-500">{item.bank}</div>
										</div>
										<div className="ml-auto text-right">
											<div className="text-sm font-semibold text-slate-500">Net Amount</div>
											<div className="text-3xl font-black tracking-[-0.04em] text-slate-900">{item.amount}</div>
										</div>
										<button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500"><FiEye className="h-4 w-4" /></button>
										<button className="inline-flex items-center gap-2 rounded-xl bg-[#eef2ff] px-4 py-2 text-sm font-bold text-slate-700"><FiDownload className="h-4 w-4" /> Download</button>
									</div>
								))}
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
