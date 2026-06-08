const knowledgeBase = [
	{
		id: 'system-overview',
		title: 'What ShiftSync is',
		keywords: ['what is this system', 'what is shiftsync', 'about this system', 'what does this system do', 'about shiftsync', 'system overview'],
		answer:
			'ShiftSync is an intelligent employee shift scheduling system for pharmacy workforce management. It helps managers create weekly shifts, assign employees fairly, handle adjustments and swaps, track compliance, monitor reports, and keep employees informed through dashboards, notifications, and email reminders.',
		route: '/',
	},
	{
		id: 'login-help',
		title: 'How login works',
		keywords: ['how does log in work', 'how does login work', 'login help', 'sign in help', 'how to login', 'how to sign in'],
		answer:
			'Users sign in with their email address and password. After login, ShiftSync redirects them automatically based on role: manager, employee, or admin. If a manager created the account with a temporary password, the user must change that password on first login. If they forget the password, they can use Forgot Password to receive reset instructions by email.',
		route: '/login',
	},
	{
		id: 'manager-overview',
		title: 'Manager dashboard overview',
		keywords: ['overview', 'dashboard', 'manager dashboard', 'summary', 'coverage', 'scheduled shifts'],
		answer:
			'The manager dashboard summarizes scheduled shifts, staffing coverage, total employees, and pending adjustments. Coverage is based on filled required role slots for the current week, so when assignments change the numbers update from live backend data.',
		route: '/overview',
	},
	{
		id: 'weekly-scheduling',
		title: 'Weekly shift scheduling',
		keywords: ['schedule', 'scheduling', 'weekly shifts', 'auto schedule', 'assign shift', 'create weekly shifts', 'calendar'],
		answer:
			'Scheduling is built around a weekly rota. Ngabo Pharmacy uses two daily shifts: 1st Shift from 07:00 to 15:00 and 2nd Shift from 15:00 to 23:00. The manager can reset the visible week with Create Weekly Shifts, use Auto Schedule to fill roles, and then manually assign, reassign, or remove employees directly from the grid. A valid shift should have one Pharmacist and one Pharmacy Assistant / Attendant.',
		route: '/scheduling',
	},
	{
		id: 'scheduling-rules',
		title: 'Scheduling rules',
		keywords: ['rules', 'two shifts', 'same day', 'pharmacist', 'assistant', 'coverage gap', 'validation', 'rest rules'],
		answer:
			'The scheduler enforces key rules: one employee should not hold two shifts on the same day, and each shift should keep the required roles covered. The manager is alerted when coverage is missing, especially if Pharmacist or Pharmacy Assistant / Attendant coverage is incomplete.',
		route: '/scheduling',
	},
	{
		id: 'swap-flow',
		title: 'Shift swap approval flow',
		keywords: ['swap', 'peer response', 'approve swap', 'reject swap', 'manager decision', 'adjustment'],
		answer:
			'Shift swaps follow a two-step approval flow. First, the peer employee accepts or rejects the swap. After that, the manager has final authority. Once the manager approves, the assignment is updated in both employee calendars and in the manager scheduling view.',
		route: '/adjustments',
	},
	{
		id: 'adjustments',
		title: 'Shift adjustments',
		keywords: ['adjustment', 'time off', 'swap request', 'shift adjustment', 'request change'],
		answer:
			'Employees can submit time-off and swap requests from My Schedule. Managers review these in Shift Adjustments, filter by readiness, and approve or reject requests with notes. Notifications update across the employee, peer, and manager sides.',
		route: '/adjustments',
	},
	{
		id: 'notifications',
		title: 'Notifications and alerts',
		keywords: ['notification', 'alert', 'message', 'bell', 'unread', 'mark as read', 'email reminder'],
		answer:
			'Notifications support unread counts, detail views, mark read or unread, and route-to-page actions when a message relates to a schedule, adjustment, or settings task. Employees also receive email reminders for upcoming shifts and weekly assignment summaries.',
		route: '/notifications',
	},
	{
		id: 'employee-overview',
		title: 'Employee dashboard',
		keywords: ['employee dashboard', 'my overview', 'employee overview', 'my dashboard'],
		answer:
			'The employee dashboard shows live assignments, unread notifications, manager contact information, payroll highlights, and quick access to schedule, announcements, and profile details. If an employee has no assigned shifts yet, the dashboard stays intentionally light until real schedule data exists.',
		route: '/employee-dashboard',
	},
	{
		id: 'employee-schedule',
		title: 'Employee schedule',
		keywords: ['my schedule', 'employee schedule', 'calendar', 'assigned shift', 'weekly rota'],
		answer:
			"My Schedule shows the employee's real weekly assignments from the backend. When a manager changes assignments, the updated shifts appear after refresh. Employees can also request time off and start swap requests from this page.",
		route: '/employee-schedule',
	},
	{
		id: 'payroll',
		title: 'Monthly payroll',
		keywords: ['salary', 'pay', 'payroll', 'earnings', 'rwf', 'monthly', 'payslip'],
		answer:
			'Payroll is monthly and shown in RWF. The Earnings & Pay page displays current month earnings, year-to-date totals, recent payroll records, and payslip details using live backend data instead of placeholders.',
		route: '/employee-earnings',
	},
	{
		id: 'employee-profile',
		title: 'Employee profile',
		keywords: ['profile', 'my profile', 'phone', 'emergency contact', 'certification', 'personal info'],
		answer:
			'Employees can manage their profile details, including personal contact information, emergency contact data, and account display information. Managers can also create new employees, and those employees must change their temporary password on first login.',
		route: '/employee-profile',
	},
	{
		id: 'employee-creation',
		title: 'Manager creates employee accounts',
		keywords: ['create employee', 'temporary password', 'first login', 'credentials email', 'new employee'],
		answer:
			'When a manager creates an employee, ShiftSync creates a real login-ready account, assigns a temporary password, and requires a password change at first login. The system also attempts to send the credentials by email to the new employee.',
		route: '/profiles',
	},
	{
		id: 'forgot-password',
		title: 'Forgot password',
		keywords: ['forgot password', 'reset password', 'password reset', 'can not login', 'cannot login', 'i forgot my password'],
		answer:
			'The login page supports Forgot Password. When the user submits their email, ShiftSync generates a temporary password, emails reset instructions, and requires a password change at the next successful login.',
		route: '/login',
	},
	{
		id: 'compliance',
		title: 'Compliance and policy checks',
		keywords: ['compliance', 'policy', 'audit', 'rules', 'overtime', 'rest hours'],
		answer:
			'Compliance & Policies lets the manager review policy records, recent audit activity, and operational rules. The scheduling side is being aligned to enforce staffing and compliance requirements before invalid assignments are saved.',
		route: '/compliances',
	},
	{
		id: 'reports',
		title: 'Reports and analytics',
		keywords: ['reports', 'analytics', 'chart', 'compliance table', 'fairness', 'coverage trend'],
		answer:
			'Reports & Analytics combines operational summary cards, coverage insights, team-mix visuals, and Recent Shift Compliance. The compliance table is based on real assignment data so managers can track scheduled, completed, and gap-related shift activity.',
		route: '/reports',
	},
	{
		id: 'settings',
		title: 'Settings and account controls',
		keywords: ['settings', 'preferences', 'account settings', 'notification settings', 'theme'],
		answer:
			'Settings pages cover account preferences, notification controls, privacy choices, password updates, and scheduling-related operational settings. Theme mode is supported across the app, and sessions automatically expire after inactivity.',
		route: '/manager-settings',
	},
]

