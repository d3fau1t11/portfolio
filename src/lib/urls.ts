export const basePath = import.meta.env.BASE_URL

export function siteUrl(path = ''): string {
  return basePath + path.replace(/^\/+/, '')
}

