import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const PDF_PAGE_WIDTH = 210
const PDF_PAGE_HEIGHT = 297
const PDF_MARGIN_X = 16
const PDF_TOP = 16
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN_X * 2
const SHIFT_SYNC_BLUE = [37, 99, 235]
const SHIFT_SYNC_DARK = [15, 23, 42]
const SHIFT_SYNC_MID = [96, 113, 145]
const SHIFT_SYNC_LIGHT = [241, 245, 255]
const SHIFT_SYNC_BORDER = [216, 225, 244]

const SVG_LOGO = `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="96" viewBox="0 0 320 96">
  <rect width="320" height="96" rx="18" fill="white"/>
  <rect x="8" y="8" width="80" height="80" rx="18" fill="#2563eb"/>
  <path d="M48 24v48M24 48h48" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/>
  <text x="102" y="52" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#0f172a">ShiftSync</text>
  <text x="102" y="74" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#64748b">Workforce management</text>
</svg>`

const svgToDataUrl = (svg) => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`

const DEFAULT_LOGO_DATA_URL = svgToDataUrl(SVG_LOGO)

const clone = (value) => JSON.parse(JSON.stringify(value ?? null))

export const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const toDate = (value) => {
  if (!value) return null
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const pad = (value) => String(value).padStart(2, '0')

export const formatExportDate = (value) => {
  const date = toDate(value)
  if (!date) return '—'
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

export const formatExportDayMonth = (value) => {
  const date = toDate(value)
  if (!date) return '—'
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}`
}

