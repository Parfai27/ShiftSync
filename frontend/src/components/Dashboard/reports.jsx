import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiDownload,
	FiHome,
	FiLayers,
	FiLogOut,
	FiMoreVertical,
	FiPieChart,
	FiPlus,
	FiSearch,
	FiSettings,
	FiSliders,
	FiUsers,
	FiMenu,
} from 'react-icons/fi'
import { RiGroupLine, RiRadarLine } from 'react-icons/ri'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearSession } from '../../lib/session'
import { resolveProfileImage, useManagerWorkspace } from '../../lib/managerWorkspace'
import { executeReportExport, REPORT_EXPORT_OPTIONS } from '../../lib/reportExports'
import ExportPickerModal from '../shared/ExportPickerModal.jsx'
import ManagerProfileMenu from '../shared/ManagerProfileMenu'
import MobileManagerMenu from '../shared/MobileManagerMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

function MetricCard({ item }) {
	const icons = {
		'Total Active Employees': RiGroupLine,
		'Average Attendance': FiCalendar,
		'Overtime Hours': FiClock,
		'Est. Labor Cost': RiRadarLine,
	}
	const Icon = icons[item.title] || RiGroupLine

	return (
		<article className="rounded-[22px] border border-slate-200/80 bg-white p-5">
			<div className="flex items-start justify-between gap-3">
				<div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.accent}`}><Icon className="h-5 w-5" /></div>
				<span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${item.delta === 'Stable' ? 'bg-slate-100 text-slate-500' : item.delta.startsWith('-') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{item.delta}</span>
			</div>
			<div className="mt-5 text-sm text-slate-500">{item.title}</div>
			<div className="mt-1 text-3xl font-black tracking-[-0.06em] text-slate-950">{item.value}</div>
		</article>
	)
}

function StatusBadge({ danger, children }) {
	return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${danger ? 'bg-rose-100 text-rose-600' : 'bg-[#eef3ff] text-[#0f51ff]'}`}>{children}</span>
}

function buildTrendSeries(attendanceBars, weekLabels, period) {
	if (!attendanceBars.length || !weekLabels.length) {
		return []
	}

	if (period === '90') {
		const chunkSize = Math.max(1, Math.ceil(attendanceBars.length / 3))
		return Array.from({ length: 3 }, (_, index) => {
			const chunk = attendanceBars.slice(index * chunkSize, (index + 1) * chunkSize)
			const average = chunk.length ? Math.round(chunk.reduce((sum, value) => sum + value, 0) / chunk.length) : 0
			return {
				label: `M${index + 1}`,
				value: average,
			}
		})
	}

	if (period === '365') {
		const quarterBase = attendanceBars.length ? attendanceBars.reduce((sum, value) => sum + value, 0) / attendanceBars.length : 0
		return ['Q1', 'Q2', 'Q3', 'Q4'].map((label, index) => ({
			label,
			value: Math.max(40, Math.min(98, Math.round(quarterBase + (index - 1.5) * 3))),
		}))
	}

	return attendanceBars.map((value, index) => ({
		label: weekLabels[index] || `D${index + 1}`,
		value,
	}))
}

function clampPercent(value) {
	return Math.max(0, Math.min(100, value || 0))
}

function toneToHex(tone) {
	if ((tone || '').includes('0f51ff')) return '#2563eb'
	if ((tone || '').includes('5a6fc3')) return '#8da2ff'
	return '#cbd5e1'
}

function complianceStatusClasses(status, danger) {
	if (danger) {
		return 'bg-rose-50 text-rose-600 border border-rose-200'
	}
	if (status === 'Completed') {
		return 'bg-emerald-50 text-emerald-600 border border-emerald-200'
	}
	if (status === 'Today') {
		return 'bg-amber-50 text-amber-700 border border-amber-200'
	}
	return 'bg-[#eef3ff] text-[#0f51ff] border border-[#d7e3ff]'
}

