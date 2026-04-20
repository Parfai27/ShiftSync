import { useState } from 'react'
import { Link } from 'react-router-dom'

const navLinks = [
	{ label: 'Features', href: '#' },
	{ label: 'Workflow', href: '#' },
	{ label: 'Contact', href: '#' },
]

const partnerLogos = ['Scheduling', 'Coverage', 'Compliance', 'Allocation', 'Reporting']

const precisionCards = [
	{
		label: '01 / Allocation',
		title: 'Smart Shift Creation',
		description:
			'Generate employee shifts with intelligent logic that matches staffing demand, availability, and workload balance.',
	},
	{
		label: '02 / Fairness',
		title: 'Balanced Distribution',
		description:
			'Promote fair shift assignment across teams while reducing bias, overlap, and scheduling conflicts.',
	},
	{
		label: '03 / Coverage',
		title: 'Policy-Aware Coverage',
		description:
			'Maintain optimal staff coverage and align every schedule with organizational rules and operational needs.',
	},
]

const workflowPhases = [
	{
		label: 'Phase 01',
		title: 'Input Workforce Rules',
		description:
			'Define employee availability, shift requirements, and organizational policies in one scheduling workspace.',
	},
	{
		label: 'Phase 02',
		title: 'Generate Smart Schedules',
		description:
			'Use intelligent scheduling logic to allocate shifts fairly, reduce manual effort, and avoid common planning errors.',
	},
	{
		label: 'Phase 03',
		title: 'Monitor And Adjust',
		description:
			'Review coverage, track changes, and update assignments quickly when staffing needs shift.',
	},
]

const footerColumns = [
	{
		title: 'Features',
		items: ['Shift Scheduling', 'Coverage Tracking', 'Compliance Rules', 'Reports'],
	},
	{
		title: 'Workflow',
		items: ['Availability Input', 'Auto Allocation', 'Schedule Review', 'Adjustments'],
	},
	{
		title: 'ShiftSync',
		items: ['System Overview', 'Scheduling Logic', 'Admin Dashboard', 'Employee Access'],
	},
]

