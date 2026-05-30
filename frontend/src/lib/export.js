function escapeCsvCell(value) {
	return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export function rowsToCsv(rows) {
	return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
}

export function buildDatedFilename(prefix, extension) {
	const stamp = new Date().toISOString().slice(0, 10)
	return `${prefix}-${stamp}.${extension}`
}

export function downloadText(content, filename, mimeType = 'text/plain;charset=utf-8;') {
	const blob = new Blob([content], { type: mimeType })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	link.click()
	URL.revokeObjectURL(url)
}

export function downloadCsv(rows, filename) {
	const content = typeof rows === 'string' ? rows : rowsToCsv(rows)
	downloadText(content, filename, 'text/csv;charset=utf-8;')
}

export function downloadJson(data, filename) {
	downloadText(JSON.stringify(data, null, 2), filename, 'application/json;charset=utf-8;')
}

function collectStyleText() {
	return Array.from(document.styleSheets)
		.flatMap((sheet) => {
			try {
				return Array.from(sheet.cssRules || []).map((rule) => rule.cssText)
			} catch {
				return []
			}
		})
		.join('\n')
}

function escapeCdata(value) {
	return String(value || '').replaceAll(']]>', ']]]]><![CDATA[>')
}

export function exportElementAsSvg(element, filename) {
	if (!element) {
		throw new Error('Nothing is available to export right now.')
	}

	const { width, height } = element.getBoundingClientRect()
	const clonedNode = element.cloneNode(true)
	const serializedNode = new XMLSerializer().serializeToString(clonedNode)
	const styleText = collectStyleText()
	const svgMarkup = `
		<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(width)}" height="${Math.ceil(height)}">
			<foreignObject width="100%" height="100%">
				<div xmlns="http://www.w3.org/1999/xhtml">
					<style><![CDATA[${escapeCdata(styleText)}]]></style>
					${serializedNode}
				</div>
			</foreignObject>
		</svg>
	`
	const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	link.click()
	URL.revokeObjectURL(url)
}
