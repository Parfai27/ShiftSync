import { buildDatedFilename, downloadJson, downloadText, rowsToCsv } from './export'

export const REPORT_EXPORT_OPTIONS = [
	{
		id: 'executive-summary',
		label: 'Executive Weekly Summary',
		description: 'Headline: headline KPIs, capacity score, and branch context for leadership review.',
		formats: ['csv', 'json'],
	},
	{
		id: 'weekly-coverage',
		label: 'Weekly Coverage Trend',
		description: 'Day-by-day staffing coverage percentages for the current reporting window.',
		formats: ['csv', 'json'],
	},
	{
		id: 'department-mix',
		label: 'Department & Team Mix',
		description: 'Headcount distribution across pharmacy departments with share percentages.',
		formats: ['csv', 'json'],
	},
	{
		id: 'compliance-log',
		label: 'Shift Compliance Log',
		description: 'Detailed assignment log with shift dates, punch-in times, and compliance status.',
		formats: ['csv', 'json'],
	},
	{
		id: 'complete-pack',
		label: 'Complete Analytics Pack',
		description: 'All weekly analyses combined into one structured workbook-style CSV.',
		formats: ['csv'],
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

export function buildReportExport({ type, reports, manager, searchTerm, scope = 'full' }) {
	const branchName = manager?.branchName || 'Ngabo Pharmacy'
	const generatedAt = new Date().toISOString()
	const searchLabel = searchTerm?.trim() ? searchTerm.trim() : 'None'

	const complianceRows = scope === 'filtered'
		? filterCompliance(reports.recentCompliance, searchTerm)
		: reports.recentCompliance || []

	const coverageSeries = buildCoverageSeries(reports)
	const distribution = distributionWithPercentages(reports.distribution || [])

	if (type === 'executive-summary') {
		const csvRows = [
			['ShiftSync Executive Weekly Summary'],
			['Generated', generatedAt],
			['Branch', branchName],
			['Reporting Window', 'Current week (7-day coverage view)'],
			[],
			['Metric', 'Value', 'Delta'],
			...(reports.metrics || []).map((item) => [item.title, item.value, item.delta]),
			[],
			['Capacity Score', `${reports.capacityPercent ?? 0}%`],
			['Summary', reports.summary || ''],
		]

		const json = {
			meta: { exportType: 'executive-summary', generatedAt, branch: branchName },
			summary: reports.summary,
			capacityPercent: reports.capacityPercent,
			metrics: reports.metrics,
		}

		return {
			csv: rowsToCsv(csvRows),
			json,
			filenameBase: 'weekly-executive-summary',
			summary: 'Executive weekly summary exported.',
		}
	}

	if (type === 'weekly-coverage') {
		const csvRows = [
			['ShiftSync Weekly Coverage Trend'],
			['Generated', generatedAt],
			['Branch', branchName],
			[],
			['Day', 'Coverage %', 'Gap %'],
			...coverageSeries.map((item) => [item.day, item.coveragePercent, Math.max(0, 100 - item.coveragePercent)]),
		]

		const json = {
			meta: { exportType: 'weekly-coverage', generatedAt, branch: branchName },
			series: coverageSeries,
		}

		return {
			csv: rowsToCsv(csvRows),
			json,
			filenameBase: 'weekly-coverage-trend',
			summary: `${coverageSeries.length}-day coverage trend exported.`,
		}
	}

	if (type === 'department-mix') {
		if (!distribution.length) {
			throw new Error('No department distribution data is available to export.')
		}

		const csvRows = [
			['ShiftSync Department & Team Mix'],
			['Generated', generatedAt],
			['Branch', branchName],
			[],
			['Department', 'Headcount', 'Share %'],
			...distribution.map((item) => [item.label, item.value, item.percent]),
		]

		const json = {
			meta: { exportType: 'department-mix', generatedAt, branch: branchName },
			distribution,
		}

		return {
			csv: rowsToCsv(csvRows),
			json,
			filenameBase: 'department-team-mix',
			summary: `${distribution.length} department segment(s) exported.`,
		}
	}

	if (type === 'compliance-log') {
		if (!complianceRows.length) {
			throw new Error('No compliance log rows are available to export.')
		}

		const csvRows = [
			['ShiftSync Shift Compliance Log'],
			['Generated', generatedAt],
			['Branch', branchName],
			['Scope', scope === 'filtered' ? `Filtered by search: ${searchLabel}` : 'Full log'],
			[],
			['Employee', 'Employee ID', 'Shift Date', 'Department', 'Punch In', 'Status', 'Risk Flag'],
			...complianceRows.map((row) => [row.name, row.id, row.date, row.department, row.punchIn, row.status, row.danger ? 'Coverage Gap' : 'Normal']),
		]

		const json = {
			meta: { exportType: 'compliance-log', generatedAt, branch: branchName, scope, search: searchLabel },
			rows: complianceRows,
		}

		return {
			csv: rowsToCsv(csvRows),
			json,
			filenameBase: 'shift-compliance-log',
			summary: `${complianceRows.length} compliance log row(s) exported.`,
		}
	}

	if (type === 'complete-pack') {
		const sections = [
			['ShiftSync Complete Analytics Pack'],
			['Generated', generatedAt],
			['Branch', branchName],
			['Reporting Window', 'Current week (7-day coverage view)'],
			[],
			['=== EXECUTIVE SUMMARY ==='],
			['Metric', 'Value', 'Delta'],
			...(reports.metrics || []).map((item) => [item.title, item.value, item.delta]),
			['Capacity Score', `${reports.capacityPercent ?? 0}%`],
			[],
			['=== WEEKLY COVERAGE TREND ==='],
			['Day', 'Coverage %', 'Gap %'],
			...coverageSeries.map((item) => [item.day, item.coveragePercent, Math.max(0, 100 - item.coveragePercent)]),
			[],
			['=== DEPARTMENT & TEAM MIX ==='],
			['Department', 'Headcount', 'Share %'],
			...distribution.map((item) => [item.label, item.value, item.percent]),
			[],
			['=== SHIFT COMPLIANCE LOG ==='],
			['Employee', 'Employee ID', 'Shift Date', 'Department', 'Punch In', 'Status', 'Risk Flag'],
			...complianceRows.map((row) => [row.name, row.id, row.date, row.department, row.punchIn, row.status, row.danger ? 'Coverage Gap' : 'Normal']),
		]

		return {
			csv: rowsToCsv(sections),
			json: null,
			filenameBase: 'complete-analytics-pack',
			summary: 'Complete analytics pack exported with all weekly sections.',
		}
	}

	throw new Error('Choose a report type before exporting.')
}

export function executeReportExport({ type, format, ...context }) {
	const payload = buildReportExport({ type, ...context })

	if (format === 'json') {
		if (!payload.json) {
			throw new Error('This report type is only available as CSV.')
		}
		downloadJson(payload.json, buildDatedFilename(payload.filenameBase, 'json'))
	} else {
		downloadText(payload.csv, buildDatedFilename(payload.filenameBase, 'csv'), 'text/csv;charset=utf-8;')
	}

	return payload.summary
}

function filterCompliance(rows, searchTerm) {
	const query = searchTerm.trim().toLowerCase()
	if (!query) {
		return rows
	}

	return rows.filter((row) => [row.name, row.id, row.date, row.department, row.punchIn, row.status].join(' ').toLowerCase().includes(query))
}
