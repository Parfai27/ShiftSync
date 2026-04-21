import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiDownload,
	FiFilter,
	FiHome,
	FiLayers,
	FiLogOut,
	FiMoreVertical,
	FiPieChart,
	FiPlus,
	FiSearch,
	FiSettings,
	FiSliders,
	FiUsers,
	FiMenu,
	FiMoon,
	FiClock,
} from 'react-icons/fi'
import { RiGroupLine, RiRadarLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import { clearSession } from '../../lib/session'
import { resolveProfileImage, useManagerWorkspace } from '../../lib/managerWorkspace'

function MetricCard({ item }) {
	const icons = {
		'Total Active Employees': RiGroupLine,
		'Average Attendance': FiCalendar,
		'Overtime Hours': FiClock,
		'Est. Labor Cost': RiRadarLine,
	}
	const Icon = icons[item.title] || RiGroupLine

	return (
		<article className="rounded-[22px] border border-slate-200/80 bg-white p-5">
			<div className="flex items-start justify-between gap-3">
				<div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.accent}`}><Icon className="h-5 w-5" /></div>
				<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${item.delta === 'Stable' ? 'bg-slate-100 text-slate-500' : item.delta.startsWith('-') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{item.delta}</span>
			</div>
			<div className="mt-5 text-sm text-slate-500">{item.title}</div>
			<div className="mt-1 text-3xl font-black tracking-[-0.06em] text-slate-950">{item.value}</div>
		</article>
	)
}

function StatusBadge({ danger, children }) {
	return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${danger ? 'bg-rose-100 text-rose-600' : 'bg-[#eef3ff] text-[#0f51ff]'}`}>{children}</span>
}

