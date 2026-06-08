import { buildBrandedReportDocument, buildDatedFilename, downloadBrandedReport, formatExportDate, resolveShiftSyncLogoDataUrl } from './export'

export const REPORT_EXPORT_OPTIONS = [
	{
		id: 'executive-summary',
		label: 'Executive Weekly Summary',
		description: 'A branded leadership report with headline KPIs and a weekly summary table.',
		formats: ['html'],
	},
	{
		id: 'weekly-coverage',
		label: 'Weekly Coverage Trend',
		description: 'A branded weekly coverage report with the day-by-day staffing trend.',
		formats: ['html'],
	},
	{
		id: 'department-mix',
		label: 'Department & Team Mix',
		description: 'A branded workforce mix report showing headcount distribution by department.',
		formats: ['html'],
	},
	{
		id: 'compliance-log',
		label: 'Shift Compliance Log',
		description: 'A branded compliance report with punch in/out data and risk status.',
		formats: ['html'],
	},
	{
		id: 'complete-pack',
		label: 'Complete Analytics Pack',
		description: 'One polished printable report containing all weekly analytics sections.',
		formats: ['html'],
	},
]

function distributionWithPercentages(distribution) {
	const total = Math.max(1, distribution.reduce((sum, item) => sum + item.value, 0))
	return distribution.map((item) => ({
		...item,
		percent: Math.round((item.value / total) * 100),
	}))
}

function buildCoverageSeries(reports) {
	return (reports.weekLabels || []).map((label, index) => ({
		day: label,
		coveragePercent: reports.attendanceBars?.[index] ?? 0,
	}))
}

function buildSummaryCards(reports, branchName) {
	return (reports.metrics || []).slice(0, 3).map((item, index) => ({
		label: item.title,
		value: item.value,
		detail: item.delta || branchName,
		highlighted: index === 0,
	}))
}

function buildDateRangeLabel(dateRange) {
	if (!dateRange?.from || !dateRange?.to) {
		return 'Current reporting window'
	}

	return `${formatExportDate(dateRange.from)} to ${formatExportDate(dateRange.to)}`
}

function parseRangeBound(value, endOfDay = false) {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) {
		return null
	}

	if (endOfDay) {
		date.setHours(23, 59, 59, 999)
	} else {
		date.setHours(0, 0, 0, 0)
	}

	return date
}

function matchesDateRange(rowDate, dateRange) {
	if (!dateRange?.from || !dateRange?.to) {
		return true
	}

	const start = parseRangeBound(dateRange.from)
	const end = parseRangeBound(dateRange.to, true)
	const current = new Date(rowDate)
	if (!start || !end || Number.isNaN(current.getTime())) {
		return true
	}

	return current >= start && current <= end
}

function buildExecutiveSummaryDocument({ reports, manager, session, generatedAt, branchName, dateRange }) {
	return {
		brandName: branchName,
		brandSubtitle: 'ShiftSync workforce operations',
		reportTitle: 'Executive Weekly Summary',
		reportSubtitle: 'Headline staffing indicators for leadership review.',
		generatedAt,
		periodLabel: buildDateRangeLabel(dateRange),
		preparedBy: manager?.fullName || 'ShiftSync',
		preparedByEmail: session?.email || manager?.email || 'noreply@shiftsync.local',
		summaryCards: buildSummaryCards(reports, branchName),
		metadataRows: [
			['Workspace', branchName],
			['Capacity Score', `${reports.capacityPercent ?? 0}%`],
			['Metric Count', `${(reports.metrics || []).length}`],
			['Summary', reports.summary || 'Live staffing summary generated from the current week.'],
		],
		sections: [
			{
				title: 'Weekly KPI Summary',
				description: 'Core staffing indicators pulled from the current reporting window.',
				columns: ['Metric', 'Value', 'Delta'],
				rows: (reports.metrics || []).map((item) => [item.title, item.value, item.delta || '—']),
			},
		],
		footerLeft: `${(reports.metrics || []).length} metrics reviewed`,
		footerRight: `Capacity score: ${reports.capacityPercent ?? 0}%`,
		footerNote: `Report generated for ${branchName}.`,
	}
}

