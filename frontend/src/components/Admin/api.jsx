import {
	FiActivity,
	FiBell,
	FiBookOpen,
	FiChevronDown,
	FiCode,
	FiCopy,
	FiCreditCard,
	FiGrid,
	FiKey,
	FiLogOut,
	FiMenu,
	FiMoon,
	FiPlus,
	FiSearch,
	FiSettings,
	FiUsers,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const chartBars = [32, 28, 36, 44, 58, 66, 74, 63, 41, 32, 25, 29, 40, 52, 55, 41]

const apiKeys = [
	{ name: 'Production_Main_Vault', masked: 'pk_live_****************3f92', lastUsed: '2 mins ago' },
	{ name: 'Testing_Staging_Env', masked: 'pk_test_****************9a11', lastUsed: '14 days ago' },
]

const connectedApps = [
	{ name: 'Slack', desc: 'Instant alerts and notifications', enabled: true },
	{ name: 'Microsoft Teams', desc: 'Internal workforce collaboration', enabled: true },
	{ name: 'SAP Business Suite', desc: 'Enterprise resource sync', enabled: false },
	{ name: 'Workday HCM', desc: 'Employee lifecycle automation', enabled: true },
	{ name: 'Custom Webhook', desc: 'Personalized data bridge', enabled: false },
]

export default function ApiIntegrations() {
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
						<Link className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-[#0f51ff]" to="/admin-api"><FiCreditCard className="h-4 w-4" /> Integrations & API</Link>
						<Link className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/70" to="/admin-settings"><FiSettings className="h-4 w-4" /> Settings</Link>
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
								<input type="search" placeholder="Search keys, apps, or webhook endpoints..." className="h-12 w-full rounded-full border border-slate-200/80 bg-[#f5f7ff] px-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f51ff] focus:bg-white" />
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
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">Integrations & API</h1>
									<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">Connect your ecosystem and manage secure access via our enterprise-grade API suite and webhooks.</p>
								</div>
								<div className="flex items-center gap-2">
									<button className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-[#eef2ff] px-4 text-xs font-bold text-[#1f3b9c] transition hover:bg-[#e3eafe]"><FiBookOpen className="h-4 w-4" /> Documentation</button>
									<button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0f51ff] px-4 text-xs font-bold text-white transition hover:bg-[#0b44de]"><FiPlus className="h-4 w-4" /> New Integration</button>
								</div>
							</div>

							<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
								<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div>
											<h2 className="text-xl font-black tracking-[-0.03em] text-slate-900">API Traffic</h2>
											<p className="text-xs text-slate-500">Real-time call volume (last 24 hours)</p>
										</div>
										<div className="flex items-center gap-6">
											<div>
												<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Total Calls</div>
												<div className="text-[34px] font-black leading-none tracking-[-0.06em] text-[#0f51ff]">1,240,482</div>
											</div>
											<div>
												<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Success Rate</div>
												<div className="text-[34px] font-black leading-none tracking-[-0.06em] text-emerald-600">99.98%</div>
											</div>
										</div>
									</div>
									<div className="mt-6 flex items-end gap-1.5">
										{chartBars.map((height, index) => (
											<div key={`${height}-${index}`} className={`h-20 flex-1 rounded-sm ${index >= 6 && index <= 7 ? 'bg-[#0f51ff]' : index >= 4 && index <= 5 ? 'bg-[#9fb4eb]' : 'bg-[#dde4f7]'}`} style={{ height: `${height + 20}px` }} />
										))}
									</div>
								</article>

								<article className="rounded-2xl bg-[#0f51ff] p-5 text-white">
									<h3 className="text-2xl font-black tracking-[-0.04em]">Developer Sandbox</h3>
									<p className="mt-3 text-sm leading-6 text-blue-100">Test your integration flows in our isolated staging environment before going live.</p>
									<ul className="mt-5 space-y-2 text-sm text-blue-100">
										<li className="flex items-center gap-2"><FiCode className="h-4 w-4" /> REST API Explorer</li>
										<li className="flex items-center gap-2"><FiBookOpen className="h-4 w-4" /> SDK Libraries (Node, Python)</li>
										<li className="flex items-center gap-2"><FiActivity className="h-4 w-4" /> Security Best Practices</li>
									</ul>
									<button className="mt-6 w-full rounded-xl bg-white/15 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/25">Launch Playground</button>
								</article>
							</div>

							<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
								<div className="space-y-5">
									<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
										<div className="mb-4 flex items-center justify-between gap-2">
											<h3 className="text-2xl font-black tracking-[-0.04em] text-slate-900">API Keys</h3>
											<button className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#0f51ff]">Generate New Key</button>
										</div>
										<div className="space-y-3">
											{apiKeys.map((key) => (
												<div key={key.name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-[#f8faff] px-4 py-3">
													<div className="flex items-center gap-3">
														<div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8edff] text-[#2444ac]"><FiKey className="h-4 w-4" /></div>
														<div>
															<div className="font-bold text-slate-900">{key.name}</div>
															<div className="text-xs text-slate-500">{key.masked}</div>
														</div>
													</div>
													<div className="flex items-center gap-4">
														<div className="text-right">
															<div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Last Used</div>
															<div className="text-xs font-semibold text-slate-700">{key.lastUsed}</div>
														</div>
														<button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500"><FiCopy className="h-3.5 w-3.5" /></button>
													</div>
												</div>
											))}
										</div>
									</article>

									<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
										<div className="mb-4 flex items-center justify-between gap-2">
											<h3 className="text-2xl font-black tracking-[-0.04em] text-slate-900">Webhooks</h3>
											<span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-700">Active</span>
										</div>
										<div className="space-y-3">
											<div>
												<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Endpoint URL</div>
												<div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-[#f8faff] px-3 py-2 text-xs text-slate-700">
													<span>https://api.acmecorp.com/webhooks/receiver</span>
													<button className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500"><FiCopy className="h-3.5 w-3.5" /></button>
												</div>
											</div>
											<div className="grid gap-3 sm:grid-cols-2">
												<div>
													<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Signing Secret</div>
													<div className="rounded-lg border border-slate-200 bg-[#f8faff] px-3 py-2 text-xs font-bold tracking-[0.16em] text-slate-700">***********************</div>
												</div>
												<div>
													<div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Trigger Events</div>
													<div className="flex flex-wrap items-center gap-1.5">
														<span className="rounded-md bg-[#e8edff] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2746ad]">shift.started</span>
														<span className="rounded-md bg-[#e8edff] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#2746ad]">user.updated</span>
														<span className="rounded-md bg-[#eef2ff] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">+4 more</span>
													</div>
												</div>
											</div>
										</div>
									</article>
								</div>

								<article className="rounded-2xl border border-slate-200/80 bg-white p-5">
									<h3 className="text-2xl font-black tracking-[-0.04em] text-slate-900">Connected Apps</h3>
									<div className="mt-4 space-y-3">
										{connectedApps.map((app) => (
											<div key={app.name} className="flex items-center justify-between gap-3 rounded-xl bg-[#f8faff] px-3 py-3">
												<div className="min-w-0">
													<div className="font-bold text-slate-900">{app.name}</div>
													<div className="truncate text-xs text-slate-500">{app.desc}</div>
												</div>
												<button className={`relative h-6 w-11 rounded-full transition ${app.enabled ? 'bg-[#0f51ff]' : 'bg-slate-300'}`} aria-label={`${app.name} toggle`}>
													<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${app.enabled ? 'left-5.5' : 'left-0.5'}`} />
												</button>
											</div>
										))}
									</div>
									<button className="mt-4 w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-[#0f51ff] hover:text-[#0f51ff]">Browse Integration Marketplace</button>
								</article>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}
