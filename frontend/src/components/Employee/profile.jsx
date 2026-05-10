import { useEffect, useMemo, useState } from 'react'
import {
	FiBell,
	FiCalendar,
	FiDollarSign,
	FiEdit2,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiPhone,
	FiRefreshCw,
	FiSave,
	FiSearch,
	FiSettings,
	FiShield,
	FiUpload,
	FiUser,
	FiUserCheck,
	FiUsers,
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession, loadSession, saveSession } from '../../lib/session'
import EmployeeNotificationBell from '../shared/EmployeeNotificationBell'
import EmployeeProfileMenu from '../shared/EmployeeProfileMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

const fallbackProfile = {
	employeeName: 'Employee',
	roleLabel: 'EMPLOYEE',
	fullName: '',
	email: '',
	profileImageUrl: '',
	employeeCode: '',
	jobTitle: '',
	phoneNumber: '',
	hireDate: '',
	hourlyRate: '',
	emergencyContactName: '',
	emergencyContactPhone: '',
	active: true,
	pharmacyLabel: 'Ngabo Pharmacy Team',
}

function EmployeeSidebar() {
	return (
		<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
			<div className="flex w-full items-center justify-start gap-3">
				<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
			</div>

			<nav className="space-y-2 text-[14px] font-medium text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-dashboard"><FiGrid className="h-4 w-4" /> My Overview</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-schedule"><FiCalendar className="h-4 w-4" /> My Schedule</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-announcements"><FiBell className="h-4 w-4" /> Announcements</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
				<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-profile"><FiUser className="h-4 w-4" /> My Profile</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
			</nav>

			<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link>
			</div>
		</aside>
	)
}

function buildInitials(name) {
	return (name || 'Employee')
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase()
}

function normalizeForm(profile) {
	return {
		fullName: profile.fullName || '',
		phoneNumber: profile.phoneNumber || '',
		emergencyContactName: profile.emergencyContactName || '',
		emergencyContactPhone: profile.emergencyContactPhone || '',
		profileImageUrl: profile.profileImageUrl || '',
	}
}

