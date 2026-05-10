import {
	FiAlertTriangle,
	FiBell,
	FiCalendar,
	FiCheckCircle,
	FiChevronDown,
	FiClock,
	FiFilter,
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
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession } from '../../lib/session'
import { resolveProfileImage, useManagerWorkspace } from '../../lib/managerWorkspace'
import ManagerProfileMenu from '../shared/ManagerProfileMenu'
import MobileManagerMenu from '../shared/MobileManagerMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

function Metric({ label, value, subtext }) {
	return (
		<div className="rounded-2xl border border-white/80 bg-white p-4">
			<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{label}</div>
			<div className="mt-2 flex items-end gap-2">
				<div className="text-3xl font-black tracking-[-0.06em] text-slate-950">{value}</div>
				{subtext ? <div className="pb-1 text-xs font-semibold text-[#0f51ff]">{subtext}</div> : null}
			</div>
		</div>
	)
}

function PolicyCard({ item, onToggleStatus, onViewDetails, pendingPolicyId }) {
	const busy = pendingPolicyId === item.id

	return (
		<article className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
			<div className="flex items-start justify-between gap-3">
				<div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}><FiClock className="h-5 w-5" /></div>
				<span className="rounded-full bg-[#eef3ff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0f51ff]">{item.badge}</span>
			</div>
			<h3 className="mt-4 text-xl font-black tracking-[-0.04em] text-slate-950">{item.title}</h3>
			<p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{item.category}</p>
			<p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
			{item.progressLabel ? <div className="mt-6 space-y-3"><div className="flex items-center justify-between gap-3 text-sm text-slate-700"><span className="font-semibold">{item.progressLabel}</span><span className="font-bold text-slate-900">{item.progressValue}</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${item.progressTone}`} style={{ width: item.progressWidth }} /></div></div> : null}
			<div className="mt-6 flex flex-wrap gap-3">
				<button className="rounded-xl bg-[#eef3ff] px-4 py-2.5 text-sm font-bold text-[#0f51ff]" onClick={() => onViewDetails(item)} type="button">View Details</button>
				<button className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={busy} onClick={() => onToggleStatus(item)} type="button">
					{busy ? 'Updating...' : item.active ? 'Pause Policy' : 'Activate Policy'}
				</button>
			</div>
		</article>
	)
}

function ActivityRow({ item, onView }) {
	return (
		<div className="grid gap-3 rounded-2xl bg-white px-4 py-4 md:grid-cols-[auto_110px_1fr_auto_auto] md:items-center md:px-5">
			<div className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
			<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{item.time}</div>
			<div><div className="font-bold text-slate-900">{item.label}</div><div className="text-sm text-slate-500">{item.detail}</div></div>
			{item.tag ? <span className="justify-self-start rounded-full bg-[#eef3ff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0f51ff] md:justify-self-end">{item.tag}</span> : <span className="hidden md:block" />}
			<button className="rounded-xl bg-[#f1f4ff] px-3 py-2 text-sm font-bold text-slate-700" onClick={() => onView(item)} type="button">{item.action || 'View Change'}</button>
		</div>
	)
}

const emptyPolicyForm = {
	title: '',
	description: '',
	category: 'Scheduling',
}

const POLICY_CATEGORIES = ['Scheduling', 'Compliance', 'Operations']

export default function Compliances() {
	const navigate = useNavigate()
	const { manager, workspace, isLoading, error, reloadWorkspace } = useManagerWorkspace()
	const profileImage = resolveProfileImage(manager?.profileImageUrl, manager?.fullName)
	const compliance = workspace.compliance
	const [searchTerm, setSearchTerm] = useState('')
	const [actionError, setActionError] = useState('')
	const [actionMessage, setActionMessage] = useState('')
	const [policyFilter, setPolicyFilter] = useState('ALL')
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [policyForm, setPolicyForm] = useState(emptyPolicyForm)
	const [creatingPolicy, setCreatingPolicy] = useState(false)
	const [pendingPolicyId, setPendingPolicyId] = useState(null)
	const [showAllActivity, setShowAllActivity] = useState(false)
	const [selectedPolicy, setSelectedPolicy] = useState(null)
	const [selectedActivity, setSelectedActivity] = useState(null)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const normalizedSearch = searchTerm.trim().toLowerCase()
	const visiblePolicies = useMemo(() => {
		return compliance.policies.filter((item) => {
			const matchesSearch = !normalizedSearch || [item.title, item.description, item.category, item.badge].join(' ').toLowerCase().includes(normalizedSearch)
			const matchesFilter = policyFilter === 'ALL' || (policyFilter === 'ACTIVE' ? item.active : !item.active)
			return matchesSearch && matchesFilter
		})
	}, [compliance.policies, normalizedSearch, policyFilter])

	const visibleActivity = useMemo(() => {
		const list = compliance.activity.filter((item) => {
			return !normalizedSearch || [item.label, item.detail, item.tag || '', item.time].join(' ').toLowerCase().includes(normalizedSearch)
		})
		return showAllActivity ? list : list.slice(0, 5)
	}, [compliance.activity, normalizedSearch, showAllActivity])

	function validatePolicyForm() {
		if (!policyForm.title.trim()) {
			return 'Policy title is required.'
		}
		if (policyForm.title.trim().length < 4) {
			return 'Policy title must be at least 4 characters long.'
		}
		if (!policyForm.description.trim()) {
			return 'Policy description is required.'
		}
		if (policyForm.description.trim().length < 12) {
			return 'Policy description must be at least 12 characters long.'
		}
		if (!POLICY_CATEGORIES.includes(policyForm.category)) {
			return 'Choose a valid policy category.'
		}
		return ''
	}

	async function handleCreatePolicy() {
		const validationMessage = validatePolicyForm()
		if (validationMessage) {
			setActionError(validationMessage)
			setActionMessage('')
			return
		}

		try {
			setCreatingPolicy(true)
			setActionError('')
			setActionMessage('')
			await apiRequest('/api/manager/policies', {
				method: 'POST',
				body: JSON.stringify({
					managerId: manager.userId,
					title: policyForm.title.trim(),
					description: policyForm.description.trim(),
					category: policyForm.category,
					active: true,
				}),
			})
			await reloadWorkspace()
			setPolicyForm(emptyPolicyForm)
			setShowCreateForm(false)
			setActionMessage('Compliance policy created successfully.')
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to create compliance policy.')
		} finally {
			setCreatingPolicy(false)
		}
	}

	async function handleTogglePolicy(item) {
		try {
			setPendingPolicyId(item.id)
			setActionError('')
			setActionMessage('')
			await apiRequest(`/api/manager/policies/${item.id}`, {
				method: 'PATCH',
				body: JSON.stringify({
					managerId: manager.userId,
					active: !item.active,
				}),
			})
			await reloadWorkspace()
			setActionMessage(item.active ? 'Policy paused successfully.' : 'Policy activated successfully.')
			setSelectedPolicy((current) => (current && current.id === item.id ? { ...current, active: !current.active, badge: !current.active ? 'ACTIVE MONITORING' : 'INACTIVE', progressValue: !current.active ? 'Enabled' : 'Paused' } : current))
		} catch (requestError) {
			setActionError(requestError.message || 'Unable to update policy status.')
		} finally {
			setPendingPolicyId(null)
		}
	}

	function cyclePolicyFilter() {
		setPolicyFilter((current) => {
			if (current === 'ALL') return 'ACTIVE'
			if (current === 'ACTIVE') return 'INACTIVE'
			return 'ALL'
		})
	}

	const criticalPolicies = compliance.policies.filter((item) => !item.active)

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<MobileManagerMenu
				activePath="/compliances"
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				onPrimaryAction={() => setShowCreateForm((current) => !current)}
				primaryActionLabel="Create Policy"
			/>
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="flex w-full shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:fixed xl:left-0 xl:top-0 xl:h-screen" style={{ width: '264px', maxWidth: '264px' }}>
					<div className="flex w-full items-center justify-start gap-3"><img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" /></div>
					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/overview"><FiHome className="h-4 w-4" /> Dashboard Overview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/profiles"><FiUsers className="h-4 w-4" /> Employee Profiles</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/scheduling"><FiCalendar className="h-4 w-4" /> Shift Scheduling</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/adjustments"><FiSliders className="h-4 w-4" /> Shift Adjustments</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>
					<div className="mt-auto space-y-3 pt-8">
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]" onClick={() => setShowCreateForm((current) => !current)} type="button"><FiPlus className="h-4 w-4" /> Create Policy</button>
						<div className="space-y-1 text-sm text-slate-600">
							<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/manager-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
							<Link className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link>
						</div>
					</div>
				</aside>

				<div className="dashboard-main-offset flex min-h-0 flex-1 flex-col h-screen overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden"><button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700" onClick={() => setIsMobileMenuOpen(true)} type="button"><FiMenu className="h-5 w-5" /></button><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f51ff] text-xs font-black text-white">S</span><div className="min-w-0"><div className="truncate text-sm font-extrabold text-slate-900">ShiftSync</div><div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Workforce Management</div></div></div></div>
						<div className="mt-4 flex flex-col gap-4 xl:mt-0 xl:flex-row xl:items-center xl:justify-between">
							<label className="relative w-full max-w-3xl"><FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search policies, violations, or audit notes..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" /></label>
							<div className="flex items-center justify-between gap-3 xl:justify-end"><button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500" onClick={() => navigate('/notifications')} type="button"><FiBell className="h-4 w-4" /></button><ThemeToggleButton /><ManagerProfileMenu name={manager.fullName} profileImageUrl={profileImage} role={manager.roleLabel} /></div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="space-y-6">
							<div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
								<div><h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Compliance & Policies</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">{compliance.summary || 'Loading compliance data...'}</p></div>
								<div className="flex flex-wrap gap-3"><button className="rounded-xl bg-[#e8edff] px-4 py-2.5 text-sm font-bold text-slate-700" onClick={() => setShowAllActivity(true)} type="button">Full Audit Log</button><button className="rounded-xl bg-[#dce6ff] px-4 py-2.5 text-sm font-bold text-[#0f51ff]" onClick={() => navigate('/manager-settings')} type="button">Policy Settings</button></div>
							</div>
							{error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
							{actionError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div> : null}
							{actionMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div> : null}

							{showCreateForm ? (
								<div className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
									<h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Create Compliance Policy</h2>
									<div className="mt-5 grid gap-4 md:grid-cols-2">
										<input className="rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm outline-none focus:border-[#0f51ff]" placeholder="Policy title" value={policyForm.title} onChange={(event) => setPolicyForm((current) => ({ ...current, title: event.target.value }))} />
										<select className="rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm outline-none focus:border-[#0f51ff]" value={policyForm.category} onChange={(event) => setPolicyForm((current) => ({ ...current, category: event.target.value }))}>
											{POLICY_CATEGORIES.map((category) => (
												<option key={category} value={category}>{category}</option>
											))}
										</select>
										<textarea className="md:col-span-2 rounded-2xl border border-slate-200 bg-[#f8faff] px-4 py-3 text-sm outline-none focus:border-[#0f51ff]" rows="4" placeholder="Policy description" value={policyForm.description} onChange={(event) => setPolicyForm((current) => ({ ...current, description: event.target.value }))} />
									</div>
									<div className="mt-4 flex gap-3">
										<button className="rounded-xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={creatingPolicy || !policyForm.title.trim() || !policyForm.description.trim()} onClick={handleCreatePolicy} type="button">{creatingPolicy ? 'Creating...' : 'Create Policy'}</button>
										<button className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700" onClick={() => setShowCreateForm(false)} type="button">Cancel</button>
									</div>
								</div>
							) : null}

							<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px_240px]">
								<article className="rounded-[26px] border border-rose-200/70 bg-[#fff1f2] p-5 sm:p-6 xl:col-span-1">
									<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
										<div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d92d20] text-white"><FiAlertTriangle className="h-5 w-5" /></div><div><h2 className="text-xl font-black tracking-[-0.04em] text-[#d92d20] sm:text-2xl">{compliance.alert?.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#b63a3f]">{compliance.alert?.description}</p></div></div>
										<span className="rounded-full bg-[#d92d20] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">{compliance.alert?.severity}</span>
									</div>
									<div className="mt-5 flex flex-wrap gap-3"><button className="rounded-xl bg-[#d92d20] px-4 py-2.5 text-sm font-extrabold text-white" onClick={() => setPolicyFilter('INACTIVE')} type="button">Address Now</button><button className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#d92d20]" onClick={() => setSelectedPolicy(criticalPolicies[0] || null)} type="button">View Details</button></div>
								</article>
								<Metric label="Active Policies" value={compliance.activePolicies} subtext="+ Live" />
								<Metric label="Compliance Rate" value={compliance.complianceRate} subtext="Stable" />
							</div>
							<div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Standard Labor Rules</h2><button className="flex items-center gap-3 text-slate-500" onClick={cyclePolicyFilter} type="button"><FiFilter className="h-4 w-4" /><span className="text-sm font-bold">{policyFilter}</span></button></div>
							<div className="grid gap-5 lg:grid-cols-3">{visiblePolicies.map((item) => <PolicyCard key={item.id} item={item} onToggleStatus={handleTogglePolicy} onViewDetails={setSelectedPolicy} pendingPolicyId={pendingPolicyId} />)}</div>
							{!visiblePolicies.length && !isLoading ? <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-500">{normalizedSearch || policyFilter !== 'ALL' ? 'No compliance policies matched the current filters.' : 'No compliance policies are currently available.'}</div> : null}
							<article className="rounded-[26px] border border-slate-200/80 bg-[#eef3ff] p-5 sm:p-6">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Recent Compliance Activity</h2><p className="mt-1 text-sm text-slate-500">Reviewing system-flagged events from the live audit stream.</p></div><button className="text-sm font-bold text-[#0f51ff]" onClick={() => setShowAllActivity((current) => !current)} type="button">{showAllActivity ? 'Show Less' : 'Full Audit Log →'}</button></div>
								<div className="mt-5 space-y-3">{visibleActivity.map((item, index) => <ActivityRow key={`${item.label}-${index}`} item={item} onView={setSelectedActivity} />)}</div>
							</article>
						</section>
					</div>
				</div>
			</div>

			{selectedPolicy ? (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-2xl rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-4">
							<div>
								<div className="inline-flex rounded-full bg-[#eef3ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f51ff]">{selectedPolicy.category}</div>
								<h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950">{selectedPolicy.title}</h2>
							</div>
							<button className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" onClick={() => setSelectedPolicy(null)} type="button">Close</button>
						</div>
						<p className="mt-5 rounded-2xl bg-[#f8faff] p-5 text-sm leading-7 text-slate-700">{selectedPolicy.description}</p>
						<div className="mt-5 flex gap-3">
							<button className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700" disabled={pendingPolicyId === selectedPolicy.id} onClick={() => handleTogglePolicy(selectedPolicy)} type="button">{selectedPolicy.active ? 'Pause Policy' : 'Activate Policy'}</button>
						</div>
					</div>
				</div>
			) : null}

			{selectedActivity ? (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-xl rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">{selectedActivity.label}</h2>
								<div className="mt-2 text-sm font-semibold text-slate-500">{selectedActivity.time}</div>
							</div>
							<button className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" onClick={() => setSelectedActivity(null)} type="button">Close</button>
						</div>
						<p className="mt-5 rounded-2xl bg-[#f8faff] p-5 text-sm leading-7 text-slate-700">{selectedActivity.detail}</p>
					</div>
				</div>
			) : null}
		</main>
	)
}
