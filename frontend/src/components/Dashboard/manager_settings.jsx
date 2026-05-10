import {
	FiBell,
	FiCalendar,
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
	FiZap,
} from 'react-icons/fi'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession } from '../../lib/session'
import { archiveManagerTeam, resolveProfileImage, updateManagerSettings, useManagerWorkspace } from '../../lib/managerWorkspace'
import ManagerProfileMenu from '../shared/ManagerProfileMenu'
import MobileManagerMenu from '../shared/MobileManagerMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SHIFT_SWAP_MODES = ['Manual Review', 'Manager Approval', 'Auto Approve']
const CURRENCY_OPTIONS = ['RWF - Rwanda', 'USD - English', 'EUR - English']

function buildFormState(settings) {
	return {
		showSalaries: settings.visibilityRules[0]?.enabled ?? false,
		showPhoneNumbers: settings.visibilityRules[1]?.enabled ?? true,
		publicProfiles: settings.visibilityRules[2]?.enabled ?? true,
		autoSchedulingEnabled: settings.workflowRules[2]?.badge === 'Enabled',
		shiftSwapApprovalMode: settings.workflowRules[0]?.badge || 'Manual Review',
		workWeekStartDay: settings.workWeekStartDay || 'Monday',
		overtimeThresholdHours: String(settings.overtimeThreshold || '40').replace(' Hours / Week', ''),
		currencyLocalization: settings.currencyLocalization || 'RWF - Rwanda',
		departmentName: settings.departmentName || 'Operations & Dispensing',
	}
}

