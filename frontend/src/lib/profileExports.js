import { buildDatedFilename, downloadJson, downloadText, rowsToCsv } from './export'

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const PROFILE_EXPORT_OPTIONS = [
	{
		id: 'roster',
		label: 'Employee Roster',
		description: 'Spreadsheet of the employees currently shown in your table filter (name, role, department, status, shift).',
	},
	{
		id: 'workforce-register',
		label: 'Workforce Register',
		description: 'Extended directory including account status for every employee in the current roster filter.',
	},
	{
		id: 'profile-dossier',
		label: 'Selected Employee Dossier',
		description: 'Detailed profile for the employee open in the side panel — contact info, workload, expertise, and availability.',
		requiresSelection: true,
	},
]

export function buildProfileExport({ type, roster, featured, manager, rosterFilter, searchTerm }) {
	const branchName = manager?.branchName || 'Ngabo Pharmacy'
	const generatedAt = new Date().toISOString()
	const filterLabel = rosterFilter === 'all' ? 'All employees' : rosterFilter === 'inactive' ? 'Inactive only' : 'Active only'
	const searchLabel = searchTerm.trim() || 'None'

	if (type === 'profile-dossier') {
		if (!featured?.userId) {
			throw new Error('Select an employee from the roster before exporting a profile dossier.')
		}

		const availability = (featured.weeklyAvailability || []).map((available, index) => ({
			day: DAY_LABELS[index] || `Day ${index + 1}`,
			available: Boolean(available),
		}))

		const csvRows = [
			['ShiftSync Employee Profile Dossier'],
			['Generated', generatedAt],
			['Branch', branchName],
			[],
			['Field', 'Value'],
			['Full Name', featured.name],
			['Employee Code', featured.employeeCode],
			['Role', featured.role],
			['Email', featured.email],
			['Phone', featured.phoneNumber],
			['Hired Date', featured.hiredDate],
			['Location', featured.location],
			['Current Workload', featured.workload],
			['Account Status', featured.active === false ? 'Inactive' : 'Active'],
			['Core Expertise', (featured.expertise || []).join('; ')],
			[],
			['Day', 'Available'],
			...availability.map((item) => [item.day, item.available ? 'Yes' : 'No']),
		]

		const json = {
			meta: {
				exportType: 'profile-dossier',
				generatedAt,
				branch: branchName,
			},
			employee: {
				userId: featured.userId,
				name: featured.name,
				employeeCode: featured.employeeCode,
				role: featured.role,
				email: featured.email,
				phoneNumber: featured.phoneNumber,
				hiredDate: featured.hiredDate,
				location: featured.location,
				workload: featured.workload,
				active: featured.active !== false,
				expertise: featured.expertise || [],
				weeklyAvailability: availability,
			},
		}

		return {
			csv: rowsToCsv(csvRows),
			json,
			filenameBase: `employee-dossier-${slugify(featured.name)}`,
			summary: `Profile dossier prepared for ${featured.name}.`,
		}
	}

	if (!roster.length) {
		throw new Error('There are no employee rows to export for the current filter.')
	}

	if (type === 'workforce-register') {
		const csvRows = [
			['ShiftSync Workforce Register'],
			['Generated', generatedAt],
			['Branch', branchName],
			['Filter', filterLabel],
			['Search', searchLabel],
			[],
			['Name', 'Role', 'Department', 'Account Status', 'Shift Status', 'Next Shift'],
			...roster.map((employee) => [
				employee.name,
				employee.role,
				employee.department,
				employee.active === false ? 'Inactive' : 'Active',
				employee.status,
				employee.shift,
			]),
		]

		const json = {
			meta: { exportType: 'workforce-register', generatedAt, branch: branchName, filter: filterLabel, search: searchLabel },
			employees: roster.map((employee) => ({
				userId: employee.userId,
				name: employee.name,
				role: employee.role,
				department: employee.department,
				active: employee.active !== false,
				status: employee.status,
				shift: employee.shift,
			})),
		}

		return {
			csv: rowsToCsv(csvRows),
			json,
			filenameBase: 'workforce-register',
			summary: `${roster.length} employee record(s) exported from the workforce register.`,
		}
	}

	const csvRows = [
		['ShiftSync Employee Roster'],
		['Generated', generatedAt],
		['Branch', branchName],
		['Filter', filterLabel],
		['Search', searchLabel],
		[],
		['Name', 'Role', 'Department', 'Status', 'Shift'],
		...roster.map((employee) => [employee.name, employee.role, employee.department, employee.status, employee.shift]),
	]

	const json = {
		meta: { exportType: 'roster', generatedAt, branch: branchName, filter: filterLabel, search: searchLabel },
		roster: roster.map((employee) => ({
			userId: employee.userId,
			name: employee.name,
			role: employee.role,
			department: employee.department,
			status: employee.status,
			shift: employee.shift,
			active: employee.active !== false,
		})),
	}

	return {
		csv: rowsToCsv(csvRows),
		json,
		filenameBase: 'employee-roster',
		summary: `${roster.length} roster row(s) exported.`,
	}
}

export function executeProfileExport({ type, format, ...context }) {
	const payload = buildProfileExport({ type, ...context })

	if (format === 'json') {
		downloadJson(payload.json, buildDatedFilename(payload.filenameBase, 'json'))
	} else {
		downloadText(payload.csv, buildDatedFilename(payload.filenameBase, 'csv'), 'text/csv;charset=utf-8;')
	}

	return payload.summary
}

function slugify(value) {
	return String(value || 'employee')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
}
