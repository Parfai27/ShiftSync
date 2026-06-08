import { useEffect, useRef, useState } from 'react'
import { FiArrowRight, FiSend, FiX } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { answerKnowledgeQuery, getContextualHelp } from '../../lib/chatbotKnowledge.js'
import { apiRequest } from '../../lib/api.js'
import { loadSession } from '../../lib/session.js'
import { useTheme } from '../../lib/theme-context.js'

function buildWelcomeMessage() {
	return {
		id: 'welcome',
		author: 'assistant',
		topic: 'Sync',
		text: `Hi, I'm Sync. How can I help you today?`,
		route: null,
	}
}

function SyncBotIcon({ className = '' }) {
	return (
		<svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none">
			<rect x="20" y="6" width="24" height="8" rx="4" fill="white" />
			<rect x="30" y="12" width="4" height="8" rx="2" fill="white" />
			<rect x="17" y="18" width="30" height="26" rx="15" fill="white" />
			<circle cx="17" cy="31" r="5" fill="white" />
			<circle cx="47" cy="31" r="5" fill="white" />
			<path d="M27 42H37L31 49C29.4 50.8 27 49.6 27 47.2V42Z" fill="white" />
			<rect x="20" y="24" width="24" height="14" rx="7" fill="#10205f" />
			<circle cx="27" cy="31" r="3" fill="#3CE3FF" />
			<circle cx="37" cy="31" r="3" fill="#3CE3FF" />
		</svg>
	)
}

function trimMessages(messages) {
	const welcome = messages[0]?.author === 'assistant' ? [messages[0]] : []
	const body = welcome.length ? messages.slice(1) : messages
	return [...welcome, ...body.slice(-12)]
}

function toApiMessages(messages) {
	return messages
		.filter((message) => message?.text)
		.map((message) => ({
			role: message.author === 'assistant' ? 'assistant' : 'user',
			content: message.text,
		}))
}

export default function ShiftSyncAssistant() {
	const navigate = useNavigate()
	const location = useLocation()
	const { isDark } = useTheme()
	const session = loadSession()
	const role = session?.role || 'GUEST'
	const displayName = session?.fullName || session?.name || 'there'
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [messages, setMessages] = useState(() => [buildWelcomeMessage()])
	const [isThinking, setIsThinking] = useState(false)
	const bodyRef = useRef(null)
	const contextualHelp = getContextualHelp(location.pathname, role)

	useEffect(() => {
		if (isOpen) {
			setMessages([buildWelcomeMessage()])
			setQuery('')
			setIsThinking(false)
		}
	}, [isOpen])

	useEffect(() => {
		if (!isOpen || !bodyRef.current) {
			return
		}

		bodyRef.current.scrollTop = bodyRef.current.scrollHeight
	}, [messages, isThinking, isOpen])

	const sendQuery = async (submittedQuery) => {
		const trimmedQuery = submittedQuery.trim()
		if (!trimmedQuery || isThinking) {
			return
		}

		const userMessage = { id: `user-${Date.now()}`, author: 'user', text: trimmedQuery }
		const nextMessages = trimMessages([...messages, userMessage])

		setMessages(nextMessages)
		setQuery('')
		setIsThinking(true)

		try {
			const response = await apiRequest('/api/chat/message', {
				method: 'POST',
				body: JSON.stringify({
					userId: session?.userId ?? null,
					role,
					fullName: displayName,
					pathname: location.pathname,
					messages: toApiMessages(nextMessages),
				}),
			})

			setMessages((current) => trimMessages([
				...current,
				{
					id: `assistant-${Date.now() + 1}`,
					author: 'assistant',
					text: response?.reply || 'I was not able to generate a reply just now.',
					topic: response?.topic || 'ShiftSync assistant',
					route: response?.route || null,
				},
			]))
		} catch {
			const response = answerKnowledgeQuery(trimmedQuery, role, location.pathname)
			setMessages((current) => trimMessages([
				...current,
				{
					id: `assistant-${Date.now() + 1}`,
					author: 'assistant',
					text: response.answer,
					topic: response.topic,
					route: response.route,
				},
			]))
		} finally {
			setIsThinking(false)
		}
	}

	const panelClassName = isDark
		? 'border-slate-700 bg-slate-900/95 text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.55)]'
		: 'border-slate-200/80 bg-white/95 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.16)]'

	const bubbleClassName = isDark
		? 'border border-slate-700 bg-slate-800 text-slate-100'
		: 'border border-slate-200 bg-slate-100 text-slate-800'

	return (
		<div className="fixed bottom-5 right-5 z-[1000]">
			{isOpen ? (
				<div className={`w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[28px] border backdrop-blur-xl ${panelClassName}`}>
					<div className={`flex items-center justify-end px-4 py-3 ${isDark ? 'bg-slate-950/70' : 'bg-[#f5f8ff]'}`}>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className={`rounded-full p-2 transition ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
							aria-label="Close ShiftSync assistant"
						>
							<FiX className="text-lg" />
						</button>
					</div>

					<div ref={bodyRef} className="max-h-[460px] space-y-4 overflow-y-auto px-4 py-4">
						{messages.map((message) => (
							<div key={message.id} className={`flex ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}>
								<div className={`max-w-[88%] rounded-3xl px-4 py-3 ${message.author === 'user' ? 'bg-blue-600 text-white shadow-[0_18px_40px_rgba(37,99,235,0.25)]' : bubbleClassName}`}>
									{message.topic ? <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-blue-500">{message.topic}</p> : null}
									<p className="text-sm leading-6">{message.text}</p>
									{message.route ? (
										<button
											type="button"
											onClick={() => navigate(message.route)}
											className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
										>
											Open page
											<FiArrowRight />
										</button>
									) : null}
								</div>
							</div>
						))}

						{isThinking ? (
							<div className="flex justify-start">
								<div className={`max-w-[88%] rounded-3xl px-4 py-3 ${bubbleClassName}`}>
									<p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-blue-500">Sync</p>
									<p className="text-sm leading-6">Thinking...</p>
								</div>
							</div>
						) : null}
					</div>

					<div className={`border-t px-4 py-4 ${isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
						<p className={`mb-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{contextualHelp}</p>
						<form
							onSubmit={(event) => {
								event.preventDefault()
								void sendQuery(query)
							}}
							className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}
						>
							<input
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Type your question about ShiftSync..."
								className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
							/>
							<button
								type="submit"
								className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
								aria-label="Send assistant message"
								disabled={isThinking}
							>
								<FiSend />
							</button>
						</form>
					</div>
				</div>
			) : null}

			<button
				type="button"
				onClick={() => setIsOpen((current) => !current)}
				className="group flex h-16 w-16 items-center justify-center rounded-full bg-[#10205f] text-white shadow-[0_24px_60px_rgba(16,32,95,0.34)] transition hover:bg-[#0b1747]"
				aria-label="Open Sync chatbot"
			>
				<SyncBotIcon className="h-10 w-10" />
			</button>
		</div>
	)
}