export default function ManagerSettings() {
	const navigate = useNavigate()
	const { manager, workspace, error, reloadWorkspace } = useManagerWorkspace()
	const profileImage = resolveProfileImage(manager?.profileImageUrl, manager?.fullName)
	const settings = workspace.settings
	const [searchTerm, setSearchTerm] = useState('')
	const [formState, setFormState] = useState(() => buildFormState(settings))
	const [actionError, setActionError] = useState('')
	const [actionMessage, setActionMessage] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const [isArchiving, setIsArchiving] = useState(false)
	const [activeAction, setActiveAction] = useState('')
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	useEffect(() => {
		setFormState(buildFormState(settings))
	}, [settings])

	const normalizedSearch = searchTerm.trim().toLowerCase()

	const visibleVisibilityRules = useMemo(() => {
		const rules = [
			{
				key: 'showSalaries',
				label: 'Show Salaries',
				detail: 'Only payroll-approved managers can view pay rates on shared schedules.',
			},
			{
				key: 'showPhoneNumbers',
				label: 'Phone Numbers',
				detail: 'Managers and licensed pharmacy staff can view verified emergency contacts.',
			},
			{
				key: 'publicProfiles',
				label: 'Public Profiles',
				detail: 'Qualifications and service roles are visible across the pharmacy team.',
			},
		]

		return rules.filter((rule) => !normalizedSearch || [rule.label, rule.detail].join(' ').toLowerCase().includes(normalizedSearch))
	}, [normalizedSearch])

	const visibleWorkflowRules = useMemo(() => {
		const rules = [
			{
				key: 'shift-swaps',
				title: 'Shift Swaps',
				badge: formState.shiftSwapApprovalMode,
				detail: 'Managers verify all peer-to-peer shift exchanges before approval.',
				actionLabel: 'Configure Rules',
			},
			{
				key: 'overtime-alerts',
				title: 'Overtime Alerts',
				badge: `Threshold: ${formState.overtimeThresholdHours || '0'}h`,
				detail: 'Receive immediate alerts when a staff member exceeds the weekly cap.',
				actionLabel: null,
			},
			{
				key: 'auto-scheduling',
				title: 'Auto-Scheduling Trigger',
				badge: formState.autoSchedulingEnabled ? 'Enabled' : 'Disabled',
				detail: formState.autoSchedulingEnabled
					? 'Automatic schedule generation can be triggered from the manager queue.'
					: 'Managers will trigger scheduling manually until this is enabled.',
				actionLabel: formState.autoSchedulingEnabled ? 'Disable Trigger' : 'Enable Trigger',
			},
		]

		return rules.filter((rule) => !normalizedSearch || [rule.title, rule.badge, rule.detail].join(' ').toLowerCase().includes(normalizedSearch))
	}, [formState.autoSchedulingEnabled, formState.overtimeThresholdHours, formState.shiftSwapApprovalMode, normalizedSearch])

	function setField(field, value) {
		setFormState((current) => ({
			...current,
			[field]: value,
		}))
	}

	function cycleValue(currentValue, options) {
		const currentIndex = options.indexOf(currentValue)
		return options[(currentIndex + 1) % options.length]
	}

	function resetForm() {
		setFormState(buildFormState(settings))
		setActionError('')
		setActionMessage('Settings reverted to the last saved values.')
		window.setTimeout(() => setActionMessage(''), 2000)
	}

async function handleSaveChanges() {
		const overtimeThresholdHours = Number.parseInt(formState.overtimeThresholdHours, 10)
		if (!Number.isFinite(overtimeThresholdHours) || overtimeThresholdHours < 1) {
			setActionError('Overtime threshold must be a valid number greater than zero.')
			return
		}
		if (overtimeThresholdHours > 168) {
			setActionError('Overtime threshold cannot be more than 168 hours in one week.')
			return
		}

		if (!formState.departmentName.trim()) {
			setActionError('Department focus cannot be empty.')
			return
		}
		if (formState.departmentName.trim().length < 3) {
			setActionError('Department focus must be at least 3 characters long.')
			return
		}

		try {
			setActionError('')
			setActionMessage('')
			setIsSaving(true)
			await updateManagerSettings({
				managerId: manager.userId,
				showSalaries: formState.showSalaries,
				showPhoneNumbers: formState.showPhoneNumbers,
				publicProfiles: formState.publicProfiles,
				autoSchedulingEnabled: formState.autoSchedulingEnabled,
				shiftSwapApprovalMode: formState.shiftSwapApprovalMode,
				workWeekStartDay: formState.workWeekStartDay,
				overtimeThresholdHours,
				currencyLocalization: formState.currencyLocalization,
				departmentName: formState.departmentName.trim(),
			})
			await reloadWorkspace()
			setActionMessage('Pharmacy settings saved successfully.')
			window.setTimeout(() => setActionMessage(''), 2500)
		} catch (saveError) {
			setActionError(saveError.message || 'Unable to save settings.')
		} finally {
			setIsSaving(false)
		}
	}

	async function handleCreateShift() {
		try {
			setActionError('')
			setActionMessage('')
			setActiveAction('create-shift')
			await apiRequest('/api/scheduling/manager/create-shift', {
				method: 'POST',
				body: JSON.stringify({ managerId: manager.userId }),
			})
			await reloadWorkspace()
			setActionMessage('A weekly shift schedule was created successfully.')
			window.setTimeout(() => setActionMessage(''), 2500)
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to create weekly shifts.')
		} finally {
			setActiveAction('')
		}
	}

	async function handleArchiveTeam() {
		const shouldArchive = window.confirm('Archive all active employee accounts in this pharmacy team?')
		if (!shouldArchive) {
			return
		}

		try {
			setActionError('')
			setActionMessage('')
			setIsArchiving(true)
			await archiveManagerTeam({ managerId: manager.userId })
			await reloadWorkspace()
			setActionMessage('The active pharmacy team was archived.')
			window.setTimeout(() => setActionMessage(''), 3000)
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to archive the team.')
		} finally {
			setIsArchiving(false)
		}
	}

	function runWorkflowAction(ruleKey) {
		if (ruleKey === 'shift-swaps') {
			setField('shiftSwapApprovalMode', cycleValue(formState.shiftSwapApprovalMode, SHIFT_SWAP_MODES))
			return
		}

		if (ruleKey === 'auto-scheduling') {
			setField('autoSchedulingEnabled', !formState.autoSchedulingEnabled)
		}
	}

	const hasSettingsMatch =
		!normalizedSearch ||
		['manager settings', settings.summary, formState.departmentName, formState.currencyLocalization, formState.workWeekStartDay]
			.join(' ')
			.toLowerCase()
			.includes(normalizedSearch)

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<MobileManagerMenu
				activePath="/manager-settings"
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				onPrimaryAction={handleCreateShift}
				primaryActionDisabled={activeAction === 'create-shift'}
				primaryActionLabel={activeAction === 'create-shift' ? 'Creating Weekly Shifts...' : 'Create Weekly Shifts'}
			/>
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
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de] disabled:cursor-not-allowed disabled:opacity-60" disabled={activeAction === 'create-shift'} onClick={handleCreateShift} type="button"><FiPlus className="h-4 w-4" /> {activeAction === 'create-shift' ? 'Creating Weekly Shifts...' : 'Create Weekly Shifts'}</button>
						<div className="space-y-1 text-sm text-slate-600"><Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/manager-settings"><FiSettings className="h-4 w-4" /> Settings</Link><Link className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link></div>
					</div>
				</aside>

				<div className="dashboard-main-offset flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden"><button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700" onClick={() => setIsMobileMenuOpen(true)} type="button"><FiMenu className="h-5 w-5" /></button><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f51ff] text-xs font-black text-white">S</span><div className="min-w-0"><div className="truncate text-sm font-extrabold text-slate-900">ShiftSync</div><div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Workforce Management</div></div></div></div>
						<div className="mt-4 flex flex-col gap-4 xl:mt-0 xl:flex-row xl:items-center xl:justify-between">
							<label className="relative w-full max-w-3xl"><FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search settings, rules, or preferences..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" /></label>
							<div className="flex items-center justify-between gap-3 xl:justify-end"><button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500" onClick={() => navigate('/notifications')} type="button"><FiBell className="h-4 w-4" /></button><ThemeToggleButton /><ManagerProfileMenu name={manager.fullName} profileImageUrl={profileImage} role={manager.roleLabel} /></div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section>
							<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Manager Settings</h1>
							<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">{settings.summary || 'Loading manager settings...'}</p>
							{error ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
							{actionError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div> : null}
							{actionMessage ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div> : null}

							{hasSettingsMatch ? (
								<>
									<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(240px,0.75fr)]">
										<article className="rounded-2xl border border-slate-200/80 bg-white p-4"><div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiUsers className="h-4 w-4 text-[#2444ac]" /> Team Visibility</div><div className="space-y-3">{visibleVisibilityRules.map((rule) => <div key={rule.key} className="flex items-center justify-between gap-3 rounded-xl bg-[#f8faff] px-3 py-3"><div><div className="text-sm font-bold text-slate-900">{rule.label}</div><div className="text-xs text-slate-500">{rule.detail}</div></div><button className={`relative h-6 w-11 rounded-full transition ${formState[rule.key] ? 'bg-[#0f51ff]' : 'bg-slate-300'}`} aria-label={`${rule.label} toggle`} onClick={() => setField(rule.key, !formState[rule.key])} type="button"><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${formState[rule.key] ? 'left-5.5' : 'left-0.5'}`} /></button></div>)}{!visibleVisibilityRules.length ? <div className="rounded-xl bg-[#f8faff] px-3 py-4 text-sm text-slate-500">No visibility rules matched your search.</div> : null}</div></article>
										<article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-[linear-gradient(145deg,#021022_0%,#0f2d4e_50%,#091a34_100%)] p-0 text-white"><div className="h-full p-5"><div className="mx-auto mt-3 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-2xl font-black ring-1 ring-white/20">{manager.fullName?.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div className="mt-20 text-center text-xs font-extrabold uppercase tracking-[0.14em] text-blue-100">Ngabo Pharmacy</div><div className="mt-1 text-center text-xl font-black tracking-[-0.04em]">Department: {formState.departmentName}</div></div></article>
									</div>

									<div className="mt-5 grid gap-5 xl:grid-cols-2">
										<article className="rounded-2xl border border-slate-200/80 bg-white p-4"><div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiZap className="h-4 w-4 text-[#2444ac]" /> Workflow Approvals</div><div className="space-y-3">{visibleWorkflowRules.map((rule) => <div key={rule.key} className="rounded-xl border border-slate-200/80 bg-[#f8faff] p-3"><div className="flex items-center justify-between gap-3"><div className="text-sm font-bold text-slate-900">{rule.title}</div><span className="rounded-full bg-[#e8edff] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2444ac]">{rule.badge}</span></div><div className="mt-1 text-xs text-slate-500">{rule.detail}</div>{rule.actionLabel ? <button className="mt-2 text-xs font-bold text-[#0f51ff]" onClick={() => runWorkflowAction(rule.key)} type="button">{rule.actionLabel}</button> : null}</div>)}<button className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-[#0f51ff] hover:text-[#0f51ff]" onClick={() => setField('autoSchedulingEnabled', true)} type="button">+ Add Auto-Scheduling Trigger</button></div></article>
										<article className="rounded-2xl border border-slate-200/80 bg-white p-4"><div className="mb-3 flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiSettings className="h-4 w-4 text-[#ea7a4b]" /> Pharmacy Settings</div><div className="space-y-3"><div><div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Department Focus</div><input value={formState.departmentName} onChange={(event) => setField('departmentName', event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-[#f8faff] px-3 text-sm text-slate-700 outline-none focus:border-[#0f51ff] focus:bg-white" /></div><div><div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Work Week Start Day</div><button className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-[#f8faff] px-3 text-sm text-slate-700" onClick={() => setField('workWeekStartDay', cycleValue(formState.workWeekStartDay, WEEK_DAYS))} type="button"><span>{formState.workWeekStartDay}</span><FiChevronDown className="h-4 w-4 text-slate-400" /></button></div><div><div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Overtime (OT) Threshold</div><div className="flex items-center gap-2"><input value={formState.overtimeThresholdHours} onChange={(event) => setField('overtimeThresholdHours', event.target.value.replace(/[^\d]/g, ''))} className="h-10 w-20 rounded-lg border border-slate-200 bg-[#f8faff] px-3 text-sm outline-none focus:border-[#0f51ff] focus:bg-white" /><span className="text-sm font-semibold text-slate-600">Hours / Week</span></div></div><div><div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Currency & Localization</div><button className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-[#f8faff] px-3 text-sm text-slate-700" onClick={() => setField('currencyLocalization', cycleValue(formState.currencyLocalization, CURRENCY_OPTIONS))} type="button"><span>{formState.currencyLocalization}</span><FiSettings className="h-4 w-4 text-slate-400" /></button></div><div className="flex items-center gap-2 pt-1"><button className="flex-1 rounded-lg bg-[#eef2ff] px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2444ac]" onClick={resetForm} type="button">Reset</button><button className="flex-1 rounded-lg bg-[#0f51ff] px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} onClick={handleSaveChanges} type="button">{isSaving ? 'Saving...' : 'Save Changes'}</button></div></div></article>
									</div>

									<div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-lg font-black tracking-[-0.03em] text-rose-700">Danger Zone</div><div className="text-sm text-rose-600">Archiving this pharmacy team will disable all current employee accounts until they are restored manually.</div></div><button className="rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60" disabled={isArchiving} onClick={handleArchiveTeam} type="button">{isArchiving ? 'Archiving...' : 'Archive Team'}</button></div></div>
								</>
							) : <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white px-4 py-6 text-sm text-slate-500">No settings matched your search.</div>}
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