export default function Profile() {
	const navigate = useNavigate()
	const session = loadSession()
	const [profile, setProfile] = useState(fallbackProfile)
	const [form, setForm] = useState(normalizeForm(fallbackProfile))
	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		let cancelled = false

		async function loadProfile() {
			if (!session?.userId) {
				setError('No employee session found. Please log in again.')
				setIsLoading(false)
				return
			}

			try {
				setError('')
				const data = await apiRequest(`/api/employee/profile/${session.userId}`)
				if (!cancelled) {
					setProfile(data)
					setForm(normalizeForm(data))
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load your employee profile.')
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		loadProfile()

		return () => {
			cancelled = true
		}
	}, [session?.userId])

	const normalizedSearch = searchTerm.trim().toLowerCase()

	const visibleSections = useMemo(() => {
		if (!normalizedSearch) {
			return {
				contact: true,
				emergency: true,
				employment: true,
				account: true,
			}
		}

		const contactText = [form.fullName, profile.email, form.phoneNumber, profile.jobTitle].join(' ').toLowerCase()
		const emergencyText = [form.emergencyContactName, form.emergencyContactPhone].join(' ').toLowerCase()
		const employmentText = [profile.employeeCode, profile.hireDate, profile.hourlyRate, profile.pharmacyLabel].join(' ').toLowerCase()
		const accountText = [form.profileImageUrl, profile.roleLabel, profile.active ? 'active' : 'inactive'].join(' ').toLowerCase()

		return {
			contact: contactText.includes(normalizedSearch),
			emergency: emergencyText.includes(normalizedSearch),
			employment: employmentText.includes(normalizedSearch),
			account: accountText.includes(normalizedSearch),
		}
	}, [form, normalizedSearch, profile])

	const hasChanges = useMemo(() => {
		const baseline = normalizeForm(profile)
		return Object.keys(baseline).some((key) => baseline[key] !== form[key])
	}, [form, profile])

	function handleFieldChange(event) {
		const { name, value } = event.target
		setForm((current) => ({ ...current, [name]: value }))
		setSuccessMessage('')
	}

	function handleDiscard() {
		setForm(normalizeForm(profile))
		setError('')
		setSuccessMessage('Unsaved profile changes were cleared.')
	}

	async function handleRefresh() {
		if (!session?.userId) {
			setError('No employee session found. Please log in again.')
			return
		}

		try {
			setError('')
			setSuccessMessage('')
			setIsLoading(true)
			const data = await apiRequest(`/api/employee/profile/${session.userId}`)
			setProfile(data)
			setForm(normalizeForm(data))
		} catch (loadError) {
			setError(loadError.message || 'Unable to refresh your employee profile.')
		} finally {
			setIsLoading(false)
		}
	}

	async function handleSave() {
		if (!session?.userId) {
			setError('No employee session found. Please log in again.')
			return
		}

		try {
			setIsSaving(true)
			setError('')
			setSuccessMessage('')
			const data = await apiRequest(`/api/employee/profile/${session.userId}`, {
				method: 'PUT',
				body: JSON.stringify({
					fullName: form.fullName.trim(),
					phoneNumber: form.phoneNumber.trim(),
					emergencyContactName: form.emergencyContactName.trim(),
					emergencyContactPhone: form.emergencyContactPhone.trim(),
					profileImageUrl: form.profileImageUrl.trim(),
				}),
			})
			setProfile(data)
			setForm(normalizeForm(data))
			saveSession({
				...session,
				fullName: data.fullName,
				profileImageUrl: data.profileImageUrl,
			})
			setSuccessMessage('Your profile changes were saved successfully.')
		} catch (saveError) {
			setError(saveError.message || 'Unable to save your employee profile.')
		} finally {
			setIsSaving(false)
		}
	}

	const displayName = form.fullName || profile.employeeName
	const profileImage = form.profileImageUrl || profile.profileImageUrl
	const initials = buildInitials(displayName)

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
									placeholder="Search contact details, employment info, or emergency contact..."
									className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white"
								/>
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<EmployeeNotificationBell userId={session?.userId} />
								<ThemeToggleButton />
								<EmployeeProfileMenu name={profile.employeeName} profileImageUrl={profileImage} role={profile.roleLabel} />
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
								<div className="flex items-center gap-4 sm:gap-6">
									<div className="relative flex h-31 w-31 items-center justify-center overflow-hidden rounded-3xl border-2 border-white bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] text-4xl font-black text-white shadow-lg">
										{profileImage ? <img alt={displayName} className="h-full w-full object-cover" src={profileImage} /> : initials}
										<span className="absolute bottom-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0f51ff] text-white shadow-md"><FiEdit2 className="h-3.5 w-3.5" /></span>
									</div>

									<div>
										<h1 className="text-4xl font-black tracking-[-0.05em] text-slate-900 sm:text-5xl">{displayName || 'Employee Profile'}</h1>
										<div className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-slate-500"><FiUserCheck className="h-4 w-4 text-[#0f51ff]" /> {profile.jobTitle || profile.roleLabel} • {profile.pharmacyLabel}</div>
										<div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold uppercase tracking-[0.12em]">
											<span className={`rounded-full px-3 py-1.5 ${profile.active ? 'bg-[#e9eeff] text-[#0f51ff]' : 'bg-rose-100 text-rose-600'}`}>{profile.active ? 'Active Employee' : 'Inactive Employee'}</span>
											<span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">Employee ID: {profile.employeeCode || 'Not assigned'}</span>
										</div>
									</div>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<button className="inline-flex items-center gap-2 rounded-xl bg-[#eef2ff] px-4 py-3 text-sm font-bold text-slate-600" onClick={handleRefresh} type="button"><FiRefreshCw className="h-4 w-4" /> Refresh</button>
									<button className="rounded-xl bg-[#e8edff] px-4 py-3 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-60" disabled={!hasChanges || isSaving} onClick={handleDiscard} type="button">Discard</button>
									<button className="inline-flex items-center gap-2 rounded-xl bg-[#0f51ff] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70" disabled={!hasChanges || isSaving} onClick={handleSave} type="button"><FiSave className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}</button>
								</div>
							</div>

							{error ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
							{successMessage ? <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}
						</section>

						<section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
							<div className="space-y-5">
								{visibleSections.contact ? (
									<article className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
										<h2 className="inline-flex items-center gap-2 text-[32px] font-black tracking-[-0.04em] text-slate-900"><FiUser className="h-5 w-5 text-[#0f51ff]" /> Contact Information</h2>

										<div className="mt-5 grid gap-5 sm:grid-cols-2">
											<label>
												<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Full Name</div>
												<input className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-[#0f51ff]" name="fullName" onChange={handleFieldChange} value={form.fullName} />
											</label>
											<div>
												<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Work Email</div>
												<div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-700">{profile.email || 'Not yet recorded'}</div>
											</div>
											<label>
												<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Mobile Phone</div>
												<input className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-[#0f51ff]" name="phoneNumber" onChange={handleFieldChange} placeholder="+250 7XX XXX XXX" value={form.phoneNumber} />
											</label>
											<div>
												<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Role</div>
												<div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-700">{profile.jobTitle || profile.roleLabel}</div>
											</div>
										</div>
									</article>
								) : null}

								{visibleSections.emergency ? (
									<article className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
										<div className="flex items-center justify-between gap-3">
											<h2 className="inline-flex items-center gap-2 text-[32px] font-black tracking-[-0.04em] text-slate-900"><FiUsers className="h-5 w-5 text-[#0f51ff]" /> Emergency Contact</h2>
											<span className="rounded-full bg-[#eef3ff] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0f51ff]">Employee managed</span>
										</div>

										<div className="mt-5 grid gap-5 sm:grid-cols-2">
											<label>
												<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Contact Name</div>
												<input className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-[#0f51ff]" name="emergencyContactName" onChange={handleFieldChange} placeholder="Emergency contact full name" value={form.emergencyContactName} />
											</label>
											<label>
												<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Contact Phone</div>
												<input className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-[#0f51ff]" name="emergencyContactPhone" onChange={handleFieldChange} placeholder="+250 7XX XXX XXX" value={form.emergencyContactPhone} />
											</label>
										</div>
									</article>
								) : null}
							</div>

							<div className="space-y-5">
								{visibleSections.employment ? (
									<article className="rounded-2xl border border-slate-200/80 bg-[#eef2ff] p-5">
										<h2 className="inline-flex items-center gap-2 text-[30px] font-black tracking-[-0.04em] text-slate-900"><FiShield className="h-5 w-5 text-[#0f51ff]" /> Employment Snapshot</h2>
										<div className="mt-4 space-y-2.5">
											<div className="rounded-xl bg-white px-4 py-3">
												<div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Employee Code</div>
												<div className="mt-1 text-sm font-bold text-slate-800">{profile.employeeCode || 'Not yet assigned'}</div>
											</div>
											<div className="rounded-xl bg-white px-4 py-3">
												<div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Hire Date</div>
												<div className="mt-1 text-sm font-bold text-slate-800">{profile.hireDate || 'Not yet recorded'}</div>
											</div>
											<div className="rounded-xl bg-white px-4 py-3">
												<div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Hourly Rate</div>
												<div className="mt-1 text-sm font-bold text-slate-800">{profile.hourlyRate || 'Not yet recorded'}</div>
											</div>
											<div className="rounded-xl bg-white px-4 py-3">
												<div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Pharmacy Team</div>
												<div className="mt-1 text-sm font-bold text-slate-800">{profile.pharmacyLabel || 'Ngabo Pharmacy Team'}</div>
											</div>
										</div>
									</article>
								) : null}

								{visibleSections.account ? (
									<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
										<h2 className="inline-flex items-center gap-2 text-[30px] font-black tracking-[-0.04em] text-slate-900"><FiUpload className="h-5 w-5 text-[#0f51ff]" /> Account Display</h2>
										<div className="mt-4 space-y-4">
											<div className="flex items-center gap-3 rounded-2xl bg-[#f8faff] p-3">
												<div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] text-lg font-black text-white">
													{profileImage ? <img alt={displayName} className="h-full w-full object-cover" src={profileImage} /> : initials}
												</div>
												<div>
													<div className="text-lg font-black text-slate-900">{displayName}</div>
													<div className="text-sm text-slate-500">{profile.roleLabel}</div>
												</div>
											</div>

											<label>
												<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Profile Image URL</div>
												<input className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#0f51ff]" name="profileImageUrl" onChange={handleFieldChange} placeholder="https://example.com/profile.jpg" value={form.profileImageUrl} />
											</label>

											<div className="space-y-3 rounded-2xl border border-slate-200 bg-[#f8faff] p-4">
												<div className="flex items-center justify-between gap-3">
													<div>
														<div className="text-xl font-black text-slate-900">Account Status</div>
														<div className="text-sm text-slate-500">Current access state in ShiftSync.</div>
													</div>
													<span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] ${profile.active ? 'bg-[#e9eeff] text-[#0f51ff]' : 'bg-rose-100 text-rose-600'}`}>{profile.active ? 'Active' : 'Inactive'}</span>
												</div>
												<div className="flex items-center justify-between gap-3">
													<div>
														<div className="text-xl font-black text-slate-900">Notification Access</div>
														<div className="text-sm text-slate-500">Open updates about shifts and payroll anytime.</div>
													</div>
													<button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0f51ff]" onClick={() => navigate('/employee-notifications')} type="button"><FiBell className="h-4 w-4" /> View Inbox</button>
												</div>
												<div className="flex items-center justify-between gap-3">
													<div>
														<div className="text-xl font-black text-slate-900">Security Settings</div>
														<div className="text-sm text-slate-500">Manage preferences and personal settings.</div>
													</div>
													<button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700" onClick={() => navigate('/employee-settings')} type="button"><FiSettings className="h-4 w-4" /> Open Settings</button>
												</div>
											</div>
										</div>
									</article>
								) : null}
							</div>
						</section>

						{!visibleSections.contact && !visibleSections.emergency && !visibleSections.employment && !visibleSections.account ? (
							<div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 text-sm text-slate-500">
								No profile section matched your search.
							</div>
						) : null}

						{isLoading ? (
							<div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 text-sm text-slate-500">
								Loading employee profile...
							</div>
						) : null}
					</div>
				</div>
			</div>
		</main>
	)
}
