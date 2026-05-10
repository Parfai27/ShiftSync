import { useEffect, useMemo, useRef, useState } from 'react'
import {
	FiBell,
	FiCalendar,
	FiClock,
	FiDownload,
	FiDollarSign,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiPrinter,
	FiRefreshCw,
	FiSearch,
	FiSettings,
	FiUser,
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { exportElementAsSvg } from '../../lib/export'
import { clearSession, loadSession } from '../../lib/session'
import EmployeeNotificationBell from '../shared/EmployeeNotificationBell'
import EmployeeProfileMenu from '../shared/EmployeeProfileMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

const fallbackSchedule = {
	employeeName: 'Employee',
	roleLabel: 'EMPLOYEE',
	monthLabel: '',
	scheduleSummary: '',
	weekDays: [],
	calendarCells: [],
	metrics: [],
	notifications: [],
	resources: [],
	openShiftCount: 0,
	assignedShifts: [],
	swapCandidates: [],
	outgoingAdjustments: [],
	incomingSwapRequests: [],
}

function peerResponseBadgeClasses(status) {
	if (status === 'ACCEPTED') {
		return 'bg-[#e8eeff] text-[#0f51ff]'
	}
	if (status === 'REJECTED') {
		return 'bg-rose-100 text-rose-700'
	}
	return 'bg-amber-100 text-amber-700'
}

function EmployeeSidebar() {
	return (
		<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
			<div className="flex w-full items-center justify-start gap-3">
				<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
			</div>

			<nav className="space-y-2 text-[14px] font-medium text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-dashboard"><FiGrid className="h-4 w-4" /> My Overview</Link>
				<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-schedule"><FiCalendar className="h-4 w-4" /> My Schedule</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-announcements"><FiBell className="h-4 w-4" /> Announcements</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-profile"><FiUser className="h-4 w-4" /> My Profile</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
			</nav>

			<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link>
			</div>
		</aside>
	)
}

export default function MySchedule() {
	const navigate = useNavigate()
	const session = loadSession()
	const [schedulePage, setSchedulePage] = useState(fallbackSchedule)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [adjustmentForm, setAdjustmentForm] = useState({
		shiftId: '',
		adjustmentType: 'TIME_OFF',
		targetEmployeeId: '',
		reason: '',
	})
	const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false)
	const [adjustmentMessage, setAdjustmentMessage] = useState('')
	const [adjustmentError, setAdjustmentError] = useState('')
	const [respondingRequestId, setRespondingRequestId] = useState(null)
	const calendarRef = useRef(null)

	useEffect(() => {
		let cancelled = false

		async function loadSchedule() {
			if (!session?.userId) {
				setError('No employee session found. Please log in again.')
				setIsLoading(false)
				return
			}

			try {
				setError('')
				const data = await apiRequest(`/api/employee/schedule/${session.userId}`)
				if (!cancelled) {
					setSchedulePage(data)
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load your schedule.')
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		loadSchedule()

		return () => {
			cancelled = true
		}
	}, [session?.userId])

	async function refreshSchedule() {
		if (!session?.userId) {
			setError('No employee session found. Please log in again.')
			return
		}

		try {
			setError('')
			setIsLoading(true)
			const data = await apiRequest(`/api/employee/schedule/${session.userId}`)
			setSchedulePage(data)
		} catch (loadError) {
			setError(loadError.message || 'Unable to refresh your schedule.')
		} finally {
			setIsLoading(false)
		}
	}

	async function submitAdjustmentRequest() {
		if (!session?.userId) {
			setAdjustmentError('No employee session found. Please log in again.')
			return
		}
		if (!adjustmentForm.shiftId) {
			setAdjustmentError('Select a shift to adjust.')
			return
		}
		if (!adjustmentForm.reason || adjustmentForm.reason.trim().length < 5) {
			setAdjustmentError('Please enter a reason with at least 5 characters.')
			return
		}
		if (adjustmentForm.adjustmentType === 'SWAP' && !adjustmentForm.targetEmployeeId) {
			setAdjustmentError('Select the employee you want to swap with.')
			return
		}

		try {
			setIsSubmittingAdjustment(true)
			setAdjustmentError('')
			setAdjustmentMessage('')
			await apiRequest(`/api/employee/adjustments/${session.userId}`, {
				method: 'POST',
				body: JSON.stringify({
					shiftId: Number(adjustmentForm.shiftId),
					adjustmentType: adjustmentForm.adjustmentType,
					targetEmployeeId: adjustmentForm.adjustmentType === 'SWAP' ? Number(adjustmentForm.targetEmployeeId) : null,
					reason: adjustmentForm.reason.trim(),
				}),
			})
			setAdjustmentMessage('Shift adjustment request submitted successfully.')
			setAdjustmentForm((current) => ({ ...current, reason: '' }))
			await refreshSchedule()
		} catch (requestError) {
			setAdjustmentError(requestError.message || 'Unable to submit adjustment request.')
		} finally {
			setIsSubmittingAdjustment(false)
		}
	}

	async function respondToSwapRequest(requestId, accepted) {
		if (!session?.userId) {
			setAdjustmentError('No employee session found. Please log in again.')
			return
		}
		try {
			setRespondingRequestId(requestId)
			setAdjustmentError('')
			setAdjustmentMessage('')
			await apiRequest(`/api/employee/adjustments/${session.userId}/${requestId}/swap-response`, {
				method: 'POST',
				body: JSON.stringify({ accepted, note: '' }),
			})
			setAdjustmentMessage(`Swap request ${accepted ? 'accepted' : 'rejected'} successfully.`)
			await refreshSchedule()
		} catch (requestError) {
			setAdjustmentError(requestError.message || 'Unable to update swap request response.')
		} finally {
			setRespondingRequestId(null)
		}
	}

	function handlePrint() {
		window.print()
	}

	function handleExportCalendar() {
		if (!calendarRef.current) {
			setError('There is no calendar view available to export right now.')
			return
		}
		try {
			setError('')
			exportElementAsSvg(calendarRef.current, 'employee-schedule-calendar.svg')
		} catch (exportError) {
			setError(exportError.message || 'Unable to export your schedule calendar.')
		}
	}

	const normalizedSearch = searchTerm.trim().toLowerCase()
	const visibleCalendarCells = useMemo(() => {
		if (!normalizedSearch) {
			return schedulePage.calendarCells
		}

		return schedulePage.calendarCells.map((cell) => {
			const eventText = [cell.event?.title, cell.event?.subtitle, cell.event?.time, cell.event?.note]
				.filter(Boolean)
				.join(' ')
				.toLowerCase()
			const matches = eventText.includes(normalizedSearch)
			return matches ? cell : { ...cell, event: null, openShift: false, dot: false }
		})
	}, [normalizedSearch, schedulePage.calendarCells])

	const visibleNotifications = useMemo(() => {
		return schedulePage.notifications.filter((item) => {
			if (!normalizedSearch) {
				return true
			}
			return [item.title, item.detail, item.when].join(' ').toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, schedulePage.notifications])

	const visibleResources = useMemo(() => {
		return schedulePage.resources.filter((item) => {
			if (!normalizedSearch) {
				return true
			}
			return item.name.toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, schedulePage.resources])

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<EmployeeSidebar />

				<div className="dashboard-main-offset flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden">
							<button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700" onClick={() => navigate('/employee-dashboard')} type="button"><FiMenu className="h-5 w-5" /></button>
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
									placeholder="Search shift dates, open coverage, or resources..."
									className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white"
								/>
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<EmployeeNotificationBell userId={session?.userId} />
								<ThemeToggleButton />
								<EmployeeProfileMenu name={schedulePage.employeeName} profileImageUrl={session?.profileImageUrl} role={schedulePage.roleLabel} />
							</div>
						</div>
					</header>

					<div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
								<div>
									<div className="flex items-center gap-2">
										<h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950">{schedulePage.monthLabel || 'My Schedule'}</h1>
									</div>
									<p className="mt-2 text-lg text-slate-500">{schedulePage.scheduleSummary || 'Your live employee schedule will appear here.'}</p>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<button className="inline-flex items-center gap-2 rounded-xl bg-[#e9eeff] px-5 py-3 text-sm font-bold text-[#334daf] transition hover:bg-[#dde6ff]" onClick={refreshSchedule} type="button"><FiRefreshCw className="h-4 w-4" /> Refresh Schedule</button>
									<button className="inline-flex items-center gap-2 rounded-xl bg-[#0f51ff] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0b44de]" onClick={() => navigate('/employee-notifications')} type="button"><FiBell className="h-4 w-4" /> View Notifications</button>
								</div>
							</div>

							{error ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}

							<div className="mt-5 rounded-2xl bg-[#f3f6ff] p-3">
								<div className="grid grid-cols-7 gap-2 text-center">
									{schedulePage.weekDays.map((day) => (
										<div key={`${day.day}-${day.date}`} className="rounded-xl px-1 py-2">
											<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{day.day}</div>
											<div className="mt-1 text-lg font-extrabold text-slate-700">{day.date}</div>
											<div className={`mx-auto mt-1 h-1.5 w-1.5 rounded-full ${day.active ? 'bg-[#0f51ff]' : 'bg-transparent'}`} />
										</div>
									))}
								</div>

								<div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200/80 bg-[#f9fbff]" ref={calendarRef}>
									<div className="min-w-[920px]">
										<div className="grid grid-cols-7 border-b border-slate-200/80 bg-[#f4f7ff]">
											{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
												<div key={day} className="px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">{day}</div>
											))}
										</div>

										<div className="grid grid-cols-7">
											{visibleCalendarCells.map((cell, idx) => (
												<div key={`${cell.day}-${idx}`} className={`relative min-h-28 border-r border-b border-slate-200/80 p-2.5 ${idx % 7 === 6 ? 'border-r-0' : ''} ${cell.selected ? 'bg-[#f0f5ff] ring-2 ring-inset ring-[#2d5cf6]' : cell.muted ? 'bg-[#f2f5fc]' : 'bg-white'}`}>
													<div className={`text-lg font-extrabold ${cell.muted ? 'text-slate-300' : 'text-slate-700'}`}>{cell.day}</div>
													{cell.dot ? <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#2d5cf6]" /> : null}

													{cell.event ? (
														<div className={`mt-2 rounded-lg border-l-4 p-2 text-[12px] font-semibold leading-4 ${cell.event.tone}`}>
															<div className="font-extrabold">{cell.event.time}</div>
															<div className="mt-0.5">{cell.event.title}</div>
															<div className="mt-1 text-[11px] opacity-90">{cell.event.subtitle}</div>
															{cell.event.note ? <div className="mt-1 text-[10px] font-extrabold tracking-[0.16em] text-[#2d5cf6]">{cell.event.note}</div> : null}
														</div>
													) : null}

													{cell.openShift ? (
														<div className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-lg border-2 border-dashed border-[#b7c8ff] bg-[#f7faff] text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#2d5cf6]">
															Open Shift
														</div>
													) : null}
												</div>
											))}
										</div>
									</div>
								</div>
								<div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
									<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600" onClick={handlePrint} title="Print schedule" type="button"><FiPrinter className="h-4 w-4" /></button>
									<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600" onClick={handleExportCalendar} title="Export calendar" type="button"><FiDownload className="h-4 w-4" /></button>
								</div>
							</div>
						</section>

						<section className="mt-5 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6">
							<div className="flex flex-col gap-2">
								<h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">Shift Adjustments</h2>
								<p className="text-sm text-slate-500">Request time off or a shift swap with a reason. Swap requests are reviewed by the teammate first, then the manager.</p>
							</div>
							<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
								<select
									value={adjustmentForm.shiftId}
									onChange={(event) => setAdjustmentForm((current) => ({ ...current, shiftId: event.target.value }))}
									className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0f51ff]"
								>
									<option value="">Select assigned shift</option>
									{schedulePage.assignedShifts.map((shift) => (
										<option key={shift.shiftId} value={shift.shiftId}>{shift.shiftName} - {shift.shiftDate} ({shift.shiftWindow})</option>
									))}
								</select>
								<select
									value={adjustmentForm.adjustmentType}
									onChange={(event) => setAdjustmentForm((current) => ({ ...current, adjustmentType: event.target.value, targetEmployeeId: '' }))}
									className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0f51ff]"
								>
									<option value="TIME_OFF">Request Time Off</option>
									<option value="SWAP">Request Shift Swap</option>
								</select>
								<select
									disabled={adjustmentForm.adjustmentType !== 'SWAP'}
									value={adjustmentForm.targetEmployeeId}
									onChange={(event) => setAdjustmentForm((current) => ({ ...current, targetEmployeeId: event.target.value }))}
									className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0f51ff] disabled:cursor-not-allowed disabled:bg-slate-100"
								>
									<option value="">Select swap teammate</option>
									{schedulePage.swapCandidates.map((candidate) => (
										<option key={candidate.employeeId} value={candidate.employeeId}>{candidate.employeeName}</option>
									))}
								</select>
								<button className="h-11 rounded-xl bg-[#0f51ff] px-4 text-sm font-bold text-white transition hover:bg-[#0b44de] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmittingAdjustment} onClick={submitAdjustmentRequest} type="button">
									{isSubmittingAdjustment ? 'Submitting...' : 'Submit Adjustment'}
								</button>
							</div>
							<textarea
								value={adjustmentForm.reason}
								onChange={(event) => setAdjustmentForm((current) => ({ ...current, reason: event.target.value }))}
								placeholder="Reason for adjustment (required)"
								rows={3}
								className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f51ff]"
							/>
							{adjustmentError ? <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{adjustmentError}</div> : null}
							{adjustmentMessage ? <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{adjustmentMessage}</div> : null}

							<div className="mt-5 grid gap-4 lg:grid-cols-2">
								<div className="rounded-2xl bg-[#f8faff] p-4">
									<h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-600">My Adjustment Requests</h3>
									<div className="mt-3 space-y-2">
										{schedulePage.outgoingAdjustments.length ? schedulePage.outgoingAdjustments.map((item) => (
											<div key={item.requestId} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
												<div className="font-bold text-slate-900">{item.adjustmentType} - {item.status}</div>
												<div className="text-slate-600">{item.shiftLabel}</div>
												<div className="mt-1 text-slate-500">{item.reason}</div>
												{item.targetEmployeeName ? (
													<div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
														<span>Peer: {item.targetEmployeeName}</span>
														<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] ${peerResponseBadgeClasses(item.targetEmployeeResponse)}`}>
															{item.targetEmployeeResponse}
														</span>
													</div>
												) : null}
											</div>
										)) : <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500">No adjustment requests submitted yet.</div>}
									</div>
								</div>
								<div className="rounded-2xl bg-[#f8faff] p-4">
									<h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-600">Incoming Swap Requests</h3>
									<div className="mt-3 space-y-2">
										{schedulePage.incomingSwapRequests.length ? schedulePage.incomingSwapRequests.map((item) => (
											<div key={item.requestId} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
												<div className="font-bold text-slate-900">{item.shiftLabel}</div>
												<div className="mt-1 text-slate-500">{item.reason}</div>
												<div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
													<span>Current response:</span>
													<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] ${peerResponseBadgeClasses(item.targetEmployeeResponse)}`}>
														{item.targetEmployeeResponse}
													</span>
												</div>
												<div className="mt-2 flex gap-2">
													<button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={respondingRequestId === item.requestId || item.targetEmployeeResponse !== 'PENDING'} onClick={() => respondToSwapRequest(item.requestId, true)} type="button">Accept</button>
													<button className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={respondingRequestId === item.requestId || item.targetEmployeeResponse !== 'PENDING'} onClick={() => respondToSwapRequest(item.requestId, false)} type="button">Reject</button>
												</div>
											</div>
										)) : <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500">No pending swap requests for your response.</div>}
									</div>
								</div>
							</div>
						</section>

						<section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
							<article className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5">
								<div className="mb-3 flex items-center justify-between gap-3">
									<h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">Schedule Notifications</h2>
									<button className="text-xs font-bold text-[#0f51ff]" onClick={() => navigate('/employee-notifications')} type="button">Open All</button>
								</div>
								<div className="space-y-2.5">
									{visibleNotifications.length ? visibleNotifications.map((item) => (
										<div key={`${item.title}-${item.when}`} className="rounded-xl bg-[#f8faff] p-3">
											<div className="flex items-start gap-3">
												<span className={`mt-2 h-2 w-2 rounded-full ${item.active ? 'bg-[#0f51ff]' : 'bg-slate-300'}`} />
												<div>
													<div className="text-sm font-extrabold text-slate-900">{item.title}</div>
													<div className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</div>
													<div className="mt-2 text-[11px] text-slate-400">{item.when}</div>
												</div>
											</div>
										</div>
									)) : (
										<div className="rounded-xl bg-[#f8faff] p-3 text-sm text-slate-500">{isLoading ? 'Loading notifications...' : 'No schedule notifications matched your search.'}</div>
									)}
								</div>
							</article>

							<article className="rounded-[20px] bg-[#eef2ff] p-4 sm:p-5">
								<h3 className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-slate-600">Resources</h3>
								<div className="mt-3 grid grid-cols-2 gap-2.5">
									{visibleResources.length ? visibleResources.map((resource) => (
										<button key={resource.name} className="rounded-xl border border-white/70 bg-white px-3 py-3 text-center text-xs font-bold text-slate-700 transition hover:border-[#0f51ff] hover:text-[#0f51ff]" type="button">{resource.name}</button>
									)) : (
										<div className="col-span-2 rounded-xl border border-white/70 bg-white px-3 py-3 text-center text-xs font-bold text-slate-500">No resources matched your search.</div>
									)}
								</div>
							</article>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