function buildCoverageDocument({ reports, manager, session, generatedAt, branchName, dateRange }) {
	const coverageSeries = buildCoverageSeries(reports)
	const bestDay = [...coverageSeries].sort((a, b) => b.coveragePercent - a.coveragePercent)[0]
	const lowestDay = [...coverageSeries].sort((a, b) => a.coveragePercent - b.coveragePercent)[0]
	const averageCoverage = coverageSeries.length
		? Math.round(coverageSeries.reduce((sum, item) => sum + item.coveragePercent, 0) / coverageSeries.length)
		: 0

	return {
		brandName: branchName,
		brandSubtitle: 'ShiftSync workforce operations',
		reportTitle: 'Weekly Coverage Trend',
		reportSubtitle: 'A printable day-by-day staffing coverage report.',
		generatedAt,
		periodLabel: buildDateRangeLabel(dateRange),
		preparedBy: manager?.fullName || 'ShiftSync',
		preparedByEmail: session?.email || manager?.email || 'noreply@shiftsync.local',
		summaryCards: [
			{ label: 'Average Coverage', value: `${averageCoverage}%`, detail: 'Across the visible week', highlighted: true },
			{ label: 'Best Day', value: bestDay ? `${bestDay.coveragePercent}%` : '0%', detail: bestDay?.day || 'No data' },
			{ label: 'Lowest Day', value: lowestDay ? `${lowestDay.coveragePercent}%` : '0%', detail: lowestDay?.day || 'No data' },
		],
		metadataRows: [
			['Workspace', branchName],
			['Coverage Days', `${coverageSeries.length}`],
			['Healthy Target', '90% or above'],
		],
		sections: [
			{
				title: 'Coverage by Day',
				description: 'Filled coverage versus open capacity in the selected window.',
				columns: ['Day', 'Coverage %', 'Gap %'],
				rows: coverageSeries.map((item) => [
					item.day,
					`${item.coveragePercent}%`,
					`${Math.max(0, 100 - item.coveragePercent)}%`,
				]),
			},
		],
		footerLeft: `${coverageSeries.length} day(s) tracked`,
		footerRight: `Average coverage: ${averageCoverage}%`,
		footerNote: `Best coverage day: ${bestDay?.day || 'N/A'} · Lowest coverage day: ${lowestDay?.day || 'N/A'}`,
	}
}

function buildDepartmentDocument({ reports, manager, session, generatedAt, branchName, dateRange }) {
	const distribution = distributionWithPercentages(reports.distribution || [])
	if (!distribution.length) {
		throw new Error('No department distribution data is available to export.')
	}

	return {
		brandName: branchName,
		brandSubtitle: 'ShiftSync workforce operations',
		reportTitle: 'Department & Team Mix',
		reportSubtitle: 'A workforce composition report with department shares.',
		generatedAt,
		periodLabel: buildDateRangeLabel(dateRange),
		preparedBy: manager?.fullName || 'ShiftSync',
		preparedByEmail: session?.email || manager?.email || 'noreply@shiftsync.local',
		summaryCards: [
			{ label: 'Active Segments', value: `${distribution.length}`, detail: 'Department groups represented', highlighted: true },
			{ label: 'Largest Segment', value: `${Math.max(...distribution.map((item) => item.percent))}%`, detail: 'Highest share' },
			{ label: 'Total Headcount', value: `${distribution.reduce((sum, item) => sum + item.value, 0)}`, detail: 'Visible workforce' },
		],
		metadataRows: [
			['Workspace', branchName],
			['Department Segments', `${distribution.length}`],
		],
		sections: [
			{
				title: 'Department Mix Table',
				description: 'Live headcount distribution across the selected workforce slice.',
				columns: ['Department', 'Headcount', 'Share %'],
				rows: distribution.map((item) => [item.label, `${item.value}`, `${item.percent}%`]),
			},
		],
		footerLeft: `${distribution.length} department segment(s)`,
		footerRight: `Headcount: ${distribution.reduce((sum, item) => sum + item.value, 0)}`,
		footerNote: `Distribution is based on the current filtered team view for ${branchName}.`,
	}
}

