import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../../lib/theme-context'

export default function ThemeToggleButton() {
	const { isDark, toggleTheme } = useTheme()
	const Icon = isDark ? FiSun : FiMoon

	return (
		<button
			className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5"
			onClick={toggleTheme}
			type="button"
			aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
			title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			<Icon className="h-4 w-4" />
		</button>
	)
}
