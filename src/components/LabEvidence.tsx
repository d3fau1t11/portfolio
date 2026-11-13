import { ArrowUpRight, Image as ImageIcon } from 'lucide-react'
import { labAssets } from '../data/lab-assets'
import { siteUrl } from '../lib/urls'

export function LabEvidence({ id }: { id: string }) {
  const asset = labAssets[id]
  if (!asset) throw new Error('Missing reviewed lab screenshot: ' + id)
  return (
    <figure className="lab-evidence" data-evidence={id}>
      <a className="lab-evidence-image" href={siteUrl(asset.file)} target="_blank" rel="noopener noreferrer" aria-label={'Open full-size screenshot: ' + asset.alt}>
        <img src={siteUrl(asset.file)} alt={asset.alt} width={asset.width} height={asset.height} loading="lazy" decoding="async" style={{ maxWidth: asset.width }} />
      </a>
      <figcaption><span><ImageIcon size={14} aria-hidden="true" />LAB SCREENSHOT</span><p>{asset.caption}</p><a href={siteUrl(asset.file)} target="_blank" rel="noopener noreferrer" aria-label={'View full-size: ' + asset.alt}>View full-size<ArrowUpRight size={14} aria-hidden="true" /></a></figcaption>
    </figure>
  )
}
