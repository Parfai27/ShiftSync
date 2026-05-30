import { useEffect, useMemo, useRef, useState } from 'react'
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
import { exportElementAsSvg } from '../../lib/export'
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

function normalizeShiftRole(role) {
	const value = String(role || '').toLowerCase()
	if (value.includes('pharmacist')) {
		return 'Pharmacist'
	}
	if (value.includes('assistant') || value.includes('attendant') || value.includes('technician')) {
		return 'Pharmacy Assistant / Attendant'
	}
	return ''
}

function buildCellTargetKey(employeeId, shiftDate) {
	return `cell:${employeeId}:${shiftDate}`
}

function buildOpenRoleTargetKey(shiftDate, shiftName, role) {
	return `open:${shiftDate}:${shiftName}:${role}`
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
	const [actionMessage, setActionMessage] = useState('')
	const [activeAction, setActiveAction] = useState('')
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
	const [manualAssignment, setManualAssignment] = useState({
		employeeId: '',
		shiftDate: '',
		shiftName: '',
	})
	const [managedAssignment, setManagedAssignment] = useState(null)
	const [replacementEmployeeId, setReplacementEmployeeId] = useState('')
	const [dragPayload, setDragPayload] = useState(null)
	const [dragTargetKey, setDragTargetKey] = useState('')
	const scheduleGridRef = useRef(null)

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

	const dayOptions = board.days
	const employeeOptions = useMemo(() => workspace.profiles?.roster ?? [], [workspace.profiles?.roster])
	const employeeByName = useMemo(
		() => new Map(employeeOptions.map((employee) => [employee.name, employee])),
		[employeeOptions]
	)
	const selectedEmployee = useMemo(
		() => employeeOptions.find((employee) => String(employee.userId) === manualAssignment.employeeId) || null,
		[employeeOptions, manualAssignment.employeeId]
	)
	const selectedEmployeeRole = normalizeShiftRole(selectedEmployee?.role)
	const replacementCandidates = useMemo(() => {
		if (!managedAssignment) {
			return []
		}
		return employeeOptions.filter(
			(employee) =>
				String(employee.userId) !== String(managedAssignment.employeeId) &&
				normalizeShiftRole(employee.role) === managedAssignment.role
		)
	}, [employeeOptions, managedAssignment])
	const shiftOptions = useMemo(() => {
		const selectedDay = board.days.find((day) => day.isoDate === manualAssignment.shiftDate)
		if (!selectedDay) {
			return []
		}
		if (!selectedEmployeeRole) {
			return selectedDay.shifts
		}
		return selectedDay.shifts.filter((shift) =>
			shift.roles.some((role) => role.role === selectedEmployeeRole && role.status === 'OPEN')
		)
	}, [board.days, manualAssignment.shiftDate, selectedEmployeeRole])

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

	function openAssignmentModal(preset = {}) {
		setActionError('')
		setActionMessage('')
		setManagedAssignment(null)
		setReplacementEmployeeId('')
		setManualAssignment({
			employeeId: preset.employeeId ?? '',
			shiftDate: preset.shiftDate ?? '',
			shiftName: preset.shiftName ?? '',
		})
		setIsAssignModalOpen(true)
	}

	function openManageAssignmentModal(preset) {
		setActionError('')
		setActionMessage('')
		setIsAssignModalOpen(false)
		setReplacementEmployeeId('')
		setManagedAssignment(preset)
	}

	function clearDragState() {
		setDragPayload(null)
		setDragTargetKey('')
	}

	function handleDragStart(payload) {
		setDragPayload(payload)
		setDragTargetKey('')
	}

	function handleDragEnd() {
		clearDragState()
	}

	async function runSchedulingAction(path, actionKey, fallbackMessage) {
		try {
			setActionError('')
			setActionMessage('')
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

	async function handleManualAssignment() {
		if (!manager?.userId || !manualAssignment.employeeId || !manualAssignment.shiftDate || !manualAssignment.shiftName) {
			setActionError('Select an employee, a day, and a shift before assigning.')
			return
		}

		try {
			setActionError('')
			setActionMessage('')
			setActiveAction('manual-assign')
			await apiRequest('/api/scheduling/manager/assign-shift', {
				method: 'POST',
				body: JSON.stringify({
					managerId: manager.userId,
					employeeId: Number(manualAssignment.employeeId),
					shiftDate: manualAssignment.shiftDate,
					shiftName: manualAssignment.shiftName,
				}),
			})
			await reloadWorkspace()
			setActionMessage('Employee assigned successfully.')
			setIsAssignModalOpen(false)
			setManualAssignment({
				employeeId: '',
				shiftDate: '',
				shiftName: '',
			})
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to assign the selected employee to that shift.')
		} finally {
			setActiveAction('')
		}
	}

	async function handleDragAssignToEmployee(targetEmployeeId, shiftDate, shiftName) {
		if (!manager?.userId) {
			setActionError('No active manager session was found.')
			return
		}

		try {
			setActionError('')
			setActionMessage('')
			setActiveAction('drag-assign')
			await apiRequest('/api/scheduling/manager/assign-shift', {
				method: 'POST',
				body: JSON.stringify({
					managerId: manager.userId,
					employeeId: Number(targetEmployeeId),
					shiftDate,
					shiftName,
				}),
			})
			await reloadWorkspace()
			setActionMessage('Shift assigned successfully.')
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to assign this shift by drag and drop.')
		} finally {
			setActiveAction('')
			clearDragState()
		}
	}

	async function handleDragReassignToEmployee(currentEmployeeId, replacementEmployeeId, shiftDate, shiftName) {
		if (!manager?.userId) {
			setActionError('No active manager session was found.')
			return
		}

		try {
			setActionError('')
			setActionMessage('')
			setActiveAction('drag-reassign')
			await apiRequest('/api/scheduling/manager/reassign-shift', {
				method: 'POST',
				body: JSON.stringify({
					managerId: manager.userId,
					currentEmployeeId: Number(currentEmployeeId),
					replacementEmployeeId: Number(replacementEmployeeId),
					shiftDate,
					shiftName,
				}),
			})
			await reloadWorkspace()
			setActionMessage('Shift reassigned successfully.')
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to reassign this shift by drag and drop.')
		} finally {
			setActiveAction('')
			clearDragState()
		}
	}

	async function handleDropOnEmployeeCell(targetEmployee, shiftDate) {
		if (!dragPayload || !targetEmployee || !shiftDate) {
			return
		}

		if (dragPayload.type === 'OPEN_ROLE') {
			if (dragPayload.shiftDate !== shiftDate) {
				setActionError('Drop the open role onto an employee cell for the same day.')
				clearDragState()
				return
			}
			if (normalizeShiftRole(targetEmployee.role) !== dragPayload.role) {
				setActionError(`This open role needs a ${dragPayload.role}.`)
				clearDragState()
				return
			}
			await handleDragAssignToEmployee(targetEmployee.userId, shiftDate, dragPayload.shiftName)
			return
		}

		if (dragPayload.type === 'ASSIGNED_SHIFT') {
			if (dragPayload.shiftDate !== shiftDate) {
				setActionError('You can only drag an assigned shift to another employee on the same day.')
				clearDragState()
				return
			}
			if (String(dragPayload.employeeId) === String(targetEmployee.userId)) {
				clearDragState()
				return
			}
			if (normalizeShiftRole(targetEmployee.role) !== dragPayload.role) {
				setActionError(`The replacement employee must have the same role: ${dragPayload.role}.`)
				clearDragState()
				return
			}
			await handleDragReassignToEmployee(dragPayload.employeeId, targetEmployee.userId, shiftDate, dragPayload.shiftName)
		}
	}

	async function handleRemoveAssignment() {
		if (!managedAssignment || !manager?.userId) {
			return
		}

		try {
			setActionError('')
			setActionMessage('')
			setActiveAction('remove-assignment')
			await apiRequest('/api/scheduling/manager/remove-shift-assignment', {
				method: 'POST',
				body: JSON.stringify({
					managerId: manager.userId,
					employeeId: Number(managedAssignment.employeeId),
					shiftDate: managedAssignment.shiftDate,
					shiftName: managedAssignment.shiftName,
				}),
			})
			await reloadWorkspace()
			setActionMessage('Shift assignment removed successfully.')
			setManagedAssignment(null)
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to remove this shift assignment.')
		} finally {
			setActiveAction('')
		}
	}

	async function handleReassignAssignment() {
		if (!managedAssignment || !manager?.userId || !replacementEmployeeId) {
			setActionError('Choose a replacement employee first.')
			return
		}

		try {
			setActionError('')
			setActionMessage('')
			setActiveAction('reassign-assignment')
			await apiRequest('/api/scheduling/manager/reassign-shift', {
				method: 'POST',
				body: JSON.stringify({
					managerId: manager.userId,
					currentEmployeeId: Number(managedAssignment.employeeId),
					replacementEmployeeId: Number(replacementEmployeeId),
					shiftDate: managedAssignment.shiftDate,
					shiftName: managedAssignment.shiftName,
				}),
			})
			await reloadWorkspace()
			setActionMessage('Shift reassigned successfully.')
			setManagedAssignment(null)
			setReplacementEmployeeId('')
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to reassign this shift.')
		} finally {
			setActiveAction('')
		}
	}

	function handlePrint() {
		window.print()
	}

	async function handleExportSchedule() {
		if (!visibleBoardDays.length || !scheduleGridRef.current) {
			setActionError('There is no rota data to export for the current view.')
			return
		}

		try {
			setActionError('')
			setActionMessage('')
			exportElementAsSvg(scheduleGridRef.current, `weekly-rota-${viewMode.toLowerCase()}.svg`)
			setActionMessage('The visible schedule grid was exported as an image.')
		} catch (exportError) {
			setActionError(exportError.message || 'Unable to export this schedule view as an image.')
		}
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
									onClick={() => openAssignmentModal()}
									className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 border border-slate-200"
								>
									<FiUsers className="h-4 w-4" /> Assign Shift
								</button>
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
							{actionMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div> : null}

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
											</div>

											<div className="mt-5 overflow-x-auto" ref={scheduleGridRef}>
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
																		<button
																			key={`${day.fullDate}-${item.role}-${itemIndex}`}
																			draggable
																			onDragStart={() =>
																				handleDragStart({
																					type: 'OPEN_ROLE',
																					shiftDate: day.isoDate,
																					shiftName: item.shiftName,
																					role: item.role,
																				})
																			}
																			onDragEnd={handleDragEnd}
																			onDragOver={(event) => {
																				if (dragPayload?.type === 'ASSIGNED_SHIFT') {
																					event.preventDefault()
																					const targetKey = buildOpenRoleTargetKey(day.isoDate, item.shiftName, item.role)
																					setDragTargetKey(targetKey)
																				}
																			}}
																			onDragLeave={() => {
																				const targetKey = buildOpenRoleTargetKey(day.isoDate, item.shiftName, item.role)
																				if (dragTargetKey === targetKey) {
																					setDragTargetKey('')
																				}
																			}}
																			onDrop={async (event) => {
																				event.preventDefault()
																				if (dragPayload?.type === 'ASSIGNED_SHIFT') {
																					setActionError('Drag assigned shifts onto another employee day cell to reassign them.')
																				}
																				clearDragState()
																			}}
																			className={`block w-full rounded-2xl border-l-4 px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneCardClasses(item.tone)} ${
																				dragTargetKey === buildOpenRoleTargetKey(day.isoDate, item.shiftName, item.role) ? 'ring-2 ring-[#0f51ff] ring-offset-2' : ''
																			}`}
																			onClick={() =>
																				openAssignmentModal({
																					shiftDate: day.isoDate,
																					shiftName: item.shiftName,
																				})
																			}
																			type="button"
																		>
																			<div className="text-sm font-black">{item.window}</div>
																			<div className="mt-1 text-xs font-semibold">{item.role}</div>
																			<div className="mt-1 text-[11px] font-medium opacity-80">{item.shiftName}</div>
																		</button>
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
																<div
																	key={`${employee.name}-${dayIndex}`}
																	className={`min-h-[140px] border-r border-slate-200/80 bg-white p-3 last:border-r-0 ${
																		dragTargetKey === buildCellTargetKey(employeeOptions.find((option) => option.name === employee.name)?.userId, visibleBoardDays[dayIndex]?.isoDate ?? '')
																			? 'bg-[#eef4ff]'
																			: ''
																	}`}
																	onDragOver={(event) => {
																		if (!dragPayload) {
																			return
																		}
																		event.preventDefault()
																		const targetEmployeeId = employeeOptions.find((option) => option.name === employee.name)?.userId
																		const shiftDate = visibleBoardDays[dayIndex]?.isoDate ?? ''
																		const targetKey = buildCellTargetKey(targetEmployeeId, shiftDate)
																		setDragTargetKey(targetKey)
																	}}
																	onDragLeave={() => {
																		const targetEmployeeId = employeeOptions.find((option) => option.name === employee.name)?.userId
																		const shiftDate = visibleBoardDays[dayIndex]?.isoDate ?? ''
																		const targetKey = buildCellTargetKey(targetEmployeeId, shiftDate)
																		if (dragTargetKey === targetKey) {
																			setDragTargetKey('')
																		}
																	}}
																	onDrop={async (event) => {
																		event.preventDefault()
																		const targetEmployee = employeeOptions.find((option) => option.name === employee.name)
																		await handleDropOnEmployeeCell(targetEmployee, visibleBoardDays[dayIndex]?.isoDate ?? '')
																	}}
																>
																	<div className="space-y-2">
																		{entries.length ? entries.map((entry, entryIndex) => (
																			<button
																				key={`${employee.name}-${entry.shiftName}-${entryIndex}`}
																				draggable
																				onDragStart={() => {
																					const employeeOption = employeeByName.get(employee.name)
																					handleDragStart({
																						type: 'ASSIGNED_SHIFT',
																						employeeId: employeeOption?.userId,
																						employeeName: employee.name,
																						role: normalizeShiftRole(employee.role),
																						shiftDate: visibleBoardDays[dayIndex]?.isoDate ?? '',
																						shiftName: entry.shiftName,
																					})
																				}}
																				onDragEnd={handleDragEnd}
																				className={`block w-full rounded-2xl border-l-4 px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneCardClasses(entry.tone)} ${
																					dragPayload?.type === 'ASSIGNED_SHIFT' &&
																					dragPayload?.employeeName === employee.name &&
																					dragPayload?.shiftName === entry.shiftName &&
																					dragPayload?.shiftDate === (visibleBoardDays[dayIndex]?.isoDate ?? '')
																						? 'opacity-60'
																						: ''
																				}`}
																				onClick={() => {
																					const employeeOption = employeeByName.get(employee.name)
																					openManageAssignmentModal({
																						employeeId: String(employeeOption?.userId ?? ''),
																						employeeName: employee.name,
																						role: normalizeShiftRole(employee.role),
																						shiftDate: visibleBoardDays[dayIndex]?.isoDate ?? '',
																						shiftLabel: visibleBoardDays[dayIndex]?.fullDate ?? '',
																						shiftName: entry.shiftName,
																						window: entry.window,
																					})
																				}}
																				type="button"
																			>
																				<div className="text-sm font-black">{entry.window}</div>
																				<div className="mt-1 text-xs font-semibold">{entry.role}</div>
																				<div className="mt-1 text-[11px] font-medium opacity-80">{entry.shiftName}</div>
																			</button>
																		)) : (
																			<button
																				className={`min-h-[100px] w-full rounded-2xl border border-dashed text-[11px] font-bold uppercase tracking-[0.14em] transition ${
																					dragTargetKey === buildCellTargetKey(employeeOptions.find((option) => option.name === employee.name)?.userId, visibleBoardDays[dayIndex]?.isoDate ?? '')
																						? 'border-[#0f51ff] bg-[#eef4ff] text-[#0f51ff]'
																						: 'border-slate-200 bg-slate-50/70 text-slate-400 hover:border-[#0f51ff] hover:bg-[#eef4ff] hover:text-[#0f51ff]'
																				}`}
																				onClick={() =>
																					openAssignmentModal({
																						employeeId: String(employeeOptions.find((option) => option.name === employee.name)?.userId ?? ''),
																						shiftDate: visibleBoardDays[dayIndex]?.isoDate ?? '',
																					})
																				}
																				type="button"
																			>
																				Assign Shift
																			</button>
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
											<div className="font-medium text-slate-500">Review open roles by day, then assign staff, drag open roles onto employees, or drag assigned shifts to another employee on the same day.</div>
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

			{isAssignModalOpen ? (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-lg rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">Assign Shift</h2>
								<div className="mt-2 text-sm text-slate-500">Select an employee, choose the day, then pick one of the three daily shifts.</div>
							</div>
							<button className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" onClick={() => setIsAssignModalOpen(false)} type="button">Close</button>
						</div>

						<div className="mt-6 space-y-4">
							<label className="block">
								<div className="mb-2 text-sm font-bold text-slate-700">Employee</div>
								<select
									value={manualAssignment.employeeId}
									onChange={(event) => setManualAssignment((current) => ({ ...current, employeeId: event.target.value }))}
									className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#0f51ff]"
								>
									<option value="">Select employee</option>
									{employeeOptions.map((employee) => (
										<option key={employee.userId} value={employee.userId}>{employee.name} - {employee.role}</option>
									))}
								</select>
							</label>

							<label className="block">
								<div className="mb-2 text-sm font-bold text-slate-700">Day</div>
								<select
									value={manualAssignment.shiftDate}
									onChange={(event) => setManualAssignment((current) => ({ ...current, shiftDate: event.target.value, shiftName: '' }))}
									className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#0f51ff]"
								>
									<option value="">Select day</option>
									{dayOptions.map((day) => (
										<option key={day.isoDate} value={day.isoDate}>{day.day}, {day.fullDate}</option>
									))}
								</select>
							</label>

							<label className="block">
								<div className="mb-2 text-sm font-bold text-slate-700">Shift</div>
								<select
									value={manualAssignment.shiftName}
									onChange={(event) => setManualAssignment((current) => ({ ...current, shiftName: event.target.value }))}
									className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#0f51ff]"
								>
									<option value="">Select shift</option>
									{shiftOptions.map((shift) => (
										<option key={`${shift.shiftName}-${shift.window}`} value={shift.shiftName}>{shift.shiftName} - {shift.window}</option>
									))}
								</select>
							</label>
							{manualAssignment.employeeId && manualAssignment.shiftDate && !shiftOptions.length ? (
								<div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
									No open shift matches this employee&apos;s role on the selected day.
								</div>
							) : null}
						</div>

						<div className="mt-6 flex justify-end gap-3">
							<button className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700" onClick={() => setIsAssignModalOpen(false)} type="button">Cancel</button>
							<button
								disabled={activeAction === 'manual-assign'}
								className="rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
								onClick={handleManualAssignment}
								type="button"
							>
								{activeAction === 'manual-assign' ? 'Assigning...' : 'Assign Employee'}
							</button>
						</div>
					</div>
				</div>
			) : null}

			{managedAssignment ? (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-lg rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">Manage Assignment</h2>
								<div className="mt-2 text-sm text-slate-500">Review this assigned shift, then remove it or move it to another employee with the same role.</div>
							</div>
							<button className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" onClick={() => setManagedAssignment(null)} type="button">Close</button>
						</div>

						<div className="mt-6 space-y-4">
							<div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
								<div className="text-sm font-black text-slate-900">{managedAssignment.employeeName}</div>
								<div className="mt-1 text-xs font-semibold text-slate-500">{managedAssignment.role}</div>
								<div className="mt-3 grid gap-3 sm:grid-cols-2">
									<div>
										<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Day</div>
										<div className="mt-1 text-sm font-semibold text-slate-700">{managedAssignment.shiftLabel}</div>
									</div>
									<div>
										<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Shift</div>
										<div className="mt-1 text-sm font-semibold text-slate-700">{managedAssignment.shiftName}</div>
										<div className="text-xs text-slate-500">{managedAssignment.window}</div>
									</div>
								</div>
							</div>

							<label className="block">
								<div className="mb-2 text-sm font-bold text-slate-700">Replacement Employee</div>
								<select
									value={replacementEmployeeId}
									onChange={(event) => setReplacementEmployeeId(event.target.value)}
									className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#0f51ff]"
								>
									<option value="">Select replacement employee</option>
									{replacementCandidates.map((employee) => (
										<option key={employee.userId} value={employee.userId}>{employee.name} - {employee.role}</option>
									))}
								</select>
							</label>
							{!replacementCandidates.length ? (
								<div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
									No other employee with the same role is available for reassignment right now.
								</div>
							) : null}
						</div>

						<div className="mt-6 flex flex-wrap justify-end gap-3">
							<button
								className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
								disabled={activeAction === 'remove-assignment' || activeAction === 'reassign-assignment'}
								onClick={handleRemoveAssignment}
								type="button"
							>
								{activeAction === 'remove-assignment' ? 'Removing...' : 'Remove From Shift'}
							</button>
							<button
								className="rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
								disabled={!replacementCandidates.length || activeAction === 'remove-assignment' || activeAction === 'reassign-assignment'}
								onClick={handleReassignAssignment}
								type="button"
							>
								{activeAction === 'reassign-assignment' ? 'Reassigning...' : 'Reassign Shift'}
							</button>
						</div>
					</div>
				</div>
			) : null}
		</main>
	)
}
