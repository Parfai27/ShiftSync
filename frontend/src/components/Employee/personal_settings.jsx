import { useEffect, useMemo, useState } from 'react'
import {
	FiBell,
	FiCalendar,
	FiClock,
	FiDollarSign,
	FiGrid,
	FiEye,
	FiEyeOff,
	FiLock,
	FiLogOut,
	FiMenu,
	FiSearch,
	FiSettings,
	FiShield,
	FiUser,
	FiX,
} from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession, loadSession, saveSession } from '../../lib/session'
import EmployeeNotificationBell from '../shared/EmployeeNotificationBell'
import EmployeeProfileMenu from '../shared/EmployeeProfileMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

const fallbackSettings = {
	employeeName: 'Employee',
	roleLabel: 'Team Member',
	displayName: 'Employee',
	contactEmail: '',
	profileImageUrl: '',
	availability: [],
	notificationRules: [],
	hideProfile: false,
	quietHoursEnabled: true,
}

export default function PersonalSettings() {
	const navigate = useNavigate()
	const location = useLocation()
	const session = loadSession()
	const [settings, setSettings] = useState(fallbackSettings)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [showPasswordModal, setShowPasswordModal] = useState(false)
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isChangingPassword, setIsChangingPassword] = useState(false)
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [requiresPasswordChange, setRequiresPasswordChange] = useState(Boolean(session?.mustChangePassword || location.state?.firstLogin))

	useEffect(() => {
		let cancelled = false

		async function loadSettings() {
			if (!session?.userId) {
				setError('No employee session found. Please log in again.')
				setIsLoading(false)
				return
			}
			try {
				setError('')
				const data = await apiRequest(`/api/employee/settings/${session.userId}`)
				if (!cancelled) {
					setSettings(data)
				}
			} catch (requestError) {
				if (!cancelled) {
					setError(requestError.message || 'Unable to load your settings.')
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		loadSettings()

		return () => {
			cancelled = true
		}
	}, [session?.userId])

	useEffect(() => {
		if (requiresPasswordChange) {
			setShowPasswordModal(true)
			if (location.state?.message) {
				setSuccess('')
				setError(location.state.message)
			}
		}
	}, [location.state, requiresPasswordChange])

	function updateRule(title, key) {
		setSuccess('')
		setSettings((current) => ({
			...current,
			notificationRules: current.notificationRules.map((rule) => (
				rule.title === title ? { ...rule, [key]: !rule[key] } : rule
			)),
		}))
	}

	function updateAvailability(day) {
		setSuccess('')
		setSettings((current) => ({
			...current,
			availability: current.availability.map((slot) => {
				if (slot.day !== day) {
					return slot
				}
				const nextActive = !slot.active
				return {
					...slot,
					active: nextActive,
					time: nextActive ? (slot.time === 'Off' ? '09:00 - 17:00' : slot.time) : 'Off',
				}
			}),
		}))
	}

	async function saveChanges() {
		if (!session?.userId) {
			setError('No employee session found. Please log in again.')
			return
		}
		try {
			setIsSaving(true)
			setError('')
			setSuccess('')
			const data = await apiRequest(`/api/employee/settings/${session.userId}`, {
				method: 'PUT',
				body: JSON.stringify({
					displayName: settings.displayName,
					profileImageUrl: settings.profileImageUrl,
					availability: settings.availability,
					notificationRules: settings.notificationRules.map((item) => ({
						title: item.title,
						email: item.email,
						push: item.push,
					})),
					hideProfile: settings.hideProfile,
					quietHoursEnabled: settings.quietHoursEnabled,
				}),
			})
			setSettings(data)
			saveSession({
				...session,
				fullName: data.displayName,
				profileImageUrl: data.profileImageUrl,
			})
			setSuccess('Settings saved successfully.')
		} catch (requestError) {
			setError(requestError.message || 'Unable to save settings.')
		} finally {
			setIsSaving(false)
		}
	}

	async function handleChangePassword() {
		if (!session?.userId) {
			setError('No employee session found. Please log in again.')
			return
		}
		if (!currentPassword || !newPassword || !confirmPassword) {
			setError('Please fill in all password fields.')
			return
		}
		if (newPassword.length < 6) {
			setError('New password must be at least 6 characters long.')
			return
		}
		if (newPassword !== confirmPassword) {
			setError('New password and confirmation do not match.')
			return
		}

		try {
			setIsChangingPassword(true)
			setError('')
			setSuccess('')
			await apiRequest('/api/auth/change-password', {
				method: 'POST',
				body: JSON.stringify({
					userId: session.userId,
					currentPassword,
					newPassword,
					confirmPassword,
				}),
			})
			saveSession({
				...session,
				mustChangePassword: false,
			})
			setError('')
			setSuccess('Password changed successfully.')
			setCurrentPassword('')
			setNewPassword('')
			setConfirmPassword('')
			setShowPasswordModal(false)
			setRequiresPasswordChange(false)
			if (session?.mustChangePassword) {
				navigate('/employee-dashboard', { replace: true })
			}
		} catch (requestError) {
			setError(requestError.message || 'Unable to change password.')
		} finally {
			setIsChangingPassword(false)
		}
	}

	function handleLogoutEverywhere() {
		clearSession()
		navigate('/login', { replace: true })
	}

	const normalizedSearch = searchTerm.trim().toLowerCase()
	const visibleAvailability = useMemo(() => {
		return settings.availability.filter((slot) => {
			if (!normalizedSearch) {
				return true
			}
			return [slot.day, slot.time, slot.active ? 'active' : 'off'].join(' ').toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, settings.availability])

	const visibleNotificationRules = useMemo(() => {
		return settings.notificationRules.filter((rule) => {
			if (!normalizedSearch) {
				return true
			}
			return [rule.title, rule.detail, rule.email ? 'email on' : 'email off', rule.push ? 'push on' : 'push off'].join(' ').toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, settings.notificationRules])

	const showProfileSection = !normalizedSearch
		|| [settings.displayName, settings.contactEmail, settings.roleLabel].join(' ').toLowerCase().includes(normalizedSearch)
	const showAvailabilitySection = !normalizedSearch || visibleAvailability.length > 0
	const showNotificationsSection = !normalizedSearch || visibleNotificationRules.length > 0
	const showPrivacySection = !normalizedSearch || ['hide profile privacy visibility', settings.hideProfile ? 'hidden' : 'visible'].join(' ').toLowerCase().includes(normalizedSearch)
	const showSecuritySection = !normalizedSearch || 'change password logout everywhere security'.includes(normalizedSearch)
	const passwordFieldErrors = useMemo(() => {
		const normalized = error.trim().toLowerCase()
		const currentPasswordError = normalized.includes('current password is incorrect')
		const newPasswordError = normalized.includes('new password must be at least 6 characters')
		const confirmPasswordError = normalized.includes('new password and confirmation do not match')
		return {
			currentPassword: currentPasswordError ? error : '',
			newPassword: newPasswordError ? error : '',
			confirmPassword: confirmPasswordError ? error : '',
			general: normalized && !currentPasswordError && !newPasswordError && !confirmPasswordError ? error : '',
		}
	}, [error])

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
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
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-profile"><FiUser className="h-4 w-4" /> My Profile</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
					</nav>

					<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link>
					</div>
				</aside>

				<div className="dashboard-main-offset flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden">
							<button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700" onClick={() => navigate('/employee-dashboard')} type="button"><FiMenu className="h-5 w-5" /></button>
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
								<input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search your settings..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<EmployeeNotificationBell userId={session?.userId} />
								<ThemeToggleButton />
								<EmployeeProfileMenu name={settings.employeeName} profileImageUrl={settings.profileImageUrl} role={settings.roleLabel} />
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section>
							<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Personal Settings</h1>
							<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">Manage your digital identity, notification rules, and availability schedule.</p>

							<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
								{showProfileSection ? <article className="rounded-2xl border border-slate-200/80 bg-white p-4">
									<div className="mb-4 flex items-center justify-between gap-3">
										<div className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiUser className="h-4 w-4 text-[#2444ac]" /> Profile Information</div>
										<button className="rounded-xl bg-[#0f51ff] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white disabled:opacity-60" disabled={isSaving} onClick={saveChanges} type="button">{isSaving ? 'Saving...' : 'Save Changes'}</button>
									</div>
									<div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)]">
										<div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#ff4f7b,#ffb46b)]">
											{settings.profileImageUrl ? <img alt={settings.displayName} className="h-full w-full object-cover" src={settings.profileImageUrl} /> : null}
											<button className="absolute bottom-1 right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#0f51ff] shadow" onClick={() => navigate('/employee-profile')} type="button"><FiSettings className="h-3.5 w-3.5" /></button>
										</div>
										<div className="space-y-3">
											<div>
												<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Display Name</div>
												<input value={settings.displayName} onChange={(event) => setSettings((current) => ({ ...current, displayName: event.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 bg-[#f6f8ff] px-3 text-sm text-slate-700" />
											</div>
											<div>
												<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Contact Email</div>
												<input value={settings.contactEmail} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-[#f6f8ff] px-3 text-sm text-slate-700" />
											</div>
										</div>
									</div>
								</article> : null}

								{showNotificationsSection ? <article className="rounded-2xl border border-slate-200/80 bg-[#eef2ff] p-4">
									<div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiBell className="h-4 w-4 text-[#2444ac]" /> Notifications</div>
									<div className="space-y-3">
										{visibleNotificationRules.map((rule) => (
											<div key={rule.title} className="rounded-xl bg-white px-3 py-3">
												<div className="text-sm font-bold text-slate-900">{rule.title}</div>
												<div className="text-xs text-slate-500">{rule.detail}</div>
												<div className="mt-2 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
													<span>Email</span>
													<button className={`relative h-5 w-9 rounded-full ${rule.email ? 'bg-[#0f51ff]' : 'bg-slate-300'}`} onClick={() => updateRule(rule.title, 'email')} type="button"><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${rule.email ? 'left-4.5' : 'left-0.5'}`} /></button>
													<span>Push</span>
													<button className={`relative h-5 w-9 rounded-full ${rule.push ? 'bg-[#0f51ff]' : 'bg-slate-300'}`} onClick={() => updateRule(rule.title, 'push')} type="button"><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${rule.push ? 'left-4.5' : 'left-0.5'}`} /></button>
												</div>
											</div>
										))}
										{!visibleNotificationRules.length ? <div className="rounded-xl bg-white px-3 py-3 text-xs text-slate-500">No notification rules matched your search.</div> : null}
									</div>
								</article> : null}
							</div>

							<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
								{showAvailabilitySection ? <article className="rounded-2xl border border-slate-200/80 bg-[#eef2ff] p-4">
									<div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiCalendar className="h-4 w-4 text-[#2444ac]" /> Weekly Availability</div>
									<p className="text-sm text-slate-500">Define your preferred working windows to help us match you with the best shifts.</p>
									<div className="mt-4 grid grid-cols-7 gap-2">
										{visibleAvailability.map((slot) => (
											<button key={slot.day} className={`rounded-xl border px-2 py-3 text-center ${slot.active ? 'border-[#b8caff] bg-white' : 'border-slate-200 bg-[#e9eefc]'}`} onClick={() => updateAvailability(slot.day)} type="button">
												<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">{slot.day}</div>
												<div className={`mt-2 text-[11px] font-bold ${slot.active ? 'text-[#0f51ff]' : 'text-slate-400'}`}>{slot.time}</div>
											</button>
										))}
										{!visibleAvailability.length ? <div className="col-span-7 rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-xs font-bold text-slate-500">No availability slots matched your search.</div> : null}
									</div>
									<button className="mt-4 text-sm font-bold text-[#0f51ff]" onClick={saveChanges} type="button">+ Edit Availability</button>
								</article> : null}

								<div className="space-y-5">
									{showPrivacySection ? <article className="rounded-2xl border border-slate-200/80 bg-[#eef2ff] p-4">
										<div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiShield className="h-4 w-4 text-[#2444ac]" /> Privacy & Visibility</div>
										<div className="rounded-xl bg-white px-3 py-3">
											<div className="flex items-center justify-between gap-3">
												<div>
													<div className="text-sm font-bold text-slate-900">Hide Profile</div>
													<div className="text-xs text-slate-500">When enabled, other employees cannot find you in the directory.</div>
												</div>
												<button className={`relative h-6 w-11 rounded-full ${settings.hideProfile ? 'bg-[#0f51ff]' : 'bg-slate-300'}`} onClick={() => setSettings((current) => ({ ...current, hideProfile: !current.hideProfile }))} type="button"><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white ${settings.hideProfile ? 'left-5.5' : 'left-0.5'}`} /></button>
											</div>
										</div>
									</article> : null}

									{showSecuritySection ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
									<button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-[#eef2ff] px-4 py-3 text-sm font-bold text-[#2444ac]" onClick={() => {
										setError('')
										setSuccess('')
										setShowPasswordModal(true)
									}} type="button"><FiLock className="h-4 w-4" /> Change Password</button>
										<button className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600" onClick={handleLogoutEverywhere} type="button"><FiX className="h-4 w-4" /> Logout Everywhere</button>
									</div> : null}
								</div>
							</div>
						</section>
						{!showProfileSection && !showAvailabilitySection && !showNotificationsSection && !showPrivacySection && !showSecuritySection ? <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">No settings content matched your search.</div> : null}
						{settings.notificationRules.length ? null : <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">{isLoading ? 'Loading employee settings...' : 'No settings available.'}</div>}
						{error ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
						{success ? <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
					</div>
				</div>
			</div>
			{showPasswordModal ? (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-xl rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">Change Password</h2>
								<div className="mt-2 text-sm font-semibold text-slate-500">Update your account password securely.</div>
							</div>
							{requiresPasswordChange ? null : <button className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" onClick={() => setShowPasswordModal(false)} type="button">Close</button>}
						</div>
						<div className="mt-5 space-y-4">
							{passwordFieldErrors.general ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{passwordFieldErrors.general}</div> : null}
							<label className="block">
								<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Current Password</div>
								<div className="relative">
									<input
										type={showCurrentPassword ? 'text' : 'password'}
										value={currentPassword}
										onChange={(event) => {
											setCurrentPassword(event.target.value)
											setError('')
										}}
										className="h-11 w-full rounded-md border border-slate-200 bg-[#f8faff] px-4 pr-12 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1051ff] focus:bg-white"
									/>
									<button
										type="button"
										onClick={() => setShowCurrentPassword((current) => !current)}
										className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-slate-500 transition hover:text-[#1051ff]"
										aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
									>
										{showCurrentPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
									</button>
								</div>
								{passwordFieldErrors.currentPassword ? <div className="mt-1 text-xs font-semibold text-rose-600">{passwordFieldErrors.currentPassword}</div> : null}
							</label>
							<label className="block">
								<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">New Password</div>
								<div className="relative">
									<input
										type={showNewPassword ? 'text' : 'password'}
										value={newPassword}
										onChange={(event) => {
											setNewPassword(event.target.value)
											setError('')
										}}
										className="h-11 w-full rounded-md border border-slate-200 bg-[#f8faff] px-4 pr-12 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1051ff] focus:bg-white"
									/>
									<button
										type="button"
										onClick={() => setShowNewPassword((current) => !current)}
										className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-slate-500 transition hover:text-[#1051ff]"
										aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
									>
										{showNewPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
									</button>
								</div>
								{passwordFieldErrors.newPassword ? <div className="mt-1 text-xs font-semibold text-rose-600">{passwordFieldErrors.newPassword}</div> : null}
							</label>
							<label className="block">
								<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Confirm New Password</div>
								<div className="relative">
									<input
										type={showConfirmPassword ? 'text' : 'password'}
										value={confirmPassword}
										onChange={(event) => {
											setConfirmPassword(event.target.value)
											setError('')
										}}
										className="h-11 w-full rounded-md border border-slate-200 bg-[#f8faff] px-4 pr-12 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1051ff] focus:bg-white"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword((current) => !current)}
										className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-slate-500 transition hover:text-[#1051ff]"
										aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
									>
										{showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
									</button>
								</div>
								{passwordFieldErrors.confirmPassword ? <div className="mt-1 text-xs font-semibold text-rose-600">{passwordFieldErrors.confirmPassword}</div> : null}
							</label>
						</div>
						<div className="mt-5 flex flex-wrap justify-end gap-3">
							{requiresPasswordChange ? null : <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700" onClick={() => setShowPasswordModal(false)} type="button">Cancel</button>}
							<button className="rounded-full bg-[#0f51ff] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70" disabled={isChangingPassword} onClick={handleChangePassword} type="button">
								{isChangingPassword ? 'Updating...' : 'Update Password'}
							</button>
						</div>
					</div>
				</div>
			) : null}
		</main>
	)
}