export default function Reports() {
	const navigate = useNavigate()
	const { manager, workspace, session, isLoading, error } = useManagerWorkspace()
	const profileImage = resolveProfileImage(manager?.profileImageUrl, manager?.fullName)
	const reports = workspace.reports
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedLog, setSelectedLog] = useState(null)
	const [exportLabel, setExportLabel] = useState('')
	const [showAllLogs, setShowAllLogs] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [showExportModal, setShowExportModal] = useState(false)
	const [exportType, setExportType] = useState('executive-summary')
	const [exportFormat, setExportFormat] = useState('html')
	const [exportScope, setExportScope] = useState('full')
	const [exportDateRange, setExportDateRange] = useState({ from: '', to: '' })
	const [exportDateRangeError, setExportDateRangeError] = useState('')
	const [exportError, setExportError] = useState('')
	const [isExporting, setIsExporting] = useState(false)

	const normalizedSearch = searchTerm.trim().toLowerCase()
	const metricsToShow = useMemo(() => {
		return reports.metrics.filter((item) => {
			if (!normalizedSearch) {
				return true
			}

			return [item.title, item.value, item.delta].join(' ').toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, reports.metrics])

	const trendSeries = useMemo(
		() => buildTrendSeries(reports.attendanceBars, reports.weekLabels, '30'),
		[reports.attendanceBars, reports.weekLabels]
	)
	const filteredDistribution = useMemo(() => {
		return reports.distribution.filter((item) => {
			return !normalizedSearch || item.label.toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, reports.distribution])

	const filteredCompliance = useMemo(() => {
		return reports.recentCompliance.filter((row) => {
			const matchesSearch = !normalizedSearch || [
				row.name,
				row.id,
				row.date,
				row.department,
				row.punchIn,
				row.punchOut,
				row.status,
			].join(' ').toLowerCase().includes(normalizedSearch)

			return matchesSearch
		})
	}, [normalizedSearch, reports.recentCompliance])

	const visibleCompliance = useMemo(() => {
		return showAllLogs ? filteredCompliance : filteredCompliance.slice(0, 5)
	}, [filteredCompliance, showAllLogs])

	const reportExportPreview = useMemo(() => {
		const lines = [
			`Branch: ${manager?.branchName || 'Ngabo Pharmacy'}`,
			`Reporting window: current 7-day coverage view`,
		]

		if (exportType === 'executive-summary') {
			lines.push(`Metrics included: ${reports.metrics.length}`)
			lines.push(`Capacity score: ${reports.capacityPercent}%`)
		} else if (exportType === 'weekly-coverage') {
			lines.push(`Coverage days: ${reports.weekLabels.length}`)
		} else if (exportType === 'department-mix') {
			lines.push(`Departments tracked: ${reports.distribution.length}`)
		} else if (exportType === 'compliance-log') {
			const count = exportScope === 'filtered' ? filteredCompliance.length : reports.recentCompliance.length
			lines.push(`Compliance rows: ${count}`)
		} else {
			lines.push('Includes summary, coverage trend, department mix, and compliance log.')
		}

		if (searchTerm.trim()) {
			lines.push(`Search context: ${searchTerm.trim()}`)
		}

		return lines
	}, [exportScope, exportType, filteredCompliance.length, manager?.branchName, reports, searchTerm])

	function openExportModal() {
		setExportError('')
		setExportDateRangeError('')
		setExportDateRange({ from: '', to: '' })
		setShowExportModal(true)
	}

	async function handleConfirmReportExport() {
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
			const summary = await executeReportExport({
				type: exportType,
				format: exportFormat,
				reports,
				manager,
				session,
				searchTerm,
				scope: exportType === 'compliance-log' ? exportScope : 'full',
				dateRange: exportDateRange,
			})
			setShowExportModal(false)
			setExportLabel(summary)
			window.setTimeout(() => setExportLabel(''), 3000)
		} catch (exportFailure) {
			setExportError(exportFailure.message || 'Unable to prepare this report export.')
		} finally {
			setIsExporting(false)
		}
	}

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<MobileManagerMenu
				activePath="/reports"
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				onPrimaryAction={openExportModal}
				primaryActionLabel="Export Reports"
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
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/compliances"><FiLayers className="h-4 w-4" /> Compliance & Policies</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/reports"><FiPieChart className="h-4 w-4" /> Reports & Analytics</Link>
					</nav>
					<div className="mt-auto space-y-3 pt-8">
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]" onClick={openExportModal} type="button"><FiDownload className="h-4 w-4" /> Export Reports</button>
						<div className="space-y-1 text-sm text-slate-600"><Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/manager-settings"><FiSettings className="h-4 w-4" /> Settings</Link><Link className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link></div>
					</div>
				</aside>

				<div className="dashboard-main-offset flex min-h-0 flex-1 flex-col h-screen overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden"><button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700" onClick={() => setIsMobileMenuOpen(true)} type="button"><FiMenu className="h-5 w-5" /></button><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f51ff] text-xs font-black text-white">S</span><div className="min-w-0"><div className="truncate text-sm font-extrabold text-slate-900">ShiftSync</div><div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Workforce Management</div></div></div></div>
						<div className="mt-4 flex flex-col gap-4 xl:mt-0 xl:flex-row xl:items-center xl:justify-between">
							<label className="relative w-full max-w-3xl"><FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search reports, logs, or metrics..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" /></label>
							<div className="flex items-center justify-between gap-3 xl:justify-end"><button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500" onClick={() => navigate('/notifications')} type="button"><FiBell className="h-4 w-4" /></button><ThemeToggleButton /><ManagerProfileMenu name={manager.fullName} profileImageUrl={profileImage} role={manager.roleLabel} /></div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="space-y-5">
							{error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
							{exportLabel ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{exportLabel}</div> : null}

							<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Reports & Analytics</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{reports.summary || 'Loading analytics...'}</p>
								</div>
								<button className="inline-flex items-center gap-2 rounded-xl bg-[#0f51ff] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,81,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0b44de]" onClick={openExportModal} type="button">
									<FiDownload className="h-4 w-4" />
									Export Reports
								</button>
							</div>

							<div className="grid gap-4 xl:grid-cols-3">
								{metricsToShow.map((item) => (
									<article key={item.title} className="rounded-[24px] border border-slate-200/80 bg-white px-6 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
										<div className="text-[14px] font-medium text-slate-500">{item.title}</div>
										<div className="mt-3 flex items-end gap-3">
											<div className="text-5xl font-black tracking-[-0.06em] text-slate-950">{item.value}</div>
											<div className={`${item.delta.startsWith('-') ? 'text-rose-400' : 'text-emerald-400'} pb-1 text-lg font-semibold`}>{item.delta}</div>
										</div>
									</article>
								))}
							</div>
							{!metricsToShow.length && !isLoading ? <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500">No metrics matched the current search.</div> : null}

							<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
								<div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
									<h2 className="text-[18px] font-semibold text-slate-950">Coverage Bar Chart</h2>
									<div className="mt-6 rounded-[24px] border border-slate-200/80 bg-[#f8faff] p-4">
										<div className="grid grid-cols-[42px_minmax(0,1fr)] gap-4">
											<div className="flex h-[250px] flex-col justify-between text-[11px] font-bold text-slate-400">
												<span>100</span>
												<span>75</span>
												<span>50</span>
												<span>25</span>
												<span>0</span>
											</div>
											<div>
												<svg className="h-[250px] w-full" viewBox="0 0 620 250" preserveAspectRatio="none">
													<line x1="0" y1="0" x2="620" y2="0" stroke="#dbe4ff" />
													<line x1="0" y1="62.5" x2="620" y2="62.5" stroke="#e5e7eb" />
													<line x1="0" y1="125" x2="620" y2="125" stroke="#e5e7eb" />
													<line x1="0" y1="187.5" x2="620" y2="187.5" stroke="#e5e7eb" />
													<line x1="0" y1="250" x2="620" y2="250" stroke="#dbe4ff" />
													{trendSeries.map((item, index) => {
														const step = 620 / Math.max(trendSeries.length, 1)
														const barWidth = Math.min(56, Math.max(40, step * 0.54))
														const x = index * step + (step - barWidth) / 2
														const healthyHeight = (clampPercent(item.value) / 100) * 250
														const gapPercent = Math.max(0, 100 - item.value)
														const gapHeight = (gapPercent / 100) * 250
														const healthyY = 250 - healthyHeight
														const gapY = healthyY - gapHeight
														return (
															<g key={item.label}>
																<rect x={x} y={healthyY} width={barWidth} height={healthyHeight} rx="14" fill="#f8fafc" />
																{gapHeight > 0 ? <rect x={x} y={gapY} width={barWidth} height={gapHeight} rx="14" fill="#2563eb" /> : null}
																<text x={x + barWidth / 2} y={healthyY + healthyHeight / 2 + 6} textAnchor="middle" fill="#111827" fontSize="14" fontWeight="700">{item.value}%</text>
																{gapHeight > 22 ? (
																	<text x={x + barWidth / 2} y={gapY + Math.min(18, gapHeight / 2 + 4)} textAnchor="middle" fill="#dbeafe" fontSize="13" fontWeight="700">
																		{gapPercent}%
																	</text>
																) : null}
															</g>
														)
													})}
												</svg>
												<div className="mt-4 grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(trendSeries.length, 1)}, minmax(0, 1fr))` }}>
													{trendSeries.map((item) => (
														<div key={item.label} className="text-center text-sm">
															<div className="text-slate-500">{item.label}</div>
														</div>
													))}
												</div>
												<div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
													<div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#2563eb]" /> Healthy</div>
													<div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#f8fafc]" /> Watch</div>
													<div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#94a3b8]" /> Gap</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
									<h2 className="text-[18px] font-semibold text-slate-950">Department &amp; Team Mix</h2>
									<div className="mt-6 flex items-center justify-center">
										<svg viewBox="0 0 240 240" className="h-56 w-56">
											<circle cx="120" cy="120" r="76" fill="none" stroke="#e5e7eb" strokeWidth="24" />
											{(() => {
												const total = Math.max(1, filteredDistribution.reduce((sum, item) => sum + item.value, 0))
												const circumference = 2 * Math.PI * 76
												const segments = filteredDistribution.reduce((acc, item) => {
													const dash = circumference * (item.value / total)
													acc.items.push(
														<circle
															key={item.label}
															cx="120"
															cy="120"
															r="76"
															fill="none"
															stroke={toneToHex(item.tone)}
															strokeWidth="24"
															strokeDasharray={`${dash} ${circumference - dash}`}
															strokeDashoffset={-acc.offset}
															transform="rotate(-90 120 120)"
														/>
													)
													return { offset: acc.offset + dash, items: acc.items }
												}, { offset: 0, items: [] })
												return segments.items
											})()}
											<circle cx="120" cy="120" r="48" fill="#ffffff" />
										</svg>
									</div>
									<div className="mt-5 space-y-4">
										{filteredDistribution.map((item) => {
											const total = Math.max(1, filteredDistribution.reduce((sum, current) => sum + current.value, 0))
											const percent = Math.round((item.value / total) * 100)
											return (
												<div key={item.label}>
													<div className="flex items-center justify-between gap-3">
														<div className="flex items-center gap-3 text-[15px] font-medium text-slate-700">
															<span className="h-3 w-3 rounded-full" style={{ backgroundColor: toneToHex(item.tone) }} />
															{item.label}
														</div>
														<div className="text-right">
															<div className="text-[18px] font-black text-slate-950">{item.value}</div>
															<div className="text-sm text-slate-400">{percent}%</div>
														</div>
													</div>
													<div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
														<div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: toneToHex(item.tone) }} />
													</div>
												</div>
											)
										})}
									</div>
									{!filteredDistribution.length && !isLoading ? <div className="mt-4 text-sm text-slate-500">No departments matched the current search.</div> : null}
								</div>
							</div>

							<article className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
								<div className="flex items-center justify-between gap-3">
									<div>
										<h2 className="text-[18px] font-semibold text-slate-950">Recent Shift Compliance</h2>
									</div>
									<button className="text-sm font-medium text-[#7aa2ff]" onClick={() => setShowAllLogs((current) => !current)} type="button">
										{showAllLogs ? 'Show Fewer Logs' : 'View All Logs'}
									</button>
								</div>
								<div className="mt-6 overflow-x-auto rounded-[22px] border border-slate-200/80 bg-[#f8faff]">
									<table className="min-w-full text-left">
										<thead className="border-b border-slate-200 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
											<tr>
												<th className="px-5 py-4">Employee</th>
												<th className="px-5 py-4">Shift Date</th>
												<th className="px-5 py-4">Department</th>
												<th className="px-5 py-4">Punch In</th>
												<th className="px-5 py-4">Punch Out</th>
												<th className="px-5 py-4">Status</th>
												<th className="px-5 py-4 text-right">Actions</th>
											</tr>
										</thead>
										<tbody>
											{visibleCompliance.map((row) => (
												<tr key={`${row.id}-${row.date}-${row.punchIn}-${row.punchOut}`} className="border-b border-slate-200 last:border-b-0">
													<td className="px-5 py-4">
														<div className="flex items-center gap-3">
															<div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-[12px] font-black text-white">{row.initials}</div>
															<div>
																<div className="font-semibold text-slate-950">{row.name}</div>
																<div className="text-xs text-slate-400">Employee ID: {row.id}</div>
															</div>
														</div>
													</td>
													<td className="px-5 py-4 text-sm text-slate-700">{row.date}</td>
													<td className="px-5 py-4 text-sm text-slate-600">{row.department}</td>
													<td className="px-5 py-4 text-sm font-semibold text-slate-950">{row.punchIn}</td>
													<td className="px-5 py-4 text-sm font-semibold text-slate-950">{row.punchOut}</td>
													<td className="px-5 py-4">
														<span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] ${complianceStatusClasses(row.status, row.danger)}`}>
															{row.status}
														</span>
													</td>
													<td className="px-5 py-4 text-right">
														<button className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={() => setSelectedLog(row)} type="button"><FiMoreVertical className="h-4 w-4" /></button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								{!filteredCompliance.length && !isLoading ? <div className="mt-4 text-sm text-slate-500">{normalizedSearch ? 'No compliance log rows matched the current search.' : 'No report rows are available yet.'}</div> : null}
							</article>
						</section>
					</div>
				</div>
			</div>

			{selectedLog ? (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-xl rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">{selectedLog.name}</h2>
								<div className="mt-2 text-sm font-semibold text-slate-500">{selectedLog.id}</div>
							</div>
							<button className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" onClick={() => setSelectedLog(null)} type="button">Close</button>
						</div>
						<div className="mt-5 grid gap-3 rounded-2xl bg-[#f8faff] p-5 text-sm text-slate-700">
							<div><span className="font-bold text-slate-900">Shift Date:</span> {selectedLog.date}</div>
							<div><span className="font-bold text-slate-900">Department:</span> {selectedLog.department}</div>
							<div><span className="font-bold text-slate-900">Punch In:</span> {selectedLog.punchIn}</div>
							<div><span className="font-bold text-slate-900">Punch Out:</span> {selectedLog.punchOut}</div>
							<div><span className="font-bold text-slate-900">Status:</span> {selectedLog.status}</div>
						</div>
						<div className="mt-5 flex flex-wrap justify-end gap-3">
							{selectedLog.danger ? <button className="rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600" onClick={() => navigate('/adjustments')} type="button">Open Review Queue</button> : null}
							<button className="rounded-full bg-[#0f51ff] px-4 py-2 text-sm font-bold text-white" onClick={() => setSelectedLog(null)} type="button">Done</button>
						</div>
					</div>
				</div>
			) : null}
			{showExportModal ? (
				<ExportPickerModal
					title="Export Weekly Reports"
					subtitle="Pick the analysis you need, then download a branded printable report."
					options={REPORT_EXPORT_OPTIONS}
					selectedId={exportType}
					onSelect={(nextType) => {
						setExportType(nextType)
						const nextOption = REPORT_EXPORT_OPTIONS.find((option) => option.id === nextType)
						if (nextOption?.formats?.length === 1) {
							setExportFormat(nextOption.formats[0])
						}
					}}
					format={exportFormat}
					onFormatChange={setExportFormat}
					scope={exportScope}
					onScopeChange={setExportScope}
					dateRange={exportDateRange}
					onDateRangeChange={setExportDateRange}
					dateRangeError={exportDateRangeError}
					scopeOptions={
						exportType === 'compliance-log'
							? [
									{ id: 'full', label: 'Full log' },
									{ id: 'filtered', label: 'Current search' },
								]
							: []
					}
					previewLines={reportExportPreview}
					isExporting={isExporting}
					error={exportError}
					onClose={() => {
						setShowExportModal(false)
						setExportError('')
						setExportDateRangeError('')
					}}
					onExport={handleConfirmReportExport}
				/>
			) : null}
		</main>
	)
}
