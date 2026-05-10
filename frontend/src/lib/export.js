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

export function downloadCsv(rows, filename) {
	const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	link.click()
	URL.revokeObjectURL(url)
}
