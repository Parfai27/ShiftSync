import { useEffect, useMemo, useRef, useState } from 'react'
import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiCheck,
	FiChevronLeft,
	FiChevronRight,
	FiClock,
	FiDownload,
	FiEdit2,
	FiHome,
	FiLayers,
	FiLogOut,
	FiMail,
	FiMapPin,
	FiMenu,
	FiMoreVertical,
	FiPlus,
	FiSearch,
	FiSettings,
	FiSliders,
	FiUsers,
	FiPieChart,
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import ExportPickerModal from '../shared/ExportPickerModal.jsx'
import {
	createManagedEmployee,
	deleteManagedEmployee,
	fetchManagedEmployeeDetail,
	resolveProfileImage,
	updateManagedEmployee,
	useManagerWorkspace,
} from '../../lib/managerWorkspace'
import { executeProfileExport, PROFILE_EXPORT_OPTIONS } from '../../lib/profileExports'
import { clearSession } from '../../lib/session'
import ManagerProfileMenu from '../shared/ManagerProfileMenu'
import MobileManagerMenu from '../shared/MobileManagerMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

function Pill({ children, tone }) {
	return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] ${tone}`}>{children}</span>
}

const emptyForm = {
	fullName: '',
	email: '',
	jobTitle: '',
	phoneNumber: '',
}

const emptyCreateForm = {
	fullName: '',
	email: '',
	jobTitle: '',
	phoneNumber: '',
}

const EMPLOYEE_ROLE_OPTIONS = ['Pharmacist', 'Pharmacy Assistant / Attendant']
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[0-9]{10,15}$/

const PAGE_SIZE = 8

export default function Profiles() {
	const navigate = useNavigate()
	const { manager, workspace, session, isLoading, error, reloadWorkspace } = useManagerWorkspace()
	const profileImage = resolveProfileImage(manager?.profileImageUrl, manager?.fullName)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
	const [featured, setFeatured] = useState(null)
	const [form, setForm] = useState(emptyForm)
	const [isEditing, setIsEditing] = useState(false)
	const [isDetailLoading, setIsDetailLoading] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isArchiving, setIsArchiving] = useState(false)
	const [rosterFilter, setRosterFilter] = useState('all')
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [showExportModal, setShowExportModal] = useState(false)
	const [exportType, setExportType] = useState('roster')
	const [exportFormat, setExportFormat] = useState('html')
	const [exportDateRange, setExportDateRange] = useState({ from: '', to: '' })
	const [exportDateRangeError, setExportDateRangeError] = useState('')
	const [exportError, setExportError] = useState('')
	const [isExporting, setIsExporting] = useState(false)
	const [actionError, setActionError] = useState('')
	const [actionMessage, setActionMessage] = useState('')
	const detailRequestRef = useRef(0)
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [createForm, setCreateForm] = useState(emptyCreateForm)
	const [isCreating, setIsCreating] = useState(false)
	const [createResult, setCreateResult] = useState(null)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)

	const roster = workspace.profiles.roster
	const filteredRoster = roster.filter((employee) => {
		if (rosterFilter === 'active' && employee.active === false) {
			return false
		}
		if (rosterFilter === 'inactive' && employee.active !== false) {
			return false
		}

		const query = searchTerm.trim().toLowerCase()
		if (!query) {
			return true
		}

		return [employee.name, employee.role, employee.department, employee.status, employee.shift]
			.filter(Boolean)
			.some((value) => value.toLowerCase().includes(query))
	})

	const totalPages = Math.max(1, Math.ceil(filteredRoster.length / PAGE_SIZE))
	const paginatedRoster = filteredRoster.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

	useEffect(() => {
		setCurrentPage(1)
	}, [searchTerm, roster.length, rosterFilter])

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	useEffect(() => {
		if (!selectedEmployeeId || !filteredRoster.length) {
			return
		}

		const selectedIndex = filteredRoster.findIndex((employee) => employee.userId === selectedEmployeeId)
		if (selectedIndex < 0) {
			return
		}

		const targetPage = Math.floor(selectedIndex / PAGE_SIZE) + 1
		if (targetPage !== currentPage) {
			setCurrentPage(targetPage)
		}
	}, [currentPage, filteredRoster, selectedEmployeeId])

	useEffect(() => {
		if (!roster.length) {
			setSelectedEmployeeId(null)
			setFeatured(null)
			setForm(emptyForm)
			return
		}

		const selectedStillExists = roster.some((employee) => employee.userId === selectedEmployeeId)
		const fallbackId = workspace.profiles.featuredEmployee?.userId || roster[0]?.userId || null

		if (!selectedStillExists) {
			setSelectedEmployeeId(fallbackId)
		}
	}, [roster, selectedEmployeeId, workspace.profiles.featuredEmployee])

	useEffect(() => {
		let active = true

		async function loadEmployeeDetail() {
			if (!session?.userId || !selectedEmployeeId) {
				return
			}

			const requestId = detailRequestRef.current + 1
			detailRequestRef.current = requestId

			try {
				setIsDetailLoading(true)
				setActionError('')
				const detail = await fetchManagedEmployeeDetail(session.userId, selectedEmployeeId)
				if (!active || detailRequestRef.current !== requestId) {
					return
				}
				setFeatured(detail)
				setForm({
					fullName: detail.name || '',
					email: detail.email || '',
					jobTitle: detail.role || '',
					phoneNumber: detail.phoneNumber === 'Not on file' ? '' : detail.phoneNumber || '',
				})
			} catch (detailError) {
				if (active) {
					setActionError(detailError.message || 'Unable to load employee details.')
				}
			} finally {
				if (active && detailRequestRef.current === requestId) {
					setIsDetailLoading(false)
				}
			}
		}

		loadEmployeeDetail()

		return () => {
			active = false
		}
	}, [selectedEmployeeId, session?.userId])

	function handleFieldChange(event) {
		const { name, value } = event.target
		setForm((current) => ({
			...current,
			[name]: value,
		}))
	}

	function handleCreateFieldChange(event) {
		const { name, value } = event.target
		setCreateForm((current) => ({
			...current,
			[name]: value,
		}))
	}

	function validateEmployeePayload(payload) {
		if (!payload.fullName.trim()) {
			return 'Employee full name is required.'
		}
		if (payload.fullName.trim().length < 3) {
			return 'Employee full name must be at least 3 characters long.'
		}
		if (!payload.email.trim()) {
			return 'Employee email is required.'
		}
		if (!emailPattern.test(payload.email.trim())) {
			return 'Enter a valid email address.'
		}
		if (!payload.jobTitle.trim()) {
			return 'Employee role is required.'
		}
		if (!EMPLOYEE_ROLE_OPTIONS.includes(payload.jobTitle.trim())) {
			return 'Employee role must be either Pharmacist or Pharmacy Assistant / Attendant.'
		}
		if (payload.phoneNumber.trim() && !phonePattern.test(payload.phoneNumber.trim())) {
			return 'Phone number must contain 10 to 15 digits.'
		}
		return ''
	}

	function handleSelectEmployee(employeeId) {
		if (employeeId === selectedEmployeeId) {
			return
		}

		setSelectedEmployeeId(employeeId)
		setIsEditing(false)
		setActionError('')
		setActionMessage('')
	}

	async function handleSaveChanges() {
		if (!featured?.userId || !session?.userId) {
			return
		}

		const validationMessage = validateEmployeePayload(form)
		if (validationMessage) {
			setActionError(validationMessage)
			setActionMessage('')
			return
		}

		try {
			setIsSaving(true)
			setActionError('')
			setActionMessage('')
			await updateManagedEmployee(featured.userId, {
				managerId: session.userId,
				fullName: form.fullName.trim(),
				email: form.email.trim(),
				jobTitle: form.jobTitle.trim(),
				phoneNumber: form.phoneNumber.trim(),
			})
			const refreshedDetail = await fetchManagedEmployeeDetail(session.userId, featured.userId)
			setFeatured(refreshedDetail)
			setForm({
				fullName: refreshedDetail.name || '',
				email: refreshedDetail.email || '',
				jobTitle: refreshedDetail.role || '',
				phoneNumber: refreshedDetail.phoneNumber === 'Not on file' ? '' : refreshedDetail.phoneNumber || '',
			})
			await reloadWorkspace()
			setIsEditing(false)
			setActionMessage('Employee profile updated successfully.')
		} catch (saveError) {
			setActionError(saveError.message || 'Unable to save employee details.')
		} finally {
			setIsSaving(false)
		}
	}

	async function handleDeleteEmployee() {
		if (!featured?.userId || !session?.userId) {
			return
		}

		try {
			setIsArchiving(true)
			setActionError('')
			setActionMessage('')
			await deleteManagedEmployee(featured.userId, { managerId: session.userId })
			await reloadWorkspace()
			setSelectedEmployeeId(null)
			setFeatured(null)
			setForm(emptyForm)
			setIsEditing(false)
			setShowDeleteConfirm(false)
			setActionMessage('Employee account deleted from the database. Their shifts and related records were removed too.')
		} catch (archiveError) {
			setActionError(archiveError.message || 'Unable to delete this employee.')
		} finally {
			setIsArchiving(false)
		}
	}

	async function handleCreateEmployee() {
		if (!session?.userId) {
			return
		}

		const validationMessage = validateEmployeePayload(createForm)
		if (validationMessage) {
			setActionError(validationMessage)
			setActionMessage('')
			return
		}

		try {
			setIsCreating(true)
			setActionError('')
			setActionMessage('')
			setCreateResult(null)
		const createdEmployee = await createManagedEmployee({
			managerId: session.userId,
			fullName: createForm.fullName.trim(),
			email: createForm.email.trim(),
				jobTitle: createForm.jobTitle.trim(),
				phoneNumber: createForm.phoneNumber.trim(),
			})
			await reloadWorkspace()
			setSelectedEmployeeId(createdEmployee.userId)
			setCreateForm(emptyCreateForm)
			setCreateResult(createdEmployee)
			setActionMessage(
				createdEmployee.emailDelivered
					? `Employee created. Login credentials were emailed to ${createdEmployee.email}.`
					: `Employee created, but the credentials email could not be sent. Temporary password: ${createdEmployee.temporaryPassword}`
			)
		} catch (createError) {
			setActionError(createError.message || 'Unable to create employee account.')
		} finally {
			setIsCreating(false)
		}
	}

	function handleExportCsv() {
		setExportError('')
		setExportDateRangeError('')
		setExportType(featured?.userId ? 'profile-dossier' : 'roster')
		setExportFormat('html')
		setExportDateRange({ from: '', to: '' })
		setShowExportModal(true)
	}

	const profileExportPreview = useMemo(() => {
		const lines = [`Branch: ${manager?.branchName || 'Ngabo Pharmacy'}`]
		if (exportType === 'profile-dossier' && featured?.name) {
			lines.push(`Employee: ${featured.name}`)
			lines.push('Includes contact details, workload, expertise, and weekly availability.')
		} else {
			lines.push(`Rows in current filter: ${filteredRoster.length}`)
			lines.push(`Filter: ${rosterFilter === 'all' ? 'All employees' : rosterFilter === 'inactive' ? 'Inactive only' : 'Active only'}`)
		}
		if (searchTerm.trim()) {
			lines.push(`Search: ${searchTerm.trim()}`)
		}
		return lines
	}, [exportType, featured?.name, filteredRoster.length, manager?.branchName, rosterFilter, searchTerm])

	const disabledProfileExports = PROFILE_EXPORT_OPTIONS
		.filter((option) => option.requiresSelection && !featured?.userId)
		.map((option) => option.id)

	async function handleConfirmExport() {
		try {
			if (!exportDateRange.from || !exportDateRange.to) {
				setExportDateRangeError('Please choose both start and end dates before exporting.')
				setExportError('')
				return
			}
			if (new Date(exportDateRange.from) > new Date(exportDateRange.to)) {
				setExportDateRangeError('The start date must be on or before the end date.')
				setExportError('')
				return
			}
			setIsExporting(true)
			setExportError('')
			setExportDateRangeError('')
			const summary = await executeProfileExport({
				type: exportType,
				format: exportFormat,
				roster: filteredRoster,
				featured,
				manager,
				session,
				rosterFilter,
				searchTerm,
				dateRange: exportDateRange,
			})
			setShowExportModal(false)
			setActionMessage(summary)
			setActionError('')
		} catch (exportFailure) {
			setExportError(exportFailure.message || 'Unable to prepare this export.')
		} finally {
			setIsExporting(false)
		}
	}

	const detailBusy = isDetailLoading || isSaving || isArchiving
	const isInactiveEmployee = featured?.active === false

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<MobileManagerMenu
				activePath="/profiles"
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				onPrimaryAction={() => navigate('/scheduling')}
				primaryActionLabel="Create Weekly Shifts"
			/>
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
					<div className="flex w-full items-center justify-start gap-3">
						<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
					</div>

					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/overview"><FiHome className="h-4 w-4" /> Dashboard Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/profiles"><FiUsers className="h-4 w-4" /> Employee Profiles</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/scheduling"><FiCalendar className="h-4 w-4" /> Shift Scheduling</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>

					<div className="mt-auto space-y-3 pt-8">
						<button
							className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]"
							onClick={() => navigate('/scheduling')}
						>
							<FiPlus className="h-4 w-4" /> Create Weekly Shifts
						</button>
						<div className="space-y-1 text-sm text-slate-600">
							<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/manager-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
							<Link className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link>
						</div>
					</div>
				</aside>

				<div className="dashboard-main-offset flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
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
									placeholder="Search employees, roles, departments..."
									className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white"
								/>
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button
									className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"
									onClick={() => navigate('/notifications')}
									type="button"
								>
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
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Employee Roster</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{workspace.profiles.summary || 'Loading roster data...'}</p>
								</div>
								<div className="flex flex-wrap items-center gap-3">
									<button
										className="inline-flex items-center gap-2 rounded-xl bg-[#0f51ff] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,81,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0b44de]"
										onClick={handleExportCsv}
										type="button"
									>
										<FiDownload className="h-4 w-4" />
										Export
									</button>
									<button
										className="rounded-xl bg-[#0f51ff] px-4 py-2 text-sm font-bold text-white"
										onClick={() => {
											setShowCreateForm((current) => !current)
											setActionError('')
											setCreateResult(null)
										}}
										type="button"
									>
										{showCreateForm ? 'Close Form' : 'Add Employee'}
									</button>
									<button
										className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
										disabled={!featured || detailBusy}
										onClick={() => setShowDeleteConfirm(true)}
										type="button"
									>
										Delete
									</button>
								</div>
							</div>

							<div className="flex flex-wrap gap-2">
								{[
									{ key: 'active', label: 'Active' },
									{ key: 'inactive', label: 'Inactive' },
									{ key: 'all', label: 'All' },
								].map((filter) => (
									<button
										key={filter.key}
										className={`rounded-full px-4 py-2 text-sm font-bold transition ${rosterFilter === filter.key ? 'bg-[#0f51ff] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}
										onClick={() => setRosterFilter(filter.key)}
										type="button"
									>
										{filter.label}
									</button>
								))}
							</div>

							{showDeleteConfirm ? (
								<div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900">
									<div className="font-bold">Delete {featured?.name}?</div>
									<p className="mt-2 text-rose-800">
										This permanently removes the employee from the database, clears their schedule history, and deletes their related records.
									</p>
									<div className="mt-4 flex flex-wrap gap-3">
										<button
											className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
											disabled={isArchiving}
											onClick={handleDeleteEmployee}
											type="button"
										>
											{isArchiving ? 'Deleting...' : 'Confirm delete'}
										</button>
										<button
											className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700"
											onClick={() => setShowDeleteConfirm(false)}
											type="button"
										>
											Cancel
										</button>
									</div>
								</div>
							) : null}

							{error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
							{actionError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div> : null}
							{actionMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div> : null}
							{showCreateForm ? (
								<div className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
									<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
										<div>
											<h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Create Employee</h2>
											<p className="text-sm text-slate-500">Add a new Ngabo Pharmacy team member and prepare their login details.</p>
										</div>
											<div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Role will be created as employee</div>
									</div>

									<div className="mt-5 grid gap-4 md:grid-cols-2">
										<label className="space-y-2">
											<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Full Name</div>
											<input className="w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0f51ff]" name="fullName" onChange={handleCreateFieldChange} value={createForm.fullName} />
										</label>
										<label className="space-y-2">
											<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Email</div>
											<input className="w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0f51ff]" name="email" onChange={handleCreateFieldChange} value={createForm.email} />
										</label>
										<label className="space-y-2">
											<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Job Title</div>
											<select className="w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0f51ff]" name="jobTitle" onChange={handleCreateFieldChange} value={createForm.jobTitle}>
												<option value="">Select employee role</option>
												{EMPLOYEE_ROLE_OPTIONS.map((role) => (
													<option key={role} value={role}>{role}</option>
												))}
											</select>
										</label>
										<label className="space-y-2">
											<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Phone Number</div>
											<input className="w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0f51ff]" name="phoneNumber" onChange={handleCreateFieldChange} value={createForm.phoneNumber} />
										</label>
									</div>

									<div className="mt-5 flex items-center gap-3">
										<button
											className="rounded-xl bg-[#e8eeff] px-4 py-3 text-sm font-bold text-slate-700"
											onClick={() => {
												setShowCreateForm(false)
												setCreateForm(emptyCreateForm)
												setCreateResult(null)
											}}
											type="button"
										>
											Cancel
										</button>
										<button
											className="rounded-xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
											disabled={
												isCreating ||
												!createForm.fullName.trim() ||
												!createForm.email.trim() ||
												!createForm.jobTitle.trim()
											}
											onClick={handleCreateEmployee}
											type="button"
										>
											{isCreating ? 'Creating...' : 'Create Employee'}
										</button>
									</div>
									{createResult ? (
										<div className={`mt-5 rounded-2xl border px-4 py-4 ${createResult.emailDelivered ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
											<div className="flex flex-wrap items-center justify-between gap-3">
												<div>
													<div className="text-sm font-black text-slate-900">{createResult.fullName}</div>
													<div className="mt-1 text-xs font-semibold text-slate-600">{createResult.email}</div>
												</div>
												<span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${createResult.emailDelivered ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
													{createResult.emailDelivered ? 'Email Sent' : 'Email Failed'}
												</span>
											</div>
											<div className="mt-3 text-sm text-slate-700">
												{createResult.emailDelivered
													? 'The employee will receive their login credentials by email and will be required to change the temporary password on first sign in.'
													: 'The account was created, but the credentials email was not delivered. Share the temporary password manually so the employee can sign in and change it immediately.'}
											</div>
											<div className="mt-3 grid gap-3 sm:grid-cols-2">
												<div className="rounded-xl bg-white/80 px-3 py-3">
													<div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Employee Code</div>
													<div className="mt-1 text-sm font-bold text-slate-900">{createResult.employeeCode}</div>
												</div>
												<div className="rounded-xl bg-white/80 px-3 py-3">
													<div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
														{createResult.emailDelivered ? 'Delivery Status' : 'Temporary Password'}
													</div>
													<div className={`mt-1 text-sm font-bold ${createResult.emailDelivered ? 'text-emerald-700' : 'text-slate-900'}`}>
														{createResult.emailDelivered ? 'Credentials emailed successfully' : createResult.temporaryPassword}
													</div>
												</div>
											</div>
										</div>
									) : null}
								</div>
							) : null}

							<div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_360px]">
								<article className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white">
									<div className="overflow-x-auto">
										<table className="min-w-full text-left">
											<thead className="bg-[#f5f7ff] text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
												<tr>
													<th className="px-5 py-4 sm:px-6">Employee</th>
													<th className="px-5 py-4 sm:px-6">Department</th>
													<th className="px-5 py-4 sm:px-6">Status</th>
													<th className="px-5 py-4 sm:px-6">Shift</th>
													<th className="px-5 py-4 sm:px-6">Actions</th>
												</tr>
											</thead>
											<tbody>
												{paginatedRoster.map((employee) => {
													const isSelected = employee.userId === selectedEmployeeId
													return (
														<tr
															key={employee.userId}
															className={`cursor-pointer border-t border-slate-100 text-sm text-slate-700 transition ${isSelected ? 'bg-[#eef2ff]' : 'bg-white hover:bg-slate-50'}`}
															onClick={() => handleSelectEmployee(employee.userId)}
														>
															<td className="px-5 py-4 sm:px-6">
																<div className="flex items-center gap-3 font-semibold text-left text-slate-900">
																	<span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f51ff,#91b2ff)] text-[11px] font-black text-white">{employee.avatar}</span>
																	<div>
																		<div>{employee.name}</div>
																		<div className="text-xs font-medium text-slate-500">{employee.role}</div>
																	</div>
																</div>
															</td>
															<td className="px-5 py-4 sm:px-6">{employee.department}</td>
															<td className="px-5 py-4 sm:px-6"><Pill tone={employee.tone}>{employee.status}</Pill></td>
															<td className="px-5 py-4 sm:px-6 text-slate-500">{employee.shift}</td>
															<td className="px-5 py-4 sm:px-6">
																<button
																	className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
																	onClick={(event) => {
																		event.stopPropagation()
																		handleSelectEmployee(employee.userId)
																	}}
																	type="button"
																>
																	<FiMoreVertical className="h-4 w-4" />
																</button>
															</td>
														</tr>
													)
												})}
												{!paginatedRoster.length && !isLoading ? (
													<tr className="border-t border-slate-100 text-sm text-slate-500">
														<td className="px-5 py-4 sm:px-6" colSpan="5">
															{searchTerm ? 'No employees match your search.' : 'No employee records are available yet.'}
														</td>
													</tr>
												) : null}
											</tbody>
										</table>
									</div>

									<div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:px-6">
										<span>{filteredRoster.length ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, filteredRoster.length)} of ${filteredRoster.length} employees` : (searchTerm ? 'No employees matched the current search.' : workspace.profiles.paginationLabel || (isLoading ? 'Loading roster...' : 'No pagination data'))}</span>
										<div className="flex items-center gap-2">
											<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} type="button"><FiChevronLeft className="h-4 w-4" /></button>
											<button className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-[#0f51ff] px-3 text-white" type="button">{currentPage}</button>
											<button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} type="button"><FiChevronRight className="h-4 w-4" /></button>
										</div>
									</div>
								</article>

								<aside className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
									{featured ? (
										<>
											<div className="flex items-start justify-between gap-3">
												<div className="flex items-center gap-4">
													<div className="relative">
														<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1f2937] text-white">{featured.avatar}</div>
														<div className="absolute -right-1 bottom-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#0f51ff] text-[10px] text-white"><FiCheck className="h-3 w-3" /></div>
													</div>
													<div>
														<h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">{featured.name}</h2>
														<p className="text-sm font-semibold text-[#0f51ff]">{featured.role} • Staff ID #{featured.employeeCode}</p>
														{isInactiveEmployee ? (
															<span className="mt-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-rose-700">Inactive account</span>
														) : null}
													</div>
												</div>
												<div className="flex items-center gap-2 text-slate-500">
													<button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#0f51ff]/30 hover:bg-[#eef3ff] hover:text-[#0f51ff]" onClick={handleExportCsv} title="Export report" type="button"><FiDownload className="h-4 w-4" /></button>
													<button className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" disabled={isInactiveEmployee || detailBusy} onClick={() => setIsEditing((current) => !current)} type="button"><FiEdit2 className="h-4 w-4" /></button>
													<button className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100" onClick={() => window.location.assign(`mailto:${featured.email}`)} type="button"><FiMail className="h-4 w-4" /></button>
												</div>
											</div>

											<div className="mt-6 grid gap-3 sm:grid-cols-2">
												<label className="space-y-2">
													<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Full Name</div>
													<input className="w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0f51ff]" disabled={!isEditing || detailBusy} name="fullName" onChange={handleFieldChange} value={form.fullName} />
												</label>
												<label className="space-y-2">
													<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Role</div>
													<select className="w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0f51ff]" disabled={!isEditing || detailBusy} name="jobTitle" onChange={handleFieldChange} value={form.jobTitle}>
														<option value="">Select employee role</option>
														{EMPLOYEE_ROLE_OPTIONS.map((role) => (
															<option key={role} value={role}>{role}</option>
														))}
													</select>
												</label>
												<label className="space-y-2">
													<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Email</div>
													<input className="w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0f51ff]" disabled={!isEditing || detailBusy} name="email" onChange={handleFieldChange} value={form.email} />
												</label>
												<label className="space-y-2">
													<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Phone Number</div>
													<input className="w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0f51ff]" disabled={!isEditing || detailBusy} name="phoneNumber" onChange={handleFieldChange} value={form.phoneNumber} />
												</label>
											</div>

											<div className="mt-6 space-y-6">
												<div>
													<div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Core Expertise</div>
													<div className="flex flex-wrap gap-2">
														{featured.expertise.map((item) => (
															<span key={item} className="rounded-lg border border-slate-200 bg-[#eef3ff] px-3 py-2 text-xs font-semibold text-slate-700">{item}</span>
														))}
													</div>
												</div>

												<div className="grid gap-4 text-sm text-slate-600">
													<div className="flex items-start gap-3"><FiCalendar className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Hired Date</div><div className="font-semibold text-slate-900">{featured.hiredDate}</div></div></div>
													<div className="flex items-start gap-3"><FiMapPin className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Location</div><div className="font-semibold text-slate-900">{featured.location}</div></div></div>
													<div className="flex items-start gap-3"><FiClock className="mt-0.5 h-4 w-4 text-slate-400" /><div><div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Current Workload</div><div className="font-semibold text-[#0f51ff]">{featured.workload}</div></div></div>
												</div>
											</div>

											<div className="mt-8 rounded-[22px] bg-[#f8faff] p-4">
												<div className="mb-3 flex items-center justify-between">
													<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Availability Preview</div>
													<button className="text-sm font-bold text-[#0f51ff]" onClick={() => navigate('/scheduling')} type="button">View Full</button>
												</div>
												<div className="grid grid-cols-7 gap-2 text-center text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
													{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
														<div key={`${day}-${index}`} className="space-y-2">
															<div>{day}</div>
															<span className={`mx-auto block h-2 w-2 rounded-full ${featured.weeklyAvailability[index] ? 'bg-[#0f51ff]' : 'bg-slate-300'}`} />
														</div>
													))}
												</div>
											</div>

											<div className="mt-5 flex items-center gap-3">
												<button
													className="flex-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
													disabled={detailBusy}
													onClick={() => setShowDeleteConfirm(true)}
													type="button"
												>
													{isArchiving ? 'Deleting...' : 'Delete account'}
												</button>
												<button
													className="flex-1 rounded-xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
													disabled={!isEditing || detailBusy || isInactiveEmployee}
													onClick={handleSaveChanges}
													type="button"
												>
													{isSaving ? 'Saving...' : 'Save Changes'}
												</button>
											</div>
										</>
									) : (
										<div className="text-sm text-slate-500">{isLoading || isDetailLoading ? 'Loading employee details...' : 'No employee detail is available yet.'}</div>
									)}
								</aside>
							</div>
						</section>
					</div>
				</div>
			</div>
			{showExportModal ? (
				<ExportPickerModal
					title="Export Employee Data"
					subtitle="Choose what to download from the pharmacy workforce directory as a branded printable report."
					options={PROFILE_EXPORT_OPTIONS}
					selectedId={exportType}
					onSelect={setExportType}
					format={exportFormat}
					onFormatChange={setExportFormat}
					dateRange={exportDateRange}
					onDateRangeChange={setExportDateRange}
					dateRangeError={exportDateRangeError}
					previewLines={profileExportPreview}
					disabledOptionIds={disabledProfileExports}
					isExporting={isExporting}
					error={exportError}
					onClose={() => {
						setShowExportModal(false)
						setExportError('')
						setExportDateRangeError('')
					}}
					onExport={handleConfirmExport}
				/>
			) : null}
		</main>
	)
}
