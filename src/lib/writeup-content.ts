import { getWriteup } from './writeups'

const sources = import.meta.glob<string>('../content/writeups/*.md', { query: '?raw', import: 'default' })

export async function loadWriteupContent(slug: string): Promise<string> {
  if (!getWriteup(slug)) throw new Error('Unknown write-up')
  const load = sources['../content/writeups/' + slug + '.md']
  if (!load) throw new Error('Missing write-up content: ' + slug)
  return load()
}
