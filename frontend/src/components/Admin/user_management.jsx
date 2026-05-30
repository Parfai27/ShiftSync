import { useEffect, useMemo, useState } from 'react'
import { FiDownload, FiUsers } from 'react-icons/fi'
import AdminFrame from './AdminFrame.jsx'
import { getAdminUsers, resetAdminUserCredentials, updateAdminUserRole, updateAdminUserStatus } from '../../lib/adminWorkspace'
import { downloadCsv } from '../../lib/export'
import { loadSession } from '../../lib/session'

const fallbackData = {
	totalUsers: 0,
	activeUsers: 0,
	adminUsers: 0,
	inactiveUsers: 0,
	users: [],
}

function toInitials(fullName) {
	return fullName
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('')
}

export default function UserManagement() {
	const session = loadSession()
	const [search, setSearch] = useState('')
	const [roleFilter, setRoleFilter] = useState('All Roles')
	const [data, setData] = useState(fallbackData)
	const [error, setError] = useState('')
	const [actionMessage, setActionMessage] = useState('')
	const [busyUserId, setBusyUserId] = useState(null)
	const [busyResetUserId, setBusyResetUserId] = useState(null)
	const [pendingRoles, setPendingRoles] = useState({})

	useEffect(() => {
		let cancelled = false

		async function loadUsers() {
			try {
				const response = await getAdminUsers()
				if (!cancelled) {
					setData(response)
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load user management data.')
				}
			}
		}

		loadUsers()
		return () => {
			cancelled = true
		}
	}, [])

	const roles = useMemo(() => ['All Roles', ...Array.from(new Set(data.users.map((user) => user.role)))], [data.users])

	const filteredUsers = useMemo(() => {
		const query = search.trim().toLowerCase()
		return data.users.filter((user) => {
			const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter
			const haystack = [user.fullName, user.email, user.role, user.branchLabel].join(' ').toLowerCase()
			return matchesRole && (!query || haystack.includes(query))
		})
	}, [data.users, roleFilter, search])

	function handleExport() {
		const header = 'Full Name,Email,Role,Status,Workspace\n'
		const rows = filteredUsers
			.map((user) => `"${user.fullName}","${user.email}","${user.role}","${user.active ? 'Active' : 'Inactive'}","${user.branchLabel}"`)
			.join('\n')
		downloadCsv(`${header}${rows}`, 'admin-user-directory.csv')
	}

	async function reloadUsers() {
		const response = await getAdminUsers()
		setData(response)
	}

	function getPendingRole(user) {
		return pendingRoles[user.id] || user.role.toUpperCase()
	}

	async function handleToggleUser(user) {
		setActionMessage('')
		setError('')
		setBusyUserId(user.id)
		try {
			const updated = await updateAdminUserStatus(user.id, {
				actorUserId: session?.userId ?? null,
				active: !user.active,
			})
			await reloadUsers()
			setActionMessage(`${updated.fullName} is now ${updated.active ? 'active' : 'inactive'}.`)
		} catch (actionError) {
			setError(actionError.message || 'Unable to update user status.')
		} finally {
			setBusyUserId(null)
		}
	}

	async function handleRoleSave(user) {
		const nextRole = getPendingRole(user)
		if (nextRole === user.role.toUpperCase()) {
			return
		}

		setActionMessage('')
		setError('')
		setBusyUserId(user.id)
		try {
			const updated = await updateAdminUserRole(user.id, {
				actorUserId: session?.userId ?? null,
				role: nextRole,
			})
			await reloadUsers()
			setPendingRoles((current) => ({ ...current, [user.id]: updated.role.toUpperCase() }))
			setActionMessage(`${updated.fullName} is now assigned the ${updated.role} role.`)
		} catch (actionError) {
			setError(actionError.message || 'Unable to update user role.')
		} finally {
			setBusyUserId(null)
		}
	}

	async function handleResetCredentials(user) {
		setActionMessage('')
		setError('')
		setBusyResetUserId(user.id)
		try {
			const response = await resetAdminUserCredentials(user.id, {
				actorUserId: session?.userId ?? null,
			})
			setActionMessage(response.emailSent ? response.message : `${response.message} Temporary password: ${response.temporaryPassword}`)
		} catch (actionError) {
			setError(actionError.message || 'Unable to reset credentials.')
		} finally {
			setBusyResetUserId(null)
		}
	}

	return (
		<AdminFrame
			activeNav="users"
			title="User Management"
			description="Oversee access, roles, and account status across the live ShiftSync workforce."
			searchPlaceholder="Search users, roles, and workspace assignments..."
			searchValue={search}
			onSearchChange={setSearch}
			headerActions={(
				<button className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-[#eef2ff] px-4 text-xs font-bold text-[#1f3b9c] transition hover:bg-[#e3eafe]" onClick={handleExport}>
					<FiDownload className="h-4 w-4" /> Export Directory
				</button>
			)}
		>
			{error ? (
				<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>
			) : null}
			{actionMessage ? (
				<div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div>
			) : null}

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{[
					{ label: 'Total Users', value: data.totalUsers, detail: `${filteredUsers.length} currently visible`, tone: 'text-[#0f51ff]' },
					{ label: 'Active Accounts', value: data.activeUsers, detail: 'Enabled for sign-in', tone: 'text-emerald-600' },
					{ label: 'Admin Accounts', value: data.adminUsers, detail: 'System-level access', tone: 'text-slate-500' },
					{ label: 'Inactive Accounts', value: data.inactiveUsers, detail: 'Disabled or archived', tone: 'text-rose-600' },
				].map((item) => (
					<article key={item.label} className="rounded-2xl border border-slate-200/80 bg-white p-4">
						<div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
						<div className="mt-2 text-[38px] font-black leading-none tracking-[-0.06em] text-slate-950">{item.value}</div>
						<div className={`mt-1 text-xs font-semibold ${item.tone}`}>{item.detail}</div>
					</article>
				))}
			</div>

			<article className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-[#f7f9ff] px-4 py-4 sm:px-5">
					<div className="flex flex-wrap items-center gap-2">
						{roles.map((role) => (
							<button
								key={role}
								className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${roleFilter === role ? 'bg-[#0f51ff] text-white' : 'bg-[#e8edff] text-[#2847ad]'}`}
								onClick={() => setRoleFilter(role)}
							>
								{role}
							</button>
						))}
					</div>
					<div className="flex items-center gap-2 text-xs font-bold text-slate-500">
						<FiUsers className="h-4 w-4 text-[#0f51ff]" />
						<span>{filteredUsers.length} users shown</span>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full text-left">
						<thead className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
							<tr>
								<th className="px-5 py-4">User Identity</th>
								<th className="px-5 py-4">Role</th>
								<th className="px-5 py-4">Workspace</th>
								<th className="px-5 py-4">Status</th>
								<th className="px-5 py-4">Credentials</th>
							</tr>
						</thead>
						<tbody className="text-sm text-slate-700">
							{filteredUsers.map((user) => (
								<tr key={user.id} className="border-b border-slate-100 last:border-b-0">
									<td className="px-5 py-4">
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7ecff] text-xs font-extrabold text-[#2243ae]">
												{toInitials(user.fullName)}
											</div>
											<div>
												<div className="font-bold text-slate-900">{user.fullName}</div>
												<div className="text-xs text-slate-500">{user.email}</div>
											</div>
										</div>
									</td>
									<td className="px-5 py-4">
										<div className="flex items-center gap-2">
											<select
												className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#0f51ff]"
												onChange={(event) => setPendingRoles((current) => ({ ...current, [user.id]: event.target.value }))}
												value={getPendingRole(user)}
											>
												<option value="ADMIN">ADMIN</option>
												<option value="MANAGER">MANAGER</option>
												<option value="EMPLOYEE">EMPLOYEE</option>
											</select>
											<button
												className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#0f51ff] hover:text-[#0f51ff]"
												disabled={busyUserId === user.id || getPendingRole(user) === user.role.toUpperCase()}
												onClick={() => handleRoleSave(user)}
												type="button"
											>
												{busyUserId === user.id ? 'Saving...' : 'Save'}
											</button>
										</div>
									</td>
									<td className="px-5 py-4 text-sm text-slate-600">{user.branchLabel}</td>
									<td className="px-5 py-4">
										<div className="flex items-center justify-between gap-3">
											<span className={`inline-flex items-center gap-2 text-sm ${user.active ? 'text-[#1b49cb]' : 'text-slate-400'}`}>
												<span className={`h-2 w-2 rounded-full ${user.active ? 'bg-[#1b49cb]' : 'bg-slate-300'}`} />
												{user.active ? 'Active' : 'Inactive'}
											</span>
											<button
												className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
													user.active
														? 'border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300'
														: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
												}`}
												disabled={busyUserId === user.id}
												onClick={() => handleToggleUser(user)}
												type="button"
											>
												{busyUserId === user.id ? 'Saving...' : user.active ? 'Deactivate' : 'Activate'}
											</button>
										</div>
									</td>
									<td className="px-5 py-4">
										<button
											className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#0f51ff] hover:text-[#0f51ff]"
											disabled={busyResetUserId === user.id}
											onClick={() => handleResetCredentials(user)}
											type="button"
										>
											{busyResetUserId === user.id ? 'Resetting...' : 'Reset login'}
										</button>
									</td>
								</tr>
							))}
							{filteredUsers.length === 0 ? (
								<tr>
									<td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-500">
										No users matched the current search or role filter.
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>
			</article>
		</AdminFrame>
	)
}
