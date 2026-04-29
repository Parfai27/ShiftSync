import { useEffect, useRef, useState } from 'react'
import { FiBell, FiChevronDown, FiLogOut, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { clearSession } from '../../lib/session'

export default function ManagerProfileMenu({ name, role, profileImageUrl }) {
	const navigate = useNavigate()
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef(null)

	useEffect(() => {
		function handleClickOutside(event) {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsOpen(false)
			}
		}

		function handleEscape(event) {
			if (event.key === 'Escape') {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('keydown', handleEscape)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleEscape)
		}
	}, [])

	function navigateAndClose(path) {
		setIsOpen(false)
		navigate(path)
	}

	function logout() {
		clearSession()
		setIsOpen(false)
		navigate('/login')
	}

	return (
		<div className="relative" ref={containerRef}>
			<button
				aria-expanded={isOpen}
				aria-haspopup="menu"
				className="flex items-center gap-3 rounded-full bg-white px-3 py-2 transition hover:bg-slate-50"
				onClick={() => setIsOpen((current) => !current)}
				type="button"
			>
				<div className="text-right leading-tight">
					<div className="text-sm font-bold text-slate-900">{name}</div>
					<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{role}</div>
				</div>
				<div className="h-10 w-10 overflow-hidden rounded-full bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] ring-2 ring-[#eef3ff]">
					<img alt={name} className="h-full w-full object-cover" src={profileImageUrl} />
				</div>
				<FiChevronDown className={`h-4 w-4 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
			</button>

			{isOpen ? (
				<div className="absolute right-0 top-[calc(100%+10px)] z-40 min-w-[220px] rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
					<button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-[#eef3ff] hover:text-[#0f51ff]" onClick={() => navigateAndClose('/notifications')} type="button"><FiBell className="h-4 w-4" /> Notifications</button>
					<button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-[#eef3ff] hover:text-[#0f51ff]" onClick={() => navigateAndClose('/manager-settings')} type="button"><FiSettings className="h-4 w-4" /> Settings</button>
					<button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50" onClick={logout} type="button"><FiLogOut className="h-4 w-4" /> Logout</button>
				</div>
			) : null}
		</div>
	)
}
