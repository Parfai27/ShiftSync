import { useEffect, useState } from 'react'
import { FiClock, FiMail, FiSettings, FiShield, FiUsers } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import AdminFrame from './AdminFrame.jsx'
import { getAdminSettingsWorkspace, updateAdminAutomation, updateAdminGeneralSettings } from '../../lib/adminWorkspace'
import { loadSession } from '../../lib/session'

const fallbackData = {
	timezone: 'Africa/Kigali',
	auditLoggingEnabled: false,
	publicApiEnabled: false,
	automations: [],
	administrators: [],
	notificationPolicies: [],
}

function initials(fullName) {
	return fullName
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('')
}

export default function AdminSettings() {
	const navigate = useNavigate()
	const session = loadSession()
	const [search, setSearch] = useState('')
	const [data, setData] = useState(fallbackData)
	const [error, setError] = useState('')
	const [actionMessage, setActionMessage] = useState('')
	const [timezone, setTimezone] = useState('Africa/Kigali')
	const [savingGeneral, setSavingGeneral] = useState(false)
	const [busyAutomationKey, setBusyAutomationKey] = useState(null)
	const [highlightCoreControls, setHighlightCoreControls] = useState(false)

	useEffect(() => {
		let cancelled = false

		async function loadSettings() {
			try {
				const response = await getAdminSettingsWorkspace()
				if (!cancelled) {
					setData(response)
					setTimezone(response.timezone || 'Africa/Kigali')
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load admin settings.')
				}
			}
		}

		loadSettings()
		return () => {
			cancelled = true
		}
	}, [])

	const query = search.trim().toLowerCase()
	const filteredAutomations = data.automations.filter((item) => [item.title, item.description].join(' ').toLowerCase().includes(query))
	const filteredAdministrators = data.administrators.filter((item) => [item.fullName, item.email, item.roleLabel, item.branchLabel].join(' ').toLowerCase().includes(query))
	const filteredPolicies = data.notificationPolicies.filter((item) => [item.title, item.detail].join(' ').toLowerCase().includes(query))

	async function handleSaveGeneral() {
		setSavingGeneral(true)
		setError('')
		setActionMessage('')
		try {
			const response = await updateAdminGeneralSettings({
				actorUserId: session?.userId ?? null,
				timezone,
				auditLoggingEnabled: data.auditLoggingEnabled,
				publicApiEnabled: data.publicApiEnabled,
			})
			setData(response)
			setTimezone(response.timezone || 'Africa/Kigali')
			setActionMessage('Admin settings were updated successfully.')
		} catch (saveError) {
			setError(saveError.message || 'Unable to save admin settings.')
		} finally {
			setSavingGeneral(false)
		}
	}

	const automationKeys = {
		'Audit logging': 'audit-logging',
		'Public API access': 'public-api',
		'Shift swap approvals': 'allow-shift-swaps',
		'Maximum hours enforcement': 'enforce-max-hours',
		'Urgent manager alerts': 'urgent-manager-alerts',
	}

	async function handleToggleAutomation(item) {
		const key = automationKeys[item.title]
		if (!key) {
			return
		}

		setBusyAutomationKey(key)
		setError('')
		setActionMessage('')
		try {
			const response = await updateAdminAutomation({
				actorUserId: session?.userId ?? null,
				key,
				enabled: !item.enabled,
			})
			setData(response)
			setTimezone(response.timezone || 'Africa/Kigali')
			setActionMessage(`${item.title} ${item.enabled ? 'disabled' : 'enabled'}.`)
		} catch (toggleError) {
			setError(toggleError.message || 'Unable to update that automation setting.')
		} finally {
			setBusyAutomationKey(null)
		}
	}

	return (
		<AdminFrame
			activeNav="settings"
			title="System Settings"
			description="Review the live administrative controls that govern audit logging, public API exposure, manager workflows, and staff communications."
			searchPlaceholder="Search settings, automations, administrators, or notification policies..."
			searchValue={search}
			onSearchChange={setSearch}
			headerActions={(
				<button className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-[#eef2ff] px-4 text-xs font-bold text-[#1f3b9c] transition hover:bg-[#e3eafe]" onClick={() => {
					setHighlightCoreControls(true)
					window.scrollTo({ top: 0, behavior: 'smooth' })
					window.setTimeout(() => setHighlightCoreControls(false), 1800)
				}} type="button">
					<FiSettings className="h-4 w-4" /> Review Controls
				</button>
			)}
		>
			{error ? (
				<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>
			) : null}
			{actionMessage ? (
				<div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div>
			) : null}

			<div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
				<div className="space-y-5">
					<article className={`rounded-2xl border bg-white p-5 transition ${highlightCoreControls ? 'border-[#0f51ff] ring-2 ring-[#dbe7ff]' : 'border-slate-200/80'}`}>
						<div className="mb-4 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900">
							<FiShield className="h-4 w-4 text-[#0f51ff]" /> Core Controls
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-xl border border-slate-200/80 bg-[#f8faff] p-4">
								<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Timezone</div>
								<select
									className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#0f51ff]"
									onChange={(event) => setTimezone(event.target.value)}
									value={timezone}
								>
									<option value="Africa/Kigali">Africa/Kigali</option>
									<option value="UTC">UTC</option>
									<option value="Africa/Nairobi">Africa/Nairobi</option>
								</select>
							</div>
							<div className="rounded-xl border border-slate-200/80 bg-[#f8faff] p-4">
								<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Audit Logging</div>
								<div className={`mt-2 text-lg font-black ${data.auditLoggingEnabled ? 'text-emerald-600' : 'text-rose-600'}`}>
									{data.auditLoggingEnabled ? 'Enabled' : 'Disabled'}
								</div>
							</div>
							<div className="rounded-xl border border-slate-200/80 bg-[#f8faff] p-4">
								<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Public API</div>
								<div className={`mt-2 text-lg font-black ${data.publicApiEnabled ? 'text-[#0f51ff]' : 'text-slate-500'}`}>
									{data.publicApiEnabled ? 'Enabled' : 'Restricted'}
								</div>
							</div>
							<div className="rounded-xl border border-slate-200/80 bg-[#f8faff] p-4">
								<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Administrators</div>
								<div className="mt-2 text-lg font-black text-slate-900">{data.administrators.length}</div>
							</div>
						</div>
						<div className="mt-4 flex flex-wrap gap-2">
							<button
								className={`rounded-xl px-4 py-2 text-sm font-bold transition ${data.auditLoggingEnabled ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
								onClick={() => handleToggleAutomation({ title: 'Audit logging', enabled: data.auditLoggingEnabled })}
								type="button"
							>
								{data.auditLoggingEnabled ? 'Disable audit logging' : 'Enable audit logging'}
							</button>
							<button
								className={`rounded-xl px-4 py-2 text-sm font-bold transition ${data.publicApiEnabled ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-[#eef2ff] text-[#1f3b9c] hover:bg-[#e3eafe]'}`}
								onClick={() => handleToggleAutomation({ title: 'Public API access', enabled: data.publicApiEnabled })}
								type="button"
							>
								{data.publicApiEnabled ? 'Restrict public API' : 'Enable public API'}
							</button>
							<button
								className="rounded-xl bg-[#0f51ff] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0b44de]"
								disabled={savingGeneral}
								onClick={handleSaveGeneral}
								type="button"
							>
								{savingGeneral ? 'Saving...' : 'Save general settings'}
							</button>
						</div>
					</article>

					<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
						<div className="mb-4 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900">
							<FiClock className="h-4 w-4 text-[#0f51ff]" /> Workflow Automations
						</div>
						<div className="space-y-3">
							{filteredAutomations.map((item) => {
								const automationKey = automationKeys[item.title]
								return (
								<div key={item.title} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-[#f8faff] px-4 py-3">
									<div>
										<div className="font-bold text-slate-900">{item.title}</div>
										<div className="mt-1 text-xs text-slate-500">{item.description}</div>
									</div>
									<div className="flex items-center gap-2">
										<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${item.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
											{item.enabled ? 'Enabled' : 'Disabled'}
										</span>
										<button
											className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#0f51ff] hover:text-[#0f51ff]"
											disabled={busyAutomationKey === automationKey}
											onClick={() => handleToggleAutomation(item)}
											type="button"
										>
											{busyAutomationKey === automationKey ? 'Saving...' : item.enabled ? 'Disable' : 'Enable'}
										</button>
									</div>
								</div>
								)
							})}
							{filteredAutomations.length === 0 ? (
								<div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
									No workflow automations matched the current search.
								</div>
							) : null}
						</div>
					</article>
				</div>

				<div className="space-y-5">
					<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
						<div className="mb-4 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900">
							<FiUsers className="h-4 w-4 text-[#0f51ff]" /> Administrators
						</div>
						<div className="space-y-3">
							{filteredAdministrators.map((item) => (
								<div key={item.userId} className="flex items-center justify-between gap-3 rounded-xl bg-[#f8faff] px-4 py-3">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7ecff] text-xs font-extrabold text-[#2243ae]">
											{initials(item.fullName)}
										</div>
										<div>
											<div className="font-bold text-slate-900">{item.fullName}</div>
											<div className="text-xs text-slate-500">{item.email}</div>
											<div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{item.branchLabel}</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${item.active ? 'bg-[#e8edff] text-[#2747b3]' : 'bg-slate-200 text-slate-600'}`}>
											{item.active ? item.roleLabel : 'Inactive'}
										</span>
										<button
											className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#0f51ff] hover:text-[#0f51ff]"
											onClick={() => navigate('/admin-user-management')}
											type="button"
										>
											Manage
										</button>
									</div>
								</div>
							))}
							{filteredAdministrators.length === 0 ? (
								<div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
									No administrators matched the current search.
								</div>
							) : null}
						</div>
					</article>

					<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
						<div className="mb-4 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900">
							<FiMail className="h-4 w-4 text-[#0f51ff]" /> Notification Policies
						</div>
						<div className="space-y-3">
							{filteredPolicies.map((item) => (
								<div key={item.title} className="rounded-xl border border-slate-200/80 bg-[#f8faff] px-4 py-3">
									<div className="flex items-center justify-between gap-3">
										<div className="font-bold text-slate-900">{item.title}</div>
										<button
											className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${item.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}
											onClick={() => setActionMessage(`${item.title} is currently ${item.enabled ? 'enabled' : 'disabled'} in the live admin policy view.`)}
											type="button"
										>
											{item.enabled ? 'Enabled' : 'Disabled'}
										</button>
									</div>
									<div className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</div>
								</div>
							))}
							{filteredPolicies.length === 0 ? (
								<div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
									No notification policies matched the current search.
								</div>
							) : null}
						</div>
					</article>
				</div>
			</div>
		</AdminFrame>
	)
}
