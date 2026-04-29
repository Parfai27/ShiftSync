import { useEffect, useMemo, useState } from 'react'
import {
	FiBell,
	FiCalendar,
	FiClock,
	FiDownload,
	FiHome,
	FiLayers,
	FiLogOut,
	FiMenu,
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
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession } from '../../lib/session'
import { resolveProfileImage, useManagerWorkspace } from '../../lib/managerWorkspace'
import ManagerProfileMenu from '../shared/ManagerProfileMenu'
import MobileManagerMenu from '../shared/MobileManagerMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

function flattenAssignments(row) {
	return row.blocks.flat().map((entry) => entry.label)
}

function buildEmployeeDayAssignments(boardDays, employeeName) {
	return boardDays.map((day) =>
		day.shifts.flatMap((shift) =>
			shift.roles
				.filter((role) => role.employeeName === employeeName)
				.map((role) => ({
					shiftName: shift.shiftName,
					window: shift.window,
					role: role.role,
					tone: shift.tone,
				}))
		)
	)
}

function toneCardClasses(tone) {
	switch (tone) {
		case 'slate':
			return 'border-slate-300 bg-slate-50 text-slate-700'
		case 'blue':
			return 'border-blue-200 bg-blue-50 text-blue-700'
		default:
			return 'border-indigo-200 bg-indigo-50 text-indigo-700'
	}
}

