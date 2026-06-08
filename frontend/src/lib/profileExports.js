import { buildBrandedReportDocument, buildDatedFilename, downloadBrandedReport, formatExportDate, resolveShiftSyncLogoDataUrl } from './export'

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const PROFILE_EXPORT_OPTIONS = [
	{
		id: 'roster',
		label: 'Employee Roster',
		description: 'Printable employee roster for the currently filtered workforce view.',
		formats: ['html'],
	},
	{
		id: 'workforce-register',
		label: 'Workforce Register',
		description: 'Printable register with status details for the visible roster rows.',
		formats: ['html'],
	},
	{
		id: 'profile-dossier',
		label: 'Selected Employee Dossier',
		description: 'Printable profile dossier for the employee currently open in the side panel.',
		requiresSelection: true,
		formats: ['html'],
	},
]

function buildDateRangeLabel(dateRange) {
	if (!dateRange?.from || !dateRange?.to) {
		return 'Current roster snapshot'
	}

	return `${formatExportDate(dateRange.from)} to ${formatExportDate(dateRange.to)}`
}

export function buildProfileExport({ type, roster, featured, manager, session, rosterFilter, searchTerm, dateRange }) {
	const branchName = manager?.branchName || 'Ngabo Pharmacy'
	const generatedAt = new Date().toISOString()
	const filterLabel = rosterFilter === 'all' ? 'All employees' : rosterFilter === 'inactive' ? 'Inactive only' : 'Active only'
	const searchLabel = searchTerm.trim() || 'None'

	if (type === 'profile-dossier') {
		if (!featured?.userId) {
			throw new Error('Select an employee from the roster before exporting a profile dossier.')
		}

		const weeklyAvailability = (featured.weeklyAvailability || []).map((available, index) => ({
			day: DAY_LABELS[index] || `Day ${index + 1}`,
			available: Boolean(available),
		}))

		return {
			filenameBase: `employee-dossier-${slugify(featured.name)}`,
			summary: `Profile dossier prepared for ${featured.name}.`,
			document: {
				brandName: branchName,
				brandSubtitle: 'ShiftSync workforce operations',
				reportTitle: 'Selected Employee Dossier',
				reportSubtitle: 'A detailed employee profile for operational review.',
				generatedAt,
				periodLabel: buildDateRangeLabel(dateRange),
				preparedBy: manager?.fullName || 'ShiftSync',
				preparedByEmail: session?.email || manager?.email || 'noreply@shiftsync.local',
				summaryCards: [
					{ label: 'Employee', value: featured.name, detail: featured.employeeCode, highlighted: true },
					{ label: 'Role', value: featured.role, detail: featured.active === false ? 'Inactive account' : 'Active account' },
					{ label: 'Workload', value: featured.workload, detail: 'Current allocation' },
				],
				metadataRows: [
					['Email', featured.email],
					['Phone', featured.phoneNumber],
					['Hired Date', featured.hiredDate],
					['Location', featured.location],
					['Core Expertise', (featured.expertise || []).join(', ') || 'None'],
				],
				sections: [
					{
						title: 'Employee Profile Details',
						columns: [{ label: 'Field' }, { label: 'Value' }],
						rows: [
							['Full Name', featured.name],
							['Employee Code', featured.employeeCode],
							['Role', featured.role],
							['Email', featured.email],
							['Phone', featured.phoneNumber],
							['Hired Date', featured.hiredDate],
							['Location', featured.location],
							['Current Workload', featured.workload],
							['Account Status', featured.active === false ? 'Inactive' : 'Active'],
						],
					},
					{
						title: 'Weekly Availability',
						columns: [{ label: 'Day', nowrap: true }, { label: 'Available', nowrap: true }],
						rows: weeklyAvailability.map((item) => [item.day, item.available ? 'Yes' : 'No']),
					},
				],
				footerLeft: `${featured.name} profile dossier`,
				footerRight: `${weeklyAvailability.filter((item) => item.available).length} available day(s)`,
				footerNote: `Prepared from the live employee profile for ${branchName}.`,
			},
		}
	}

	if (!roster.length) {
		throw new Error('There are no employee rows to export for the current filter.')
	}

	if (type === 'workforce-register') {
		return {
			filenameBase: 'workforce-register',
			summary: `${roster.length} employee record(s) exported from the workforce register.`,
			document: {
				brandName: branchName,
				brandSubtitle: 'ShiftSync workforce operations',
				reportTitle: 'Workforce Register',
				reportSubtitle: 'A printable employee register for the visible roster rows.',
				generatedAt,
				periodLabel: buildDateRangeLabel(dateRange),
				preparedBy: manager?.fullName || 'ShiftSync',
				preparedByEmail: session?.email || manager?.email || 'noreply@shiftsync.local',
				summaryCards: [
					{ label: 'Visible Employees', value: `${roster.length}`, detail: filterLabel, highlighted: true },
					{ label: 'Search', value: searchLabel, detail: 'Current filter query' },
				],
				metadataRows: [
					['Workspace', branchName],
					['Filter', filterLabel],
					['Search', searchLabel],
				],
				sections: [
					{
						title: 'Employee Register',
						columns: [
							{ label: 'Name' },
							{ label: 'Role' },
							{ label: 'Department' },
							{ label: 'Account Status', nowrap: true },
							{ label: 'Shift Status', nowrap: true },
							{ label: 'Next Shift', nowrap: true },
						],
						rows: roster.map((employee) => [
							employee.name,
							employee.role,
							employee.department,
							employee.active === false ? 'Inactive' : 'Active',
							employee.status,
							employee.shift,
						]),
					},
				],
				footerLeft: `${roster.length} employee record(s)`,
				footerRight: `Filter: ${filterLabel}`,
				footerNote: `Generated from the live roster filter for ${branchName}.`,
			},
		}
	}

	return {
		filenameBase: 'employee-roster',
		summary: `${roster.length} roster row(s) exported.`,
		document: {
			brandName: branchName,
			brandSubtitle: 'ShiftSync workforce operations',
			reportTitle: 'Employee Roster',
			reportSubtitle: 'A printable roster summary for the current directory view.',
			generatedAt,
			periodLabel: buildDateRangeLabel(dateRange),
			preparedBy: manager?.fullName || 'ShiftSync',
			preparedByEmail: session?.email || manager?.email || 'noreply@shiftsync.local',
			summaryCards: [
				{ label: 'Visible Employees', value: `${roster.length}`, detail: filterLabel, highlighted: true },
				{ label: 'Search', value: searchLabel, detail: 'Current filter query' },
			],
			metadataRows: [
				['Workspace', branchName],
				['Filter', filterLabel],
				['Search', searchLabel],
			],
			sections: [
				{
					title: 'Employee Roster',
					columns: [
						{ label: 'Name' },
						{ label: 'Role' },
						{ label: 'Department' },
						{ label: 'Status', nowrap: true },
						{ label: 'Shift', nowrap: true },
					],
					rows: roster.map((employee) => [employee.name, employee.role, employee.department, employee.status, employee.shift]),
				},
			],
			footerLeft: `${roster.length} roster row(s)`,
			footerRight: `Filter: ${filterLabel}`,
			footerNote: `Generated from the live roster filter for ${branchName}.`,
		},
	}
}

export async function executeProfileExport({ type, format, ...context }) {
	if (format !== 'html') {
		throw new Error('Printable report is the only available export format.')
	}

	const payload = buildProfileExport({ type, ...context })
	const logoUrl = await resolveShiftSyncLogoDataUrl()
	await downloadBrandedReport(
		buildDatedFilename(payload.filenameBase, context.dateRange, 'pdf'),
		buildBrandedReportDocument({ ...payload.document, logoUrl }),
	)
	return payload.summary
}

function slugify(value) {
	return String(value || 'employee')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
}
