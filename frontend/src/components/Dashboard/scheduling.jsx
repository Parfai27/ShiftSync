import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiDownload,
	FiHome,
	FiLayers,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiMoreVertical,
	FiPieChart,
	FiPlus,
	FiPrinter,
	FiSearch,
	FiSettings,
	FiSliders,
	FiUsers,
	FiZap,
} from 'react-icons/fi'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession } from '../../lib/session'
import { resolveProfileImage, useManagerWorkspace } from '../../lib/managerWorkspace'

export default function Scheduling() {
	const { manager, workspace, isLoading, error, reloadWorkspace } = useManagerWorkspace()
	const profileImage = resolveProfileImage(manager?.profileImageUrl, manager?.fullName)
	const scheduling = workspace.scheduling
	const [actionError, setActionError] = useState('')
	const [activeAction, setActiveAction] = useState('')

	async function runSchedulingAction(path, actionKey, fallbackMessage) {
		try {
			setActionError('')
			setActiveAction(actionKey)
			await apiRequest(path, {
				method: 'POST',
				body: JSON.stringify({ managerId: manager.userId }),
			})
			await reloadWorkspace()
		} catch (requestError) {
			setActionError(requestError.message || fallbackMessage)
		} finally {
			setActiveAction('')
		}
	}

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full flex-col overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl xl:flex-row">
				<aside className="flex w-full shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:fixed xl:left-0 xl:top-0 xl:h-screen" style={{ width: '264px', maxWidth: '264px' }}>
					<div className="flex w-full items-center justify-start gap-3">
						<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
					</div>

					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/overview"><FiHome className="h-4 w-4" /> Dashboard Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/profiles"><FiUsers className="h-4 w-4" /> Employee Profiles</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/scheduling"><FiCalendar className="h-4 w-4" /> Shift Scheduling</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>

					<div className="mt-auto space-y-3 pt-8">
						<button
							disabled={activeAction === 'create-shift'}
							onClick={() => runSchedulingAction('/api/scheduling/manager/create-shift', 'create-shift', 'Unable to create a new shift.')}
							className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de] disabled:cursor-not-allowed disabled:opacity-60"
						>
							<FiPlus className="h-4 w-4" /> {activeAction === 'create-shift' ? 'Creating Shift...' : 'Create New Shift'}
						</button>
						<div className="space-y-1 text-sm text-slate-600">
							<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/manager-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
							<Link className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link>
						</div>
					</div>
				</aside>

				<div className="dashboard-main-offset flex min-h-0 flex-1 flex-col h-screen overflow-hidden">
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
								<input type="search" placeholder="Search shifts, employees, or days..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiBell className="h-4 w-4" /></button>
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiMoon className="h-4 w-4" /></button>
								<div className="flex items-center gap-3 rounded-full bg-white px-3 py-2">
									<div className="text-right leading-tight">
										<div className="text-sm font-bold text-slate-900">{manager.fullName}</div>
										<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{manager.roleLabel}</div>
									</div>
									<div className="h-10 w-10 overflow-hidden rounded-full bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] ring-2 ring-[#eef3ff]"><img alt={manager.fullName} className="h-full w-full object-cover" src={profileImage} /></div>
									<FiChevronDown className="h-4 w-4 text-slate-400" />
								</div>
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="space-y-5">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Shift Scheduling</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{scheduling.summary || 'Loading scheduling data...'}</p>
								</div>
								<div className="flex items-center gap-3">
									<div className="inline-flex rounded-2xl bg-[#f3f6ff] p-1 text-sm font-semibold text-slate-500">
										<button className="rounded-xl bg-white px-4 py-2 text-[#0f51ff]">WEEK</button>
										<button className="rounded-xl px-4 py-2">MONTH</button>
									</div>
									<button
										disabled={activeAction === 'auto-schedule'}
										onClick={() => runSchedulingAction('/api/scheduling/manager/auto-schedule', 'auto-schedule', 'Unable to auto schedule the current rota.')}
										className="inline-flex items-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
									>
										<FiZap className="h-4 w-4" /> {activeAction === 'auto-schedule' ? 'Running...' : 'Auto Schedule'}
									</button>
								</div>
							</div>

							{error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
							{actionError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div> : null}

							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
								{scheduling.stats.map((stat, index) => (
									<article key={stat.label} className={`rounded-3xl border border-slate-200/80 p-5 ${index === 3 ? 'bg-[#e8edff]' : 'bg-white'}`}>
										<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">{stat.label}</div>
										<div className="mt-2 flex items-end gap-3">
											<div className="text-3xl font-black tracking-[-0.06em] text-slate-950">{stat.value}</div>
											{stat.note ? <div className="text-xs font-semibold text-slate-500">{stat.note}</div> : null}
										</div>
									</article>
								))}
							</div>

							<div className="grid gap-5 xl:grid-cols-[1fr_280px]">
								<article className="rounded-[26px] border border-slate-200/80 bg-white p-4 sm:p-6">
									<div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] gap-3 text-center text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500 sm:grid-cols-[140px_repeat(7,minmax(0,1fr))]">
										<div className="rounded-2xl bg-[#f1f4ff] p-4 text-left">Employees</div>
										{scheduling.days.map((day) => (
											<div key={`${day.day}-${day.date}`} className={`rounded-2xl p-4 ${day.alert ? 'bg-[#fff0f0] text-rose-600' : 'bg-white'}`}>
												<div>{day.day}</div>
												<div className="mt-1 text-xl font-black tracking-[-0.05em] text-slate-900">{day.date}</div>
												{day.alert ? <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-500">Gap</div> : null}
											</div>
										))}
									</div>

									<div className="mt-4 space-y-3">
										{scheduling.rows.map((employee) => (
											<div key={employee.name} className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] gap-3 rounded-2xl border border-slate-100 p-3 sm:grid-cols-[140px_repeat(7,minmax(0,1fr))]">
												<div className="flex items-center gap-3 text-left">
													<div className={`flex h-11 w-11 items-center justify-center rounded-full ${employee.open ? 'bg-[#fff2f2] text-rose-600' : 'bg-[#0f51ff] text-white'}`}>{employee.avatar}</div>
													<div>
														<div className="font-semibold text-slate-900">{employee.name}</div>
														<div className="text-xs text-slate-500">{employee.hours}</div>
													</div>
												</div>

												{employee.blocks.map((blocks, dayIndex) => (
													<div key={`${employee.name}-${dayIndex}`} className="relative min-h-16 rounded-xl bg-[#f7f8ff]">
														{blocks.length ? blocks.map((entry, index) => (
															<div key={`${entry.label}-${index}`} className={`absolute inset-0 rounded-xl border-l-4 p-2 text-[11px] font-semibold ${entry.tone}`}>
																{entry.label}
															</div>
														)) : null}
													</div>
												))}
											</div>
										))}

										{!scheduling.rows.length && !isLoading ? (
											<div className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-500">No scheduled employee rows are available yet.</div>
										) : null}
									</div>

									<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
										<div className="flex items-center gap-4">
											{scheduling.legend.map((item) => (
												<div key={item.label} className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />{item.label}</div>
											))}
										</div>
										<div className="flex items-center gap-3">
											<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"><FiPrinter className="h-4 w-4" /></button>
											<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"><FiDownload className="h-4 w-4" /></button>
										</div>
									</div>
								</article>

								<aside className="space-y-5">
									<article className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
										<div className="flex items-start justify-between gap-3">
											<div className="flex items-center gap-3">
												<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1f2937] text-white">SC</div>
												<div>
													<h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">{scheduling.overview?.title || 'Schedule Overview'}</h2>
													<p className="text-sm font-semibold text-[#0f51ff]">{scheduling.overview?.subtitle}</p>
												</div>
											</div>
											<FiMoreVertical className="h-4 w-4 text-slate-400" />
										</div>

										<div className="mt-6 space-y-4 text-sm text-slate-600">
											<div className="flex items-start gap-3"><FiClock className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Peak Coverage</div><div className="font-semibold text-slate-900">{scheduling.overview?.peakCoverage}</div></div></div>
											<div className="flex items-start gap-3"><FiUsers className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Teams Active</div><div className="font-semibold text-slate-900">{scheduling.overview?.teamsActive}</div></div></div>
											<div className="flex items-start gap-3"><FiBell className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Alerts</div><div className="font-semibold text-rose-600">{scheduling.overview?.alerts}</div></div></div>
										</div>
									</article>

									<article className="rounded-[26px] bg-[#0f51ff] p-5 text-white sm:p-6">
										<div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80"><FiZap className="h-3.5 w-3.5" /> {scheduling.suggestion?.eyebrow || 'Auto Suggest'}</div>
										<h3 className="mt-4 max-w-xs text-2xl font-black tracking-[-0.05em]">{scheduling.suggestion?.title}</h3>
										<p className="mt-3 text-sm leading-6 text-blue-50/90">{scheduling.suggestion?.description}</p>
										<button
											disabled={activeAction === 'assign-available'}
											onClick={() => runSchedulingAction('/api/scheduling/manager/assign-available', 'assign-available', 'Unable to assign an available employee to the next open shift.')}
											className="mt-5 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#0f51ff] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
										>
											{activeAction === 'assign-available' ? 'Assigning...' : scheduling.suggestion?.actionLabel || 'Assign Available Staff'}
										</button>
									</article>
								</aside>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
