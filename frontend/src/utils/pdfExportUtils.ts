/**
 * Utility for Printing and Document Exporting
 * Provides responsive A4 document preview, print triggers, and downloadable files
 * specially designed for users on laptops/desktops without physical printers connected.
 */

import html2pdf from 'html2pdf.js';

export interface ExportDocumentOptions {
  title: string;
  filename?: string;
  contentHtml: string;
  orientation?: 'portrait' | 'landscape';
}

export interface PdfExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  imageQuality?: number;
  scale?: number;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}


/**
 * Injects a floating action toolbar into an HTML document for print/download options.
 * The toolbar is hidden during actual printing via @media print.
 */
export const injectPrintToolbar = (html: string, docTitle: string, filename = 'chung_tu_htx.html'): string => {
  const toolbarHtml = `
  <div id="htx-print-toolbar" class="no-print" style="
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    background: #0f172a;
    color: #f8fafc;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 99999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
  ">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-weight: 700; color: #10b981;">HỆ THỐNG QUẢN TRỊ HTX-OCOP</span>
      <span style="color: #64748b;">|</span>
      <span style="color: #cbd5e1;">${docTitle}</span>
    </div>
    
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="color: #94a3b8; font-size: 11px; margin-right: 8px;">
        💡 <em>Dùng Laptop: Tại mục Máy in, chọn <strong>"Lưu dưới dạng PDF" (Save as PDF)</strong> để tải file PDF về máy.</em>
      </div>
      <button onclick="window.print()" style="
        background: #059669;
        color: white;
        border: none;
        padding: 6px 14px;
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      ">
        🖨️ In / Lưu PDF
      </button>
      <button onclick="downloadPdfFile()" style="
        background: #047857;
        color: white;
        border: none;
        padding: 6px 14px;
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      ">
        📥 Tải File PDF (.pdf)
      </button>
      <button onclick="window.close()" style="
        background: transparent;
        color: #94a3b8;
        border: none;
        padding: 6px 10px;
        cursor: pointer;
      ">
        ✕ Đóng
      </button>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script>
    function downloadPdfFile() {
      const targetEl = document.querySelector('.print-page-wrapper') || document.body;
      const opt = {
        margin: [10, 15, 10, 15],
        filename: '${filename.replace(/\.html$/i, '')}.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      if (window.html2pdf) {
        window.html2pdf().set(opt).from(targetEl).save();
      } else {
        window.print();
      }
    }
  </script>
  `;

  const printStyles = `
  <style>
    @media print {
      .no-print, #htx-print-toolbar {
        display: none !important;
      }
      body {
        margin: 0 !important;
        padding: 10mm !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
    }
    body {
      background: #f1f5f9;
    }
    .print-page-wrapper {
      max-width: 820px;
      margin: 20px auto;
      background: #ffffff;
      padding: 30px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-radius: 8px;
    }
    @media print {
      .print-page-wrapper {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
    }
  </style>
  `;

  // Insert styles inside <head> and toolbar right after <body>
  let updatedHtml = html;
  if (updatedHtml.includes('</head>')) {
    updatedHtml = updatedHtml.replace('</head>', `${printStyles}</head>`);
  } else {
    updatedHtml = `${printStyles}${updatedHtml}`;
  }

  if (updatedHtml.includes('<body')) {
    updatedHtml = updatedHtml.replace(/(<body[^>]*>)/i, `$1${toolbarHtml}`);
  } else {
    updatedHtml = `${toolbarHtml}${updatedHtml}`;
  }

  return updatedHtml;
};

/**
 * Direct file download helper for HTML/PDF representations
 */
export const downloadDocumentHtml = (html: string, filename: string) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Safely opens a print/export preview window with the interactive toolbar.
 * Supports either an ExportDocumentOptions object or (html, title, filename) arguments.
 */
export const openInteractivePrintWindow = (
  htmlOrOptions: string | ExportDocumentOptions,
  title?: string,
  filename?: string
) => {
  let contentHtml = '';
  let finalTitle = '';
  let finalFilename = '';

  if (typeof htmlOrOptions === 'object') {
    contentHtml = htmlOrOptions.contentHtml;
    finalTitle = htmlOrOptions.title;
    finalFilename = htmlOrOptions.filename || `${finalTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.html`;
  } else {
    contentHtml = htmlOrOptions;
    finalTitle = title || 'Tài liệu HTX';
    finalFilename = filename || `${finalTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.html`;
  }

  const enrichedHtml = injectPrintToolbar(contentHtml, finalTitle, finalFilename);

  const printWin = window.open('', '_blank', 'width=920,height=1000,noopener=yes');
  if (printWin) {
    try {
      printWin.opener = null;
    } catch {
      // Ignore cross-origin error
    }
    printWin.document.open();
    printWin.document.write(enrichedHtml);
    printWin.document.close();
    printWin.focus();
  } else {
    // If popups are blocked, download the file directly so the user never loses it
    downloadDocumentHtml(enrichedHtml, finalFilename);
  }
};

/**
  * Directly exports an HTML DOM element to a standard A4 PDF file using client-side rendering.
  * Essential for users on laptops/desktops without physical printers connected.
  */
export const exportPdfFromElement = async (
  elementOrId: HTMLElement | string,
  filename = 'tai_lieu_ocop.pdf',
  options?: Partial<PdfExportOptions>
): Promise<void> => {
  const element = typeof elementOrId === 'string'
    ? document.getElementById(elementOrId)
    : elementOrId;

  if (!element) {
    throw new Error(`Element not found: ${elementOrId}`);
  }

  // Margin according to administrative document standards (Top 10mm, Left 12mm, Bottom 10mm, Right 12mm)
  const margin: [number, number, number, number] = options?.margin
    ? (Array.isArray(options.margin) ? options.margin : [options.margin, options.margin, options.margin, options.margin])
    : [10, 12, 10, 12];

  const opt = {
    margin: margin,
    filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: options?.imageQuality ?? 0.98 },
    html2canvas: {
      scale: options?.scale ?? 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
      scrollX: 0,
      onclone: (clonedDoc: Document) => {
        // Ensure all overflow containers in the clone are visible and non-clipping
        clonedDoc.querySelectorAll('.overflow-x-auto, .overflow-y-auto, [class*="overflow-"]').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.overflow = 'visible';
          htmlEl.style.maxWidth = 'none';
          htmlEl.style.width = '100%';
        });

        // Remove outer modal screen paddings from the print container so jsPDF margins do the job cleanly
        const container = clonedDoc.querySelector('[data-pdf-container="true"]') as HTMLElement;
        if (container) {
          container.style.padding = '0px';
          container.style.margin = '0px';
          container.style.maxWidth = 'none';
          container.style.boxShadow = 'none';
          container.style.width = '100%';
        }
      },
    },
    jsPDF: {
      unit: 'mm',
      format: options?.format ?? 'a4',
      orientation: options?.orientation ?? 'portrait',
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.html2pdf__page-break',
      avoid: ['tr', 'thead', '.avoid-break', '.print\\:break-inside-avoid'],
    },
  };

  await html2pdf().from(element).set(opt).save();
};


