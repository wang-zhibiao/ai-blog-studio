export type FileSystemErrorCode =
  | 'TOKEN_EXPIRED'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'UNKNOWN_ERROR'
  | 'NOT_SUPPORTED'
  | 'DIRECTORY_NOT_FOUND'

export class FileSystemError extends Error {
  public readonly code: FileSystemErrorCode
  public readonly status?: number
  public readonly originalError?: unknown

  constructor(
    message: string,
    code: FileSystemErrorCode,
    status?: number,
    originalError?: unknown
  ) {
    super(message)
    this.name = 'FileSystemError'
    this.code = code
    this.status = status
    this.originalError = originalError
  }

  isAuthError(): boolean {
    return this.code === 'TOKEN_EXPIRED' || this.code === 'PERMISSION_DENIED'
  }

  isNotFound(): boolean {
    return this.code === 'NOT_FOUND' || this.code === 'DIRECTORY_NOT_FOUND'
  }
}
