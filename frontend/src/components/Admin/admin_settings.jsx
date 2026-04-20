import {
	FiActivity,
	FiBell,
	FiCalendar,
	FiCheckSquare,
	FiChevronDown,
	FiChevronRight,
	FiClock,
	FiCreditCard,
	FiDownload,
	FiGrid,
	FiLock,
	FiLogOut,
	FiMail,
	FiMenu,
	FiMessageSquare,
	FiMonitor,
	FiMoon,
	FiRotateCcw,
	FiSearch,
	FiSettings,
	FiShield,
	FiSliders,
	FiSmartphone,
	FiStar,
	FiSquare,
	FiTag,
	FiUpload,
	FiUsers,
	FiX,
} from 'react-icons/fi'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const automations = [
	{
		title: 'Enable Auto-Scheduling',
		description: 'Automatically assign shifts based on staff availability and history.',
		enabled: true,
	},
	{
		title: 'Shift Swap Approvals',
		description: 'Require manager sign-off for all staff-initiated shift changes.',
		enabled: false,
	},
	{
		title: 'Overtime Alerts',
		description: 'Notify administrators when staff members exceed 40 hours weekly.',
		enabled: true,
	},
]

const securitySessions = [
	{
		initials: 'AD',
		name: 'Alex Danvers',
		email: 'alex.d@atlasstream.io',
		location: 'San Francisco, USA',
		ip: '172.67.44.110',
		device: 'Chrome on macOS',
		status: 'Current',
	},
	{
		initials: 'SJ',
		name: 'Sarah Jenkins',
		email: 's.jenkins@atlasstream.io',
		location: 'London, UK',
		ip: '84.23.10.42',
		device: 'Safari on iPhone 15',
		status: 'Active',
	},
	{
		initials: 'FK',
		name: 'Ryan Kage',
		email: 'r.kage@atlasstream.io',
		location: 'Berlin, DE',
		ip: '192.168.1.1',
		device: 'Firefox on Linux',
		status: 'Idle',
	},
]

const notificationEvents = [
	{ category: 'New Hire Onboarding', detail: 'System access grants', threshold: 'Normal', frequency: 'Instant', enabled: true },
	{ category: 'Shift Swap Requests', detail: 'Employee schedule changes', threshold: 'Normal', frequency: 'Daily Digest', enabled: true },
	{ category: 'Policy Violation', detail: 'Compliance red-flags', threshold: 'Critical', frequency: 'Instant', enabled: true },
	{ category: 'System Maintenance', detail: 'Scheduled downtime updates', threshold: 'Low', frequency: 'Instant', enabled: false },
]

