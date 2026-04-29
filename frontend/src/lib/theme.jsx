import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './theme-context'
const storageKey = 'shiftsync-theme'

function resolveInitialTheme() {
	if (typeof window === 'undefined') {
		return 'light'
	}

	const savedTheme = window.localStorage.getItem(storageKey)
	if (savedTheme === 'dark' || savedTheme === 'light') {
		return savedTheme
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(resolveInitialTheme)

	useEffect(() => {
		document.documentElement.dataset.theme = theme
		document.documentElement.style.colorScheme = theme
		window.localStorage.setItem(storageKey, theme)
	}, [theme])

	const value = useMemo(() => ({
		theme,
		isDark: theme === 'dark',
		toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
		setTheme,
	}), [theme])

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
