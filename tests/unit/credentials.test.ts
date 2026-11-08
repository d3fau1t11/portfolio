import { describe, expect, it } from 'vitest'
import { credentials } from '../../src/data/credentials'
import { projects } from '../../src/data/projects'
import { filterCredentials } from '../../src/lib/credentials'
import { certificateAssets } from '../../src/data/certificate-assets'

describe('credential discovery', () => {
  it('retains 21 unique documents and their distinct award types', () => {
    expect(credentials).toHaveLength(21)
    expect(new Set(credentials.map((item) => item.slug)).size).toBe(21)
    expect(credentials.find((item) => item.slug === 'iso-iec-27001-lead-auditor')?.awardType).toBe('Certificate of competency')
    expect(credentials.find((item) => item.slug === 'mpesa-api-integration')?.awardType).toBe('Course completion')
    expect(credentials.find((item) => item.slug === 'icann-public-meetings')?.awardType).toBe('Non-accredited course completion')
  })

  it('combines category, multiple search terms and featured state', () => {
    expect(filterCredentials(credentials, '  FORTINET operator ', 'network-infrastructure', true).map((item) => item.slug)).toEqual(['fortigate-operator'])
    expect(filterCredentials(credentials, 'udacity', 'software-data')).toHaveLength(3)
    expect(filterCredentials(credentials, 'udacity', 'software-data', true)).toHaveLength(0)
    expect(filterCredentials(credentials, '', 'all')).toHaveLength(21)
    expect(filterCredentials(credentials, '', 'all', true)).toHaveLength(4)
    expect(filterCredentials(credentials, 'summer camp', 'competitions', true).map((item) => item.slug)).toEqual(['insa-summer-camp'])
  })

  it('finds topics without changing the original metadata', () => {
    const before = JSON.stringify(credentials)
    expect(filterCredentials(credentials, 'internet governance', 'all').map((item) => item.slug)).toEqual(['icann-public-meetings'])
    expect(filterCredentials(credentials, 'no such issuer', 'all')).toHaveLength(0)
    expect(JSON.stringify(credentials)).toBe(before)
  })
})

describe('content boundaries', () => {
  it('connects every award to an approved display document and preview', () => {
    expect(Object.keys(certificateAssets).sort()).toEqual(credentials.map((item) => item.slug).sort())
    for (const credential of credentials) {
      const asset = certificateAssets[credential.slug]
      expect(asset.file).toBe(`certificates/${credential.slug}.pdf`)
      expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(asset.pages).toHaveLength(1)
      expect(asset.pages[0].file).toBe(`certificates/${credential.slug}.webp`)
      expect(asset.pages[0].sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(asset.pages[0].width).toBeGreaterThan(0)
      expect(asset.pages[0].height).toBeGreaterThan(0)
    }
    for (const slug of ['icca-ctf', 'insa-summer-camp', 'udacity-android']) {
      expect(certificateAssets[slug].pages[0].width).toBeGreaterThan(certificateAssets[slug].pages[0].height)
    }
  })
  it('omits date normalization where the source convention is unresolved', () => {
    expect(credentials.filter((item) => item.issuer === 'Fortinet Training Institute').every((item) => item.date === null)).toBe(true)
    expect(credentials.find((item) => item.slug === 'great-learning-cyber-security')?.date).toBe('June 2024')
    expect(credentials.find((item) => item.slug === 'opswat-icip')?.expires).toBe('15 June 2027')
    expect(credentials.find((item) => item.slug === 'iso-iec-27001-lead-auditor')?.expires).toBe('10 May 2028')
    expect(credentials.find((item) => item.slug === 'insa-summer-camp')?.date).toBe('October 2025 (G.C.)')
    expect(credentials.find((item) => item.slug === 'insa-summer-camp')?.awardType).toBe('Program participation')
  })

  it('contains no IDs, verification links, source paths or recipient names in credential data', () => {
    const allowed = new Set(['slug', 'title', 'issuer', 'category', 'awardType', 'date', 'expires', 'summary', 'topics', 'featured'])
    for (const item of credentials) {
      expect(Object.keys(item).every((key) => allowed.has(key))).toBe(true)
      expect(JSON.stringify(item)).not.toMatch(/https?:|Cers|certificateId|recipient|[a-f0-9]{8}-[a-f0-9]{4}-/i)
    }
  })

  it('keeps team results attributed to the team and omits disputed ranking', () => {
    const htb = credentials.find((item) => item.slug === 'htb-cyber-apocalypse')
    expect(htb?.summary).toContain('These are team results')
    const cybershield = credentials.filter((item) => item.slug.includes('cybershield'))
    expect(JSON.stringify(cybershield)).not.toMatch(/6th|7th|53 teams/i)
  })

  it('uses exactly the requested project order and source links', () => {
    expect(projects.map((item) => item.name)).toEqual([
      'Attendance App', 'WatchVault', 'GPA Calculator', 'Green Africa Farms', 'TrueImpact',
      'Remote Admin Tool', 'BookReview', 'Python Reverse TCP', 'Forge', 'Social Media Link Hub', 'Hary Pictures',
    ])
    expect(projects.map((item) => item.repository)).toEqual([
      'https://github.com/d3fau1t11/attendance-app',
      'https://github.com/d3fau1t11/watchvault',
      'https://github.com/d3fau1t11/Gpa-Calculator',
      'https://github.com/d3fau1t11/Green-Africa-Farms',
      'https://github.com/d3fau1t11/TrueImpact',
      'https://github.com/d3fau1t11/Remote-Admin-Tool',
      'https://github.com/d3fau1t11/IP-final-project-',
      'https://github.com/d3fau1t11/Python-Reverse-TCP',
      'https://github.com/d3fau1t11/Forge',
      'https://github.com/d3fau1t11/-Social-Media-Link-Hub',
      'https://github.com/d3fau1t11/Hary-Pictures',
    ])
    expect(projects.filter((item) => item.demo).map((item) => item.demo)).toEqual([
      'https://watchvaults.netlify.app/',
      'https://green-farms.netlify.app/',
      'https://trueimpact1.netlify.app/',
      'https://ip-final-project.vercel.app/',
      'https://mezmuredawit.netlify.app/',
      'https://harypictures.netlify.app/',
    ])
    expect(projects.find((item) => item.slug === 'green-africa-farms')?.repositoryVisibility).toBe('public')
  })
})

