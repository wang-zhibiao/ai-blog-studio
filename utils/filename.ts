import type { ArticleId, ContentFormat } from '../core/article'

export function generateFileName(
  title: string,
  category?: string,
  date?: string,
  format: ContentFormat = 'markdown'
): string {
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const ext = format === 'markdown' ? 'md' : 'html'
  const datePrefix = date ? new Date(date).toISOString().slice(0, 10) : ''
  return `${datePrefix ? datePrefix + '-' : ''}${slug}.${ext}`
}

export function parseFileName(fileName: string): {
  title: string
  date?: string
  ext: string
} {
  const parts = fileName.split('.')
  const ext = parts.pop() || 'md'
  const nameWithoutExt = parts.join('.')

  const dateMatch = nameWithoutExt.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/)
  if (dateMatch) {
    return {
      date: dateMatch[1],
      title: dateMatch[2].replace(/-/g, ' '),
      ext
    }
  }

  return {
    title: nameWithoutExt.replace(/-/g, ' '),
    ext
  }
}

export function generateArticleId(): ArticleId {
  return crypto.randomUUID() as ArticleId
}
