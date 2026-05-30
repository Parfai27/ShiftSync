import { apiRequest } from './api'

export function getAdminOverview() {
	return apiRequest('/api/admin/overview')
}

export function getAdminUsers() {
	return apiRequest('/api/admin/users')
}

export function getAdminAuditLogsWorkspace() {
	return apiRequest('/api/admin/audit-logs/workspace')
}

export function getAdminIntegrations() {
	return apiRequest('/api/admin/integrations')
}

export function getAdminSettingsWorkspace() {
	return apiRequest('/api/admin/settings/workspace')
}

export function updateAdminUserStatus(userId, payload) {
	return apiRequest(`/api/admin/users/${userId}/status`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})
}

export function updateAdminUserRole(userId, payload) {
	return apiRequest(`/api/admin/users/${userId}/role`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})
}

export function resetAdminUserCredentials(userId, payload) {
	return apiRequest(`/api/admin/users/${userId}/reset-credentials`, {
		method: 'POST',
		body: JSON.stringify(payload),
	})
}

export function updateAdminGeneralSettings(payload) {
	return apiRequest('/api/admin/settings/general', {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})
}

export function updateAdminAutomation(payload) {
	return apiRequest('/api/admin/settings/automation', {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})
}

export function updateAdminIntegrationConfig(payload) {
	return apiRequest('/api/admin/integrations/config', {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})
}
