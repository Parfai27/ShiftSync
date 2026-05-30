import {
	FiLogOut,
	FiMenu,
	FiSearch,
} from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'
import { clearSession, loadSession } from '../../lib/session'
import ThemeToggleButton from '../shared/ThemeToggleButton.jsx'
import AdminProfileMenu from '../shared/AdminProfileMenu.jsx'
import MobileAdminMenu from '../shared/MobileAdminMenu.jsx'
import EmployeeNotificationBell from '../shared/EmployeeNotificationBell.jsx'
import { useState } from 'react'
import { FiActivity, FiCreditCard, FiGrid, FiSettings, FiUsers } from 'react-icons/fi'

const navItems = [
	{ key: 'overview', label: 'SystemOverview', to: '/admin-overview', icon: FiGrid },
	{ key: 'users', label: 'UserManagement', to: '/admin-user-management', icon: FiUsers },
	{ key: 'audit', label: 'AuditLogs', to: '/admin-auditlogs', icon: FiActivity },
	{ key: 'api', label: 'Integrations & API', to: '/admin-api', icon: FiCreditCard },
	{ key: 'settings', label: 'Settings', to: '/admin-settings', icon: FiSettings },
]

export default function AdminFrame({
	activeNav,
	searchPlaceholder,
	searchValue,
	onSearchChange,
	title,
	description,
	headerActions,
	children,
}) {
	const location = useLocation()
	const session = loadSession()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const adminName = session?.fullName || 'System Administrator'
	const adminInitials = adminName
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('') || 'AD'

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<MobileAdminMenu activePath={location.pathname} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
				<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
					<div className="flex w-full items-center justify-start gap-3">
						<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
					</div>

					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						{navItems.map((item) => {
							const Icon = item.icon
							const active = activeNav === item.key
							return (
								<Link
									key={item.key}
									className={`flex items-center gap-3 rounded-xl px-4 py-3 ${active ? 'bg-white font-semibold text-[#0f51ff]' : 'hover:bg-white/70'}`}
									to={item.to}
								>
									<Icon className="h-4 w-4" /> {item.label}
								</Link>
							)
						})}
					</nav>

					<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}>
							<FiLogOut className="h-4 w-4" /> Logout
						</Link>
					</div>
				</aside>

				<div className="dashboard-main-offset flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden">
							<button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700" onClick={() => setIsMobileMenuOpen(true)} type="button">
								<FiMenu className="h-5 w-5" />
							</button>
							<div className="flex min-w-0 items-center gap-3">
								<span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f51ff] text-xs font-black text-white">A</span>
								<div className="min-w-0">
									<div className="truncate text-sm font-extrabold text-slate-900">ShiftSync</div>
									<div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Workforce Management</div>
								</div>
							</div>
						</div>

						<div className="mt-4 flex flex-col gap-4 xl:mt-0 xl:flex-row xl:items-center xl:justify-between">
							<label className="relative w-full max-w-3xl">
								<FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<input
									type="search"
									value={searchValue}
									onChange={(event) => onSearchChange?.(event.target.value)}
									placeholder={searchPlaceholder}
									className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white"
								/>
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<EmployeeNotificationBell to="/admin-auditlogs" unreadCount={0} />
								<ThemeToggleButton />
								<AdminProfileMenu initials={adminInitials} name={adminName} role="System Admin" />
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section>
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">{title}</h1>
									<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p>
								</div>
								{headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
							</div>

							<div className="mt-5">{children}</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