export default function AdminSettings() {
	const [activeTab, setActiveTab] = useState('general')

	return (
		<main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#eef4ff_0%,#f7f9ff_38%,#eef2ff_100%)] text-slate-900">
			<div className="flex h-screen w-full overflow-hidden border border-white/80 bg-white/85 backdrop-blur-xl">
				<aside className="fixed left-0 top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f2f6ff]/80 px-5 py-6 xl:flex" style={{ width: '264px' }}>
					<div className="mb-10 flex items-center gap-3">
						<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f51ff] text-sm font-black text-white">A</span>
						<div>
							<div className="text-[19px] font-extrabold leading-5 tracking-[-0.04em] text-slate-900">ShiftSync</div>
							<div className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">Workforce Management</div>
						</div>
					</div>

					<nav className="space-y-2 text-[14px] font-medium text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-overview"><FiGrid className="h-4 w-4" /> SystemOverview</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-user-management"><FiUsers className="h-4 w-4" /> UserManagement</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-auditlogs"><FiActivity className="h-4 w-4" /> AuditLogs</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-api"><FiCreditCard className="h-4 w-4" /> Integrations & API</Link>
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/admin-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
					</nav>

					<div className="mt-auto space-y-1 pt-8 text-sm text-slate-600">
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50" to="/login"><FiLogOut className="h-4 w-4" /> Logout</Link>
					</div>
				</aside>

				<div className="dashboard-main-offset flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
					<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
						<div className="flex items-center gap-3 xl:hidden">
							<button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700"><FiMenu className="h-5 w-5" /></button>
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
								<input type="search" placeholder="Search settings, policies, and workflows..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
							</label>

							<div className="flex items-center justify-between gap-3 xl:justify-end">
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiBell className="h-4 w-4" /></button>
								<button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"><FiMoon className="h-4 w-4" /></button>
								<div className="flex items-center gap-3 rounded-full bg-white px-3 py-2">
									<div className="text-right leading-tight">
										<div className="text-sm font-bold text-slate-900">Nina Patel</div>
										<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">System Admin</div>
									</div>
									<div className="h-10 w-10 overflow-hidden rounded-full bg-[linear-gradient(135deg,#0f51ff,#7ea4ff)] ring-2 ring-[#eef3ff]" />
									<FiChevronDown className="h-4 w-4 text-slate-400" />
								</div>
							</div>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
						<section>
							<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">System Settings</h1>
							<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">Configure your workforce environment, security protocols, and notification preferences to streamline your management experience.</p>

							<div className="mt-6 flex flex-wrap items-center gap-5 border-b border-slate-200/80 pb-3 text-sm font-bold text-slate-500">
								<button className={`pb-2 ${activeTab === 'general' ? 'border-b-2 border-[#0f51ff] text-[#0f51ff]' : 'hover:text-slate-700'}`} onClick={() => setActiveTab('general')}>General</button>
								<button className={`pb-2 ${activeTab === 'security' ? 'border-b-2 border-[#0f51ff] text-[#0f51ff]' : 'hover:text-slate-700'}`} onClick={() => setActiveTab('security')}>Security</button>
								<button className={`pb-2 ${activeTab === 'notifications' ? 'border-b-2 border-[#0f51ff] text-[#0f51ff]' : 'hover:text-slate-700'}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
								<button className={`pb-2 ${activeTab === 'team' ? 'border-b-2 border-[#0f51ff] text-[#0f51ff]' : 'hover:text-slate-700'}`} onClick={() => setActiveTab('team')}>Team Preferences</button>
							</div>

							{activeTab === 'general' && (
								<>
									<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
										<div className="space-y-5">
											<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
												<div className="mb-5 flex items-center justify-between">
													<h2 className="text-2xl font-black tracking-[-0.04em] text-slate-900">Company Profile</h2>
													<button className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#0f51ff]">Update Branding</button>
												</div>
												<div className="grid gap-4 sm:grid-cols-2">
													<label>
														<div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Company Name</div>
														<input value="Fluid Architect Ltd." readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-[#f6f8ff] px-3 text-sm text-slate-700" />
													</label>
													<label>
														<div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Workspace URL</div>
														<input value="fluid.app/architect-core" readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-[#f6f8ff] px-3 text-sm text-slate-700" />
													</label>
													<label>
														<div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Timezone</div>
														<div className="flex h-11 items-center justify-between rounded-lg border border-slate-200 bg-[#f6f8ff] px-3 text-sm text-slate-700">
															<span>(GMT-05:00) Eastern Time</span>
															<FiChevronDown className="h-4 w-4 text-slate-400" />
														</div>
													</label>
													<label>
														<div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Primary Language</div>
														<div className="flex h-11 items-center justify-between rounded-lg border border-slate-200 bg-[#f6f8ff] px-3 text-sm text-slate-700">
															<span>English (US)</span>
															<FiChevronDown className="h-4 w-4 text-slate-400" />
														</div>
													</label>
												</div>
											</article>

											<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
												<h2 className="text-2xl font-black tracking-[-0.04em] text-slate-900">Workflow Automation</h2>
												<div className="mt-4 space-y-4">
													{automations.map((item) => (
														<div key={item.title} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-[#f8faff] px-4 py-3">
															<div>
																<div className="font-bold text-slate-900">{item.title}</div>
																<div className="mt-0.5 text-xs text-slate-500">{item.description}</div>
															</div>
															<button className={`relative h-6 w-11 rounded-full transition ${item.enabled ? 'bg-[#0f51ff]' : 'bg-slate-300'}`} aria-label={`${item.title} toggle`}>
																<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${item.enabled ? 'left-5.5' : 'left-0.5'}`} />
															</button>
														</div>
													))}
												</div>
											</article>
										</div>

										<div className="space-y-5">
											<article className="rounded-2xl border border-slate-200/80 bg-[#eef2ff] p-5">
												<h3 className="text-2xl font-black tracking-[-0.04em] text-slate-900">Subscription Plan</h3>
												<div className="mt-4 rounded-xl bg-white p-4">
													<div className="flex items-center justify-between">
														<span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2747b3]">Enterprise Plus</span>
														<span className="rounded-md bg-[#e8edff] px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-[#2747b3]">Active</span>
													</div>
													<div className="mt-3 text-[44px] font-black leading-none tracking-[-0.06em] text-slate-950">$499<span className="text-lg font-bold text-slate-500">/mo</span></div>
												</div>
												<p className="mt-4 text-sm leading-6 text-slate-600">Your plan includes up to 250 employees and advanced AI scheduling features.</p>
												<button className="mt-4 w-full rounded-xl bg-[#0f51ff] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b44de]">Upgrade Plan</button>
											</article>

											<article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-[#0f2138] p-0">
												<div className="h-36 bg-[radial-gradient(circle_at_20%_20%,rgba(58,117,255,0.45),transparent_40%),linear-gradient(145deg,#081326,#142a47_50%,#0b1d34)] p-4 text-white">
													<div className="mt-12 text-2xl font-black tracking-[-0.04em]">Fluid Architect AI</div>
													<div className="mt-1 text-xs text-blue-100">New predictive analytics tools are now available for your workforce.</div>
												</div>
											</article>

											<article className="space-y-3">
												<button className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-left">
													<span className="flex items-center gap-3">
														<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf2ff] text-[#1c46be]"><FiDownload className="h-4 w-4" /></span>
														<span>
															<span className="block text-sm font-bold text-slate-900">Export Logs</span>
															<span className="block text-xs text-slate-500">CSV/JSON Audit Trails</span>
														</span>
													</span>
													<FiChevronRight className="h-4 w-4 text-slate-400" />
												</button>

												<button className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-left">
													<span className="flex items-center gap-3">
														<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf2ff] text-[#1c46be]"><FiRotateCcw className="h-4 w-4" /></span>
														<span>
															<span className="block text-sm font-bold text-slate-900">Version History</span>
															<span className="block text-xs text-slate-500">Revert configuration</span>
														</span>
													</span>
													<FiChevronRight className="h-4 w-4 text-slate-400" />
												</button>
											</article>
										</div>
									</div>
								</>
							)}

							{activeTab === 'security' && (
								<>
									<div className="mt-5">
										<h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950">Security Settings</h2>
										<p className="mt-1 max-w-2xl text-sm text-slate-500">Configure global security protocols, manage active access tokens, and define perimeter protection for your organizational workspace.</p>
									</div>

									<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
										<article className="rounded-2xl border border-slate-200/80 bg-white p-4">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8edff] text-[#2444ac]"><FiShield className="h-4 w-4" /></span>
													<div>
														<div className="font-bold text-slate-900">Two-Factor Authentication</div>
														<div className="text-xs text-slate-500">Require a secondary verification step for all team members.</div>
													</div>
												</div>
												<button className="relative h-6 w-11 rounded-full bg-[#0f51ff]" aria-label="Two-factor toggle"><span className="absolute left-5.5 top-0.5 h-5 w-5 rounded-full bg-white" /></button>
											</div>
											<div className="mt-4 grid gap-3 sm:grid-cols-2">
												<div className="rounded-xl border border-slate-200/80 bg-[#f8faff] p-3">
													<div className="flex items-center gap-2 text-sm font-bold text-slate-900"><FiSmartphone className="h-3.5 w-3.5 text-[#0f51ff]" /> Authenticator App</div>
													<div className="mt-1 text-xs text-slate-500">Use Google Authenticator or Authy to generate secure codes.</div>
												</div>
												<div className="rounded-xl border border-slate-200/80 bg-[#f8faff] p-3">
													<div className="flex items-center gap-2 text-sm font-bold text-slate-900"><FiMessageSquare className="h-3.5 w-3.5 text-[#0f51ff]" /> SMS Backup</div>
													<div className="mt-1 text-xs text-slate-500">Verification codes sent to mobile phone as a secondary fallback.</div>
												</div>
											</div>
										</article>

										<article className="rounded-2xl border border-slate-200/80 bg-[#eef2ff] p-4">
											<div className="flex items-center gap-2 text-lg font-black tracking-[-0.03em] text-slate-900"><FiClock className="h-4 w-4 text-[#2444ac]" /> Session Timeout</div>
											<div className="mt-1 text-xs text-slate-500">Automatic logout after inactivity.</div>
											<div className="mt-4 flex h-11 items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
												<span>15 Minutes (Recommended)</span>
												<FiChevronDown className="h-4 w-4 text-slate-400" />
											</div>
											<p className="mt-3 text-xs italic leading-5 text-slate-500">Short sessions improve security by limiting the window of opportunity for unauthorized physical access.</p>
										</article>
									</div>

									<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(250px,0.65fr)]">
										<article className="rounded-2xl border border-slate-200/80 bg-white p-4">
											<div className="flex items-center gap-2 text-2xl font-black tracking-[-0.04em] text-slate-900"><FiLock className="h-5 w-5 text-[#2444ac]" /> Password Policy Configuration</div>
											<div className="mt-4">
												<div className="flex items-center justify-between text-sm font-bold text-slate-900">
													<span>Minimum Character Length</span>
													<span className="rounded-md bg-[#eef2ff] px-2 py-1 text-xs text-[#2444ac]">12</span>
												</div>
												<div className="mt-2 h-2 w-full rounded-full bg-slate-200"><div className="h-2 w-[62%] rounded-full bg-[#0f51ff]" /></div>
												<div className="mt-1 text-xs text-slate-500">Longer passwords provide exponential security increases.</div>
											</div>

											<div className="mt-4 grid gap-3 sm:grid-cols-2">
												<div className="text-sm">
													<div className="flex items-center gap-2 font-semibold text-slate-900"><FiCheckSquare className="h-4 w-4 text-[#0f51ff]" /> Special Characters</div>
													<div className="text-xs text-slate-500">Require symbols like !, @, #, $, %.</div>
												</div>
												<div className="text-sm">
													<div className="flex items-center gap-2 font-semibold text-slate-900"><FiCheckSquare className="h-4 w-4 text-[#0f51ff]" /> Numerical Digits</div>
													<div className="text-xs text-slate-500">Require at least one number (0-9).</div>
												</div>
												<div className="text-sm">
													<div className="flex items-center gap-2 font-semibold text-slate-900"><FiCheckSquare className="h-4 w-4 text-[#0f51ff]" /> Mixed Casing</div>
													<div className="text-xs text-slate-500">Uppercase and lowercase combinations.</div>
												</div>
												<div className="text-sm">
													<div className="flex items-center gap-2 font-semibold text-slate-900"><FiSquare className="h-4 w-4 text-slate-400" /> No Sequential Strings</div>
													<div className="text-xs text-slate-500">Prevent "1234" or "abcd" patterns.</div>
												</div>
											</div>
										</article>

										<article className="rounded-2xl bg-[#0f2138] p-4 text-white">
											<div className="flex items-center gap-2 text-xl font-black tracking-[-0.04em]"><FiShield className="h-4 w-4" /> IP Whitelisting</div>
											<p className="mt-2 text-xs leading-5 text-blue-100">Restrict admin access to specific corporate networks or VPN exit points.</p>
											<div className="mt-4 space-y-2">
												<div className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-xs"><span>192.168.1.1</span><span className="text-blue-100">Office HQ</span></div>
												<div className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-xs"><span>45.23.120.9</span><span className="text-blue-100">Remote VPN</span></div>
											</div>
											<button className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0f2138]">+ Add Trusted IP</button>
										</article>
									</div>

									<article className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
										<div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
											<div>
												<h3 className="text-2xl font-black tracking-[-0.04em] text-slate-900">Active User Sessions</h3>
												<p className="text-xs text-slate-500">Real-time overview of current logged-in administrators.</p>
											</div>
											<button className="text-xs font-extrabold uppercase tracking-[0.12em] text-rose-600">Revoke All Sessions</button>
										</div>

										<div className="overflow-x-auto">
											<table className="min-w-full text-left">
												<thead className="border-b border-slate-100 bg-[#f7f9ff] text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
													<tr>
														<th className="px-5 py-3">User / Identity</th>
														<th className="px-5 py-3">Location</th>
														<th className="px-5 py-3">Device & Browser</th>
														<th className="px-5 py-3">Status</th>
														<th className="px-5 py-3">Action</th>
													</tr>
												</thead>
												<tbody className="text-sm text-slate-700">
													{securitySessions.map((session) => (
														<tr key={session.email} className="border-b border-slate-100 last:border-b-0">
															<td className="px-5 py-3">
																<div className="flex items-center gap-3">
																	<div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dfe6ff] text-[10px] font-extrabold text-[#2444ac]">{session.initials}</div>
																	<div>
																		<div className="font-bold text-slate-900">{session.name}</div>
																		<div className="text-xs text-slate-500">{session.email}</div>
																	</div>
																</div>
															</td>
															<td className="px-5 py-3"><div>{session.location}</div><div className="text-xs text-slate-500">{session.ip}</div></td>
															<td className="px-5 py-3"><div className="flex items-center gap-2"><FiMonitor className="h-3.5 w-3.5 text-slate-500" />{session.device}</div></td>
															<td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${session.status === 'Current' ? 'bg-[#e8edff] text-[#2444ac]' : session.status === 'Active' ? 'bg-[#e8edff] text-[#2444ac]' : 'bg-slate-100 text-slate-500'}`}>{session.status}</span></td>
															<td className="px-5 py-3"><button className="text-xs font-bold text-rose-600">Revoke</button></td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</article>
								</>
							)}

							{activeTab === 'notifications' && (
								<>
									<div className="mt-5 flex flex-wrap items-start justify-between gap-3">
										<div>
											<h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950">Notification Settings</h2>
											<p className="mt-1 text-sm text-slate-500">Manage how and when your workspace stays informed.</p>
										</div>
										<button className="rounded-xl bg-[#0f51ff] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-[#0b44de]">Save Changes</button>
									</div>

									<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.3fr)]">
										<article className="rounded-2xl border border-slate-200/80 bg-white p-4">
											<div className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiBell className="h-4 w-4 text-[#2444ac]" /> Global Channels</div>
											<div className="mt-4 space-y-3">
												<div className="rounded-xl border border-slate-200/80 bg-[#f8faff] px-3 py-3">
													<div className="flex items-center justify-between gap-3">
														<div>
															<div className="text-sm font-bold text-slate-900">Email Alerts</div>
															<div className="text-xs text-slate-500">Primary delivery system</div>
														</div>
														<button className="relative h-6 w-11 rounded-full bg-[#0f51ff]"><span className="absolute left-5.5 top-0.5 h-5 w-5 rounded-full bg-white" /></button>
													</div>
												</div>
												<div className="rounded-xl border border-slate-200/80 bg-[#f8faff] px-3 py-3">
													<div className="flex items-center justify-between gap-3">
														<div>
															<div className="text-sm font-bold text-slate-900">SMS Messages</div>
															<div className="text-xs text-slate-500">Urgent mobile updates</div>
														</div>
														<button className="relative h-6 w-11 rounded-full bg-slate-300"><span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white" /></button>
													</div>
												</div>
												<div className="rounded-xl border border-slate-200/80 bg-[#f8faff] px-3 py-3">
													<div className="flex items-center justify-between gap-3">
														<div>
															<div className="text-sm font-bold text-slate-900">Push Notifications</div>
															<div className="text-xs text-slate-500">Desktop & app popups</div>
														</div>
														<button className="relative h-6 w-11 rounded-full bg-[#0f51ff]"><span className="absolute left-5.5 top-0.5 h-5 w-5 rounded-full bg-white" /></button>
													</div>
												</div>
											</div>
										</article>

										<article className="rounded-2xl border border-slate-200/80 bg-white p-4">
											<div className="flex flex-wrap items-center justify-between gap-3">
												<div className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiClock className="h-4 w-4 text-[#2444ac]" /> Event Triggers & Timing</div>
												<div className="inline-flex rounded-full bg-[#edf2ff] p-1 text-[10px] font-extrabold uppercase tracking-[0.12em]">
													<button className="rounded-full bg-[#0f51ff] px-3 py-1 text-white">All Events</button>
													<button className="rounded-full px-3 py-1 text-slate-500">Priority Only</button>
												</div>
											</div>

											<div className="mt-4 overflow-x-auto">
												<table className="min-w-full text-left">
													<thead className="border-b border-slate-100 bg-[#f7f9ff] text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
														<tr>
															<th className="px-4 py-3">Event Category</th>
															<th className="px-4 py-3">Threshold</th>
															<th className="px-4 py-3">Frequency</th>
															<th className="px-4 py-3">Status</th>
														</tr>
													</thead>
													<tbody className="text-sm text-slate-700">
														{notificationEvents.map((event) => (
															<tr key={event.category} className="border-b border-slate-100 last:border-b-0">
																<td className="px-4 py-3">
																	<div className="font-bold text-slate-900">{event.category}</div>
																	<div className="text-xs text-slate-500">{event.detail}</div>
																</td>
																<td className="px-4 py-3">
																	<span className={`rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest ${event.threshold === 'Critical' ? 'bg-rose-100 text-rose-600' : event.threshold === 'Low' ? 'bg-[#e8edff] text-[#4f66be]' : 'bg-[#edf2ff] text-[#2444ac]'}`}>
																		{event.threshold}
																	</span>
																</td>
																<td className="px-4 py-3">
																	<div className="flex h-9 items-center justify-between rounded-md border border-slate-200 bg-[#f8faff] px-3 text-xs">
																		<span>{event.frequency}</span>
																		<FiChevronDown className="h-3.5 w-3.5 text-slate-400" />
																	</div>
																</td>
																<td className="px-4 py-3"><button className={`relative h-6 w-11 rounded-full ${event.enabled ? 'bg-[#0f51ff]' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white ${event.enabled ? 'left-5.5' : 'left-0.5'}`} /></button></td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</article>
									</div>

									<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
										<article className="rounded-2xl border border-slate-200/80 bg-white p-4">
											<div className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiSettings className="h-4 w-4 text-[#2444ac]" /> Custom Alert Branding</div>
											<div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(170px,0.8fr)]">
												<div className="space-y-3">
													<div>
														<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Notification Accent Color</div>
														<div className="flex items-center gap-2">
															<span className="h-6 w-6 rounded-full border-2 border-white bg-[#0f51ff] ring-2 ring-[#0f51ff]" />
															<span className="h-6 w-6 rounded-full bg-[#5a79e8]" />
															<span className="h-6 w-6 rounded-full bg-[#27354e]" />
															<span className="h-6 w-6 rounded-full bg-[#af2f2f]" />
															<span className="h-6 w-6 rounded-full bg-[#8f1111]" />
														</div>
													</div>

													<div>
														<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Company Logo In Header</div>
														<div className="flex h-28 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#f8faff] text-center text-xs text-slate-500">
															<FiUpload className="h-5 w-5" />
															<span className="mt-1 font-semibold">Click to upload or drag logo</span>
															<span className="text-[10px]">PNG, JPG up to 5MB</span>
														</div>
													</div>

													<div>
														<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Email Signature</div>
														<textarea className="h-24 w-full rounded-xl border border-slate-200 bg-[#f8faff] px-3 py-2 text-xs text-slate-700" defaultValue={'Atlas Stream Operations Support\nSystem-Generated\nSecurity Alert'} />
													</div>
												</div>

												<div className="rounded-xl border border-slate-200/80 bg-[#f8faff] p-3">
													<div className="rounded-lg border-l-4 border-[#0f51ff] bg-white p-3">
														<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2444ac]">System Alert</div>
														<div className="mt-1 font-bold text-slate-900">Policy Breach Detected</div>
														<p className="mt-1 text-xs text-slate-500">A critical security policy violation has been detected in Region A-B. Immediate admin review is required.</p>
														<div className="mt-3 flex gap-2">
															<button className="rounded-md bg-[#0f51ff] px-2.5 py-1 text-[10px] font-bold text-white">Investigate</button>
															<button className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">Ignore</button>
														</div>
													</div>
												</div>
											</div>
										</article>

										<article className="rounded-2xl bg-[#0f51ff] p-4 text-white">
											<div className="text-2xl font-black tracking-[-0.04em]">Notification Health</div>
											<div className="mt-3 grid grid-cols-2 gap-2">
												<div className="rounded-lg bg-white/12 p-2.5">
													<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-100">Delivery Rate</div>
													<div className="mt-1 text-3xl font-black leading-none">99.8%</div>
												</div>
												<div className="rounded-lg bg-white/12 p-2.5">
													<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-100">Avg Latency</div>
													<div className="mt-1 text-3xl font-black leading-none">1.2s</div>
												</div>
											</div>
											<div className="mt-4 space-y-2 text-xs text-blue-100">
												<div className="flex items-start gap-2"><FiCheckSquare className="mt-0.5 h-3.5 w-3.5" /> All 3 delivery providers are currently operational.</div>
												<div className="flex items-start gap-2"><FiClock className="mt-0.5 h-3.5 w-3.5" /> Last settings change: 2 hours ago by admin_jake.</div>
											</div>
											<button className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0f51ff]">View Full Logs</button>
										</article>
									</div>

									<div className="mt-4 ml-auto flex w-full max-w-90 items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
										<span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#edf2ff] text-[#0f51ff]"><FiActivity className="h-4 w-4" /></span>
										<div className="min-w-0 flex-1">
											<div className="text-sm font-bold text-slate-900">Unsaved Changes</div>
											<div className="text-xs text-slate-500">Don't forget to commit your new notification rules.</div>
										</div>
										<button className="text-slate-400"><FiX className="h-4 w-4" /></button>
									</div>
								</>
							)}

							{activeTab === 'team' && (
								<>
									<div className="mt-5">
										<h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950">Team Preferences</h2>
										<p className="mt-1 max-w-3xl text-sm text-slate-500">Configure how the scheduling engine handles your workforce, define operational thresholds, and manage organizational visibility rules.</p>
									</div>

									<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(250px,0.8fr)]">
										<article className="rounded-2xl border border-slate-200/80 bg-white p-4">
											<div className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900"><FiCalendar className="h-4 w-4 text-[#2444ac]" /> Work Week & Overtime</div>
											<div className="mt-4 grid gap-4 sm:grid-cols-2">
												<div>
													<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Default Start Day</div>
													<div className="flex h-10 items-center justify-between rounded-lg border border-slate-200 bg-[#f8faff] px-3 text-sm text-slate-700">
														<span>Monday</span>
														<FiChevronDown className="h-4 w-4 text-slate-400" />
													</div>
													<div className="mt-1 text-xs text-slate-500">Affects global analytics and reporting periods.</div>
												</div>
												<div className="space-y-3">
													<div>
														<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Weekly OT Threshold</div>
														<div className="flex items-center gap-2">
															<input value="40" readOnly className="h-10 w-16 rounded-lg border border-slate-200 bg-[#f8faff] px-3 text-sm" />
															<span className="text-sm font-semibold text-slate-600">Hours</span>
														</div>
													</div>
													<div>
														<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Daily OT Threshold</div>
														<div className="flex items-center gap-2">
															<input value="8" readOnly className="h-10 w-16 rounded-lg border border-slate-200 bg-[#f8faff] px-3 text-sm" />
															<span className="text-sm font-semibold text-slate-600">Hours</span>
														</div>
													</div>
												</div>
											</div>
										</article>

										<article className="rounded-2xl border border-slate-200/80 bg-white p-4">
											<h3 className="text-xl font-black tracking-[-0.04em] text-slate-900">Visibility Rules</h3>
											<div className="mt-4 space-y-2.5">
												<div className="flex items-center justify-between rounded-lg bg-[#f5f8ff] px-3 py-2.5">
													<div>
														<div className="text-sm font-bold text-slate-900">Show Salaries to Managers</div>
													</div>
													<button className="relative h-6 w-11 rounded-full bg-slate-300"><span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white" /></button>
												</div>
												<div className="flex items-center justify-between rounded-lg bg-[#f5f8ff] px-3 py-2.5">
													<div className="text-sm font-bold text-slate-900">Display Phone Numbers</div>
													<button className="relative h-6 w-11 rounded-full bg-[#0f51ff]"><span className="absolute left-5.5 top-0.5 h-5 w-5 rounded-full bg-white" /></button>
												</div>
												<div className="flex items-center justify-between rounded-lg bg-[#f5f8ff] px-3 py-2.5">
													<div className="text-sm font-bold text-slate-900">Public Profile Access</div>
													<button className="relative h-6 w-11 rounded-full bg-slate-300"><span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white" /></button>
												</div>
											</div>
										</article>
									</div>

									<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(250px,0.8fr)]">
										<article className="rounded-2xl border border-slate-200/80 bg-white p-4">
											<div className="flex items-center justify-between gap-2">
												<div>
													<div className="text-xl font-black tracking-[-0.04em] text-slate-900">Scheduling Engine Tuning</div>
													<div className="text-xs text-slate-500">Adjust how the auto-scheduler prioritizes employee selection.</div>
												</div>
												<span className="rounded-full bg-[#0f51ff] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">Accu v1.2</span>
											</div>

											<div className="mt-4 space-y-4">
												<div>
													<div className="mb-1 flex items-center justify-between text-sm font-bold text-slate-900"><span className="flex items-center gap-1.5"><FiStar className="h-3.5 w-3.5 text-[#0f51ff]" /> Seniority Priority</span><span className="text-[#0f51ff]">65%</span></div>
													<div className="h-2 w-full rounded-full bg-slate-200"><div className="h-2 w-[65%] rounded-full bg-[#0f51ff]" /></div>
												</div>
												<div>
													<div className="mb-1 flex items-center justify-between text-sm font-bold text-slate-900"><span className="flex items-center gap-1.5"><FiSliders className="h-3.5 w-3.5 text-[#0f51ff]" /> Availability Priority</span><span className="text-[#0f51ff]">35%</span></div>
													<div className="h-2 w-full rounded-full bg-slate-200"><div className="h-2 w-[35%] rounded-full bg-[#0f51ff]" /></div>
												</div>
											</div>
										</article>

										<article className="rounded-2xl border border-slate-200/80 bg-[#eef2ff] p-4">
											<div className="text-xl font-black tracking-[-0.04em] text-slate-900">Grouping & Tags</div>
											<div className="mt-3 flex flex-wrap gap-2">
												<span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2444ac]">North West</span>
												<span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2444ac]">Night Shift</span>
												<span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2444ac]">Retail</span>
												<span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2444ac]">Logistics</span>
												<button className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#2444ac]"><FiTag className="h-3.5 w-3.5" /></button>
											</div>
											<div className="mt-4 rounded-xl border border-slate-200/80 bg-white p-3">
												<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Auto-Tagging Logic</div>
												<div className="mt-1 text-xs text-slate-600">Assign "Senior" tag automatically after 24 months of active service.</div>
											</div>
										</article>
									</div>
								</>
							)}

							<div className="mt-6 flex flex-wrap items-center justify-end gap-3">
								<button className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300">Discard Changes</button>
								<button className="rounded-xl bg-[#0f51ff] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0b44de]">{activeTab === 'team' ? 'Save Preferences' : 'Save Configuration'}</button>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