function Landing() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	return (
		<section className="w-full bg-[#f8f8f8]">
			<header className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
				<nav className="relative rounded-md border border-slate-200 bg-white/95 shadow-sm">
					<div className="flex h-16 items-center justify-between px-4 sm:px-6">
						<a href="#" className="flex items-center gap-3">
							<img src="/logo.png" alt="ShiftSync" className="h-19 w-auto object-contain" />
						</a>

						<ul className="hidden items-center gap-10 md:flex">
							{navLinks.map((link) => (
								<li key={link.label}>
									<a
										href={link.href}
										className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 transition hover:text-slate-900"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>

						<div className="hidden items-center gap-4 md:flex">
							<button
								type="button"
								className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
								aria-label="Search"
							>
								<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
									<circle cx="11" cy="11" r="7" />
									<path d="m20 20-3.2-3.2" />
								</svg>
							</button>

							<Link
								to="/login"
								className="rounded-sm bg-blue-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-blue-800"
							>
								staff login
							</Link>
						</div>

						<button
							type="button"
							className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
							onClick={() => setIsMenuOpen((prev) => !prev)}
							aria-expanded={isMenuOpen}
							aria-controls="mobile-nav"
							aria-label="Toggle menu"
						>
							<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
								{isMenuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
							</svg>
						</button>
					</div>

					{isMenuOpen && (
						<div id="mobile-nav" className="border-t border-slate-200 px-4 py-4 md:hidden">
							<ul className="flex flex-col gap-3">
								{navLinks.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="block rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>

							<div className="mt-4 flex items-center justify-between">
								<button
									type="button"
									className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
									aria-label="Search"
								>
									<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
										<circle cx="11" cy="11" r="7" />
										<path d="m20 20-3.2-3.2" />
									</svg>
								</button>

								<a
									href="#"
									className="rounded-sm bg-blue-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-blue-800"
								>
									Contact Team
								</a>
							</div>
						</div>
					)}
				</nav>
			</header>

			<section className="mx-auto w-full max-w-7xl px-4 pb-14 pt-4 sm:px-6 lg:px-8 lg:pb-20 lg:pt-8">
				<div className="relative overflow-hidden rounded-2xl bg-[#fbfcff] p-6 sm:p-8 lg:p-10">
					<div
						className="pointer-events-none absolute inset-0 opacity-60"
						style={{
							backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
							backgroundSize: '20px 20px',
						}}
					/>

					<div className="relative grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
						<div className="order-1">
							<span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700 sm:text-xs">
								Intelligent Employee Shift Scheduling
							</span>

							<h1 className="mt-6 text-5xl font-black leading-[0.95] text-slate-900 sm:text-6xl lg:text-7xl">
								Plan
								<br />
								Shifts
								<br />
								<span className="italic text-blue-700">Intelligently.</span>
							</h1>

							<p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
								ShiftSync is an intelligent employee shift scheduling system that automates creation,
								allocation, and management of work shifts to improve fairness, coverage, and efficiency.
							</p>

							<div className="mt-8 flex flex-wrap items-center gap-4">
								<a
									href="#"
									className="inline-flex min-h-12 items-center justify-center rounded-sm bg-slate-900 px-7 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
								>
									Open Dashboard
								</a>

								<a
									href="#"
									className="inline-flex min-h-12 items-center border-b-2 border-blue-400 px-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 transition hover:text-blue-700"
								>
									View Scheduling Workflow
								</a>
							</div>
						</div>

						<div className="relative order-2">
							<img
								src="/Group.png"
								alt="Hero visual"
								className="h-80 w-full object-cover sm:h-95 lg:h-110"
							/>
							<p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
								Overview of automated scheduling, staff allocation, and coverage management.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="w-full bg-[#f8f8f8]">
				<div className="mx-auto w-full max-w-375 px-4 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-20">
					<div className="border-y border-slate-200 py-4">
						<p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 sm:text-xs">
							Built Around Core Scheduling Workflows
						</p>
						<div className="relative mt-4 overflow-hidden">
							<div
								className="flex min-w-max items-center gap-10 sm:gap-14"
								style={{ animation: 'logoMarquee 20s linear infinite' }}
							>
								{[...partnerLogos, ...partnerLogos].map((partner, index) => (
									<div
										key={`${partner}-${index}`}
										className="flex min-h-11 min-w-36 items-center justify-center gap-2 text-slate-400"
										aria-hidden={index >= partnerLogos.length}
									>
										<svg
											viewBox="0 0 24 24"
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.8"
										>
											<rect x="4" y="4" width="16" height="16" />
											<path d="M8 8h2M8 12h2M8 16h2M12 8h6M12 12h6M12 16h6" />
										</svg>
										<span className="text-lg font-semibold uppercase tracking-[0.02em]">{partner}</span>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="mt-12 grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
						<h2 className="max-w-xl text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
							One system for fair, efficient shift planning.
						</h2>
						<p className="max-w-2xl text-lg leading-relaxed text-slate-600">
							ShiftSync reduces manual scheduling errors and administrative workload while helping teams
							maintain fair shift distribution, policy compliance, and optimal staff coverage.
						</p>
					</div>

					<div className="mt-10 grid w-full grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-3">
						{precisionCards.map((card) => (
							<article
								key={card.label}
								className="flex h-full flex-col border border-slate-200 bg-white p-8 sm:p-10"
							>
								<p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">{card.label}</p>
								<h3 className="mt-8 text-3xl font-black text-slate-900 sm:text-4xl">{card.title}</h3>
								<p className="mt-6 text-base leading-relaxed text-slate-600">{card.description}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="w-full bg-[#0a1636]">
				<div className="mx-auto w-full max-w-375 px-4 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-20">
					<div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-400">How It Works</p>
							<h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
								The Scheduling
								<br />
								<span className="text-blue-400">Workflow</span>
							</h2>

							<div className="mt-8 space-y-8">
								{workflowPhases.map((phase) => (
									<article key={phase.label}>
										<p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-400">
											{phase.label}
										</p>
										<h3 className="mt-2 text-2xl font-bold text-slate-100">{phase.title}</h3>
										<p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">{phase.description}</p>
									</article>
								))}
							</div>
						</div>

						<div className="relative">
							<img
								src="/Group%202.png"
								alt="Workflow preview"
								className="h-80 w-full object-cover sm:h-105 lg:h-130"
							/>
						</div>
					</div>
				</div>
			</section>

			<section className="w-full bg-[#f3f4f6]">
				<div className="mx-auto w-full max-w-375 px-4 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
					<div className="grid gap-10 lg:grid-cols-[1.25fr_2fr_1fr] lg:gap-12">
						<div>
							<div className="flex items-center gap-3">
								<img src="/logo.png" alt="ShiftSync" className="h-19 w-auto object-contain" />
							</div>

							<p className="mt-7 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
								An intelligent employee shift scheduling system designed to automate planning, improve
								coverage, and support fair workforce management.
							</p>

							<div className="mt-7 flex items-center gap-4 text-slate-500">
								<a href="#" aria-label="Network" className="rounded-md p-2 transition hover:bg-slate-200 hover:text-slate-800">
									<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
										<circle cx="6" cy="12" r="2" />
										<circle cx="18" cy="7" r="2" />
										<circle cx="18" cy="17" r="2" />
										<path d="M7.8 11.2 16.2 7.8M7.8 12.8l8.4 3.4" />
									</svg>
								</a>
								<a href="#" aria-label="Website" className="rounded-md p-2 transition hover:bg-slate-200 hover:text-slate-800">
									<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
										<circle cx="12" cy="12" r="9" />
										<path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
									</svg>
								</a>
								<a href="#" aria-label="Email" className="rounded-md p-2 transition hover:bg-slate-200 hover:text-slate-800">
									<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M4 6h16v12H4z" />
										<path d="m4 8 8 6 8-6" />
									</svg>
								</a>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
							{footerColumns.map((column) => (
								<div key={column.title}>
									<h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">{column.title}</h3>
									<ul className="mt-6 space-y-4">
										{column.items.map((item) => (
											<li key={item}>
												<a href="#" className="text-sm text-slate-600 transition hover:text-slate-900 sm:text-base">
													{item}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>

						<div>
							<h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Contact</h3>
							<p className="mt-5 text-xs text-slate-600">Project Support</p>
							<p className="mt-4 text-xs font-bold leading-snug text-slate-800">Workforce Management System</p>
							<a
								href="#"
								className="mt-6 inline-flex text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-700 transition hover:text-blue-800"
							>
								Contact Us
							</a>
						</div>
					</div>

					<div className="mt-12 border-t border-slate-300 pt-8">
						<div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
							<p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
								© 2026 ShiftSync. Intelligent Shift Scheduling.
							</p>
							<div className="flex flex-wrap items-center gap-6 sm:gap-10">
								<a href="#" className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-700">
									Privacy Policy
								</a>
								<a href="#" className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-700">
									Compliance
								</a>
								<a href="#" className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-700">
									Terms Of Service
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			<style>{`
				@keyframes logoMarquee {
					0% { transform: translateX(0); }
					100% { transform: translateX(-50%); }
				}
			`}</style>
		</section>
	)
}

export default Landing
