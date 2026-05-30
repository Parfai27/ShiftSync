import { FiActivity, FiCreditCard, FiGrid, FiLogOut, FiSettings, FiUsers, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { clearSession } from '../../lib/session'

const navItems = [
	{ to: '/admin-overview', label: 'System Overview', icon: FiGrid },
	{ to: '/admin-user-management', label: 'User Management', icon: FiUsers },
	{ to: '/admin-auditlogs', label: 'Audit Logs', icon: FiActivity },
	{ to: '/admin-api', label: 'Integrations & API', icon: FiCreditCard },
	{ to: '/admin-settings', label: 'Settings', icon: FiSettings },
]

export default function MobileAdminMenu({ isOpen, onClose, activePath }) {
	if (!isOpen) {
		return null
	}

	return (
		<div className="fixed inset-0 z-50 xl:hidden">
			<button
				aria-label="Close mobile menu"
				className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
				onClick={onClose}
				type="button"
			/>
			<aside className="absolute left-0 top-0 flex h-full w-[290px] max-w-[88vw] flex-col border-r border-slate-200/80 bg-[#f2f6ff] px-5 py-6 shadow-2xl">
				<div className="flex items-center justify-between gap-3">
					<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
					<button
						aria-label="Close mobile menu"
						className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700"
						onClick={onClose}
						type="button"
					>
						<FiX className="h-5 w-5" />
					</button>
				</div>

				<nav className="mt-6 space-y-2 text-[14px] font-medium text-slate-600">
					{navItems.map((item) => {
						const Icon = item.icon
						const isActive = activePath === item.to
						return (
							<Link
								key={item.to}
								className={`flex items-center gap-3 rounded-xl px-4 py-3 ${isActive ? 'bg-white font-semibold text-[#0f51ff]' : 'hover:bg-white/70'}`}
								onClick={onClose}
								to={item.to}
							>
								<Icon className="h-4 w-4" /> {item.label}
							</Link>
						)
					})}
				</nav>

				<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
					<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" onClick={onClose} to="/admin-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
					<Link className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-rose-600 hover:bg-rose-50" onClick={() => { clearSession(); onClose() }} to="/login"><FiLogOut className="h-4 w-4" /> Logout</Link>
				</div>
			</aside>
		</div>
	)
}
