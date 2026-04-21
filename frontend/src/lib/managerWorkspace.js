import { useEffect, useState } from 'react'
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

export function useManagerWorkspace() {
	const session = loadSession()
	const [workspace, setWorkspace] = useState(emptyWorkspace)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState('')

	async function loadWorkspace() {
		if (!session?.userId) {
			setError('No active manager session was found.')
			setIsLoading(false)
			return
		}

		try {
			setError('')
			const payload = await apiRequest(`/api/manager/workspace/${session.userId}`)
			setWorkspace(payload)
		} catch (loadError) {
			setError(loadError.message || 'Unable to load manager workspace data.')
		} finally {
			setIsLoading(false)
		}
	}

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
				const payload = await apiRequest(`/api/manager/workspace/${session.userId}`)
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

		return () => {
			cancelled = true
		}
	}, [session?.userId])

	return {
		session,
		workspace,
		manager: workspace.manager,
		isLoading,
		error,
		reloadWorkspace: loadWorkspace,
	}
}
