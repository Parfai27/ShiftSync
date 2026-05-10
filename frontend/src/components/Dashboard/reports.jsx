import {
	FiBell,
	FiCalendar,
	FiChevronDown,
	FiClock,
	FiDownload,
	FiFilter,
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
	FiRefreshCw,
} from 'react-icons/fi'
import { RiGroupLine, RiRadarLine } from 'react-icons/ri'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearSession } from '../../lib/session'
import { resolveProfileImage, useManagerWorkspace } from '../../lib/managerWorkspace'
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

function buildTrendPath(series, width = 560, height = 260) {
	if (!series.length) {
		return ''
	}

	const step = series.length > 1 ? width / (series.length - 1) : width

	return series
		.map((item, index) => {
			const x = index * step
			const y = height - (Math.max(0, Math.min(100, item.value)) / 100) * height
			return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
		})
		.join(' ')
}

function clampPercent(value) {
	return Math.max(0, Math.min(100, value || 0))
}

export default function Reports() {
	const navigate = useNavigate()
	const { manager, workspace, isLoading, error, reloadWorkspace } = useManagerWorkspace()
	const profileImage = resolveProfileImage(manager?.profileImageUrl, manager?.fullName)
	const reports = workspace.reports
	const [searchTerm, setSearchTerm] = useState('')
	const [period, setPeriod] = useState('30')
	const [filterMode, setFilterMode] = useState('ALL')
	const [selectedLog, setSelectedLog] = useState(null)
	const [exportLabel, setExportLabel] = useState('')
	const [showAllLogs, setShowAllLogs] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
	const exportMenuRef = useRef(null)

	const normalizedSearch = searchTerm.trim().toLowerCase()
	const metricsToShow = useMemo(() => {
		const periodMetrics = period === '90'
			? reports.metrics.map((item) => ({
				...item,
				delta: item.delta === 'Stable' ? 'Quarterly' : item.delta,
			}))
			: reports.metrics

		return periodMetrics.filter((item) => {
			if (!normalizedSearch) {
				return true
			}

			return [item.title, item.value, item.delta].join(' ').toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, period, reports.metrics])

	const trendSeries = useMemo(
		() => buildTrendSeries(reports.attendanceBars, reports.weekLabels, period),
		[period, reports.attendanceBars, reports.weekLabels]
	)
	const trendSummary = useMemo(() => {
		if (!trendSeries.length) {
			return {
				average: 0,
				best: null,
				lowest: null,
				delta: 0,
			}
		}

		const average = Math.round(trendSeries.reduce((sum, item) => sum + item.value, 0) / trendSeries.length)
		const best = trendSeries.reduce((current, item) => (item.value > current.value ? item : current), trendSeries[0])
		const lowest = trendSeries.reduce((current, item) => (item.value < current.value ? item : current), trendSeries[0])
		const delta = trendSeries.length > 1 ? trendSeries[trendSeries.length - 1].value - trendSeries[0].value : 0

		return {
			average,
			best,
			lowest,
			delta,
		}
	}, [trendSeries])

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
				row.status,
			].join(' ').toLowerCase().includes(normalizedSearch)

			const matchesFilter =
				filterMode === 'ALL' ||
				(filterMode === 'REVIEW' && row.danger) ||
				(filterMode === 'SCHEDULED' && !row.danger)

			return matchesSearch && matchesFilter
		})
	}, [filterMode, normalizedSearch, reports.recentCompliance])

	const visibleCompliance = useMemo(() => {
		return showAllLogs ? filteredCompliance : filteredCompliance.slice(0, 5)
	}, [filteredCompliance, showAllLogs])

	const reportSummary = useMemo(() => {
		if (period === '365') {
			return 'Yearly view of pharmacy staffing coverage, assignment compliance, and workload balance.'
		}
		if (period === '90') {
			return 'Quarterly performance trend for live staffing activity, schedule coverage, and operational risk.'
		}
		return reports.summary || 'Loading report data...'
	}, [period, reports.summary])

	useEffect(() => {
		function handleClickOutside(event) {
			if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
				setIsExportMenuOpen(false)
			}
		}

		function handleEscape(event) {
			if (event.key === 'Escape') {
				setIsExportMenuOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('keydown', handleEscape)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleEscape)
		}
	}, [])

	function cycleFilter() {
		setFilterMode((current) => {
			if (current === 'ALL') return 'REVIEW'
			if (current === 'REVIEW') return 'SCHEDULED'
			return 'ALL'
		})
	}

	function buildExportRows() {
		return [
			['Employee', 'Identifier', 'Shift Date', 'Department', 'Punch In', 'Status'],
			...filteredCompliance.map((row) => [row.name, row.id, row.date, row.department, row.punchIn, row.status]),
		]
	}

	function downloadFile(content, mimeType, extension) {
		const blob = new Blob([content], { type: mimeType })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `reports-${period}-${filterMode.toLowerCase()}.${extension}`
		link.click()
		URL.revokeObjectURL(url)
		setExportLabel(`Snapshot exported as ${extension.toUpperCase()}.`)
		setIsExportMenuOpen(false)
		window.setTimeout(() => setExportLabel(''), 2000)
	}

	function exportCsv() {
		const rows = buildExportRows()
		const csv = rows
			.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
			.join('\n')
		downloadFile(csv, 'text/csv;charset=utf-8;', 'csv')
	}

	function exportExcel() {
		const rows = buildExportRows()
		const tsv = rows
			.map((row) => row.map((value) => String(value ?? '').replace(/\t/g, ' ')).join('\t'))
			.join('\n')
		downloadFile(tsv, 'application/vnd.ms-excel;charset=utf-8;', 'xls')
	}

	function exportSnapshot() {
		exportCsv()
	}

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<MobileManagerMenu
				activePath="/reports"
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				onPrimaryAction={exportSnapshot}
				primaryActionLabel="Export Snapshot"
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
						<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0b44de]" onClick={exportSnapshot} type="button"><FiPlus className="h-4 w-4" /> Export Snapshot</button>
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
						<section className="space-y-6">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Reports &amp; Analytics</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{reportSummary}</p>
								</div>
								<div className="flex flex-wrap items-center gap-3">
									<div className="inline-flex rounded-2xl bg-[#f3f6ff] p-1 text-sm font-semibold text-slate-500">
										<button className={`rounded-xl px-4 py-2 ${period === '30' ? 'bg-white text-[#0f51ff]' : ''}`} onClick={() => setPeriod('30')} type="button">Last 30 Days</button>
										<button className={`rounded-xl px-4 py-2 ${period === '90' ? 'bg-white text-[#0f51ff]' : ''}`} onClick={() => setPeriod('90')} type="button">Quarterly</button>
										<button className={`rounded-xl px-4 py-2 ${period === '365' ? 'bg-white text-[#0f51ff]' : ''}`} onClick={() => setPeriod('365')} type="button">Yearly</button>
									</div>
									<button className="inline-flex items-center gap-2 rounded-2xl bg-[#e8eeff] px-4 py-3 text-sm font-bold text-slate-700" onClick={cycleFilter} type="button"><FiFilter className="h-4 w-4" /> {filterMode}</button>
									<button className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700" onClick={reloadWorkspace} type="button"><FiRefreshCw className="h-4 w-4" /> Refresh</button>
									<div className="relative" ref={exportMenuRef}>
										<button aria-expanded={isExportMenuOpen} aria-haspopup="menu" className="inline-flex items-center gap-2 rounded-2xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white" onClick={() => setIsExportMenuOpen((current) => !current)} type="button"><FiDownload className="h-4 w-4" /> Export <FiChevronDown className={`h-4 w-4 transition ${isExportMenuOpen ? 'rotate-180' : ''}`} /></button>
										{isExportMenuOpen ? (
											<div className="absolute right-0 top-[calc(100%+10px)] z-30 min-w-[170px] rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
												<button className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-[#eef3ff] hover:text-[#0f51ff]" onClick={exportCsv} type="button">
													<span>Download CSV</span>
													<span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">.csv</span>
												</button>
												<button className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-[#eef3ff] hover:text-[#0f51ff]" onClick={exportExcel} type="button">
													<span>Download Excel</span>
													<span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">.xls</span>
												</button>
											</div>
										) : null}
									</div>
								</div>
							</div>
							{error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
							{exportLabel ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{exportLabel}</div> : null}
							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metricsToShow.map((item) => <MetricCard key={item.title} item={item} />)}</div>
							{!metricsToShow.length && !isLoading ? <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500">No metrics matched the current search.</div> : null}
							<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
								<div className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
									<div>
										<h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Attendance Trends</h2>
										<p className="mt-1 text-sm text-slate-500">
											{period === '30' ? 'Daily shift coverage over the current schedule window.' : period === '90' ? 'Monthly average coverage for the current quarter.' : 'Quarter-by-quarter staffing coverage for the active year.'}
										</p>
									</div>
									<div className="mt-6 rounded-[22px] bg-[#f8faff] p-4 sm:p-5">
										<div className="mb-4 grid gap-3 md:grid-cols-3">
											<div className="rounded-2xl bg-white px-4 py-4">
												<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Average Coverage</div>
												<div className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-950">{trendSummary.average}%</div>
												<div className="mt-1 text-xs font-semibold text-slate-500">Across the selected reporting window</div>
											</div>
											<div className="rounded-2xl bg-white px-4 py-4">
												<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Best Period</div>
												<div className="mt-2 text-3xl font-black tracking-[-0.06em] text-emerald-600">{trendSummary.best?.value ?? 0}%</div>
												<div className="mt-1 text-xs font-semibold text-slate-500">{trendSummary.best?.label || 'No data'}</div>
											</div>
											<div className="rounded-2xl bg-white px-4 py-4">
												<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Trend Direction</div>
												<div className={`mt-2 text-3xl font-black tracking-[-0.06em] ${trendSummary.delta >= 0 ? 'text-[#0f51ff]' : 'text-rose-600'}`}>
													{trendSummary.delta >= 0 ? '+' : ''}{trendSummary.delta}%
												</div>
												<div className="mt-1 text-xs font-semibold text-slate-500">Change from first to latest point</div>
											</div>
										</div>
										<div className="grid grid-cols-[42px_minmax(0,1fr)] gap-4">
											<div className="flex h-80 flex-col justify-between pb-10 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
												<span>100</span>
												<span>75</span>
												<span>50</span>
												<span>25</span>
												<span>0</span>
											</div>
											<div className="relative">
												<svg className="h-80 w-full" viewBox="0 0 560 260" preserveAspectRatio="none">
													<line x1="0" y1="0" x2="560" y2="0" stroke="#dbe4ff" strokeDasharray="4 4" />
													<line x1="0" y1="65" x2="560" y2="65" stroke="#e5e7eb" />
													<line x1="0" y1="130" x2="560" y2="130" stroke="#e5e7eb" />
													<line x1="0" y1="195" x2="560" y2="195" stroke="#e5e7eb" />
													<line x1="0" y1="260" x2="560" y2="260" stroke="#e5e7eb" />
													<line x1="0" y1="26" x2="560" y2="26" stroke="#10b981" strokeDasharray="6 6" />
													{trendSeries.map((item, index) => {
														const step = trendSeries.length > 1 ? 560 / (trendSeries.length - 1) : 560
														const x = trendSeries.length > 1 ? step * index : 280
														const barWidth = Math.min(44, Math.max(28, step * 0.45))
														const height = (clampPercent(item.value) / 100) * 260
														const y = 260 - height
														return (
															<rect
																key={`${item.label}-bar`}
																x={x - barWidth / 2}
																y={y}
																width={barWidth}
																height={height}
																rx="12"
																fill={item.value >= 90 ? 'rgba(16,185,129,0.18)' : item.value >= 75 ? 'rgba(15,81,255,0.18)' : 'rgba(244,63,94,0.18)'}
															/>
														)
													})}
													<path d={`${buildTrendPath(trendSeries, 560, 260)} L 560 260 L 0 260 Z`} fill="rgba(15,81,255,0.10)" />
													<path d={buildTrendPath(trendSeries, 560, 260)} fill="none" stroke="#0f51ff" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
													{trendSeries.map((item, index) => {
														const x = trendSeries.length > 1 ? (560 / (trendSeries.length - 1)) * index : 280
														const y = 260 - (clampPercent(item.value) / 100) * 260
														return (
															<g key={item.label}>
																<circle cx={x} cy={y} r="6" fill="#0f51ff" />
																<circle cx={x} cy={y} r="12" fill="rgba(15,81,255,0.12)" />
																<text x={x} y={Math.max(16, y - 14)} textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="800">
																	{item.value}%
																</text>
															</g>
														)
													})}
												</svg>
												<div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
													<div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#0f51ff]" /> Coverage trend</div>
													<div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> 90% target</div>
													<div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> At-risk periods</div>
												</div>
												<div className="mt-3 grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(trendSeries.length, 1)}, minmax(0, 1fr))` }}>
													{trendSeries.map((item) => (
														<div key={item.label} className="text-center">
															<div className={`text-sm font-black ${item.value >= 90 ? 'text-emerald-600' : item.value >= 75 ? 'text-slate-900' : 'text-rose-600'}`}>{item.value}%</div>
															<div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
														</div>
													))}
												</div>
												<div className="mt-4 grid gap-3 md:grid-cols-2">
													<div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
														<span className="font-bold text-slate-900">Lowest coverage:</span>{' '}
														{trendSummary.lowest ? `${trendSummary.lowest.label} at ${trendSummary.lowest.value}%` : 'No data'}
													</div>
													<div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
														<span className="font-bold text-slate-900">Target:</span> Keep coverage at or above 90% for a stable weekly rota.
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="rounded-[26px] border border-slate-200/80 bg-[#eef3ff] p-5 sm:p-6">
									<h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Department Coverage</h2>
									<p className="mt-1 text-sm text-slate-500">Clear breakdown of how the active team is distributed.</p>
									<div className="mt-6 rounded-[22px] bg-white px-5 py-4">
										<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Overall coverage</div>
										<div className="mt-2 flex items-end justify-between gap-3">
											<div className="text-3xl font-black tracking-[-0.06em] text-slate-950">{reports.capacityPercent}%</div>
											<div className="text-sm font-semibold text-slate-500">of required staffing filled</div>
										</div>
										<div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
											<div className="h-full rounded-full bg-[linear-gradient(90deg,#0f51ff_0%,#7aa2ff_100%)]" style={{ width: `${reports.capacityPercent}%` }} />
										</div>
									</div>
									<div className="mt-6 space-y-4">
										{filteredDistribution.map((item) => {
											const total = filteredDistribution.reduce((sum, current) => sum + current.value, 0)
											const percent = total ? Math.round((item.value / total) * 100) : 0
											return (
												<div key={item.label} className="rounded-2xl bg-white px-4 py-4">
													<div className="flex items-center justify-between gap-3 text-sm">
														<div className="flex items-center gap-3 font-semibold text-slate-700">
															<span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
															{item.label}
														</div>
														<div className="text-right">
															<div className="font-black text-slate-950">{item.value}</div>
															<div className="text-[11px] font-bold text-slate-400">{percent}%</div>
														</div>
													</div>
													<div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
														<div className={`h-full rounded-full ${item.tone}`} style={{ width: `${percent}%` }} />
													</div>
												</div>
											)
										})}
									</div>
									{!filteredDistribution.length && !isLoading ? <div className="mt-4 text-sm text-slate-500">No departments matched the current search.</div> : null}
								</div>
							</div>
							<article className="rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Recent Shift Compliance</h2><p className="mt-1 text-sm text-slate-500">Tracking the latest punch-in events and status exceptions.</p></div><button className="text-sm font-bold text-[#0f51ff]" onClick={() => setShowAllLogs((current) => !current)} type="button">{showAllLogs ? 'Show Fewer Logs' : 'View All Logs'}</button></div><div className="mt-5 overflow-x-auto"><table className="min-w-full text-left"><thead className="border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400"><tr><th className="px-2 py-3">Employee</th><th className="px-2 py-3">Shift Date</th><th className="px-2 py-3">Department</th><th className="px-2 py-3">Punch In</th><th className="px-2 py-3">Status</th><th className="px-2 py-3">Actions</th></tr></thead><tbody>{visibleCompliance.map((row) => <tr key={`${row.name}-${row.date}`} className="border-b border-slate-100 last:border-b-0 text-sm text-slate-700"><td className="px-2 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f51ff,#91b2ff)] text-[11px] font-black text-white">{row.initials}</div><div><div className="font-semibold text-slate-900">{row.name}</div><div className="text-xs text-slate-500">{row.id}</div></div></div></td><td className="px-2 py-4">{row.date}</td><td className="px-2 py-4">{row.department}</td><td className="px-2 py-4 font-medium text-slate-900">{row.punchIn}</td><td className="px-2 py-4"><StatusBadge danger={row.danger}>{row.status}</StatusBadge></td><td className="px-2 py-4"><button className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" onClick={() => setSelectedLog(row)} type="button"><FiMoreVertical className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>{!filteredCompliance.length && !isLoading ? <div className="mt-4 text-sm text-slate-500">{normalizedSearch || filterMode !== 'ALL' ? 'No compliance log rows matched the current filters.' : 'No report rows are available yet.'}</div> : null}</article>
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
							<div><span className="font-bold text-slate-900">Status:</span> {selectedLog.status}</div>
						</div>
						<div className="mt-5 flex flex-wrap justify-end gap-3">
							{selectedLog.danger ? <button className="rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600" onClick={() => setFilterMode('REVIEW')} type="button">Focus Review Queue</button> : null}
							<button className="rounded-full bg-[#0f51ff] px-4 py-2 text-sm font-bold text-white" onClick={() => setSelectedLog(null)} type="button">Done</button>
						</div>
					</div>
				</div>
			) : null}
		</main>
	)
}