export const formatExportTimestamp = (value) => {
  const date = toDate(value)
  if (!date) return '—'
  return `${formatExportDate(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const slugify = (value) =>
  String(value ?? 'export')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

const stripKnownExtension = (value) => String(value ?? '').replace(/\.[a-z0-9]+$/i, '')

const normalizeColumn = (column) => {
  if (typeof column === 'string') {
    return { label: column, key: column, nowrap: false, align: 'left' }
  }

  return {
    label: column?.label ?? column?.title ?? column?.key ?? '',
    key: column?.key ?? column?.field ?? column?.label ?? '',
    nowrap: Boolean(column?.nowrap),
    align: column?.align ?? 'left',
  }
}

const normalizeRow = (row, columns) => {
  if (Array.isArray(row)) return row
  if (row && Array.isArray(row.cells)) return row.cells
  if (row && Array.isArray(row.values)) return row.values
  if (row && typeof row === 'object') {
    return columns.map((column) => {
      if (Object.prototype.hasOwnProperty.call(row, column.key)) return row[column.key]
      if (Object.prototype.hasOwnProperty.call(row, column.label)) return row[column.label]
      return row[column.label?.toLowerCase?.()] ?? row[column.key?.toLowerCase?.()] ?? ''
    })
  }
  return columns.map(() => row ?? '')
}

const resolveSectionRows = (section) => {
  const columns = (section.columns || []).map(normalizeColumn)
  const rows = (section.rows || []).map((row) => normalizeRow(row, columns))
  return { columns, rows }
}

const drawLogo = (doc, logoUrl, x, y, width, height) => {
  const imageCandidate = typeof logoUrl === 'string' ? logoUrl : ''
  if (/^data:image\/(png|jpeg|jpg);base64,/i.test(imageCandidate)) {
    try {
      doc.addImage(imageCandidate, 'PNG', x, y, width, height)
      return true
    } catch {
      try {
        doc.addImage(imageCandidate, 'JPEG', x, y, width, height)
        return true
      } catch {
        // fall through to vector badge
      }
    }
  }

  const badgeSize = 17
  doc.setFillColor(...SHIFT_SYNC_BLUE)
  doc.roundedRect(x, y + 1, badgeSize, badgeSize, 4, 4, 'F')
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(1.8)
  doc.line(x + 4.5, y + 9.5, x + 12.5, y + 9.5)
  doc.line(x + 8.5, y + 5.5, x + 8.5, y + 13.5)
  doc.setTextColor(...SHIFT_SYNC_DARK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12.5)
  doc.text('ShiftSync', x + badgeSize + 6, y + 11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...SHIFT_SYNC_MID)
  doc.setFontSize(7.8)
  doc.text('Workforce management', x + badgeSize + 6, y + 17)
  return true
}

export const resolveShiftSyncLogoDataUrl = async () => DEFAULT_LOGO_DATA_URL

export const isValidDateInput = (value) => {
  const date = toDate(value)
  return Boolean(date)
}

export const buildDatedFilename = (base, dateRange) => {
  const safeBase = slugify(stripKnownExtension(base))
  const resolvedExt = 'pdf'
  if (!dateRange?.from) return `${safeBase}.${resolvedExt}`

  const fromKey = formatExportDayMonth(dateRange.from)
  const toKey = formatExportDayMonth(dateRange.to || dateRange.from)
  if (!dateRange?.to || fromKey === toKey) {
    return `${safeBase}-${fromKey}.${resolvedExt}`
  }

  return `${safeBase}-${fromKey}-to-${toKey}.${resolvedExt}`
}

export const buildBrandedReportDocument = (document = {}) => {
  const summaryCards = Array.isArray(document.summaryCards) ? document.summaryCards.map(clone) : []
  const metadataRows = Array.isArray(document.metadataRows) ? document.metadataRows.map(clone) : []
  const sections = Array.isArray(document.sections) ? document.sections.map(clone) : []

  return {
    logoUrl: document.logoUrl || DEFAULT_LOGO_DATA_URL,
    brandName: document.brandName || 'ShiftSync',
    brandSubtitle: document.brandSubtitle || 'Workforce Management Platform',
    reportTitle: document.reportTitle || document.title || 'Report',
    reportSubtitle:
      document.reportSubtitle ||
      'A structured export of live ShiftSync records for the selected reporting period.',
    generatedAt: document.generatedAt || new Date().toISOString(),
    periodLabel: document.periodLabel || '',
    timezoneLabel: document.timezoneLabel || 'Africa/Kigali',
    emailLabel: document.emailLabel || document.preparedByEmail || '',
    preparedBy: document.preparedBy || '',
    preparedByEmail: document.preparedByEmail || '',
    summaryCards,
    metadataRows,
    sections,
    footerLeft: document.footerLeft || '',
    footerRight: document.footerRight || '',
    footerNote: document.footerNote || 'Prepared from live ShiftSync data.',
  }
}

const addSectionTitle = (doc, section, y) => {
  doc.setTextColor(...SHIFT_SYNC_DARK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(section.title, PDF_MARGIN_X, y)

  if (section.description) {
    doc.setTextColor(...SHIFT_SYNC_MID)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    const lines = doc.splitTextToSize(section.description, PDF_CONTENT_WIDTH)
    doc.text(lines, PDF_MARGIN_X, y + 5)
    return y + 5 + lines.length * 4.2
  }

  return y + 5
}

const drawMetadataStrip = (doc, items, startY) => {
  if (!items.length) return startY
  const startX = PDF_MARGIN_X
  const lineY = startY + 4
  let x = startX

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.8)
  doc.setTextColor(...SHIFT_SYNC_DARK)

  items.forEach((item, index) => {
    const [label, value] = item
    const prefix = `${String(label ?? '').toUpperCase()}: `
    doc.setFont('helvetica', 'bold')
    doc.text(prefix, x, lineY)
    x += doc.getTextWidth(prefix) + 0.5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...SHIFT_SYNC_DARK)
    const valueText = String(value ?? '—')
    doc.text(valueText, x, lineY)
    x += doc.getTextWidth(valueText)

    if (index < items.length - 1) {
      const spacer = '    '
      doc.text(spacer, x, lineY)
      x += doc.getTextWidth(spacer)
    }
  })

  return startY + 10
}

const renderPreparedBy = (doc, preparedBy, startY) => {
  if (!preparedBy) return startY
  const label = 'Prepared by: '
  const name = String(preparedBy || 'ShiftSync')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...SHIFT_SYNC_DARK)
  doc.text(label, PDF_MARGIN_X, startY)
  const labelWidth = doc.getTextWidth(label)
  doc.setFont('helvetica', 'normal')
  doc.text(name, PDF_MARGIN_X + labelWidth, startY)
  const signatureY = startY + 10
  doc.setDrawColor(...SHIFT_SYNC_BORDER)
  doc.line(PDF_MARGIN_X, signatureY, PDF_MARGIN_X + 62, signatureY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...SHIFT_SYNC_MID)
  doc.text('Signature', PDF_MARGIN_X, signatureY + 4)
  return signatureY + 10
}

export const downloadBrandedReport = async (filenameBase, documentSpec) => {
  const document = buildBrandedReportDocument(documentSpec)
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const fileName = buildDatedFilename(filenameBase || document.reportTitle || 'export', null, 'pdf')

  let cursorY = PDF_TOP
  const logoPlaced = drawLogo(doc, document.logoUrl, PDF_MARGIN_X, cursorY, 34, 18)
  cursorY += logoPlaced ? 6 : 0

  doc.setTextColor(...SHIFT_SYNC_DARK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(String(document.brandName || 'ShiftSync'), pageWidth / 2, cursorY + 8, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...SHIFT_SYNC_BLUE)
  doc.text(String(document.reportTitle || 'Report'), pageWidth / 2, cursorY + 18, { align: 'center' })

  if (document.reportSubtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...SHIFT_SYNC_MID)
    const subtitleLines = doc.splitTextToSize(String(document.reportSubtitle), PDF_CONTENT_WIDTH - 20)
    doc.text(subtitleLines, pageWidth / 2, cursorY + 26, { align: 'center' })
    cursorY += 26 + subtitleLines.length * 4
  } else {
    cursorY += 30
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.8)
  doc.setTextColor(...SHIFT_SYNC_MID)
  doc.text(`Generated: ${formatExportTimestamp(document.generatedAt)}`, pageWidth / 2, cursorY + 5, {
    align: 'center',
  })
  cursorY += 12

  const metadataItems = []
  if (document.periodLabel) metadataItems.push(['Period', document.periodLabel])
  if (document.emailLabel) metadataItems.push(['Email', document.emailLabel])
  if (document.timezoneLabel) metadataItems.push(['Timezone', document.timezoneLabel])
  cursorY = drawMetadataStrip(doc, metadataItems, cursorY)

  if (document.metadataRows.length) {
    cursorY = drawMetadataStrip(doc, document.metadataRows, cursorY)
  }

  doc.setDrawColor(...SHIFT_SYNC_BLUE)
  doc.setLineWidth(0.8)
  doc.line(PDF_MARGIN_X, cursorY + 2, pageWidth - PDF_MARGIN_X, cursorY + 2)
  cursorY += 12

  document.sections.forEach((section) => {
    cursorY = addSectionTitle(doc, section, cursorY)
    const { columns, rows } = resolveSectionRows(section)
    if (!columns.length || !rows.length) {
      cursorY += 6
      return
    }

    const columnStyles = {}
    columns.forEach((column, index) => {
      columnStyles[index] = {
        cellWidth: column.nowrap ? 24 : 'auto',
        halign: column.nowrap ? 'center' : column.align || 'left',
      }
    })

    autoTable(doc, {
      startY: cursorY + 2,
      head: [columns.map((column) => column.label)],
      body: rows,
      tableWidth: 'auto',
      theme: 'grid',
      margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2.2,
        textColor: SHIFT_SYNC_DARK,
        lineColor: SHIFT_SYNC_BORDER,
        lineWidth: 0.18,
        overflow: 'linebreak',
        valign: 'middle',
      },
      headStyles: {
        fillColor: SHIFT_SYNC_BLUE,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 2.6,
      },
      bodyStyles: {
        textColor: SHIFT_SYNC_DARK,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 255],
      },
      showHead: 'everyPage',
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      columnStyles,
      didParseCell: (hookData) => {
        if (hookData.section === 'body') {
          const column = columns[hookData.column.index]
          if (column?.nowrap) {
            hookData.cell.styles.minCellHeight = 7.5
            hookData.cell.styles.cellWidth = 24
            hookData.cell.styles.halign = 'center'
          }
        }
      },
      didDrawPage: () => {
        const pageCount = doc.internal.getNumberOfPages()
        const page = doc.internal.getCurrentPageInfo().pageNumber
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...SHIFT_SYNC_MID)
        doc.text(`Page ${page} of ${pageCount}`, pageWidth - PDF_MARGIN_X, pageHeight - 8, {
          align: 'right',
        })
      },
    })

    cursorY = (doc.lastAutoTable?.finalY || cursorY) + 10
  })

  if (document.preparedBy) {
    cursorY = renderPreparedBy(doc, document.preparedBy, cursorY)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...SHIFT_SYNC_MID)
  if (document.footerLeft) {
    doc.text(String(document.footerLeft), PDF_MARGIN_X, pageHeight - 10)
  }
  if (document.footerRight) {
    doc.text(String(document.footerRight), pageWidth - PDF_MARGIN_X, pageHeight - 10, { align: 'right' })
  }
  if (document.footerNote) {
    doc.setFontSize(8)
    doc.text(String(document.footerNote), pageWidth / 2, pageHeight - 4, { align: 'center' })
  }

  doc.save(fileName)
  return fileName
}

export const requestExportDateRange = (title = 'Export report') =>
  new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null)
      return
    }

    const existing = document.getElementById('shiftsync-export-modal')
    if (existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.id = 'shiftsync-export-modal'
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:99999',
      'background:rgba(15,23,42,.48)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:24px',
    ].join(';')

    const modal = document.createElement('div')
    modal.style.cssText = [
      'width:min(100%,440px)',
      'background:#fff',
      'border-radius:20px',
      'box-shadow:0 30px 80px rgba(15,23,42,.25)',
      'padding:22px',
      'font-family:Arial,Helvetica,sans-serif',
      'color:#0f172a',
    ].join(';')

    modal.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div>
          <div style="font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#2563eb;margin-bottom:8px;">Export Range</div>
          <h3 style="margin:0;font-size:22px;line-height:1.15;">${escapeHtml(title)}</h3>
          <p style="margin:8px 0 0;color:#64748b;font-size:13px;line-height:1.5;">Select the start and end date for the report export.</p>
        </div>
        <button type="button" data-close style="border:none;background:#eff6ff;color:#2563eb;width:34px;height:34px;border-radius:999px;font-size:18px;cursor:pointer;">×</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px;">
        <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
          From
          <input type="date" data-from style="border:1px solid #dbe4ff;border-radius:14px;padding:12px 14px;font-size:14px;color:#0f172a;background:#f8fbff;">
        </label>
        <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
          To
          <input type="date" data-to style="border:1px solid #dbe4ff;border-radius:14px;padding:12px 14px;font-size:14px;color:#0f172a;background:#f8fbff;">
        </label>
      </div>
      <div data-error style="margin-top:12px;min-height:18px;font-size:12px;color:#dc2626;"></div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px;">
        <button type="button" data-cancel style="border:1px solid #dbe4ff;background:#fff;color:#334155;padding:11px 16px;border-radius:14px;font-weight:700;cursor:pointer;">Cancel</button>
        <button type="button" data-submit style="border:none;background:#2563eb;color:#fff;padding:11px 16px;border-radius:14px;font-weight:700;cursor:pointer;">Export</button>
      </div>
    `

    overlay.appendChild(modal)
    document.body.appendChild(overlay)

    const fromInput = modal.querySelector('[data-from]')
    const toInput = modal.querySelector('[data-to]')
    const errorNode = modal.querySelector('[data-error]')
    const closeButtons = [...modal.querySelectorAll('[data-close], [data-cancel]')]
    const submitButton = modal.querySelector('[data-submit]')

    const cleanup = () => {
      overlay.remove()
      document.removeEventListener('keydown', handleKeyDown)
    }

    const finalize = (value) => {
      cleanup()
      resolve(value)
    }

    const setError = (message) => {
      errorNode.textContent = message
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        finalize(null)
      }
      if (event.key === 'Enter') {
        submitButton?.click()
      }
    }

    closeButtons.forEach((button) => {
      button.addEventListener('click', () => finalize(null))
    })

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) finalize(null)
    })

    submitButton?.addEventListener('click', () => {
      const from = fromInput?.value
      const to = toInput?.value || from
      if (!isValidDateInput(from) || !isValidDateInput(to)) {
        setError('Please choose valid from and to dates.')
        return
      }

      const fromDate = toDate(from)
      const toDateValue = toDate(to)
      if (fromDate > toDateValue) {
        setError('The start date must be on or before the end date.')
        return
      }

      finalize({ from, to })
    })

    document.addEventListener('keydown', handleKeyDown)
    fromInput?.focus()
  })