function buildComplianceDocument({ reports, manager, session, generatedAt, branchName, scope = 'full', searchTerm = '', dateRange }) {
	const searchLabel = searchTerm.trim() ? searchTerm.trim() : 'None'
	const rangeFilteredRows = (reports.recentCompliance || []).filter((row) => matchesDateRange(row.date, dateRange))
	const complianceRows = scope === 'filtered'
		? filterCompliance(rangeFilteredRows, searchTerm)
		: rangeFilteredRows

	if (!complianceRows.length) {
		throw new Error('No compliance log rows are available to export.')
	}

	return {
		brandName: branchName,
		brandSubtitle: 'ShiftSync workforce operations',
		reportTitle: 'Shift Compliance Log',
		reportSubtitle: 'A detailed attendance report with punch-in and punch-out timestamps.',
		generatedAt,
		periodLabel: `${buildDateRangeLabel(dateRange)}${scope === 'filtered' ? ` · Filtered by search: ${searchLabel}` : ''}`,
		preparedBy: manager?.fullName || 'ShiftSync',
		preparedByEmail: session?.email || manager?.email || 'noreply@shiftsync.local',
		summaryCards: [
			{ label: 'Rows Exported', value: `${complianceRows.length}`, detail: 'Visible compliance entries', highlighted: true },
			{ label: 'Risk Flags', value: `${complianceRows.filter((row) => row.danger).length}`, detail: 'Coverage gaps' },
			{ label: 'Safe Entries', value: `${complianceRows.filter((row) => !row.danger).length}`, detail: 'Normal status rows' },
		],
		metadataRows: [
			['Workspace', branchName],
			['Scope', scope === 'filtered' ? 'Current search results' : 'Full log'],
			['Search', searchLabel],
		],
		sections: [
			{
				title: 'Recent Shift Compliance',
				description: 'Actual attendance and schedule status pulled from the current manager view.',
				columns: [
					{ label: 'Employee' },
					{ label: 'Employee ID', nowrap: true },
					{ label: 'Shift Date', nowrap: true },
					{ label: 'Department' },
					{ label: 'Punch In', nowrap: true },
					{ label: 'Punch Out', nowrap: true },
					{ label: 'Status', nowrap: true },
					{ label: 'Risk Flag', nowrap: true },
				],
				rows: complianceRows.map((row) => [
					row.name,
					row.id,
					row.date,
					row.department,
					row.punchIn,
					row.punchOut || 'Pending',
					row.status,
					row.danger ? 'Coverage Gap' : 'Normal',
				]),
			},
		],
		footerLeft: `${complianceRows.length} compliance row(s)`,
		footerRight: `${complianceRows.filter((row) => row.danger).length} risk flags`,
		footerNote: 'Punch out values show the recorded attendance checkout timestamp when available.',
	}
}

