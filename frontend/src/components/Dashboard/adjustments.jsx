import { useMemo, useState } from 'react'
import {
	FiAlertTriangle,
	FiBell,
	FiCalendar,
	FiCheckCircle,
	FiChevronDown,
	FiHome,
	FiLayers,
	FiLogOut,
	FiMenu,
	FiPieChart,
	FiPlus,
	FiSearch,
	FiSettings,
	FiSliders,
	FiUsers,
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession } from '../../lib/session'
import { resolveProfileImage, useManagerWorkspace } from '../../lib/managerWorkspace'
import ManagerProfileMenu from '../shared/ManagerProfileMenu'
import MobileManagerMenu from '../shared/MobileManagerMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

function MetricCard({ label, value }) {
	return (
		<div className="rounded-2xl bg-white p-4">
			<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">{label}</div>
			<div className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#0f51ff]">{value}</div>
		</div>
	)
}

function peerResponseBadgeClasses(value) {
	if (value.includes('PEER RESPONSE: ACCEPTED')) {
		return 'bg-[#e8eeff] text-[#0f51ff]'
	}
	if (value.includes('PEER RESPONSE: REJECTED')) {
		return 'bg-rose-100 text-rose-700'
	}
	if (value.includes('PEER RESPONSE: PENDING')) {
		return 'bg-amber-100 text-amber-700'
	}
	return 'bg-slate-100 text-slate-600'
}

