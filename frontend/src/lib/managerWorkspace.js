import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from './api'
import { loadSession } from './session'

const emptyWorkspace = {
	manager: {
		userId: null,
		fullName: 'Shift Manager',
		roleLabel: 'Shift Manager',
		branchName: 'Ngabo Pharmacy',
		profileImageUrl: '',
	},
	profiles: {
		summary: '',
		paginationLabel: '',
		roster: [],
		featuredEmployee: null,
	},
	scheduling: {
		summary: '',
		stats: [],
		days: [],
		rows: [],
		weeklyBoard: {
			label: '',
			days: [],
		},
		legend: [],
		overview: null,
		suggestion: null,
	},
	adjustments: {
		summary: '',
		requests: [],
		checks: [],
		metrics: [],
		recentActivity: [],
	},
	notifications: {
		summary: '',
		todayLabel: 'Today',
		earlierLabel: 'Earlier',
		folders: [],
		priorityFolders: [],
		todayItems: [],
		earlierItems: [],
		summaryCards: { unread: 0, urgent: 0 },
		liveFeedTitle: '',
		liveFeedDescription: '',
	},
	compliance: {
		summary: '',
		alert: null,
		activePolicies: '0',
		complianceRate: '0%',
		policies: [],
		activity: [],
	},
	reports: {
		summary: '',
		metrics: [],
		attendanceBars: [],
		weekLabels: [],
		capacityPercent: 0,
		distribution: [],
		recentCompliance: [],
	},
	settings: {
		summary: '',
		visibilityRules: [],
		workflowRules: [],
		departmentName: '',
		workWeekStartDay: '',
		overtimeThreshold: '',
		currencyLocalization: '',
		branchBanner: '',
	},
}

export function resolveProfileImage(profileImageUrl, fallbackName = 'ShiftSync') {
	if (profileImageUrl) {
		return profileImageUrl
	}

	return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=0f51ff&color=ffffff`
}

export function useManagerWorkspace(options = {}) {
	const session = loadSession()
	const [workspace, setWorkspace] = useState(emptyWorkspace)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState('')
	const rangeDays = options.rangeDays ?? 7
	const pollMs = options.pollMs ?? 3000
	const workspacePath = session?.userId ? `/api/manager/workspace/${session.userId}?rangeDays=${rangeDays}` : ''

	const loadWorkspace = useCallback(async ({ silent = false } = {}) => {
		if (!session?.userId) {
			setError('No active manager session was found.')
			setIsLoading(false)
			return
		}

		try {
			setError('')
			if (!silent) {
				setIsLoading(true)
			}
			const payload = await apiRequest(workspacePath)
			setWorkspace(payload)
		} catch (loadError) {
			setError(loadError.message || 'Unable to load manager workspace data.')
		} finally {
			if (!silent) {
				setIsLoading(false)
			}
		}
	}, [session?.userId, workspacePath])

	useEffect(() => {
		let cancelled = false

		async function run() {
			if (!session?.userId) {
				setError('No active manager session was found.')
				setIsLoading(false)
				return
			}

			try {
				setError('')
				const payload = await apiRequest(workspacePath)
				if (!cancelled) {
					setWorkspace(payload)
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load manager workspace data.')
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		run()
		const intervalId = pollMs > 0 ? window.setInterval(() => {
			void run()
		}, pollMs) : null

		return () => {
			cancelled = true
			if (intervalId) {
				window.clearInterval(intervalId)
			}
		}
	}, [pollMs, rangeDays, session?.userId, workspacePath])

	return {
		session,
		workspace,
		manager: workspace.manager,
		isLoading,
		error,
		reloadWorkspace: loadWorkspace,
	}
}

export function fetchManagedEmployeeDetail(managerId, employeeId) {
	return apiRequest(`/api/manager/${managerId}/employees/${employeeId}`)
}

export function updateManagedEmployee(employeeId, payload) {
	return apiRequest(`/api/manager/employees/${employeeId}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	})
}

export function archiveManagedEmployee(employeeId, payload) {
	return apiRequest(`/api/manager/employees/${employeeId}/archive`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})
}

export function updateManagedEmployeeStatus(employeeId, payload) {
	return apiRequest(`/api/manager/employees/${employeeId}/status`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})
}

export function createManagedEmployee(payload) {
	return apiRequest('/api/manager/employees', {
		method: 'POST',
		body: JSON.stringify(payload),
	})
}

export function updateManagerSettings(payload) {
	return apiRequest('/api/manager/settings', {
		method: 'PUT',
		body: JSON.stringify(payload),
	})
}

export function archiveManagerTeam(payload) {
	return apiRequest('/api/manager/settings/archive-team', {
		method: 'POST',
		body: JSON.stringify(payload),
	})
}