function buildCompletePackDocument({ reports, manager, session, generatedAt, branchName, dateRange }) {
	const coverageSeries = buildCoverageSeries(reports)
	const distribution = distributionWithPercentages(reports.distribution || [])
	const complianceRows = reports.recentCompliance || []

	return {
		brandName: branchName,
		brandSubtitle: 'ShiftSync workforce operations',
		reportTitle: 'Complete Analytics Pack',
		reportSubtitle: 'A printable workbook-style export with every weekly analytics section.',
		generatedAt,
		periodLabel: buildDateRangeLabel(dateRange),
		preparedBy: manager?.fullName || 'ShiftSync',
		preparedByEmail: session?.email || manager?.email || 'noreply@shiftsync.local',
		summaryCards: buildSummaryCards(reports, branchName),
		metadataRows: [
			['Workspace', branchName],
			['Coverage Days', `${coverageSeries.length}`],
			['Department Segments', `${distribution.length}`],
			['Compliance Rows', `${complianceRows.length}`],
		],
		sections: [
			{
				title: 'Executive Weekly Summary',
				columns: ['Metric', 'Value', 'Delta'],
				rows: (reports.metrics || []).map((item) => [item.title, item.value, item.delta || '—']),
			},
			{
				title: 'Weekly Coverage Trend',
				columns: ['Day', 'Coverage %', 'Gap %'],
				rows: coverageSeries.map((item) => [item.day, `${item.coveragePercent}%`, `${Math.max(0, 100 - item.coveragePercent)}%`]),
			},
			{
				title: 'Department & Team Mix',
				columns: ['Department', 'Headcount', 'Share %'],
				rows: distribution.map((item) => [item.label, `${item.value}`, `${item.percent}%`]),
			},
			{
				title: 'Shift Compliance Log',
				columns: [
					{ label: 'Employee' },
					{ label: 'Employee ID', nowrap: true },
					{ label: 'Shift Date', nowrap: true },
					{ label: 'Department' },
					{ label: 'Punch In', nowrap: true },
					{ label: 'Punch Out', nowrap: true },
					{ label: 'Status', nowrap: true },
					{ label: 'Risk Flag', nowrap: true },
				],
				rows: complianceRows.map((row) => [
					row.name,
					row.id,
					row.date,
					row.department,
					row.punchIn,
					row.punchOut || 'Pending',
					row.status,
					row.danger ? 'Coverage Gap' : 'Normal',
				]),
			},
		],
		footerLeft: `${(reports.metrics || []).length} metrics • ${coverageSeries.length} days • ${distribution.length} segments`,
		footerRight: `${complianceRows.length} compliance entries`,
		footerNote: `Complete analytics pack exported for ${branchName}.`,
	}
}

export function buildReportExport({ type, reports, manager, session, searchTerm, scope = 'full', dateRange }) {
	const branchName = manager?.branchName || 'Ngabo Pharmacy'
	const generatedAt = new Date().toISOString()

	if (type === 'executive-summary') {
		return {
			filenameBase: 'weekly-executive-summary',
			summary: 'Executive weekly summary exported.',
			document: buildExecutiveSummaryDocument({ reports, manager, session, generatedAt, branchName, dateRange }),
		}
	}

	if (type === 'weekly-coverage') {
		return {
			filenameBase: 'weekly-coverage-trend',
			summary: `${(reports.weekLabels || []).length}-day coverage trend exported.`,
			document: buildCoverageDocument({ reports, manager, session, generatedAt, branchName, dateRange }),
		}
	}

	if (type === 'department-mix') {
		return {
			filenameBase: 'department-team-mix',
			summary: `${(reports.distribution || []).length} department segment(s) exported.`,
			document: buildDepartmentDocument({ reports, manager, session, generatedAt, branchName, dateRange }),
		}
	}

	if (type === 'compliance-log') {
		return {
			filenameBase: 'shift-compliance-log',
			summary: 'Compliance log exported successfully.',
			document: buildComplianceDocument({ reports, manager, session, generatedAt, branchName, scope, searchTerm, dateRange }),
		}
	}

	if (type === 'complete-pack') {
		return {
			filenameBase: 'complete-analytics-pack',
			summary: 'Complete analytics pack exported with all weekly sections.',
			document: buildCompletePackDocument({ reports, manager, session, generatedAt, branchName, dateRange }),
		}
	}

	throw new Error('Choose a report type before exporting.')
}

export async function executeReportExport({ type, format, ...context }) {
	if (format !== 'html') {
		throw new Error('Printable report is the only available export format.')
	}

	const payload = buildReportExport({ type, ...context })
	const logoUrl = await resolveShiftSyncLogoDataUrl()
	await downloadBrandedReport(
		buildDatedFilename(payload.filenameBase, context.dateRange, 'pdf'),
		buildBrandedReportDocument({ ...payload.document, logoUrl }),
	)
	return payload.summary
}

function filterCompliance(rows, searchTerm) {
	const query = searchTerm.trim().toLowerCase()
	if (!query) {
		return rows
	}

	return rows.filter((row) => [row.name, row.id, row.date, row.department, row.punchIn, row.punchOut, row.status].join(' ').toLowerCase().includes(query))
}
