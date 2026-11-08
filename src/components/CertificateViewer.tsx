import { useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { ArrowUpRight, Download, Eye, X, ZoomIn, ZoomOut } from 'lucide-react'
import type { CertificateAsset } from '../data/certificate-assets'
import type { Credential } from '../data/credentials'
import { siteUrl } from '../lib/urls'

export function CertificateViewer({ credential, asset }: { credential: Credential; asset: CertificateAsset }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [viewing, setViewing] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const documentUrl = siteUrl(asset.file)
  const titleId = `${credential.slug}-certificate-title`

  function openPreview(event: MouseEvent<HTMLAnchorElement>) {
    const viewer = dialog.current
    if (!viewer || typeof viewer.showModal !== 'function' || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setViewing(true)
    viewer.showModal()
  }

  function closePreview() {
    setViewing(false)
    setZoomed(false)
    setPreviewError(false)
  }

  function keepFocusInPreview(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return
    const first = event.currentTarget.querySelector<HTMLButtonElement>('.certificate-close')
    const last = event.currentTarget.querySelector<HTMLDivElement>('.certificate-preview-pages')
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <>
      <a className="text-link certificate-view-link" href={documentUrl} target="_blank" rel="noopener noreferrer" aria-label={`View certificate for ${credential.title}`} aria-haspopup="dialog" onClick={openPreview}>
        <Eye size={16} aria-hidden="true" />View certificate<ArrowUpRight size={16} aria-hidden="true" />
      </a>
      <dialog className="certificate-viewer" ref={dialog} aria-labelledby={titleId} onClose={closePreview} onKeyDown={keepFocusInPreview} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close() }}>
        <header className="certificate-viewer-header">
          <div><p className="certificate-preview-kicker">CERTIFICATE PREVIEW</p><h2 id={titleId}>{credential.title}</h2><p className="certificate-preview-issuer">{credential.issuer}</p></div>
          <button className="certificate-close" type="button" aria-label="Close certificate preview" onClick={() => dialog.current?.close()}><X size={22} aria-hidden="true" /></button>
        </header>
        <div className="certificate-viewer-toolbar">
          <button className="button button-secondary" type="button" disabled={previewError} aria-pressed={zoomed} onClick={() => setZoomed(!zoomed)}>{zoomed ? <ZoomOut size={17} aria-hidden="true" /> : <ZoomIn size={17} aria-hidden="true" />}{zoomed ? 'Fit to screen' : 'Zoom in'}</button>
          <a className="button button-secondary" href={documentUrl} target="_blank" rel="noopener noreferrer">Open PDF<ArrowUpRight size={17} aria-hidden="true" /></a>
          <a className="button button-primary" href={documentUrl} download={`${credential.slug}.pdf`}>Download PDF<Download size={17} aria-hidden="true" /></a>
        </div>
        <p className="certificate-copy-note">Display copy. Certificate IDs and verification codes are hidden.</p>
        {viewing && <div className={`certificate-preview-pages${zoomed ? ' is-zoomed' : ''}`} role="region" aria-label="Certificate image" tabIndex={0}>
          {previewError ? <p className="certificate-preview-error" role="status">The image preview could not load. Use Open PDF to view the certificate.</p> : asset.pages.map((page, index) => <img key={page.file} src={siteUrl(page.file)} width={page.width} height={page.height} alt={`${credential.title} certificate${asset.pages.length > 1 ? `, page ${index + 1}` : ''}`} onError={() => setPreviewError(true)} />)}
        </div>}
      </dialog>
    </>
  )
}