export default function Adjustments() {
	const navigate = useNavigate()
	const { manager, workspace, isLoading, error, reloadWorkspace } = useManagerWorkspace()
	const profileImage = resolveProfileImage(manager?.profileImageUrl, manager?.fullName)
	const adjustments = workspace.adjustments
	const [notes, setNotes] = useState({})
	const [actionError, setActionError] = useState('')
	const [actionMessage, setActionMessage] = useState('')
	const [activeRequestId, setActiveRequestId] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [bulkBusy, setBulkBusy] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [swapTriageFilter, setSwapTriageFilter] = useState('ALL')

	const normalizedSearch = searchTerm.trim().toLowerCase()
	const waitingOnPeerCount = adjustments.requests.filter((request) => request.requested.toLowerCase().includes('shift swap') && request.toShift.toUpperCase().includes('PEER RESPONSE: PENDING')).length
	const readyForManagerCount = adjustments.requests.filter((request) => request.requested.toLowerCase().includes('shift swap') && request.toShift.toUpperCase().includes('PEER RESPONSE: ACCEPTED')).length
	const visibleRequests = useMemo(() => {
		return adjustments.requests.filter((request) => {
			const isSwapRequest = request.requested.toLowerCase().includes('shift swap')
			const isWaitingOnPeer = isSwapRequest && request.toShift.toUpperCase().includes('PEER RESPONSE: PENDING')
			const isReadyForManager = isSwapRequest && request.toShift.toUpperCase().includes('PEER RESPONSE: ACCEPTED')

			const matchesSwapTriage =
				swapTriageFilter === 'ALL' ||
				(swapTriageFilter === 'WAITING_PEER' && isWaitingOnPeer) ||
				(swapTriageFilter === 'READY_MANAGER' && isReadyForManager)

			if (!matchesSwapTriage) {
				return false
			}

			if (!normalizedSearch) {
				return true
			}

			return [
				request.name,
				request.requested,
				request.from,
				request.fromShift,
				request.to,
				request.toShift,
				request.reason,
				request.status,
			]
				.join(' ')
				.toLowerCase()
				.includes(normalizedSearch)
		})
	}, [adjustments.requests, normalizedSearch, swapTriageFilter])

	const pendingVisibleRequests = visibleRequests.filter((request) => request.status === 'PENDING')
	const bulkApprovableRequests = pendingVisibleRequests.filter((request) => !request.toShift.toUpperCase().includes('PEER RESPONSE: PENDING'))

	async function handleDecision(requestId, status) {
		try {
			setActionError('')
			setActionMessage('')
			setActiveRequestId(requestId)
			await apiRequest(`/api/manager/adjustments/${requestId}`, {
				method: 'PATCH',
				body: JSON.stringify({
					managerId: manager.userId,
					status,
					note: notes[requestId] || '',
				}),
			})
			await reloadWorkspace()
			setActionMessage(status === 'APPROVED' ? 'Adjustment approved successfully.' : 'Adjustment rejected successfully.')
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to update this shift adjustment.')
		} finally {
			setActiveRequestId(null)
		}
	}

	async function handleBulkApprove() {
		if (!bulkApprovableRequests.length) {
			setActionError('There are no pending adjustment requests to approve.')
			return
		}

		try {
			setBulkBusy(true)
			setActionError('')
			setActionMessage('')

			for (const request of bulkApprovableRequests) {
				await apiRequest(`/api/manager/adjustments/${request.id}`, {
					method: 'PATCH',
					body: JSON.stringify({
						managerId: manager.userId,
						status: 'APPROVED',
						note: notes[request.id] || 'Approved in bulk by the manager.',
					}),
				})
			}

			await reloadWorkspace()
			const skippedCount = pendingVisibleRequests.length - bulkApprovableRequests.length
			setActionMessage(
				`Approved ${bulkApprovableRequests.length} pending adjustment request${bulkApprovableRequests.length === 1 ? '' : 's'}.${
					skippedCount > 0 ? ` Skipped ${skippedCount} swap request${skippedCount === 1 ? '' : 's'} still waiting on peer response.` : ''
				}`
			)
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to bulk approve the selected requests.')
		} finally {
			setBulkBusy(false)
		}
	}

	async function handleCreateShift() {
		try {
			setActionError('')
			setActionMessage('')
			await apiRequest('/api/scheduling/manager/create-shift', {
				method: 'POST',
				body: JSON.stringify({ managerId: manager.userId }),
			})
			setActionMessage('A weekly shift schedule was created successfully.')
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to create weekly shifts.')
		}
	}

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<MobileManagerMenu
				activePath="/adjustments"
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				onPrimaryAction={handleCreateShift}
				primaryActionLabel="Create Weekly Shifts"
			/>
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="flex w-full shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:fixed xl:left-0 xl:top-0 xl:h-screen" style={{ width: '264px', maxWidth: '264px' }}>
					<div className="flex w-full items-center justify-start gap-3">
						<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
					</div>

					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/overview"><FiHome className="h-4 w-4" /> Dashboard Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/profiles"><FiUsers className="h-4 w-4" /> Employee Profiles</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/scheduling"><FiCalendar className="h-4 w-4" /> Shift Scheduling</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>

					<div className="mt-auto space-y-3 pt-8">
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]" onClick={handleCreateShift} type="button"><FiPlus className="h-4 w-4" /> Create Weekly Shifts</button>
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
									placeholder="Search requests, employees, or notes..."
									className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white"
								/>
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500" onClick={() => navigate('/notifications')} type="button"><FiBell className="h-4 w-4" /></button>
								<ThemeToggleButton />
								<ManagerProfileMenu name={manager.fullName} profileImageUrl={profileImage} role={manager.roleLabel} />
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="space-y-5">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Shift Adjustments</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{adjustments.summary || 'Loading adjustment requests...'}</p>
								</div>
								<button className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0f51ff] disabled:cursor-not-allowed disabled:opacity-60" disabled={bulkBusy || !bulkApprovableRequests.length} onClick={handleBulkApprove} type="button">{bulkBusy ? 'Approving...' : 'Bulk Approve'}</button>
							</div>

							{error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
							{actionError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div> : null}
							{actionMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div> : null}
							<div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Swap Triage</div>
									<div className="mt-1 text-sm text-slate-600">Use these chips to focus only on swap requests that are still waiting on a teammate or already ready for your approval.</div>
								</div>
								<div className="inline-flex flex-wrap gap-2 rounded-2xl bg-[#eef2ff] p-1">
									<button className={`rounded-xl px-4 py-2 text-sm font-bold ${swapTriageFilter === 'ALL' ? 'bg-white text-[#0f51ff]' : 'text-slate-600'}`} onClick={() => setSwapTriageFilter('ALL')} type="button">All Requests</button>
									<button className={`rounded-xl px-4 py-2 text-sm font-bold ${swapTriageFilter === 'WAITING_PEER' ? 'bg-white text-[#0f51ff]' : 'text-slate-600'}`} onClick={() => setSwapTriageFilter('WAITING_PEER')} type="button">Waiting on peer response ({waitingOnPeerCount})</button>
									<button className={`rounded-xl px-4 py-2 text-sm font-bold ${swapTriageFilter === 'READY_MANAGER' ? 'bg-white text-[#0f51ff]' : 'text-slate-600'}`} onClick={() => setSwapTriageFilter('READY_MANAGER')} type="button">Ready for manager decision ({readyForManagerCount})</button>
								</div>
							</div>

							<div className="grid gap-5 xl:grid-cols-[1fr_320px]">
								<div className="space-y-5">
									{visibleRequests.map((request, index) => (
										<article key={request.id} className={`rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6 ${index === 0 ? 'ring-1 ring-[#0f51ff]/20' : ''}`}>
											<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
												<div className="min-w-0 flex-1">
													<div className="flex flex-wrap items-center gap-3">
														<div className="flex items-center -space-x-2">
															<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#0f51ff] text-sm font-black text-white">{request.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
															<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-sm font-black text-white">↔</div>
															<div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-xs font-black text-white ${request.status === 'APPROVED' ? 'bg-emerald-600' : request.status === 'REJECTED' ? 'bg-rose-600' : 'bg-amber-500'}`}>{request.status.slice(0, 2)}</div>
														</div>
														<div>
															<div className="text-xl font-black tracking-[-0.04em] text-slate-950">{request.name}</div>
															<div className="text-sm text-slate-500">{request.requested}</div>
															{request.requested.toLowerCase().includes('shift swap') ? (
																<div className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] ${peerResponseBadgeClasses(request.toShift.toUpperCase())}`}>
																	{request.toShift.toUpperCase().includes('PEER RESPONSE: PENDING')
																		? 'Waiting on peer response'
																		: request.toShift.toUpperCase().includes('PEER RESPONSE: ACCEPTED')
																			? 'Peer approved'
																			: request.toShift.toUpperCase().includes('PEER RESPONSE: REJECTED')
																				? 'Peer rejected'
																			: 'Peer response recorded'}
																</div>
															) : null}
														</div>
													</div>

													<div className="mt-5 grid gap-4 rounded-2xl bg-[#f7f8ff] p-4 sm:grid-cols-2">
														<div className="rounded-2xl border-l-4 border-[#0f51ff] bg-white p-4">
															<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Current Shift</div>
															<div className="mt-2 font-bold text-slate-900">{request.from}</div>
															<div className="mt-1 text-sm text-slate-600">{request.fromShift}</div>
															<div className="mt-2 text-sm text-slate-500"><span className="font-semibold text-slate-700">Reason:</span> {request.reason}</div>
														</div>
														<div className="rounded-2xl border-l-4 border-[#d2dbff] bg-white p-4">
															<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Requested Change</div>
															<div className="mt-2 font-bold text-slate-900">{request.to}</div>
															<div className="mt-1 text-sm text-slate-600">{request.toShift}</div>
															<div className="mt-2 text-sm text-slate-500"><span className="font-semibold text-slate-700">Status:</span> {request.status}</div>
														</div>
													</div>

													<div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
														<label className="block">
															<div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Manager Note (Optional)</div>
															<input
																type="text"
																value={notes[request.id] || ''}
																onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))}
																placeholder="Add a note for the internal log..."
																className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-[#0f51ff]"
															/>
														</label>
														<div className="flex gap-3 sm:flex-col">
															<button
																disabled={activeRequestId === request.id || request.status !== 'PENDING' || request.toShift.toUpperCase().includes('PEER RESPONSE: PENDING')}
																onClick={() => handleDecision(request.id, 'APPROVED')}
																className="rounded-xl bg-[#0f51ff] px-6 py-3 text-sm font-extrabold text-white hover:bg-[#0b44de] disabled:cursor-not-allowed disabled:opacity-60"
																type="button"
															>
																{activeRequestId === request.id ? 'Saving...' : 'Approve'}
															</button>
															<button
																disabled={activeRequestId === request.id || request.status !== 'PENDING'}
																onClick={() => handleDecision(request.id, 'REJECTED')}
																className="rounded-xl bg-[#ffd7d3] px-6 py-3 text-sm font-extrabold text-[#c72d2d] hover:bg-[#ffc7c2] disabled:cursor-not-allowed disabled:opacity-60"
																type="button"
															>
																{activeRequestId === request.id ? 'Saving...' : 'Reject'}
															</button>
														</div>
													</div>
												</div>
											</div>
										</article>
									))}
									{!visibleRequests.length && !isLoading ? <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-500">{normalizedSearch ? 'No adjustment requests matched your search.' : 'No live adjustment requests are currently available.'}</div> : null}
								</div>

								<aside className="space-y-5">
									<article className="rounded-[26px] border border-slate-200/80 bg-[#eef3ff] p-5 sm:p-6">
										<div className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-950"><FiCheckCircle className="h-5 w-5 text-[#0f51ff]" /> Compliance Check</div>
										<div className="mt-4 space-y-4 text-sm text-slate-600">
											{adjustments.checks.map((item) => (
												<div key={item.title} className="flex items-start gap-3">
													{item.tone === 'warning' ? <FiAlertTriangle className="mt-0.5 h-4 w-4 text-rose-500" /> : <FiCheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" />}
													<div><div className={`font-bold ${item.tone === 'warning' ? 'text-rose-600' : 'text-slate-900'}`}>{item.title}</div><div className="text-sm text-slate-500">{item.detail}</div></div>
												</div>
											))}
										</div>
									</article>

									<article className="rounded-[26px] bg-[#eef3ff] p-5 sm:p-6">
										<h3 className="text-xl font-black tracking-[-0.04em] text-slate-950">Adjustment Metrics</h3>
										<div className="mt-4 grid gap-3 sm:grid-cols-2">
											{adjustments.metrics.map((item) => <MetricCard key={item.label} label={item.label} value={item.value} />)}
										</div>
									</article>

									<article className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
										<h3 className="text-xl font-black tracking-[-0.04em] text-slate-950">Recent Activity</h3>
										<div className="mt-5 space-y-5">
											{adjustments.recentActivity.map((item) => (
												<div key={`${item.label}-${item.detail}`} className="flex gap-3">
													<span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.tone}`} />
													<div>
														<div className="font-bold text-slate-900">{item.label}</div>
														<div className="text-sm text-slate-500">{item.detail}</div>
													</div>
												</div>
											))}
										</div>
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
