import { useEffect, useState } from 'react'
import { FiBookOpen, FiCheckCircle, FiCode, FiCpu, FiPlus, FiServer } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import AdminFrame from './AdminFrame.jsx'
import { getAdminIntegrations, updateAdminIntegrationConfig } from '../../lib/adminWorkspace'
import { loadSession } from '../../lib/session'

const fallbackData = {
	metrics: [],
	services: [],
	aiProvider: 'Unavailable',
	aiBaseUrl: '',
	aiModel: 'Fallback mode',
	publicApiEnabled: false,
	auditLoggingEnabled: false,
}

export default function ApiIntegrations() {
	const session = loadSession()
	const navigate = useNavigate()
	const [search, setSearch] = useState('')
	const [data, setData] = useState(fallbackData)
	const [error, setError] = useState('')
	const [actionMessage, setActionMessage] = useState('')
	const [aiBaseUrl, setAiBaseUrl] = useState('')
	const [aiModel, setAiModel] = useState('')
	const [savingConfig, setSavingConfig] = useState(false)

	useEffect(() => {
		let cancelled = false

		async function loadIntegrations() {
			try {
				const response = await getAdminIntegrations()
				if (!cancelled) {
					setData(response)
					setAiBaseUrl(response.aiBaseUrl || '')
					setAiModel(response.aiModel || '')
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load integration details.')
				}
			}
		}

		loadIntegrations()
		return () => {
			cancelled = true
		}
	}, [])

	const query = search.trim().toLowerCase()
	const filteredServices = data.services.filter((service) => {
		if (!query) {
			return true
		}
		return [service.name, service.status, service.detail].join(' ').toLowerCase().includes(query)
	})

	function handleServiceAction(service) {
		if (service.name.includes('Email')) {
			navigate('/admin-settings')
			return
		}
		if (service.name.includes('AI Assistant')) {
			setActionMessage(`Sync is currently using ${data.aiProvider} with model ${data.aiModel}. Review the runtime card for the live provider details.`)
			return
		}
		if (service.name.includes('Audit')) {
			navigate('/admin-auditlogs')
			return
		}
		if (service.name.includes('API')) {
			navigate('/admin-settings')
			return
		}
		setActionMessage(`${service.name} is available and currently marked as ${service.status.toLowerCase()}.`)
	}

	async function handleSaveProviderConfig() {
		setSavingConfig(true)
		setActionMessage('')
		setError('')
		try {
			const response = await updateAdminIntegrationConfig({
				actorUserId: session?.userId ?? null,
				aiBaseUrl,
				aiModel,
			})
			setData(response)
			setAiBaseUrl(response.aiBaseUrl || '')
			setAiModel(response.aiModel || '')
			setActionMessage('AI provider configuration was updated successfully.')
		} catch (saveError) {
			setError(saveError.message || 'Unable to save AI provider configuration.')
		} finally {
			setSavingConfig(false)
		}
	}

	return (
		<AdminFrame
			activeNav="api"
			title="Integrations & API"
			description="Review the live service connections powering ShiftSync, including email delivery, AI assistant access, audit logging, and API exposure."
			searchPlaceholder="Search integration services, models, or platform capabilities..."
			searchValue={search}
			onSearchChange={setSearch}
			headerActions={(
				<>
					<button className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-[#eef2ff] px-4 text-xs font-bold text-[#1f3b9c] transition hover:bg-[#e3eafe]" onClick={() => window.open('/swagger-ui.html', '_blank', 'noopener,noreferrer')} type="button">
						<FiBookOpen className="h-4 w-4" /> Documentation
					</button>
					<button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0f51ff] px-4 text-xs font-bold text-white transition hover:bg-[#0b44de]" onClick={() => setActionMessage('Configure or enable the target provider first, then refresh this page to confirm the live integration status.')} type="button">
						<FiPlus className="h-4 w-4" /> New Integration
					</button>
				</>
			)}
		>
			{error ? (
				<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>
			) : null}
			{actionMessage ? (
				<div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div>
			) : null}

			<div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
				<div className="space-y-5">
					<div className="grid gap-4 sm:grid-cols-2">
						{data.metrics.map((metric) => (
							<article key={metric.label} className="rounded-2xl border border-slate-200/80 bg-white p-5">
								<div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{metric.label}</div>
								<div className="mt-2 text-[36px] font-black leading-none tracking-[-0.06em] text-slate-950">{metric.value}</div>
								<div className="mt-2 text-xs leading-5 text-slate-500">{metric.detail}</div>
							</article>
						))}
					</div>

					<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
						<div className="mb-4 flex items-center gap-2">
							<FiServer className="h-4 w-4 text-[#0f51ff]" />
							<h2 className="text-2xl font-black tracking-[-0.04em] text-slate-900">Connected Services</h2>
						</div>
						<div className="space-y-3">
							{filteredServices.map((service) => (
								<div key={service.name} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-[#f8faff] px-4 py-3">
									<div>
										<div className="font-bold text-slate-900">{service.name}</div>
										<div className="mt-1 text-xs leading-5 text-slate-500">{service.detail}</div>
									</div>
									<div className="flex items-center gap-2">
										<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${service.healthy ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
											{service.status}
										</span>
										<button
											className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#0f51ff] hover:text-[#0f51ff]"
											onClick={() => handleServiceAction(service)}
											type="button"
										>
											Open
										</button>
									</div>
								</div>
							))}
							{filteredServices.length === 0 ? (
								<div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
									No integrations matched the current search.
								</div>
							) : null}
						</div>
					</article>
				</div>

				<div className="space-y-5">
					<article className="rounded-2xl bg-[#0f51ff] p-5 text-white">
						<div className="flex items-center gap-2 text-lg font-black tracking-[-0.03em]">
							<FiCpu className="h-4 w-4" /> Sync Assistant Runtime
						</div>
						<div className="mt-4 space-y-3 text-sm text-blue-100">
							<div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
									<span>Provider</span>
									<button className="font-bold text-white underline-offset-2 hover:underline" onClick={() => setActionMessage(`Live AI provider: ${data.aiProvider}. Model: ${data.aiModel}.`)} type="button">{data.aiProvider}</button>
								</div>
							<div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
								<span>Model</span>
								<span className="font-bold text-white">{data.aiModel}</span>
							</div>
							<div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
								<span>Public API</span>
								<span className="font-bold text-white">{data.publicApiEnabled ? 'Enabled' : 'Restricted'}</span>
							</div>
							<div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
								<span>Audit Logging</span>
								<span className="font-bold text-white">{data.auditLoggingEnabled ? 'Enabled' : 'Disabled'}</span>
							</div>
						</div>
					</article>

					<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
						<div className="mb-4 flex items-center gap-2 text-lg font-black tracking-[-0.03em] text-slate-900">
							<FiServer className="h-4 w-4 text-[#0f51ff]" /> AI Provider Configuration
						</div>
						<div className="space-y-4">
							<label className="block">
								<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Base URL</div>
								<input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#0f51ff]" onChange={(event) => setAiBaseUrl(event.target.value)} value={aiBaseUrl} />
							</label>
							<label className="block">
								<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Model</div>
								<input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#0f51ff]" onChange={(event) => setAiModel(event.target.value)} value={aiModel} />
							</label>
							<p className="text-xs leading-5 text-slate-500">This changes the runtime base URL and model used by Sync. API keys remain environment-managed for security.</p>
							<button className="w-full rounded-xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b44de]" disabled={savingConfig} onClick={handleSaveProviderConfig} type="button">
								{savingConfig ? 'Saving...' : 'Save provider config'}
							</button>
						</div>
					</article>

					<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
						<div className="mb-4 flex items-center gap-2 text-lg font-black tracking-[-0.03em] text-slate-900">
							<FiCode className="h-4 w-4 text-[#0f51ff]" /> Integration Notes
						</div>
						<ul className="space-y-3 text-sm leading-6 text-slate-600">
							<li className="flex items-start gap-2">
								<FiCheckCircle className="mt-1 h-4 w-4 text-emerald-600" />
								<span>Credential mailouts, password resets, weekly shift emails, and reminder emails all depend on SMTP being configured.</span>
							</li>
							<li className="flex items-start gap-2">
								<FiCheckCircle className="mt-1 h-4 w-4 text-emerald-600" />
								<span>The Sync assistant can run in live AI mode when a provider key is present, otherwise it safely falls back to local guidance.</span>
							</li>
							<li className="flex items-start gap-2">
								<FiCheckCircle className="mt-1 h-4 w-4 text-emerald-600" />
								<span>Audit logging and policy enforcement are already integrated into scheduling, approvals, notifications, and account management flows.</span>
							</li>
						</ul>
						<button className="mt-4 w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-[#0f51ff] hover:text-[#0f51ff]" onClick={() => window.open('/swagger-ui.html', '_blank', 'noopener,noreferrer')} type="button">
							Browse API Surface
						</button>
					</article>
				</div>
			</div>
		</AdminFrame>
	)
}