export default function Scheduling() {
	const navigate = useNavigate()
	const [viewMode, setViewMode] = useState('WEEK')
	const [selectedDayIndex, setSelectedDayIndex] = useState(0)
	const [searchTerm, setSearchTerm] = useState('')
	const { manager, workspace, isLoading, error, reloadWorkspace } = useManagerWorkspace({
		rangeDays: viewMode === 'MONTH' ? 30 : 7,
	})
	const profileImage = resolveProfileImage(manager?.profileImageUrl, manager?.fullName)
	const scheduling = workspace.scheduling
	const [actionError, setActionError] = useState('')
	const [activeAction, setActiveAction] = useState('')
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const board = scheduling.weeklyBoard || { label: '', days: [] }
	const normalizedSearch = searchTerm.trim().toLowerCase()

	useEffect(() => {
		if (selectedDayIndex >= board.days.length) {
			setSelectedDayIndex(0)
		}
	}, [board.days.length, selectedDayIndex])

	const visibleBoardIndexes = useMemo(() => {
		return board.days
			.map((day, index) => ({ day, index }))
			.filter(({ day }) => {
				if (!normalizedSearch) {
					return true
				}

				const dayText = [day.day, day.date, day.fullDate]
				const shiftText = day.shifts.flatMap((shift) => [
					shift.shiftName,
					shift.window,
					shift.status,
					...shift.roles.flatMap((role) => [role.role, role.employeeName || '', role.status]),
				])

				return [...dayText, ...shiftText].join(' ').toLowerCase().includes(normalizedSearch)
			})
			.map(({ index }) => index)
	}, [board.days, normalizedSearch])

	const boardIndexesToRender = useMemo(() => {
		if (!board.days.length) {
			return []
		}
		if (viewMode === 'DAY') {
			return [Math.min(selectedDayIndex, board.days.length - 1)]
		}
		if (!normalizedSearch || visibleBoardIndexes.length === board.days.length) {
			return board.days.map((_, index) => index)
		}
		return visibleBoardIndexes
	}, [board.days, normalizedSearch, selectedDayIndex, viewMode, visibleBoardIndexes])

	const visibleBoardDays = boardIndexesToRender.map((index) => board.days[index]).filter(Boolean)
	const visibleRows = useMemo(() => {
		return scheduling.rows.filter((employee) => {
			if (!normalizedSearch) {
				return true
			}
			return [employee.name, employee.role, employee.hours, ...flattenAssignments(employee)].join(' ').toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, scheduling.rows])

	const openShiftAssignments = useMemo(() => {
		return visibleBoardDays.map((day) =>
			day.shifts.flatMap((shift) =>
				shift.roles
					.filter((role) => role.status === 'OPEN')
					.map((role) => ({
						shiftName: shift.shiftName,
						window: shift.window,
						role: role.role,
						tone: shift.tone,
					}))
			)
		)
	}, [visibleBoardDays])

	const employeeScheduleRows = useMemo(() => {
		return visibleRows.map((employee) => ({
			...employee,
			dailyAssignments: buildEmployeeDayAssignments(visibleBoardDays, employee.name),
		}))
	}, [visibleBoardDays, visibleRows])

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

	function handlePrint() {
		window.print()
	}

	function handleExportSchedule() {
		if (!visibleBoardDays.length) {
			setActionError('There is no rota data to export for the current view.')
			return
		}

		const header = ['Date', 'Day', 'Shift', 'Window', 'Role', 'Assigned Employee', 'Status']
		const rows = visibleBoardDays.flatMap((day) =>
			day.shifts.flatMap((shift) =>
				shift.roles.map((role) =>
					[
						day.fullDate,
						day.day,
						shift.shiftName,
						shift.window,
						role.role,
						role.employeeName || 'Open role',
						role.status,
					]
						.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
						.join(',')
				)
			)
		)

		const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `weekly-rota-${viewMode.toLowerCase()}.csv`
		link.click()
		URL.revokeObjectURL(url)
		setActionError('')
	}

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<MobileManagerMenu
				activePath="/scheduling"
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				onPrimaryAction={() => runSchedulingAction('/api/scheduling/manager/create-shift', 'create-shift', 'Unable to create weekly shifts.')}
				primaryActionDisabled={activeAction === 'create-shift'}
				primaryActionLabel={activeAction === 'create-shift' ? 'Creating Weekly Shifts...' : 'Create Weekly Shifts'}
			/>
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
							onClick={() => runSchedulingAction('/api/scheduling/manager/create-shift', 'create-shift', 'Unable to create weekly shifts.')}
							className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de] disabled:cursor-not-allowed disabled:opacity-60"
						>
							<FiPlus className="h-4 w-4" /> {activeAction === 'create-shift' ? 'Creating Weekly Shifts...' : 'Create Weekly Shifts'}
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
							<button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700" onClick={() => setIsMobileMenuOpen(true)} type="button"><FiMenu className="h-5 w-5" /></button>
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
								<input
									type="search"
									value={searchTerm}
									onChange={(event) => setSearchTerm(event.target.value)}
									placeholder="Search days, shifts, roles, or employees..."
									className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white"
								/>
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500" onClick={() => navigate('/notifications')} type="button">
									<FiBell className="h-4 w-4" />
								</button>
								<ThemeToggleButton />
								<ManagerProfileMenu name={manager.fullName} profileImageUrl={profileImage} role={manager.roleLabel} />
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="space-y-5">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Shift Scheduling</h1>
									<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
										{scheduling.summary || 'Loading weekly rota data...'}
									</p>
								</div>
								<div className="flex flex-wrap items-center gap-3">
									<div className="inline-flex rounded-2xl bg-[#f3f6ff] p-1 text-sm font-semibold text-slate-500">
										<button className={`rounded-xl px-4 py-2 ${viewMode === 'DAY' ? 'bg-white text-[#0f51ff]' : ''}`} onClick={() => setViewMode('DAY')} type="button">DAY</button>
										<button className={`rounded-xl px-4 py-2 ${viewMode === 'WEEK' ? 'bg-white text-[#0f51ff]' : ''}`} onClick={() => setViewMode('WEEK')} type="button">WEEK</button>
										<button className={`rounded-xl px-4 py-2 ${viewMode === 'MONTH' ? 'bg-white text-[#0f51ff]' : ''}`} onClick={() => setViewMode('MONTH')} type="button">MONTH</button>
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

							<div className="grid gap-5 xl:grid-cols-[1fr_300px]">
								<div className="space-y-5">
									<article className="rounded-[26px] border border-slate-200/80 bg-white p-4 sm:p-6">
										<div className="rounded-[24px] bg-[linear-gradient(180deg,#f8faff_0%,#ffffff_100%)] p-4 sm:p-5">
											<div className="flex flex-col gap-4 border-b border-slate-200/70 pb-4">
												<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
													<div>
														<div className="inline-flex items-center gap-2 rounded-full bg-[#e8edff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0f51ff]">
															<FiCalendar className="h-3.5 w-3.5" /> {board.label || 'Weekly Rota'}
														</div>
														<h2 className="mt-3 text-xl font-black tracking-[-0.04em] text-slate-950">Schedule Grid</h2>
														<p className="mt-1 text-sm text-slate-500">
															Weekly staffing view with day columns, team rows, and the live role coverage placed directly in each cell.
														</p>
													</div>
													{viewMode === 'DAY' ? (
														<div className="flex flex-wrap items-center gap-2">
															{board.days.map((day, index) => (
																<button
																	key={`${day.fullDate}-${index}`}
																	className={`rounded-2xl px-3 py-2 text-left text-xs font-bold ${selectedDayIndex === index ? 'bg-[#0f51ff] text-white' : 'bg-white text-slate-600'}`}
																	onClick={() => setSelectedDayIndex(index)}
																	type="button"
																>
																	<div>{day.day}</div>
																	<div className="text-[10px] uppercase tracking-[0.14em] opacity-80">{day.date}</div>
																</button>
															))}
														</div>
													) : null}
												</div>

												<div className="grid gap-3 md:grid-cols-3">
													{scheduling.legend.map((item) => (
														<div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
															<div className="flex items-center gap-3">
																<span className={`h-3 w-3 rounded-full ${item.tone}`} />
																<div className="text-sm font-semibold text-slate-700">{item.label}</div>
															</div>
														</div>
													))}
												</div>
											</div>

											<div className="mt-5 overflow-x-auto">
												<div className="min-w-[1180px] overflow-hidden rounded-[24px] border border-slate-200/80 bg-white">
													<div
														className="grid border-b border-slate-200/80 bg-[#f8fbff]"
														style={{ gridTemplateColumns: `220px repeat(${Math.max(visibleBoardDays.length, 1)}, minmax(${viewMode === 'MONTH' ? '180px' : '200px'}, 1fr))` }}
													>
														<div className="border-r border-slate-200/80 px-4 py-4">
															<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Schedule</div>
															<div className="mt-1 text-lg font-black tracking-[-0.04em] text-slate-950">Team & Open Roles</div>
														</div>
														{visibleBoardDays.map((day) => (
															<div key={day.fullDate} className="border-r border-slate-200/80 px-4 py-4 last:border-r-0">
																<div className="flex items-start justify-between gap-2">
																	<div>
																		<div className="text-sm font-black text-slate-900">{day.day}, {day.fullDate}</div>
																		<div className="mt-1 text-xs font-semibold text-slate-500">
																			{day.shifts.reduce((sum, shift) => sum + Number(shift.assignedStaff || 0), 0)} roles filled
																		</div>
																	</div>
																	<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${day.hasGap ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
																		{day.hasGap ? 'Gap' : 'Covered'}
																	</span>
																</div>
															</div>
														))}
													</div>

													<div
														className="grid border-b border-slate-200/80"
														style={{ gridTemplateColumns: `220px repeat(${Math.max(visibleBoardDays.length, 1)}, minmax(${viewMode === 'MONTH' ? '180px' : '200px'}, 1fr))` }}
													>
														<div className="border-r border-slate-200/80 bg-slate-50 px-4 py-5">
															<div className="text-sm font-black text-slate-900">Open Shifts</div>
															<div className="mt-1 text-xs font-medium text-slate-500">Unfilled roles across the visible rota</div>
														</div>
														{visibleBoardDays.map((day, index) => (
															<div key={`open-${day.fullDate}`} className="min-h-[160px] border-r border-slate-200/80 bg-[#fcfdff] p-3 last:border-r-0">
																<div className="space-y-2">
																	{openShiftAssignments[index]?.length ? openShiftAssignments[index].map((item, itemIndex) => (
																		<div key={`${day.fullDate}-${item.role}-${itemIndex}`} className={`rounded-2xl border-l-4 px-3 py-3 shadow-sm ${toneCardClasses(item.tone)}`}>
																			<div className="text-sm font-black">{item.window}</div>
																			<div className="mt-1 text-xs font-semibold">{item.role}</div>
																			<div className="mt-1 text-[11px] font-medium opacity-80">{item.shiftName}</div>
																		</div>
																	)) : (
																		<div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
																			All roles filled
																		</div>
																	)}
																</div>
															</div>
														))}
													</div>

													{employeeScheduleRows.map((employee, rowIndex) => (
														<div
															key={employee.name}
															className={`grid ${rowIndex !== employeeScheduleRows.length - 1 ? 'border-b border-slate-200/80' : ''}`}
															style={{ gridTemplateColumns: `220px repeat(${Math.max(visibleBoardDays.length, 1)}, minmax(${viewMode === 'MONTH' ? '180px' : '200px'}, 1fr))` }}
														>
															<div className="border-r border-slate-200/80 bg-white px-4 py-5">
																<div className="flex items-start gap-3">
																	<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f51ff] text-sm font-black text-white">{employee.avatar}</div>
																	<div className="min-w-0">
																		<div className="truncate text-sm font-black text-slate-900">{employee.name}</div>
																		<div className="text-xs font-medium text-slate-500">{employee.role}</div>
																		<div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0f51ff]">{employee.hours}</div>
																	</div>
																</div>
															</div>
															{employee.dailyAssignments.map((entries, dayIndex) => (
																<div key={`${employee.name}-${dayIndex}`} className="min-h-[140px] border-r border-slate-200/80 bg-white p-3 last:border-r-0">
																	<div className="space-y-2">
																		{entries.length ? entries.map((entry, entryIndex) => (
																			<div key={`${employee.name}-${entry.shiftName}-${entryIndex}`} className={`rounded-2xl border-l-4 px-3 py-3 shadow-sm ${toneCardClasses(entry.tone)}`}>
																				<div className="text-sm font-black">{entry.window}</div>
																				<div className="mt-1 text-xs font-semibold">{entry.role}</div>
																				<div className="mt-1 text-[11px] font-medium opacity-80">{entry.shiftName}</div>
																			</div>
																		)) : (
																			<div className="flex min-h-[100px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
																				Off Shift
																			</div>
																		)}
																	</div>
																</div>
															))}
														</div>
													))}
												</div>

												{!visibleBoardDays.length && !isLoading ? (
													<div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-500">
														{normalizedSearch ? 'No rota days matched your search.' : 'No weekly rota data is available yet.'}
													</div>
												) : null}
											</div>
										</div>

										<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
											<div className="font-medium text-slate-500">Review open roles by day, then assign staff or run auto-scheduling to complete the weekly grid.</div>
											<div className="flex items-center gap-3">
												<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600" onClick={handlePrint} title="Print schedule" type="button"><FiPrinter className="h-4 w-4" /></button>
												<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600" onClick={handleExportSchedule} title="Download schedule" type="button"><FiDownload className="h-4 w-4" /></button>
											</div>
										</div>
									</article>
								</div>

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
											<button className="h-8 w-8 rounded-full text-slate-400 transition hover:bg-slate-100" onClick={reloadWorkspace} title="Refresh schedule data" type="button"><FiMoreVertical className="mx-auto h-4 w-4" /></button>
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
