import { useEffect, useMemo, useState } from 'react'
import {
	FiBell,
	FiCalendar,
	FiClock,
	FiDownload,
	FiDollarSign,
	FiEye,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiRefreshCw,
	FiSearch,
	FiSettings,
	FiUser,
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { buildBrandedReportDocument, buildDatedFilename, downloadBrandedReport, formatExportDate, requestExportDateRange, resolveShiftSyncLogoDataUrl } from '../../lib/export'
import { clearSession, loadSession } from '../../lib/session'
import EmployeeNotificationBell from '../shared/EmployeeNotificationBell'
import EmployeeProfileMenu from '../shared/EmployeeProfileMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

const fallbackPage = {
	employeeName: 'Employee',
	roleLabel: 'EMPLOYEE',
	summaryCards: [],
	trend: [],
	breakdown: [],
	taxEstimate: 'RWF 0',
	payslips: [],
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
				<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-profile"><FiUser className="h-4 w-4" /> My Profile</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
			</nav>

			<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link>
			</div>
		</aside>
	)
}

export default function EarningsAndPays() {
	const navigate = useNavigate()
	const session = loadSession()
	const [page, setPage] = useState(fallbackPage)
	const [error, setError] = useState('')
	const [actionMessage, setActionMessage] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedPayslip, setSelectedPayslip] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		let cancelled = false

		async function loadEarnings() {
			if (!session?.userId) {
				setError('No employee session found. Please log in again.')
				setIsLoading(false)
				return
			}

			try {
				setError('')
				const data = await apiRequest(`/api/employee/earnings/${session.userId}`)
				if (!cancelled) {
					setPage(data)
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load earnings and payroll data.')
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		loadEarnings()

		return () => {
			cancelled = true
		}
	}, [session?.userId])

	async function refreshEarnings() {
		if (!session?.userId) {
			setError('No employee session found. Please log in again.')
			return
		}

		try {
			setError('')
			setIsLoading(true)
			const data = await apiRequest(`/api/employee/earnings/${session.userId}`)
			setPage(data)
		} catch (loadError) {
			setError(loadError.message || 'Unable to refresh earnings data.')
		} finally {
			setIsLoading(false)
		}
	}

	async function handleExportPayroll() {
		if (!visiblePayslips.length) {
			setError('There are no payroll rows to export right now.')
			return
		}

		try {
			const dateRange = await requestExportDateRange('Export monthly payroll report')
			if (!dateRange) {
				return
			}
			const logoUrl = await resolveShiftSyncLogoDataUrl()
			await downloadBrandedReport(
				buildDatedFilename('employee-payroll-history', dateRange, 'pdf'),
				buildBrandedReportDocument({
					logoUrl,
					brandName: 'ShiftSync',
				brandSubtitle: 'ShiftSync employee payroll',
				reportTitle: 'Monthly Payroll Report',
				reportSubtitle: 'A printable payroll summary for the current month and recent payment history.',
				generatedAt: new Date().toISOString(),
				periodLabel: `${formatExportDate(dateRange.from)} to ${formatExportDate(dateRange.to)}`,
				preparedBy: page.employeeName || 'ShiftSync',
				preparedByEmail: session?.email || 'noreply@shiftsync.local',
				summaryCards: page.summaryCards.map((card, index) => ({
					label: card.label,
					value: card.value,
					detail: card.detail,
					highlighted: index === 0,
				})),
				metadataRows: [
					['Employee', page.employeeName || 'Employee'],
					['Role', page.roleLabel || 'Employee'],
					['Payroll Cycle', 'Monthly'],
				],
				sections: [
					{
						title: 'Hours Breakdown',
						description: 'Current month hours and pay distribution.',
					columns: [
						{ label: 'Category' },
						{ label: 'Hours', nowrap: true },
						{ label: 'Rate', nowrap: true },
						{ label: 'Amount', nowrap: true },
					],
						rows: page.breakdown.map((item) => [item.label, item.hours, item.rate, item.amount]),
					},
					{
						title: 'Payroll History',
						description: 'Visible payslips from the current payroll history view.',
					columns: [
						{ label: 'Period', nowrap: true },
						{ label: 'Deposit Note' },
						{ label: 'Gross Amount', nowrap: true },
						{ label: 'Net Amount', nowrap: true },
						{ label: 'Regular Hours', nowrap: true },
						{ label: 'Overtime Hours', nowrap: true },
					],
						rows: visiblePayslips.map((item) => [
							item.period,
							item.depositNote,
							item.grossAmount,
							item.netAmount,
							item.regularHours,
							item.overtimeHours,
						]),
					},
				],
				footerLeft: `${visiblePayslips.length} payroll record(s)`,
				footerRight: `Estimated monthly payroll: ${page.summaryCards?.[2]?.value || page.summaryCards?.[0]?.value || ''}`,
				footerNote: 'Current month earnings are labeled as estimates until payroll is finalized.',
			})
			)
			setError('')
			setActionMessage('Payroll history exported successfully.')
		} catch (exportError) {
			setError(exportError.message || 'Unable to export payroll history.')
		}
	}

	const normalizedSearch = searchTerm.trim().toLowerCase()
	const visiblePayslips = useMemo(() => {
		return page.payslips.filter((item) => {
			if (!normalizedSearch) {
				return true
			}
			return [item.period, item.depositNote, item.netAmount, item.grossAmount].join(' ').toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, page.payslips])

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
								<input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search payslips, periods, and payroll data..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<EmployeeNotificationBell userId={session?.userId} />
								<ThemeToggleButton />
								<EmployeeProfileMenu name={page.employeeName} profileImageUrl={session?.profileImageUrl} role={page.roleLabel} />
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						{error ? <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}
						{actionMessage ? <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div> : null}

						<section className="grid gap-4 lg:grid-cols-3">
							{page.summaryCards.map((card) => (
								<article key={card.label} className={`rounded-2xl border border-slate-200/80 p-5 ${card.highlighted ? 'bg-[#0f51ff] text-white' : 'bg-white'}`}>
									<div className={`text-[11px] font-extrabold uppercase tracking-[0.16em] ${card.highlighted ? 'text-blue-100' : 'text-slate-500'}`}>{card.label}</div>
									<div className={`mt-2 text-5xl leading-none font-black tracking-[-0.05em] ${card.highlighted ? 'text-white' : 'text-slate-900'}`}>{card.value}</div>
									{card.highlighted ? (
										<div className="mt-4 space-y-1">
											<span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100">{card.note}</span>
											{card.label.toLowerCase().includes('month') ? (
												<div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100/80">Estimated monthly payroll</div>
											) : null}
										</div>
									) : (
										<div className="mt-4 space-y-1">
											<div className="text-sm font-semibold text-[#2d5cf6]">{card.note}</div>
											{card.label.toLowerCase().includes('month') ? (
												<div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Estimated monthly payroll</div>
											) : null}
										</div>
									)}
								</article>
							))}
						</section>

						<section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]">
							<article className="rounded-2xl border border-slate-200/80 bg-[#f5f7ff] p-5">
								<div className="flex items-center justify-between gap-3">
									<div>
										<h2 className="text-3xl font-black tracking-[-0.04em] text-slate-900">Earnings History</h2>
										<p className="text-sm text-slate-500">Gross pay trend from recent payroll periods</p>
									</div>
									<div className="flex flex-wrap items-center gap-2">
										<button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600" onClick={refreshEarnings} type="button"><FiRefreshCw className="h-4 w-4" /> Refresh</button>
										<button className="inline-flex items-center gap-2 rounded-full bg-[#0f51ff] px-4 py-2 text-xs font-bold text-white" onClick={handleExportPayroll} type="button"><FiDownload className="h-4 w-4" /> Export Report</button>
									</div>
								</div>

								<div className="mt-7 flex h-56 items-end justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 pb-4 pt-6">
									{page.trend.length ? page.trend.map((point, index) => (
										<div key={`${point.label}-${index}`} className="flex flex-1 flex-col items-center justify-end gap-2">
											<div className={`w-full rounded-t-lg ${index % 2 === 0 ? 'bg-[#9ab0ff]/55' : 'bg-[#2d5cf6]'}`} style={{ height: `${point.height}px` }} />
											<div className="text-[10px] font-bold text-slate-500">{point.value}</div>
											<span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{point.label}</span>
										</div>
									)) : (
										<div className="flex h-full w-full items-center justify-center text-sm text-slate-500">{isLoading ? 'Loading earnings trend...' : 'No earnings history available yet.'}</div>
									)}
								</div>
							</article>

							<article className="rounded-2xl border border-slate-200/80 bg-[#e9efff] p-5">
								<h2 className="text-3xl font-black tracking-[-0.04em] text-slate-900">Hours Breakdown</h2>
								<div className="mt-5 space-y-5">
									{page.breakdown.map((item) => (
										<div key={item.label}>
											<div className="flex items-center justify-between text-sm font-semibold text-slate-700"><span>{item.label}</span><span>{item.hours}</span></div>
											<div className="mt-2 h-2 rounded-full bg-[#d8dfef]"><div className={`h-full rounded-full ${item.tone}`} style={{ width: `${Math.max(item.percentage, 5)}%` }} /></div>
											<div className="mt-1 flex items-center justify-between text-[12px] text-slate-500"><span>{item.rate}</span><span className="font-bold text-slate-700">{item.amount}</span></div>
										</div>
									))}
									<div className="border-t border-slate-300 pt-3">
										<div className="flex items-center justify-between text-sm"><span className="text-slate-500">Tax Deductions (Est.)</span><span className="font-bold text-rose-600">{page.taxEstimate}</span></div>
									</div>
								</div>
							</article>
						</section>

						<section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div>
									<h2 className="text-3xl font-black tracking-[-0.04em] text-slate-900">Recent Paystubs</h2>
									<p className="text-sm text-slate-500">View current payroll figures for each recorded period</p>
								</div>
								<button className="text-sm font-bold text-[#2d5cf6]" onClick={refreshEarnings} type="button">Refresh History</button>
							</div>

							<div className="mt-5 divide-y divide-slate-100">
								{visiblePayslips.length ? visiblePayslips.map((item) => (
									<div key={item.id} className="flex flex-wrap items-center gap-3 py-4">
										<span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#2d5cf6]"><FiCalendar className="h-5 w-5" /></span>
										<div className="min-w-0 flex-1">
											<div className="truncate text-lg font-black tracking-[-0.03em] text-slate-900">{item.period}</div>
											<div className="truncate text-sm text-slate-500">{item.depositNote}</div>
										</div>
										<div className="ml-auto text-right">
											<div className="text-sm font-semibold text-slate-500">Net Amount</div>
											<div className="text-3xl font-black tracking-[-0.04em] text-slate-900">{item.netAmount}</div>
										</div>
										<button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500" onClick={() => setSelectedPayslip(item)} type="button"><FiEye className="h-4 w-4" /></button>
										<button className="inline-flex items-center gap-2 rounded-xl bg-[#eef2ff] px-4 py-2 text-sm font-bold text-slate-700" onClick={() => setSelectedPayslip(item)} type="button"><FiEye className="h-4 w-4" /> View Details</button>
									</div>
								)) : (
									<div className="py-4 text-sm text-slate-500">{isLoading ? 'Loading paystubs...' : 'No paystubs matched your search.'}</div>
								)}
							</div>
						</section>
					</div>
				</div>
			</div>

			{selectedPayslip ? (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-xl rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">{selectedPayslip.period}</h2>
								<div className="mt-2 text-sm font-semibold text-slate-500">{selectedPayslip.depositNote}</div>
							</div>
							<button className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" onClick={() => setSelectedPayslip(null)} type="button">Close</button>
						</div>
						<div className="mt-5 grid gap-3 sm:grid-cols-2">
							<div className="rounded-2xl bg-[#f8faff] p-4">
								<div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Gross Pay</div>
								<div className="mt-2 text-2xl font-black text-slate-900">{selectedPayslip.grossAmount}</div>
							</div>
							<div className="rounded-2xl bg-[#f8faff] p-4">
								<div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Net Pay</div>
								<div className="mt-2 text-2xl font-black text-slate-900">{selectedPayslip.netAmount}</div>
							</div>
							<div className="rounded-2xl bg-[#f8faff] p-4">
								<div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Regular Hours</div>
								<div className="mt-2 text-2xl font-black text-slate-900">{selectedPayslip.regularHours}</div>
							</div>
							<div className="rounded-2xl bg-[#f8faff] p-4">
								<div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Overtime Hours</div>
								<div className="mt-2 text-2xl font-black text-slate-900">{selectedPayslip.overtimeHours}</div>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</main>
	)
}
