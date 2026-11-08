import reviewedAssets from './certificate-assets.json' with { type: 'json' }

export interface CertificateAsset {
  file: string
  sha256: string
  pages: { file: string; sha256: string; width: number; height: number }[]
}

// Display copies checked against the local documents. This manifest contains
// only public asset paths, dimensions and hashes, without source identifiers.
export const certificateAssets: Readonly<Record<string, CertificateAsset>> = reviewedAssets
