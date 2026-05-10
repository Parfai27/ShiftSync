import { startTransition, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import { saveSession } from '../lib/session'

function resolveDestination(role) {
	if (role === 'ADMIN') {
		return '/admin-overview'
	}

	if (role === 'EMPLOYEE') {
		return '/employee-dashboard'
	}

	return '/overview'
}

export default function Login() {
	const navigate = useNavigate()
	const location = useLocation()
	const [form, setForm] = useState({ email: '', password: '', remember: false })
	const [error, setError] = useState(location.state?.message || '')
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function handleLogin(credentials) {
		setIsSubmitting(true)
		setError('')

		try {
			const payload = await apiRequest('/api/auth/login', {
				method: 'POST',
				body: JSON.stringify(credentials),
			})

			saveSession({
				...payload,
				remember: form.remember,
				loggedInAt: new Date().toISOString(),
				lastActivityAt: new Date().toISOString(),
			})

			startTransition(() => {
				if (payload.role === 'EMPLOYEE' && payload.mustChangePassword) {
					navigate('/employee-settings', {
						state: {
							firstLogin: true,
							message: 'Please change your temporary password before continuing.',
						},
					})
					return
				}
				navigate(resolveDestination(payload.role))
			})
		} catch (loginError) {
			setError(loginError.message || 'Unable to sign in with those credentials.')
		} finally {
			setIsSubmitting(false)
		}
	}

	function handleSubmit(event) {
		event.preventDefault()
		handleLogin({
			email: form.email.trim(),
			password: form.password,
		})
	}

	return (
		<main className="min-h-screen bg-[#edf2f7] text-slate-900">
			<div
				className="relative mx-auto flex min-h-screen w-full overflow-hidden bg-white"
				style={{ maxWidth: '1600px', borderRadius: '0' }}
			>
				<section className="relative z-10 flex w-full flex-col justify-between bg-white/88 px-6 py-8 backdrop-blur-md sm:px-10 lg:w-[40%] lg:px-12 xl:px-16">
					<div>
						<Link to="/" className="mb-2 inline-flex items-center gap-3 rounded-full bg-white/80 px-0 py-0">
							<div className="flex items-center gap-3">
								<img src="/logo.png" alt="ShiftSync" className="h-19 w-auto object-contain" />
							</div>
						</Link>

						<h1 className="max-w-sm text-[34px] font-extrabold tracking-[-0.05em] text-slate-950 sm:text-[44px]">
							Welcome Back
						</h1>

						<p className="mt-3 max-w-sm text-[14px] leading-6 text-slate-500 sm:text-[15px]">
							Please enter your credentials to access your workforce dashboard.
						</p>

						<form className="mt-10 space-y-5" style={{ maxWidth: '360px' }} onSubmit={handleSubmit}>
							<label className="block">
								<span className="mb-2 block text-[12px] font-semibold text-slate-700">
									Email Address
								</span>
								<input
									type="email"
									value={form.email}
									onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
									placeholder="name@organization.com"
									autoComplete="email"
									className="h-11 w-full rounded-md border border-slate-200 bg-[#f8faff] px-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1051ff] focus:bg-white"
								/>
							</label>

							<div>
								<div className="mb-2 flex items-center justify-between gap-3">
									<label className="block text-[12px] font-semibold text-slate-700">
										Password
									</label>
									<a
										href="#"
										className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1051ff] transition hover:text-[#0b3bc0]"
									>
										Forgot Password?
									</a>
								</div>
								<input
									type="password"
									value={form.password}
									onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
									placeholder="••••••••"
									autoComplete="current-password"
									className="h-11 w-full rounded-md border border-slate-200 bg-[#f8faff] px-4 text-[18px] tracking-[0.3em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1051ff] focus:bg-white"
								/>
							</div>

							<label className="flex items-center gap-2 text-[12px] text-slate-600">
								<input
									type="checkbox"
									checked={form.remember}
									onChange={(event) => setForm((current) => ({ ...current, remember: event.target.checked }))}
									className="h-3.5 w-3.5 rounded border-slate-300 text-[#1051ff] focus:ring-[#1051ff]"
								/>
								<span>Keep me logged in</span>
							</label>

							{error ? (
								<div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
									{error}
								</div>
							) : null}

							<button
								type="submit"
								disabled={isSubmitting}
								className="flex h-11 w-full items-center justify-center rounded-md bg-[#1051ff] text-[12px] font-extrabold uppercase tracking-[0.18em] text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0d47e0] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
							>
								{isSubmitting ? 'Signing In...' : 'Login'}
							</button>
						</form>
					</div>

					<p className="mt-12 max-w-xs text-[10px] leading-4 text-slate-500">
						© 2026 ShiftSync. All rights reserved.
						<br />
						Precision Clarity in Workforce Management.
					</p>
				</section>

				<section className="relative hidden flex-1 self-stretch overflow-hidden lg:block">
					<div
						className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
						style={{
							backgroundImage: "url('/login.png')",
							backgroundPosition: 'center center',
							backgroundRepeat: 'no-repeat',
							backgroundSize: 'cover',
						}}
					/>
					<div className="absolute inset-0 backdrop-blur-[1px]" />

					<div className="absolute right-10 top-10 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-slate-700 backdrop-blur-md">
						Workforce Intelligence
					</div>

					<div
						className="absolute bottom-12 right-10 rounded-[14px] bg-white/88 px-8 py-7 text-center backdrop-blur-md"
						style={{ maxWidth: '310px' }}
					>
						<div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2ff] text-[#1051ff]">
							<svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
								<path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.95 1.97 3.45V20h7v-3.5c0-2.33-4.67-3.5-8-3.5Z" />
							</svg>
						</div>
						<h2 className="text-[19px] font-bold tracking-[-0.03em] text-slate-900">
							Connect Your Team
						</h2>
						<p className="mt-3 text-[12px] leading-5 text-slate-500">
							Optimizing shift transitions and employee compliance with architectural precision. The future of work is fluid.
						</p>
					</div>
				</section>
			</div>
		</main>
	)
}
