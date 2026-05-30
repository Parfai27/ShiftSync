import { useEffect, useMemo, useState } from 'react'
import { FiAlertTriangle, FiDownload, FiShield } from 'react-icons/fi'
import AdminFrame from './AdminFrame.jsx'
import { getAdminAuditLogsWorkspace } from '../../lib/adminWorkspace'
import { downloadCsv } from '../../lib/export'

const fallbackData = {
	totalLogs: 0,
	securityEvents: 0,
	complianceEvents: 0,
	modules: [],
	logs: [],
}

export default function AuditLogs() {
	const [search, setSearch] = useState('')
	const [moduleFilter, setModuleFilter] = useState('All Activity')
	const [data, setData] = useState(fallbackData)
	const [error, setError] = useState('')

	useEffect(() => {
		let cancelled = false

		async function loadLogs() {
			try {
				const response = await getAdminAuditLogsWorkspace()
				if (!cancelled) {
					setData(response)
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load audit logs.')
				}
			}
		}

		loadLogs()
		return () => {
			cancelled = true
		}
	}, [])

	const filters = useMemo(() => ['All Activity', ...data.modules], [data.modules])

	const filteredLogs = useMemo(() => {
		const query = search.trim().toLowerCase()
		return data.logs.filter((log) => {
			const matchesModule = moduleFilter === 'All Activity' || log.module === moduleFilter
			const haystack = [log.actorName, log.actorRole, log.module, log.action, log.details, log.status].join(' ').toLowerCase()
			return matchesModule && (!query || haystack.includes(query))
		})
	}, [data.logs, moduleFilter, search])

	function handleExport() {
		const header = 'Timestamp,Actor,Actor Role,Module,Action,Status,Details\n'
		const rows = filteredLogs
			.map((log) => `"${log.timestamp}","${log.actorName}","${log.actorRole}","${log.module}","${log.action}","${log.status}","${log.details.replaceAll('"', '""')}"`)
			.join('\n')
		downloadCsv(`${header}${rows}`, 'admin-audit-logs.csv')
	}

	return (
		<AdminFrame
			activeNav="audit"
			title="Audit Logs"
			description="Track real administrative events across ShiftSync with searchable module-level activity."
			searchPlaceholder="Search events, actors, modules, or recorded details..."
			searchValue={search}
			onSearchChange={setSearch}
			headerActions={(
				<button className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-[#eef2ff] px-4 text-xs font-bold text-[#1f3b9c] transition hover:bg-[#e3eafe]" onClick={handleExport}>
					<FiDownload className="h-4 w-4" /> Export CSV
				</button>
			)}
		>
			{error ? (
				<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>
			) : null}

			<div className="grid gap-4 xl:grid-cols-3">
				{[
					{ label: 'Loaded Logs', value: data.totalLogs, detail: `${filteredLogs.length} currently visible`, icon: FiDownload, tone: 'text-[#0f51ff]' },
					{ label: 'Security Events', value: data.securityEvents, detail: 'Login, password, or blocked-access events', icon: FiShield, tone: 'text-rose-600' },
					{ label: 'Compliance Events', value: data.complianceEvents, detail: 'Policy and compliance-related records', icon: FiAlertTriangle, tone: 'text-amber-600' },
				].map((item) => {
					const Icon = item.icon
					return (
						<article key={item.label} className="rounded-2xl border border-slate-200/80 bg-white p-4">
							<div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
								<Icon className={`h-4 w-4 ${item.tone}`} />
								{item.label}
							</div>
							<div className="mt-2 text-[38px] font-black leading-none tracking-[-0.06em] text-slate-950">{item.value}</div>
							<div className={`mt-1 text-xs font-semibold ${item.tone}`}>{item.detail}</div>
						</article>
					)
				})}
			</div>

			<article className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-[#f7f9ff] px-4 py-4 sm:px-5">
					<div className="flex flex-wrap items-center gap-2">
						{filters.map((filter) => (
							<button
								key={filter}
								className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${moduleFilter === filter ? 'bg-[#0f51ff] text-white' : 'bg-[#e8edff] text-[#2746ad]'}`}
								onClick={() => setModuleFilter(filter)}
							>
								{filter}
							</button>
						))}
					</div>
					<div className="text-xs font-bold text-slate-500">{filteredLogs.length} records shown</div>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full text-left">
						<thead className="border-b border-slate-100 bg-[#f7f9ff] text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
							<tr>
								<th className="px-5 py-4">Timestamp</th>
								<th className="px-5 py-4">Actor</th>
								<th className="px-5 py-4">Module</th>
								<th className="px-5 py-4">Action</th>
								<th className="px-5 py-4">Status</th>
							</tr>
						</thead>
						<tbody className="text-sm text-slate-700">
							{filteredLogs.map((log) => (
								<tr key={log.id} className="border-b border-slate-100 last:border-b-0">
									<td className="px-5 py-4 align-top text-xs font-semibold text-slate-600">{log.timestamp}</td>
									<td className="px-5 py-4 align-top">
										<div className="font-bold text-slate-900">{log.actorName}</div>
										<div className="text-xs text-slate-500">{log.actorRole}</div>
									</td>
									<td className="px-5 py-4 align-top">
										<span className="rounded-full bg-[#e8edff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2747b3]">
											{log.module}
										</span>
									</td>
									<td className="px-5 py-4 align-top">
										<div className="font-semibold text-slate-900">{log.action}</div>
										<div className="mt-1 max-w-xl text-xs leading-5 text-slate-500">{log.details}</div>
									</td>
									<td className="px-5 py-4 align-top">
										<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
											log.status === 'Security'
												? 'bg-rose-100 text-rose-600'
												: log.status === 'Compliance'
													? 'bg-amber-100 text-amber-700'
													: 'bg-[#e8edff] text-[#2747b3]'
										}`}>
											{log.status}
										</span>
									</td>
								</tr>
							))}
							{filteredLogs.length === 0 ? (
								<tr>
									<td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-500">
										No audit records matched the current search or module filter.
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>
			</article>
		</AdminFrame>
	)
}
