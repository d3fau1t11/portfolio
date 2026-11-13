import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { labs, labStats } from '../../src/data/labs'
import type { LabContent } from '../../src/data/labs'
import { labAssets } from '../../src/data/lab-assets'
import { loadLabContent } from '../../src/lib/lab-content'
import { filterLabs, getLab, labEvidenceIds } from '../../src/lib/labs'
import { applyLabTemplate } from '../../src/lib/lab-template'
import { LabPage } from '../../src/pages/LabPage'

function content(slug: string): LabContent {
  return JSON.parse(readFileSync(resolve('src/content/labs', slug + '.json'), 'utf8')) as LabContent
}

describe('reviewed practical lab collection', () => {
  it('keeps nine server and virtualization walkthroughs and 97 steps available', async () => {
    expect(labStats).toEqual({ steps: 97, screenshots: 69 })
    expect(labs.every((lab) => ['Windows Server', 'Virtualization'].includes(lab.category) && !Object.hasOwn(lab, 'module'))).toBe(true)
    expect(new Set(labs.map((lab) => lab.slug)).size).toBe(9)
    expect(readdirSync(resolve('src/content/labs')).sort()).toEqual(labs.map((lab) => lab.slug + '.json').sort())
    const details = await Promise.all(labs.map((lab) => loadLabContent(lab.slug)))
    expect(details.reduce((count, detail) => count + detail.steps.length, 0)).toBe(97)
    for (const [index, detail] of details.entries()) {
      const lab = labs[index]
      expect(detail.steps).toHaveLength(lab.stepCount)
      expect(labEvidenceIds(detail)).toHaveLength(lab.evidenceCount)
      expect(detail.checks.every((check) => ['captured', 'documented'].includes(check.basis))).toBe(true)
    }
    expect(getLab('unknown-lab')).toBeUndefined()
    expect(getLab('dhcp-vlan-integration')).toBeUndefined()
    expect(getLab('cisco-dhcp-relay')).toBeUndefined()
    await expect(loadLabContent('../private-index')).rejects.toThrow('Unknown lab')
  })

  it('searches the retained topics and normalizes text', () => {
    const before = JSON.stringify(labs)
    expect(filterLabs(labs, '')).toHaveLength(9)
    expect(filterLabs(labs, '  DHCP  WDS ').map((lab) => lab.slug)).toEqual(['windows-dhcp-wds'])
    expect(filterLabs(labs, 'ＥＳＸＩ').map((lab) => lab.slug)).toEqual(['nested-esxi-virtualization'])
    expect(filterLabs(labs, 'vpn').map((lab) => lab.slug)).toEqual(['rras-vpn-nat'])
    expect(filterLabs(labs, 'ospf')).toHaveLength(0)
    expect(JSON.stringify(labs)).toBe(before)
  })

  it('uses only the reviewed screenshot copies and descriptions', () => {
    const referenced = new Set(labs.flatMap((lab) => labEvidenceIds(content(lab.slug))))
    expect([...referenced].sort()).toEqual(Object.keys(labAssets).sort())
    expect(referenced.size).toBe(69)
    for (const [id, asset] of Object.entries(labAssets)) {
      expect(asset.file).toBe('labs/screenshots/' + id + '.webp')
      const bytes = readFileSync(resolve('public', asset.file))
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256)
      expect(bytes.subarray(0, 4).toString()).toBe('RIFF')
      expect(bytes.subarray(8, 12).toString()).toBe('WEBP')
      expect(asset.alt.length).toBeGreaterThan(10)
      expect(asset.caption.length).toBeGreaterThan(10)
    }
    expect(readdirSync(resolve('public/labs'))).toEqual(['screenshots'])
    const publicLabFiles = readdirSync(resolve('public/labs/screenshots'))
    expect(publicLabFiles).toHaveLength(69)
    expect(publicLabFiles.every((file) => file.endsWith('.webp'))).toBe(true)
  })

  it('preserves the limits of the supplied evidence', () => {
    expect(content('windows-storage-raid').steps[1].description).toContain('GPT selected')
    expect(labAssets['storage-initialize'].caption).toContain('GPT')
    expect(content('windows-dhcp-wds').scope).toContain('additional exclusion')
    expect(content('rras-vpn-nat').scope).toContain('PPTP')
    expect(content('nested-esxi-virtualization').scope).toContain('not a completed OS installation')
    expect(content('windows-network-load-balancing').scope).toContain('does not document a controlled failure')
    const publicText = JSON.stringify([labs, labAssets, ...labs.map((lab) => content(lab.slug))])
    expect(publicText).not.toMatch(/\bIBT\b|\bmodules?\s+[23]\b|Packet Tracer|Cisco IOS|module-[23]/i)
    expect(publicText).not.toMatch(/(?:[A-Z]:[\\/]Users|Telegram Desktop|ibt-review|private-index|\.docx|\.pka|\.pkt|-----BEGIN .*PRIVATE KEY-----)/i)
    expect(publicText).not.toMatch(/(?:enable secret|crypto isakmp key)\s+\S+/i)
  })

  it('renders every step and screenshot without JavaScript', () => {
    for (const lab of labs) {
      const html = renderToStaticMarkup(createElement(LabPage, { lab, content: content(lab.slug) }))
      expect((html.match(/<h1\b/g) ?? []).length).toBe(1)
      expect((html.match(/class="lab-step"/g) ?? []).length).toBe(lab.stepCount)
      expect((html.match(/data-evidence=/g) ?? []).length).toBe(lab.evidenceCount)
      expect(html).toContain('id="step-' + String(lab.stepCount).padStart(2, '0') + '"')
      expect(html).not.toMatch(/href="(?:file:|javascript:)|__LAB_/)
      expect(html).not.toMatch(/\bIBT\b|\bmodules?\s+[23]\b|module-[23]/i)
    }
  })

  it('escapes walkthrough metadata and text at the rendering boundary', () => {
    const lab = { ...labs[0], title: 'A "title" & <script>test</script>', summary: 'Quotes " and <markup>.' }
    const html = applyLabTemplate('<title>__LAB_TITLE__</title><meta content="__LAB_DESCRIPTION__"><link href="__LAB_URL__">', lab)
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&quot;')
    expect(html).not.toMatch(/<script>|__LAB_/)
    const detail = content(lab.slug)
    detail.steps[0].description = '<script>alert("test")</script>'
    const rendered = renderToStaticMarkup(createElement(LabPage, { lab, content: detail }))
    expect(rendered).toContain('&lt;script&gt;')
    expect(rendered).not.toContain('<script>')
  })
})