function normalizeText(value) {
	return (value || '')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function scoreEntry(entry, normalizedQuery) {
	if (!normalizedQuery) {
		return 0
	}

	let score = 0
	for (const keyword of entry.keywords) {
		const normalizedKeyword = normalizeText(keyword)
		if (!normalizedKeyword) {
			continue
		}

		if (normalizedQuery === normalizedKeyword) {
			score += 5
			continue
		}

		if (normalizedQuery.includes(normalizedKeyword)) {
			score += normalizedKeyword.split(' ').length > 1 ? 4 : 2
		}
	}

	if (normalizedQuery.includes(normalizeText(entry.title))) {
		score += 3
	}

	return score
}

export function getContextualHelp(pathname = '/', role = 'GUEST') {
	const path = pathname.toLowerCase()

	if (path.includes('/scheduling')) {
		return 'You are on Shift Scheduling. I can explain auto scheduling, manual assignment, swap rules, and coverage checks.'
	}

	if (path.includes('/adjustments')) {
		return 'You are on Shift Adjustments. I can help with peer responses, manager approval flow, and request statuses.'
	}

	if (path.includes('/employee-schedule')) {
		return 'You are on My Schedule. I can explain assigned shifts, swap requests, time off, and reminder emails.'
	}

	if (path.includes('/employee-earnings')) {
		return 'You are on Earnings & Pay. I can explain monthly payroll, RWF amounts, and payroll history.'
	}

	if (path.includes('/reports')) {
		return 'You are on Reports & Analytics. I can explain coverage metrics, compliance rows, and staffing insights.'
	}

	if (role === 'MANAGER') {
		return 'I can help with manager workflows like employee creation, scheduling, compliance, reports, and notifications.'
	}

	if (role === 'EMPLOYEE') {
		return 'I can help with employee workflows like schedule, payroll, announcements, profile, and notifications.'
	}

	return 'I can answer questions about login, scheduling, payroll, notifications, and other ShiftSync workflows.'
}

export function answerKnowledgeQuery(query, role = 'GUEST', pathname = '/') {
	const normalizedQuery = normalizeText(query)

	if (!normalizedQuery) {
		return {
			answer: getContextualHelp(pathname, role),
			route: null,
			topic: 'ShiftSync help',
		}
	}

	if (['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'].includes(normalizedQuery)) {
		return {
			answer: `${getContextualHelp(pathname, role)} Ask me about scheduling, payroll, compliance, swaps, notifications, or login help.`,
			route: null,
			topic: 'Welcome',
		}
	}

	const ranked = knowledgeBase
		.map((entry) => ({ entry, score: scoreEntry(entry, normalizedQuery) }))
		.filter((candidate) => candidate.score > 0)
		.sort((left, right) => right.score - left.score)

	if (ranked.length) {
		const best = ranked[0].entry
		return {
			answer: best.answer,
			route: best.route || null,
			topic: best.title,
		}
	}

	if (normalizedQuery.includes('system') || normalizedQuery.includes('shiftsync')) {
		return {
			answer:
				'ShiftSync is a workforce scheduling system that helps managers create weekly pharmacy shifts, assign staff, review swap or time-off requests, monitor compliance, and keep employees updated through schedules, notifications, payroll views, and email reminders.',
			route: '/',
			topic: 'What ShiftSync is',
		}
	}

	if (normalizedQuery.includes('login') || normalizedQuery.includes('log in') || normalizedQuery.includes('sign in')) {
		return {
			answer:
				'Login uses email and password. After successful sign-in, ShiftSync routes the user to the correct dashboard for their role. New employees created by a manager use a temporary password first and must change it after the first login.',
			route: '/login',
			topic: 'How login works',
		}
	}

	return {
		answer:
			"I couldn't map that to one specific module yet, but I can help with manager scheduling, employee dashboards, payroll, password resets, notifications, swap approvals, and reports.",
		route: null,
		topic: 'General help',
	}
}