export default function Reports() {
	const { manager, workspace, isLoading, error } = useManagerWorkspace()
	const profileImage = resolveProfileImage(manager?.profileImageUrl, manager?.fullName)
	const reports = workspace.reports

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="flex w-full shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:fixed xl:left-0 xl:top-0 xl:h-screen" style={{ width: '264px', maxWidth: '264px' }}>
					<div className="flex w-full items-center justify-start gap-3"><img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" /></div>
					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/overview"><FiHome className="h-4 w-4" /> Dashboard Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/profiles"><FiUsers className="h-4 w-4" /> Employee Profiles</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/scheduling"><FiCalendar className="h-4 w-4" /> Shift Scheduling</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>
					<div className="mt-auto space-y-3 pt-8">
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]"><FiPlus className="h-4 w-4" /> Export Snapshot</button>
						<div className="space-y-1 text-sm text-slate-600"><Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/manager-settings"><FiSettings className="h-4 w-4" /> Settings</Link><Link className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link></div>
					</div>
				</aside>

				<div className="dashboard-main-offset flex min-h-0 flex-1 flex-col h-screen overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden"><button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700"><FiMenu className="h-5 w-5" /></button><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f51ff] text-xs font-black text-white">S</span><div className="min-w-0"><div className="truncate text-sm font-extrabold text-slate-900">ShiftSync</div><div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Workforce Management</div></div></div></div>
						<div className="mt-4 flex flex-col gap-4 xl:mt-0 xl:flex-row xl:items-center xl:justify-between">
							<label className="relative w-full max-w-3xl"><FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" placeholder="Search reports, logs, or metrics..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" /></label>
							<div className="flex items-center justify-between gap-3 xl:justify-end"><button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiBell className="h-4 w-4" /></button><button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiMoon className="h-4 w-4" /></button><div className="flex items-center gap-3 rounded-full bg-white px-3 py-2"><div className="text-right leading-tight"><div className="text-sm font-bold text-slate-900">{manager.fullName}</div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{manager.roleLabel}</div></div><div className="h-10 w-10 overflow-hidden rounded-full bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] ring-2 ring-[#eef3ff]"><img alt={manager.fullName} className="h-full w-full object-cover" src={profileImage} /></div><FiChevronDown className="h-4 w-4 text-slate-400" /></div></div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="space-y-6">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Reports &amp; Analytics</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{reports.summary || 'Loading report data...'}</p></div><div className="flex flex-wrap items-center gap-3"><div className="inline-flex rounded-2xl bg-[#f3f6ff] p-1 text-sm font-semibold text-slate-500"><button className="rounded-xl bg-white px-4 py-2 text-[#0f51ff]">Last 30 Days</button><button className="rounded-xl px-4 py-2">Quarterly</button><button className="rounded-xl px-4 py-2">Yearly</button></div><button className="inline-flex items-center gap-2 rounded-2xl bg-[#e8eeff] px-4 py-3 text-sm font-bold text-slate-700"><FiFilter className="h-4 w-4" /> Filter</button><button className="inline-flex items-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white"><FiDownload className="h-4 w-4" /> Export <FiChevronDown className="h-4 w-4" /></button></div></div>
							{error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{reports.metrics.map((item) => <MetricCard key={item.title} item={item} />)}</div>
							<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
								<div className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Attendance Trends</h2><p className="mt-1 text-sm text-slate-500">Daily check-ins vs scheduled shifts</p></div></div><div className="mt-6 rounded-[22px] bg-[#f8faff] p-4 sm:p-5"><div className="grid h-72 grid-cols-7 items-end gap-2 sm:h-96 sm:gap-3">{reports.attendanceBars.map((height, index) => <div key={reports.weekLabels[index]} className="flex h-full flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end rounded-2xl bg-white/70 px-1.5 pb-1.5 sm:px-2 sm:pb-2"><div className="w-full rounded-2xl bg-[linear-gradient(180deg,#0f51ff_0%,#0646d7_100%)]" style={{ height: `${height}%` }} /></div><div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500">{reports.weekLabels[index]}</div></div>)}</div></div></div>
								<div className="rounded-[26px] border border-slate-200/80 bg-[#eef3ff] p-5 sm:p-6"><h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Shift Distribution</h2><p className="mt-1 text-sm text-slate-500">Workforce split by department</p><div className="mt-6 flex items-center justify-center"><div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-white"><div className="absolute inset-0 rounded-full bg-[conic-gradient(#4d63b8_0_74%,#e8eeff_74%_100%)]" /><div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white"><div className="text-center"><div className="text-3xl font-black tracking-[-0.06em] text-slate-950">{reports.capacityPercent}%</div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Capacity</div></div></div></div></div><div className="mt-6 space-y-3">{reports.distribution.map((item) => <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm"><div className="flex items-center gap-3 font-semibold text-slate-700"><span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />{item.label}</div><div className="font-bold text-slate-900">{item.value}</div></div>)}</div></div>
							</div>
							<article className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Recent Shift Compliance</h2><p className="mt-1 text-sm text-slate-500">Tracking the latest punch-in events and status exceptions.</p></div><a className="text-sm font-bold text-[#0f51ff]" href="#audit">View All Logs</a></div><div className="mt-5 overflow-x-auto"><table className="min-w-full text-left"><thead className="border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400"><tr><th className="px-2 py-3">Employee</th><th className="px-2 py-3">Shift Date</th><th className="px-2 py-3">Department</th><th className="px-2 py-3">Punch In</th><th className="px-2 py-3">Status</th><th className="px-2 py-3">Actions</th></tr></thead><tbody>{reports.recentCompliance.map((row) => <tr key={`${row.name}-${row.date}`} className="border-b border-slate-100 last:border-b-0 text-sm text-slate-700"><td className="px-2 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f51ff,#91b2ff)] text-[11px] font-black text-white">{row.initials}</div><div><div className="font-semibold text-slate-900">{row.name}</div><div className="text-xs text-slate-500">{row.id}</div></div></div></td><td className="px-2 py-4">{row.date}</td><td className="px-2 py-4">{row.department}</td><td className="px-2 py-4 font-medium text-slate-900">{row.punchIn}</td><td className="px-2 py-4"><StatusBadge danger={row.danger}>{row.status}</StatusBadge></td><td className="px-2 py-4"><button className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"><FiMoreVertical className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>{!reports.recentCompliance.length && !isLoading ? <div className="mt-4 text-sm text-slate-500">No report rows are available yet.</div> : null}</article>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
