import { useEffect, useMemo, useState } from 'react'
import {
	FiArrowRight,
	FiBell,
	FiBookOpen,
	FiCalendar,
	FiClock,
	FiDollarSign,
	FiExternalLink,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiRefreshCw,
	FiSearch,
	FiSettings,
	FiShield,
	FiUser,
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'
import { clearSession, loadSession } from '../../lib/session'
import EmployeeNotificationBell from '../shared/EmployeeNotificationBell'
import EmployeeProfileMenu from '../shared/EmployeeProfileMenu'
import ThemeToggleButton from '../shared/ThemeToggleButton'

const fallbackPage = {
	employeeName: 'Employee',
	roleLabel: 'EMPLOYEE',
	pharmacyLabel: 'Ngabo Pharmacy Team',
	totalAnnouncements: 0,
	weeklyAnnouncements: 0,
	latestAnnouncementDate: 'No announcements yet',
	featuredAnnouncement: null,
	highlights: [],
	announcements: [],
	resources: [],
}

function EmployeeSidebar() {
	return (
		<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
			<div className="flex w-full items-center justify-start gap-3">
				<img src="/logo.png" alt="ShiftSync" className="-ml-6 h-19 w-auto object-contain" />
			</div>

			<nav className="space-y-2 text-[14px] font-medium text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-dashboard"><FiGrid className="h-4 w-4" /> My Overview</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-schedule"><FiCalendar className="h-4 w-4" /> My Schedule</Link>
				<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/employee-announcements"><FiBell className="h-4 w-4" /> Announcements</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-earnings"><FiDollarSign className="h-4 w-4" /> Earnings & Pay</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-profile"><FiUser className="h-4 w-4" /> My Profile</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-notifications"><FiBell className="h-4 w-4" /> Notifications</Link>
			</nav>

			<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/employee-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
				<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login" onClick={clearSession}><FiLogOut className="h-4 w-4" /> Logout</Link>
			</div>
		</aside>
	)
}

export default function Announcements() {
	const navigate = useNavigate()
	const session = loadSession()
	const [page, setPage] = useState(fallbackPage)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		let cancelled = false

		async function loadAnnouncements() {
			if (!session?.userId) {
				setError('No employee session found. Please log in again.')
				setIsLoading(false)
				return
			}

			try {
				setError('')
				const data = await apiRequest(`/api/employee/announcements/${session.userId}`)
				if (!cancelled) {
					setPage(data)
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError.message || 'Unable to load employee announcements.')
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false)
				}
			}
		}

		loadAnnouncements()

		return () => {
			cancelled = true
		}
	}, [session?.userId])

	async function refreshAnnouncements() {
		if (!session?.userId) {
			setError('No employee session found. Please log in again.')
			return
		}

		try {
			setError('')
			setIsLoading(true)
			const data = await apiRequest(`/api/employee/announcements/${session.userId}`)
			setPage(data)
		} catch (loadError) {
			setError(loadError.message || 'Unable to refresh announcements.')
		} finally {
			setIsLoading(false)
		}
	}

	const normalizedSearch = searchTerm.trim().toLowerCase()
	const visibleAnnouncements = useMemo(() => {
		return page.announcements.filter((item) => {
			if (!normalizedSearch) {
				return true
			}
			return [item.title, item.message, item.publishedBy, item.publishedAt].join(' ').toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, page.announcements])

	const visibleResources = useMemo(() => {
		return page.resources.filter((item) => {
			if (!normalizedSearch) {
				return true
			}
			return item.name.toLowerCase().includes(normalizedSearch)
		})
	}, [normalizedSearch, page.resources])

	const featuredAnnouncement = visibleAnnouncements[0] || page.featuredAnnouncement

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<EmployeeSidebar />

				<div className="dashboard-main-offset flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden">
							<button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700" onClick={() => navigate('/employee-dashboard')} type="button"><FiMenu className="h-5 w-5" /></button>
							<div className="flex min-w-0 items-center gap-3">
								<span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f51ff] text-xs font-black text-white">S</span>
								<div className="min-w-0">
									<div className="truncate text-sm font-extrabold text-slate-900">ShiftSync</div>
									<div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Workforce Management</div>
								</div>
							</div>
						</div>

						<div className="mt-4 flex flex-col gap-4 xl:mt-0 xl:flex-row xl:items-center xl:justify-between">
							<label className="relative w-full max-w-3xl">
								<FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search announcements, updates, and posted notices..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<EmployeeNotificationBell userId={session?.userId} />
								<ThemeToggleButton />
								<EmployeeProfileMenu name={page.employeeName} profileImageUrl={session?.profileImageUrl} role={page.roleLabel} />
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section className="overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#0f51ff_0%,#1e56d6_50%,#4472da_100%)] p-7 text-white sm:p-8">
							<div className="max-w-140">
								<span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-100">Featured Update</span>
								<h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-[52px]">{featuredAnnouncement?.title || 'Pharmacy Updates'}</h1>
								<p className="mt-4 text-base leading-7 text-blue-100">{featuredAnnouncement?.message || 'Important pharmacy communication will appear here once announcements are posted.'}</p>
								<div className="mt-5 text-sm font-semibold text-blue-100">
									{featuredAnnouncement ? `Posted ${featuredAnnouncement.publishedAt} by ${featuredAnnouncement.publishedBy}` : `Latest update from ${page.pharmacyLabel}`}
								</div>
								<div className="mt-6 flex flex-wrap gap-2.5">
									<button className="rounded-xl bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[#0f51ff]" onClick={() => featuredAnnouncement && setSelectedAnnouncement(featuredAnnouncement)} type="button">Read Update</button>
									<button className="rounded-xl border border-white/40 bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-white/10" onClick={refreshAnnouncements} type="button"><FiRefreshCw className="mr-2 inline h-4 w-4" /> Refresh</button>
								</div>
							</div>
						</section>

						{error ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div> : null}

						<section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.7fr)]">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="text-[36px] font-black tracking-[-0.05em] text-slate-900">Announcement Summary</h2>
										<p className="text-sm text-slate-500">Live internal communication from {page.pharmacyLabel}</p>
									</div>
									<button className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0f51ff]" onClick={refreshAnnouncements} type="button">Refresh Feed <FiArrowRight className="h-4 w-4" /></button>
								</div>

								<div className="grid gap-3 sm:grid-cols-3">
									{page.highlights.map((item, index) => (
										<article key={item.label} className="rounded-2xl border border-slate-200/80 bg-white p-4">
											<div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
												{index === 0 ? <FiBell className="h-4 w-4 text-[#2d5cf6]" /> : index === 1 ? <FiCalendar className="h-4 w-4 text-[#2d5cf6]" /> : <FiClock className="h-4 w-4 text-[#2d5cf6]" />}
												{item.label}
											</div>
											<div className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-900">{item.value}</div>
										</article>
									))}
								</div>

								<div>
									<h2 className="text-[36px] font-black tracking-[-0.05em] text-slate-900">Announcements Feed</h2>
									<div className="mt-3 space-y-3">
										{visibleAnnouncements.length ? visibleAnnouncements.map((item) => (
											<article key={item.id} className="rounded-3xl border border-slate-200/80 bg-white p-5">
												<div className="flex flex-wrap items-start justify-between gap-3">
													<div className="max-w-3xl">
														<div className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#2d5cf6]">
															<FiBell className="h-3.5 w-3.5" />
															{item.featured ? 'Featured' : 'Announcement'}
														</div>
														<h3 className="mt-3 text-[28px] leading-8 font-black tracking-[-0.04em] text-slate-900">{item.title}</h3>
														<p className="mt-3 text-sm leading-7 text-slate-600">{item.message}</p>
													</div>
													<div className="text-right">
														<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Published</div>
														<div className="mt-1 text-sm font-bold text-slate-700">{item.publishedAt}</div>
														<div className="mt-1 text-xs text-slate-500">By {item.publishedBy}</div>
													</div>
												</div>
												<div className="mt-4 flex flex-wrap gap-2">
													<button className="rounded-xl bg-[#e9eeff] px-4 py-2 text-sm font-bold text-[#1f56ea]" onClick={() => setSelectedAnnouncement(item)} type="button">Open Details</button>
													<button className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100" onClick={() => navigate('/employee-notifications')} type="button">View Notifications</button>
												</div>
											</article>
										)) : (
											<div className="rounded-3xl border border-slate-200/80 bg-white p-5 text-sm text-slate-500">{isLoading ? 'Loading announcements...' : 'No announcements matched your search.'}</div>
										)}
									</div>
								</div>
							</div>

							<aside className="space-y-4">
								<article className="rounded-3xl border border-slate-200/80 bg-white p-5">
									<div className="flex items-center justify-between gap-2">
										<h2 className="text-[34px] font-black tracking-[-0.04em] text-slate-900">Resource Library</h2>
										<span className="h-2 w-2 rounded-full bg-[#0f51ff]" />
									</div>
									<div className="mt-4 space-y-3">
										{visibleResources.length ? visibleResources.map((resource, index) => (
											<article key={resource.name} className="rounded-2xl border border-slate-200/80 bg-[#f8faff] p-4">
												<div className="flex items-center gap-3">
													<span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${index % 2 === 0 ? 'bg-[#e8edff] text-[#2d5cf6]' : 'bg-[#ffe8e6] text-[#cf3b2c]'}`}>
														{index % 2 === 0 ? <FiBookOpen className="h-5 w-5" /> : <FiShield className="h-5 w-5" />}
													</span>
													<div>
														<div className="text-lg font-black tracking-[-0.03em] text-slate-900">{resource.name}</div>
														<div className="text-sm text-slate-500">Internal pharmacy reference</div>
													</div>
												</div>
											</article>
										)) : (
											<div className="rounded-2xl border border-slate-200/80 bg-[#f8faff] p-4 text-sm text-slate-500">No resources matched your search.</div>
										)}
									</div>
								</article>

								<article className="rounded-2xl bg-[#eef2ff] p-4">
									<div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Helpful Quicklinks</div>
									<div className="mt-3 space-y-2 text-sm font-bold text-[#2d5cf6]">
										<button className="flex items-center gap-1.5 hover:underline" onClick={() => navigate('/employee-notifications')} type="button">Notification Center <FiExternalLink className="h-3.5 w-3.5" /></button>
										<button className="flex items-center gap-1.5 hover:underline" onClick={() => navigate('/employee-schedule')} type="button">My Weekly Schedule <FiExternalLink className="h-3.5 w-3.5" /></button>
										<button className="flex items-center gap-1.5 hover:underline" onClick={() => navigate('/employee-profile')} type="button">Update My Contact Info <FiExternalLink className="h-3.5 w-3.5" /></button>
									</div>
								</article>
							</aside>
						</section>
					</div>
				</div>
			</div>

			{selectedAnnouncement ? (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-2xl rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">{selectedAnnouncement.title}</h2>
								<div className="mt-2 text-sm font-semibold text-slate-500">{selectedAnnouncement.publishedAt} • {selectedAnnouncement.publishedBy}</div>
							</div>
							<button className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" onClick={() => setSelectedAnnouncement(null)} type="button">Close</button>
						</div>
						<p className="mt-5 rounded-2xl bg-[#f8faff] p-5 text-sm leading-7 text-slate-700">{selectedAnnouncement.message}</p>
					</div>
				</div>
			) : null}
		</main>
	)
}
