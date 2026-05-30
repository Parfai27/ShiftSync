import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiCheck, FiDownload, FiFileText, FiX } from 'react-icons/fi'

function FormatBadge({ label, active, onClick }) {
	return (
		<button
			className={`rounded-2xl px-4 py-2.5 text-sm font-bold uppercase tracking-[0.12em] transition ${
				active
					? 'bg-[#0f51ff] text-white shadow-[0_10px_24px_rgba(15,81,255,0.24)]'
					: 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#0f51ff]/40'
			}`}
			onClick={onClick}
			type="button"
		>
			{label}
		</button>
	)
}

export default function ExportPickerModal({
	title,
	subtitle,
	options,
	selectedId,
	onSelect,
	format,
	onFormatChange,
	availableFormats = ['csv', 'json'],
	scope,
	onScopeChange,
	scopeOptions,
	previewLines = [],
	disabledOptionIds = [],
	isExporting = false,
	error = '',
	onClose,
	onExport,
}) {
	const selectedOption = options.find((option) => option.id === selectedId)
	const formatsForSelection = selectedOption?.formats || availableFormats

	useEffect(() => {
		function handleKeyDown(event) {
			if (event.key === 'Escape' && !isExporting) {
				onClose()
			}
		}

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		window.addEventListener('keydown', handleKeyDown)

		return () => {
			document.body.style.overflow = previousOverflow
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isExporting, onClose])

	const modal = (
		<div
			className="export-modal-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
			onClick={() => {
				if (!isExporting) {
					onClose()
				}
			}}
			role="presentation"
		>
			<div
				aria-labelledby="export-modal-title"
				aria-modal="true"
				className="export-modal-panel flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-slate-200/80 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)] sm:rounded-[28px]"
				onClick={(event) => event.stopPropagation()}
				role="dialog"
			>
				<div className="shrink-0 border-b border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] px-5 py-5 sm:px-6">
					<div className="flex items-start justify-between gap-4">
						<div className="min-w-0">
							<div className="inline-flex items-center gap-2 rounded-full bg-[#eef3ff] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#0f51ff]">
								<FiFileText className="h-3.5 w-3.5" />
								Export
							</div>
							<h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-[1.75rem]" id="export-modal-title">
								{title}
							</h2>
							<p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{subtitle}</p>
						</div>
						<button
							aria-label="Close export dialog"
							className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-white px-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
							disabled={isExporting}
							onClick={onClose}
							type="button"
						>
							<FiX className="h-4 w-4 sm:mr-1" />
							<span className="hidden sm:inline">Close</span>
						</button>
					</div>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
					<section className="space-y-3">
						<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Choose export</div>
						<div className="grid gap-3">
							{options.map((option) => {
								const isDisabled = disabledOptionIds.includes(option.id)
								const isSelected = selectedId === option.id
								return (
									<button
										key={option.id}
										className={`group relative w-full rounded-[22px] border px-4 py-4 text-left transition ${
											isSelected
												? 'border-[#0f51ff] bg-[#eef3ff] shadow-[0_12px_30px_rgba(15,81,255,0.12)] ring-1 ring-[#0f51ff]/20'
												: 'border-slate-200 bg-[#f8faff] hover:border-slate-300 hover:bg-white'
										} ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
										disabled={isDisabled}
										onClick={() => onSelect(option.id)}
										type="button"
									>
										<div className="flex items-start gap-3">
											<span
												className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
													isSelected ? 'border-[#0f51ff] bg-[#0f51ff] text-white' : 'border-slate-300 bg-white text-transparent'
												}`}
											>
												<FiCheck className="h-3 w-3" />
											</span>
											<span className="min-w-0">
												<span className="block text-sm font-bold text-slate-900">{option.label}</span>
												<span className="mt-1 block text-sm leading-6 text-slate-500">{option.description}</span>
											</span>
										</div>
									</button>
								)
							})}
						</div>
					</section>

					{scopeOptions?.length ? (
						<section className="mt-6">
							<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Data scope</div>
							<div className="mt-3 flex flex-wrap gap-2">
								{scopeOptions.map((option) => (
									<button
										key={option.id}
										className={`rounded-full px-4 py-2 text-sm font-bold transition ${
											scope === option.id
												? 'bg-[#0f51ff] text-white shadow-[0_8px_20px_rgba(15,81,255,0.22)]'
												: 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#0f51ff]/30'
										}`}
										onClick={() => onScopeChange(option.id)}
										type="button"
									>
										{option.label}
									</button>
								))}
							</div>
						</section>
					) : null}

					<section className="mt-6">
						<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">File format</div>
						<div className="mt-3 flex flex-wrap gap-2">
							{formatsForSelection.map((option) => (
								<FormatBadge
									key={option}
									active={format === option}
									label={option}
									onClick={() => onFormatChange(option)}
								/>
							))}
						</div>
					</section>

					{previewLines.length ? (
						<section className="mt-6 rounded-[22px] border border-slate-200/80 bg-[#f8faff] p-4 sm:p-5">
							<div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Export preview</div>
							<ul className="mt-3 space-y-2">
								{previewLines.map((line) => (
									<li key={line} className="flex items-start gap-2 text-sm leading-6 text-slate-600">
										<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0f51ff]" />
										<span>{line}</span>
									</li>
								))}
							</ul>
						</section>
					) : null}

					{error ? (
						<div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
							{error}
						</div>
					) : null}
				</div>

				<div className="shrink-0 border-t border-slate-200/80 bg-[#f8faff] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
					<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
						<button
							className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
							disabled={isExporting}
							onClick={onClose}
							type="button"
						>
							Cancel
						</button>
						<button
							className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f51ff] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(15,81,255,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0b44de] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
							disabled={isExporting || !selectedId}
							onClick={onExport}
							type="button"
						>
							<FiDownload className="h-4 w-4" />
							{isExporting ? 'Preparing export...' : 'Download export'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)

	return createPortal(modal, document.body)
}
