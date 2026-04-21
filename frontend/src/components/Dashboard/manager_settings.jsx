import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiHome,
	FiLayers,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiPieChart,
	FiPlus,
	FiSearch,
	FiSettings,
	FiSliders,
	FiUsers,
	FiZap,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { clearSession } from '../../lib/session'
import { resolveProfileImage, useManagerWorkspace } from '../../lib/managerWorkspace'

export default function ManagerSettings() {
	const { manager, workspace, error } = useManagerWorkspace()
	const profileImage = resolveProfileImage(manager?.profileImageUrl, manager?.fullName)
	const settings = workspace.settings

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
					<div className="flex w-full items-center justify-start gap-3"><img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" /></div>
					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/overview"><FiHome className="h-4 w-4" /> Dashboard Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/profiles"><FiUsers className="h-4 w-4" /> Employee Profiles</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/scheduling"><FiCalendar className="h-4 w-4" /> Shift Scheduling</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>
					<div className="mt-auto space-y-3 pt-8">
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]"><FiPlus className="h-4 w-4" /> Create New Shift</button>
						<div className="space-y-1 text-sm text-slate-600"><Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/manager-settings"><FiSettings className="h-4 w-4" /> Settings</Link><Link className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link></div>
					</div>
				</aside>

				<div className="dashboard-main-offset flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden"><button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700"><FiMenu className="h-5 w-5" /></button><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f51ff] text-xs font-black text-white">S</span><div className="min-w-0"><div className="truncate text-sm font-extrabold text-slate-900">ShiftSync</div><div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Workforce Management</div></div></div></div>
						<div className="mt-4 flex flex-col gap-4 xl:mt-0 xl:flex-row xl:items-center xl:justify-between">
							<label className="relative w-full max-w-3xl"><FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" placeholder="Search department settings..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" /></label>
							<div className="flex items-center justify-between gap-3 xl:justify-end"><button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiBell className="h-4 w-4" /></button><button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiMoon className="h-4 w-4" /></button><div className="flex items-center gap-3 rounded-full bg-white px-3 py-2"><div className="text-right leading-tight"><div className="text-sm font-bold text-slate-900">{manager.fullName}</div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{manager.roleLabel}</div></div><div className="h-10 w-10 overflow-hidden rounded-full bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] ring-2 ring-[#eef3ff]"><img alt={manager.fullName} className="h-full w-full object-cover" src={profileImage} /></div><FiChevronDown className="h-4 w-4 text-slate-400" /></div></div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section>
							<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Manager Settings</h1>
							<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">{settings.summary || 'Loading manager settings...'}</p>
							{error ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}

							<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(240px,0.75fr)]">
								<article className="rounded-2xl border border-slate-200/80 bg-white p-4"><div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiUsers className="h-4 w-4 text-[#2444ac]" /> Team Visibility</div><div className="space-y-3">{settings.visibilityRules.map((rule) => <div key={rule.label} className="flex items-center justify-between gap-3 rounded-xl bg-[#f8faff] px-3 py-3"><div><div className="text-sm font-bold text-slate-900">{rule.label}</div><div className="text-xs text-slate-500">{rule.detail}</div></div><button className={`relative h-6 w-11 rounded-full ${rule.enabled ? 'bg-[#0f51ff]' : 'bg-slate-300'}`} aria-label={`${rule.label} toggle`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white ${rule.enabled ? 'left-5.5' : 'left-0.5'}`} /></button></div>)}</div></article>
								<article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-[linear-gradient(145deg,#021022_0%,#0f2d4e_50%,#091a34_100%)] p-0 text-white"><div className="h-full p-5"><div className="mx-auto mt-3 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-2xl font-black ring-1 ring-white/20">{manager.fullName?.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div className="mt-20 text-center text-xs font-extrabold uppercase tracking-[0.14em] text-blue-100">Ngabo Pharmacy Branch</div><div className="mt-1 text-center text-xl font-black tracking-[-0.04em]">Department: {settings.departmentName}</div></div></article>
							</div>

							<div className="mt-5 grid gap-5 xl:grid-cols-2">
								<article className="rounded-2xl border border-slate-200/80 bg-white p-4"><div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiZap className="h-4 w-4 text-[#2444ac]" /> Workflow Approvals</div><div className="space-y-3">{settings.workflowRules.map((rule) => <div key={rule.title} className="rounded-xl border border-slate-200/80 bg-[#f8faff] p-3"><div className="flex items-center justify-between gap-3"><div className="text-sm font-bold text-slate-900">{rule.title}</div><span className="rounded-full bg-[#e8edff] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2444ac]">{rule.badge}</span></div><div className="mt-1 text-xs text-slate-500">{rule.detail}</div>{rule.actionLabel ? <button className="mt-2 text-xs font-bold text-[#0f51ff]">{rule.actionLabel}</button> : null}</div>)}<button className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-[#0f51ff] hover:text-[#0f51ff]">+ Add Auto-Scheduling Trigger</button></div></article>
								<article className="rounded-2xl border border-slate-200/80 bg-white p-4"><div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiSettings className="h-4 w-4 text-[#ea7a4b]" /> Department Settings</div><div className="space-y-3"><div><div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Work Week Start Day</div><div className="flex h-10 items-center justify-between rounded-lg border border-slate-200 bg-[#f8faff] px-3 text-sm text-slate-700"><span>{settings.workWeekStartDay}</span><FiChevronDown className="h-4 w-4 text-slate-400" /></div></div><div><div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Overtime (OT) Threshold</div><div className="flex items-center gap-2"><input value={settings.overtimeThreshold.replace(' Hours / Week', '')} readOnly className="h-10 w-20 rounded-lg border border-slate-200 bg-[#f8faff] px-3 text-sm" /><span className="text-sm font-semibold text-slate-600">Hours / Week</span></div></div><div><div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Currency & Localization</div><div className="flex h-10 items-center justify-between rounded-lg border border-slate-200 bg-[#f8faff] px-3 text-sm text-slate-700"><span>{settings.currencyLocalization}</span><FiSettings className="h-4 w-4 text-slate-400" /></div></div><div className="flex items-center gap-2 pt-1"><button className="flex-1 rounded-lg bg-[#eef2ff] px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2444ac]">Reset</button><button className="flex-1 rounded-lg bg-[#0f51ff] px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white">Save Changes</button></div></div></article>
							</div>

							<div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-lg font-black tracking-[-0.03em] text-rose-700">Danger Zone</div><div className="text-sm text-rose-600">Archiving this department will freeze all current schedules and payroll data.</div></div><button className="rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100">Archive Team</button></div></div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
